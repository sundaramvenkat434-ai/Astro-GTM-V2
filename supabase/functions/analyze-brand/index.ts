import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { tenant_id, source_url, source_text, source_filename } = await req.json();

    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "tenant_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!source_url && !source_text) {
      return new Response(
        JSON.stringify({ error: "Either source_url or source_text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load prompt and model settings
    const { data: settingsRows } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", [
        "brand_analyzer_prompt",
        "ai_model_brand_analyzer",
        "ai_request_count_brand_analyzer",
      ]);

    const settingsMap: Record<string, string> = {};
    for (const row of settingsRows || []) {
      settingsMap[row.key] = row.value;
    }

    const systemPrompt =
      settingsMap["brand_analyzer_prompt"] || "Analyze this brand and return JSON.";
    const model =
      settingsMap["ai_model_brand_analyzer"] || "openai/gpt-oss-120b:free";

    // Increment request counter (fire-and-forget)
    const currentCount =
      parseInt(settingsMap["ai_request_count_brand_analyzer"] || "0") + 1;
    supabase
      .from("admin_settings")
      .upsert(
        {
          key: "ai_request_count_brand_analyzer",
          value: String(currentCount),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )
      .then(() => {});

    // If URL provided, fetch and extract text
    let contentToAnalyze = source_text || "";

    if (source_url && !source_text) {
      try {
        const pageResponse = await fetch(source_url, {
          headers: { "User-Agent": "AstroGTM-BrandAnalyzer/1.0" },
        });
        if (!pageResponse.ok) {
          return new Response(
            JSON.stringify({ error: `Failed to fetch URL: ${pageResponse.status}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const html = await pageResponse.text();
        // Strip HTML tags and extract text content
        contentToAnalyze = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000);
      } catch (fetchErr) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch URL: ${String(fetchErr)}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!contentToAnalyze || contentToAnalyze.length < 50) {
      return new Response(
        JSON.stringify({ error: "Insufficient content to analyze. Please provide more text or a URL with content." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call OpenRouter
    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SUPABASE_URL,
          "X-Title": "AstroGTM Brand Analyzer",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze the following website/document content and extract brand intelligence:\n\n${contentToAnalyze}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (aiResponse.status === 429) {
      const retryAfter = aiResponse.headers.get("retry-after") || "30";
      return new Response(
        JSON.stringify({ error: `Rate limited. Retry after ${retryAfter}s.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return new Response(
        JSON.stringify({ error: `AI API error: ${aiResponse.status}`, details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown fences
    rawContent = rawContent
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/\n?```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response as JSON", raw: rawContent }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from("gifaa_brand_intelligence")
      .insert({
        tenant_id,
        source_url: source_url || null,
        source_filename: source_filename || null,
        brand_intelligence_score: parsed.brand_intelligence_score || 0,
        brand: parsed.brand || {},
        audience: parsed.audience || {},
        offerings: parsed.offerings || {},
        seo: parsed.seo || {},
        content_opportunities: parsed.content_opportunities || [],
        market_discovery: parsed.market_discovery || {},
        confidence_reason: parsed.confidence_reason || null,
        raw_ai_response: parsed,
      })
      .select()
      .single();

    if (saveError) {
      return new Response(
        JSON.stringify({ error: "Failed to save results", details: saveError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, data: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
