import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { getTenantFromRequest, buildCanonicalUrl, TenantConfig } from '@/lib/tenant';
import { ArticleView } from './article-view';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function loadTenantByKey(tenantKey: string): Promise<TenantConfig | null> {
  const { data } = await supabaseServer
    .from('gifaa_tenants')
    .select('tenant_key, public_domain, site_name, proxy_secret, logo_url, header_logo_height, footer_logo_height, powered_by_enabled, powered_by_height, powered_by_opacity')
    .eq('tenant_key', tenantKey)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const isPreview = searchParams.preview === 'true';

  const h = headers();
  const result = await getTenantFromRequest({
    xSite: h.get('x-site'),
    xSecret: h.get('x-secret'),
    host: h.get('host'),
  });

  let tenant: TenantConfig | null = result?.tenant || null;

  if (!tenant && isPreview) {
    const { data: article } = await supabaseServer
      .from('gifaa_articles')
      .select('tenant, title, excerpt, hero_image, meta_title, meta_description')
      .eq('slug', params.slug)
      .maybeSingle();

    if (!article) return { title: 'Not Found' };

    tenant = await loadTenantByKey(article.tenant);
    if (!tenant) return { title: 'Not Found' };

    const title = article.meta_title || article.title;
    const description = article.meta_description || article.excerpt;

    return {
      title: { absolute: `[Preview] ${title}` },
      description,
      robots: { index: false, follow: false },
    };
  }

  if (!tenant) return {};

  const { data: article } = await supabaseServer
    .from('gifaa_articles')
    .select('title, excerpt, hero_image, meta_title, meta_description, status')
    .eq('tenant', tenant.tenant_key)
    .eq('slug', params.slug)
    .maybeSingle();

  if (!article) return { title: 'Not Found' };

  const canonical = buildCanonicalUrl(tenant, `/articles/${params.slug}`);
  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt;

  if (isPreview || article.status === 'preview') {
    return {
      title: { absolute: `[Preview] ${title}` },
      description,
      robots: { index: false, follow: false },
    };
  }

  const noIndex = article.status !== 'approved';

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    ...(noIndex && { robots: { index: false, follow: false } }),
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

  let tenant: TenantConfig | null = result?.tenant || null;

  // For preview mode on origin domain: bypass tenant guard, resolve via article
  if (!tenant && isPreview) {
    const { data: article } = await supabaseServer
      .from('gifaa_articles')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle();

    if (!article) notFound();

    tenant = await loadTenantByKey(article.tenant);
    if (!tenant) notFound();

    let relatedArticles: any[] = [];
    if (article.related_slugs && article.related_slugs.length > 0) {
      const { data } = await supabaseServer
        .from('gifaa_articles')
        .select('slug, title, excerpt, hero_image, category, read_time, published_at')
        .eq('tenant', tenant.tenant_key)
        .in('slug', article.related_slugs)
        .in('status', ['published', 'approved']);
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
        poweredByEnabled={tenant.powered_by_enabled}
        poweredByHeight={tenant.powered_by_height}
        poweredByOpacity={tenant.powered_by_opacity}
        isPreview={true}
      />
    );
  }

  if (!tenant) {
    notFound();
  }

  // Normal flow: resolve article with status filtering
  const query = supabaseServer
    .from('gifaa_articles')
    .select('*')
    .eq('tenant', tenant.tenant_key)
    .eq('slug', params.slug);

  // Only approved and published are visible without preview flag
  if (!isPreview) {
    query.in('status', ['published', 'approved']);
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
      .in('status', ['published', 'approved']);
    relatedArticles = data || [];
  }

  const showPreviewBanner = isPreview || article.status === 'preview';

  return (
    <ArticleView
      article={article}
      relatedArticles={relatedArticles}
      siteName={tenant.site_name}
      publicDomain={tenant.public_domain}
      logoUrl={tenant.logo_url}
      headerLogoHeight={tenant.header_logo_height}
      footerLogoHeight={tenant.footer_logo_height}
      poweredByEnabled={tenant.powered_by_enabled}
      poweredByHeight={tenant.powered_by_height}
      poweredByOpacity={tenant.powered_by_opacity}
      isPreview={showPreviewBanner}
    />
  );
}
