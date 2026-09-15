/*
# Add page_ideas columns to free_audits table

1. Changes
- Adds three new jsonb columns to free_audits:
  - page_ideas: stores the structured page ideas array from AI
  - page_ideas_raw_input: stores the raw input sent to AI
  - page_ideas_raw_output: stores the raw output from AI

2. Security
- No new tables. Existing RLS policies on free_audits remain unchanged.
*/

ALTER TABLE free_audits
  ADD COLUMN IF NOT EXISTS page_ideas jsonb,
  ADD COLUMN IF NOT EXISTS page_ideas_raw_input jsonb,
  ADD COLUMN IF NOT EXISTS page_ideas_raw_output jsonb;