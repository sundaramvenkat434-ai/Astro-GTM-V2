/*
  # Add header menu items and footer links to gifaa_tenants

  1. New Columns on `gifaa_tenants`
    - `header_menu_items` (jsonb) - Array of {label, url} objects for the header navigation
    - `footer_links` (jsonb) - Array of {heading, text, url} objects for the footer links section

  2. Notes
    - Stored as JSONB arrays for flexibility
    - Default to empty arrays for backwards compatibility
    - Header items render as navigation links in the article page header
    - Footer links render as a list with optional heading and descriptive text
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'header_menu_items'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN header_menu_items jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'footer_links'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN footer_links jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;
