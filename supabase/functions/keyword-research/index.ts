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

// ═══════════════════════════════════════════════════════════════
// PIPELINE HELPERS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// KEYWORD VOLUME REFERENCE (from Google Keyword Planner CSV)
// ═══════════════════════════════════════════════════════════════

const KEYWORD_VOLUME_REFERENCE = [
  { keyword: "ai agent", avg_monthly_searches: "10K-100K", competition: "Medium", volume_anchor: 50000 },
  { keyword: "ai assistant", avg_monthly_searches: "100K-1M", competition: "Low", volume_anchor: 500000 },
  { keyword: "ai automation tool", avg_monthly_searches: "1K-10K", competition: "Medium", volume_anchor: 5000 },
  { keyword: "ai chatbot", avg_monthly_searches: "100K-1M", competition: "Low", volume_anchor: 500000 },
  { keyword: "ai customer support agent", avg_monthly_searches: "10-100", competition: "Medium", volume_anchor: 50 },
  { keyword: "ai email assistant", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500 },
  { keyword: "ai meeting assistant", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500 },
  { keyword: "ai recruiter", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000 },
  { keyword: "ai sales agent", avg_monthly_searches: "100-1K", competition: "Medium", volume_anchor: 500 },
  { keyword: "ai tools", avg_monthly_searches: "100K-1M", competition: "Medium", volume_anchor: 500000 },
  { keyword: "crm software", avg_monthly_searches: "10K-100K", competition: "Low", volume_anchor: 50000 },
  { keyword: "client portal software", avg_monthly_searches: "10-100", competition: "Low", volume_anchor: 50 },
  { keyword: "document organizer", avg_monthly_searches: "100-1K", competition: "High", volume_anchor: 500 },
  { keyword: "document management software", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000 },
  { keyword: "gift registry", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500 },
  { keyword: "wedding registry", avg_monthly_searches: "100-1K", competition: "Low", volume_anchor: 500 },
  { keyword: "budget planner", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000 },
  { keyword: "expense tracker", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000 },
  { keyword: "invoice generator", avg_monthly_searches: "10K-100K", competition: "Low", volume_anchor: 50000 },
  { keyword: "resume builder", avg_monthly_searches: "100K-1M", competition: "Medium", volume_anchor: 500000 },
  { keyword: "fitness app", avg_monthly_searches: "1K-10K", competition: "Low", volume_anchor: 5000 },
  { keyword: "habit tracker", avg_monthly_searches: "10K-100K", competition: "Medium", volume_anchor: 50000 },
  { keyword: "workflow automation", avg_monthly_searches: "1K-10K", competition: "Medium", volume_anchor: 5000 },
  { keyword: "hr software", avg_monthly_searches: "10K-100K", competition: "Medium", volume_anchor: 50000 },
  { keyword: "email marketing software", avg_monthly_searches: "10K-100K", competition: "Low", volume_anchor: 50000 },
];

function cleanAiJson(raw: string): string {
  return raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();
}

async function callLLM(
  apiKey: string,
  model: string,
  supabaseUrl: string,
  systemPrompt: string,
  userMessage: string,
  opts: { temperature?: number; maxTokens?: number; title?: string } = {}
): Promise<{ content: string; error?: string }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": supabaseUrl,
      "X-Title": opts.title || "AstroGTM Keyword Pipeline",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 8000,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { content: "", error: `AI API error (${res.status}): ${errText}` };
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  return { content: cleanAiJson(raw) };
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
      if (!OPENROUTER_API_KEY) {
        return jsonResponse({ error: "OPENROUTER_API_KEY not configured" }, 500);
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["ai_model_keyword_research"]);

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
          max_tokens: Math.max(8000, pagesCount * 200 + keywordsCount * 50 + themesCount * 500),
          response_format: { type: "json_object" },
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return jsonResponse({ error: `AI API error (${aiRes.status})`, details: errText }, 502);
      }

      const aiData = await aiRes.json();
      let rawContent = aiData.choices?.[0]?.message?.content || "";
      rawContent = cleanAiJson(rawContent);

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
      if (!OPENROUTER_API_KEY) {
        return jsonResponse({ error: "OPENROUTER_API_KEY not configured" }, 500);
      }

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
        .in("key", ["ai_model_keyword_research", "ai_keyword_volume_prompt"]);

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

      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SUPABASE_URL,
          "X-Title": "AstroGTM Volume Enrichment",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0,
          max_tokens: pages.length * 100 + 500,
          response_format: { type: "json_object" },
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return jsonResponse({ error: `AI API error (${aiRes.status})`, details: errText }, 502);
      }

      const aiData = await aiRes.json();
      let rawContent = aiData.choices?.[0]?.message?.content || "";
      rawContent = cleanAiJson(rawContent);

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
    // ACTION: generate-opportunities (SINGLE LLM CALL)
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
        .in("key", ["ai_model_keyword_research"]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }
      const model = settingsMap["ai_model_keyword_research"] || "openai/gpt-oss-120b";
      const countryVal = country_code || "us";
      const industry = brand_intelligence.brand?.category || brand_intelligence.brand?.industry || "general";

      const systemPrompt = `You are an expert SEO keyword researcher and opportunity analyst. You generate keyword opportunities for a brand based on brand intelligence, SERP data, competitor content, and a keyword volume reference database.

You produce 25-30 keyword opportunities in a single pass.

═══════════════════════════════════════════════
VOLUME RULES (CRITICAL — READ CAREFULLY)
═══════════════════════════════════════════════

You are NOT estimating search volume from intuition.
You are MAPPING to Google Keyword Planner reference data provided in keyword_reference_context.

For EVERY keyword you generate:
1. Find the closest matching row(s) in keyword_reference_context.
2. Use those rows as volume anchors.
3. Adjust DOWN for specificity/modifiers.
4. Report which reference keyword you matched.

MODIFIER DECAY MULTIPLIERS (apply to anchor volume):
- family/personal: x0.5
- secure/encrypted: x0.7
- free: x0.5
- best: x0.7
- online: x0.8
- comparison/vs: x0.3
- custom: x0.2
- country/location (india, uk, usa, etc): x0.5
- review/reviews: x0.4
- alternative/alternatives: x0.3
- pricing/cost: x0.4
- how to: x0.6
- supplier: x0.3

LONG TAIL RULE:
Longer keyword volume MUST be <= parent keyword volume.
More specific = lower volume. Always.

NO MATCH RULE:
If no reference keyword is even loosely similar, use these fallbacks:
- generic consumer keyword: 100
- niche consumer: 50
- niche SaaS: 20
- B2B: 10

HARD CAP:
NEVER output volume > 500 unless you matched a reference keyword with volume_anchor > 500.
Examples that are FORBIDDEN:
- "family digital vault" → 1000 (NO reference supports this)
- "secure family cloud storage" → 1200 (NO reference supports this)

EXAMPLES:
Reference: "document organizer" = 500
Candidate: "family document organizer"
Correct volume: 250 (500 × 0.5)

Reference: "gift registry" = 500
Candidate: "free wedding gift registry india"
Correct volume: 125 (500 × 0.5 × 0.5) → round to ~100-150

Reference: "ai sales agent" = 500
Candidate: "ai sales agent"
Correct volume: 500 (exact match)

No reference match: "how to create registry on gifaa"
Correct volume: 10 (branded/navigational, no reference)

═══════════════════════════════════════════════
OTHER FIELDS
═══════════════════════════════════════════════

For each keyword also provide:
- difficulty: 0-100 (how hard to rank; consider domain authority of typical rankers)
- intent: "informational" | "commercial" | "transactional" | "navigational"
- funnel: "top" | "middle" | "bottom"
- relevance: 0-100 (how relevant to THIS brand's audience, products, and pain points)
- score: 0-100 opportunity score = weighted average of (volume_normalized × 0.25) + ((100 - difficulty) × 0.25) + (intent_score × 0.25) + (relevance × 0.25)
  where intent_score: transactional=100, commercial=80, informational=40, navigational=20
  where volume_normalized: 500+=60, 200-499=45, 100-199=35, 50-99=25, 10-49=15, 0-9=5

═══════════════════════════════════════════════
KEYWORD SELECTION RULES
═══════════════════════════════════════════════

- Focus on GAPS the brand is NOT ranking for but SHOULD be
- Include a mix of intent types and funnel stages
- Keywords must be specific, actionable phrases (2-5 words)
- No duplicate or near-duplicate keywords
- Each keyword targets a genuinely different search intent

═══════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════

Return ONLY valid JSON:
{
  "opportunities": [
    {
      "keyword": "specific search phrase",
      "volume": 250,
      "matched_reference_keyword": "reference keyword used as anchor",
      "difficulty": 45,
      "intent": "commercial",
      "funnel": "middle",
      "relevance": 80,
      "score": 65
    }
  ]
}

Generate EXACTLY 30 opportunities, sorted by score descending.`;

      let userMessage = `## Brand Intelligence\n${JSON.stringify(brand_intelligence, null, 2)}\n\n`;

      userMessage += `## Keyword Reference Context (Google Keyword Planner data — source of truth)\n${JSON.stringify(KEYWORD_VOLUME_REFERENCE, null, 2)}\n\n`;

      userMessage += `## Country: ${countryVal}\n## Industry: ${industry}\n\n`;

      if (serp_results && serp_results.length > 0) {
        userMessage += `## SERP Results\n${JSON.stringify(serp_results.slice(0, 20), null, 2)}\n\n`;
      }
      if (scraped_content && scraped_content.length > 0) {
        userMessage += `## Competitor Content\n`;
        for (const page of scraped_content.slice(0, 5)) {
          if (page.content) userMessage += `### ${page.url}\n${page.content.slice(0, 4000)}\n\n`;
        }
      }

      const aiRes = await callLLM(OPENROUTER_API_KEY, model, SUPABASE_URL, systemPrompt, userMessage, {
        temperature: 0.5,
        maxTokens: 8000,
        title: "AstroGTM Keyword Opportunities",
      });

      if (aiRes.error) return jsonResponse({ error: aiRes.error }, 502);

      let parsed: { opportunities: { keyword: string; volume: number; matched_reference_keyword: string; difficulty: number; intent: string; funnel: string; relevance: number; score: number }[] };
      try {
        parsed = JSON.parse(aiRes.content);
      } catch {
        return jsonResponse({ error: "Failed to parse AI response", raw: aiRes.content.slice(0, 500) }, 500);
      }

      if (!parsed.opportunities || parsed.opportunities.length === 0) {
        return jsonResponse({ error: "No opportunities generated" }, 500);
      }

      const opportunities = parsed.opportunities.slice(0, 30).map(o => ({
        keyword: o.keyword,
        search_volume: o.volume,
        matched_reference_keyword: o.matched_reference_keyword || "",
        difficulty: o.difficulty,
        intent: o.intent,
        funnel: o.funnel,
        relevance: o.relevance,
        opportunity_score: o.score,
      }));

      const { data: saved, error: saveError } = await supabase
        .from("gifaa_keyword_opportunities")
        .insert({
          tenant_id,
          brand_intelligence_id: brand_intelligence.id || null,
          keywords: opportunities,
          generation_params: {
            country_code: countryVal,
            industry,
            pipeline_version: 3,
            final_count: opportunities.length,
          },
          country_code: countryVal,
        })
        .select()
        .single();

      if (saveError) {
        return jsonResponse({ error: "Failed to save opportunities", details: saveError.message, data: { keywords: opportunities } }, 500);
      }

      return jsonResponse({ success: true, data: saved });
    }

    // ─── ACTION: generate-pages-for-keyword ─────────────────────
    if (action === "generate-pages-for-keyword") {
      if (!OPENROUTER_API_KEY) {
        return jsonResponse({ error: "OPENROUTER_API_KEY not configured" }, 500);
      }

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
        .in("key", ["ai_model_keyword_research"]);

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

      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SUPABASE_URL,
          "X-Title": "AstroGTM Page Ideas",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return jsonResponse({ error: `AI API error (${aiRes.status})`, details: errText }, 502);
      }

      const aiData = await aiRes.json();
      let rawContent = aiData.choices?.[0]?.message?.content || "";
      rawContent = cleanAiJson(rawContent);

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
