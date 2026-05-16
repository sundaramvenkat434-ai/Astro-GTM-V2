export const FALLBACK_AUTHOR_SLUG = 'venkat-sundaram';
export const FALLBACK_AUTHOR_NAME = 'Venkat Sundaram';
export const FALLBACK_AUTHOR_LINKEDIN = 'https://linkedin.com/in/srvenkat94';

export interface Author {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatar_initials: string;
  avatar_color: string;
  linkedin_url: string | null;
  categories: string[];
  stats: { value: string; label: string }[];
}

export const FALLBACK: Author = {
  id: '',
  slug: FALLBACK_AUTHOR_SLUG,
  name: FALLBACK_AUTHOR_NAME,
  title: 'Lead Reviewer — SEO & Content Tools',
  bio: 'Venkat Sundaram is the lead editor at AstroGTM with 6+ years in AI, SaaS, and go-to-market strategy. Every tool is tested hands-on against real use cases.',
  avatar_initials: 'VS',
  avatar_color: '#0369a1',
  linkedin_url: FALLBACK_AUTHOR_LINKEDIN,
  categories: ['seo-content', 'lead-generation'],
  stats: [
    { value: '6+', label: 'Years in AI & SaaS' },
    { value: '200+', label: 'Tools reviewed' },
    { value: '40k+', label: 'Monthly readers' },
  ],
};
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrogtm.com';

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org' as const,
  '@type': 'Organization' as const,
  '@id': `${SITE_URL}/#organization`,
  name: 'AstroGTM',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-default.png`,
  },
};

export const AUTHOR_SCHEMA = {
  '@context': 'https://schema.org' as const,
  '@type': 'Person' as const,
  '@id': `${SITE_URL}/author/${FALLBACK_AUTHOR_SLUG}`,
  name: FALLBACK_AUTHOR_NAME,
  url: `${SITE_URL}/author/${FALLBACK_AUTHOR_SLUG}`,
  jobTitle: 'Lead Reviewer — SEO & Content Tools',
  sameAs: [FALLBACK_AUTHOR_LINKEDIN],
  worksFor: { '@id': `${SITE_URL}/#organization` },
};

export interface AuthorSchemaInput {
  slug: string;
  name: string;
  title?: string;
  linkedin_url?: string | null;
}

export function buildPersonSchema(author: AuthorSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/author/${author.slug}`,
    name: author.name,
    url: `${SITE_URL}/author/${author.slug}`,
    jobTitle: author.title,
    worksFor: { '@id': `${SITE_URL}/#organization` },
    ...(author.linkedin_url ? { sameAs: [author.linkedin_url] } : {}),
  };
}

export function buildArticleSchema({
  headline,
  pageUrl,
  datePublished,
  dateModified,
  authorSlug,
  authorName,
}: {
  headline: string;
  pageUrl: string;
  datePublished?: string | null;
  dateModified?: string | null;
  authorSlug?: string;
  authorName?: string;
}) {
  const slug = authorSlug || FALLBACK_AUTHOR_SLUG;
  const name = authorName || FALLBACK_AUTHOR_NAME;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/author/${slug}`,
      name,
      url: `${SITE_URL}/author/${slug}`,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function buildReviewSchema({
  toolName,
  pageUrl,
  rating,
  authorSlug,
  authorName,
  datePublished,
  dateModified,
}: {
  toolName: string;
  pageUrl: string;
  rating: number;
  authorSlug?: string;
  authorName?: string;
  datePublished?: string | null;
  dateModified?: string | null;
}) {
  const slug = authorSlug || FALLBACK_AUTHOR_SLUG;
  const name = authorName || FALLBACK_AUTHOR_NAME;
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${pageUrl}#review`,
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: toolName,
      url: pageUrl,
    },
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/author/${slug}`,
      name,
      url: `${SITE_URL}/author/${slug}`,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(rating),
      bestRating: '5',
      worstRating: '1',
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}
