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

  console.log('[tenant] resolve request:', { xSite, xSecret: xSecret ? `${xSecret.slice(0, 4)}...` : null, host });

  const isOriginAccess = hostname.includes(ASTROGTM_DOMAIN) && !xSite;

  if (isOriginAccess) {
    const { data } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .limit(1)
      .maybeSingle();

    if (!data) {
      console.log('[tenant] origin access: no tenant found');
      return null;
    }
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
    console.log('[tenant] lookup by tenant_key:', { xSite, found: !!data });
  }

  if (!tenantConfig) {
    const domain = hostname.replace(/:\d+$/, '');
    const { data } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .eq('public_domain', domain)
      .maybeSingle();
    tenantConfig = data;
    console.log('[tenant] lookup by domain:', { domain, found: !!data });
  }

  if (!tenantConfig) {
    console.log('[tenant] REJECTED: no tenant matched', { xSite, host });
    return null;
  }

  if (tenantConfig.proxy_secret && xSecret !== tenantConfig.proxy_secret) {
    console.log('[tenant] REJECTED: secret mismatch', {
      xSite,
      expectedSecret: `${tenantConfig.proxy_secret.slice(0, 4)}...`,
      receivedSecret: xSecret ? `${xSecret.slice(0, 4)}...` : null,
    });
    return null;
  }

  console.log('[tenant] RESOLVED:', { tenant_key: tenantConfig.tenant_key, domain: tenantConfig.public_domain });
  return { tenant: tenantConfig, isOriginAccess: false };
}

export function buildCanonicalUrl(tenant: TenantConfig, path: string): string {
  return `https://${tenant.public_domain}${path}`;
}

export function buildArticleUrl(tenant: TenantConfig, slug: string): string {
  return `https://${tenant.public_domain}/articles/${slug}`;
}
