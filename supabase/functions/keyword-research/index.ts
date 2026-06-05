import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface SerpResult {
  rank: number;
  title: string;
  url: string;
  description: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const body = await req.json();
    const {
      action,
      tenant_id,
      primary_search_term,
      country_code,
      location_uule,
      tenant_domain,
      brand_intelligence,
      serp_results,
      scraped_content,
      num_themes,
      num_keywords,
      num_pages,
      additional_instructions,
      urls,
    } = body;

    if (!tenant_id) {
      return jsonResponse({ error: "tenant_id is required" }, 400);
    }

    // ─── ACTION: search ─────────────────────────────────────────
    if (action === "search") {
      if (!APIFY_TOKEN) {
        return jsonResponse({ error: "APIFY_TOKEN not configured" }, 500);
      }
      if (!primary_search_term) {
        return jsonResponse({ error: "primary_search_term is required" }, 400);
      }

      const apifyPayload = {
        chatGptSearch: { enableChatGpt: false },
        copilotSearch: { enableCopilot: false },
        countryCode: country_code || "us",
        disableGoogleSearchResults: false,
        focusOnPaidAds: false,
        forceExactMatch: false,
        geminiSearch: { enableGemini: false },
        includeIcons: false,
        includeUnfilteredResults: false,
        locationUule: location_uule || "",
        maxPagesPerQuery: 3,
        maximumLeadsEnrichmentRecords: 0,
        mobileResults: false,
        perplexitySearch: {
          enablePerplexity: false,
          returnImages: false,
          returnRelatedQuestions: false,
        },
        queries: primary_search_term,
        saveHtml: false,
        saveHtmlToKeyValueStore: false,
        searchLanguage: "en",
        verifyLeadsEnrichmentEmails: false,
      };

      const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/nFJndFXA5zjCTuudP/run-sync-get-dataset-items?clean=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${APIFY_TOKEN}`,
          },
          body: JSON.stringify(apifyPayload),
        }
      );

      if (!apifyRes.ok) {
        const errText = await apifyRes.text();
        return jsonResponse(
          { error: `Apify request failed (${apifyRes.status})`, details: errText },
          502
        );
      }

      const apifyData = await apifyRes.json();

      const organicResults: SerpResult[] = [];
      for (const item of apifyData) {
        const results = item?.organicResults || item?.organic_results || [];
        for (const r of results) {
          organicResults.push({
            rank: r.position || r.rank || organicResults.length + 1,
            title: r.title || "",
            url: r.link || r.url || "",
            description: r.description || r.snippet || "",
          });
        }
      }

      return jsonResponse({ results: organicResults });
    }

    // ─── ACTION: scrape ─────────────────────────────────────────
    if (action === "scrape") {
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return jsonResponse({ error: "urls array is required" }, 400);
      }

      const results: { url: string; content: string; error?: string }[] = [];

      for (const pageUrl of urls.slice(0, 5)) {
        try {
          const pageRes = await fetch(pageUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            redirect: "follow",
          });

          if (!pageRes.ok) {
            results.push({ url: pageUrl, content: "", error: `HTTP ${pageRes.status}` });
            continue;
          }

          const html = await pageRes.text();
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 12000);

          results.push({ url: pageUrl, content: text });
        } catch (err) {
          results.push({ url: pageUrl, content: "", error: (err as Error).message });
        }
      }

      return jsonResponse({ results });
    }

    // ─── ACTION: generate ───────────────────────────────────────
    if (action === "generate") {
      if (!OPENROUTER_API_KEY) {
        return jsonResponse({ error: "OPENROUTER_API_KEY not configured" }, 500);
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Load model setting
      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["ai_model_keyword_research"]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }
      const model = settingsMap["ai_model_keyword_research"] || "openai/gpt-4o-mini";

      const themesCount = num_themes || 5;
      const keywordsCount = num_keywords || 20;
      const pagesCount = num_pages || 10;

      const systemPrompt = `You are an expert SEO strategist. Analyze the provided brand intelligence, Google SERP research, and competitor page content to generate a comprehensive keyword strategy.

Return a JSON object with this exact structure:
{
  "themes": [
    {
      "name": "Theme Name",
      "opportunity_score": 85,
      "opportunity_reason": "Brief explanation of why this is an opportunity",
      "keywords": ["keyword 1", "keyword 2", "keyword 3"],
      "suggested_pages": [
        { "title": "Page Title", "keyword": "target keyword" }
      ]
    }
  ]
}

Requirements:
- Generate exactly ${themesCount} content themes
- Distribute approximately ${keywordsCount} keywords across all themes
- Generate approximately ${pagesCount} suggested page titles total
- Opportunity scores should be 0-100 based on search volume potential, competition level, and brand relevance
- Keywords should be specific, actionable, and relevant to the brand
- Page titles should be SEO-optimized and compelling
- Focus on gaps and opportunities the brand is NOT currently ranking for`;

      let userMessage = `## Brand Intelligence\n${JSON.stringify(brand_intelligence, null, 2)}\n\n`;
      userMessage += `## Google SERP Results for "${primary_search_term}"\n${JSON.stringify(serp_results, null, 2)}\n\n`;

      if (scraped_content && scraped_content.length > 0) {
        userMessage += `## Top Ranking Pages Content\n`;
        for (const page of scraped_content) {
          userMessage += `### ${page.url}\n${page.content?.slice(0, 4000) || "No content"}\n\n`;
        }
      }

      if (additional_instructions) {
        userMessage += `\n## Additional Instructions\n${additional_instructions}\n`;
      }

      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SUPABASE_URL,
          "X-Title": "AstroGTM Keyword Research",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 6000,
          response_format: { type: "json_object" },
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return jsonResponse(
          { error: `AI API error (${aiRes.status})`, details: errText },
          502
        );
      }

      const aiData = await aiRes.json();
      let rawContent = aiData.choices?.[0]?.message?.content || "";
      rawContent = rawContent
        .replace(/^```(?:json)?\n?/i, "")
        .replace(/\n?```$/, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return jsonResponse(
          { error: "Failed to parse AI response", raw: rawContent },
          500
        );
      }

      // Save to database
      const { data: saved, error: saveError } = await supabase
        .from("gifaa_keyword_strategies")
        .insert({
          tenant_id,
          search_term: primary_search_term || "",
          country_code: country_code || "us",
          location_uule: location_uule || "",
          serp_data: serp_results || [],
          scraped_urls: (scraped_content || []).map((s: { url: string }) => s.url),
          themes: parsed.themes || [],
          generation_params: {
            num_themes: themesCount,
            num_keywords: keywordsCount,
            num_pages: pagesCount,
            additional_instructions: additional_instructions || "",
          },
        })
        .select()
        .single();

      if (saveError) {
        return jsonResponse(
          { error: "Failed to save strategy", details: saveError.message, data: parsed },
          500
        );
      }

      return jsonResponse({ success: true, data: saved });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ error: (err as Error).message || "unknown error" }, 500);
  }
});
