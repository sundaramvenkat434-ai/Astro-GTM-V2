/*
  # Add logo_url to gifaa_tenants

  1. Modified Tables
    - `gifaa_tenants`
      - Added `logo_url` (text, nullable) - URL of the tenant logo image

  2. Notes
    - Logo is displayed in article page headers instead of text-based site name
    - Stored as a URL (can be a Supabase storage URL or external URL)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN logo_url text;
  END IF;
END $$;
