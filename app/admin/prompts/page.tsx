'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface PromptSetting {
  key: string;
  value: string;
  updated_at: string;
}

// ── Model catalogue ───────────────────────────────────────────────────────────

const OPENROUTER_MODELS = [
  { value: 'minimax/minimax-m2.5:free',                  label: 'MiniMax M2.5',                    provider: 'OpenRouter' },
  { value: 'openai/gpt-oss-120b:free',                   label: 'OpenAI GPT-OSS-120b',             provider: 'OpenRouter' },
  { value: 'deepseek/deepseek-v4-flash:free',            label: 'DeepSeek V4 Flash',               provider: 'OpenRouter' },
  { value: 'qwen/qwen3-next-80b-a3b-instruct:free',      label: 'Qwen3 Next 80B A3B Instruct',     provider: 'OpenRouter' },
  { value: 'nvidia/nemotron-3-super-120b-a12b:free',     label: 'NVIDIA Nemotron 3 Super',         provider: 'OpenRouter' },
  { value: 'google/gemma-4-31b-it:free',                 label: 'Google Gemma 4 31B',              provider: 'OpenRouter' },
  { value: 'meta-llama/llama-3.3-70b-instruct:free',     label: 'Meta Llama 3.3 70B Instruct',    provider: 'OpenRouter' },
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
    description:
      'Used by the structure-page function (Tool Listing flow) to transform raw text into a structured tool-page JSON.',
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
    description:
      'Used by the structure-page function when "Tool Page 2.0" is selected. Same JSON schema as V1 — A/B test variant.',
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
    description:
      "Scores page content against Google's Experience, Expertise, Authoritativeness, and Trustworthiness framework.",
    icon: Shield,
    usedBy: 'run-eeat',
    testable: true,
  },
  {
    key: 'top_x_slug_system_prompt',
    modelKey: 'ai_model_generate_top_x',
    countKey: 'ai_request_count_generate_top_x',
    defaultModel: 'openai/gpt-4o-mini',
    label: 'Top X — Slug & Metadata Generation',
    description:
      'Generates an SEO-optimised slug, page name, tagline, and focus keyword from the selected tools.',
    icon: Zap,
    usedBy: 'generate-top-x',
    testable: true,
  },
  {
    key: 'top_x_content_system_prompt',
    modelKey: 'ai_model_generate_top_x',
    countKey: 'ai_request_count_generate_top_x',
    defaultModel: 'openai/gpt-4o-mini',
    label: 'Top X — Full Content Generation (V1)',
    description:
      'Generates the complete comparison page: entries, comparison table, best-for segments, FAQs, intro, outro, and SEO metadata.',
    icon: Sparkles,
    usedBy: 'generate-top-x',
    testable: true,
  },
  {
    key: 'top_x_content_system_prompt_v2',
    modelKey: 'ai_model_generate_top_x',
    countKey: 'ai_request_count_generate_top_x',
    defaultModel: 'openai/gpt-4o-mini',
    label: 'Top X 2.0 — Full Content Generation (V2)',
    description:
      'Used when "Top X 2.0 Page" is selected. Same JSON schema as V1 — A/B test variant.',
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
    description:
      'Google PageSpeed Insights API key used by run-lighthouse. Required for Lighthouse scoring.',
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
  onChange,
}: {
  modelKey: string;
  countKey: string;
  defaultModel: string;
  value: string;
  count: number;
  onChange: (key: string, val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = OPENROUTER_MODELS.find((m) => m.value === value) ?? {
    value,
    label: value,
    provider: 'OpenRouter',
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 relative">
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
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[300px]">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Model (OpenRouter)</p>
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {OPENROUTER_MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => {
                    onChange(modelKey, m.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${m.value === value ? 'bg-sky-50' : ''}`}
                >
                  <div>
                    <p className={`text-[12px] font-medium ${m.value === value ? 'text-sky-700' : 'text-slate-800'}`}>{m.label}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-px">{m.value}</p>
                  </div>
                  {m.value === value && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Request counter */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <Activity className="w-3 h-3 text-sky-500" />
        <span className="text-[11px] font-semibold text-slate-800">{count.toLocaleString()}</span>
        <span className="text-[10px] text-slate-400">requests</span>
      </div>

      {/* Exact model name (monospace) */}
      <div className="flex items-center gap-1.5 bg-slate-900 rounded-xl px-3 py-2 max-w-[240px] overflow-hidden">
        <span className="text-[10px] font-mono text-slate-300 truncate">{value}</span>
      </div>
    </div>
  );
}

// ── Test Panel ────────────────────────────────────────────────────────────────

function TestPanel({
  promptKey,
  modelValue,
  backupModel,
}: {
  promptKey: string;
  modelValue: string;
  backupModel: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const activeModel = useBackup ? backupModel : modelValue;

  async function runTest() {
    if (!input.trim()) return;
    setRunning(true);
    setResult(null);
    setElapsed(null);

    const start = Date.now();
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token ?? anonKey;

      // Get the current prompt value for the system message
      const { data: settingRow } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', promptKey)
        .maybeSingle();

      const { data: keyRow } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'openrouter_api_key')
        .maybeSingle();

      // Fall back to calling through the edge function proxy approach —
      // we directly hit OpenRouter from the client with the stored key not available,
      // so instead we build a test payload to inspect the raw JSON
      const systemPrompt = settingRow?.value ?? '(no prompt saved)';

      const payload = {
        model: activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };

      setElapsed(Date.now() - start);

      // Return the payload as a preview (can't call OpenRouter from client without key exposure)
      setResult(JSON.stringify(payload, null, 2));
    } catch (err: unknown) {
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setRunning(false);
      setElapsed(Date.now() - start);
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-sky-600 hover:text-sky-800 transition-colors"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Test this prompt
      </button>
    );
  }

  return (
    <div className="border border-sky-200 bg-sky-50/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-sky-600" />
          <span className="text-[12px] font-bold text-sky-800">Prompt Test</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setUseBackup(false)}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${!useBackup ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              Primary: {getModelLabel(modelValue)}
            </button>
            <button
              onClick={() => setUseBackup(true)}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${useBackup ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              Backup: {getModelLabel(backupModel)}
            </button>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors">
          Close
        </button>
      </div>

      <div>
        <p className="text-[10px] font-medium text-slate-500 mb-1">User input to test</p>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="text-xs font-mono border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-y bg-white"
          placeholder="Enter test input for the user message..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={runTest}
          disabled={running || !input.trim()}
          className="h-8 text-xs bg-sky-700 hover:bg-sky-800 text-white"
        >
          {running ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Play className="w-3 h-3 mr-1.5" />}
          Run Test
        </Button>
        {result && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setResult(null); setInput(''); }}
            className="h-8 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Clear
          </Button>
        )}
        {elapsed !== null && (
          <span className="text-[10px] text-slate-400 ml-auto">{elapsed}ms</span>
        )}
      </div>

      {result && (
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raw JSON Payload (Preview)</p>
            <button
              onClick={copyResult}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors"
            >
              {copied ? <CopyCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-[10px] font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap break-words">
            {result}
          </pre>
        </div>
      )}
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

      // Seed model drafts with defaults for any missing keys
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

  async function handleModelChange(modelKey: string, newModel: string) {
    setModelDrafts((prev) => ({ ...prev, [modelKey]: newModel }));

    await supabase
      .from('admin_settings')
      .upsert({ key: modelKey, value: newModel, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    // Also update backup model display if that's what changed
    if (modelKey === 'ai_model_backup') setBackupModel(newModel);
  }

  function handleReset(key: string) {
    if (prompts[key]) {
      setDrafts((prev) => ({ ...prev, [key]: prompts[key].value }));
    }
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
              System instructions and model configuration for each edge function. Changes take effect immediately.
            </p>
          </div>
          <Badge variant="secondary" className="text-[11px]">
            {PROMPT_KEYS.length} prompts
          </Badge>
        </div>

        {/* Backup model row */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-800">Backup Model (all functions)</p>
              <p className="text-[10px] text-slate-500 mt-px">Used automatically when the primary model fails or is rate-limited</p>
            </div>
          </div>
          <div className="ml-auto">
            <ModelSwitcher
              modelKey="ai_model_backup"
              countKey=""
              defaultModel="google/gemma-4-31b-it:free"
              value={backupModel}
              count={0}
              onChange={handleModelChange}
            />
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
                  {/* Model switcher — only for AI prompt cards */}
                  {config.modelKey && modelValue && (
                    <ModelSwitcher
                      modelKey={config.modelKey}
                      countKey={config.countKey ?? ''}
                      defaultModel={config.defaultModel ?? 'openai/gpt-oss-120b:free'}
                      value={modelValue}
                      count={count}
                      onChange={handleModelChange}
                    />
                  )}

                  <Textarea
                    value={draft}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [config.key]: e.target.value }))
                    }
                    rows={12}
                    className="text-xs leading-relaxed font-mono border-slate-200 focus-visible:ring-sky-500/20 focus-visible:border-sky-400 resize-y"
                    placeholder="Prompt content..."
                  />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {draft.length.toLocaleString()} characters
                      </span>
                      {config.testable && modelValue && (
                        <TestPanel
                          promptKey={config.key}
                          modelValue={modelValue}
                          backupModel={backupModel}
                        />
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
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
