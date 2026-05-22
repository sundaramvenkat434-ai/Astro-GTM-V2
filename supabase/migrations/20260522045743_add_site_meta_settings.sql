/*
  # Add site meta title and description settings

  ## Summary
  Seeds two new rows in `admin_settings` for controlling the site-wide
  meta title and meta description displayed in search results and browser tabs.

  ## New Rows
  - `site_meta_title` — The site's meta/page title
  - `site_meta_description` — The site's meta description

  ## Notes
  - Uses ON CONFLICT DO NOTHING to preserve any existing values.
  - No schema changes; uses existing admin_settings table.
*/

INSERT INTO admin_settings (key, value)
VALUES
  ('site_meta_title', 'AI Tools Directory — Discover the Best AI Tools'),
  ('site_meta_description', 'Explore our curated directory of the best AI tools. Find, compare, and choose the right AI solutions for your needs.')
ON CONFLICT (key) DO NOTHING;
