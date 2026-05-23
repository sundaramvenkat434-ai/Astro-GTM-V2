import Link from 'next/link';
import {
  Star,
  Users,
  Check,
  X,
  ChevronRight,
  ArrowUpRight,
  Trophy,
  TrendingUp,
  Sparkles,
  Crown,
  BadgeCheck,
  DollarSign,
  Flame,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
} from 'lucide-react';
import { FaqSection } from '@/components/faq-accordion';
import { AuthorBlock } from '@/components/author-block';
import { FALLBACK } from '@/lib/author-schema';
import { AUTHOR_SCHEMA, buildArticleSchema } from '@/lib/author-schema';
import { SiteHeader, PageBreadcrumb } from '@/components/site-header';
import { TopPickCard } from '@/components/top-pick-card';

// ── Types ────────────────────────────────────────────────────────────────────

interface WhoIsItForEntry {
  audience: string;
  score: number;
  note?: string;
}

export interface TopXTool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  long_description?: string;
  category: string;
  tags: string[];
  badge: string | null;
  rating: number;
  rating_count: string;
  users: string;
  features: { title: string; description: string }[];
  use_cases: string[];
  pricing: { plan: string; price: string; features: string[]; highlighted?: boolean }[];
  pros?: string[] | null;
  cons?: string[] | null;
  honest_take?: string[] | null;
  limitations?: string[] | null;
  who_is_it_for?: WhoIsItForEntry[] | null;
  screenshots?: { url: string; alt: string }[] | null;
  logo_url?: string | null;
  logo_alt?: string | null;
  website_url?: string | null;
}

export interface TopXEntry {
  tool_id: string;
  score: number;
  best_for: string;
  pros: string[];
  cons: string[];
  pricing_summary: string;
  verdict: string;
}

export interface ComparisonRow {
  tool_id: string;
  tool_name: string;
  starting_price: string;
  free_plan: boolean;
  rating: number;
  best_for: string;
  key_feature: string;
}

export interface BestForSegment {
  segment: string;
  label: string;
  tool_id: string;
  reason: string;
}

export interface TopXPageData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  tool_ids: string[];
  intro: string;
  outro: string;
  entries: TopXEntry[];
  comparison_table: ComparisonRow[];
  best_for: BestForSegment[];
  faqs: { q: string; a: string }[];
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  noindex: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new:          { bg: '#F0FEFF', text: '#0e7490', border: '#a5f3fc' },
  trending:     { bg: '#FBFFEB', text: '#3f6212', border: '#d9f99d' },
  'free-tier':  { bg: '#F0FFF9', text: '#15803d', border: '#6ee7b7' },
  'top-choice': { bg: '#F3F0FF', text: '#6d28d9', border: '#c4b5fd' },
};

const BADGE_LABELS: Record<string, string> = {
  new:          'New',
  trending:     'Trending',
  'free-tier':  'Free Tier',
  'top-choice': 'Top Choice',
};

const RANK_MEDAL = [
  { bg: 'bg-amber-400', text: 'text-white', ring: 'ring-amber-300' },
  { bg: 'bg-slate-400', text: 'text-white', ring: 'ring-slate-300' },
  { bg: 'bg-orange-400', text: 'text-white', ring: 'ring-orange-300' },
];

const SEGMENT_ICONS: Record<string, typeof Crown> = {
  beginners: Sparkles,
  free: DollarSign,
  advanced: Flame,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function StarRow({ rating, count }: { rating: number; count: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : s - 0.5 <= rating
                ? 'fill-amber-200 text-amber-300'
                : 'fill-slate-100 text-slate-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-800">{rating}</span>
      <span className="text-xs text-slate-400">({count})</span>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 90 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    score >= 75 ? 'text-sky-600 bg-sky-50 border-sky-200' :
    score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-slate-500 bg-slate-50 border-slate-200';
  return (
    <div className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${color}`}>
      <span className="text-sm font-bold leading-none">{score}</span>
      <span className="text-[8px] uppercase tracking-wide opacity-70">score</span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  page: TopXPageData;
  tools: TopXTool[];
  categoryLabel: string;
  siteUrl: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TopXPageView({ page, tools, categoryLabel, siteUrl }: Props) {
  const pageUrl = `${siteUrl}/category/${page.category}/${page.slug}`;
  const toolMap = Object.fromEntries(tools.map((t) => [t.id, t]));

  const orderedEntries: { tool: TopXTool; entry: TopXEntry }[] = (page.tool_ids || [])
    .map((id) => {
      const tool = toolMap[id];
      const entry = (page.entries || []).find((e) => e.tool_id === id);
      if (!tool) return null;
      return { tool, entry: entry || { tool_id: id, score: Math.round(tool.rating * 20), best_for: '', pros: [], cons: [], pricing_summary: '', verdict: '' } };
    })
    .filter(Boolean) as { tool: TopXTool; entry: TopXEntry }[];

  const topTool = orderedEntries[0]?.tool;

  // ── JSON-LD ──
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: categoryLabel, item: `${siteUrl}/category/${page.category}` },
      { '@type': 'ListItem', position: 3, name: page.name, item: pageUrl },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.name,
    description: page.meta_description || page.tagline,
    url: pageUrl,
    numberOfItems: tools.length,
    itemListElement: orderedEntries.map(({ tool }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tool.name,
      description: tool.tagline,
      url: `${siteUrl}/category/${tool.category}/${tool.slug}`,
    })),
  };

  const faqLd = page.faqs?.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  const articleLd = buildArticleSchema({ headline: page.meta_title || page.name, pageUrl });

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(AUTHOR_SCHEMA) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <SiteHeader />
      <PageBreadcrumb
        crumbs={[
          { label: categoryLabel, href: `/category/${page.category}` },
          { label: page.name },
        ]}
      />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {categoryLabel}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{tools.length} tools compared</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-3">
                {page.name}
              </h1>
              {page.tagline && (
                <p className="text-[15px] sm:text-[17px] text-slate-500 leading-relaxed max-w-2xl">{page.tagline}</p>
              )}
              {page.intro && (
                <p className="text-[14px] text-slate-600 leading-relaxed mt-4 max-w-2xl">{page.intro}</p>
              )}
            </div>

            {topTool && orderedEntries[0] && (
              <TopPickCard
                tool={topTool}
                entry={{
                  score: orderedEntries[0].entry.score,
                  best_for: orderedEntries[0].entry.best_for,
                  verdict: orderedEntries[0].entry.verdict,
                }}
                rank={0}
                totalCount={orderedEntries.length}
              />
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* ── RANKINGS AT A GLANCE ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Rankings at a Glance</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {orderedEntries.map(({ tool, entry }, i) => {
              const medal = RANK_MEDAL[i];
              return (
                <Link
                  key={tool.id}
                  href={`/category/${tool.category}/${tool.slug}`}
                  className={`group flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 ${
                    i === 0
                      ? 'bg-gradient-to-r from-amber-50/70 to-white border-amber-200/60 hover:border-amber-300 hover:shadow-md hover:shadow-amber-50'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${medal ? `${medal.bg} ${medal.text}` : 'bg-slate-100 text-slate-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900 text-[14px] group-hover:text-sky-700 transition-colors">{tool.name}</span>
                      {i === 0 && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wide border border-amber-200">
                          <Crown className="w-2.5 h-2.5" /> Best
                        </span>
                      )}
                      {tool.badge && BADGE_STYLES[tool.badge] && (
                        <span
                          className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border"
                          style={{ backgroundColor: BADGE_STYLES[tool.badge].bg, color: BADGE_STYLES[tool.badge].text, borderColor: BADGE_STYLES[tool.badge].border }}
                        >
                          {BADGE_LABELS[tool.badge] ?? tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 truncate mb-1.5">{tool.tagline}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= Math.floor(tool.rating) ? 'fill-amber-400 text-amber-400' : s - 0.5 <= tool.rating ? 'fill-amber-200 text-amber-300' : 'fill-slate-100 text-slate-200'}`} />
                        ))}
                        <span className="text-[11px] font-bold text-slate-700 ml-1">{tool.rating}</span>
                      </div>
                      {entry.best_for && (
                        <span className="hidden sm:inline text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium truncate max-w-[160px]">
                          {entry.best_for}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {entry.score > 0 && (
                      <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">{entry.score}</span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── BEST FOR SEGMENTS ── */}
        {page.best_for?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Best For</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {page.best_for.map((seg) => {
                const tool = toolMap[seg.tool_id];
                const Icon = SEGMENT_ICONS[seg.segment] || BadgeCheck;
                if (!tool) return null;
                return (
                  <Link
                    key={seg.segment}
                    href={`/category/${tool.category}/${tool.slug}`}
                    className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{seg.label}</span>
                    </div>
                    <p className="font-bold text-slate-900 mb-1">{tool.name}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{seg.reason}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-slate-400 group-hover:text-slate-700 transition-colors font-medium">
                      View tool <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── USE CASE COMPARISON ── */}
        {orderedEntries.some(({ tool }) => tool.use_cases?.length > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Use Cases Compared</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                {orderedEntries.map(({ tool }, i) => {
                  if (!tool.use_cases?.length) return null;
                  const primary = tool.use_cases[0];
                  const secondary = tool.use_cases.slice(1, 4);
                  return (
                    <div key={tool.id} className="px-5 py-4 flex items-start gap-4">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${RANK_MEDAL[i] ? `${RANK_MEDAL[i].bg} ${RANK_MEDAL[i].text}` : 'bg-slate-100 text-slate-600'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/category/${tool.category}/${tool.slug}`} className="text-[13px] font-bold text-slate-900 hover:text-sky-700 transition-colors">{tool.name}</Link>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-800 bg-sky-50 border-2 border-sky-200 px-2.5 py-1 rounded-lg">
                            <Zap className="w-3 h-3 text-sky-500 shrink-0" />
                            {primary}
                            <span className="text-[8px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-1 py-px rounded">Primary</span>
                          </span>
                          {secondary.map((uc) => (
                            <span key={uc} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              {uc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── DETAILED TOOL REVIEWS ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Editor Reviews</h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {orderedEntries.map(({ tool, entry }, i) => {
            const medal = RANK_MEDAL[i];
            const strengths = tool.honest_take?.slice(0, 3) ?? entry.pros?.slice(0, 3) ?? [];
            const weaknesses = tool.limitations?.slice(0, 3) ?? entry.cons?.slice(0, 3) ?? [];
            const whoFit = (tool.who_is_it_for as WhoIsItForEntry[] | null)?.slice(0, 3) ?? [];

            return (
              <div key={tool.id} id={`tool-${i + 1}`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100 transition-all">

                {/* Card header */}
                <div className="p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ring-2 ${medal ? `${medal.bg} ${medal.text} ${medal.ring}` : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                      #{i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {tool.logo_url && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 bg-white shrink-0 flex items-center justify-center">
                            <img src={tool.logo_url} alt={tool.logo_alt || tool.name} width={32} height={32} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-slate-900">{tool.name}</h3>
                        {i === 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-200">
                            <Crown className="w-2.5 h-2.5" /> Editor&apos;s Choice
                          </span>
                        )}
                        {tool.badge && BADGE_STYLES[tool.badge] && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                            style={{ backgroundColor: BADGE_STYLES[tool.badge].bg, color: BADGE_STYLES[tool.badge].text, borderColor: BADGE_STYLES[tool.badge].border }}
                          >
                            {BADGE_LABELS[tool.badge] ?? tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mb-3 leading-relaxed">{tool.tagline}</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <StarRow rating={tool.rating} count={tool.rating_count} />
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{tool.users}</span> users
                        </div>
                        {entry.best_for && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                            Best for: {entry.best_for}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                      {entry.score > 0 && <ScoreRing score={entry.score} />}
                      <Link
                        href={`/category/${tool.category}/${tool.slug}`}
                        className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors whitespace-nowrap"
                      >
                        Full Review <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Verdict */}
                  {entry.verdict && (
                    <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Our Verdict</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.verdict}</p>
                    </div>
                  )}
                </div>

                {/* ── Strengths & Limitations (from tool page editorial) ── */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                  <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {strengths.length > 0 && (
                      <div className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ThumbsUp className="w-3.5 h-3.5 text-sky-600" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Strengths</p>
                        </div>
                        <ul className="space-y-2">
                          {strengths.map((s, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-600 leading-relaxed">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {weaknesses.length > 0 && (
                      <div className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ThumbsDown className="w-3.5 h-3.5 text-amber-500" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Limitations</p>
                        </div>
                        <ul className="space-y-2">
                          {weaknesses.map((w, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <X className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-600 leading-relaxed">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Standout Features + Pricing ── */}
                <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  {/* Key features */}
                  <div className="px-6 py-4 sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Standout Features</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tool.features?.slice(0, 4).map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-sky-500" />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-slate-800">{f.title}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing highlight */}
                  <div className="px-6 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Pricing</p>
                    {entry.pricing_summary ? (
                      <p className="text-sm font-semibold text-slate-800 mb-2">{entry.pricing_summary}</p>
                    ) : tool.pricing?.length > 0 ? (
                      <div className="space-y-1.5">
                        {tool.pricing.slice(0, 3).map((p, j) => (
                          <div key={j} className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-600 font-medium">{p.plan}</span>
                            <span className="text-[11px] font-bold text-slate-800">{p.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* ── Who Is It For (compressed) ── */}
                {whoFit.length > 0 && (
                  <div className="border-t border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-3.5 h-3.5 text-sky-500" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best Suited For</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {whoFit.map((w, j) => (
                        <div key={j} className="inline-flex items-center gap-2 text-[11px] bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-lg">
                          <span className="font-semibold text-sky-800">{w.audience}</span>
                          {w.note && <span className="text-sky-600 hidden sm:inline">- {w.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer: tags + CTA */}
                <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {tool.use_cases.slice(0, 3).map((uc) => (
                      <span key={uc} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{uc}</span>
                    ))}
                  </div>
                  <Link
                    href={`/category/${tool.category}/${tool.slug}`}
                    className="sm:hidden shrink-0 inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Review <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── SIDE-BY-SIDE COMPARISON TABLE ── */}
        {page.comparison_table?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Side-by-Side Comparison</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Tool</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Starting Price</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Free Plan</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Rating</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Best For</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Key Feature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {page.comparison_table.map((row, i) => {
                      const tool = toolMap[row.tool_id];
                      return (
                        <tr key={row.tool_id} className={`group hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-amber-50/40' : ''}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              {i === 0 && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              <div>
                                <Link
                                  href={tool ? `/category/${tool.category}/${tool.slug}` : '#'}
                                  className="font-semibold text-sm text-slate-900 hover:text-sky-700 transition-colors"
                                >
                                  {row.tool_name}
                                </Link>
                                {i === 0 && <span className="ml-1.5 text-[9px] text-amber-600 font-bold uppercase">#1 Pick</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-semibold text-slate-800">{row.starting_price}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {row.free_plan
                              ? <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                              : <X className="w-4 h-4 text-slate-300 mx-auto" />
                            }
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-bold text-slate-800">{row.rating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{row.best_for}</span>
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <span className="text-xs text-slate-500">{row.key_feature}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── EDITORIAL OPINIONS SUMMARY ── */}
        {orderedEntries.some(({ tool }) => (tool.honest_take?.length ?? 0) > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Editorial Insights</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {orderedEntries.map(({ tool }, i) => {
                if (!tool.honest_take?.length) return null;
                return (
                  <div key={tool.id} className="px-6 py-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${RANK_MEDAL[i] ? `${RANK_MEDAL[i].bg} ${RANK_MEDAL[i].text}` : 'bg-slate-100 text-slate-600'}`}>
                        {i + 1}
                      </div>
                      <Link href={`/category/${tool.category}/${tool.slug}`} className="text-[14px] font-bold text-slate-900 hover:text-sky-700 transition-colors">
                        {tool.name}
                      </Link>
                      <Lightbulb className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      {tool.honest_take[0]}
                    </p>
                    {tool.honest_take.length > 1 && (
                      <Link href={`/category/${tool.category}/${tool.slug}#section-our-opinion`} className="inline-flex items-center gap-1 text-[11px] text-sky-600 font-medium mt-2 hover:text-sky-800 transition-colors">
                        Read full editorial <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── WORKFLOW FIT (Who Is It For comparison) ── */}
        {orderedEntries.some(({ tool }) => ((tool.who_is_it_for as WhoIsItForEntry[] | null)?.length ?? 0) > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Workflow Fit</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <p className="text-[13px] text-slate-500 mb-4 -mt-2">Which tool fits your team type and workflow best</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orderedEntries.map(({ tool }, i) => {
                const entries = (tool.who_is_it_for as WhoIsItForEntry[] | null)?.slice(0, 2);
                if (!entries?.length) return null;
                return (
                  <Link
                    key={tool.id}
                    href={`/category/${tool.category}/${tool.slug}#section-who-is-it-for`}
                    className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${RANK_MEDAL[i] ? `${RANK_MEDAL[i].bg} ${RANK_MEDAL[i].text}` : 'bg-slate-100 text-slate-600'}`}>
                        {i + 1}
                      </div>
                      <span className="text-[13px] font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{tool.name}</span>
                    </div>
                    <div className="space-y-2">
                      {entries.map((e, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-sky-600" />
                          </div>
                          <span className="text-[11px] text-slate-700 font-medium">{e.audience}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 group-hover:text-sky-500 font-medium transition-colors">
                      See full fit analysis
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── PRICING OVERVIEW ── */}
        {orderedEntries.some(({ tool }) => tool.pricing?.length > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap">Pricing Overview</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Tool</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Plans</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Free Tier</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Starting At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderedEntries.map(({ tool, entry }, i) => {
                      if (!tool.pricing?.length) return null;
                      const hasFree = tool.pricing.some((p) => /free/i.test(p.plan) || /^\$?0/i.test(p.price.trim()));
                      const lowestPaid = tool.pricing.find((p) => !/free/i.test(p.plan) && !/^\$?0/i.test(p.price.trim()));
                      return (
                        <tr key={tool.id} className={`hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-5 py-3.5">
                            <Link href={`/category/${tool.category}/${tool.slug}`} className="font-semibold text-sm text-slate-900 hover:text-sky-700 transition-colors">
                              {tool.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-slate-600">{tool.pricing.length} plan{tool.pricing.length > 1 ? 's' : ''}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {hasFree
                              ? <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                              : <X className="w-4 h-4 text-slate-300 mx-auto" />
                            }
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-semibold text-slate-800">
                              {entry.pricing_summary || lowestPaid?.price || tool.pricing[0]?.price || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── OUTRO / FINAL VERDICT ── */}
        {page.outro && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Final Verdict</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">{page.outro}</p>
            {topTool && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Our #1 recommendation</p>
                  <p className="font-bold text-slate-900">{topTool.name}</p>
                </div>
                <Link
                  href={`/category/${topTool.category}/${topTool.slug}`}
                  className="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  See Full Review <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ── FAQ ── */}
        {page.faqs?.length > 0 && <FaqSection faqs={page.faqs} />}

        {/* ── AUTHOR ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6">
          <AuthorBlock author={FALLBACK} />
        </div>

        {/* ── BACK LINK ── */}
        <div className="text-center pb-4">
          <Link
            href={`/category/${page.category}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            All {categoryLabel} tools
          </Link>
        </div>

      </div>
    </div>
  );
}
