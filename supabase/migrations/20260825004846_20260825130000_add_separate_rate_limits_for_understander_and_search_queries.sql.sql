/*
# Add separate rate-limit settings for understander and search-queries

## Purpose
Previously run-understander and generate-search-queries both shared the
"analyze-brand" rate-limit bucket (10/hour). This caused users to hit the
rate limit on search queries after running the understander. Give each its
own bucket by seeding dedicated admin_settings rows.

## Changes
- Seed free_audit_understander_limit = 10
- Seed free_audit_search_queries_limit = 10

## Security
- No RLS or schema changes. Only inserts settings rows.
*/

INSERT INTO admin_settings (key, value, updated_at)
VALUES
  ('free_audit_understander_limit', '10', now()),
  ('free_audit_search_queries_limit', '10', now())
ON CONFLICT (key) DO NOTHING;