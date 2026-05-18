'use client';

import Link from 'next/link';
import { Star, ExternalLink, Eye } from 'lucide-react';
import { UpvoteButton } from '@/components/upvote-button';

/* ─── shared tokens ───────────────────────────────────────────── */
export const SECTION_ORDER = [
  'seo-content', 'lead-generation', 'sales-outreach',
  'social-media', 'paid-marketing', 'analytics-insights',
];

export const SECTION_LABELS: Record<string, string> = {
  'seo-content':        'Content & SEO',
  'lead-generation':    'Lead Generation',
  'sales-outreach':     'Sales Outreach',
  'social-media':       'Social Media',
  'paid-marketing':     'Paid Marketing',
  'analytics-insights': 'Analytics & Insights',
};

export const CATEGORY_PASTEL: Record<string, string> = {
  'seo-content':        '#B0E4FF',
  'lead-generation':    '#B0E4FF',
  'sales-outreach':     '#B0E4FF',
  'social-media':       '#B0E4FF',
  'paid-marketing':     '#B0E4FF',
  'analytics-insights': '#B0E4FF',
};

export const CATEGORY_PASTEL_DARK: Record<string, string> = {
  'seo-content':        '#0369a1',
  'lead-generation':    '#0369a1',
  'sales-outreach':     '#0369a1',
  'social-media':       '#0369a1',
  'paid-marketing':     '#0369a1',
  'analytics-insights': '#0369a1',
};

export const CARD_GRADIENTS: Record<string, string> = {
  'seo-content':        'linear-gradient(145deg, #B0E4FF18 0%, rgba(255,255,255,1) 45%)',
  'lead-generation':    'linear-gradient(145deg, #B0E4FF18 0%, rgba(255,255,255,1) 45%)',
  'sales-outreach':     'linear-gradient(145deg, #B0E4FF18 0%, rgba(255,255,255,1) 45%)',
  'social-media':       'linear-gradient(145deg, #B0E4FF18 0%, rgba(255,255,255,1) 45%)',
  'paid-marketing':     'linear-gradient(145deg, #B0E4FF18 0%, rgba(255,255,255,1) 45%)',
  'analytics-insights': 'linear-gradient(145deg, #B0E4FF18 0%, rgba(255,255,255,1) 45%)',
};

export const CARD_BTN_GRADIENT_MAP: Record<string, string> = {
  'seo-content':        'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'lead-generation':    'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'sales-outreach':     'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'social-media':       'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'paid-marketing':     'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'analytics-insights': 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
};

export const BADGE_STYLES: Record<string, string> = {
  new:     'bg-sky-50 text-sky-700 border-sky-200',
  popular: 'bg-amber-50 text-amber-700 border-amber-200',
  free:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  hot:     'bg-rose-50 text-rose-700 border-rose-200',
};

/* ─── helpers ─────────────────────────────────────────────────── */
export function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return min + Math.floor(((Math.abs(h) % 1000) / 1000) * (max - min + 1));
}

/* ─── types ───────────────────────────────────────────────────── */
export interface ToolCardData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  badge: string | null;
  rating: number;
  rating_count?: string;
  users?: string;
  upvotes: number;
  use_cases: string[];
}

/* ─── MiniStarRating ──────────────────────────────────────────── */
function MiniStarRating({ rating, toolId }: { rating: number; toolId: string }) {
  const count = seededInt(toolId, 3, 10);
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <span className="text-[12px] font-bold text-slate-800">{rating}</span>
      <span className="text-[10.5px] text-slate-500 font-medium">({count})</span>
    </span>
  );
}

/* ─── ToolCard ────────────────────────────────────────────────── */
export function ToolCard({ tool, views }: { tool: ToolCardData; views?: number }) {
  const btnGrad  = CARD_BTN_GRADIENT_MAP[tool.category] ?? 'linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)';
  const bgGrad   = CARD_GRADIENTS[tool.category];
  const accent   = CATEGORY_PASTEL_DARK[tool.category] ?? '#0369a1';
  const useCases = (tool.use_cases as string[]) ?? [];

  return (
    <div
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200"
      style={bgGrad ? { background: bgGrad } : undefined}
    >
      {/* Body */}
      <div className="flex gap-3 p-3 flex-1">
        {/* Avatar */}
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px] shadow-sm mt-0.5 border border-sky-200"
          style={{ background: btnGrad, color: '#0369a1' }}
        >
          {tool.name.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Link href={`/category/${tool.category}/${tool.slug}`} className="block">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="text-[13.5px] font-bold text-slate-900 leading-snug group-hover:text-sky-700 transition-colors">
                {tool.name}
              </span>
              {tool.badge && (
                <span className={`inline-flex items-center px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider border ${BADGE_STYLES[tool.badge] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-600 leading-snug line-clamp-2 mb-2">
              {tool.tagline || tool.description}
            </p>
          </Link>

          {/* Use cases */}
          {useCases.length > 0 && (
            <div className="flex gap-1 overflow-x-auto scrollbar-none mt-auto pb-0.5">
              {useCases.map(uc => (
                <Link
                  key={uc}
                  href={`/category/${tool.category}/${tool.slug}#use-cases`}
                  className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-white/80 text-slate-600 border-slate-200 transition-colors whitespace-nowrap"
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = accent;
                    el.style.borderColor = accent + '60';
                    el.style.background = accent + '0f';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = '';
                    el.style.borderColor = '';
                    el.style.background = '';
                  }}
                >
                  {uc}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <MiniStarRating rating={tool.rating} toolId={tool.id} />
          <UpvoteButton toolId={tool.id} initialCount={tool.upvotes ?? 0} />
          {views !== undefined && views > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Eye className="w-3 h-3 shrink-0" />
              {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/category/${tool.category}`}
            className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded transition-all hover:brightness-90 hover:saturate-150"
            style={{
              color: CATEGORY_PASTEL_DARK[tool.category] ?? '#64748b',
              background: (CATEGORY_PASTEL[tool.category] ?? '#B0E4FF') + '55',
            }}
          >
            {SECTION_LABELS[tool.category] ?? tool.category}
          </Link>
          <Link
            href={`/category/${tool.category}/${tool.slug}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-400 active:scale-[0.97] transition-all shadow-sm whitespace-nowrap"
          >
            View Tool <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
