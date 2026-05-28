import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { getTenantFromRequest, buildCanonicalUrl } from '@/lib/tenant';
import { ArticleView } from './article-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const isPreview = searchParams.preview === 'true';
  const h = headers();
  const result = await getTenantFromRequest({
    xSite: h.get('x-site'),
    xSecret: h.get('x-secret'),
    host: h.get('host'),
  });
  if (!result) return {};

  const { tenant } = result;

  const query = supabaseServer
    .from('gifaa_articles')
    .select('title, excerpt, hero_image, meta_title, meta_description')
    .eq('tenant', tenant.tenant_key)
    .eq('slug', params.slug);

  if (!isPreview) {
    query.eq('status', 'published');
  }

  const { data: article } = await query.maybeSingle();

  if (!article) return { title: 'Not Found' };

  const canonical = buildCanonicalUrl(tenant, `/articles/${params.slug}`);
  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt;

  return {
    title: { absolute: isPreview ? `[Preview] ${title}` : title },
    description,
    ...(isPreview && { robots: { index: false, follow: false } }),
    alternates: { canonical: isPreview ? undefined : canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: tenant.site_name,
      type: 'article',
      ...(article.hero_image && { images: [{ url: article.hero_image }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(article.hero_image && { images: [article.hero_image] }),
    },
  };
}

export default async function ArticleSlugPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === 'true';
  const h = headers();
  const result = await getTenantFromRequest({
    xSite: h.get('x-site'),
    xSecret: h.get('x-secret'),
    host: h.get('host'),
  });

  if (!result) {
    notFound();
  }

  const { tenant } = result;

  const query = supabaseServer
    .from('gifaa_articles')
    .select('*')
    .eq('tenant', tenant.tenant_key)
    .eq('slug', params.slug);

  if (!isPreview) {
    query.eq('status', 'published');
  }

  const { data: article } = await query.maybeSingle();

  if (!article) {
    notFound();
  }

  let relatedArticles: any[] = [];
  if (article.related_slugs && article.related_slugs.length > 0) {
    const { data } = await supabaseServer
      .from('gifaa_articles')
      .select('slug, title, excerpt, hero_image, category, read_time, published_at')
      .eq('tenant', tenant.tenant_key)
      .in('slug', article.related_slugs)
      .eq('status', 'published');
    relatedArticles = data || [];
  }

  return (
    <ArticleView
      article={article}
      relatedArticles={relatedArticles}
      siteName={tenant.site_name}
      publicDomain={tenant.public_domain}
      logoUrl={tenant.logo_url}
      headerLogoHeight={tenant.header_logo_height}
      footerLogoHeight={tenant.footer_logo_height}
      isPreview={isPreview}
    />
  );
}
