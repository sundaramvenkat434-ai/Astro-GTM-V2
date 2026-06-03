/*
  # Add tenant-level Google Analytics support

  1. Schema changes
    - Add `ga_measurement_id` (text, nullable) to `gifaa_tenants`
      - Stores the tenant's GA4 Measurement ID (e.g., G-XXXXXXXXXX)
      - Null when tenant has not configured analytics
      - Injected client-side ONLY when an article has status = 'approved'

  2. Security
    - No RLS policy changes required; existing policies on `gifaa_tenants` already cover this column
    - Field is administrative configuration, owned by tenant managers

  3. Notes
    - Adding the column with `IF NOT EXISTS` keeps the migration idempotent
    - No default value: tenants opt-in by saving an ID through the admin UI
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gifaa_tenants' AND column_name = 'ga_measurement_id'
  ) THEN
    ALTER TABLE gifaa_tenants ADD COLUMN ga_measurement_id text;
  END IF;
END $$;
