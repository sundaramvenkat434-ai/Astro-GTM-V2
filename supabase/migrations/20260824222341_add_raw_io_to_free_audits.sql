/*
# Add raw input/output logging to free_audits

## Purpose
Store the raw OpenRouter input prompt and output response for search query generation
so the public audit page can display them in a debug popup for troubleshooting.

## Changes
- Added `search_queries_raw_input` (jsonb) — the user message content sent to OpenRouter
- Added `search_queries_raw_output` (jsonb) — the full OpenRouter response JSON
- Both default to '{}' and are nullable

## Security
- No RLS changes. These columns are only accessible via the service role key
  through the free-audit edge function, same as all other free_audits columns.
*/

ALTER TABLE free_audits
  ADD COLUMN IF NOT EXISTS search_queries_raw_input jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS search_queries_raw_output jsonb DEFAULT '{}'::jsonb;