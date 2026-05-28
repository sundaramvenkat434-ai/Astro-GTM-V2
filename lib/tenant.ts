import { headers } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';

export interface TenantConfig {
  tenant_key: string;
  public_domain: string;
  site_name: string;
  proxy_secret: string;
}

export interface TenantResult {
  tenant: TenantConfig;
  isOriginAccess: boolean;
}

const ASTROGTM_DOMAIN = 'astrogtm.com';

/**
 * Resolves tenant from request headers. Validates secret BEFORE returning.
 * Returns null if tenant cannot be resolved or secret is invalid.
 */
export async function getTenantFromRequest(): Promise<TenantResult | null> {
  const headersList = headers();
  const xSite = headersList.get('x-site');
  const xSecret = headersList.get('x-secret');
  const host = headersList.get('host') || '';

  const isOriginAccess = host.includes(ASTROGTM_DOMAIN) && !xSite;

  // Direct access to astrogtm.com without proxy headers — serve with noindex
  if (isOriginAccess) {
    // Fallback: use first available tenant for rendering (noindexed anyway)
    const { data } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    return { tenant: data, isOriginAccess: true };
  }

  // Resolve tenant by x-site header or by host domain
  let tenantConfig: TenantConfig | null = null;

  if (xSite) {
    const { data } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .eq('tenant_key', xSite)
      .maybeSingle();
    tenantConfig = data;
  }

  if (!tenantConfig) {
    const domain = host.replace(/:\d+$/, '');
    const { data } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .eq('public_domain', domain)
      .maybeSingle();
    tenantConfig = data;
  }

  if (!tenantConfig) return null;

  // SECRET VALIDATION — must pass before any content queries
  if (tenantConfig.proxy_secret && xSecret !== tenantConfig.proxy_secret) {
    return null;
  }

  return { tenant: tenantConfig, isOriginAccess: false };
}

export function buildCanonicalUrl(tenant: TenantConfig, path: string): string {
  return `https://${tenant.public_domain}${path}`;
}

export function buildArticleUrl(tenant: TenantConfig, slug: string): string {
  return `https://${tenant.public_domain}/articles/${slug}`;
}
