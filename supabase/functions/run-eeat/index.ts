import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { callAI, getProvider } from "../_shared/ai-router.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EeatRequest {
  page_id?: string;
  title: string;
  content: string;
  meta_description?: string;
  focus_keyword?: string;
}

interface EeatResult {
  overall_score: number;
  experience_score: number;
  expertise_score: number;
  authoritativeness_score: number;
  trustworthiness_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_signals: string[];
  improvements: string[];
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

    const body: EeatRequest = await req.json();
    const { page_id, title, content, meta_description, focus_keyword } = body;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load model + prompt from admin_settings
    const { data: modelRows } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["eeat_analysis_prompt", "ai_model_run_eeat", "ai_request_count_run_eeat", "ai_provider_eeat_analysis_prompt"]);
    const modelSettings: Record<string, string> = {};
    for (const row of (modelRows || []) as { key: string; value: string }[]) {
      modelSettings[row.key] = row.value;
    }
    const aiModel = modelSettings["ai_model_run_eeat"] || "openai/gpt-oss-120b:free";
    const savedPrompt = modelSettings["eeat_analysis_prompt"] || null;

    // Increment request counter (fire-and-forget)
    const currentCount = parseInt(modelSettings["ai_request_count_run_eeat"] || "0") + 1;
    supabase.from("admin_settings").upsert({ key: "ai_request_count_run_eeat", value: String(currentCount), updated_at: new Date().toISOString() }, { onConflict: "key" });

    const systemPrompt = savedPrompt || `You are an expert SEO analyst specializing in Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) framework. Analyze the provided page content and return a strict JSON object with no markdown, no code fences.

Return ONLY valid JSON with this exact structure:
{
  "overall_score": <integer 0-100>,
  "experience_score": <integer 0-25>,
  "expertise_score": <integer 0-25>,
  "authoritativeness_score": <integer 0-25>,
  "trustworthiness_score": <integer 0-25>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missing_signals": ["<missing signal 1>", "<missing signal 2>", "<missing signal 3>"],
  "improvements": ["<exact improvement 1>", "<exact improvement 2>", "<exact improvement 3>"]
}

Scoring criteria:
- Experience (0-25): First-hand experience signals, case studies, personal examples, real use cases
- Expertise (0-25): Subject matter depth, accurate terminology, comprehensive coverage, author credentials
- Authoritativeness (0-25): External citations, statistics with sources, expert quotes, industry references
- Trustworthiness (0-25): Accurate facts, balanced perspective, clear sourcing, transparency, no misleading claims
- Overall = sum of the four sub-scores

Strengths: 3 specific content elements that demonstrate E-E-A-T well
Weaknesses: 3 specific gaps or issues hurting E-E-A-T
Missing signals: 3 trust/credibility elements absent from the content
Improvements: 3 exact, actionable changes with specific text to add or modify`;

    const userMessage = `Analyze this page for E-E-A-T:

TITLE: ${title || "N/A"}
META DESCRIPTION: ${meta_description || "N/A"}
FOCUS KEYWORD: ${focus_keyword || "N/A"}

CONTENT (HTML):
${content.slice(0, 12000)}`;

    const provider = getProvider(modelSettings, "eeat_analysis_prompt");

    let result;
    try {
      result = await callAI({
        provider,
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        maxTokens: 1200,
        title: "E-E-A-T Analyzer",
      });
    } catch (err: any) {
      const errMsg = err?.message || `AI error`;
      if (errMsg.includes("429") || err?.status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limit", message: "AI model rate-limited. Please wait a moment and try again.", retry_after: 60 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleaned = result.content;

    let eeatResult: EeatResult;
    try {
      eeatResult = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI returned unexpected format. Please try again.", raw: result.content.slice(0, 300) }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clamp scores
    eeatResult.overall_score = Math.min(100, Math.max(0, eeatResult.overall_score));
    eeatResult.experience_score = Math.min(25, Math.max(0, eeatResult.experience_score));
    eeatResult.expertise_score = Math.min(25, Math.max(0, eeatResult.expertise_score));
    eeatResult.authoritativeness_score = Math.min(25, Math.max(0, eeatResult.authoritativeness_score));
    eeatResult.trustworthiness_score = Math.min(25, Math.max(0, eeatResult.trustworthiness_score));

    const analyzed_at = new Date().toISOString();

    if (page_id) {
      const { error: dbError } = await supabase
        .from("eeat_scores")
        .upsert(
          {
            page_id,
            ...eeatResult,
            analyzed_at,
          },
          { onConflict: "page_id" }
        );

      if (dbError) {
        return new Response(
          JSON.stringify({ error: "Failed to save results: " + dbError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ ...(page_id ? { page_id } : {}), ...eeatResult, analyzed_at }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
