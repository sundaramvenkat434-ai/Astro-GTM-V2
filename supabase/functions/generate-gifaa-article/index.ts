import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

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

    // Call OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": supabaseUrl,
          "X-Title": "Gifaa Article Writer",
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.75,
          max_tokens: 8000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") || "60";
      return new Response(
        JSON.stringify({ error: "rate_limit", retry_after: parseInt(retryAfter) }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `AI API error: ${response.status}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const json = await response.json();
    let raw = json.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

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
