import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { callAI, getProvider, type AIProvider } from "../_shared/ai-router.ts";

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

// ═══════════════════════════════════════════════════════════════
// PIPELINE HELPERS
// ═══════════════════════════════════════════════════════════════

const VALID_VOLUMES = [0, 10, 20, 30, 50, 70, 100, 150, 200, 250, 500, 1000, 3000, 5000, 10000];

function snapToVolumeBucket(v: number): number {
  let closest = 0;
  let minDiff = Math.abs(v);
  for (const bucket of VALID_VOLUMES) {
    const diff = Math.abs(v - bucket);
    if (diff < minDiff) {
      minDiff = diff;
      closest = bucket;
    }
  }
  return closest;
}

function nearestLowerBucket(v: number): number {
  let result = 0;
  for (const bucket of VALID_VOLUMES) {
    if (bucket <= v) result = bucket;
    else break;
  }
  return result;
}

function cleanAiJson(raw: string): string {
  return raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();
}

async function callLLM(
  apiKey: string,
  model: string,
  supabaseUrl: string,
  systemPrompt: string,
  userMessage: string,
  opts: { temperature?: number; maxTokens?: number; title?: string; provider?: AIProvider } = {}
): Promise<{ content: string; error?: string }> {
  try {
    const result = await callAI({
      provider: opts.provider || "openrouter",
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: opts.temperature ?? 0.7,
      maxTokens: opts.maxTokens ?? 8000,
      responseFormat: { type: "json_object" },
      allowFallbacks: (opts.provider || "openrouter") === "openrouter",
      title: opts.title || "AstroGTM Keyword Pipeline",
    });
    return { content: result.content };
  } catch (err: any) {
    return { content: "", error: err?.message || String(err) };
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

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
        countryCode: country_code || "us",
        csvFriendlyOutput: false,
        includeUnfilteredResults: false,
        locationUule: location_uule || "",
        maxPagesPerQuery: 3,
        mobileResults: false,
        queries: primary_search_term,
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

      if (organicResults.length === 0) {
        return jsonResponse({
          results: [],
          debug: {
            items_count: apifyData.length,
            first_item_keys: apifyData.length > 0 ? Object.keys(apifyData[0]) : [],
            sample: apifyData.length > 0 ? JSON.stringify(apifyData[0]).slice(0, 2000) : null,
          },
        });
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

      return jsonResponse({ results });
    }

    // ─── ACTION: generate (keyword strategy) ────────────────────
    if (action === "generate") {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["ai_model_keyword_research", "ai_provider_ai_keyword_research_prompt"]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }
      const model = settingsMap["ai_model_keyword_research"] || "openai/gpt-oss-120b";

      const themesCount = num_themes || 5;
      const keywordsCount = num_keywords || 20;
      const pagesCount = num_pages || 10;

      const { data: promptRow } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "ai_keyword_research_prompt")
        .maybeSingle();

      const systemPrompt = promptRow?.value || `You are an expert SEO strategist and keyword researcher. Your job is to analyze brand data, Google SERP competition, and competitor page content to produce a comprehensive, actionable keyword strategy.

Return a JSON object with this exact structure:
{
  "themes": [
    {
      "name": "Theme Name",
      "opportunity_score": 85,
      "opportunity_reason": "Brief explanation of why this is an opportunity based on the data",
      "keywords": ["keyword 1", "keyword 2", "keyword 3"],
      "suggested_pages": [
        { "title": "SEO-Optimized Page Title", "keyword": "target keyword" }
      ]
    }
  ]
}

EXACT OUTPUT REQUIREMENTS:
- Generate EXACTLY ${themesCount} content themes
- Generate EXACTLY ${keywordsCount} keywords distributed across all themes
- Generate EXACTLY ${pagesCount} suggested page titles distributed across all themes
- Do NOT generate fewer items than requested.

PAGE TITLE UNIQUENESS RULES:
- Every single page title MUST be completely distinct and unique
- No two page titles may cover the same topic from a slightly different angle
- Each page must target a genuinely different search intent or user need

CRITICAL REQUIREMENTS:
- Opportunity scores must be 0-100 based on: estimated search volume, competition difficulty, and brand relevance
- Keywords must be SPECIFIC and ACTIONABLE - no vague single-word terms. Long-tail is preferred.
- Every keyword should map to clear search intent
- Page titles must be SEO-optimized, compelling, and distinct
- Focus on GAPS and OPPORTUNITIES the brand is NOT currently ranking for
- Use the scraped competitor content to understand what topics are already well-covered vs. where there are gaps
- Prioritize keywords where the brand has a realistic chance of ranking`;

      let userMessage = "";
      userMessage += `## STRICT OUTPUT CONSTRAINTS\n`;
      userMessage += `- ${themesCount} themes\n- ${keywordsCount} total keywords\n- ${pagesCount} total suggested pages\n\n`;

      if (brand_intelligence) {
        userMessage += `## Brand Intelligence (CONTEXT ONLY)\n`;
        userMessage += JSON.stringify(brand_intelligence, null, 2);
        userMessage += "\n\n";
      }

      userMessage += `## Google SERP Results for "${primary_search_term}"\n`;
      userMessage += JSON.stringify(serp_results, null, 2);
      userMessage += "\n\n";

      if (scraped_content && scraped_content.length > 0) {
        userMessage += `## Scraped Competitor Content\n`;
        for (const page of scraped_content) {
          if (page.content && page.content.length > 0) {
            userMessage += `### ${page.url}\n${page.content.slice(0, 5000)}\n\n`;
          }
        }
      }

      if (additional_instructions) {
        userMessage += `\n## User Instructions\n${additional_instructions}\n`;
      }

      const provider = getProvider(settingsMap, "ai_keyword_research_prompt");
      const llmResult = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, systemPrompt, userMessage, {
        temperature: 0.7,
        maxTokens: Math.max(8000, pagesCount * 200 + keywordsCount * 50 + themesCount * 500),
        title: "AstroGTM Keyword Research",
        provider,
      });
      if (llmResult.error) {
        return jsonResponse({ error: `AI API error`, details: llmResult.error }, 502);
      }
      let rawContent = llmResult.content;

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return jsonResponse({ error: "Failed to parse AI response", raw: rawContent }, 500);
      }

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
        return jsonResponse({ error: "Failed to save strategy", details: saveError.message, data: parsed }, 500);
      }

      return jsonResponse({ success: true, data: saved });
    }

    // ─── ACTION: enrich-volume ──────────────────────────────────
    if (action === "enrich-volume") {
      const { strategy_id, pages, country, industry } = body as {
        strategy_id: string;
        pages: { title: string; slug: string; existing_keyword: string }[];
        country?: string;
        industry?: string;
      };

      if (!strategy_id) return jsonResponse({ error: "strategy_id is required" }, 400);
      if (!pages || pages.length === 0) return jsonResponse({ error: "pages array is required" }, 400);

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["ai_model_keyword_research", "ai_keyword_volume_prompt", "ai_provider_ai_keyword_research_prompt"]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }

      const model = settingsMap["ai_model_keyword_research"] || "openai/gpt-oss-120b";

      const defaultSystemPrompt = `You are an SEO keyword research expert. Given a list of pages, identify the best primary search keyword for each page and estimate its monthly search volume.

KEYWORD SELECTION:
1. Start with the "existing_keyword" field. If it is 2-3 words and sounds like a real search query, use it.
2. If existing_keyword is too long, extract its 2-3 most important words.
3. Only fall back to deriving from the page title or slug if existing_keyword is blank.

KEYWORD RULES:
- primary_keyword must be EXACTLY 2-3 words
- Must be lowercase
- Must sound like something a real person types into Google

VOLUME RULES:
- monthly_search_volume must be a realistic integer for country: {{country}}
- Be conservative. Most niche long-tail pages get 100-2000/month.
- confidence must be 0-100

Return ONLY valid JSON:
{
  "results": [
    { "slug": "exact-slug", "primary_keyword": "2-3 words", "monthly_search_volume": 1200, "confidence": 65 }
  ]
}`;

      let systemPrompt = settingsMap["ai_keyword_volume_prompt"] || defaultSystemPrompt;
      const countryVal = country || "us";
      const industryVal = industry || "general";
      systemPrompt = systemPrompt
        .replace(/\{\{country\}\}/g, countryVal)
        .replace(/\{\{industry\}\}/g, industryVal)
        .replace(/\{\{keywords_json\}\}/g, JSON.stringify(pages, null, 2));

      const userMessage = `Country: ${countryVal}\nIndustry: ${industryVal}\n\nPages:\n${JSON.stringify(pages, null, 2)}`;

      const provider = getProvider(settingsMap, "ai_keyword_research_prompt");
      const llmResult = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, systemPrompt, userMessage, {
        temperature: 0,
        maxTokens: pages.length * 100 + 500,
        title: "AstroGTM Volume Enrichment",
        provider,
      });
      if (llmResult.error) {
        return jsonResponse({ error: `AI API error`, details: llmResult.error }, 502);
      }
      let rawContent = llmResult.content;

      let parsed: { results: { slug: string; primary_keyword: string; monthly_search_volume: number; confidence: number }[] };
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return jsonResponse({ error: "Failed to parse AI response", raw: rawContent }, 500);
      }

      const validSlugs = new Set(pages.map((p) => p.slug));
      const FILLER = new Set(["guide", "tips", "ultimate", "complete", "how", "to", "best", "top", "for", "a", "an", "the", "and", "or", "of", "in", "on", "with", "using", "use", "get", "your", "my", "our"]);
      const COMMERCIAL = new Set(["app", "apps", "software", "tool", "tools", "platform", "platforms", "template", "templates", "checklist", "checklists", "ideas", "service", "services", "system", "systems"]);

      function sanitizeKeyword(raw: string): string | null {
        if (!raw || typeof raw !== "string") return null;
        const clean = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
        const words = clean.split(" ").filter((w) => w.length > 1);
        const meaningful = words.filter((w) => COMMERCIAL.has(w) || !FILLER.has(w));
        if (meaningful.length < 2) return null;
        if (meaningful.length <= 3) return meaningful.join(" ");
        const last = meaningful[meaningful.length - 1];
        if (COMMERCIAL.has(last)) return [...meaningful.slice(0, 2), last].join(" ");
        return meaningful.slice(0, 3).join(" ");
      }

      const volumesMap: Record<string, { primary_keyword: string; monthly_search_volume: number; confidence: number }> = {};
      for (const item of parsed.results || []) {
        if (!item.slug || !validSlugs.has(item.slug)) continue;
        const kw = sanitizeKeyword(item.primary_keyword);
        if (!kw) continue;
        const volume = typeof item.monthly_search_volume === "number" ? Math.round(item.monthly_search_volume) : null;
        if (volume === null || volume < 0) continue;
        const confidence = typeof item.confidence === "number" ? Math.min(100, Math.max(0, Math.round(item.confidence))) : 50;
        volumesMap[item.slug] = { primary_keyword: kw, monthly_search_volume: volume, confidence };
      }

      const { error: updateError } = await supabase
        .from("gifaa_keyword_strategies")
        .update({ page_search_volumes: volumesMap })
        .eq("id", strategy_id);

      if (updateError) {
        return jsonResponse({ error: "Failed to save volumes", details: updateError.message }, 500);
      }

      return jsonResponse({ success: true, data: volumesMap });
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTION: generate-opportunities (6-STEP MULTI-AGENT PIPELINE)
    // ═══════════════════════════════════════════════════════════════
    if (action === "generate-opportunities") {
      if (!OPENROUTER_API_KEY) {
        return jsonResponse({ error: "OPENROUTER_API_KEY not configured" }, 500);
      }
      if (!brand_intelligence) {
        return jsonResponse({ error: "brand_intelligence is required" }, 400);
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["ai_model_keyword_research", "ai_provider_ai_keyword_research_prompt"]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }
      const model = settingsMap["ai_model_keyword_research"] || "openai/gpt-oss-120b";
      const countryVal = country_code || "us";
      const industry = brand_intelligence.primary_business_segment || "general";
      const opportunitiesProvider = getProvider(settingsMap, "ai_keyword_research_prompt");

      // ──────────────────────────────────────────────────────────
      // STEP 1: KEYWORD DISCOVERY AGENT
      // ──────────────────────────────────────────────────────────
      const step1System = `You are an expert SEO keyword researcher. Generate 80-100 keyword candidates based on the provided brand intelligence, SERP results, and competitor content.

RULES:
- Generate ONLY keyword text, intent, funnel stage, keyword_type, and parent_keyword
- Do NOT estimate search volume
- Do NOT estimate difficulty
- Do NOT score opportunities
- Focus on GAPS the brand is NOT ranking for but SHOULD be
- Include a mix of head terms, body terms, and long-tail keywords
- Keywords must be specific, actionable phrases (2-5 words)
- intent: one of "informational", "commercial", "transactional", "navigational"
- funnel: one of "top", "middle", "bottom"
- keyword_type: one of "head", "body", "long-tail"
- parent_keyword: the broader 1-2 word topic this keyword belongs to

Country context: ${countryVal}

Return ONLY valid JSON:
{
  "keywords": [
    {
      "keyword": "specific search phrase",
      "intent": "commercial",
      "funnel": "middle",
      "keyword_type": "long-tail",
      "parent_keyword": "broader topic"
    }
  ]
}`;

      let step1User = `## Brand Intelligence\n${JSON.stringify(brand_intelligence, null, 2)}\n\n`;
      if (serp_results && serp_results.length > 0) {
        step1User += `## SERP Results\n${JSON.stringify(serp_results.slice(0, 20), null, 2)}\n\n`;
      }
      if (scraped_content && scraped_content.length > 0) {
        step1User += `## Competitor Content\n`;
        for (const page of scraped_content.slice(0, 5)) {
          if (page.content) step1User += `### ${page.url}\n${page.content.slice(0, 4000)}\n\n`;
        }
      }

      const step1Res = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, step1System, step1User, {
        temperature: 0.8,
        maxTokens: 10000,
        title: "AstroGTM Step1 Discovery",
        provider: opportunitiesProvider,
      });

      if (step1Res.error) return jsonResponse({ error: step1Res.error, step: 1 }, 502);

      let step1Data: { keywords: { keyword: string; intent: string; funnel: string; keyword_type: string; parent_keyword: string }[] };
      try {
        step1Data = JSON.parse(step1Res.content);
      } catch {
        return jsonResponse({ error: "Step 1: Failed to parse response", raw: step1Res.content.slice(0, 500) }, 500);
      }

      if (!step1Data.keywords || step1Data.keywords.length === 0) {
        return jsonResponse({ error: "Step 1: No keywords generated" }, 500);
      }

      // ──────────────────────────────────────────────────────────
      // STEP 2: KEYWORD NORMALIZER AGENT
      // ──────────────────────────────────────────────────────────
      const step2System = `You are a keyword normalization expert, similar to how Semrush processes keywords. For each keyword, normalize it to its canonical search form.

RULES:
- Find the parent keyword (broadest real search term)
- Extract modifiers (country, quality, channel, format)
- Detect if the phrase is real search language people actually type
- Remove unnecessary words that don't add search intent
- If multiple keywords normalize to the same parent + intent combination, mark duplicates

Examples:

"free wedding gift registry india" normalizes to:
- normalized_keyword: "wedding gift registry"
- parent_keyword: "gift registry"
- modifiers: ["free", "india"]

"whatsapp industrial sensors quote" normalizes to:
- normalized_keyword: "industrial sensors"
- parent_keyword: "industrial sensors"
- modifiers: ["whatsapp", "quote"]

"best ai chatbot for sales teams 2024" normalizes to:
- normalized_keyword: "ai chatbot sales"
- parent_keyword: "ai chatbot"
- modifiers: ["best", "2024", "teams"]

Return ONLY valid JSON:
{
  "normalized_keywords": [
    {
      "original_keyword": "the exact input keyword",
      "normalized_keyword": "cleaned search phrase",
      "parent_keyword": "broadest parent",
      "modifiers": ["modifier1", "modifier2"],
      "is_real_search": true,
      "is_duplicate": false
    }
  ]
}`;

      const step2User = `Normalize these keywords:\n${JSON.stringify(step1Data.keywords.map(k => k.keyword), null, 2)}`;

      const step2Res = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, step2System, step2User, {
        temperature: 0.2,
        maxTokens: 10000,
        title: "AstroGTM Step2 Normalizer",
        provider: opportunitiesProvider,
      });

      if (step2Res.error) return jsonResponse({ error: step2Res.error, step: 2 }, 502);

      let step2Data: { normalized_keywords: { original_keyword: string; normalized_keyword: string; parent_keyword: string; modifiers: string[]; is_real_search: boolean; is_duplicate: boolean }[] };
      try {
        step2Data = JSON.parse(step2Res.content);
      } catch {
        return jsonResponse({ error: "Step 2: Failed to parse response", raw: step2Res.content.slice(0, 500) }, 500);
      }

      // Collapse duplicates: keep best intent variant per parent_keyword
      const parentMap = new Map<string, typeof step2Data.normalized_keywords[0] & { intent: string; funnel: string; keyword_type: string }>();
      const intentPriority: Record<string, number> = { transactional: 4, commercial: 3, informational: 2, navigational: 1 };

      for (const norm of step2Data.normalized_keywords || []) {
        if (!norm.is_real_search) continue;

        const original = step1Data.keywords.find(k => k.keyword === norm.original_keyword);
        if (!original) continue;

        const parentKey = `${norm.parent_keyword}|${original.intent}`;
        const existing = parentMap.get(parentKey);

        if (!existing || (intentPriority[original.intent] || 0) > (intentPriority[existing.intent] || 0)) {
          parentMap.set(parentKey, { ...norm, intent: original.intent, funnel: original.funnel, keyword_type: original.keyword_type });
        }
      }

      const uniqueKeywords = Array.from(parentMap.values());

      if (uniqueKeywords.length === 0) {
        return jsonResponse({ error: "Step 2: All keywords filtered as non-search or duplicate" }, 500);
      }

      // ──────────────────────────────────────────────────────────
      // STEP 3: VOLUME AGENT (isolated — no brand context)
      // ──────────────────────────────────────────────────────────

      // Check cache first
      const keywordsForVolume = uniqueKeywords.map(k => k.normalized_keyword);
      const { data: cachedVolumes } = await supabase
        .from("keyword_volume_cache")
        .select("keyword, volume, confidence")
        .eq("country_code", countryVal)
        .eq("industry", industry)
        .in("keyword", keywordsForVolume);

      const cacheMap = new Map<string, { volume: number; confidence: number }>();
      for (const cv of cachedVolumes || []) {
        cacheMap.set(cv.keyword, { volume: cv.volume, confidence: cv.confidence });
      }

      const uncachedKeywords = uniqueKeywords.filter(k => !cacheMap.has(k.normalized_keyword));

      let volumeResults: { keyword: string; monthly_search_volume: number; volume_confidence: number }[] = [];

      // Add cached results
      for (const k of uniqueKeywords) {
        const cached = cacheMap.get(k.normalized_keyword);
        if (cached) {
          volumeResults.push({ keyword: k.normalized_keyword, monthly_search_volume: cached.volume, volume_confidence: cached.confidence });
        }
      }

      if (uncachedKeywords.length > 0) {
        const step3System = `You are a search volume estimation expert. Estimate monthly search volumes ONLY.

CRITICAL: You receive ONLY keywords, a country, and an industry. You have NO brand context, NO competitor data, NO opportunity information.

CALIBRATION DATABASE (use these as anchors):

Gift industry:
- gift ideas = 10000
- wedding gifts = 5000
- gift registry = 150
- wedding registry = 100
- online gift registry = 20
- wedding cash fund = 50

Industrial:
- industrial automation = 500
- industrial sensors = 200
- sensor supplier = 50

AI/Tech:
- ai tools = 10000
- ai chatbot = 5000
- ai sales agent = 250
- ai recruiter = 200

MODIFIER MULTIPLIERS (apply to parent volume):
- country modifier (india, uk, etc) = x0.5
- supplier = x0.3
- quote = x0.1
- custom = x0.2
- free = x0.5
- best = x0.8
- online = x0.3
- review = x0.4

RULES:
1. Parent keyword volume MUST always be >= child keyword volume
2. Apply modifier multipliers to estimate long-tail from parent
3. Output volume MUST be one of these exact buckets: 0, 10, 20, 30, 50, 70, 100, 150, 200, 250, 500, 1000, 3000, 5000, 10000
4. When unsure, default to lower bucket
5. volume_confidence: 0-100 representing your certainty

Example:
- parent "gift registry" = 150
- child "free wedding gift registry india" = free(x0.5) * country(x0.5) * 150 = ~37 → snap to 30

Return ONLY valid JSON:
{
  "volumes": [
    { "keyword": "exact keyword from input", "monthly_search_volume": 100, "volume_confidence": 60 }
  ]
}`;

        const step3Input = uncachedKeywords.map(k => ({
          keyword: k.normalized_keyword,
          parent_keyword: k.parent_keyword,
          modifiers: k.modifiers,
        }));

        const step3User = `Country: ${countryVal}\nIndustry: ${industry}\n\nKeywords:\n${JSON.stringify(step3Input, null, 2)}`;

        const step3Res = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, step3System, step3User, {
          temperature: 0.1,
          maxTokens: 6000,
          title: "AstroGTM Step3 Volume",
          provider: opportunitiesProvider,
        });

        if (step3Res.error) return jsonResponse({ error: step3Res.error, step: 3 }, 502);

        let step3Data: { volumes: { keyword: string; monthly_search_volume: number; volume_confidence: number }[] };
        try {
          step3Data = JSON.parse(step3Res.content);
        } catch {
          return jsonResponse({ error: "Step 3: Failed to parse response", raw: step3Res.content.slice(0, 500) }, 500);
        }

        // Snap to valid buckets
        for (const v of step3Data.volumes || []) {
          v.monthly_search_volume = snapToVolumeBucket(v.monthly_search_volume);
          volumeResults.push(v);
        }

        // Sanity check: parent volume >= child volume
        const parentVolumes = new Map<string, number>();
        for (const v of volumeResults) {
          const matchingKw = uniqueKeywords.find(k => k.normalized_keyword === v.keyword);
          if (matchingKw) {
            const current = parentVolumes.get(matchingKw.parent_keyword) || 0;
            if (v.monthly_search_volume > current) {
              parentVolumes.set(matchingKw.parent_keyword, v.monthly_search_volume);
            }
          }
        }

        for (const v of volumeResults) {
          const matchingKw = uniqueKeywords.find(k => k.normalized_keyword === v.keyword);
          if (matchingKw && matchingKw.normalized_keyword !== matchingKw.parent_keyword) {
            const parentVol = parentVolumes.get(matchingKw.parent_keyword) || 10000;
            if (v.monthly_search_volume > parentVol) {
              v.monthly_search_volume = nearestLowerBucket(parentVol);
            }
          }
        }

        // Cache new volumes
        const cacheInserts = (step3Data.volumes || []).map(v => ({
          keyword: v.keyword,
          country_code: countryVal,
          industry,
          volume: snapToVolumeBucket(v.monthly_search_volume),
          confidence: Math.min(100, Math.max(0, v.volume_confidence || 50)),
        }));

        if (cacheInserts.length > 0) {
          await supabase
            .from("keyword_volume_cache")
            .upsert(cacheInserts, { onConflict: "keyword,country_code,industry" });
        }
      }

      // ──────────────────────────────────────────────────────────
      // STEP 4: DIFFICULTY AGENT
      // ──────────────────────────────────────────────────────────
      const step4System = `You are an SEO difficulty estimation expert. Estimate keyword difficulty scores ONLY.

Consider:
- What types of domains typically rank for this keyword (authority level)
- How competitive the SERP landscape is for similar terms
- Content quality required to rank
- Do NOT use search volume to determine difficulty

Difficulty scale:
- 0-20: Very easy (thin competition, niche forums rank)
- 21-40: Easy (small blogs rank)
- 41-60: Medium (established sites rank)
- 61-80: Hard (high-authority sites dominate)
- 81-100: Very hard (only top-tier domains rank)

Return ONLY valid JSON:
{
  "difficulties": [
    { "keyword": "exact keyword from input", "difficulty": 45 }
  ]
}`;

      const step4Keywords = uniqueKeywords.map(k => k.normalized_keyword);
      let step4User = `Keywords to evaluate:\n${JSON.stringify(step4Keywords, null, 2)}`;
      if (serp_results && serp_results.length > 0) {
        step4User += `\n\nSERP context (domains currently ranking in this space):\n${JSON.stringify(serp_results.slice(0, 15).map((r: SerpResult) => ({ title: r.title, url: r.url })), null, 2)}`;
      }

      const step4Res = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, step4System, step4User, {
        temperature: 0.2,
        maxTokens: 5000,
        title: "AstroGTM Step4 Difficulty",
        provider: opportunitiesProvider,
      });

      if (step4Res.error) return jsonResponse({ error: step4Res.error, step: 4 }, 502);

      let step4Data: { difficulties: { keyword: string; difficulty: number }[] };
      try {
        step4Data = JSON.parse(step4Res.content);
      } catch {
        return jsonResponse({ error: "Step 4: Failed to parse response", raw: step4Res.content.slice(0, 500) }, 500);
      }

      // ──────────────────────────────────────────────────────────
      // STEP 5: RELEVANCE AGENT
      // ──────────────────────────────────────────────────────────
      const step5System = `You are a brand relevance analyst. Evaluate how relevant each keyword is to the brand.

EVALUATION CRITERIA (weighted equally):
1. Audience fit — does the brand's target audience search for this?
2. Product/service fit — does the brand offer something related?
3. Pain point fit — does this keyword relate to problems the brand solves?
4. Conversion likelihood — could a visitor from this keyword become a customer?

RULES:
- Score 0-100 per keyword
- Do NOT consider search volume or difficulty
- Provide a brief reason for each score

Return ONLY valid JSON:
{
  "relevance_scores": [
    { "keyword": "exact keyword", "relevance": 75, "reason": "brief explanation" }
  ]
}`;

      const step5Input = uniqueKeywords.map(k => ({
        keyword: k.normalized_keyword,
        parent_keyword: k.parent_keyword,
        intent: k.intent,
      }));

      const step5User = `## Brand Intelligence\n${JSON.stringify({
        about_brand: brand_intelligence.about_brand,
        primary_business_segment: brand_intelligence.primary_business_segment,
        target_audience: brand_intelligence.target_audience,
        primary_search_keyword: brand_intelligence.primary_search_keyword,
      }, null, 2)}\n\n## Keywords to evaluate\n${JSON.stringify(step5Input, null, 2)}`;

      const step5Res = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, step5System, step5User, {
        temperature: 0.3,
        maxTokens: 6000,
        title: "AstroGTM Step5 Relevance",
        provider: opportunitiesProvider,
      });

      if (step5Res.error) return jsonResponse({ error: step5Res.error, step: 5 }, 502);

      let step5Data: { relevance_scores: { keyword: string; relevance: number; reason: string }[] };
      try {
        step5Data = JSON.parse(step5Res.content);
      } catch {
        return jsonResponse({ error: "Step 5: Failed to parse response", raw: step5Res.content.slice(0, 500) }, 500);
      }

      // ──────────────────────────────────────────────────────────
      // STEP 6: DETERMINISTIC OPPORTUNITY SCORER
      // ──────────────────────────────────────────────────────────
      const volumeMap = new Map<string, number>();
      for (const v of volumeResults) volumeMap.set(v.keyword, v.monthly_search_volume);

      const difficultyMap = new Map<string, number>();
      for (const d of step4Data.difficulties || []) difficultyMap.set(d.keyword, d.difficulty);

      const relevanceMap = new Map<string, { relevance: number; reason: string }>();
      for (const r of step5Data.relevance_scores || []) relevanceMap.set(r.keyword, { relevance: r.relevance, reason: r.reason });

      const intentScores: Record<string, number> = {
        transactional: 100,
        commercial: 80,
        informational: 40,
        navigational: 20,
      };

      function volumeToScore(vol: number): number {
        if (vol >= 10000) return 100;
        if (vol >= 5000) return 90;
        if (vol >= 3000) return 80;
        if (vol >= 1000) return 70;
        if (vol >= 500) return 60;
        if (vol >= 250) return 50;
        if (vol >= 200) return 45;
        if (vol >= 150) return 40;
        if (vol >= 100) return 35;
        if (vol >= 70) return 30;
        if (vol >= 50) return 25;
        if (vol >= 30) return 20;
        if (vol >= 20) return 15;
        if (vol >= 10) return 10;
        return 5;
      }

      interface FinalKeyword {
        keyword: string;
        normalized_keyword: string;
        parent_keyword: string;
        modifiers: string[];
        search_volume: number;
        difficulty: number;
        intent: string;
        funnel: string;
        relevance: number;
        keyword_type: string;
        reasoning: string;
        opportunity_score: number;
      }

      const finalKeywords: FinalKeyword[] = [];

      for (const kw of uniqueKeywords) {
        const volume = volumeMap.get(kw.normalized_keyword) ?? 0;
        const difficulty = difficultyMap.get(kw.normalized_keyword) ?? 50;
        const rel = relevanceMap.get(kw.normalized_keyword);
        const relevance = rel?.relevance ?? 50;
        const reason = rel?.reason ?? "";

        const volScore = volumeToScore(volume);
        const diffScore = 100 - difficulty;
        const intentScore = intentScores[kw.intent] || 40;

        const opportunityScore = Math.round(
          (volScore * 0.25) + (diffScore * 0.25) + (intentScore * 0.25) + (relevance * 0.25)
        );

        finalKeywords.push({
          keyword: kw.original_keyword,
          normalized_keyword: kw.normalized_keyword,
          parent_keyword: kw.parent_keyword,
          modifiers: kw.modifiers,
          search_volume: volume,
          difficulty,
          intent: kw.intent,
          funnel: kw.funnel,
          relevance,
          keyword_type: kw.keyword_type,
          reasoning: reason,
          opportunity_score: opportunityScore,
        });
      }

      // Sort by opportunity_score descending, take top 30
      finalKeywords.sort((a, b) => b.opportunity_score - a.opportunity_score);
      const top30 = finalKeywords.slice(0, 30);

      // Persist
      const { data: saved, error: saveError } = await supabase
        .from("gifaa_keyword_opportunities")
        .insert({
          tenant_id,
          brand_intelligence_id: brand_intelligence.id || null,
          keywords: top30,
          generation_params: {
            country_code: countryVal,
            industry,
            pipeline_version: 2,
            steps_completed: 6,
            candidates_discovered: step1Data.keywords.length,
            after_normalization: uniqueKeywords.length,
            final_count: top30.length,
          },
          country_code: countryVal,
        })
        .select()
        .single();

      if (saveError) {
        return jsonResponse({ error: "Failed to save opportunities", details: saveError.message, data: { keywords: top30 } }, 500);
      }

      return jsonResponse({ success: true, data: saved });
    }

    // ─── ACTION: generate-pages-for-keyword ─────────────────────
    if (action === "generate-pages-for-keyword") {
      const { keyword_data } = body as {
        keyword_data: {
          keyword: string;
          normalized_keyword?: string;
          parent_keyword?: string;
          modifiers?: string[];
          search_volume: number;
          difficulty: number;
          intent: string;
          funnel: string;
          opportunity_score: number;
        };
      };

      if (!keyword_data || !keyword_data.keyword) {
        return jsonResponse({ error: "keyword_data is required" }, 400);
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["ai_model_keyword_research", "ai_provider_ai_keyword_research_prompt"]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }
      const model = settingsMap["ai_model_keyword_research"] || "openai/gpt-oss-120b";

      const hasNormalized = keyword_data.normalized_keyword && keyword_data.parent_keyword;

      const systemPrompt = `You are an SEO content strategist. Given a target keyword and its metadata, generate 3-5 specific page ideas that could rank for this keyword or related variations.

${hasNormalized ? `IMPORTANT CONTEXT:
- The keyword has been normalized. Use the normalized form for SEO targeting.
- The parent keyword represents the broader topic cluster.
- Modifiers indicate long-tail intent variations to incorporate.
- Pages should target the long-tail intent but SEO metadata should align with the parent keyword cluster.` : ""}

Each page idea should have:
- title: SEO-optimized page title (compelling, click-worthy, targets the long-tail intent)
- slug: URL-friendly slug (lowercase, hyphens, no stop words)
- seo_cluster: the parent keyword this page belongs to (for internal linking strategy)

Return ONLY valid JSON:
{
  "pages": [
    { "title": "...", "slug": "...", "seo_cluster": "..." }
  ]
}`;

      let userMessage = `Target keyword: "${keyword_data.keyword}"`;
      if (hasNormalized) {
        userMessage += `\nNormalized keyword: "${keyword_data.normalized_keyword}"`;
        userMessage += `\nParent keyword (SEO cluster): "${keyword_data.parent_keyword}"`;
        userMessage += `\nModifiers: ${JSON.stringify(keyword_data.modifiers || [])}`;
      }
      userMessage += `\nSearch volume: ${keyword_data.search_volume}/mo`;
      userMessage += `\nDifficulty: ${keyword_data.difficulty}/100`;
      userMessage += `\nIntent: ${keyword_data.intent}`;
      userMessage += `\nFunnel stage: ${keyword_data.funnel}`;

      const provider = getProvider(settingsMap, "ai_keyword_research_prompt");
      const llmResult = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, systemPrompt, userMessage, {
        temperature: 0.7,
        maxTokens: 2000,
        title: "AstroGTM Page Ideas",
        provider,
      });
      if (llmResult.error) {
        return jsonResponse({ error: `AI API error`, details: llmResult.error }, 502);
      }
      let rawContent = llmResult.content;

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return jsonResponse({ error: "Failed to parse AI response", raw: rawContent }, 500);
      }

      return jsonResponse({ success: true, pages: parsed.pages || [] });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ error: (err as Error).message || "unknown error" }, 500);
  }
});
