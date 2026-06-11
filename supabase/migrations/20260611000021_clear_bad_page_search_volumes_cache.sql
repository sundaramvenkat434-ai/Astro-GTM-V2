-- Clear all cached page_search_volumes so the fixed enrichment logic re-runs on next view
UPDATE gifaa_keyword_strategies
SET page_search_volumes = '{}'::jsonb
WHERE page_search_volumes != '{}'::jsonb;
