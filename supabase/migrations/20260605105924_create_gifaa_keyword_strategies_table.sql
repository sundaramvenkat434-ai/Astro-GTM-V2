CREATE TABLE gifaa_keyword_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gifaa_tenants(id) ON DELETE CASCADE,
  search_term text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT 'us',
  location_uule text DEFAULT '',
  serp_data jsonb DEFAULT '[]'::jsonb,
  scraped_urls text[] DEFAULT '{}',
  themes jsonb DEFAULT '[]'::jsonb,
  generation_params jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gifaa_keyword_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_keyword_strategies" ON gifaa_keyword_strategies FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_keyword_strategies" ON gifaa_keyword_strategies FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_keyword_strategies" ON gifaa_keyword_strategies FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_keyword_strategies" ON gifaa_keyword_strategies FOR DELETE
  TO authenticated USING (true);

CREATE INDEX idx_keyword_strategies_tenant ON gifaa_keyword_strategies(tenant_id);
