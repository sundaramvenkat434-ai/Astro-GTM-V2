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
  'seo-content':        '#E8E8E8',
  'lead-generation':    '#E8E8E8',
  'sales-outreach':     '#E8E8E8',
  'social-media':       '#E8E8E8',
  'paid-marketing':     '#E8E8E8',
  'analytics-insights': '#E8E8E8',
};

export const CATEGORY_PASTEL_DARK: Record<string, string> = {
  'seo-content':        '#64748b',
  'lead-generation':    '#64748b',
  'sales-outreach':     '#64748b',
  'social-media':       '#64748b',
  'paid-marketing':     '#64748b',
  'analytics-insights': '#64748b',
};

export const CARD_GRADIENTS: Record<string, string> = {
  'seo-content':        'linear-gradient(145deg, #E8E8E818 0%, rgba(255,255,255,1) 45%)',
  'lead-generation':    'linear-gradient(145deg, #E8E8E818 0%, rgba(255,255,255,1) 45%)',
  'sales-outreach':     'linear-gradient(145deg, #E8E8E818 0%, rgba(255,255,255,1) 45%)',
  'social-media':       'linear-gradient(145deg, #E8E8E818 0%, rgba(255,255,255,1) 45%)',
  'paid-marketing':     'linear-gradient(145deg, #E8E8E818 0%, rgba(255,255,255,1) 45%)',
  'analytics-insights': 'linear-gradient(145deg, #E8E8E818 0%, rgba(255,255,255,1) 45%)',
};

export const CARD_BTN_GRADIENT_MAP: Record<string, string> = {
  'seo-content':        'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)',
  'lead-generation':    'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)',
  'sales-outreach':     'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)',
  'social-media':       'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)',
  'paid-marketing':     'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)',
  'analytics-insights': 'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)',
};

export const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new:          { bg: '#F0FEFF', text: '#0e7490', border: '#a5f3fc' },
  trending:     { bg: '#FBFFEB', text: '#3f6212', border: '#d9f99d' },
  'free-tier':  { bg: '#F0FFF9', text: '#15803d', border: '#6ee7b7' },
  'top-choice': { bg: '#F3F0FF', text: '#6d28d9', border: '#c4b5fd' },
};

export const BADGE_LABELS: Record<string, string> = {
  new:          'New',
  trending:     'Trending',
  'free-tier':  'Free Tier',
  'top-choice': 'Top Choice',
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
  updated_at?: string;
  logo_url?: string | null;
  logo_alt?: string | null;
}

/* ─── MiniStarRating ──────────────────────────────────────────── */
function MiniStarRating({ rating, toolId }: { rating: number; toolId: string }) {
  const count = seededInt(toolId, 3, 10);
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <span className="text-sm font-bold text-slate-800">{rating}</span>
      <span className="text-xs text-slate-500 font-medium">({count})</span>
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
      <div className="flex gap-3.5 p-4 sm:p-5 flex-1">
        {/* Avatar */}
        {tool.logo_url ? (
          <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden mt-0.5 flex items-center justify-center" style={{ boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.08)' }}>
            <img
              src={tool.logo_url}
              alt={tool.logo_alt || `${tool.name} logo`}
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-sm mt-0.5 border border-sky-400/40"
            style={{ background: btnGrad, color: '#ffffff' }}
          >
            {tool.name.charAt(0)}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Link href={`/category/${tool.category}/${tool.slug}`} className="block">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-900 leading-snug group-hover:text-sky-700 transition-colors">
                {tool.name}
              </span>
              {tool.badge && BADGE_STYLES[tool.badge] && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                  style={{ backgroundColor: BADGE_STYLES[tool.badge].bg, color: BADGE_STYLES[tool.badge].text, borderColor: BADGE_STYLES[tool.badge].border }}
                >
                  {BADGE_LABELS[tool.badge] ?? tool.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mt-1">
              {tool.tagline || tool.description}
            </p>
          </Link>

          {/* Use cases */}
          {useCases.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {useCases.map(uc => (
                <Link
                  key={uc}
                  href={`/category/${tool.category}/${tool.slug}#use-cases`}
                  className="shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border bg-white/80 text-slate-600 border-slate-200 transition-colors whitespace-nowrap"
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
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <MiniStarRating rating={tool.rating} toolId={tool.id} />
          <UpvoteButton toolId={tool.id} initialCount={tool.upvotes ?? 0} />
          {views !== undefined && views > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Eye className="w-3.5 h-3.5 shrink-0" />
              {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/category/${tool.category}`}
            className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded transition-all hover:brightness-90 hover:saturate-150"
            style={{
              color: CATEGORY_PASTEL_DARK[tool.category] ?? '#64748b',
              background: (CATEGORY_PASTEL[tool.category] ?? '#B0E4FF') + '55',
            }}
          >
            {SECTION_LABELS[tool.category] ?? tool.category}
          </Link>
          <Link
            href={`/category/${tool.category}/${tool.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 px-3.5 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-400 active:scale-[0.97] transition-all shadow-sm whitespace-nowrap"
          >
            View Tool <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
