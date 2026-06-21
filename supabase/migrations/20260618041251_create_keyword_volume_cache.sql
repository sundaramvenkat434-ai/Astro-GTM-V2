CREATE TABLE IF NOT EXISTS keyword_volume_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  country_code text NOT NULL DEFAULT 'us',
  industry text NOT NULL DEFAULT '',
  volume integer NOT NULL DEFAULT 0,
  confidence integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_keyword_volume_cache_lookup
  ON keyword_volume_cache (keyword, country_code, industry);

ALTER TABLE keyword_volume_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_keyword_volume_cache" ON keyword_volume_cache
  FOR SELECT TO anon USING (true);

CREATE POLICY "service_role_all_keyword_volume_cache" ON keyword_volume_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);