import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import { resolveTenant, buildCanonicalUrl } from '@/lib/tenant';
import { ArticlesGrid } from './articles-grid';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, isOriginAccess } = await resolveTenant();
  if (!tenant) return {};

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
    ...(isOriginAccess && { robots: { index: false, follow: true } }),
  };
}

export default async function ArticlesPage() {
  const { tenant, isOriginAccess, forbidden } = await resolveTenant();

  if (forbidden || !tenant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">403 Forbidden</p>
      </div>
    );
  }

  const { data: articles } = await supabaseServer
    .from('gifaa_articles')
    .select('id, slug, title, excerpt, hero_image, category, author_name, read_time, published_at')
    .eq('tenant', tenant.tenant_key)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return (
    <ArticlesGrid
      articles={articles || []}
      siteName={tenant.site_name}
      publicDomain={tenant.public_domain}
      noindex={isOriginAccess}
    />
  );
}
