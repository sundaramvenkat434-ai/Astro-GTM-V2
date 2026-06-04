/*
  # Create atomic tenant creation function

  1. New Functions
    - `create_tenant_with_domain(...)` - Atomically creates a tenant row and its primary domain mapping
      - Parameters: tenant_key, site_name, public_domain, proxy_secret, and all setting defaults
      - Returns the new tenant's UUID
      - Both inserts succeed together or fail together (inside a single function = single transaction)

  2. Notes
    - Ensures no partial tenant creation (orphaned tenant without domain)
    - Called from the admin "Add Tenant" form
    - Uses the PL/pgSQL function context which is inherently transactional
*/

CREATE OR REPLACE FUNCTION create_tenant_with_domain(
  p_tenant_key text,
  p_site_name text,
  p_public_domain text,
  p_proxy_secret text,
  p_logo_url text DEFAULT NULL,
  p_header_logo_height integer DEFAULT 32,
  p_footer_logo_height integer DEFAULT 24,
  p_powered_by_enabled boolean DEFAULT true,
  p_powered_by_height integer DEFAULT 20,
  p_powered_by_opacity integer DEFAULT 60,
  p_ga_measurement_id text DEFAULT NULL,
  p_header_menu_items jsonb DEFAULT '[]'::jsonb,
  p_footer_links jsonb DEFAULT '[]'::jsonb,
  p_status text DEFAULT 'active'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  INSERT INTO gifaa_tenants (
    tenant_key, site_name, public_domain, proxy_secret,
    logo_url, header_logo_height, footer_logo_height,
    powered_by_enabled, powered_by_height, powered_by_opacity,
    ga_measurement_id, header_menu_items, footer_links, status
  ) VALUES (
    p_tenant_key, p_site_name, p_public_domain, p_proxy_secret,
    p_logo_url, p_header_logo_height, p_footer_logo_height,
    p_powered_by_enabled, p_powered_by_height, p_powered_by_opacity,
    p_ga_measurement_id, p_header_menu_items, p_footer_links, p_status
  )
  RETURNING id INTO v_tenant_id;

  INSERT INTO gifaa_tenant_domains (tenant_id, domain, is_primary)
  VALUES (v_tenant_id, p_public_domain, true);

  RETURN v_tenant_id;
END;
$$;