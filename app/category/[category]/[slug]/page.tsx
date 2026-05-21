import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { FaqSection } from '@/components/faq-accordion';
import { ToolSidebarNav, type SidebarSection } from '@/components/tool-sidebar-nav';
import { PageViewTracker } from '@/components/page-view-tracker';
import { TopXPageView, type TopXPageData, type TopXTool } from '@/components/top-x-page-view';
import { AuthorBlock } from '@/components/author-block';
import {
  AUTHOR_SCHEMA,
  ORGANIZATION_SCHEMA,
  buildArticleSchema,
  buildPersonSchema,
  buildReviewSchema,
  FALLBACK,
  type Author,
} from '@/lib/author-schema';
import { SiteFooter } from '@/components/site-footer';
import {
  Star,
  Check,
  Zap,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Globe,
  Newspaper,
  CalendarDays,
  Linkedin,
  BadgeCheck,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { SiteHeader, PageBreadcrumb } from '@/components/site-header';
import { UpvoteButton } from '@/components/upvote-button';
import { VisitWebsiteButton } from '@/components/visit-website-button';
import { ClaimListingButton } from '@/components/claim-listing-button';
import { ToolCard } from '@/components/tool-card';

export const revalidate = 3600;
export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrogtm.com';

interface WhoIsItForEntry {
  audience: string;
  score: number;
  note?: string;
}

interface ToolPage {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  category: string;
  tags: string[];
  badge: string | null;
  rating: number;
  rating_count: string;
  users: string;
  features: { title: string; description: string }[];
  use_cases: string[];
  pricing: {
    plan: string;
    price: string;
    features: string[];
    highlighted?: boolean;
  }[];
  faqs: { q: string; a: string }[];
  stats: { label: string; value: string }[];
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  noindex: boolean;
  pros?: string[] | null;
  cons?: string[] | null;
  what_we_learned?: { use_case: string; bullets: string[] } | null;
  honest_take?: string[] | null;
  limitations?: string[] | null;
  logo_url?: string | null;
  logo_alt?: string | null;
  screenshots?: { url: string; alt: string }[] | null;
  official_website?: string | null;
  founder_name?: string | null;
  founder_linkedin?: string | null;
  latest_news?: { title: string; url: string }[] | null;
  published_date?: string | null;
  updated_date?: string | null;
  created_at: string;
  updated_at: string;
  upvotes?: number;
  reviewer_id?: string | null;
  website_url?: string | null;
  sources?: { name: string; url: string }[] | null;
  who_is_it_for?: WhoIsItForEntry[] | null;
  is_claimed?: boolean;
  claimed_founded_by?: string | null;
  claimed_founder_names?: string | null;
  claimed_founder_linkedin?: string | null;
  claimed_about_bio?: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  'lead-generation': 'Lead Generation',
  'sales-outreach': 'Sales Outreach',
  'seo-content': 'SEO & Content',
  'social-media': 'Social Media',
  seo: 'SEO & Content',
  analytics: 'Analytics',
  developer: 'Developer Tools',
  marketing: 'Marketing',
  security: 'Security',
  design: 'Design',
  infrastructure: 'Infrastructure',
};

/* Unified blue gradient — matches home page tool card system */
const CATEGORY_HERO_GRADIENT: Record<string, string> = {
  'lead-generation': 'linear-gradient(145deg, rgba(176,228,255,0.12) 0%, rgba(255,255,255,1) 55%)',
  'sales-outreach':  'linear-gradient(145deg, rgba(176,228,255,0.12) 0%, rgba(255,255,255,1) 55%)',
  'seo-content':     'linear-gradient(145deg, rgba(176,228,255,0.12) 0%, rgba(255,255,255,1) 55%)',
  'social-media':    'linear-gradient(145deg, rgba(176,228,255,0.12) 0%, rgba(255,255,255,1) 55%)',
};

const CATEGORY_HERO_BORDER: Record<string, string> = {
  'lead-generation': 'rgba(14,165,233,0.15)',
  'sales-outreach':  'rgba(14,165,233,0.15)',
  'seo-content':     'rgba(14,165,233,0.15)',
  'social-media':    'rgba(14,165,233,0.15)',
};

const CATEGORY_BTN_GRADIENT: Record<string, string> = {
  'lead-generation': 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'sales-outreach':  'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'seo-content':     'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
  'social-media':    'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)',
};

const CATEGORY_SCHEMA: Record<string, string> = {
  seo: 'WebApplication',
  analytics: 'WebApplication',
  developer: 'DeveloperApplication',
  marketing: 'WebApplication',
  security: 'WebApplication',
  design: 'DesignApplication',
  infrastructure: 'DeveloperApplication',
};

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


// ─── data fetchers ────────────────────────────────────────────────────────────

async function getTool(slug: string, category: string): Promise<ToolPage | null> {
  const { data } = await supabaseServer
    .from('tool_pages')
    .select('*')
    .eq('slug', slug)
    .eq('category', category)
    .eq('status', 'published')
    .maybeSingle();
  if (data) return data as ToolPage;
  const { data: fallback } = await supabaseServer
    .from('tool_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return fallback as ToolPage | null;
}

async function getTopX(slug: string, category: string): Promise<TopXPageData | null> {
  const { data } = await supabaseServer
    .from('top_x_pages')
    .select('*')
    .eq('slug', slug)
    .eq('category', category)
    .eq('status', 'published')
    .maybeSingle();
  if (data) return data as TopXPageData;
  const { data: fallback } = await supabaseServer
    .from('top_x_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  return fallback as TopXPageData | null;
}

interface SimilarTool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  badge: string | null;
  rating: number;
  rating_count: string;
  upvotes: number;
  use_cases: string[];
  published_date: string | null;
}

async function getViewCount(pageId: string): Promise<number> {
  const { count } = await supabaseServer
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .eq('page_id', pageId);
  return count ?? 0;
}

async function getSimilarTools(category: string, excludeId: string): Promise<SimilarTool[]> {
  const { data } = await supabaseServer
    .from('tool_pages')
    .select('id, slug, name, tagline, description, category, tags, badge, rating, rating_count, upvotes, use_cases, published_date')
    .eq('category', category)
    .eq('status', 'published')
    .neq('id', excludeId)
    .order('published_date', { ascending: false })
    .limit(10);
  return (data as SimilarTool[]) ?? [];
}

async function getViewCounts(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const { data } = await supabaseServer
    .from('page_views')
    .select('page_id')
    .in('page_id', ids);
  if (!data) return {};
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.page_id] = (counts[row.page_id] ?? 0) + 1;
  }
  return counts;
}

async function getAuthor(reviewerId: string | null | undefined): Promise<Author> {
  if (!reviewerId) return FALLBACK;
  const { data } = await supabaseServer
    .from('authors')
    .select('id, slug, name, title, bio, avatar_initials, avatar_color, linkedin_url, categories, stats')
    .eq('id', reviewerId)
    .maybeSingle();
  return (data as Author | null) ?? FALLBACK;
}

async function getTopXTools(toolIds: string[]): Promise<TopXTool[]> {
  if (!toolIds.length) return [];
  const { data } = await supabaseServer
    .from('tool_pages')
    .select('id, slug, name, tagline, description, category, tags, badge, rating, rating_count, users, features, use_cases')
    .in('id', toolIds)
    .eq('status', 'published');
  if (!data) return [];
  return toolIds
    .map((id) => (data as TopXTool[]).find((t) => t.id === id))
    .filter(Boolean) as TopXTool[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseReviewCount(count: string): number {
  const cleaned = count.replace(/,/g, '').trim().toLowerCase();
  if (cleaned.endsWith('k')) return Math.round(parseFloat(cleaned) * 1000);
  if (cleaned.endsWith('m')) return Math.round(parseFloat(cleaned) * 1000000);
  return parseInt(cleaned, 10) || 0;
}

function parsePrice(price: string): string | null {
  if (!price) return null;
  const lower = price.toLowerCase().trim();
  if (lower === 'free' || lower === '$0') return '0';
  if (lower === 'custom' || lower === 'contact') return null;
  const num = price.replace(/[^0-9.]/g, '');
  return num || null;
}

function buildToolJsonLd(tool: ToolPage, author: Author) {
  const pageUrl = `${SITE_URL}/category/${tool.category}/${tool.slug}`;
  const reviewCount = parseReviewCount(tool.rating_count);
  const categoryLabel = CATEGORY_LABELS[tool.category] || tool.category;

  const offers = tool.pricing
    .map((p) => {
      const amount = parsePrice(p.price);
      if (amount === null) return null;
      return {
        '@type': 'Offer' as const,
        name: p.plan,
        price: amount,
        priceCurrency: 'USD',
        ...(amount === '0' && { description: 'Free plan' }),
      };
    })
    .filter(Boolean);

  const softwareApp: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${pageUrl}#software`,
    name: tool.name,
    description: tool.meta_description || tool.description,
    url: pageUrl,
    applicationCategory: CATEGORY_SCHEMA[tool.category] || 'WebApplication',
    publisher: { '@id': `${SITE_URL}/#organization` },
    ...(tool.official_website ? { sameAs: tool.official_website } : {}),
    ...(tool.logo_url ? { image: { '@type': 'ImageObject', url: tool.logo_url, description: tool.logo_alt || `${tool.name} logo` } } : {}),
  };

  if (reviewCount > 0) {
    softwareApp.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(tool.rating),
      reviewCount: String(reviewCount),
      bestRating: '5',
      worstRating: '1',
    };
  }

  if (offers.length === 1) softwareApp.offers = offers[0];
  else if (offers.length > 1) softwareApp.offers = offers;

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    name: tool.meta_title || tool.name,
    description: tool.meta_description || tool.description,
    url: pageUrl,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/author/${author.slug}`,
    },
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'AstroGTM', url: SITE_URL },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: categoryLabel, item: `${SITE_URL}/category/${tool.category}` },
        { '@type': 'ListItem', position: 3, name: tool.name, item: pageUrl },
      ],
    },
    datePublished: tool.published_date ?? tool.created_at,
    dateModified: tool.updated_date ?? tool.updated_at,
  };

  const items: object[] = [
    ORGANIZATION_SCHEMA,
    buildPersonSchema({ slug: author.slug, name: author.name, title: author.title, linkedin_url: author.linkedin_url }),
    softwareApp,
    webPage,
  ];

  if (tool.faqs.length > 0) {
    items.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    });
  }

  items.push(
    buildArticleSchema({
      headline: tool.meta_title || tool.name,
      pageUrl,
      datePublished: tool.published_date ?? tool.created_at,
      dateModified: tool.updated_date ?? tool.updated_at,
      authorSlug: author.slug,
      authorName: author.name,
    }),
    buildReviewSchema({
      toolName: tool.name,
      pageUrl,
      rating: tool.rating,
      authorSlug: author.slug,
      authorName: author.name,
      datePublished: tool.published_date ?? tool.created_at,
      dateModified: tool.updated_date ?? tool.updated_at,
    }),
  );

  return items;
}

// ─── metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const tool = await getTool(params.slug, params.category);
  if (tool) {
    const pageUrl = `${SITE_URL}/category/${tool.category}/${tool.slug}`;
    const title = tool.meta_title || tool.name;
    const description = tool.meta_description || tool.description;
    const author = await getAuthor(tool.reviewer_id);
    return {
      title,
      description,
      authors: [{ name: author.name, url: `${SITE_URL}/author/${author.slug}` }],
      robots: { index: !tool.noindex, follow: true },
      openGraph: { title, description, url: pageUrl, type: 'article', siteName: 'AstroGTM', images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: title }] },
      twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/og-default.png`] },
      alternates: { canonical: pageUrl },
    };
  }

  const topX = await getTopX(params.slug, params.category);
  if (topX) {
    const pageUrl = `${SITE_URL}/category/${topX.category}/${topX.slug}`;
    const title = topX.meta_title || topX.name;
    const description = topX.meta_description || topX.tagline;
    return {
      title,
      description,
      robots: { index: !topX.noindex, follow: true },
      openGraph: { title, description, url: pageUrl, type: 'website', siteName: 'ToolKit', images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: title }] },
      twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/og-default.png`] },
      alternates: { canonical: pageUrl },
    };
  }

  return { title: 'Not Found' };
}

// ─── sub-components ──────────────────────────────────────────────────────────

function JsonLdScripts({ items }: { items: object[] }) {
  return (
    <>
      {items.map((item, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
    </>
  );
}

// Deterministic "random" from a string seed so it's stable per tool across SSR renders
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const norm = (Math.abs(h) % 1000) / 1000;
  return min + Math.floor(norm * (max - min + 1));
}

function StarRating({ rating, toolId }: { rating: number; toolId: string }) {
  const editorCount = seededInt(toolId, 3, 10);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : s - 0.5 <= rating
                ? 'fill-amber-200 text-amber-300'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-slate-800">{rating}</span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-500">
        {editorCount} Editor Reviews
      </span>
    </div>
  );
}

function SectionHeading({
  children,
  accent = 'slate',
  description,
}: {
  children: React.ReactNode;
  accent?: 'slate' | 'blue' | 'emerald' | 'amber' | 'teal';
  description?: string;
}) {
  const bar: Record<string, string> = {
    slate: 'bg-slate-400',
    blue: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-400',
    teal: 'bg-teal-500',
  };
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5">
        <div className={`w-1 h-5 rounded-full shrink-0 ${bar[accent]}`} />
        <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">{children}</h2>
      </div>
      {description && <p className="text-[12px] text-slate-400 mt-1 ml-[14px]">{description}</p>}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function SlugPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const categoryLabel = CATEGORY_LABELS[params.category] || params.category;

  const tool = await getTool(params.slug, params.category);
  if (tool) {
    const rawSimilar = await getSimilarTools(tool.category, tool.id);
    const evenCount = Math.min(Math.floor(rawSimilar.length / 2) * 2, 10);
    const similarTools = rawSimilar.slice(0, evenCount);
    const [author, viewCount, similarViewCounts] = await Promise.all([
      getAuthor(tool.reviewer_id),
      getViewCount(tool.id),
      getViewCounts(similarTools.map((t) => t.id)),
    ]);
    const jsonLdItems = buildToolJsonLd(tool, author);

    const navSections: SidebarSection[] = [
      { id: 'overview', label: 'Overview' },
      ...((tool.screenshots?.length ?? 0) > 0 ? [{ id: 'screenshots', label: 'Screenshots' }] : []),
      { id: 'features', label: 'Features' },
      ...((tool.honest_take?.length ?? 0) > 0 || (tool.limitations?.length ?? 0) > 0 ? [{ id: 'our-opinion', label: 'Our Opinion' }] : []),
      ...((tool.who_is_it_for as WhoIsItForEntry[] | null)?.length ?? 0) > 0 ? [{ id: 'who-is-it-for', label: 'Suitable For' }] : [] as SidebarSection[],
      ...(tool.pricing.length > 0 ? [{ id: 'pricing', label: 'Pricing' }] : []),
      ...(tool.faqs.length > 0 ? [{ id: 'faq', label: 'FAQs' }] : []),
      ...(similarTools.length > 0 ? [{ id: 'similar-tools', label: 'Similar Tools' }] : []),
      { id: 'editor-details', label: 'Editor Details' },
    ];

    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        <PageViewTracker pageId={tool.id} />
        <JsonLdScripts items={jsonLdItems} />

        <SiteHeader />
        <PageBreadcrumb
          crumbs={[
            { label: categoryLabel, href: `/category/${tool.category}` },
            { label: tool.name },
          ]}
        />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8 items-start">
            <ToolSidebarNav sections={navSections} />

            <main className="flex-1 min-w-0 space-y-6">

              {/* ── Hero card ── */}
              <div id="section-overview">
                <div className="rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                  {/* Category-matched gradient header */}
                  <div
                    className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5"
                    style={{
                      background: CATEGORY_HERO_GRADIENT[tool.category] ?? 'linear-gradient(160deg, #f0f7ff 0%, #ffffff 55%)',
                      borderBottom: `1px solid ${CATEGORY_HERO_BORDER[tool.category] ?? 'rgba(14,165,233,0.1)'}`,
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                      {/* Logo */}
                      {tool.logo_url ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/80 bg-white shrink-0 flex items-center justify-center shadow-sm">
                          <img
                            src={tool.logo_url}
                            alt={tool.logo_alt || `${tool.name} logo`}
                            width={64}
                            height={64}
                            loading="lazy"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{ background: CATEGORY_BTN_GRADIENT[tool.category] ?? 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}
                        >
                          <Zap className="w-7 h-7 text-sky-700" />
                        </div>
                      )}

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">{tool.name}</h1>
                          {tool.badge && BADGE_STYLES[tool.badge] && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border"
                              style={{ backgroundColor: BADGE_STYLES[tool.badge].bg, color: BADGE_STYLES[tool.badge].text, borderColor: BADGE_STYLES[tool.badge].border }}
                            >
                              {BADGE_LABELS[tool.badge] ?? tool.badge}
                            </span>
                          )}
                          {tool.is_claimed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200">
                              <BadgeCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[15px] text-slate-500 leading-snug mb-3">{tool.tagline}</p>

                        {/* Rating + meta row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <StarRating rating={tool.rating} toolId={tool.id} />
                          <span className="w-px h-4 bg-slate-200" />
                          <Link
                            href={`/category/${tool.category}`}
                            className="text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-full capitalize transition-colors"
                          >
                            {categoryLabel}
                          </Link>
                          <UpvoteButton toolId={tool.id} initialCount={tool.upvotes ?? 0} />
                          {viewCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              {viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}k` : viewCount} views
                            </span>
                          )}
                        </div>

                        {(() => {
                          const pub = tool.published_date ?? tool.created_at;
                          return (
                            <p className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5">
                              <CalendarDays className="w-3 h-3 shrink-0" />
                              <span>Added {new Date(pub).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                            </p>
                          );
                        })()}
                      </div>

                      {/* CTA */}
                      <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                        {tool.website_url && (
                          <VisitWebsiteButton toolId={tool.id} websiteUrl={tool.website_url} />
                        )}
                        {!tool.is_claimed && (
                          <ClaimListingButton toolId={tool.id} toolName={tool.name} />
                        )}
                      </div>
                    </div>

                    {/* Common Use Cases */}
                    {tool.use_cases.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-slate-200/60">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Common Use Cases</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tool.use_cases.map((uc: string) => (
                            <span key={uc} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 bg-white/80 border border-slate-200 hover:border-slate-300 hover:bg-white px-3 py-1 rounded-lg transition-colors shadow-sm">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: '#0369a1' }}
                              />
                              {uc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ── Screenshots ── */}
              {(tool.screenshots?.length ?? 0) > 0 && (
                <section id="section-screenshots">
                  <SectionHeading accent="slate">Screenshots</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(tool.screenshots ?? []).map((s, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-sm">
                        <img
                          src={s.url}
                          alt={s.alt || `${tool.name} - screenshot ${i + 1}`}
                          loading="lazy"
                          width={800}
                          height={500}
                          className="w-full h-52 object-cover"
                        />
                        {s.alt && (
                          <p className="px-4 py-2.5 text-[11px] text-slate-400 border-t border-slate-100">{s.alt}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── About + Features (merged card) ── */}
              <section id="section-features">
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  {/* About text */}
                  <div className="p-6 sm:p-8 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900 mb-3">About {tool.name}</h2>
                    <p className="text-[14px] text-slate-600 leading-[1.75]">{tool.long_description}</p>
                  </div>
                  {/* Features grid — always render header, grid only when present */}
                  <div className="px-6 sm:px-8 pt-6 pb-7">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1 h-4 rounded-full bg-sky-500 shrink-0" />
                      <h3 className="text-[13px] font-bold text-slate-900 tracking-tight uppercase">Key Features</h3>
                    </div>
                    {tool.features.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tool.features.map((f: { title: string; description: string }, i: number) => (
                          <div key={i} className="group flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-sky-200 hover:bg-sky-50/40 hover:shadow-sm transition-all">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-sky-100 text-sky-600 mt-0.5 group-hover:bg-sky-200 transition-colors">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold text-[13px] text-slate-900 mb-0.5">{f.title}</p>
                              <p className="text-[12px] text-slate-500 leading-relaxed">{f.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-slate-400 italic">No features listed yet.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Our Opinion ── */}
              {((tool.honest_take?.length ?? 0) > 0 || (tool.limitations?.length ?? 0) > 0) && (
                <section id="section-our-opinion">
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    {/* Section header */}
                    <div className="px-6 py-4 border-b border-sky-100 bg-sky-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center shrink-0 shadow-sm">
                          <Lightbulb className="w-[16px] h-[16px] text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-bold text-sky-900 tracking-tight">Our Opinion</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">
                              Editorial
                            </span>
                            <div className="relative group/tip">
                              <div className="w-3.5 h-3.5 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center cursor-default">
                                <ShieldCheck className="w-2 h-2 text-sky-500" />
                              </div>
                              <div className="pointer-events-none absolute left-0 bottom-full mb-2.5 w-72 bg-slate-900/95 text-white text-[11px] leading-relaxed rounded-xl px-3.5 py-3 shadow-2xl opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 z-50">
                                This opinion is based on editorial testing, real-world usage, and trusted community feedback. While we aim to test tools thoroughly, some insights may also reflect proven public use cases.
                                <span className="absolute left-4 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-900/95" />
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Collective take from our editorial reviewers</p>
                        </div>
                        {/* Reviewer avatar */}
                        <Link href={`/author/${author.slug}`} rel="author" className="flex items-center gap-1.5 shrink-0 group/rev">
                          <span className="text-[10px] text-slate-500 group-hover/rev:text-slate-700 transition-colors hidden sm:inline">Reviewed by</span>
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm ring-1 ring-sky-200 group-hover/rev:ring-sky-400 transition-all"
                            style={{ background: author.avatar_color }}
                          >
                            {author.avatar_initials}
                          </div>
                        </Link>
                      </div>
                    </div>
                    {/* Two-column grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                      {/* Strengths */}
                      {(tool.honest_take?.length ?? 0) > 0 && (
                        <div className="p-5 bg-white">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center shrink-0">
                              <ThumbsUp className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[12px] font-bold text-sky-700 uppercase tracking-wider">Strengths</span>
                          </div>
                          <div className="space-y-2.5">
                            {(tool.honest_take ?? []).map((bullet, i) => (
                              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 hover:shadow-md transition-all group/item">
                                <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover/item:bg-sky-700 transition-colors">
                                  <span className="text-white text-[10px] font-bold leading-none">{i + 1}</span>
                                </div>
                                <p className="text-[13px] text-slate-700 leading-relaxed">{bullet}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Limitations */}
                      {(tool.limitations?.length ?? 0) > 0 && (
                        <div className="p-5 bg-white">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md bg-amber-400 flex items-center justify-center shrink-0">
                              <ThumbsDown className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[12px] font-bold text-amber-600 uppercase tracking-wider">Limitations</span>
                          </div>
                          <div className="space-y-2.5">
                            {(tool.limitations ?? []).map((bullet, i) => (
                              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-amber-100 hover:border-amber-200 transition-all">
                                <div className="w-5 h-5 rounded-full bg-amber-300/80 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-amber-800 text-[10px] font-bold leading-none">{i + 1}</span>
                                </div>
                                <p className="text-[13px] text-slate-600 leading-relaxed">{bullet}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* ── Suitable For ── */}
              {((tool.who_is_it_for as WhoIsItForEntry[] | null)?.length ?? 0) > 0 && (
                <section id="section-who-is-it-for">
                  <SectionHeading accent="blue" description="Recommended fit by team type and use case">Suitable For</SectionHeading>
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Team / Company Type</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-28 text-right">Fit Score</span>
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {(tool.who_is_it_for as WhoIsItForEntry[]).map((entry, i) => {
                        const score = Math.max(1, Math.min(10, Math.round(entry.score)));
                        const pct = (score / 10) * 100;
                        const barColor = score >= 8 ? 'bg-sky-500' : score >= 5 ? 'bg-sky-400' : 'bg-slate-300';
                        const scoreColor = score >= 8 ? 'text-sky-700' : score >= 5 ? 'text-slate-600' : 'text-slate-400';
                        return (
                          <li key={i} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                            <div>
                              <p className="text-[13px] font-semibold text-slate-800 leading-snug">{entry.audience}</p>
                              {entry.note && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{entry.note}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 w-28 shrink-0">
                              <span className={`text-[13px] font-bold tabular-nums ${scoreColor}`}>{score}<span className="text-[10px] font-normal text-slate-400">/10</span></span>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>
              )}

              {/* ── Pricing ── */}
              {tool.pricing.length > 0 && (
                <section id="section-pricing">
                  <SectionHeading accent="emerald">Pricing</SectionHeading>
                  <div className={`grid gap-3 ${tool.pricing.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                    {tool.pricing.map((plan) => {
                      const isFree = /free/i.test(plan.plan) || /^\$?0(\/mo)?$/i.test(plan.price.trim());
                      return (
                        <div
                          key={plan.plan}
                          className={`relative bg-white rounded-2xl border p-6 flex flex-col transition-all shadow-sm hover:shadow-md ${
                            isFree ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          {isFree && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Free tier</span>
                            </div>
                          )}
                          <div className="mb-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">{plan.plan}</p>
                            <p className={`text-3xl font-bold tracking-tight ${isFree ? 'text-emerald-600' : 'text-slate-900'}`}>{plan.price}</p>
                          </div>
                          <ul className="space-y-2.5 flex-1">
                            {plan.features.map((f: string) => (
                              <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                                <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isFree ? 'text-emerald-500' : 'text-slate-400'}`} />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}


              {/* ── FAQ ── */}
              <FaqSection faqs={tool.faqs} />

              {/* ── Similar Tools ── */}
              {similarTools.length > 0 && (
                <section id="section-similar-tools">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 rounded-full shrink-0 bg-slate-400" />
                        <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Similar Tools</h2>
                      </div>
                      <p className="text-[12px] text-slate-400 mt-1 ml-[14px]">Other {categoryLabel} tools worth exploring</p>
                    </div>
                    <Link href={`/category/${tool.category}`} className="text-xs text-sky-600 hover:text-sky-800 transition-colors font-medium whitespace-nowrap mt-1">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {similarTools.map((s) => (
                      <ToolCard key={s.id} tool={s} views={similarViewCounts[s.id]} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Claimed founder widget ── */}
              {tool.is_claimed && (tool.claimed_founded_by || tool.claimed_founder_names || tool.claimed_about_bio) && (
                <section id="section-claimed" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-sky-50/60">
                    <BadgeCheck className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <h2 className="text-[13px] font-bold text-slate-900 leading-none mb-0.5">Verified Listing</h2>
                      <p className="text-[11px] text-sky-600 font-medium">Claimed &amp; verified by the founders</p>
                    </div>
                  </div>
                  <div className="px-6 py-5 space-y-2">
                    {tool.claimed_founded_by && (
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{tool.claimed_founded_by}</p>
                    )}
                    {tool.claimed_founder_names && (
                      <div>
                        {tool.claimed_founder_linkedin ? (
                          <a href={tool.claimed_founder_linkedin} target="_blank" rel="noopener noreferrer"
                            className="text-[13px] font-semibold text-slate-900 hover:text-sky-700 transition-colors flex items-center gap-1.5">
                            {tool.claimed_founder_names}
                            <Linkedin className="w-3.5 h-3.5 text-sky-500" />
                          </a>
                        ) : (
                          <p className="text-[13px] font-semibold text-slate-900">{tool.claimed_founder_names}</p>
                        )}
                      </div>
                    )}
                    {tool.claimed_about_bio && (
                      <p className="text-[13px] text-slate-600 leading-relaxed">{tool.claimed_about_bio}</p>
                    )}
                  </div>
                </section>
              )}

              {/* ── Editor Details ── */}
              <section id="section-editor-details">
                <AuthorBlock
                  author={author}
                  publishedDate={tool.published_date ?? tool.created_at}
                  sources={(tool.sources ?? []).filter(s => s.name && s.url)}
                />
              </section>
            </main>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // Try top_x_pages
  const topX = await getTopX(params.slug, params.category);
  if (topX) {
    const tools = await getTopXTools(topX.tool_ids as string[]);
    return (
      <>
        <PageViewTracker pageId={topX.id} />
        <TopXPageView
          page={topX}
          tools={tools}
          categoryLabel={categoryLabel}
          siteUrl={SITE_URL}
        />
      </>
    );
  }

  notFound();
}
