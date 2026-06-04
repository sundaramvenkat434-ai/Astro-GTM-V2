/*
  # Add CTA settings to gifaa_articles

  1. New Columns on `gifaa_articles`
    - `cta_button_color` (text) - Hex color for the CTA button (e.g. #1a2a4a)
    - `cta_redirect_url` (text) - URL to redirect when CTA button is clicked (replaces email form behavior)
    - `cta_show_sidebar` (boolean) - Show CTA in left sidebar (default true, existing behavior)
    - `cta_show_end` (boolean) - Show a bigger CTA section at the end of the article
    - `cta_inline_after_section` (integer) - If set, show inline CTA after this section index (-1 means disabled)

  2. Notes
    - These columns extend the existing CTA system
    - Default values preserve backwards compatibility (sidebar remains enabled)
    - Inline CTA position is managed from the page editor Content tab
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_button_color'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_button_color text NOT NULL DEFAULT '#1a2a4a';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_redirect_url'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_redirect_url text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_show_sidebar'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_show_sidebar boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_show_end'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_show_end boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_inline_after_section'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_inline_after_section integer NOT NULL DEFAULT -1;
  END IF;
END $$;
