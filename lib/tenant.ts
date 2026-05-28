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

export interface TenantRequestHeaders {
  xSite: string | null;
  xSecret: string | null;
  host: string | null;
}

const ASTROGTM_DOMAIN = 'astrogtm.com';

export async function getTenantFromRequest(h: TenantRequestHeaders): Promise<TenantResult | null> {
  const { xSite, xSecret, host } = h;
  const hostname = host || '';

  const isOriginAccess = hostname.includes(ASTROGTM_DOMAIN) && !xSite;

  if (isOriginAccess) {
    const { data } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    return { tenant: data, isOriginAccess: true };
  }

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
    const domain = hostname.replace(/:\d+$/, '');
    const { data } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .eq('public_domain', domain)
      .maybeSingle();
    tenantConfig = data;
  }

  if (!tenantConfig) return null;

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
