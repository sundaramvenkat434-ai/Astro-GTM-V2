/*
  # Add who_is_it_for to tool_pages

  Adds a JSONB column to store audience targeting data for the "Who Is It For" section.

  Each entry: { "audience": "string", "score": number (1-10), "note": "optional string" }
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_pages' AND column_name = 'who_is_it_for'
  ) THEN
    ALTER TABLE tool_pages ADD COLUMN who_is_it_for jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
