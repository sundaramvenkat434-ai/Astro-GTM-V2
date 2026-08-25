import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callAI, getProvider } from "../_shared/ai-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FormatRequest {
  title: string;
  description: string;
  keywords: string;
  content: string;
}

interface SEOResult {
  title: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  excerpt: string;
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: formatRows } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["seo_format_prompt", "ai_model_format_seo", "ai_request_count_format_seo", "ai_provider_seo_format_prompt"]);
    const formatSettings: Record<string, string> = {};
    for (const row of (formatRows || []) as { key: string; value: string }[]) {
      formatSettings[row.key] = row.value;
    }
    const aiModel = formatSettings["ai_model_format_seo"] || "openai/gpt-oss-120b:free";
    const currentCount = parseInt(formatSettings["ai_request_count_format_seo"] || "0") + 1;
    supabase.from("admin_settings").upsert({ key: "ai_request_count_format_seo", value: String(currentCount), updated_at: new Date().toISOString() }, { onConflict: "key" });

    const systemPrompt = formatSettings["seo_format_prompt"] || "You are an SEO content expert. Transform the extracted content into an optimized SEO page. Return JSON with fields: title, meta_title, meta_description, focus_keyword, excerpt, content (HTML).";

    const body: FormatRequest = await req.json();
    const { title, description, keywords, content } = body;

    const userMessage = `Here is the extracted page content to transform:

TITLE: ${title || "N/A"}
DESCRIPTION: ${description || "N/A"}
KEYWORDS: ${keywords || "N/A"}

PAGE CONTENT (HTML):
${content ? content.slice(0, 15000) : "N/A"}

Please produce the SEO-optimized JSON response as instructed.`;

    const provider = getProvider(formatSettings, "seo_format_prompt");

    let result;
    try {
      result = await callAI({
        provider,
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        maxTokens: 3000,
        title: "SEO Page Formatter",
      });
    } catch (err: any) {
      const errMsg = err?.message || `AI error`;
      if (errMsg.includes("429") || err?.status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limit", message: "The AI model is currently rate-limited. Please try again in a moment.", retry_after: 60 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleaned = result.content;

    let parsedResult: SEOResult;
    try {
      parsedResult = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({
          error: "The AI returned an unexpected format. Please try again.",
          raw: result.content.slice(0, 500),
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
