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
  'seo-content':        'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'lead-generation':    'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'sales-outreach':     'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'social-media':       'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'paid-marketing':     'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'analytics-insights': 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
};

export const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new:          { bg: '#F0FEFF', text: '#0e7490', border: '#a5f3fc' },
  trending:     { bg: '#FFFFF0', text: '#854d0e', border: '#fde68a' },
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
              {tool.badge && BADGE_STYLES[tool.badge] && (
                <span
                  className="inline-flex items-center px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider border"
                  style={{ backgroundColor: BADGE_STYLES[tool.badge].bg, color: BADGE_STYLES[tool.badge].text, borderColor: BADGE_STYLES[tool.badge].border }}
                >
                  {BADGE_LABELS[tool.badge] ?? tool.badge}
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
