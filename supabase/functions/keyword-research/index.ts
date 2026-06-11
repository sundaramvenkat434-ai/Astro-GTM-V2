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
          headers: {
            "Content-Type": "application/json",
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
        // Nested format: each item is a SERP page with organicResults array
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
          // Flat format: each item IS a single organic result
          organicResults.push({
            rank: item.position || item.rank || organicResults.length + 1,
            title: item.title || "",
            url: item.url || item.link || "",
            description: item.description || item.snippet || "",
          });
        }
      }

      // Return debug info if no results found
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

      // Load custom prompt from admin settings if available
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
- Do NOT generate fewer items than requested. The user explicitly chose these numbers.
- If the ratio seems unusual (e.g. 50 pages across 3 themes), distribute them proportionally — ~17 pages per theme. Do NOT reduce the total count.

PAGE TITLE UNIQUENESS RULES:
- Every single page title MUST be completely distinct and unique
- No two page titles may cover the same topic from a slightly different angle
- No titles should be synonyms or paraphrases of each other (e.g. "Best X for Y" and "Top X for Y" are too similar)
- Each page must target a genuinely different search intent or user need
- Verify uniqueness: if you removed any page title, would the remaining set lose coverage of a topic? If not, it's redundant.

CRITICAL REQUIREMENTS:
- Opportunity scores must be 0-100 based on: estimated search volume, competition difficulty from SERP analysis, and brand relevance
- Keywords must be SPECIFIC and ACTIONABLE - no vague single-word terms. Long-tail is preferred.
- Every keyword should map to clear search intent (informational, transactional, navigational, or commercial)
- Page titles must be SEO-optimized, compelling, and distinct from each other
- Focus on GAPS and OPPORTUNITIES the brand is NOT currently ranking for
- Use the scraped competitor content to understand what topics are already well-covered vs. where there are gaps
- If brand intelligence is provided, align themes with the brand's audience segments, pain points, and value proposition
- Prioritize keywords where the brand has a realistic chance of ranking (avoid head terms dominated by massive sites)`;

      let userMessage = "";

      userMessage += `## STRICT OUTPUT CONSTRAINTS (non-negotiable)\n`;
      userMessage += `You MUST return EXACTLY:\n`;
      userMessage += `- ${themesCount} themes (no more, no less)\n`;
      userMessage += `- ${keywordsCount} total keywords across ALL themes combined (not per theme)\n`;
      userMessage += `- ${pagesCount} total suggested pages across ALL themes combined (not per theme)\n`;
      userMessage += `Count carefully before returning. If your JSON has more or fewer items than specified above, regenerate.\n\n`;

      if (brand_intelligence) {
        userMessage += `## Brand Intelligence (CONTEXT ONLY — do NOT copy keywords from here)\n`;
        userMessage += `The following brand profile is provided as BACKGROUND CONTEXT to help you understand the brand's identity, audience, and market positioning. Use it to inform your strategy direction ONLY.\n`;
        userMessage += `DO NOT copy, reuse, or include keywords listed in this section in your output. Generate FRESH, NEW keywords based on your analysis.\n\n`;
        userMessage += JSON.stringify(brand_intelligence, null, 2);
        userMessage += "\n\n";
      }

      userMessage += `## Google SERP Results for "${primary_search_term}"\n`;
      userMessage += `These are the actual Google rankings. Use position data to assess competition difficulty.\n\n`;
      userMessage += JSON.stringify(serp_results, null, 2);
      userMessage += "\n\n";

      if (scraped_content && scraped_content.length > 0) {
        userMessage += `## Scraped Competitor Page Content\n`;
        userMessage += `These are the actual page contents from top-ranking competitor sites. Analyze their keyword usage, content gaps, and topical coverage to identify opportunities.\n\n`;
        for (const page of scraped_content) {
          if (page.content && page.content.length > 0) {
            userMessage += `### ${page.url}\n${page.content.slice(0, 5000)}\n\n`;
          }
        }
      }

      if (additional_instructions) {
        userMessage += `\n## User Instructions & Keyword Focus\n${additional_instructions}\n`;
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

      // Load model + prompt from admin_settings — warn if missing
      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["ai_model_keyword_research", "ai_keyword_volume_prompt"]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }

      if (!settingsMap["ai_model_keyword_research"]) {
        console.warn("[enrich-volume] ai_model_keyword_research not set in admin_settings, using default");
      }
      if (!settingsMap["ai_keyword_volume_prompt"]) {
        console.warn("[enrich-volume] ai_keyword_volume_prompt not set in admin_settings, using default");
      }

      const model = settingsMap["ai_model_keyword_research"] || "openai/gpt-4o-mini";

      // Default prompt — concrete calibration anchors keep volume estimates realistic.
      // Priority for primary_keyword: existing_keyword > slug words > page title.
      const defaultSystemPrompt = `You are an SEO keyword research expert. Given a list of pages, identify the best primary search keyword for each page and estimate its monthly search volume.

KEYWORD SELECTION — priority order:
1. Start with the "existing_keyword" field — this is the target keyword already chosen for the page. If it is 2-3 words and sounds like a real search query, use it as-is.
2. If existing_keyword is too long (>3 words) or is a sentence fragment, extract its 2-3 most important words.
3. Only fall back to deriving from the page title or slug if existing_keyword is blank.

KEYWORD RULES:
- primary_keyword must be EXACTLY 2-3 words (never 1 word, never 4+ words)
- Must be lowercase
- Must sound like something a real person types into Google — not a marketing headline
- Strip filler words: guide, tips, ultimate, complete, how, to, best, top, for
- WRONG: "family financial organization tips" → RIGHT: "family budget app"
- WRONG: "how to organize family finances" → RIGHT: "family finance tracker"
- WRONG: "wedding gift registry ideas" → RIGHT: "gift registry"

VOLUME RULES:
- monthly_search_volume must be an exact integer representing realistic searches/month for country: {{country}}
- Use relative sizing across all pages in this batch — pages on similar topics should have consistent relative volumes
- Do NOT invent large numbers. Be conservative. Most niche long-tail pages get 100-2000/month.
- confidence must be 0-100 (how certain you are about the volume estimate)

Return ONLY valid JSON, no markdown, no explanation:
{
  "results": [
    {
      "slug": "exact-slug-from-input",
      "primary_keyword": "2-3 word phrase",
      "monthly_search_volume": 1200,
      "confidence": 65
    }
  ]
}`;

      let systemPrompt = settingsMap["ai_keyword_volume_prompt"] || defaultSystemPrompt;
      // Replace template variables in either the admin prompt or the default
      const countryVal = country || "us";
      const industryVal = industry || "general";
      systemPrompt = systemPrompt
        .replace(/\{\{country\}\}/g, countryVal)
        .replace(/\{\{industry\}\}/g, industryVal)
        .replace(/\{\{keywords_json\}\}/g, JSON.stringify(pages, null, 2));

      const userMessage = `Country: ${countryVal}
Industry: ${industryVal}

Pages to analyze:
${JSON.stringify(pages, null, 2)}`;

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
      rawContent = rawContent.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();

      let parsed: { results: { slug: string; primary_keyword: string; monthly_search_volume: number; confidence: number }[] };
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        return jsonResponse({ error: "Failed to parse AI response", raw: rawContent }, 500);
      }

      // Build a set of valid input slugs for matching
      const validSlugs = new Set(pages.map((p) => p.slug));

      // Filler words to strip during post-processing
      const FILLER = new Set(["guide", "tips", "ultimate", "complete", "how", "to", "best", "top", "for", "a", "an", "the", "and", "or", "of", "in", "on", "with"]);

      function sanitizeKeyword(raw: string): string | null {
        if (!raw || typeof raw !== "string") return null;
        // Lowercase, remove punctuation
        let kw = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
        const words = kw.split(" ").filter((w) => w.length > 1);
        // Remove leading/trailing filler
        while (words.length > 0 && FILLER.has(words[0])) words.shift();
        while (words.length > 0 && FILLER.has(words[words.length - 1])) words.pop();
        if (words.length < 2) return null;
        // Enforce 2-3 word limit
        kw = words.slice(0, 3).join(" ");
        return kw;
      }

      // Build volumes map keyed by slug with full validation
      const volumesMap: Record<string, { primary_keyword: string; monthly_search_volume: number; confidence: number }> = {};
      for (const item of parsed.results || []) {
        // Skip slugs not in the original input
        if (!item.slug || !validSlugs.has(item.slug)) continue;

        const kw = sanitizeKeyword(item.primary_keyword);
        if (!kw) {
          console.warn(`[enrich-volume] Skipping slug "${item.slug}" — invalid primary_keyword: "${item.primary_keyword}"`);
          continue;
        }

        const volume = typeof item.monthly_search_volume === "number" ? Math.round(item.monthly_search_volume) : null;
        if (volume === null || volume < 0) {
          console.warn(`[enrich-volume] Skipping slug "${item.slug}" — invalid volume: ${item.monthly_search_volume}`);
          continue;
        }

        const confidence = typeof item.confidence === "number"
          ? Math.min(100, Math.max(0, Math.round(item.confidence)))
          : 50;

        volumesMap[item.slug] = {
          primary_keyword: kw,
          monthly_search_volume: volume,
          confidence,
        };
      }

      // Persist to database
      const { error: updateError } = await supabase
        .from("gifaa_keyword_strategies")
        .update({ page_search_volumes: volumesMap })
        .eq("id", strategy_id);

      if (updateError) {
        return jsonResponse({ error: "Failed to save volumes", details: updateError.message }, 500);
      }

      return jsonResponse({ success: true, data: volumesMap });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ error: (err as Error).message || "unknown error" }, 500);
  }
});
