// Shared AI router: centralizes provider routing (OpenRouter + Poolside) across all edge functions.
// Each edge function imports callAI() instead of duplicating fetch logic.

export type AIProvider = "openrouter" | "poolside";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallAIOptions {
  provider: AIProvider;
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" } | { type: "text" };
  allowFallbacks?: boolean;
  title?: string;
}

export interface CallAIResult {
  content: string;
  finishReason: string | null;
  inputTokens: number;
  outputTokens: number;
  elapsedMs: number;
  raw: unknown;
}

function cleanCodeFences(raw: string): string {
  return raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
}

export async function callAI(opts: CallAIOptions): Promise<CallAIResult> {
  const start = Date.now();
  const provider = opts.provider;

  if (provider === "openrouter") {
    return callOpenRouter(opts, start);
  } else if (provider === "poolside") {
    return callPoolside(opts, start);
  }
  throw new Error(`Unknown AI provider: ${provider}`);
}

async function callOpenRouter(opts: CallAIOptions, start: number): Promise<CallAIResult> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://toolkit.app";

  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 4000,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.responseFormat) {
    body.response_format = opts.responseFormat;
  }
  if (opts.allowFallbacks) {
    body.provider = { allow_fallbacks: true };
  }

  const requestOpts: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": supabaseUrl,
      "X-Title": opts.title || "AstroGTM",
    },
    body: JSON.stringify(body),
  };

  let res = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOpts);
  // Retry on 5xx
  if (!res.ok && res.status >= 500) {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOpts);
  }
  // Retry on 429 after delay
  if (!res.ok && res.status === 429) {
    await new Promise((r) => setTimeout(r, 5000));
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOpts);
  }

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`OpenRouter API error (${res.status}): ${errText}`);
    (err as any).status = res.status;
    throw err;
  }

  const data = await res.json();
  const rawContent: string = data?.choices?.[0]?.message?.content || "";
  const finishReason = data?.choices?.[0]?.finish_reason ?? null;
  const inputTokens = data?.usage?.prompt_tokens ?? 0;
  const outputTokens = data?.usage?.completion_tokens ?? 0;

  return {
    content: cleanCodeFences(rawContent),
    finishReason,
    inputTokens,
    outputTokens,
    elapsedMs: Date.now() - start,
    raw: data,
  };
}

async function callPoolside(opts: CallAIOptions, start: number): Promise<CallAIResult> {
  const apiKey = Deno.env.get("POOLSIDE_API_KEY");
  if (!apiKey) throw new Error("POOLSIDE_API_KEY not set");

  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 4000,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.responseFormat) {
    body.response_format = opts.responseFormat;
  }

  const requestOpts: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  let res = await fetch("https://inference.poolside.ai/v1/chat/completions", requestOpts);
  // Retry on 5xx
  if (!res.ok && res.status >= 500) {
    res = await fetch("https://inference.poolside.ai/v1/chat/completions", requestOpts);
  }
  // Retry on 429 after delay
  if (!res.ok && res.status === 429) {
    await new Promise((r) => setTimeout(r, 5000));
    res = await fetch("https://inference.poolside.ai/v1/chat/completions", requestOpts);
  }

  if (!res.ok) {
    const errText = await res.text();
    const err = new Error(`Poolside API error (${res.status}): ${errText}`);
    (err as any).status = res.status;
    throw err;
  }

  const data = await res.json();
  // Poolside returns choices[0].message.content; ignore reasoning_content if present
  const rawContent: string = data?.choices?.[0]?.message?.content || "";
  const finishReason = data?.choices?.[0]?.finish_reason ?? null;
  const inputTokens = data?.usage?.prompt_tokens ?? 0;
  const outputTokens = data?.usage?.completion_tokens ?? 0;

  return {
    content: cleanCodeFences(rawContent),
    finishReason,
    inputTokens,
    outputTokens,
    elapsedMs: Date.now() - start,
    raw: data,
  };
}

// Helper to resolve provider from settings map
export function getProvider(settings: Record<string, string>, promptKey: string): AIProvider {
  const key = `ai_provider_${promptKey}`;
  const val = settings[key];
  if (val === "poolside") return "poolside";
  return "openrouter";
}
