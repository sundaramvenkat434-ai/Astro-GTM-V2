/*
  # Multi-tenant support for gifaa_articles

  1. Modified Tables
    - `gifaa_articles`
      - `tenant` (text) - Tenant identifier (e.g. 'gifaa', 'safebox')
      - Unique constraint on (tenant, slug) to prevent slug collisions across tenants

  2. New Tables
    - `gifaa_tenants`
      - `id` (uuid, primary key)
      - `tenant_key` (text, unique) - Short identifier matching article.tenant
      - `public_domain` (text) - The public domain for this tenant (e.g. 'gifaa.in')
      - `site_name` (text) - Display name
      - `proxy_secret` (text) - Secret for x-secret header validation
      - `created_at` (timestamptz)

  3. Security
    - RLS enabled on gifaa_tenants
    - Authenticated users get full access to gifaa_tenants
    - Anon users can read tenant config (needed for SSR rendering)

  4. Notes
    - Existing articles default to tenant 'gifaa'
    - Slug uniqueness is now per-tenant, not global
*/

-- Add tenant column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'tenant'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN tenant text NOT NULL DEFAULT 'gifaa';
  END IF;
END $$;

-- Drop the old unique constraint on slug alone and add tenant+slug unique
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'gifaa_articles' AND constraint_name = 'gifaa_articles_slug_key'
  ) THEN
    ALTER TABLE gifaa_articles DROP CONSTRAINT gifaa_articles_slug_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'gifaa_articles' AND constraint_name = 'gifaa_articles_tenant_slug_key'
  ) THEN
    ALTER TABLE gifaa_articles ADD CONSTRAINT gifaa_articles_tenant_slug_key UNIQUE (tenant, slug);
  END IF;
END $$;

-- Create tenant config table
CREATE TABLE IF NOT EXISTS gifaa_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_key text UNIQUE NOT NULL,
  public_domain text NOT NULL,
  site_name text NOT NULL DEFAULT '',
  proxy_secret text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gifaa_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read tenant config"
  ON gifaa_tenants
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated can read tenant config"
  ON gifaa_tenants
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert tenants"
  ON gifaa_tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update tenants"
  ON gifaa_tenants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete tenants"
  ON gifaa_tenants
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Seed initial tenants
INSERT INTO gifaa_tenants (tenant_key, public_domain, site_name, proxy_secret)
VALUES
  ('gifaa', 'gifaa.in', 'Gifaa', 'gifaa-proxy-secret-change-me'),
  ('safebox', 'safebox.life', 'Safebox', 'safebox-proxy-secret-change-me')
ON CONFLICT (tenant_key) DO NOTHING;

-- Create index for fast tenant+slug lookups
CREATE INDEX IF NOT EXISTS idx_gifaa_articles_tenant_slug ON gifaa_articles (tenant, slug);
CREATE INDEX IF NOT EXISTS idx_gifaa_articles_tenant_status ON gifaa_articles (tenant, status);
