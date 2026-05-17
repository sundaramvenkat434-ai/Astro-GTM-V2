/*
  # Update category sort_order

  Sets the display order to match the new sequence:
  1. Content & SEO (seo-content)
  2. Lead Generation (lead-generation)
  3. Sales Outreach (sales-outreach)
  4. Social Media (social-media)
  5. Paid Marketing (paid-marketing)
  6. Analytics & Insights (analytics-insights)
*/

UPDATE categories SET sort_order = 1 WHERE slug = 'seo-content';
UPDATE categories SET sort_order = 2 WHERE slug = 'lead-generation';
UPDATE categories SET sort_order = 3 WHERE slug = 'sales-outreach';
UPDATE categories SET sort_order = 4 WHERE slug = 'social-media';
UPDATE categories SET sort_order = 5 WHERE slug = 'paid-marketing';
UPDATE categories SET sort_order = 6 WHERE slug = 'analytics-insights';
