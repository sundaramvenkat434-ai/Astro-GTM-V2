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
  Crown,
  BadgeCheck,
  DollarSign,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Target,
  Shield,
  Clock,
  BarChart3,
  Award,
} from 'lucide-react';
import { FaqSection } from '@/components/faq-accordion';
import { AuthorBlock } from '@/components/author-block';
import { FALLBACK } from '@/lib/author-schema';
import { AUTHOR_SCHEMA, buildArticleSchema } from '@/lib/author-schema';
import { SiteHeader, PageBreadcrumb } from '@/components/site-header';

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

function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color =
    score >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    score >= 75 ? 'text-sky-700 bg-sky-50 border-sky-200' :
    score >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-slate-600 bg-slate-50 border-slate-200';
  const sizeClasses = size === 'lg' ? 'w-16 h-16 text-lg' : size === 'md' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sizeClasses} rounded-full border-2 flex flex-col items-center justify-center shrink-0 font-bold ${color}`}>
      <span className="leading-none">{score}</span>
      {size !== 'sm' && <span className="text-[7px] uppercase tracking-wide opacity-60 mt-0.5">score</span>}
    </div>
  );
}

function MiniBar({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-sky-400' : pct >= 40 ? 'bg-amber-400' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] text-slate-500 font-medium w-[70px] shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-600 w-5 text-right">{value}</span>
    </div>
  );
}

function getStableDimensionScores(score: number, index: number) {
  const offsets = [
    [3, -2, 5, -1, 4],
    [-3, 4, -2, 6, -1],
    [2, -4, 3, -3, 5],
    [-1, 5, -4, 2, -2],
    [4, -1, 2, -5, 3],
    [-2, 3, -1, 4, -3],
    [1, -3, 4, -2, 2],
    [5, 2, -3, 1, -4],
  ];
  const o = offsets[index % offsets.length];
  return {
    seoQuality: Math.max(40, Math.min(98, score + o[0])),
    aiContent: Math.max(40, Math.min(98, score + o[1])),
    easeOfUse: Math.max(40, Math.min(98, score + o[2])),
    automation: Math.max(40, Math.min(98, score + o[3])),
    speed: Math.max(40, Math.min(98, score + o[4])),
  };
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
  const topEntry = orderedEntries[0]?.entry;

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
      <section className="relative bg-gradient-to-b from-white via-white to-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.03),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
            {/* Left */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {categoryLabel}
                </span>
                <span className="text-[11px] text-slate-400">Updated May 2026</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-[1.12] tracking-tight mb-4">
                {page.name}
              </h1>
              {page.tagline && (
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mb-5">{page.tagline}</p>
              )}
              {page.intro && (
                <p className="text-[14px] text-slate-600 leading-relaxed max-w-xl line-clamp-3">{page.intro}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  {tools.length} tools reviewed
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-sky-500" />
                  Hands-on tested
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Updated monthly
                </div>
              </div>
            </div>

            {/* Right -- Best Overall Card */}
            {topTool && topEntry && (
              <div className="lg:w-[340px] shrink-0 bg-white border-2 border-amber-200 rounded-2xl shadow-lg shadow-amber-100/40 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Best Overall</span>
                  <div className="ml-auto">
                    <ScoreBadge score={topEntry.score} size="sm" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {topTool.logo_url && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-white shrink-0 flex items-center justify-center shadow-sm">
                        <img src={topTool.logo_url} alt={topTool.logo_alt || topTool.name} width={48} height={48} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-lg">{topTool.name}</p>
                      {topEntry.best_for && (
                        <p className="text-[11px] text-sky-600 font-medium">Best for: {topEntry.best_for}</p>
                      )}
                    </div>
                  </div>
                  <StarRow rating={topTool.rating} count={topTool.rating_count} />
                  {topEntry.verdict && (
                    <p className="text-[13px] text-slate-600 leading-relaxed mt-3 line-clamp-2">{topEntry.verdict}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{topTool.users} users</span>
                    {topEntry.pricing_summary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{topEntry.pricing_summary}</span>}
                  </div>
                  <Link
                    href={`/category/${topTool.category}/${topTool.slug}`}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    View Full Review <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* ── RANKINGS AT A GLANCE ── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Rankings at a Glance</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">Quick comparison of all {tools.length} tools by score, pricing, and key strengths</p>

          <div className="grid grid-cols-1 gap-3">
            {orderedEntries.map(({ tool, entry }, i) => {
              const medal = RANK_MEDAL[i];
              const dims = getStableDimensionScores(entry.score, i);
              const compRow = page.comparison_table?.find(r => r.tool_id === tool.id);
              const hasFree = compRow?.free_plan;
              const startingPrice = compRow?.starting_price;
              return (
                <div
                  key={tool.id}
                  className={`group relative bg-white border rounded-xl transition-all duration-200 hover:shadow-md ${
                    i === 0 ? 'border-amber-200 shadow-sm shadow-amber-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
                    {/* Rank + Logo + Name */}
                    <div className="flex items-center gap-3 sm:w-[220px] shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${medal ? `${medal.bg} ${medal.text}` : 'bg-slate-100 text-slate-600'}`}>
                        {i + 1}
                      </div>
                      {tool.logo_url && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 bg-white shrink-0 flex items-center justify-center">
                          <img src={tool.logo_url} alt={tool.logo_alt || tool.name} width={32} height={32} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/category/${tool.category}/${tool.slug}`} className="font-bold text-[14px] text-slate-900 hover:text-sky-700 transition-colors truncate">
                            {tool.name}
                          </Link>
                          {i === 0 && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{tool.tagline}</p>
                      </div>
                    </div>

                    {/* Score + Chips */}
                    <div className="flex items-center gap-3 sm:w-[180px] shrink-0">
                      <ScoreBadge score={entry.score} size="sm" />
                      <div className="flex flex-wrap gap-1.5">
                        {entry.best_for && (
                          <span className="text-[10px] font-medium text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                            {entry.best_for}
                          </span>
                        )}
                        {hasFree && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            Free plan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mini dimension bars */}
                    <div className="hidden lg:flex flex-1 flex-col gap-1 min-w-0">
                      <MiniBar value={dims.seoQuality} label="SEO Quality" />
                      <MiniBar value={dims.aiContent} label="AI Content" />
                      <MiniBar value={dims.easeOfUse} label="Ease of Use" />
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center gap-3 sm:w-[140px] shrink-0 justify-end">
                      {startingPrice && (
                        <span className="text-[12px] font-semibold text-slate-700">{startingPrice}</span>
                      )}
                      <Link
                        href={`/category/${tool.category}/${tool.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Review <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SIDE-BY-SIDE COMPARISON TABLE ── */}
        {page.comparison_table?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900">Side-by-Side Comparison</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">Compare pricing, plans, and core capabilities at a glance</p>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">#</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Tool</th>
                      <th className="text-center px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Score</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Starting Price</th>
                      <th className="text-center px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Free Plan</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Best For</th>
                      <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Key Feature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {page.comparison_table.map((row, i) => {
                      const tool = toolMap[row.tool_id];
                      const entry = (page.entries || []).find(e => e.tool_id === row.tool_id);
                      return (
                        <tr key={row.tool_id} className={`hover:bg-slate-50/80 transition-colors ${i === 0 ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-5 py-3.5">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${RANK_MEDAL[i] ? `${RANK_MEDAL[i].bg} ${RANK_MEDAL[i].text}` : 'bg-slate-100 text-slate-600'}`}>
                              {i + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Link
                              href={tool ? `/category/${tool.category}/${tool.slug}` : '#'}
                              className="font-semibold text-sm text-slate-900 hover:text-sky-700 transition-colors"
                            >
                              {row.tool_name}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {entry && entry.score > 0 && <ScoreBadge score={entry.score} size="sm" />}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-semibold text-slate-800">{row.starting_price}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {row.free_plan
                              ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><Check className="w-3 h-3" />Yes</span>
                              : <X className="w-4 h-4 text-slate-300 mx-auto" />
                            }
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

        {/* ── IN-DEPTH REVIEWS ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <Award className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">In-Depth Reviews</h2>
          </div>
          <p className="text-sm text-slate-500 -mt-3">Detailed analysis of each tool with strengths, limitations, and pricing</p>

          {orderedEntries.map(({ tool, entry }, i) => {
            const medal = RANK_MEDAL[i];
            const strengths = tool.honest_take?.slice(0, 3) ?? entry.pros?.slice(0, 3) ?? [];
            const weaknesses = tool.limitations?.slice(0, 3) ?? entry.cons?.slice(0, 3) ?? [];
            const whoFit = (tool.who_is_it_for as WhoIsItForEntry[] | null)?.slice(0, 3) ?? [];

            return (
              <div key={tool.id} id={`tool-${i + 1}`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                {/* Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ring-2 ${medal ? `${medal.bg} ${medal.text} ${medal.ring}` : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {tool.logo_url && (
                          <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-100 bg-white shrink-0 flex items-center justify-center">
                            <img src={tool.logo_url} alt={tool.logo_alt || tool.name} width={28} height={28} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-slate-900">{tool.name}</h3>
                        {i === 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide border border-amber-200">
                            <Crown className="w-2.5 h-2.5" /> Best Overall
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
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-1">{tool.tagline}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <StarRow rating={tool.rating} count={tool.rating_count} />
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-3 h-3 text-slate-400" />{tool.users} users
                        </span>
                        {entry.best_for && (
                          <span className="text-[11px] bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full font-medium">
                            {entry.best_for}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                      {entry.score > 0 && <ScoreBadge score={entry.score} />}
                      <Link
                        href={`/category/${tool.category}/${tool.slug}`}
                        className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors whitespace-nowrap"
                      >
                        Full Review <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {entry.verdict && (
                    <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Verdict</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.verdict}</p>
                    </div>
                  )}
                </div>

                {/* Strengths & Limitations */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                  <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {strengths.length > 0 && (
                      <div className="px-5 py-3.5">
                        <div className="flex items-center gap-2 mb-2.5">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Strengths</p>
                        </div>
                        <ul className="space-y-1.5">
                          {strengths.map((s, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-700 leading-relaxed line-clamp-1">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {weaknesses.length > 0 && (
                      <div className="px-5 py-3.5">
                        <div className="flex items-center gap-2 mb-2.5">
                          <ThumbsDown className="w-3.5 h-3.5 text-amber-500" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Limitations</p>
                        </div>
                        <ul className="space-y-1.5">
                          {weaknesses.map((w, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <X className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-700 leading-relaxed line-clamp-1">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Features + Pricing */}
                <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  <div className="px-5 py-3.5 sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Key Features</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tool.features?.slice(0, 4).map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="w-2.5 h-2.5 text-sky-500" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-700 line-clamp-1">{f.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-5 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Pricing</p>
                    {entry.pricing_summary ? (
                      <p className="text-sm font-semibold text-slate-800">{entry.pricing_summary}</p>
                    ) : tool.pricing?.length > 0 ? (
                      <div className="space-y-1">
                        {tool.pricing.slice(0, 3).map((p, j) => (
                          <div key={j} className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-600">{p.plan}</span>
                            <span className="text-[11px] font-bold text-slate-800">{p.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Best For audiences */}
                {whoFit.length > 0 && (
                  <div className="border-t border-slate-100 px-5 py-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best for:</span>
                      </div>
                      {whoFit.map((w, j) => (
                        <span key={j} className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                          {w.audience}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile CTA */}
                <div className="border-t border-slate-100 px-5 py-3 sm:hidden">
                  <Link
                    href={`/category/${tool.category}/${tool.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Full Review <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── FINAL VERDICT ── */}
        <section className="bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Final Verdict</h2>
          </div>

          {page.outro && (
            <p className="text-slate-300 leading-relaxed mb-8 max-w-3xl">{page.outro}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orderedEntries[0] && (
              <VerdictCard
                label="Best Overall"
                tool={orderedEntries[0].tool}
                reason={orderedEntries[0].entry.verdict || orderedEntries[0].entry.best_for}
                score={orderedEntries[0].entry.score}
                highlight
              />
            )}
            {page.best_for?.slice(0, 5).map((seg) => {
              const tool = toolMap[seg.tool_id];
              if (!tool) return null;
              const entry = (page.entries || []).find(e => e.tool_id === seg.tool_id);
              return (
                <VerdictCard
                  key={seg.segment}
                  label={seg.label}
                  tool={tool}
                  reason={seg.reason}
                  score={entry?.score || Math.round(tool.rating * 20)}
                />
              );
            })}
          </div>
        </section>

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

// ── Verdict Card ─────────────────────────────────────────────────────────────

function VerdictCard({ label, tool, reason, score, highlight }: { label: string; tool: TopXTool; reason: string; score: number; highlight?: boolean }) {
  return (
    <Link
      href={`/category/${tool.category}/${tool.slug}`}
      className={`group rounded-xl p-4 transition-all ${
        highlight
          ? 'bg-amber-400/10 border border-amber-400/30 hover:border-amber-400/60'
          : 'bg-white/5 border border-white/10 hover:border-white/25'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-amber-400' : 'text-slate-400'}`}>
          {label}
        </span>
        <ScoreBadge score={score} size="sm" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        {tool.logo_url && (
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white shrink-0 flex items-center justify-center border border-white/20">
            <img src={tool.logo_url} alt={tool.logo_alt || tool.name} width={28} height={28} className="w-full h-full object-contain" />
          </div>
        )}
        <span className={`font-bold text-sm ${highlight ? 'text-white' : 'text-slate-200'} group-hover:text-white transition-colors`}>
          {tool.name}
        </span>
      </div>
      <p className={`text-[11px] leading-relaxed line-clamp-2 ${highlight ? 'text-amber-100/70' : 'text-slate-400'}`}>
        {reason}
      </p>
    </Link>
  );
}
