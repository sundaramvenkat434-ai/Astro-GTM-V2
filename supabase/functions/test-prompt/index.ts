import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callAI, getProvider, type AIProvider } from "../_shared/ai-router.ts";

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
  provider?: AIProvider;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, supabaseServiceKey);

    const body: TestRequest = await req.json();
    const { prompt_key, model, user_input } = body;
    const max_tokens = body.max_tokens ?? 4000;

    // Resolve provider: explicit from request, or from admin_settings, default openrouter
    let provider: AIProvider = body.provider || "openrouter";
    if (!body.provider) {
      const { data: providerRow } = await db
        .from("admin_settings")
        .select("value")
        .eq("key", `ai_provider_${prompt_key}`)
        .maybeSingle();
      if (providerRow?.value === "poolside") provider = "poolside";
    }

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

    let result;
    try {
      result = await callAI({
        provider,
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: user_input },
        ],
        maxTokens: max_tokens,
        temperature: 0.7,
        allowFallbacks: provider === "openrouter",
        title: "Prompt Test",
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: err?.message || String(err),
          status: err?.status || 500,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const elapsed = Date.now() - startTime;
    const output = result.content;
    const finishReason = result.finishReason;
    const inputTokens = result.inputTokens;
    const outputTokens = result.outputTokens;

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
