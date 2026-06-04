export const DEFAULT_TENANT_CONFIG = {
  site_name: '',
  public_domain: '',
  logo_url: null as string | null,
  header_logo_height: 32,
  footer_logo_height: 24,
  powered_by_enabled: true,
  powered_by_height: 20,
  powered_by_opacity: 60,
  ga_measurement_id: null as string | null,
  header_menu_items: [] as { label: string; url: string }[],
  footer_links: [] as { heading: string; text: string; url: string }[],
  status: 'active',
} as const;

export type TenantConfig = typeof DEFAULT_TENANT_CONFIG;

export function generateProxySecret(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function buildNewTenantPayload(input: {
  tenant_key: string;
  site_name: string;
  public_domain: string;
}) {
  return {
    ...DEFAULT_TENANT_CONFIG,
    tenant_key: input.tenant_key,
    site_name: input.site_name,
    public_domain: input.public_domain,
    proxy_secret: generateProxySecret(),
  };
}
