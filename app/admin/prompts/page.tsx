'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Loader as Loader2,
  Save,
  RotateCcw,
  Sparkles,
  Shield,
  Zap,
  CircleCheck as CheckCircle2,
  TriangleAlert as AlertTriangle,
  ChevronDown,
  FlaskConical,
  Play,
  Copy,
  CopyCheck,
  RefreshCw,
  Activity,
  X,
  Clock,
  History,
  FileText,
  Brain,
  Key,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface PromptSetting {
  key: string;
  value: string;
  updated_at: string;
}

interface ChangelogEntry {
  id: string;
  prompt_key: string;
  model_key: string;
  model_value: string;
  model_label: string;
  changed_at: string;
}

// ── Model catalogue ───────────────────────────────────────────────────────────

const OPENROUTER_MODELS = [
  { value: 'openai/gpt-oss-120b:free', label: 'OpenAI GPT-OSS-120b', provider: 'OpenRouter' },
  { value: 'openai/gpt-oss-20b:free', label: 'OpenAI GPT-OSS-20b', provider: 'OpenRouter' },
  { value: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'NVIDIA Nemotron 3 Super', provider: 'OpenRouter' },
  { value: 'minimax/minimax-m2.5:free', label: 'MiniMax M2.5', provider: 'OpenRouter' },
  { value: 'google/gemma-4-31b-it:free', label: 'Google Gemma 4 31B', provider: 'OpenRouter' },
];

function getModelLabel(value: string) {
  return OPENROUTER_MODELS.find((m) => m.value === value)?.label ?? value;
}

// ── Prompt definitions ────────────────────────────────────────────────────────

const PROMPT_KEYS = [
  {
    key: 'ai_content_cleanup_prompt',
    modelKey: 'ai_model_structure_page',
    countKey: 'ai_request_count_structure_page',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'Tool Page V1 — Content Clean-Up',
    description: 'Used by the structure-page function (Tool Listing flow) to transform raw text into a structured tool-page JSON.',
    icon: Sparkles,
    usedBy: 'structure-page',
    testable: true,
  },
  {
    key: 'ai_content_cleanup_prompt_v2',
    modelKey: 'ai_model_structure_page',
    countKey: 'ai_request_count_structure_page',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'Tool Page V2 — Content Clean-Up (A/B Test)',
    description: 'Used by the structure-page function when "Tool Page 2.0" is selected.',
    icon: Sparkles,
    usedBy: 'structure-page',
    testable: true,
  },
  {
    key: 'eeat_analysis_prompt',
    modelKey: 'ai_model_run_eeat',
    countKey: 'ai_request_count_run_eeat',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'E-E-A-T Analysis',
    description: "Scores page content against Google's E-E-A-T framework.",
    icon: Shield,
    usedBy: 'run-eeat',
    testable: true,
  },
  {
    key: 'top_x_slug_system_prompt',
    modelKey: 'ai_model_generate_top_x',
    countKey: 'ai_request_count_generate_top_x',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'Top X — Slug & Metadata Generation',
    description: 'Generates an SEO-optimised slug, page name, tagline, and focus keyword.',
    icon: Zap,
    usedBy: 'generate-top-x',
    testable: true,
  },
  {
    key: 'top_x_content_system_prompt',
    modelKey: 'ai_model_generate_top_x',
    countKey: 'ai_request_count_generate_top_x',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'Top X — Full Content Generation (V1)',
    description: 'Generates comparison page content: entries, comparison table, best-for segments, FAQs, intro, outro.',
    icon: Sparkles,
    usedBy: 'generate-top-x',
    testable: true,
  },
  {
    key: 'top_x_content_system_prompt_v2',
    modelKey: 'ai_model_generate_top_x',
    countKey: 'ai_request_count_generate_top_x',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'Top X 2.0 — Full Content Generation (V2)',
    description: 'Used when "Top X 2.0 Page" is selected. A/B test variant.',
    icon: Sparkles,
    usedBy: 'generate-top-x',
    testable: true,
  },
  {
    key: 'gifaa_article_generation_prompt',
    modelKey: 'ai_model_generate_gifaa_article',
    countKey: 'ai_request_count_generate_gifaa_article',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'Gifaa Article — AI Content Writer',
    description: 'Generates full article content from title and context dump. Produces original, E-E-A-T optimized content.',
    icon: FileText,
    usedBy: 'generate-gifaa-article',
    testable: true,
  },
  {
    key: 'brand_analyzer_prompt',
    modelKey: 'ai_model_brand_analyzer',
    countKey: 'ai_request_count_brand_analyzer',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'AI Researcher — Brand Analyzer',
    description: 'Analyzes a website or pasted text to extract brand intelligence: audience, offerings, keywords, market positioning, and content opportunities.',
    icon: Brain,
    usedBy: 'analyze-brand',
    testable: true,
  },
  {
    key: 'ai_keyword_research_prompt',
    modelKey: 'ai_model_keyword_research',
    countKey: 'ai_request_count_keyword_research',
    defaultModel: 'openai/gpt-oss-120b:free',
    label: 'AI Researcher — Keyword Strategy',
    description: 'Generates keyword strategy with content themes, keywords, and page ideas from SERP data, scraped competitor content, and brand intelligence.',
    icon: Key,
    usedBy: 'keyword-research',
    testable: true,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ── Model Switcher ────────────────────────────────────────────────────────────

function ModelSwitcher({
  modelKey,
  countKey,
  value,
  count,
  onChange,
  onShowChangelog,
}: {
  modelKey: string;
  countKey: string;
  value: string;
  count: number;
  onChange: (key: string, val: string) => void;
  onShowChangelog: (modelKey: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPENROUTER_MODELS.find((m) => m.value === value) ?? { value, label: value, provider: 'OpenRouter' };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <div ref={ref} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 relative">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Model</span>
          <span className="w-px h-3 bg-slate-300" />
          <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[180px]">{current.label}</span>
          <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-px rounded-md whitespace-nowrap">{current.provider}</span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-1 p-0.5 rounded hover:bg-slate-200 transition-colors"
        >
          {open ? <X className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[280px]">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Model</p>
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {OPENROUTER_MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => { onChange(modelKey, m.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${m.value === value ? 'bg-sky-50' : ''}`}
                >
                  <p className={`text-[12px] font-medium ${m.value === value ? 'text-sky-700' : 'text-slate-800'}`}>{m.label}</p>
                  {m.value === value && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <Activity className="w-3 h-3 text-sky-500" />
        <span className="text-[11px] font-semibold text-slate-800">{count.toLocaleString()}</span>
        <span className="text-[10px] text-slate-400">requests</span>
      </div>

      <button
        onClick={() => onShowChangelog(modelKey)}
        className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-sky-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
      >
        <History className="w-3 h-3" />
        Changelog
      </button>
    </div>
  );
}

// ── Changelog Modal ──────────────────────────────────────────────────────────

function ChangelogModal({ modelKey, onClose }: { modelKey: string; onClose: () => void }) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ai_model_usage_log')
      .select('id, prompt_key, model_key, model_value, model_label, changed_at')
      .eq('model_key', modelKey)
      .order('changed_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setEntries((data as ChangelogEntry[]) || []);
        setLoading(false);
      });
  }, [modelKey]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Model Changelog</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No changes recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div key={e.id} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-slate-800">{e.model_label || getModelLabel(e.model_value)}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(e.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {new Date(e.changed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Test Modal ───────────────────────────────────────────────────────────────

function TestModal({ promptKey, modelValue, onClose }: { promptKey: string; modelValue: string; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [payload, setPayload] = useState<object | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [showRaw, setShowRaw] = useState(true);
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);

  // Build payload preview live as user types
  useEffect(() => {
    if (!input.trim()) { setPayload(null); return; }
    const timer = setTimeout(async () => {
      const { data: settingRow } = await supabase.from('admin_settings').select('value').eq('key', promptKey).maybeSingle();
      const sp = settingRow?.value ?? '(no prompt saved)';
      setPayload({
        model: modelValue,
        messages: [
          { role: 'system', content: sp },
          { role: 'user', content: input },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      setInputTokens(estimateTokens(sp + input));
    }, 400);
    return () => clearTimeout(timer);
  }, [input, promptKey, modelValue]);

  async function handleGenerate() {
    if (!input.trim()) return;
    setGenerating(true);
    setResult(null);
    setElapsed(null);
    const start = Date.now();

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`${supabaseUrl}/functions/v1/test-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ prompt_key: promptKey, model: modelValue, user_input: input }),
      });

      const data = await res.json();
      setElapsed(Date.now() - start);

      if (data.error) {
        setResult(JSON.stringify({ error: data.error }, null, 2));
      } else {
        setResult(data.output ?? JSON.stringify(data, null, 2));
        setOutputTokens(data.output_tokens ?? estimateTokens(data.output ?? ''));
        if (data.input_tokens) setInputTokens(data.input_tokens);
      }
    } catch (err: unknown) {
      setResult(JSON.stringify({ error: String(err) }, null, 2));
      setElapsed(Date.now() - start);
    } finally {
      setGenerating(false);
    }
  }

  async function copy(text: string, which: 'payload' | 'result') {
    await navigator.clipboard.writeText(text);
    if (which === 'payload') { setCopiedPayload(true); setTimeout(() => setCopiedPayload(false), 2000); }
    else { setCopiedResult(true); setTimeout(() => setCopiedResult(false), 2000); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
              <FlaskConical className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900">Prompt Playground</h3>
              <p className="text-[10px] text-slate-400">{getModelLabel(modelValue)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-2 divide-x divide-slate-100 overflow-hidden min-h-0">

          {/* LEFT: input + json payload */}
          <div className="flex flex-col divide-y divide-slate-100 overflow-hidden">
            {/* Input box */}
            <div className="p-4 flex flex-col gap-2 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Input</p>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                className="text-xs font-mono border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-none bg-white"
                placeholder="Enter the user message to test against the system prompt..."
              />
            </div>

            {/* JSON Payload preview */}
            <div className="flex-1 p-4 flex flex-col gap-2 overflow-hidden min-h-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JSON Payload</p>
                {payload && (
                  <button
                    onClick={() => copy(JSON.stringify(payload, null, 2), 'payload')}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {copiedPayload ? <CopyCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedPayload ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              {payload ? (
                <pre className="flex-1 text-[9.5px] font-mono bg-slate-950 text-slate-300 p-3.5 rounded-xl overflow-auto leading-relaxed whitespace-pre-wrap break-words min-h-0">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 border-dashed min-h-[120px]">
                  <p className="text-[11px] text-slate-400">Type input above to preview payload</p>
                </div>
              )}
            </div>

            {/* Generate button */}
            <div className="p-4 shrink-0">
              <Button
                onClick={handleGenerate}
                disabled={generating || !input.trim()}
                className="w-full h-9 text-[12px] font-semibold bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-md disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-2" />}
                Generate Output
              </Button>
            </div>
          </div>

          {/* RIGHT: AI output */}
          <div className="flex flex-col overflow-hidden">
            {/* Output header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Output</p>
              <div className="flex items-center gap-2">
                {result && (
                  <>
                    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                      <button onClick={() => setShowRaw(true)} className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors ${showRaw ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Raw</button>
                      <button onClick={() => setShowRaw(false)} className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors ${!showRaw ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Formatted</button>
                    </div>
                    <button
                      onClick={() => copy(result, 'result')}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {copiedResult ? <CopyCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedResult ? 'Copied' : 'Copy'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Output body */}
            <div className="flex-1 overflow-auto p-4 min-h-0">
              {generating && (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-[3px] border-sky-100 border-t-sky-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Running {getModelLabel(modelValue)}...</p>
                </div>
              )}

              {!generating && !result && (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-[11px] text-slate-400">Output will appear here</p>
                </div>
              )}

              {!generating && result && (
                showRaw ? (
                  <pre className="text-[10px] font-mono bg-slate-950 text-slate-100 p-4 rounded-xl overflow-auto leading-relaxed whitespace-pre-wrap break-words h-full">
                    {result}
                  </pre>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-700 whitespace-pre-wrap break-words leading-relaxed overflow-auto h-full">
                    {(() => { try { return JSON.stringify(JSON.parse(result), null, 2); } catch { return result; } })()}
                  </div>
                )
              )}
            </div>

            {/* Stats bar */}
            <div className="px-4 py-3 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">In</span>
                  <span className="text-[12px] font-bold text-slate-700">{inputTokens.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400">tokens</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Out</span>
                  <span className="text-[12px] font-bold text-slate-700">{outputTokens.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-400">tokens</span>
                </div>
                {elapsed !== null && (
                  <>
                    <div className="w-px h-3 bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[12px] font-bold text-slate-700">{formatTime(elapsed)}</span>
                      <span className="text-[9px] text-slate-400">({elapsed}ms)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PromptsAdmin() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Record<string, PromptSetting>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [modelDrafts, setModelDrafts] = useState<Record<string, string>>({});
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [changelogKey, setChangelogKey] = useState<string | null>(null);
  const [testModal, setTestModal] = useState<{ key: string; model: string } | null>(null);

  const ALL_SETTINGS_KEYS = [
    ...PROMPT_KEYS.map((p) => p.key),
    ...PROMPT_KEYS.filter((p) => p.modelKey).map((p) => p.modelKey!),
    ...PROMPT_KEYS.filter((p) => p.countKey).map((p) => p.countKey!),
  ];

  const fetchPrompts = useCallback(async () => {
    const uniqueKeys = ALL_SETTINGS_KEYS.filter((k, i, a) => a.indexOf(k) === i);
    const { data } = await supabase
      .from('admin_settings')
      .select('key, value, updated_at')
      .in('key', uniqueKeys);

    if (data) {
      const map: Record<string, PromptSetting> = {};
      const draftMap: Record<string, string> = {};
      const modelMap: Record<string, string> = {};
      const countMap: Record<string, number> = {};

      for (const row of data as PromptSetting[]) {
        map[row.key] = row;
        if (PROMPT_KEYS.some((p) => p.key === row.key)) {
          draftMap[row.key] = row.value;
        }
        if (row.key.startsWith('ai_model_')) {
          modelMap[row.key] = row.value;
        }
        if (row.key.startsWith('ai_request_count_')) {
          countMap[row.key] = parseInt(row.value) || 0;
        }
      }

      for (const p of PROMPT_KEYS) {
        if (p.modelKey && !modelMap[p.modelKey]) {
          modelMap[p.modelKey] = p.defaultModel ?? 'openai/gpt-oss-120b:free';
        }
      }

      setPrompts(map);
      setDrafts(draftMap);
      setModelDrafts(modelMap);
      setRequestCounts(countMap);
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/admin/login'); return; }
      fetchPrompts();
    });
  }, [router, fetchPrompts]);

  const totalRequests = Object.values(requestCounts).reduce((a, b) => a + b, 0);

  async function handleSave(key: string) {
    const value = drafts[key];
    if (value === undefined) return;
    setSaving((prev) => ({ ...prev, [key]: true }));
    setSaved((prev) => ({ ...prev, [key]: false }));

    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    setSaving((prev) => ({ ...prev, [key]: false }));
    if (!error) {
      setPrompts((prev) => ({ ...prev, [key]: { ...prev[key], value, updated_at: new Date().toISOString() } }));
      setSaved((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 3000);
    }
  }

  async function handleModelChange(modelKey: string, newModel: string) {
    const oldModel = modelDrafts[modelKey];
    setModelDrafts((prev) => ({ ...prev, [modelKey]: newModel }));

    await supabase
      .from('admin_settings')
      .upsert({ key: modelKey, value: newModel, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    // Log change
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('ai_model_usage_log').insert({
      prompt_key: PROMPT_KEYS.find(p => p.modelKey === modelKey)?.key ?? '',
      model_key: modelKey,
      model_value: newModel,
      model_label: getModelLabel(newModel),
      is_backup: false,
      changed_by: session?.user?.id ?? null,
    });
  }

  function handleReset(key: string) {
    if (prompts[key]) setDrafts((prev) => ({ ...prev, [key]: prompts[key].value }));
  }

  function hasChanges(key: string): boolean {
    return prompts[key] !== undefined && drafts[key] !== prompts[key].value;
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">AI Prompts</h1>
            <p className="text-sm text-slate-500 mt-1">
              System instructions and model configuration for each edge function.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-[12px] font-bold text-sky-800">{totalRequests.toLocaleString()}</span>
              <span className="text-[10px] text-sky-600">total requests</span>
            </div>
            <Badge variant="secondary" className="text-[11px]">
              {PROMPT_KEYS.length} prompts
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {PROMPT_KEYS.map((config) => {
            const Icon = config.icon;
            const draft = drafts[config.key] ?? '';
            const isSaving = saving[config.key] ?? false;
            const isSaved = saved[config.key] ?? false;
            const changed = hasChanges(config.key);
            const missing = !prompts[config.key];
            const modelValue = config.modelKey
              ? (modelDrafts[config.modelKey] ?? config.defaultModel ?? 'openai/gpt-oss-120b:free')
              : null;
            const count = config.countKey ? (requestCounts[config.countKey] ?? 0) : 0;
            const charLen = draft.length;
            const tokenLen = estimateTokens(draft);

            return (
              <Card key={config.key} className="border-slate-200 shadow-sm overflow-visible">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{config.label}</CardTitle>
                        <CardDescription className="mt-1 text-xs leading-relaxed">
                          {config.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Edge Function: {config.usedBy}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Key: {config.key}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {missing && (
                        <Badge variant="destructive" className="text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Not found
                        </Badge>
                      )}
                      {isSaved && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                      {changed && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          Unsaved changes
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {config.modelKey && modelValue && (
                    <ModelSwitcher
                      modelKey={config.modelKey}
                      countKey={config.countKey ?? ''}
                      value={modelValue}
                      count={count}
                      onChange={handleModelChange}
                      onShowChangelog={(k) => setChangelogKey(k)}
                    />
                  )}

                  <Textarea
                    value={draft}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [config.key]: e.target.value }))}
                    rows={10}
                    className="text-xs leading-relaxed font-mono border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-y"
                    placeholder="Prompt content..."
                  />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {charLen.toLocaleString()} chars
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        ~{tokenLen.toLocaleString()} tokens
                      </span>
                      {config.testable && modelValue && (
                        <button
                          onClick={() => setTestModal({ key: config.key, model: modelValue })}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-sky-600 hover:text-sky-800 transition-colors"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          Test
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReset(config.key)}
                        disabled={!changed || isSaving}
                        className="h-8 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1.5" />
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(config.key)}
                        disabled={!draft.trim() || isSaving}
                        className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        {isSaving
                          ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                          : <Save className="w-3 h-3 mr-1.5" />
                        }
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {changelogKey && <ChangelogModal modelKey={changelogKey} onClose={() => setChangelogKey(null)} />}
      {testModal && <TestModal promptKey={testModal.key} modelValue={testModal.model} onClose={() => setTestModal(null)} />}
    </AdminShell>
  );
}
