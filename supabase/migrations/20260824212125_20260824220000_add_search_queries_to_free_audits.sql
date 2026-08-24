-- Add search_queries column to free_audits table
ALTER TABLE free_audits
  ADD COLUMN IF NOT EXISTS search_queries jsonb DEFAULT '[]'::jsonb;

-- Seed default search queries prompt
INSERT INTO admin_settings (key, value, updated_at)
VALUES (
  'free_audit_search_queries_prompt',
  'You are an expert SEO strategist and search behavior researcher.

Analyze the provided company website content and identify how real potential customers would search to find this business, its products, services, or solutions.

Generate exactly 10 realistic, non-branded search queries.

The queries must be:
- Based on the actual business and offerings described in the website content
- Phrases that a real person could plausibly type into Google
- Meaningfully distinct from each other, not just minor keyword variations
- Focused on the best ways a potential customer could discover this business category or solution
- A mix of relevant search intents where appropriate, such as category, product, service, problem/solution, tool/software, audience-specific, commercial, or comparison queries

Do not use the company''s brand name unless it is genuinely necessary to describe a generic search behavior. Prefer non-branded discovery queries.

Avoid:
- Generic keywords that do not accurately represent the business
- Made-up phrases that people are unlikely to search
- Ten variations of the same keyword
- Keywords based only on isolated words rather than understanding the overall business

Return ONLY valid JSON:
{
  "search_queries": [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]
}',
  now()
)
ON CONFLICT (key) DO NOTHING;
