'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface TenantData {
  id: string;
  tenant_key: string;
  public_domain: string;
  site_name: string;
  proxy_secret: string;
  logo_url: string | null;
  header_logo_height: number;
  footer_logo_height: number;
  powered_by_enabled: boolean;
  powered_by_height: number;
  powered_by_opacity: number;
  ga_measurement_id: string | null;
  header_menu_items: { label: string; url: string }[];
  footer_links: { heading: string; text: string; url: string }[];
  status: string;
  created_at: string;
  articles_meta_title: string | null;
  articles_meta_description: string | null;
  articles_page_heading: string | null;
  articles_page_subtitle: string | null;
  default_categories: string[];
  theme_bg_color: string | null;
  theme_font_family: string | null;
  theme_font_size_body: number;
  theme_font_size_heading: number;
  theme_header_bg_color: string | null;
  theme_header_text_color: string | null;
  theme_footer_bg_color: string | null;
  theme_footer_text_color: string | null;
}

interface TenantContextValue {
  tenantKey: string;
  tenant: TenantData | null;
  loading: boolean;
  reload: () => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ tenantKey, children }: { tenantKey: string; children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('gifaa_tenants')
      .select('*')
      .eq('tenant_key', tenantKey)
      .maybeSingle();
    setTenant(data);
    setLoading(false);
  }, [tenantKey]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return (
    <TenantContext.Provider value={{ tenantKey, tenant, loading, reload: load }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider');
  return ctx;
}
