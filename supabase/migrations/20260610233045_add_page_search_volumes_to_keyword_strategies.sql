ALTER TABLE gifaa_keyword_strategies
  ADD COLUMN IF NOT EXISTS page_search_volumes JSONB NOT NULL DEFAULT '{}'::jsonb;
