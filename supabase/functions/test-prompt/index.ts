import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TestRequest {
  prompt_key: string;
  model: string;
  user_input: string;
  max_tokens?: number;
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
    const db = createClient(supabaseUrl, supabaseServiceKey);

    const body: TestRequest = await req.json();
    const { prompt_key, model, user_input } = body;
    const max_tokens = body.max_tokens ?? 4000;

    if (!prompt_key || !model || !user_input) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt_key, model, user_input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: settingRow } = await db
      .from("admin_settings")
      .select("value")
      .eq("key", prompt_key)
      .maybeSingle();

    const systemPrompt = settingRow?.value || "(no prompt saved)";

    // Check if logging is enabled for this prompt
    const { data: logSettingRow } = await db
      .from("admin_settings")
      .select("value")
      .eq("key", `ai_log_enabled_${prompt_key}`)
      .maybeSingle();
    const logEnabled = logSettingRow?.value === "true";

    const startTime = Date.now();

    const requestBody = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: user_input },
      ],
      temperature: 0.7,
      max_tokens,
      provider: { allow_fallbacks: true },
    };
    const requestOptions = {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": supabaseUrl,
        "X-Title": "Prompt Test",
      },
      body: JSON.stringify(requestBody),
    };

    let openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOptions);
    let data = await openrouterRes.json();

    if (!openrouterRes.ok && openrouterRes.status >= 500) {
      openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOptions);
      data = await openrouterRes.json();
    }

    const elapsed = Date.now() - startTime;

    if (!openrouterRes.ok) {
      return new Response(
        JSON.stringify({
          error: data?.error?.message || data?.message || `OpenRouter error ${openrouterRes.status}`,
          status: openrouterRes.status,
          raw: data,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const output = data?.choices?.[0]?.message?.content || "";
    const finishReason = data?.choices?.[0]?.finish_reason || null;
    const inputTokens = data?.usage?.prompt_tokens || 0;
    const outputTokens = data?.usage?.completion_tokens || 0;

    // Log if enabled
    if (logEnabled) {
      await db.from("ai_prompt_logs").insert({
        prompt_key,
        model,
        input_content: user_input.slice(0, 10000),
        output_content: output.slice(0, 10000),
        finish_reason: finishReason,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        elapsed_ms: elapsed,
      }).then(() => {});
    }

    return new Response(
      JSON.stringify({
        output,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        elapsed_ms: elapsed,
        model_used: model,
        finish_reason: finishReason,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
