/*
# Add page_ideas column to free_audits table

1. Changes
- Adds `page_ideas` (jsonb) column to `free_audits` table to store AI-generated SEO page ideas
- Adds `page_ideas_raw_input` (jsonb) for raw AI input logging
- Adds `page_ideas_raw_output` (jsonb) for raw AI output logging
- These columns store the result of the new "generate-page-ideas" action

2. Security
- No new tables. Existing RLS policies on free_audits remain unchanged.
- The table already has anon+authenticated CRUD policies (no-auth app pattern).
*/