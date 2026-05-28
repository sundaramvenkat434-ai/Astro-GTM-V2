import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { getTenantFromRequest, buildCanonicalUrl } from '@/lib/tenant';
import { ArticleView } from './article-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const h = headers();
  const result = await getTenantFromRequest({
    xSite: h.get('x-site'),
    xSecret: h.get('x-secret'),
    host: h.get('host'),
  });
  if (!result) return {};

  const { tenant } = result;

  const { data: article } = await supabaseServer
    .from('gifaa_articles')
    .select('title, excerpt, hero_image, meta_title, meta_description')
    .eq('tenant', tenant.tenant_key)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!article) return { title: 'Not Found' };

  const canonical = buildCanonicalUrl(tenant, `/articles/${params.slug}`);
  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt;

  return {
    title,
    description,
    alternates: { canonical },
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

export default async function ArticleSlugPage({ params }: PageProps) {
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

  const { data: article } = await supabaseServer
    .from('gifaa_articles')
    .select('*')
    .eq('tenant', tenant.tenant_key)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

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
    />
  );
}
