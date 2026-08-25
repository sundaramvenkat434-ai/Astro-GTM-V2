import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { Readability } from "npm:@mozilla/readability@0.5.0";
import { parseHTML } from "npm:linkedom@0.16.11";
import { callAI, getProvider } from "../_shared/ai-router.ts";

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
  "generate-search-queries": { maxCount: 10, windowSeconds: 3600 },
  "run-understander": { maxCount: 10, windowSeconds: 3600 },
  "estimate-volume": { maxCount: 10, windowSeconds: 3600 },
};

const SETTING_KEY_TO_ACTION: Record<string, string> = {
  free_audit_create_limit: "create",
  free_audit_analyze_limit: "analyze-brand",
  free_audit_serp_limit: "search-serp",
  free_audit_scrape_limit: "scrape-competitors",
  free_audit_search_queries_limit: "generate-search-queries",
  free_audit_understander_limit: "run-understander",
  free_audit_volume_limit: "estimate-volume",
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
      "free_audit_search_queries_limit",
      "free_audit_understander_limit",
      "free_audit_volume_limit",
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

const FALLBACK_UNDERSTANDER_PROMPT = `You are an expert business analyst. Analyse the provided website content and identify the business as accurately as possible.

Return concise information for:
- about_brand: what the brand or business does
- primary_product_or_service: the main product or service it offers
- geographies: the countries, regions, or markets it appears to serve
- target_audience: the main people, customers, or businesses it serves

Rules:
- Base every answer only on the provided website content.
- Do not invent information that is not supported by the content.
- Keep each field concise and specific.
- Return ONLY valid JSON. No markdown, explanations, reasoning, or code fences.

Return exactly this JSON shape:
{
  "about_brand": "<concise description of what the brand does>",
  "primary_product_or_service": "<main product or service>",
  "geographies": "<main geography or market, or Unknown if not clear>",
  "target_audience": "<main target audience>"
}`;

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

const FALLBACK_KEYWORD_VOLUME_PROMPT = `You are an expert SEO keyword volume analyst. You receive a list of search queries. For each query, classify it into a semantic cluster and assign numeric factors that will be used to deterministically estimate monthly search volume.

Rules:
- Return ONLY valid JSON. No markdown, no code fences, no reasoning, no explanations, no step-by-step analysis.
- Do not return estimated_volume, cluster_volume, or any calculated volume. Do not return calculations or formulas.
- Classify each query into exactly one cluster. A cluster is a group of semantically related queries that share the same search demand profile.
- Every input query must appear exactly once in the keywords array. Do not omit any query and do not duplicate any query.
- Assign a base_demand value to each CLUSTER (not each keyword). All keywords in the same cluster share the same base_demand. Use exactly one of: 20000, 10000, 5000, 1000, 300.
- Assign cluster-level factors to each CLUSTER only: search_adoption (0.01–1.0), intent (0.1–1.0), competition (0.1–1.0), trend (0.5–2.0). Do NOT repeat these factors on individual keywords.
- For each keyword that is NOT a cluster head, assign ONLY these four factors: semantic_similarity (0.1–1.0), specificity (0.1–1.0), child_intent (0.1–1.0), modifier (0.1–1.0).
- For each keyword that IS a cluster head, assign an empty factors object {}.
- For each keyword, assign a confidence score: "High", "Medium", or "Low".

Return ONLY this JSON shape:
{
  "clusters": [
    {
      "id": 1,
      "head_keyword": "<the query that best represents this cluster>",
      "base_demand": 20000,
      "search_adoption": 0.8,
      "intent": 0.9,
      "competition": 0.7,
      "trend": 1.2
    }
  ],
  "keywords": [
    {
      "query": "<the search query>",
      "cluster_id": 1,
      "is_cluster_head": true,
      "confidence": "High",
      "factors": {}
    },
    {
      "query": "<another search query>",
      "cluster_id": 1,
      "is_cluster_head": false,
      "confidence": "Medium",
      "factors": {
        "semantic_similarity": 0.85,
        "specificity": 0.6,
        "child_intent": 0.8,
        "modifier": 0.9
      }
    }
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

function getMetaContent(document: Document, selector: string): string {
  try {
    const el = document.querySelector(selector);
    const val = el?.getAttribute("content");
    return val ? val.trim() : "";
  } catch { return ""; }
}

function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

interface ParsedJsonLd {
  type?: string;
  name?: string;
  description?: string;
  "@type"?: string | string[];
  "@graph"?: unknown[];
  mainEntity?: unknown | unknown[];
  [key: string]: unknown;
}

function flattenJsonLd(obj: unknown): ParsedJsonLd[] {
  if (Array.isArray(obj)) {
    return obj.flatMap(flattenJsonLd);
  }
  if (obj && typeof obj === "object") {
    const o = obj as ParsedJsonLd;
    if (Array.isArray(o["@graph"])) {
      return o["@graph"].flatMap(flattenJsonLd);
    }
    return [o];
  }
  return [];
}

function getTypeStr(entry: ParsedJsonLd): string {
  const t = entry["@type"] || entry.type;
  if (typeof t === "string") return t;
  if (Array.isArray(t)) return t.join(", ");
  return "";
}

function extractJsonLdInfo(document: Document): { orgLines: string[]; faqLines: string[] } {
  const orgLines: string[] = [];
  const faqLines: string[] = [];

  let scripts: NodeListOf<HTMLScriptElement> | HTMLScriptElement[] = [];
  try {
    scripts = document.querySelectorAll('script[type="application/ld+json"]');
  } catch { /* linkedom fallback */ }

  if (!scripts || (scripts as HTMLScriptElement[]).length === 0) {
    const rawMatches = document.innerHTML?.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const raw of rawMatches) {
      const contentMatch = raw.match(/>([\s\S]*?)<\/script>/);
      if (contentMatch) {
        try {
          const parsed = JSON.parse(contentMatch[1].trim());
          processJsonLdEntries(flattenJsonLd(parsed), orgLines, faqLines);
        } catch { /* skip unparseable */ }
      }
    }
    return { orgLines, faqLines };
  }

  for (const script of scripts as HTMLScriptElement[]) {
    const raw = script.textContent || script.text || "";
    if (!raw.trim()) continue;
    try {
      const parsed = JSON.parse(raw.trim());
      processJsonLdEntries(flattenJsonLd(parsed), orgLines, faqLines);
    } catch { /* skip unparseable */ }
  }

  return { orgLines, faqLines };
}

function processJsonLdEntries(entries: ParsedJsonLd[], orgLines: string[], faqLines: string[]): void {
  for (const entry of entries) {
    const typeStr = getTypeStr(entry);
    const lowerType = typeStr.toLowerCase();

    if (lowerType.includes("faqpage")) {
      const mainEntity = entry.mainEntity;
      const questions = Array.isArray(mainEntity) ? mainEntity : mainEntity ? [mainEntity] : [];
      for (const q of questions) {
        if (q && typeof q === "object") {
          const qObj = q as Record<string, unknown>;
          const qName = (qObj.name as string || "").trim();
          const acceptedAnswer = qObj.acceptedAnswer as Record<string, unknown> | undefined;
          const aText = acceptedAnswer ? ((acceptedAnswer.text as string) || "").trim() : "";
          if (qName) {
            faqLines.push(`Q: ${qName}`);
            if (aText) faqLines.push(`A: ${aText}`);
          }
        }
      }
      continue;
    }

    const isOrgType =
      lowerType.includes("organization") ||
      lowerType.includes("localbusiness") ||
      lowerType.includes("website") ||
      lowerType.includes("softwareapplication") ||
      lowerType.includes("product") ||
      lowerType.includes("service") ||
      lowerType.includes("brand");

    if (isOrgType && entry.name) {
      let line = `Organization: ${entry.name.trim()}`;
      if (entry.description) {
        line += ` — ${entry.description.trim()}`;
      }
      orgLines.push(line);
    }
  }
}

function extractTextFromHtml(html: string, sourceUrl: string): string {
  const seen = new Set<string>();
  function dedupe(text: string): boolean {
    const key = normalizeText(text);
    if (!key || key.length < 10) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }

  const sections: string[] = [];

  try {
    const parsed = parseHTML(html);
    const document = parsed.document;

    // ── Head metadata ──────────────────────────────────────
    let title = "";
    try { title = (document.querySelector("title")?.textContent || "").trim(); } catch { /* ignore */ }
    if (title && dedupe(title)) {
      sections.push(`Title: ${title}`);
    }

    const metaDesc = getMetaContent(document, 'meta[name="description"]');
    if (metaDesc && dedupe(metaDesc)) {
      sections.push(`Meta Description: ${metaDesc}`);
    }

    const ogTitle = getMetaContent(document, 'meta[property="og:title"]');
    const ogDesc = getMetaContent(document, 'meta[property="og:description"]');
    const ogSiteName = getMetaContent(document, 'meta[property="og:site_name"]');
    const ogType = getMetaContent(document, 'meta[property="og:type"]');
    const ogLines: string[] = [];
    if (ogTitle && dedupe(ogTitle)) ogLines.push(`Title: ${ogTitle}`);
    if (ogDesc && dedupe(ogDesc)) ogLines.push(`Description: ${ogDesc}`);
    if (ogSiteName && dedupe(ogSiteName)) ogLines.push(`Site Name: ${ogSiteName}`);
    if (ogType && dedupe(ogType)) ogLines.push(`Type: ${ogType}`);
    if (ogLines.length > 0) {
      sections.push(`Open Graph:\n${ogLines.join("\n")}`);
    }

    const twTitle = getMetaContent(document, 'meta[name="twitter:title"]');
    const twDesc = getMetaContent(document, 'meta[name="twitter:description"]');
    const twCard = getMetaContent(document, 'meta[name="twitter:card"]');
    const twLines: string[] = [];
    if (twTitle && dedupe(twTitle)) twLines.push(`Title: ${twTitle}`);
    if (twDesc && dedupe(twDesc)) twLines.push(`Description: ${twDesc}`);
    if (twCard && dedupe(twCard)) twLines.push(`Card: ${twCard}`);
    if (twLines.length > 0) {
      sections.push(`Twitter Card:\n${twLines.join("\n")}`);
    }

    // ── JSON-LD structured data ────────────────────────────
    const { orgLines, faqLines } = extractJsonLdInfo(document);
    const dedupedOrg = orgLines.filter(dedupe);
    if (dedupedOrg.length > 0) {
      sections.push(`Structured Data:\n${dedupedOrg.join("\n")}`);
    }
    const dedupedFaq = faqLines.filter(dedupe);
    if (dedupedFaq.length > 0) {
      sections.push(`FAQ:\n${dedupedFaq.join("\n")}`);
    }

    // ── Body content via Readability ───────────────────────
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
        const bodyText = readabilityResult.textContent
          .replace(/\s+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        if (bodyText && dedupe(bodyText)) {
          sections.push(`Page Content:\n${bodyText}`);
        }
      }
    } catch { /* fall through */ }
  } catch { /* fall through */ }

  if (sections.length > 0) {
    return sections.join("\n\n").slice(0, 30000);
  }

  // ── Final fallback: strip tags ──────────────────────────
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
          "ai_provider_brand_analyzer_prompt",
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
      const provider = getProvider(settingsMap, "brand_analyzer_prompt");

      let aiResult;
      try {
        aiResult = await callAI({
          provider,
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Analyze the following website content and extract brand intelligence:\n\n${contentToAnalyze}` },
          ],
          temperature: 0.7,
          maxTokens,
          responseFormat: { type: "json_object" },
          title: "AstroRank Free Audit",
        });
      } catch (apiErr: any) {
        await supabase
          .from("free_audits")
          .update({ status: "error", error_message: `AI request failed: ${String(apiErr?.message || apiErr)}`, updated_at: new Date().toISOString() })
          .eq("id", audit_id);
        return jsonResponse({ error: "Failed to reach the AI service." }, 502);
      }

      const rawContent: string = aiResult.content || "";

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
    // ACTION: generate-search-queries — read understander output, call OpenRouter for 10 search queries
    // ═══════════════════════════════════════════════════════════
    if (action === "generate-search-queries") {
      const rl = await checkRateLimit(supabase, clientIP, "generate-search-queries", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many analysis requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
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

      const understanderAnalysis = audit.understander_analysis;

      // Build brand context from the new structured understander object
      let brandContext = "";
      if (understanderAnalysis && typeof understanderAnalysis === "object") {
        const ua = understanderAnalysis as Record<string, unknown>;
        const fields = [
          ua.about_brand ? `About the brand: ${ua.about_brand}` : "",
          ua.primary_product_or_service ? `Primary product or service: ${ua.primary_product_or_service}` : "",
          ua.geographies ? `Geographies: ${ua.geographies}` : "",
          ua.target_audience ? `Target audience: ${ua.target_audience}` : "",
        ].filter(Boolean);
        brandContext = fields.join("\n");
      } else if (typeof understanderAnalysis === "string") {
        brandContext = understanderAnalysis;
      }

      // Fallback: if no structured fields found, try old business_understanding
      if (!brandContext) {
        const oldUnderstanding =
          understanderAnalysis &&
          typeof understanderAnalysis === "object" &&
          typeof (understanderAnalysis as Record<string, unknown>).business_understanding === "string"
            ? (understanderAnalysis as Record<string, unknown>).business_understanding as string
            : "";
        if (oldUnderstanding && oldUnderstanding.trim().length >= 20) {
          brandContext = oldUnderstanding;
        }
      }

      if (!brandContext || brandContext.trim().length < 20) {
        return jsonResponse({ error: "No understander analysis found. Run the understander first." }, 400);
      }

      // Step 1: Load prompt and model settings
      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", [
          "free_audit_search_queries_prompt",
          "ai_model_brand_analyzer",
          "ai_max_tokens_free_audit_search_queries_prompt",
          "ai_provider_free_audit_search_queries_prompt",
        ]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }

      const systemPrompt =
        settingsMap["free_audit_search_queries_prompt"] || FALLBACK_SEARCH_QUERIES_PROMPT;
      const model =
        settingsMap["ai_model_brand_analyzer"] || "openai/gpt-oss-120b:free";
      const maxTokens = parseInt(settingsMap["ai_max_tokens_free_audit_search_queries_prompt"]) || 4000;

      const userMessageContent = `Based on the following brand profile, generate 10 realistic search queries that potential customers would use to find this business:\n\n${brandContext}`;

      const provider = getProvider(settingsMap, "free_audit_search_queries_prompt");

      let aiResult;
      try {
        aiResult = await callAI({
          provider,
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessageContent },
          ],
          temperature: 0.7,
          maxTokens,
          responseFormat: { type: "json_object" },
          title: "AstroRank Free Audit",
        });
      } catch {
        return jsonResponse({ error: "Failed to reach the AI service." }, 502);
      }

      const rawContent: string = aiResult.content || "";

      // Save raw I/O regardless of whether parsing succeeds
      const rawInput = { model, system_prompt: systemPrompt, user_message: userMessageContent };
      const rawOutput = aiResult.raw;

      if (!rawContent) {
        await supabase
          .from("free_audits")
          .update({
            search_queries_raw_input: rawInput,
            search_queries_raw_output: rawOutput,
            updated_at: new Date().toISOString(),
          })
          .eq("id", audit_id);
        return jsonResponse({ error: "AI returned an empty response." }, 502);
      }

      // Step 5: Parse JSON
      const extractionResult = extractJsonFromContent(rawContent);
      if (!extractionResult.ok) {
        await supabase
          .from("free_audits")
          .update({
            search_queries_raw_input: rawInput,
            search_queries_raw_output: rawOutput,
            updated_at: new Date().toISOString(),
          })
          .eq("id", audit_id);
        return jsonResponse({ error: "Failed to parse AI response as JSON." }, 502);
      }

      const parsed = extractionResult.data as Record<string, unknown>;
      const queries = Array.isArray(parsed.search_queries) ? parsed.search_queries.filter((q: unknown) => typeof q === "string") : [];

      // Step 6: Save to database
      const { data: updated, error: saveError } = await supabase
        .from("free_audits")
        .update({
          search_queries: queries,
          search_queries_raw_input: rawInput,
          search_queries_raw_output: rawOutput,
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

    // ═══════════════════════════════════════════════════════════
    // ACTION: scrape-website — fetch URL, extract clean text, save to scraped_content
    // ═══════════════════════════════════════════════════════════
    if (action === "scrape-website") {
      const rl = await checkRateLimit(supabase, clientIP, "analyze-brand", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
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

      const fetchResult = await fetchWebsiteContent(sourceUrl);
      if (!fetchResult.ok) {
        return jsonResponse({ error: fetchResult.error.includes("HTTP") ? `Website returned an error (${fetchResult.error}).` : "Failed to connect to the website. The URL may be unreachable." }, 400);
      }

      const contentToAnalyze = extractTextFromHtml(fetchResult.html, sourceUrl);

      if (!contentToAnalyze || contentToAnalyze.length < 50) {
        return jsonResponse({ error: "Insufficient content extracted. The page may be empty or require JavaScript." }, 400);
      }

      const { data: updated, error: saveError } = await supabase
        .from("free_audits")
        .update({
          scraped_content: contentToAnalyze,
          updated_at: new Date().toISOString(),
        })
        .eq("id", audit_id)
        .select()
        .single();

      if (saveError) {
        return jsonResponse({ error: "Failed to save scraped content", detail: saveError.message }, 500);
      }

      return jsonResponse({ success: true, data: updated });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: run-understander — read saved scraped_content, call AI, save to understander_analysis
    // ═══════════════════════════════════════════════════════════
    if (action === "run-understander") {
      const rl = await checkRateLimit(supabase, clientIP, "run-understander", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
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

      const summary: string | undefined = body.summary;
      const scrapedContent = summary && summary.length >= 50
        ? summary
        : audit.scraped_content;
      if (!scrapedContent || scrapedContent.length < 50) {
        return jsonResponse({ error: "No scraped content found. Run the scraper first." }, 400);
      }

      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", [
          "free_audit_understander_prompt",
          "ai_model_brand_analyzer",
          "ai_max_tokens_free_audit_understander_prompt",
          "ai_provider_free_audit_understander_prompt",
        ]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }

      const systemPrompt =
        settingsMap["free_audit_understander_prompt"] || FALLBACK_UNDERSTANDER_PROMPT;
      const model =
        settingsMap["ai_model_brand_analyzer"] || "openai/gpt-oss-120b:free";
      const maxTokens = parseInt(settingsMap["ai_max_tokens_free_audit_understander_prompt"]) || 4000;

      const userMessageContent = `Analyse the following website content and return a concise brand profile with these fields: about_brand, primary_product_or_service, geographies, target_audience.\n\n${scrapedContent}`;

      const provider = getProvider(settingsMap, "free_audit_understander_prompt");

      let aiResult;
      try {
        aiResult = await callAI({
          provider,
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessageContent },
          ],
          temperature: 0.7,
          maxTokens,
          responseFormat: { type: "json_object" },
          title: "AstroRank Free Audit",
        });
      } catch {
        return jsonResponse({ error: "Failed to reach the AI service." }, 502);
      }

      const rawContent: string = aiResult.content || "";

      if (!rawContent) {
        return jsonResponse({ error: "AI returned an empty response." }, 502);
      }

      const extractionResult = extractJsonFromContent(rawContent);
      if (!extractionResult.ok) {
        return jsonResponse({ error: "Failed to parse AI response as JSON." }, 502);
      }

      const parsed = extractionResult.data as Record<string, unknown>;

      const { data: updated, error: saveError } = await supabase
        .from("free_audits")
        .update({
          understander_analysis: parsed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", audit_id)
        .select()
        .single();

      if (saveError) {
        return jsonResponse({ error: "Failed to save understanding", detail: saveError.message }, 500);
      }

      return jsonResponse({ success: true, data: updated });
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION: estimate-volume — read search_queries, call AI for factors, deterministically calculate volumes
    // ═══════════════════════════════════════════════════════════
    if (action === "estimate-volume") {
      const rl = await checkRateLimit(supabase, clientIP, "estimate-volume", settings);
      if (!rl.allowed) {
        return jsonResponse({
          error: "Too many volume estimation requests. Please try again later.",
          rate_limited: true,
          reset_in_seconds: rl.resetIn,
        }, 429);
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

      const queries: string[] = Array.isArray(audit.search_queries) ? audit.search_queries.filter((q: unknown) => typeof q === "string" && q.trim()) : [];
      if (queries.length === 0) {
        return jsonResponse({ error: "No search queries found. Generate search queries first." }, 400);
      }

      // Load prompt and model settings
      const { data: settingsRows } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", [
          "free_audit_keyword_volume_prompt",
          "ai_model_free_audit_keyword_volume",
          "ai_max_tokens_free_audit_keyword_volume_prompt",
          "ai_provider_free_audit_keyword_volume_prompt",
        ]);

      const settingsMap: Record<string, string> = {};
      for (const row of settingsRows || []) {
        settingsMap[row.key] = row.value;
      }

      const systemPrompt =
        settingsMap["free_audit_keyword_volume_prompt"] || FALLBACK_KEYWORD_VOLUME_PROMPT;
      const model =
        settingsMap["ai_model_free_audit_keyword_volume"] || "openai/gpt-oss-120b:free";
      const maxTokens = parseInt(settingsMap["ai_max_tokens_free_audit_keyword_volume_prompt"]) || 4000;

      const userMessageContent = `Classify the following ${queries.length} search queries into semantic clusters and assign volume factors for each:\n\n${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;

      const provider = getProvider(settingsMap, "free_audit_keyword_volume_prompt");

      let aiResult;
      try {
        aiResult = await callAI({
          provider,
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessageContent },
          ],
          temperature: 0.3,
          maxTokens,
          responseFormat: { type: "json_object" },
          title: "AstroRank Free Audit",
        });
      } catch (apiErr: any) {
        const rawInput = { model, system_prompt: systemPrompt, user_message: userMessageContent };
        const rawOutput = { http_status: apiErr?.status || 500, error_body: String(apiErr?.message || apiErr).slice(0, 5000) };
        await supabase
          .from("free_audits")
          .update({
            keyword_volume_raw_input: rawInput,
            keyword_volume_raw_output: rawOutput,
            updated_at: new Date().toISOString(),
          })
          .eq("id", audit_id);
        return jsonResponse({ error: `AI service returned an error.` }, 502);
      }

      const rawContent: string = aiResult.content || "";

      const rawInput = { model, system_prompt: systemPrompt, user_message: userMessageContent };
      const rawOutput = aiResult.raw;

      if (!rawContent) {
        await supabase
          .from("free_audits")
          .update({
            keyword_volume_raw_input: rawInput,
            keyword_volume_raw_output: rawOutput,
            updated_at: new Date().toISOString(),
          })
          .eq("id", audit_id);
        return jsonResponse({ error: "AI returned an empty response." }, 502);
      }

      const extractionResult = extractJsonFromContent(rawContent);
      if (!extractionResult.ok) {
        await supabase
          .from("free_audits")
          .update({
            keyword_volume_raw_input: rawInput,
            keyword_volume_raw_output: rawOutput,
            updated_at: new Date().toISOString(),
          })
          .eq("id", audit_id);
        return jsonResponse({ error: "Failed to parse AI response as JSON." }, 502);
      }

      const parsed = extractionResult.data as Record<string, unknown>;

      // ── Strict validation of AI output before any calculation ──
      const VALID_BASE_DEMANDS = [20000, 10000, 5000, 1000, 300];
      const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

      const clustersRaw = Array.isArray(parsed.clusters) ? parsed.clusters as unknown[] : [];
      const keywordsRaw = Array.isArray(parsed.keywords) ? parsed.keywords as unknown[] : [];

      const validationError = async (msg: string): Promise<Response> => {
        await supabase
          .from("free_audits")
          .update({
            keyword_volume_raw_input: rawInput,
            keyword_volume_raw_output: rawOutput,
            updated_at: new Date().toISOString(),
          })
          .eq("id", audit_id);
        return jsonResponse({ error: `AI response validation failed: ${msg}` }, 422);
      };

      if (clustersRaw.length === 0) {
        return validationError("No clusters returned.");
      }
      if (keywordsRaw.length === 0) {
        return validationError("No keywords returned.");
      }

      // Build cluster map with strict validation
      const clusterMap = new Map<number, {
        id: number;
        head_keyword: string;
        base_demand: number;
        search_adoption: number;
        intent: number;
        competition: number;
        trend: number;
      }>();

      for (const c of clustersRaw) {
        if (!c || typeof c !== "object") {
          return validationError("Invalid cluster entry.");
        }
        const co = c as Record<string, unknown>;
        const id = typeof co.id === "number" ? co.id : parseInt(String(co.id), 10);
        if (!Number.isFinite(id)) {
          return validationError("Cluster missing valid id.");
        }
        const rawDemand = typeof co.base_demand === "number" ? co.base_demand : parseInt(String(co.base_demand), 10);
        if (!VALID_BASE_DEMANDS.includes(rawDemand)) {
          return validationError(`Cluster ${id} has invalid base_demand: ${rawDemand}.`);
        }
        if (typeof co.search_adoption !== "number" || typeof co.intent !== "number" || typeof co.competition !== "number" || typeof co.trend !== "number") {
          return validationError(`Cluster ${id} is missing one or more required factors (search_adoption, intent, competition, trend).`);
        }
        clusterMap.set(id, {
          id,
          head_keyword: typeof co.head_keyword === "string" ? co.head_keyword : "",
          base_demand: rawDemand,
          search_adoption: clamp(co.search_adoption, 0.01, 1.0),
          intent: clamp(co.intent, 0.1, 1.0),
          competition: clamp(co.competition, 0.1, 1.0),
          trend: clamp(co.trend, 0.5, 2.0),
        });
      }

      // Validate every input query appears exactly once
      const returnedQueries: string[] = [];
      for (let i = 0; i < keywordsRaw.length; i++) {
        const kw = keywordsRaw[i];
        if (!kw || typeof kw !== "object") {
          return validationError(`Keyword entry ${i} is not an object.`);
        }
        const kwObj = kw as Record<string, unknown>;
        const query = typeof kwObj.query === "string" ? kwObj.query : "";
        if (!query) {
          return validationError(`Keyword entry ${i} is missing a query string.`);
        }
        returnedQueries.push(query);
      }

      const querySet = new Set(returnedQueries);
      const inputSet = new Set(queries);

      if (returnedQueries.length !== querySet.size) {
        return validationError("Duplicate queries found in AI response.");
      }
      for (const q of queries) {
        if (!querySet.has(q)) {
          return validationError(`Missing keyword in AI response: "${q}".`);
        }
      }
      for (const q of returnedQueries) {
        if (!inputSet.has(q)) {
          return validationError(`Unexpected keyword in AI response: "${q}".`);
        }
      }

      // Validate each keyword references a valid cluster and has required child factors
      for (let i = 0; i < keywordsRaw.length; i++) {
        const kwObj = keywordsRaw[i] as Record<string, unknown>;
        const clusterId = typeof kwObj.cluster_id === "number" ? kwObj.cluster_id : parseInt(String(kwObj.cluster_id), 10);
        if (!Number.isFinite(clusterId) || !clusterMap.has(clusterId)) {
          return validationError(`Keyword "${kwObj.query}" references invalid cluster_id: ${kwObj.cluster_id}.`);
        }
        const isClusterHead = Boolean(kwObj.is_cluster_head);
        const factors = (kwObj.factors && typeof kwObj.factors === "object") ? kwObj.factors as Record<string, unknown> : {};
        if (!isClusterHead) {
          if (typeof factors.semantic_similarity !== "number" || typeof factors.specificity !== "number" || typeof factors.child_intent !== "number" || typeof factors.modifier !== "number") {
            return validationError(`Non-head keyword "${kwObj.query}" is missing required child factors (semantic_similarity, specificity, child_intent, modifier).`);
          }
        }
      }

      // ── All validation passed — calculate volumes ──────────────
      // Determine country factor deterministically from audit's existing geography field
      const brandAnalysis = audit.brand_analysis as Record<string, unknown> | null;
      const geography = brandAnalysis && typeof brandAnalysis === "object" && typeof (brandAnalysis as Record<string, unknown>).primary_geography === "string"
        ? (brandAnalysis as Record<string, unknown>).primary_geography as string
        : "";
      const countryFactor = geography && geography.trim().length > 0 ? 1.0 : 1.0;

      const estimates: Record<string, unknown>[] = [];

      for (const kw of keywordsRaw) {
        const kwObj = kw as Record<string, unknown>;
        const query = kwObj.query as string;

        const clusterId = typeof kwObj.cluster_id === "number" ? kwObj.cluster_id : parseInt(String(kwObj.cluster_id), 10);
        const cluster = clusterMap.get(clusterId)!;

        const isClusterHead = Boolean(kwObj.is_cluster_head);
        const confidence = kwObj.confidence === "High" || kwObj.confidence === "Medium" || kwObj.confidence === "Low"
          ? kwObj.confidence
          : "Medium";

        const factors = (kwObj.factors && typeof kwObj.factors === "object") ? kwObj.factors as Record<string, unknown> : {};

        const search_adoption = cluster.search_adoption;
        const intent = cluster.intent;
        const competition = cluster.competition;
        const trend = cluster.trend;

        // Cluster Volume = Base Demand × Search Adoption × Intent × Competition × Trend × Country Factor
        const clusterVolume = Math.round(
          cluster.base_demand * search_adoption * intent * competition * trend * countryFactor
        );

        let estimatedVolume: number;

        if (isClusterHead) {
          estimatedVolume = clusterVolume;
        } else {
          // Child Keyword Volume = Cluster Volume × Semantic Similarity × Specificity × Child Intent × Modifier
          const semantic_similarity = clamp(factors.semantic_similarity as number, 0.1, 1.0);
          const specificity = clamp(factors.specificity as number, 0.1, 1.0);
          const child_intent = clamp(factors.child_intent as number, 0.1, 1.0);
          const modifier = clamp(factors.modifier as number, 0.1, 1.0);

          estimatedVolume = Math.round(
            clusterVolume * semantic_similarity * specificity * child_intent * modifier
          );
        }

        estimates.push({
          query,
          cluster_id: clusterId,
          cluster_head: cluster.head_keyword,
          is_cluster_head: isClusterHead,
          estimated_monthly_volume: estimatedVolume,
          confidence,
          factors: {
            base_demand: cluster.base_demand,
            search_adoption,
            intent,
            competition,
            trend,
            country_factor: countryFactor,
            ...(!isClusterHead ? {
              semantic_similarity: factors.semantic_similarity as number,
              specificity: factors.specificity as number,
              child_intent: factors.child_intent as number,
              modifier: factors.modifier as number,
            } : {}),
          },
        });
      }

      const { data: updated, error: saveError } = await supabase
        .from("free_audits")
        .update({
          keyword_volume_estimates: estimates,
          keyword_volume_raw_input: rawInput,
          keyword_volume_raw_output: rawOutput,
          updated_at: new Date().toISOString(),
        })
        .eq("id", audit_id)
        .select()
        .single();

      if (saveError) {
        return jsonResponse({ error: "Failed to save volume estimates", detail: saveError.message }, 500);
      }

      return jsonResponse({ success: true, data: updated });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return jsonResponse({ error: (err as Error).message || "unknown error" }, 500);
  }
});
