/*
  # Add logo height settings to gifaa_tenants

  1. Modified Tables
    - `gifaa_tenants`
      - Added `header_logo_height` (integer, default 32) - logo height in px for page headers
      - Added `footer_logo_height` (integer, default 24) - logo height in px for page footers

  2. Notes
    - These control the rendered size of the tenant logo in article pages
    - Defaults match the previously hardcoded values (h-8 = 32px, h-6 = 24px)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'header_logo_height'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN header_logo_height integer NOT NULL DEFAULT 32;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'footer_logo_height'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN footer_logo_height integer NOT NULL DEFAULT 24;
  END IF;
END $$;
