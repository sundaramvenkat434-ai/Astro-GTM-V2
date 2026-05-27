/*
  # Add TOC and CTA fields to gifaa_articles

  1. Modified Tables
    - `gifaa_articles`
      - `cta_heading` (text) - Heading for the sidebar CTA form
      - `cta_description` (text) - Description text for the CTA
      - `cta_button_text` (text) - Button label
      - `cta_success_message` (text) - Message shown after submission
      - `show_toc` (boolean) - Whether to display table of contents sidebar

  2. Notes
    - TOC is auto-generated from heading sections, but can be toggled
    - CTA fields are optional; if empty, sidebar CTA won't render
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_heading'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_heading text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_description'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_description text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_button_text'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_button_text text NOT NULL DEFAULT 'Subscribe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'cta_success_message'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN cta_success_message text NOT NULL DEFAULT 'Subscribed!';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_articles' AND column_name = 'show_toc'
  ) THEN
    ALTER TABLE gifaa_articles ADD COLUMN show_toc boolean NOT NULL DEFAULT true;
  END IF;
END $$;
