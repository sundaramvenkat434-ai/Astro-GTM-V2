'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  ArrowLeftRight,
  Code2,
  FileJson,
  AlignLeft,
  History,
  ChevronRight,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface PromptSetting {
  key: string;
  value: string;
  updated_at: string;
}

interface ModelLogEntry {
  id: string;
  prompt_key: string;
  model_key: string;
  model_value: string;
  model_label: string;
  is_backup: boolean;
  changed_at: string;
  changed_by: string | null;
}

// ── Model catalogue ───────────────────────────────────────────────────────────

const OPENROUTER_MODELS = [
  { value: 'minimax/minimax-m2.5:free',              label: 'MiniMax M2.5',                 provider: 'OpenRouter' },
  { value: 'openai/gpt-oss-120b:free',               label: 'OpenAI GPT-OSS-120b',          provider: 'OpenRouter' },
  { value: 'deepseek/deepseek-v4-flash:free',        label: 'DeepSeek V4 Flash',            provider: 'OpenRouter' },
  { value: 'qwen/qwen3-next-80b-a3b-instruct:free',  label: 'Qwen3 Next 80B A3B Instruct',  provider: 'OpenRouter' },
  { value: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'NVIDIA Nemotron 3 Super',      provider: 'OpenRouter' },
  { value: 'google/gemma-4-31b-it:free',             label: 'Google Gemma 4 31B',           provider: 'OpenRouter' },
  { value: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Meta Llama 3.3 70B Instruct', provider: 'OpenRouter' },
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
    description: 'Used by the structure-page function when "Tool Page 2.0" is selected. Same JSON schema as V1 — A/B test variant.',
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
    description: "Scores page content against Google's Experience, Expertise, Authoritativeness, and Trustworthiness framework.",
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
    description: 'Generates an SEO-optimised slug, page name, tagline, and focus keyword from the selected tools.',
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
    description: 'Generates the complete comparison page: entries, comparison table, best-for segments, FAQs, intro, outro, and SEO metadata.',
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
    description: 'Used when "Top X 2.0 Page" is selected. Same JSON schema as V1 — A/B test variant.',
    icon: Sparkles,
    usedBy: 'generate-top-x',
    testable: true,
  },
  {
    key: 'pagespeed_api_key',
    modelKey: null,
    countKey: null,
    defaultModel: null,
    label: 'PageSpeed API Key',
    description: 'Google PageSpeed Insights API key used by run-lighthouse. Required for Lighthouse scoring.',
    icon: Zap,
    usedBy: 'run-lighthouse',
    testable: false,
  },
];

// ── Model Switcher ────────────────────────────────────────────────────────────

function ModelSwitcher({
  modelKey,
  countKey,
  defaultModel,
  value,
  count,
  isBackup,
  promptKey,
  onChange,
}: {
  modelKey: string;
  countKey: string;
  defaultModel: string;
  value: string;
  count: number;
  isBackup?: boolean;
  promptKey?: string;
  onChange: (key: string, val: string, label: string, isBackup: boolean, promptKey: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = OPENROUTER_MODELS.find((m) => m.value === value) ?? {
    value,
    label: value,
    provider: 'OpenRouter',
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
            open
              ? 'border-sky-400 bg-sky-50 shadow-sm'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Model</span>
          <span className="w-px h-3 bg-slate-300" />
          <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[160px]">{current.label}</span>
          <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-px rounded whitespace-nowrap">{current.provider}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ml-0.5 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-[320px]">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Model (OpenRouter)</p>
              <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-slate-200 transition-colors">
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {OPENROUTER_MODELS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    onChange(modelKey, m.value, m.label, !!isBackup, promptKey ?? modelKey);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                    m.value === value ? 'bg-sky-50 border-l-2 border-l-sky-400' : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-[12px] font-semibold leading-tight ${m.value === value ? 'text-sky-700' : 'text-slate-800'}`}>{m.label}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{m.value}</p>
                  </div>
                  {m.value === value && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Request counter */}
      {countKey && (
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
          <Activity className="w-3 h-3 text-sky-500" />
          <span className="text-[11px] font-semibold text-slate-800">{count.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">req</span>
        </div>
      )}

      {/* Model ID pill */}
      <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg px-2.5 py-2 max-w-[220px] overflow-hidden">
        <span className="text-[10px] font-mono text-slate-300 truncate">{value}</span>
      </div>
    </div>
  );
}

// ── Test Modal ────────────────────────────────────────────────────────────────

type OutputView = 'raw' | 'payload' | 'formatted';

function TestModal({
  promptKey,
  promptLabel,
  modelValue,
  backupModel,
  onClose,
}: {
  promptKey: string;
  promptLabel: string;
  modelValue: string;
  backupModel: string;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [running, setRunning] = useState(false);
  const [payload, setPayload] = useState<object | null>(null);
  const [rawOutput, setRawOutput] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [outputView, setOutputView] = useState<OutputView>('formatted');

  const activeModel = useBackup ? backupModel : modelValue;

  async function runTest() {
    if (!input.trim()) return;
    setRunning(true);
    setPayload(null);
    setRawOutput(null);
    setElapsed(null);

    const start = Date.now();
    try {
      const { data: settingRow } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', promptKey)
        .maybeSingle();

      const systemPrompt = settingRow?.value ?? '(no prompt saved)';

      const builtPayload = {
        model: activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      };

      setPayload(builtPayload);

      const { data: keyRow } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'openrouter_api_key')
        .maybeSingle();

      if (keyRow?.value) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keyRow.value}`,
            'HTTP-Referer': window.location.origin,
          },
          body: JSON.stringify(builtPayload),
        });
        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content ?? JSON.stringify(json, null, 2);
        setRawOutput(content);
      } else {
        setRawOutput('(No OpenRouter API key configured in admin settings — payload preview only)');
      }
    } catch (err: unknown) {
      setRawOutput(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setElapsed(Date.now() - start);
      setRunning(false);
    }
  }

  function tryParseJSON(str: string): { parsed: unknown; isJSON: boolean } {
    try {
      const trimmed = str.trim();
      const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
      const target = fenced ? fenced[1].trim() : trimmed;
      return { parsed: JSON.parse(target), isJSON: true };
    } catch {
      return { parsed: null, isJSON: false };
    }
  }

  const { parsed: parsedOutput, isJSON } = rawOutput ? tryParseJSON(rawOutput) : { parsed: null, isJSON: false };

  function renderFormatted(data: unknown, depth = 0): React.ReactNode {
    if (data === null || data === undefined) return <span className="text-slate-400 italic">null</span>;
    if (typeof data === 'boolean') return <span className="text-amber-600 font-semibold">{String(data)}</span>;
    if (typeof data === 'number') return <span className="text-blue-600 font-semibold">{data}</span>;
    if (typeof data === 'string') {
      if (data.length > 200) {
        return <span className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data}</span>;
      }
      return <span className="text-emerald-700">"{data}"</span>;
    }
    if (Array.isArray(data)) {
      if (data.length === 0) return <span className="text-slate-400">[]</span>;
      return (
        <div className={`ml-${depth > 0 ? 4 : 0} space-y-1`}>
          {data.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-300 text-[10px] mt-0.5 shrink-0 font-mono">{i}.</span>
              <div className="min-w-0 flex-1">{renderFormatted(item, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }
    if (typeof data === 'object') {
      return (
        <div className="space-y-1.5">
          {Object.entries(data as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="flex gap-2 min-w-0">
              <span className="text-sky-700 font-semibold text-[11px] shrink-0 mt-0.5 font-mono">{k}:</span>
              <div className="min-w-0 flex-1 text-[11px]">{renderFormatted(v, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-slate-600">{String(data)}</span>;
  }

  async function copyText(text: string, setCopied: (v: boolean) => void) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
              <FlaskConical className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Prompt Test</p>
              <p className="text-[11px] text-slate-500">{promptLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Model toggle */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setUseBackup(false)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                  !useBackup ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Primary
              </button>
              <button
                onClick={() => setUseBackup(true)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                  useBackup ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Backup
              </button>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1">
              <ArrowLeftRight className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-600">{getModelLabel(activeModel)}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Body — two-column */}
        <div className="flex flex-1 min-h-0">
          {/* Left — input */}
          <div className="w-[40%] border-r border-slate-100 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Input</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <AlignLeft className="w-3 h-3" />
                {input.length} chars
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                className="text-xs leading-relaxed font-mono border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-none flex-1"
                placeholder="Paste the user message / raw content you want to test against this prompt..."
              />

              {/* JSON Payload preview */}
              {payload && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">JSON Payload</p>
                    </div>
                    <button
                      onClick={() => copyText(JSON.stringify(payload, null, 2), setCopiedPayload)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {copiedPayload ? <CopyCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedPayload ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono bg-slate-900 text-slate-100 p-3 overflow-x-auto max-h-48 leading-relaxed whitespace-pre-wrap break-all">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
              <Button
                size="sm"
                onClick={runTest}
                disabled={running || !input.trim()}
                className="h-8 text-xs bg-sky-700 hover:bg-sky-800 text-white flex-1"
              >
                {running ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Play className="w-3 h-3 mr-1.5" />}
                {running ? 'Running...' : 'Run Test'}
              </Button>
              {(payload || rawOutput) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPayload(null); setRawOutput(null); setInput(''); setElapsed(null); }}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Clear
                </Button>
              )}
              {elapsed !== null && (
                <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">{(elapsed / 1000).toFixed(1)}s</span>
              )}
            </div>
          </div>

          {/* Right — output */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Model Output</p>
              {rawOutput && (
                <div className="flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setOutputView('formatted')}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${outputView === 'formatted' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <AlignLeft className="w-3 h-3" /> Formatted
                    </button>
                    <button
                      onClick={() => setOutputView('raw')}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${outputView === 'raw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Code2 className="w-3 h-3" /> Raw
                    </button>
                  </div>
                  <button
                    onClick={() => copyText(rawOutput, setCopiedOutput)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors ml-1"
                  >
                    {copiedOutput ? <CopyCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedOutput ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {running && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calling {getModelLabel(activeModel)}...
                </div>
              )}
              {!running && !rawOutput && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300">
                  <FlaskConical className="w-8 h-8" />
                  <p className="text-sm font-medium text-slate-400">No output yet</p>
                  <p className="text-[11px] text-slate-400">Enter input and click Run Test</p>
                </div>
              )}
              {rawOutput && outputView === 'raw' && (
                <pre className="text-[11px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap break-all">
                  {rawOutput}
                </pre>
              )}
              {rawOutput && outputView === 'formatted' && (
                <div className="text-[11px] leading-relaxed">
                  {isJSON ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      {renderFormatted(parsedOutput)}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {rawOutput}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Model Log Panel ───────────────────────────────────────────────────────────

function ModelLogPanel({
  backupModelValue,
  onClose,
}: {
  backupModelValue: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<ModelLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ai_model_usage_log')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs((data as ModelLogEntry[]) ?? []);
        setLoading(false);
      });
  }, []);

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  const promptKeyLabels: Record<string, string> = {};
  PROMPT_KEYS.forEach((p) => { promptKeyLabels[p.key] = p.label; });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <History className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Model Usage Log</p>
              <p className="text-[11px] text-slate-500">Every model switch, most recent first</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
            </div>
          )}
          {!loading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-300">
              <History className="w-8 h-8" />
              <p className="text-sm font-medium text-slate-400">No model changes recorded yet</p>
            </div>
          )}
          {!loading && logs.length > 0 && (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => {
                const isBackup = log.is_backup;
                return (
                  <div key={log.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                    <div className="shrink-0 mt-0.5">
                      <div className={`w-2 h-2 rounded-full mt-1 ${isBackup ? 'bg-amber-400' : 'bg-sky-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-semibold text-slate-800 truncate">{log.model_label || log.model_value}</span>
                        {isBackup && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded">
                            Backup
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 truncate">{log.model_value}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {log.is_backup ? 'Global backup model' : (promptKeyLabels[log.prompt_key] || log.prompt_key || log.model_key)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(log.changed_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
  const [backupModel, setBackupModel] = useState('google/gemma-4-31b-it:free');
  const [testModalKey, setTestModalKey] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  const ALL_SETTINGS_KEYS = [
    ...PROMPT_KEYS.map((p) => p.key),
    ...PROMPT_KEYS.filter((p) => p.modelKey).map((p) => p.modelKey!),
    ...PROMPT_KEYS.filter((p) => p.countKey).map((p) => p.countKey!),
    'ai_model_backup',
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
        if (row.key === 'ai_model_backup') {
          setBackupModel(row.value);
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

  async function handleModelChange(modelKey: string, newModel: string, label: string, isBackup: boolean, promptKey: string) {
    setModelDrafts((prev) => ({ ...prev, [modelKey]: newModel }));
    if (modelKey === 'ai_model_backup') setBackupModel(newModel);

    await supabase
      .from('admin_settings')
      .upsert({ key: modelKey, value: newModel, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    // Log the model change
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase.from('ai_model_usage_log').insert({
        prompt_key: promptKey,
        model_key: modelKey,
        model_value: newModel,
        model_label: label,
        is_backup: isBackup,
        changed_at: new Date().toISOString(),
        changed_by: session.user.id,
      });
    }
  }

  function handleReset(key: string) {
    if (prompts[key]) {
      setDrafts((prev) => ({ ...prev, [key]: prompts[key].value }));
    }
  }

  function hasChanges(key: string): boolean {
    return prompts[key] !== undefined && drafts[key] !== prompts[key].value;
  }

  const activeTestConfig = testModalKey ? PROMPT_KEYS.find((p) => p.key === testModalKey) : null;
  const activeTestModelValue = activeTestConfig?.modelKey
    ? (modelDrafts[activeTestConfig.modelKey] ?? activeTestConfig.defaultModel ?? 'openai/gpt-oss-120b:free')
    : 'openai/gpt-oss-120b:free';

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
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">AI Prompts</h1>
            <p className="text-sm text-slate-500 mt-1">
              System instructions and model configuration for each edge function. Changes take effect immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLog(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              Model Log
            </button>
            <Badge variant="secondary" className="text-[11px]">
              {PROMPT_KEYS.length} prompts
            </Badge>
          </div>
        </div>

        {/* Backup model row */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-bold text-slate-800">Backup Model</p>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[10px] text-amber-600 font-semibold">amber dot</span>
                  </span>
                  <span className="text-[10px] text-slate-400">in log = backup</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-px">Used automatically when the primary model fails or is rate-limited</p>
              </div>
            </div>
            <div className="ml-auto">
              <ModelSwitcher
                modelKey="ai_model_backup"
                countKey=""
                defaultModel="google/gemma-4-31b-it:free"
                value={backupModel}
                count={0}
                isBackup={true}
                promptKey="ai_model_backup"
                onChange={handleModelChange}
              />
            </div>
          </div>
        </div>

        {/* Prompt cards */}
        <div className="space-y-5">
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

            return (
              <div key={config.key} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{config.label}</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{config.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <ChevronRight className="w-2.5 h-2.5" />
                            {config.usedBy}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                            {config.key}
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
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                      {changed && (
                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                          Unsaved
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Model switcher row */}
                  {config.modelKey && modelValue && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <ModelSwitcher
                        modelKey={config.modelKey}
                        countKey={config.countKey ?? ''}
                        defaultModel={config.defaultModel ?? 'openai/gpt-oss-120b:free'}
                        value={modelValue}
                        count={count}
                        isBackup={false}
                        promptKey={config.key}
                        onChange={handleModelChange}
                      />
                    </div>
                  )}
                </div>

                {/* Textarea */}
                <div className="px-5 py-4 space-y-3">
                  <Textarea
                    value={draft}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [config.key]: e.target.value }))
                    }
                    rows={10}
                    className="text-xs leading-relaxed font-mono border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-y bg-slate-50"
                    placeholder="Prompt content..."
                  />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {draft.length.toLocaleString()} chars
                      </span>
                      {config.testable && modelValue && (
                        <button
                          onClick={() => setTestModalKey(config.key)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          Test prompt
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
                        {isSaving ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test modal */}
      {testModalKey && activeTestConfig && (
        <TestModal
          promptKey={testModalKey}
          promptLabel={activeTestConfig.label}
          modelValue={activeTestModelValue}
          backupModel={backupModel}
          onClose={() => setTestModalKey(null)}
        />
      )}

      {/* Model log modal */}
      {showLog && (
        <ModelLogPanel
          backupModelValue={backupModel}
          onClose={() => setShowLog(false)}
        />
      )}
    </AdminShell>
  );
}
