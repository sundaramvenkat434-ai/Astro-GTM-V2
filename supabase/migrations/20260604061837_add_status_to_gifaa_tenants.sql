/*
  # Add status column to gifaa_tenants

  1. Modified Tables
    - `gifaa_tenants`
      - Added `status` (text, default 'active') - controls whether tenant is active or disabled

  2. Notes
    - Existing tenants get status = 'active' by default
    - Possible values: 'active', 'disabled'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'status'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN status text NOT NULL DEFAULT 'active';
  END IF;
END $$;