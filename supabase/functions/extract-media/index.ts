import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { parse } from "npm:node-html-parser@7.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtractionResult {
  logo: LogoResult | null;
  screenshots: ScreenshotResult[];
  meta: SiteMeta;
  errors: string[];
}

interface LogoResult {
  url: string;
  source: "og:image" | "schema-org" | "meta-itemprop" | "apple-touch-icon" | "favicon" | "clearbit";
  width?: number;
  height?: number;
}

interface ScreenshotResult {
  url: string;
  label: string;
  width: number;
  height: number;
}

interface SiteMeta {
  title: string;
  description: string;
  canonical: string;
}

// ─── URL normalisation ────────────────────────────────────────────────────────

function normaliseUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProto);
}

function resolveUrl(href: string, base: URL): string | null {
  if (!href) return null;
  if (href.startsWith("data:")) return null;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("/")) return `${base.origin}${href}`;
  if (href.startsWith("http")) return href;
  try {
    return new URL(href, base.toString()).toString();
  } catch {
    return null;
  }
}

// ─── Logo extraction (HTML-first, no external API needed) ────────────────────

async function extractLogo(html: string, base: URL): Promise<LogoResult | null> {
  const doc = parse(html, { comment: false });

  // 1. og:image — often the best brand image
  const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute("content");
  if (ogImg) {
    const resolved = resolveUrl(ogImg, base);
    if (resolved) return { url: resolved, source: "og:image" };
  }

  // 2. Schema.org Organization / WebSite logo in JSON-LD
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const s of scripts) {
    try {
      const data = JSON.parse(s.textContent);
      const nodes = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        if (
          types.some((t: string) => ["Organization", "WebSite", "Corporation", "Brand"].includes(t)) &&
          node.logo
        ) {
          const logoVal = typeof node.logo === "string" ? node.logo : node.logo?.url || node.logo?.contentUrl;
          if (logoVal) {
            const resolved = resolveUrl(logoVal, base);
            if (resolved) return { url: resolved, source: "schema-org" };
          }
        }
      }
    } catch { /* skip malformed JSON */ }
  }

  // 3. <link rel="image_src"> or itemprop="logo"
  const itempropLogo = doc.querySelector('[itemprop="logo"]');
  if (itempropLogo) {
    const src = itempropLogo.getAttribute("src") || itempropLogo.getAttribute("content") || itempropLogo.getAttribute("href");
    if (src) {
      const resolved = resolveUrl(src, base);
      if (resolved) return { url: resolved, source: "meta-itemprop" };
    }
  }

  // 4. Apple touch icon (high-res)
  const appleTouchSizes = ["180x180", "167x167", "152x152", "120x120", ""];
  for (const size of appleTouchSizes) {
    const sel = size
      ? `link[rel="apple-touch-icon"][sizes="${size}"]`
      : 'link[rel="apple-touch-icon"]';
    const el = doc.querySelector(sel);
    if (el) {
      const href = el.getAttribute("href");
      if (href) {
        const resolved = resolveUrl(href, base);
        if (resolved) return { url: resolved, source: "apple-touch-icon" };
      }
    }
  }

  // 5. Clearbit Logo API — high-quality domain logo, always available
  const clearbitUrl = `https://logo.clearbit.com/${base.hostname}`;
  return { url: clearbitUrl, source: "clearbit" };
}

// ─── Screenshots via Microlink ────────────────────────────────────────────────
// Microlink provides a free headless-browser screenshot API that:
// - renders JS-heavy SPAs (real Chromium rendering, network idle)
// - returns a direct image URL
// - no API key needed for basic use

interface MicrolinkScreenshotOpts {
  url: string;
  label: string;
  scrollY?: number;
  element?: string;
}

async function captureScreenshot(opts: MicrolinkScreenshotOpts): Promise<ScreenshotResult | null> {
  const TARGET_W = 1600;
  const TARGET_H = 900;

  try {
    const params = new URLSearchParams({
      url: opts.url,
      screenshot: "true",
      "meta": "false",
      "screenshot.type": "jpeg",
      "screenshot.quality": "85",
      "screenshot.width": String(TARGET_W),
      "screenshot.height": String(TARGET_H),
      "screenshot.waitForTimeout": "3000",
    });

    // If we want a specific element or scroll position, add those params
    if (opts.scrollY && opts.scrollY > 0) {
      params.set("screenshot.scrollTo", `0,${opts.scrollY}`);
    }

    const microlinkUrl = `https://api.microlink.io/?${params.toString()}`;
    const res = await fetch(microlinkUrl, {
      headers: { "x-api-key": "" }, // empty = free tier
    });

    if (!res.ok) return null;

    const data = await res.json();
    const screenshotUrl: string | undefined = data?.data?.screenshot?.url;
    if (!screenshotUrl) return null;

    return {
      url: screenshotUrl,
      label: opts.label,
      width: TARGET_W,
      height: TARGET_H,
    };
  } catch {
    return null;
  }
}

// ─── Multi-shot capture strategy ────────────────────────────────────────────
// Captures 4 screenshots using different scroll positions and a features URL
// to get hero + above-fold + mid-page + features/pricing sections.

async function captureScreenshots(targetUrl: URL, internalLinks: string[]): Promise<ScreenshotResult[]> {
  const baseHref = targetUrl.toString();

  // Decide extra pages to screenshot: prefer /pricing, /features, /product
  const priorityPaths = ["/pricing", "/features", "/product", "/tour", "/demo", "/platform"];
  let extraPage: string | null = null;
  for (const path of priorityPaths) {
    const found = internalLinks.find((l) => {
      try { return new URL(l).pathname === path; } catch { return false; }
    });
    if (found) { extraPage = found; break; }
  }
  if (!extraPage && internalLinks.length > 0) {
    // pick first non-home link as fallback
    extraPage = internalLinks.find((l) => {
      try { return new URL(l).pathname !== "/"; } catch { return false; }
    }) ?? null;
  }

  const jobs: MicrolinkScreenshotOpts[] = [
    { url: baseHref, label: "Homepage hero (above fold)", scrollY: 0 },
    { url: baseHref, label: "Homepage mid-section", scrollY: 600 },
    { url: baseHref, label: "Homepage features section", scrollY: 1400 },
  ];

  if (extraPage) {
    jobs.push({ url: extraPage, label: "Product / features page" });
  } else {
    jobs.push({ url: baseHref, label: "Homepage lower section", scrollY: 2200 });
  }

  // Run all in parallel, keep successful ones
  const results = await Promise.all(jobs.map((j) => captureScreenshot(j)));
  return results.filter((r): r is ScreenshotResult => r !== null);
}

// ─── Internal link extraction (reused from extract-url logic) ─────────────────

function extractInternalLinks(html: string, base: URL): string[] {
  const doc = parse(html, { comment: false });
  const links = new Set<string>();
  for (const a of doc.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    try {
      const resolved = new URL(href, base.toString());
      if (
        resolved.origin === base.origin &&
        resolved.pathname !== base.pathname &&
        !resolved.pathname.match(/\.(pdf|jpg|jpeg|png|gif|svg|zip|css|js|xml)$/i)
      ) {
        const segs = resolved.pathname.replace(/^\//, "").split("/").filter(Boolean);
        if (segs.length <= 1) links.add(resolved.origin + resolved.pathname);
      }
    } catch { /* skip */ }
    if (links.size >= 20) break;
  }
  return Array.from(links);
}

// ─── Main extraction orchestrator ────────────────────────────────────────────

async function extractMedia(rawUrl: string): Promise<ExtractionResult> {
  const errors: string[] = [];
  let base: URL;

  try {
    base = normaliseUrl(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }

  // Fetch homepage HTML (used for logo + link extraction)
  let html = "";
  let meta: SiteMeta = { title: "", description: "", canonical: base.toString() };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(base.toString(), { headers: FETCH_HEADERS, signal: controller.signal, redirect: "follow" });
    clearTimeout(timeout);

    if (!res.ok) {
      errors.push(`HTTP ${res.status} fetching homepage`);
    } else {
      html = await res.text();
      const doc = parse(html, { comment: false });
      meta = {
        title: (doc.querySelector("title")?.textContent || "").trim().slice(0, 200),
        description: (
          doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
          doc.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
          ""
        ).trim().slice(0, 300),
        canonical: (
          doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
          base.toString()
        ),
      };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    errors.push(`Could not fetch homepage: ${msg}`);
  }

  // Extract logo from HTML
  const logo = html ? await extractLogo(html, base).catch((e) => {
    errors.push(`Logo extraction failed: ${e?.message}`);
    return null;
  }) : null;

  // Gather internal links for smarter screenshot targeting
  const internalLinks = html ? extractInternalLinks(html, base) : [];

  // Capture screenshots via Microlink
  let screenshots: ScreenshotResult[] = [];
  try {
    screenshots = await captureScreenshots(base, internalLinks);
    if (screenshots.length === 0) errors.push("All screenshot captures failed (site may block headless browsers)");
  } catch (err) {
    errors.push(`Screenshot capture error: ${err instanceof Error ? err.message : "unknown"}`);
  }

  return { logo, screenshots, meta, errors };
}

// ─── HTTP handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl: unknown = body?.url;

    if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
      return new Response(
        JSON.stringify({ error: "url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await extractMedia(rawUrl.trim());

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
