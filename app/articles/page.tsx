import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { getTenantFromRequest, buildCanonicalUrl } from '@/lib/tenant';
import { ArticlesGrid } from './articles-grid';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const h = headers();
  const result = await getTenantFromRequest({
    xSite: h.get('x-site'),
    xSecret: h.get('x-secret'),
    host: h.get('host'),
  });
  if (!result) return {};

  const { tenant } = result;
  const canonical = buildCanonicalUrl(tenant, '/articles');

  return {
    title: `Blog | ${tenant.site_name}`,
    description: `Ideas, guides, and inspiration from ${tenant.site_name}.`,
    alternates: { canonical },
    openGraph: {
      title: `Blog | ${tenant.site_name}`,
      description: `Ideas, guides, and inspiration from ${tenant.site_name}.`,
      url: canonical,
      siteName: tenant.site_name,
    },
  };
}

export default async function ArticlesPage() {
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

  const { data: articles, count } = await supabaseServer
    .from('gifaa_articles')
    .select('id, slug, title, excerpt, hero_image, category, author_name, read_time, published_at', { count: 'exact' })
    .eq('tenant', tenant.tenant_key)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return (
    <ArticlesGrid
      articles={articles || []}
      totalCount={count || 0}
      siteName={tenant.site_name}
      publicDomain={tenant.public_domain}
    />
  );
}
