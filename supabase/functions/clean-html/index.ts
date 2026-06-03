import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Readability } from "npm:@mozilla/readability@0.5.0";
import { JSDOM } from "npm:jsdom@24.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_INPUT_BYTES = 1_500_000;
const MAX_TEXT_BYTES = 60_000;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { html, url } = await req.json();
    if (!html || typeof html !== "string") {
      return new Response(
        JSON.stringify({ error: "html is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmed = html.length > MAX_INPUT_BYTES ? html.slice(0, MAX_INPUT_BYTES) : html;

    const dom = new JSDOM(trimmed, { url: typeof url === "string" && url ? url : undefined });
    const doc = dom.window.document;

    const removeSelectors = [
      "script", "style", "noscript", "iframe", "svg",
      "nav", "header", "footer", "aside",
      "[role='navigation']", "[role='banner']", "[role='contentinfo']", "[role='complementary']",
      "[id*='comment' i]", "[class*='comment' i]",
      "[id*='login' i]", "[class*='login' i]",
      "[id*='signup' i]", "[class*='signup' i]",
      "[id*='subscribe' i]", "[class*='subscribe' i]",
      "[id*='newsletter' i]", "[class*='newsletter' i]",
      "[id*='advert' i]", "[class*='advert' i]",
      "[id*='ad-' i]", "[class*='ad-' i]",
      "[class*='ads' i]",
      "[class*='related' i]", "[id*='related' i]",
      "[class*='recommend' i]", "[id*='recommend' i]",
      "[class*='social' i]",
      "[class*='share' i]",
      "[class*='cookie' i]", "[id*='cookie' i]",
      "[class*='popup' i]", "[id*='popup' i]",
      "[class*='modal' i]",
    ];
    for (const sel of removeSelectors) {
      doc.querySelectorAll(sel).forEach((el) => el.remove());
    }

    const reader = new Readability(doc);
    const parsed = reader.parse();

    if (!parsed) {
      return new Response(
        JSON.stringify({ error: "Readability could not extract content" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let textContent = (parsed.textContent || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (textContent.length > MAX_TEXT_BYTES) {
      textContent = textContent.slice(0, MAX_TEXT_BYTES);
    }

    return new Response(
      JSON.stringify({
        title: (parsed.title || "").trim(),
        excerpt: (parsed.excerpt || "").trim(),
        textContent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
