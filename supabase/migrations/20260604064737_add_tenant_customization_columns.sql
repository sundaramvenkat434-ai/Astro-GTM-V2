/*
  # Add tenant customization columns

  1. Modified Tables
    - `gifaa_tenants`
      - `articles_meta_title` (text, nullable) - SEO title for /articles page
      - `articles_meta_description` (text, nullable) - SEO description for /articles page
      - `articles_page_heading` (text, nullable) - UI heading shown on /articles page
      - `articles_page_subtitle` (text, nullable) - Subtitle shown below heading
      - `default_categories` (jsonb, default '[]') - Array of default category strings for article creation
      - `theme_bg_color` (text, nullable) - Homepage/articles page background color
      - `theme_font_family` (text, nullable) - Custom font family
      - `theme_font_size_body` (integer, default 16) - Body font size in px
      - `theme_font_size_heading` (integer, default 32) - Heading font size in px
      - `theme_header_bg_color` (text, nullable) - Header background color
      - `theme_header_text_color` (text, nullable) - Header text color
      - `theme_footer_bg_color` (text, nullable) - Footer background color
      - `theme_footer_text_color` (text, nullable) - Footer text color

  2. Notes
    - All new fields are optional with sensible defaults
    - Existing tenants are unaffected (nullable or has defaults)
    - Theme settings are applied dynamically through TenantProvider
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'articles_meta_title') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN articles_meta_title text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'articles_meta_description') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN articles_meta_description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'articles_page_heading') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN articles_page_heading text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'articles_page_subtitle') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN articles_page_subtitle text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'default_categories') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN default_categories jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_bg_color') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_bg_color text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_font_family') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_font_family text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_font_size_body') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_font_size_body integer NOT NULL DEFAULT 16;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_font_size_heading') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_font_size_heading integer NOT NULL DEFAULT 32;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_header_bg_color') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_header_bg_color text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_header_text_color') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_header_text_color text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_footer_bg_color') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_footer_bg_color text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifaa_tenants' AND column_name = 'theme_footer_text_color') THEN
    ALTER TABLE gifaa_tenants ADD COLUMN theme_footer_text_color text;
  END IF;
END $$;