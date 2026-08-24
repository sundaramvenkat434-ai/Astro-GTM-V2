-- Seed default free audit rate-limit settings into admin_settings
-- These are read dynamically by the free-audit edge function instead of being hardcoded.

INSERT INTO admin_settings (key, value, updated_at)
VALUES
  ('free_audit_create_limit',  '5',  now()),
  ('free_audit_analyze_limit', '10', now()),
  ('free_audit_serp_limit',    '10', now()),
  ('free_audit_scrape_limit',  '10', now()),
  ('free_audit_ip_whitelist',  '',   now())
ON CONFLICT (key) DO NOTHING;
