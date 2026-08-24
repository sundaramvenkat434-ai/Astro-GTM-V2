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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getClientIP(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

interface RateLimitConfig {
  maxCount: number;
  windowSeconds: number;
}

const FALLBACK_LIMITS: Record<string, RateLimitConfig> = {
  get: { maxCount: 60, windowSeconds: 60 },
  create: { maxCount: 5, windowSeconds: 3600 },
  "analyze-brand": { maxCount: 10, windowSeconds: 3600 },
  "search-serp": { maxCount: 10, windowSeconds: 3600 },
  "scrape-competitors": { maxCount: 10, windowSeconds: 3600 },
};

const SETTING_KEY_TO_ACTION: Record<string, string> = {
  free_audit_create_limit: "create",
  free_audit_analyze_limit: "analyze-brand",
  free_audit_serp_limit: "search-serp",
  free_audit_scrape_limit: "scrape-competitors",
};

interface AuditSettings {
  limits: Record<string, RateLimitConfig>;
  whitelistedIPs: Set<string>;
}

async function loadAuditSettings(
  supabase: ReturnType<typeof createClient>
): Promise<AuditSettings> {
  const limits: Record<string, RateLimitConfig> = { ...FALLBACK_LIMITS };
  const whitelistedIPs = new Set<string>();

  const { data } = await supabase
    .from("admin_settings")
    .select("key, value")
    .in("key", [
      "free_audit_create_limit",
      "free_audit_analyze_limit",
      "free_audit_serp_limit",
      "free_audit_scrape_limit",
      "free_audit_ip_whitelist",
    ]);

  if (data) {
    for (const row of data) {
      const action = SETTING_KEY_TO_ACTION[row.key];
      if (action) {
        const maxCount = parseInt(row.value, 10);
        if (maxCount > 0) limits[action] = { maxCount, windowSeconds: FALLBACK_LIMITS[action]?.windowSeconds || 3600 };
      } else if (row.key === "free_audit_ip_whitelist") {
        for (const ip of row.value.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)) {
          whitelistedIPs.add(ip);
        }
      }
    }
  }

  return { limits, whitelistedIPs };
}

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  ip: string,
  action: string,
  settings: AuditSettings
): Promise<{ allowed: boolean; resetIn?: number }> {
  if (settings.whitelistedIPs.has(ip)) return { allowed: true };

  const config = settings.limits[action];
  if (!config) return { allowed: true };

  const { data, error } = await supabase.rpc("check_free_audit_rate_limit", {
    p_ip: ip,
    p_action: action,
    p_max_count: config.maxCount,
    p_window_seconds: config.windowSeconds,
  });

  if (error) {
    return { allowed: true };
  }

  const result = data as { allowed: boolean; reset_in_seconds: number };
  return { allowed: result.allowed, resetIn: result.reset_in_seconds };
}

function extractJsonFromContent(raw: string): { ok: true; data: unknown } | { ok: false; reason: string } {
  const trimmed = raw.trim();
  try {
    return { ok: true, data: JSON.parse(trimmed) };
  } catch { /* try next */ }

  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return { ok: true, data: JSON.parse(fenceMatch[1].trim()) };
    } catch { /* try next */ }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return { ok: true, data: JSON.parse(candidate) };
    } catch { /* try next */ }
  }

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

interface SerpResult {
  rank: number;
  title: string;
  url: string;
  description: string;
}

const FALLBACK_SEARCH_QUERIES_PROMPT = `You are an expert SEO strategist and search behavior researcher.

Analyze the provided company website content and identify how real potential customers would search to find this business, its products, services, or solutions.

Generate exactly 10 realistic, non-branded search queries.

The queries must be:
- Based on the actual business and offerings described in the website content
- Phrases that a real person could plausibly type into Google
- Meaningfully distinct from each other, not just minor keyword variations
- Focused on the best ways a potential customer could discover this business category or solution
- A mix of relevant search intents where appropriate, such as category, product, service, problem/solution, tool/software, audience-specific, commercial, or comparison queries

Do not use the company's brand name unless it is genuinely necessary to describe a generic search behavior. Prefer non-branded discovery queries.

Avoid:
- Generic keywords that do not accurately represent the business
- Made-up phrases that people are unlikely to search
- Ten variations of the same keyword
- Keywords based only on isolated words rather than understanding the overall business

Return ONLY valid JSON:
{
  "search_queries": [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]
}`;

async function fetchWebsiteContent(url: string): Promise<{ ok: true; html: string } | { ok: false; error: string; status?: number }> {
  let pageResponse: Response;
  try {
    pageResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
  } catch (fetchErr) {
    return { ok: false, error: `Failed to connect: ${String(fetchErr)}` };
  }

  if (!pageResponse.ok) {
    return { ok: false, error: `HTTP ${pageResponse.status}`, status: pageResponse.status };
  }

  const html = await pageResponse.text();
  return { ok: true, html: html.length > 1_500_000 ? html.slice(0, 1_500_000) : html };
}

function extractTextFromHtml(html: string, sourceUrl: string): string {
  try {
    const parsed = parseHTML(html);
    const document = parsed.document;

    try {
      const base = document.createElement("base");
      base.setAttribute("href", sourceUrl);
      document.head.appendChild(base);
    } catch { /* ignore */ }

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

    try {
      const reader = new Readability(document);
      const readabilityResult = reader.parse();
      if (readabilityResult?.textContent) {
        return readabilityResult.textContent
          .replace(/\s+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
          .slice(0, 30000);
      }
    } catch { /* fall through */ }
  } catch { /* fall through */ }

  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const clientIP = getClientIP(req);

    const body = await req.json();
    const { action } = body;

    const settings = await loadAuditSettings(supabase);

    // ═══════════════════════════════════════════════════════════
    // ACTION: get — fetch audit by id (light rate limit)
    // ═══════════════════════════════════════════════════════════
    if (action === "get") {
      const rl = await checkRateLimit(supabase, clientIP, "get", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many requests. Please wait a moment and try again.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
      }

      const { audit_id } = body;
      if (!audit_id) return jsonResponse({ error: "audit_id is required" }, 400);

      const { data: audit, error } = await supabase
        .from("free_audits")
        .select("*")
        .eq("id", audit_id)
        .maybeSingle();

      if (error) return jsonResponse({ error: "Database error", detail: error.message }, 500);
      if (!audit) return jsonResponse({ error: "Audit not found" }, 404);

      return jsonResponse({ success: true, data: audit });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: create — insert new audit row
    // ═══════════════════════════════════════════════════════════
    if (action === "create") {
      const rl = await checkRateLimit(supabase, clientIP, "create", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "You've started a lot of audits recently. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
      }

      let { website_url } = body;
      if (!website_url) return jsonResponse({ error: "website_url is required" }, 400);

      // Normalize URL
      if (!website_url.match(/^https?:\/\//)) {
        website_url = "https://" + website_url;
      }

      try {
        new URL(website_url);
      } catch {
        return jsonResponse({ error: `Invalid URL: "${website_url}"` }, 400);
      }

      const { data: audit, error } = await supabase
        .from("free_audits")
        .insert({ website_url, status: "pending" })
        .select()
        .single();

      if (error) return jsonResponse({ error: "Failed to create audit", detail: error.message }, 500);

      return jsonResponse({ success: true, data: audit });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: analyze-brand — fetch URL, extract content, call OpenRouter
    // ═══════════════════════════════════════════════════════════
    if (action === "analyze-brand") {
      const rl = await checkRateLimit(supabase, clientIP, "analyze-brand", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many analysis requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
      }

      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (!OPENROUTER_API_KEY) {
        return jsonResponse({ error: "OpenRouter API key is not configured." }, 500);
      }

      const { audit_id } = body;
      if (!audit_id) return jsonResponse({ error: "audit_id is required" }, 400);

      const { data: audit, error: fetchError } = await supabase
        .from("free_audits")
        .select("*")
        .eq("id", audit_id)
        .maybeSingle();

      if (fetchError) return jsonResponse({ error: "Database error", detail: fetchError.message }, 500);
      if (!audit) return jsonResponse({ error: "Audit not found" }, 404);

      // Update status to analyzing
      await supabase
        .from("free_audits")
        .update({ status: "analyzing", updated_at: new Date().toISOString() })
        .eq("id", audit_id);

      const sourceUrl = audit.website_url;

      // Step 1: Fetch website
      const fetchResult = await fetchWebsiteContent(sourceUrl);
      if (!fetchResult.ok) {
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: fetchResult.error, updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: fetchResult.error.includes("HTTP") ? `Website returned an error (${fetchResult.error}).` : "Failed to connect to the website. The URL may be unreachable." }, 400);
      }

      // Step 2: Extract text content
      const contentToAnalyze = extractTextFromHtml(fetchResult.html, sourceUrl);

      if (!contentToAnalyze || contentToAnalyze.length < 50) {
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: "Insufficient content extracted", updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: "Insufficient content to analyze. The page may be empty or require JavaScript." }, 400);
      }

      // Step 3: Load prompt and model settings from admin_settings
      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", [
          "brand_analyzer_prompt",
          "ai_model_brand_analyzer",
          "ai_max_tokens_brand_analyzer_prompt",
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

      // Step 4: Call OpenRouter
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
              "X-Title": "AstroRank Free Audit",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                {
                  role: "user",
                  content: `Analyze the following website content and extract brand intelligence:\n\n${contentToAnalyze}`,
                },
              ],
              temperature: 0.7,
              max_tokens: maxTokens,
              response_format: { type: "json_object" },
            }),
          }
        );
      } catch (apiErr) {
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: `OpenRouter request failed: ${String(apiErr)}`, updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: "Failed to reach the AI service." }, 502);
      }

      if (aiResponse.status === 429) {
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: "AI service rate limited", updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: "AI service is busy. Please try again in a moment." }, 429);
      }

      if (!aiResponse.ok) {
        const errText = await aiResponse.text().catch(() => "");
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: `AI error (${aiResponse.status}): ${errText.slice(0, 500)}`, updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: `AI service returned an error (HTTP ${aiResponse.status}).` }, 502);
      }

      const aiData = await aiResponse.json();
      const rawContent: string = aiData.choices?.[0]?.message?.content || "";

      if (!rawContent) {
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: "AI returned empty response", updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: "AI returned an empty response." }, 502);
      }

      // Step 5: Parse JSON
      const extractionResult = extractJsonFromContent(rawContent);
      if (!extractionResult.ok) {
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: `JSON parse failed: ${extractionResult.reason}`, updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: "Failed to parse AI response as JSON." }, 502);
      }

      const parsed = extractionResult.data as Record<string, unknown>;

      // Step 6: Save to database
      const { data: updated, error: saveError } = await supabase
        .from("free_audits")
        .update({
          status: "complete",
          brand_analysis: parsed,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", audit_id)
        .select()
        .single();

      if (saveError) {
        return jsonResponse({ error: "Failed to save analysis", detail: saveError.message }, 500);
      }

      return jsonResponse({ success: true, data: updated });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: generate-search-queries — scrape website, call OpenRouter for 10 search queries
    // ═══════════════════════════════════════════════════════════
    if (action === "generate-search-queries") {
      const rl = await checkRateLimit(supabase, clientIP, "analyze-brand", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many analysis requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
      }

      const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
      if (!OPENROUTER_API_KEY) {
        return jsonResponse({ error: "OpenRouter API key is not configured." }, 500);
      }

      const { audit_id } = body;
      if (!audit_id) return jsonResponse({ error: "audit_id is required" }, 400);

      const { data: audit, error: fetchError } = await supabase
        .from("free_audits")
        .select("*")
        .eq("id", audit_id)
        .maybeSingle();

      if (fetchError) return jsonResponse({ error: "Database error", detail: fetchError.message }, 500);
      if (!audit) return jsonResponse({ error: "Audit not found" }, 404);

      const sourceUrl = audit.website_url;

      // Step 1: Fetch website (reuse shared scraper)
      const fetchResult = await fetchWebsiteContent(sourceUrl);
      if (!fetchResult.ok) {
        return jsonResponse({ error: fetchResult.error.includes("HTTP") ? `Website returned an error (${fetchResult.error}).` : "Failed to connect to the website. The URL may be unreachable." }, 400);
      }

      // Step 2: Extract text content
      const contentToAnalyze = extractTextFromHtml(fetchResult.html, sourceUrl);

      if (!contentToAnalyze || contentToAnalyze.length < 50) {
        return jsonResponse({ error: "Insufficient content to analyze. The page may be empty or require JavaScript." }, 400);
      }

      // Step 3: Load prompt and model settings
      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", [
          "free_audit_search_queries_prompt",
          "ai_model_brand_analyzer",
          "ai_max_tokens_brand_analyzer_prompt",
        ]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }

      const systemPrompt =
        settingsMap["free_audit_search_queries_prompt"] || FALLBACK_SEARCH_QUERIES_PROMPT;
      const model =
        settingsMap["ai_model_brand_analyzer"] || "openai/gpt-oss-120b:free";
      const maxTokens = parseInt(settingsMap["ai_max_tokens_brand_analyzer_prompt"]) || 8000;

      // Step 4: Call OpenRouter
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
              "X-Title": "AstroRank Free Audit",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                {
                  role: "user",
                  content: `Analyze the following website content and generate 10 realistic search queries:\n\n${contentToAnalyze}`,
                },
              ],
              temperature: 0.7,
              max_tokens: maxTokens,
              response_format: { type: "json_object" },
            }),
          }
        );
      } catch {
        return jsonResponse({ error: "Failed to reach the AI service." }, 502);
      }

      if (aiResponse.status === 429) {
        return jsonResponse({ error: "AI service is busy. Please try again in a moment." }, 429);
      }

      if (!aiResponse.ok) {
        return jsonResponse({ error: `AI service returned an error (HTTP ${aiResponse.status}).` }, 502);
      }

      const aiData = await aiResponse.json();
      const rawContent: string = aiData.choices?.[0]?.message?.content || "";

      if (!rawContent) {
        return jsonResponse({ error: "AI returned an empty response." }, 502);
      }

      // Step 5: Parse JSON
      const extractionResult = extractJsonFromContent(rawContent);
      if (!extractionResult.ok) {
        return jsonResponse({ error: "Failed to parse AI response as JSON." }, 502);
      }

      const parsed = extractionResult.data as Record<string, unknown>;
      const queries = Array.isArray(parsed.search_queries) ? parsed.search_queries.filter((q: unknown) => typeof q === "string") : [];

      // Step 6: Save to database
      const { data: updated, error: saveError } = await supabase
        .from("free_audits")
        .update({
          search_queries: queries,
          updated_at: new Date().toISOString(),
        })
        .eq("id", audit_id)
        .select()
        .single();

      if (saveError) {
        return jsonResponse({ error: "Failed to save search queries", detail: saveError.message }, 500);
      }

      return jsonResponse({ success: true, data: updated });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: search-serp — call Apify Google SERP scraper
    // ═══════════════════════════════════════════════════════════
    if (action === "search-serp") {
      const rl = await checkRateLimit(supabase, clientIP, "search-serp", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many search requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
      }

      const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
      if (!APIFY_TOKEN) {
        return jsonResponse({ error: "APIFY_TOKEN not configured" }, 500);
      }

      const { audit_id, search_term, country_code } = body;
      if (!audit_id) return jsonResponse({ error: "audit_id is required" }, 400);
      if (!search_term) return jsonResponse({ error: "search_term is required" }, 400);

      const { data: audit, error: auditError } = await supabase
        .from("free_audits")
        .select("id")
        .eq("id", audit_id)
        .maybeSingle();

      if (auditError) return jsonResponse({ error: "Database error", detail: auditError.message }, 500);
      if (!audit) return jsonResponse({ error: "Audit not found" }, 404);

      const apifyPayload = {
        countryCode: country_code || "us",
        csvFriendlyOutput: false,
        includeUnfilteredResults: false,
        locationUule: "",
        maxPagesPerQuery: 3,
        mobileResults: false,
        queries: search_term,
        resultsPerPage: 10,
        saveHtml: false,
        saveHtmlToKeyValueStore: false,
      };

      const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/nFJndFXA5zjCTuudP/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apifyPayload),
        }
      );

      if (!apifyRes.ok) {
        const errText = await apifyRes.text();
        return jsonResponse({ error: `Apify request failed (${apifyRes.status})`, details: errText }, 502);
      }

      const apifyData = await apifyRes.json();
      const organicResults: SerpResult[] = [];
      for (const item of apifyData) {
        const nested = item?.organicResults || item?.organic_results || [];
        if (nested.length > 0) {
          for (const r of nested) {
            organicResults.push({
              rank: r.position || r.rank || organicResults.length + 1,
              title: r.title || "",
              url: r.url || r.link || "",
              description: r.description || r.snippet || "",
            });
          }
        } else if (item?.title && (item?.url || item?.link)) {
          organicResults.push({
            rank: item.position || item.rank || organicResults.length + 1,
            title: item.title || "",
            url: item.url || item.link || "",
            description: item.description || item.snippet || "",
          });
        }
      }

      // Save to audit
      await supabase
        .from("free_audits")
        .update({ serp_results: organicResults, updated_at: new Date().toISOString() })
        .eq("id", audit_id);

      return jsonResponse({ success: true, results: organicResults });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: scrape-competitors — fetch and clean competitor pages
    // ═══════════════════════════════════════════════════════════
    if (action === "scrape-competitors") {
      const rl = await checkRateLimit(supabase, clientIP, "scrape-competitors", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many scraping requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
      }

      const { audit_id, urls } = body;
      if (!audit_id) return jsonResponse({ error: "audit_id is required" }, 400);
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return jsonResponse({ error: "urls array is required" }, 400);
      }

      const { data: audit, error: auditError } = await supabase
        .from("free_audits")
        .select("id")
        .eq("id", audit_id)
        .maybeSingle();

      if (auditError) return jsonResponse({ error: "Database error", detail: auditError.message }, 500);
      if (!audit) return jsonResponse({ error: "Audit not found" }, 404);

      const results: { url: string; content: string; error?: string }[] = [];
      for (const pageUrl of urls.slice(0, 5)) {
        try {
          const pageRes = await fetch(pageUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

      // Save to audit
      await supabase
        .from("free_audits")
        .update({ scraped_competitors: results, updated_at: new Date().toISOString() })
        .eq("id", audit_id);

      return jsonResponse({ success: true, results });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ error: (err as Error).message || "unknown error" }, 500);
  }
});
