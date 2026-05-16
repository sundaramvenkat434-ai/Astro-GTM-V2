/*
  # Add sources column to tool_pages

  1. Changes
    - `tool_pages`: adds `sources` JSONB column
      - Array of objects: [{ name: string, url: string }]
      - Editor-managed only, not AI-generated
      - Defaults to empty array

  2. Notes
    - Non-destructive: uses IF NOT EXISTS guard
    - No RLS changes needed (inherits existing policy)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_pages' AND column_name = 'sources'
  ) THEN
    ALTER TABLE tool_pages ADD COLUMN sources JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;
