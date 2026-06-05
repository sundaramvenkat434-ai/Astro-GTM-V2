-- Brand Intelligence profiles per tenant
CREATE TABLE gifaa_brand_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gifaa_tenants(id) ON DELETE CASCADE,
  source_url text,
  source_filename text,
  brand_intelligence_score integer DEFAULT 0,
  brand jsonb DEFAULT '{}'::jsonb,
  audience jsonb DEFAULT '{}'::jsonb,
  offerings jsonb DEFAULT '{}'::jsonb,
  seo jsonb DEFAULT '{}'::jsonb,
  content_opportunities jsonb DEFAULT '[]'::jsonb,
  confidence_reason text,
  raw_ai_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gifaa_brand_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_brand_intelligence" ON gifaa_brand_intelligence FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_brand_intelligence" ON gifaa_brand_intelligence FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_brand_intelligence" ON gifaa_brand_intelligence FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_brand_intelligence" ON gifaa_brand_intelligence FOR DELETE
  TO authenticated USING (true);

CREATE INDEX idx_brand_intelligence_tenant ON gifaa_brand_intelligence(tenant_id);
