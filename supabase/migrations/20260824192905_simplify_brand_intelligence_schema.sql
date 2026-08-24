/*
# Simplify Brand Intelligence schema to flat fields

## Summary
Replaces the deeply nested brand intelligence JSON structure (brand, audience,
offerings, seo, market_discovery objects) with 8 simple flat columns that are
easier for the AI to generate reliably and easier for the admin to review/edit.

## New Columns on gifaa_brand_intelligence
1. about_brand (text) -- short summary, max 50 words
2. primary_business_segment (text) -- exactly 1
3. primary_geography (text) -- exactly 1
4. target_audience (text) -- short summary, max 50 words
5. primary_search_keyword (text) -- exactly 1 non-branded keyword
6. secondary_search_keywords (jsonb) -- array of exactly 3 strings
7. long_tail_keyword_examples (jsonb) -- array of exactly 5 strings

## Modified Columns
- content_opportunities (jsonb) -- repurposed to store array of short strings
  (max 5) instead of {topic, reason} objects. Old rows with object format
  are left as-is; new inserts use string arrays.

## Preserved Columns (backward compatibility)
- brand, audience, offerings, seo, market_discovery, confidence_reason,
  brand_intelligence_score, raw_ai_response -- kept for existing rows.
  New inserts will leave them as defaults.

## Updated admin_settings
- brand_analyzer_prompt -- updated to the new simplified prompt that asks
  the AI for only the 8 flat fields in a simple JSON schema.

## Security
- No RLS changes. Existing policies on gifaa_brand_intelligence remain.
*/

-- Add new flat columns
ALTER TABLE gifaa_brand_intelligence
  ADD COLUMN IF NOT EXISTS about_brand text,
  ADD COLUMN IF NOT EXISTS primary_business_segment text,
  ADD COLUMN IF NOT EXISTS primary_geography text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS primary_search_keyword text,
  ADD COLUMN IF NOT EXISTS secondary_search_keywords jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS long_tail_keyword_examples jsonb DEFAULT '[]'::jsonb;

-- Update the brand analyzer prompt to the new simplified version
INSERT INTO admin_settings (key, value, updated_at)
VALUES (
  'brand_analyzer_prompt',
  'You are an expert SEO strategist and brand researcher. Analyze the provided company website or document content and return ONLY valid JSON. Keep every text field concise. Extract only the following:
About the Brand: short summary, maximum 50 words
Primary Business Segment: exactly 1
Primary Geography: exactly 1
Target Audience: short summary, maximum 50 words
Primary Search Keyword: exactly 1 non-branded keyword representing the overall business category
Secondary Search Keywords: exactly 3
Long-tail Keyword Examples: exactly 5
Content Opportunities: maximum 5, each very short
Return ONLY this JSON schema:
{
  "about_brand": "",
  "primary_business_segment": "",
  "primary_geography": "",
  "target_audience": "",
  "primary_search_keyword": "",
  "secondary_search_keywords": ["", "", ""],
  "long_tail_keyword_examples": ["", "", "", "", ""],
  "content_opportunities": ["", "", "", "", ""]
}',
  now()
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
