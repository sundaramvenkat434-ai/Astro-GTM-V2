import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { callAI, getProvider } from "../_shared/ai-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, context_dump } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load prompt and model from admin_settings
    const { data: settingsRows } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", [
        "gifaa_article_generation_prompt",
        "ai_model_generate_gifaa_article",
        "ai_request_count_generate_gifaa_article",
        "ai_provider_gifaa_article_generation_prompt",
      ]);
    const settingsMap: Record<string, string> = {};
    for (const row of (settingsRows || []) as { key: string; value: string }[]) {
      settingsMap[row.key] = row.value;
    }

    const systemPrompt =
      settingsMap["gifaa_article_generation_prompt"] ||
      "Generate a comprehensive article in JSON format with sections, faqs, excerpt, read_time, meta_title, meta_description.";
    const aiModel =
      settingsMap["ai_model_generate_gifaa_article"] || "openai/gpt-oss-120b:free";

    // Increment request counter
    const currentCount =
      parseInt(settingsMap["ai_request_count_generate_gifaa_article"] || "0") + 1;
    supabase
      .from("admin_settings")
      .upsert(
        {
          key: "ai_request_count_generate_gifaa_article",
          value: String(currentCount),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      .then(() => {});

    // Build user message
    let userMessage = `ARTICLE TITLE: ${title}\n\n`;
    if (context_dump && context_dump.trim()) {
      userMessage += `CONTEXT DUMP (use as factual reference only, DO NOT copy structure or phrasing):\n\n${context_dump.slice(0, 15000)}\n\n`;
    }
    userMessage += `Generate the complete article now. Output strict JSON only, no markdown fences.`;

    const provider = getProvider(settingsMap, "gifaa_article_generation_prompt");

    let aiResult;
    try {
      aiResult = await callAI({
        provider,
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.75,
        maxTokens: 8000,
        responseFormat: { type: "json_object" },
        title: "Gifaa Article Writer",
      });
    } catch (err: any) {
      const errMsg = err?.message || `AI error`;
      if (errMsg.includes("429") || err?.status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limit", retry_after: 60 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const raw = aiResult.content || "{}";

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response as JSON", raw }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate expected fields
    if (!result.sections || !Array.isArray(result.sections)) {
      return new Response(
        JSON.stringify({ error: "AI response missing sections array", result }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
