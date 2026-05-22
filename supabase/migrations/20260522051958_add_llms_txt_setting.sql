/*
  # Add llms.txt content setting

  ## Summary
  Seeds a new row in `admin_settings` for storing the llms.txt file content
  that is served at /llms.txt on the public site.

  ## New Rows
  - `llms_txt_content` — The raw text content served at /llms.txt

  ## Notes
  - Uses ON CONFLICT DO NOTHING to preserve any existing value.
  - No schema changes; uses existing admin_settings table.
*/

INSERT INTO admin_settings (key, value)
VALUES (
  'llms_txt_content',
  '# AstroGTM

## About
AstroGTM is a curated directory of AI tools for GTM (Go-To-Market), SEO, and growth teams. We help founders, marketers, and growth professionals discover, compare, and choose the best AI solutions for user acquisition and revenue growth.

## Content Types
- Tool Listings: Comprehensive reviews of individual AI tools with features, pricing, and use cases
- Top X Pages: Ranked comparisons of tools in specific categories
- Tool Comparisons: Head-to-head analysis of competing tools

## Topics Covered
- AI Writing & Content Tools
- Lead Generation Tools
- Sales Outreach Automation
- Social Media Management
- Paid Marketing & Ads
- Analytics & Insights

## Contact
For questions about our content or to submit a tool for review, visit /contact on our website.'
)
ON CONFLICT (key) DO NOTHING;
