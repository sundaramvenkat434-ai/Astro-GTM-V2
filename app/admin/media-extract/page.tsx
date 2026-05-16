'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Loader as Loader2,
  Search,
  Image as ImageIcon,
  Globe,
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type LogoSource =
  | 'schema-org'
  | 'meta-itemprop'
  | 'header-nav-img'
  | 'header-nav-svg'
  | 'apple-touch-icon'
  | 'favicon'
  | 'clearbit'
  | 'og:image';

interface LogoResult {
  url: string;
  source: LogoSource;
}

interface ScreenshotResult {
  url: string;
  label: string;
  width: number;
  height: number;
  provider: 'microlink' | 'microlink-fallback';
}

interface SiteMeta {
  title: string;
  description: string;
  canonical: string;
}

interface AttemptRecord {
  strategy: string;
  success: boolean;
  url?: string;
  reason?: string;
}

interface ExtractionDebug {
  logo_attempts: AttemptRecord[];
  screenshot_attempts: AttemptRecord[];
  html_fetched: boolean;
  fetch_error?: string;
}

interface ExtractionResult {
  logo: LogoResult | null;
  screenshots: ScreenshotResult[];
  meta: SiteMeta;
  debug: ExtractionDebug;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  'schema-org': 'Schema.org',
  'meta-itemprop': 'itemprop="logo"',
  'header-nav-img': 'Header/Nav img',
  'header-nav-svg': 'Header/Nav SVG',
  'apple-touch-icon': 'Apple Touch Icon',
  'favicon': 'Favicon',
  'clearbit': 'Clearbit API',
  'og:image': 'OG Image',
};

const PROVIDER_LABELS: Record<string, string> = {
  'microlink': 'Microlink (networkIdle)',
  'microlink-fallback': 'Microlink fallback (DOMContentLoaded)',
};

// ─── Small components ─────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      {SOURCE_LABELS[source] ?? source}
    </span>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const isFallback = provider === 'microlink-fallback';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isFallback ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
      {PROVIDER_LABELS[provider] ?? provider}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
      title="Copy URL"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── Debug panel ──────────────────────────────────────────────────────────────

function AttemptRow({ attempt }: { attempt: AttemptRecord }) {
  return (
    <div className={`flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0 ${attempt.success ? '' : 'opacity-60'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${attempt.success ? 'bg-emerald-100' : 'bg-slate-100'}`}>
        {attempt.success
          ? <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          : <X className="w-3 h-3 text-slate-400" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-slate-700">{attempt.strategy}</p>
        {attempt.success && attempt.url && (
          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{attempt.url}</p>
        )}
        {!attempt.success && attempt.reason && (
          <p className="text-[11px] text-slate-400 mt-0.5">{attempt.reason}</p>
        )}
      </div>
      {attempt.success && (
        <span className="shrink-0 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
          used
        </span>
      )}
    </div>
  );
}

function DebugPanel({ debug }: { debug: ExtractionDebug }) {
  const [open, setOpen] = useState(false);

  const totalLogoAttempts = debug.logo_attempts.length;
  const logoWinner = debug.logo_attempts.find((a) => a.success);
  const ssWinner = debug.screenshot_attempts.find((a) => a.success);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[12px] font-semibold text-slate-600">Extraction debug</span>
          <span className="text-[10px] text-slate-400">
            {debug.html_fetched ? 'HTML fetched' : 'HTML fetch failed'}
            {logoWinner ? ` · logo via ${logoWinner.strategy}` : ' · no logo'}
            {ssWinner ? ` · screenshot via ${ssWinner.strategy}` : ' · no screenshot'}
          </span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">

          {/* HTML fetch status */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">HTML Fetch</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${debug.html_fetched ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span className="text-[12px] text-slate-600">
                {debug.html_fetched ? 'Success — homepage HTML loaded' : `Failed — ${debug.fetch_error ?? 'unknown error'}`}
              </span>
            </div>
          </div>

          {/* Logo attempts */}
          {debug.logo_attempts.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Logo strategies — {totalLogoAttempts} tried
              </p>
              {debug.logo_attempts.map((a, i) => <AttemptRow key={i} attempt={a} />)}
            </div>
          )}

          {/* Screenshot attempts */}
          {debug.screenshot_attempts.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Screenshot strategies — {debug.screenshot_attempts.length} tried
              </p>
              {debug.screenshot_attempts.map((a, i) => <AttemptRow key={i} attempt={a} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Image card ───────────────────────────────────────────────────────────────

function ImageCard({
  url,
  label,
  badge,
  aspect,
}: {
  url: string;
  label: string;
  badge?: React.ReactNode;
  aspect: 'square' | 'video';
}) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      <div className={`relative bg-slate-50 overflow-hidden ${aspect === 'square' ? 'aspect-square' : 'aspect-video'}`}>
        {!loaded && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
          </div>
        )}
        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
            <ImageIcon className="w-8 h-8" />
            <p className="text-[11px]">Failed to load</p>
          </div>
        ) : (
          <img
            src={url}
            alt={label}
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${aspect === 'square' ? 'object-contain p-4' : 'object-cover'}`}
          />
        )}
      </div>
      <div className="px-3.5 py-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-700 leading-snug">{label}</p>
          {badge && <div className="mt-1">{badge}</div>}
          <p className="text-[11px] text-slate-400 mt-1 truncate font-mono">{url}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <CopyButton value={url} />
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaExtractPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/admin/login');
    });
  }, [router]);

  async function handleExtract(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const res = await fetch(`${supabaseUrl}/functions/v1/extract-media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`);
        return;
      }

      setResult(data as ExtractionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error — check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }

  const totalAssets = (result?.logo ? 1 : 0) + (result?.screenshots?.length ?? 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-14">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Media Extractor</span>
            </div>
            <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600">
              Test Feature
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Input card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-5">
            <h1 className="text-[15px] font-bold text-slate-900">Website Media Extractor</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Extracts the brand logo and one homepage screenshot (1600×900) from any website.
            </p>
          </div>

          <form onSubmit={handleExtract} className="flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="pl-9 h-10 text-sm font-mono"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={!url.trim() || loading}
              className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting…</>
              ) : (
                <><Search className="w-4 h-4 mr-2" />Extract Media</>
              )}
            </Button>
          </form>

          {/* Strategy legend */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-3">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-600">Logo priority:</strong> Schema.org → itemprop → header/nav img → header/nav SVG → apple-touch-icon → favicon → Clearbit → og:image.{' '}
              <strong className="text-slate-600">Screenshot:</strong> Microlink headless Chromium at 1600×900, networkIdle with 5s timeout, DOMContentLoaded fallback at 8s.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Extraction failed</p>
              <p className="text-[13px] text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <p className="text-sm text-slate-500">Fetching HTML, extracting logo, capturing screenshot via Microlink…</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* logo skeleton */}
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="aspect-square bg-slate-100 animate-pulse" />
                <div className="p-3 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                  <div className="h-2.5 bg-slate-100 rounded animate-pulse w-3/4" />
                </div>
              </div>
              {/* screenshot skeleton */}
              <div className="rounded-xl border border-slate-100 overflow-hidden col-span-1 sm:col-span-2">
                <div className="aspect-video bg-slate-100 animate-pulse" />
                <div className="p-3 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded animate-pulse w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Site meta summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Extracted from</p>
                  <p className="text-[15px] font-bold text-slate-900 leading-snug">{result.meta.title || url}</p>
                  {result.meta.description && (
                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed max-w-xl line-clamp-2">{result.meta.description}</p>
                  )}
                  <a href={result.meta.canonical} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 mt-2">
                    <ExternalLink className="w-3 h-3" />
                    {result.meta.canonical}
                  </a>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 leading-none">{totalAssets}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">assets</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setResult(null)}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Clear
                  </Button>
                </div>
              </div>
              {totalAssets > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[12px] text-emerald-700 font-medium">Extraction complete — copy any URL to use in the tool editor.</span>
                </div>
              )}
            </div>

            {/* Assets grid */}
            {totalAssets > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.logo && (
                  <ImageCard
                    url={result.logo.url}
                    label="Brand logo"
                    badge={<SourceBadge source={result.logo.source} />}
                    aspect="square"
                  />
                )}
                {result.screenshots.map((s, i) => (
                  <div key={i} className="sm:col-span-2">
                    <ImageCard
                      url={s.url}
                      label={s.label}
                      badge={<ProviderBadge provider={s.provider} />}
                      aspect="video"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {totalAssets === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center">
                <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No assets extracted</p>
                <p className="text-[13px] text-slate-400 mt-1">The site may be blocking automated access or all requests failed.</p>
              </div>
            )}

            {/* Debug panel */}
            <DebugPanel debug={result.debug} />
          </>
        )}
      </div>
    </div>
  );
}
