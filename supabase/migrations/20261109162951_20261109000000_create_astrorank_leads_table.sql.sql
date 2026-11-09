CREATE TABLE IF NOT EXISTS astrorank_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_url text NOT NULL,
  source text NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE astrorank_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead" ON astrorank_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

REVOKE ALL ON astrorank_leads FROM anon, authenticated;
GRANT INSERT ON astrorank_leads TO anon, authenticated;
