/*
  # Remove non-Gifaa tenants and add tenant domains table

  1. Data Cleanup
    - Remove all rows from `gifaa_tenants` where tenant_key != 'gifaa'
    - Remove any articles belonging to non-gifaa tenants

  2. New Tables
    - `gifaa_tenant_domains`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, FK to gifaa_tenants)
      - `domain` (text, unique) - e.g. "gifaa.in", "www.gifaa.in"
      - `is_primary` (boolean, default false)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on `gifaa_tenant_domains`
    - Anon can read domains
    - Authenticated users have full CRUD

  4. Seed Data
    - Insert gifaa.in as primary domain
    - Insert www.gifaa.in as secondary domain
*/

-- Remove non-gifaa tenants
DELETE FROM gifaa_tenants WHERE tenant_key != 'gifaa';

-- Remove articles belonging to non-gifaa tenants
DELETE FROM gifaa_articles WHERE tenant != 'gifaa';

-- Create domains table
CREATE TABLE IF NOT EXISTS gifaa_tenant_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gifaa_tenants(id) ON DELETE CASCADE,
  domain text UNIQUE NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gifaa_tenant_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read tenant domains"
  ON gifaa_tenant_domains FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can read tenant domains"
  ON gifaa_tenant_domains FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tenant domains"
  ON gifaa_tenant_domains FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tenant domains"
  ON gifaa_tenant_domains FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tenant domains"
  ON gifaa_tenant_domains FOR DELETE
  TO authenticated
  USING (true);

-- Seed initial domains for gifaa tenant
INSERT INTO gifaa_tenant_domains (tenant_id, domain, is_primary)
SELECT id, 'gifaa.in', true FROM gifaa_tenants WHERE tenant_key = 'gifaa'
ON CONFLICT (domain) DO NOTHING;

INSERT INTO gifaa_tenant_domains (tenant_id, domain, is_primary)
SELECT id, 'www.gifaa.in', false FROM gifaa_tenants WHERE tenant_key = 'gifaa'
ON CONFLICT (domain) DO NOTHING;
