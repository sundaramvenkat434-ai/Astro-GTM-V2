/*
# Add scraped_content and understander_analysis to free_audits

## Purpose
Support the inspectable Search Queries pipeline:
  Website → Scraper saves visible formatted text → Understander reads that exact saved text → output displayed

## Changes
1. Add `scraped_content` (text) — the cleaned/formatted website text produced by the scraper.
2. Add `understander_analysis` (jsonb) — the structured AI understanding produced by the understander step.
3. Seed `free_audit_understander_prompt` in admin_settings with a default system prompt.
4. Seed `ai_max_tokens_free_audit_understander_prompt` with default 4000.
5. Seed `ai_log_enabled_free_audit_understander_prompt` with default 'false'.

## Security
- No RLS changes. These columns are only accessible via the service role key
  through the free-audit edge function, same as all other free_audits columns.
*/

ALTER TABLE free_audits
  ADD COLUMN IF NOT EXISTS scraped_content text DEFAULT '',
  ADD COLUMN IF NOT EXISTS understander_analysis jsonb DEFAULT '{}'::jsonb;

INSERT INTO admin_settings (key, value, updated_at)
VALUES
  ('free_audit_understander_prompt', 'You are an expert business analyst. You are given the cleaned, visible text content extracted from a company website. Your job is to understand what this business is and explain your reasoning.

Analyze the website content and return a concise structured understanding of the business as JSON with the following fields:

{
  "what_it_does": "A 1-2 sentence summary of what the business does",
  "primary_offering": "The main product, service, or solution the business sells",
  "business_category": "The industry or category this business belongs to",
  "target_customer": "Who the business is trying to reach (demographics, roles, company types)",
  "problems_solved": "What customer problems or needs this business addresses",
  "likely_search_intent": "How potential customers would search to find this business (informational, commercial, transactional, etc.)",
  "reasoning": "Short explanation of why you reached these conclusions, citing specific evidence from the website content"
}

Return ONLY valid JSON. No markdown, no code fences.', now()),
  ('ai_max_tokens_free_audit_understander_prompt', '4000', now()),
  ('ai_log_enabled_free_audit_understander_prompt', 'false', now())
ON CONFLICT (key) DO NOTHING;