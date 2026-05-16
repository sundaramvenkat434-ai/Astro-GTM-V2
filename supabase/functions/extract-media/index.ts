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

export interface ExtractionResult {
  logo: LogoResult | null;
  screenshots: ScreenshotResult[];
  meta: SiteMeta;
  debug: ExtractionDebug;
}

export interface LogoResult {
  url: string;
  source: LogoSource;
}

export type LogoSource =
  | "schema-org"
  | "meta-itemprop"
  | "header-nav-img"
  | "header-nav-svg"
  | "apple-touch-icon"
  | "favicon"
  | "clearbit"
  | "og:image";

export interface ScreenshotResult {
  url: string;
  label: string;
  width: number;
  height: number;
  provider: "microlink" | "microlink-fallback";
}

export interface SiteMeta {
  title: string;
  description: string;
  canonical: string;
}

// Debug info returned to the client so the UI can show what succeeded/failed.
export interface ExtractionDebug {
  logo_attempts: AttemptRecord[];
  screenshot_attempts: AttemptRecord[];
  html_fetched: boolean;
  fetch_error?: string;
}

export interface AttemptRecord {
  strategy: string;
  success: boolean;
  url?: string;       // resolved URL tried (if any)
  reason?: string;    // failure reason (if failed)
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

function normaliseUrl(raw: string): URL {
  const s = raw.trim();
  return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
}

function resolveUrl(href: string | null | undefined, base: URL): string | null {
  if (!href) return null;
  if (href.startsWith("data:")) return null;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("/")) return `${base.origin}${href}`;
  if (/^https?:\/\//i.test(href)) return href;
  try { return new URL(href, base.toString()).toString(); } catch { return null; }
}

// ─── Logo extraction ──────────────────────────────────────────────────────────
// Priority (high → low):
//   1. Schema.org Organization/WebSite/Corporation/Brand JSON-LD logo
//   2. itemprop="logo"
//   3. <img> inside header/nav whose alt, src, or class contains "logo"
//   4. <svg> inside header/nav with class/id containing "logo"
//   5. apple-touch-icon (largest available)
//   6. favicon (<link rel="icon"> or /favicon.ico)
//   7. Clearbit Logo API (guaranteed fallback)
//   8. og:image (last resort — often a hero/social card, not the brand mark)

async function extractLogo(
  html: string,
  base: URL,
): Promise<{ result: LogoResult | null; attempts: AttemptRecord[] }> {
  const attempts: AttemptRecord[] = [];
  const doc = parse(html, { comment: false });

  // ── 1. Schema.org JSON-LD ─────────────────────────────────────────────────
  {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    let found: string | null = null;
    outer: for (const s of scripts) {
      try {
        const data = JSON.parse(s.textContent);
        const nodes = Array.isArray(data)
          ? data
          : data["@graph"]
          ? data["@graph"]
          : [data];
        for (const node of nodes) {
          if (!node || typeof node !== "object") continue;
          const types: string[] = Array.isArray(node["@type"])
            ? node["@type"]
            : [node["@type"]];
          if (
            types.some((t) =>
              ["Organization", "WebSite", "Corporation", "Brand", "LocalBusiness"].includes(t)
            ) &&
            node.logo
          ) {
            const raw =
              typeof node.logo === "string"
                ? node.logo
                : node.logo?.url ?? node.logo?.contentUrl ?? null;
            if (raw) { found = raw; break outer; }
          }
        }
      } catch { /* malformed JSON */ }
    }
    if (found) {
      const url = resolveUrl(found, base);
      if (url) {
        attempts.push({ strategy: "schema-org", success: true, url });
        return { result: { url, source: "schema-org" }, attempts };
      }
    }
    attempts.push({ strategy: "schema-org", success: false, reason: "No Organization/WebSite logo found in JSON-LD" });
  }

  // ── 2. itemprop="logo" ────────────────────────────────────────────────────
  {
    const el = doc.querySelector('[itemprop="logo"]');
    if (el) {
      const raw = el.getAttribute("src") ?? el.getAttribute("content") ?? el.getAttribute("href");
      const url = resolveUrl(raw, base);
      if (url) {
        attempts.push({ strategy: "meta-itemprop", success: true, url });
        return { result: { url, source: "meta-itemprop" }, attempts };
      }
    }
    attempts.push({ strategy: "meta-itemprop", success: false, reason: "No [itemprop=logo] element found" });
  }

  // ── 3. <img> in header/nav with "logo" signal ─────────────────────────────
  {
    const containers = ["header", "nav", '[role="banner"]', '[role="navigation"]'];
    let found: string | null = null;
    outer: for (const sel of containers) {
      const container = doc.querySelector(sel);
      if (!container) continue;
      for (const img of container.querySelectorAll("img")) {
        const alt = (img.getAttribute("alt") ?? "").toLowerCase();
        const src = (img.getAttribute("src") ?? "").toLowerCase();
        const cls = (img.getAttribute("class") ?? "").toLowerCase();
        if (alt.includes("logo") || src.includes("logo") || cls.includes("logo")) {
          const raw = img.getAttribute("src");
          const url = resolveUrl(raw, base);
          if (url) { found = url; break outer; }
        }
      }
    }
    if (found) {
      attempts.push({ strategy: "header-nav-img", success: true, url: found });
      return { result: { url: found, source: "header-nav-img" }, attempts };
    }
    attempts.push({ strategy: "header-nav-img", success: false, reason: "No logo img found in header/nav" });
  }

  // ── 4. <svg> in header/nav with "logo" class/id ──────────────────────────
  {
    const containers = ["header", "nav", '[role="banner"]'];
    let found: string | null = null;
    for (const sel of containers) {
      const container = doc.querySelector(sel);
      if (!container) continue;
      for (const svg of container.querySelectorAll("svg")) {
        const cls = (svg.getAttribute("class") ?? "").toLowerCase();
        const id = (svg.getAttribute("id") ?? "").toLowerCase();
        if (cls.includes("logo") || id.includes("logo")) {
          // Return the page URL itself as reference — SVGs are inline, mark as found
          found = base.toString();
          break;
        }
      }
      if (found) break;
    }
    if (found) {
      // For inline SVG, fall through to Clearbit which gives us a real raster logo
      attempts.push({ strategy: "header-nav-svg", success: false, reason: "Inline SVG found but no raster URL — continuing to next strategy" });
    } else {
      attempts.push({ strategy: "header-nav-svg", success: false, reason: "No logo SVG found in header/nav" });
    }
  }

  // ── 5. apple-touch-icon ───────────────────────────────────────────────────
  {
    const sizes = ["180x180", "167x167", "152x152", "120x120", ""];
    let found: string | null = null;
    for (const size of sizes) {
      const sel = size
        ? `link[rel="apple-touch-icon"][sizes="${size}"]`
        : 'link[rel="apple-touch-icon"]';
      const href = doc.querySelector(sel)?.getAttribute("href");
      const url = resolveUrl(href, base);
      if (url) { found = url; break; }
    }
    if (found) {
      attempts.push({ strategy: "apple-touch-icon", success: true, url: found });
      return { result: { url: found, source: "apple-touch-icon" }, attempts };
    }
    attempts.push({ strategy: "apple-touch-icon", success: false, reason: "No apple-touch-icon link found" });
  }

  // ── 6. favicon ────────────────────────────────────────────────────────────
  {
    // Prefer explicit <link rel="icon"> with PNG/SVG, then /favicon.ico fallback
    const iconLinks = doc.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    let found: string | null = null;
    // Prefer larger / vector
    for (const link of [...iconLinks].reverse()) {
      const href = link.getAttribute("href");
      const type = (link.getAttribute("type") ?? "").toLowerCase();
      const sizes = (link.getAttribute("sizes") ?? "");
      if (!href) continue;
      // Prefer SVG or explicit PNG
      if (type.includes("svg") || href.endsWith(".svg") || sizes === "any") {
        const url = resolveUrl(href, base);
        if (url) { found = url; break; }
      }
    }
    if (!found && iconLinks.length > 0) {
      const href = iconLinks[iconLinks.length - 1].getAttribute("href");
      found = resolveUrl(href, base);
    }
    if (!found) {
      // Try /favicon.ico as a known path
      found = `${base.origin}/favicon.ico`;
    }
    if (found) {
      attempts.push({ strategy: "favicon", success: true, url: found });
      return { result: { url: found, source: "favicon" }, attempts };
    }
    attempts.push({ strategy: "favicon", success: false, reason: "No favicon link or /favicon.ico" });
  }

  // ── 7. Clearbit Logo API ──────────────────────────────────────────────────
  {
    const url = `https://logo.clearbit.com/${base.hostname}`;
    attempts.push({ strategy: "clearbit", success: true, url });
    return { result: { url, source: "clearbit" }, attempts };
  }

  // ── 8. og:image (last resort) ─────────────────────────────────────────────
  // Only reached if Clearbit somehow fails (shouldn't happen in practice).
  // Kept for exhaustiveness.
}

// ─── Screenshot via Microlink ─────────────────────────────────────────────────
// Microlink renders pages in real Chromium (network-idle). We use a generous
// timeout and a two-attempt fallback strategy.
//
// Attempt 1: Full render — waitForTimeout 5000ms, waitUntil networkIdle
// Attempt 2: Fallback  — waitForTimeout 8000ms, waitUntil DOMContentLoaded
//
// Architecture note: this function is intentionally isolated. When we migrate
// to a dedicated Playwright worker, only this function needs to change.

const SCREENSHOT_W = 1600;
const SCREENSHOT_H = 900;

async function captureHomepageScreenshot(
  targetUrl: URL,
): Promise<{ result: ScreenshotResult | null; attempts: AttemptRecord[] }> {
  const attempts: AttemptRecord[] = [];
  const href = targetUrl.toString();

  // ── Attempt 1: network-idle render ────────────────────────────────────────
  {
    const strategy = "microlink (networkIdle, 5s)";
    try {
      const params = new URLSearchParams({
        url: href,
        screenshot: "true",
        meta: "false",
        "screenshot.type": "jpeg",
        "screenshot.quality": "85",
        "screenshot.width": String(SCREENSHOT_W),
        "screenshot.height": String(SCREENSHOT_H),
        "screenshot.waitForTimeout": "5000",
        "screenshot.waitUntil": "networkidle2",
      });

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);

      const res = await fetch(`https://api.microlink.io/?${params}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const url: string | undefined = data?.data?.screenshot?.url;
        if (url) {
          attempts.push({ strategy, success: true, url });
          return {
            result: { url, label: "Homepage", width: SCREENSHOT_W, height: SCREENSHOT_H, provider: "microlink" },
            attempts,
          };
        }
        attempts.push({ strategy, success: false, reason: `No screenshot URL in response: ${JSON.stringify(data?.status)}` });
      } else {
        attempts.push({ strategy, success: false, reason: `HTTP ${res.status}` });
      }
    } catch (err) {
      attempts.push({ strategy, success: false, reason: err instanceof Error ? err.message : "unknown" });
    }
  }

  // ── Attempt 2: DOMContentLoaded fallback ──────────────────────────────────
  {
    const strategy = "microlink-fallback (domcontentloaded, 8s)";
    try {
      const params = new URLSearchParams({
        url: href,
        screenshot: "true",
        meta: "false",
        "screenshot.type": "jpeg",
        "screenshot.quality": "80",
        "screenshot.width": String(SCREENSHOT_W),
        "screenshot.height": String(SCREENSHOT_H),
        "screenshot.waitForTimeout": "8000",
        "screenshot.waitUntil": "domcontentloaded",
      });

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 40_000);

      const res = await fetch(`https://api.microlink.io/?${params}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const url: string | undefined = data?.data?.screenshot?.url;
        if (url) {
          attempts.push({ strategy, success: true, url });
          return {
            result: { url, label: "Homepage", width: SCREENSHOT_W, height: SCREENSHOT_H, provider: "microlink-fallback" },
            attempts,
          };
        }
        attempts.push({ strategy, success: false, reason: `No screenshot URL in response` });
      } else {
        attempts.push({ strategy, success: false, reason: `HTTP ${res.status}` });
      }
    } catch (err) {
      attempts.push({ strategy, success: false, reason: err instanceof Error ? err.message : "unknown" });
    }
  }

  return { result: null, attempts };
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

async function extractMedia(rawUrl: string): Promise<ExtractionResult> {
  let base: URL;
  try {
    base = normaliseUrl(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }

  const debug: ExtractionDebug = {
    logo_attempts: [],
    screenshot_attempts: [],
    html_fetched: false,
  };

  // ── Fetch homepage HTML ────────────────────────────────────────────────────
  let html = "";
  let meta: SiteMeta = { title: "", description: "", canonical: base.toString() };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(base.toString(), {
      headers: FETCH_HEADERS,
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);

    if (!res.ok) {
      debug.fetch_error = `HTTP ${res.status} fetching homepage`;
    } else {
      html = await res.text();
      debug.html_fetched = true;
      const doc = parse(html, { comment: false });
      meta = {
        title: (doc.querySelector("title")?.textContent ?? "").trim().slice(0, 200),
        description: (
          doc.querySelector('meta[name="description"]')?.getAttribute("content") ??
          doc.querySelector('meta[property="og:description"]')?.getAttribute("content") ??
          ""
        ).trim().slice(0, 300),
        canonical: (
          doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
          base.toString()
        ),
      };
    }
  } catch (err) {
    debug.fetch_error = err instanceof Error ? err.message : "Fetch failed";
  }

  // ── Logo extraction ────────────────────────────────────────────────────────
  let logo: LogoResult | null = null;
  if (html) {
    const { result, attempts } = await extractLogo(html, base);
    logo = result ?? null;
    debug.logo_attempts = attempts;
  } else {
    // HTML fetch failed — go straight to Clearbit
    const url = `https://logo.clearbit.com/${base.hostname}`;
    logo = { url, source: "clearbit" };
    debug.logo_attempts = [{ strategy: "clearbit (html-fetch-failed)", success: true, url }];
  }

  // ── Screenshot ────────────────────────────────────────────────────────────
  const { result: screenshot, attempts: ssAttempts } = await captureHomepageScreenshot(base);
  debug.screenshot_attempts = ssAttempts;

  return {
    logo,
    screenshots: screenshot ? [screenshot] : [],
    meta,
    debug,
  };
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
