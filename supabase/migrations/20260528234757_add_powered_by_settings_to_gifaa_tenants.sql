/*
  # Add powered-by AstroGTM settings to gifaa_tenants

  1. Modified Tables
    - `gifaa_tenants`
      - `powered_by_enabled` (boolean, default true) - toggle to show/hide the powered-by badge
      - `powered_by_height` (integer, default 20) - logo height in pixels
      - `powered_by_opacity` (integer, default 60) - opacity percentage 0-100

  2. Notes
    - These control the "Powered by AstroGTM" badge in tenant article footers
    - Defaults: enabled, 20px height, 60% opacity
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'powered_by_enabled'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN powered_by_enabled boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'powered_by_height'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN powered_by_height integer NOT NULL DEFAULT 20;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'powered_by_opacity'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN powered_by_opacity integer NOT NULL DEFAULT 60;
  END IF;
END $$;
