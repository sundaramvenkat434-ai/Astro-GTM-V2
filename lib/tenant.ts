import { headers } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';

export interface TenantConfig {
  tenant_key: string;
  public_domain: string;
  site_name: string;
  proxy_secret: string;
}

const ASTROGTM_DOMAIN = 'astrogtm.com';

export async function resolveTenant(): Promise<{
  tenant: TenantConfig | null;
  isOriginAccess: boolean;
  forbidden: boolean;
}> {
  const headersList = headers();
  const xSite = headersList.get('x-site');
  const xSecret = headersList.get('x-secret');
  const host = headersList.get('host') || '';

  const isOriginAccess = host.includes(ASTROGTM_DOMAIN) && !xSite;

  if (isOriginAccess) {
    const { data: tenants } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .limit(1)
      .maybeSingle();

    return {
      tenant: tenants || { tenant_key: 'gifaa', public_domain: 'gifaa.in', site_name: 'Gifaa', proxy_secret: '' },
      isOriginAccess: true,
      forbidden: false,
    };
  }

  const tenantIdentifier = xSite || domainToTenantKey(host);

  const { data: tenantConfig } = await supabaseServer
    .from('gifaa_tenants')
    .select('tenant_key, public_domain, site_name, proxy_secret')
    .eq('tenant_key', tenantIdentifier)
    .maybeSingle();

  if (!tenantConfig) {
    const { data: byDomain } = await supabaseServer
      .from('gifaa_tenants')
      .select('tenant_key, public_domain, site_name, proxy_secret')
      .eq('public_domain', host.replace(/:\d+$/, ''))
      .maybeSingle();

    if (!byDomain) {
      return { tenant: null, isOriginAccess: false, forbidden: true };
    }

    if (byDomain.proxy_secret && xSecret !== byDomain.proxy_secret) {
      return { tenant: null, isOriginAccess: false, forbidden: true };
    }

    return { tenant: byDomain, isOriginAccess: false, forbidden: false };
  }

  if (tenantConfig.proxy_secret && xSecret !== tenantConfig.proxy_secret) {
    return { tenant: null, isOriginAccess: false, forbidden: true };
  }

  return { tenant: tenantConfig, isOriginAccess: false, forbidden: false };
}

function domainToTenantKey(host: string): string {
  const domain = host.replace(/:\d+$/, '');
  if (domain.includes('gifaa')) return 'gifaa';
  if (domain.includes('safebox')) return 'safebox';
  return domain.split('.')[0];
}

export function buildCanonicalUrl(tenant: TenantConfig, path: string): string {
  return `https://${tenant.public_domain}${path}`;
}
