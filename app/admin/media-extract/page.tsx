'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader as Loader2, Search, Image as ImageIcon, Globe, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Copy, Check, ExternalLink, RefreshCw, Info } from 'lucide-react';

// ─── Types matching the edge function response ────────────────────────────────

interface LogoResult {
  url: string;
  source: 'og:image' | 'schema-org' | 'meta-itemprop' | 'apple-touch-icon' | 'favicon' | 'clearbit';
}

interface ScreenshotResult {
  url: string;
  label: string;
  width: number;
  height: number;
}

interface SiteMeta {
  title: string;
  description: string;
  canonical: string;
}

interface ExtractionResult {
  logo: LogoResult | null;
  screenshots: ScreenshotResult[];
  meta: SiteMeta;
  errors: string[];
}

// ─── Source badge ─────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  'og:image': 'OG Image',
  'schema-org': 'Schema.org',
  'meta-itemprop': 'Meta itemprop',
  'apple-touch-icon': 'Apple Touch Icon',
  'favicon': 'Favicon',
  'clearbit': 'Clearbit API',
};

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      {SOURCE_LABELS[source] ?? source}
    </span>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

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
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      {/* Image area */}
      <div
        className={`relative bg-slate-50 overflow-hidden ${aspect === 'square' ? 'aspect-square' : 'aspect-video'}`}
      >
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
            <ImageIcon className="w-8 h-8" />
            <p className="text-[11px]">Failed to load</p>
          </div>
        ) : (
          <img
            src={url}
            alt={label}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${aspect === 'square' ? 'object-contain p-4' : 'object-cover'}`}
          />
        )}
      </div>

      {/* Footer */}
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

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Input card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="mb-5">
            <h1 className="text-[15px] font-bold text-slate-900">Website Media Extractor</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Extracts the logo and up to 4 real-browser screenshots from any website. Screenshots are captured via Microlink (headless Chromium, JS rendered).
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

          {/* Info note */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-3">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-600">Logo:</strong> extracted from OG image → Schema.org → Apple touch icon → Clearbit API fallback.{' '}
              <strong className="text-slate-600">Screenshots:</strong> captured at 1600×900 via Microlink (real Chromium, network-idle, no API key required for low volume). Some sites may block headless browsers.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3.5 mb-6">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Extraction failed</p>
              <p className="text-[13px] text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500">Fetching homepage, extracting logo, capturing screenshots…</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                    <div className="aspect-video bg-slate-100 animate-pulse" />
                    <div className="p-3 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded animate-pulse w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">

            {/* Site meta + summary bar */}
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
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 leading-none">{totalAssets}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">assets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 leading-none">{result.screenshots.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">screenshots</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => { setResult(null); }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* Extraction warnings */}
              {result.errors.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {e}
                    </div>
                  ))}
                </div>
              )}

              {totalAssets > 0 && (
                <div className="mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[12px] text-emerald-700 font-medium">Extraction complete — copy any URL to use in the tool editor.</span>
                </div>
              )}
            </div>

            {/* Logo */}
            {result.logo && (
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Logo</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ImageCard
                    url={result.logo.url}
                    label="Brand logo"
                    badge={<SourceBadge source={result.logo.source} />}
                    aspect="square"
                  />
                </div>
              </div>
            )}

            {/* Screenshots */}
            {result.screenshots.length > 0 && (
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Screenshots — {result.screenshots[0]?.width ?? 1600}×{result.screenshots[0]?.height ?? 900}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.screenshots.map((s, i) => (
                    <ImageCard
                      key={i}
                      url={s.url}
                      label={s.label}
                      aspect="video"
                    />
                  ))}
                </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
