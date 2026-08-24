import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { Readability } from "npm:@mozilla/readability@0.5.0";
import { parseHTML } from "npm:linkedom@0.16.11";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StepError {
  step: string;
  message: string;
  detail?: string;
  httpStatus?: number;
  rawSnippet?: string;
}

function errorResponse(err: StepError, status = 500) {
  return new Response(
    JSON.stringify({ error: err.message, step: err.step, detail: err.detail, httpStatus: err.httpStatus, rawSnippet: err.rawSnippet }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function extractJsonFromContent(raw: string): { ok: true; data: unknown } | { ok: false; reason: string } {
  const trimmed = raw.trim();

  // Strategy 1: direct parse
  try {
    return { ok: true, data: JSON.parse(trimmed) };
  } catch { /* try next */ }

  // Strategy 2: extract content between ```json fences anywhere in the text
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return { ok: true, data: JSON.parse(fenceMatch[1].trim()) };
    } catch { /* try next */ }
  }

  // Strategy 3: extract outermost { ... } substring
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return { ok: true, data: JSON.parse(candidate) };
    } catch { /* try next */ }
  }

  // Strategy 4: extract outermost [ ... ] substring
  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.slice(firstBracket, lastBracket + 1);
    try {
      return { ok: true, data: JSON.parse(candidate) };
    } catch { /* try next */ }
  }

  return { ok: false, reason: "No valid JSON found in AI response" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return errorResponse({
        step: "server_config",
        message: "OpenRouter API key is not configured on the server.",
      }, 500);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { tenant_id, source_url, source_text, source_filename } = await req.json();

    // Step 1: URL validation
    if (!tenant_id) {
      return errorResponse({
        step: "url_validation",
        message: "Tenant ID is required.",
      }, 400);
    }

    if (!source_url && !source_text) {
      return errorResponse({
        step: "url_validation",
        message: "Either a website URL or document text is required.",
      }, 400);
    }

    if (source_url) {
      try {
        new URL(source_url);
      } catch {
        return errorResponse({
          step: "url_validation",
          message: `Invalid URL format: "${source_url}". Please provide a valid URL starting with http:// or https://.`,
          detail: source_url,
        }, 400);
      }
    }

    // Load prompt and model settings
    const { data: settingsRows } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", [
        "brand_analyzer_prompt",
        "ai_model_brand_analyzer",
        "ai_request_count_brand_analyzer",
        "ai_max_tokens_brand_analyzer_prompt",
        "ai_log_enabled_brand_analyzer_prompt",
      ]);

    const settingsMap: Record<string, string> = {};
    for (const row of settingsRows || []) {
      settingsMap[row.key] = row.value;
    }

    const systemPrompt =
      settingsMap["brand_analyzer_prompt"] || "Analyze this brand and return JSON.";
    const model =
      settingsMap["ai_model_brand_analyzer"] || "openai/gpt-oss-120b:free";
    const maxTokens = parseInt(settingsMap["ai_max_tokens_brand_analyzer_prompt"]) || 8000;
    const logEnabled = settingsMap["ai_log_enabled_brand_analyzer_prompt"] === "true";

    // Increment request counter (fire-and-forget)
    const currentCount =
      parseInt(settingsMap["ai_request_count_brand_analyzer"] || "0") + 1;
    supabase
      .from("admin_settings")
      .upsert(
        {
          key: "ai_request_count_brand_analyzer",
          value: String(currentCount),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      .then(() => {});

    // Step 2: Website fetch
    let contentToAnalyze = source_text || "";

    if (source_url && !source_text) {
      let pageResponse: Response;
      try {
        pageResponse = await fetch(source_url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          redirect: "follow",
        });
      } catch (fetchErr) {
        return errorResponse({
          step: "website_fetch",
          message: `Failed to connect to the website. The URL may be unreachable or blocked.`,
          detail: String(fetchErr),
        }, 400);
      }

      if (!pageResponse.ok) {
        return errorResponse({
          step: "http_response",
          message: `The website returned an error (HTTP ${pageResponse.status}).`,
          httpStatus: pageResponse.status,
          detail: pageResponse.statusText || undefined,
        }, 400);
      }

      const html = await pageResponse.text();
      const trimmed = html.length > 1_500_000 ? html.slice(0, 1_500_000) : html;

      // Step 3: HTML parsing
      let document: Document;
      try {
        const parsed = parseHTML(trimmed);
        document = parsed.document;
      } catch (parseErr) {
        return errorResponse({
          step: "html_parsing",
          message: "Failed to parse the HTML content of the page.",
          detail: String(parseErr),
        }, 500);
      }

      if (source_url) {
        try {
          const base = document.createElement("base");
          base.setAttribute("href", source_url);
          document.head.appendChild(base);
        } catch { /* ignore */ }
      }

      const removeSelectors = [
        "script", "style", "noscript", "iframe", "svg",
        "nav", "header", "footer", "aside",
        "[role='navigation']", "[role='banner']", "[role='contentinfo']",
      ];
      for (const sel of removeSelectors) {
        try {
          document.querySelectorAll(sel).forEach((el: any) => el.remove());
        } catch { /* linkedom may not support all selectors */ }
      }

      // Step 4: Content extraction
      try {
        const reader = new Readability(document);
        const readabilityResult = reader.parse();

        if (readabilityResult?.textContent) {
          contentToAnalyze = readabilityResult.textContent
            .replace(/\s+\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim()
            .slice(0, 30000);
        } else {
          contentToAnalyze = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 15000);
        }
      } catch (extractErr) {
        return errorResponse({
          step: "content_extraction",
          message: "Failed to extract readable content from the page.",
          detail: String(extractErr),
        }, 500);
      }
    }

    if (!contentToAnalyze || contentToAnalyze.length < 50) {
      return errorResponse({
        step: "content_extraction",
        message: "Insufficient content to analyze. The page may be empty, require JavaScript, or block automated access.",
        detail: `Only ${contentToAnalyze.length} characters of content were extracted (minimum 50 required).`,
      }, 400);
    }

    // Step 5: OpenRouter API request
    let aiResponse: Response;
    try {
      aiResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": SUPABASE_URL,
            "X-Title": "AstroGTM Brand Analyzer",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Analyze the following website/document content and extract brand intelligence:\n\n${contentToAnalyze}`,
              },
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
            response_format: { type: "json_object" },
          }),
        }
      );
    } catch (apiErr) {
      return errorResponse({
        step: "openrouter_request",
        message: "Failed to reach the AI service (OpenRouter).",
        detail: String(apiErr),
      }, 502);
    }

    if (aiResponse.status === 429) {
      const retryAfter = aiResponse.headers.get("retry-after") || "30";
      return errorResponse({
        step: "openrouter_request",
        message: `Rate limited by AI service. Please retry after ${retryAfter}s.`,
        httpStatus: 429,
      }, 429);
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text().catch(() => "");
      return errorResponse({
        step: "openrouter_request",
        message: `AI service returned an error (HTTP ${aiResponse.status}).`,
        httpStatus: aiResponse.status,
        detail: errText.slice(0, 500) || undefined,
      }, 502);
    }

    const aiData = await aiResponse.json();
    const rawContent: string = aiData.choices?.[0]?.message?.content || "";
    const finishReason: string | null = aiData.choices?.[0]?.finish_reason || null;
    const inputTokens: number = aiData.usage?.prompt_tokens || 0;
    const outputTokens: number = aiData.usage?.completion_tokens || 0;

    if (!rawContent) {
      return errorResponse({
        step: "ai_response_parsing",
        message: "AI returned an empty response. The model may have failed to generate output.",
        detail: JSON.stringify(aiData).slice(0, 500),
      }, 502);
    }

    // Check for truncation
    if (finishReason === "length") {
      if (logEnabled) {
        supabase.from("ai_prompt_logs").insert({
          prompt_key: "brand_analyzer_prompt",
          model,
          input_content: contentToAnalyze.slice(0, 10000),
          output_content: rawContent.slice(0, 10000),
          finish_reason: finishReason,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          elapsed_ms: 0,
        }).then(() => {});
      }
      return errorResponse({
        step: "ai_response_truncated",
        message: "AI response was truncated due to token limit. The model ran out of output tokens before completing the JSON. Try increasing max_tokens in AI Prompts settings.",
        detail: `finish_reason: length, output_tokens: ${outputTokens}, max_tokens: ${maxTokens}`,
        rawSnippet: rawContent.slice(0, 1000),
      }, 502);
    }

    // Step 6: AI response parsing - robust JSON extraction
    const extractionResult = extractJsonFromContent(rawContent);
    if (!extractionResult.ok) {
      if (logEnabled) {
        supabase.from("ai_prompt_logs").insert({
          prompt_key: "brand_analyzer_prompt",
          model,
          input_content: contentToAnalyze.slice(0, 10000),
          output_content: rawContent.slice(0, 10000),
          finish_reason: finishReason,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          elapsed_ms: 0,
        }).then(() => {});
      }
      return errorResponse({
        step: "ai_response_parsing",
        message: "Failed to parse AI response as JSON. The model may have returned conversational text instead of structured data.",
        detail: extractionResult.reason,
        rawSnippet: rawContent.slice(0, 1000),
      }, 502);
    }

    const parsed = extractionResult.data as Record<string, unknown>;

    // Step 7: Database save -- new flat schema
    const { data: saved, error: saveError } = await supabase
      .from("gifaa_brand_intelligence")
      .insert({
        tenant_id,
        source_url: source_url || null,
        source_filename: source_filename || null,
        brand_intelligence_score: 0,
        about_brand: (parsed.about_brand as string) || "",
        primary_business_segment: (parsed.primary_business_segment as string) || "",
        primary_geography: (parsed.primary_geography as string) || "",
        target_audience: (parsed.target_audience as string) || "",
        primary_search_keyword: (parsed.primary_search_keyword as string) || "",
        secondary_search_keywords: parsed.secondary_search_keywords || [],
        long_tail_keyword_examples: parsed.long_tail_keyword_examples || [],
        content_opportunities: parsed.content_opportunities || [],
        raw_ai_response: parsed,
      })
      .select()
      .single();

    if (saveError) {
      return errorResponse({
        step: "database_save",
        message: "Failed to save brand intelligence results to the database.",
        detail: saveError.message,
      }, 500);
    }

    // Log successful request if enabled
    if (logEnabled) {
      supabase.from("ai_prompt_logs").insert({
        prompt_key: "brand_analyzer_prompt",
        model,
        input_content: contentToAnalyze.slice(0, 10000),
        output_content: rawContent.slice(0, 10000),
        finish_reason: finishReason,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        elapsed_ms: 0,
      }).then(() => {});
    }

    return new Response(JSON.stringify({ success: true, data: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse({
      step: "unexpected",
      message: "An unexpected error occurred during brand analysis.",
      detail: String(err),
    }, 500);
  }
});
