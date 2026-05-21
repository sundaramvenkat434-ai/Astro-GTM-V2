/*
  # Add limitations column to tool_pages

  1. Changes
    - Adds `limitations` (jsonb, default []) to `tool_pages`
      - Stores an array of string bullets representing known limitations of the tool
      - Mirrors the shape of the existing `honest_take` field

  2. Notes
    - No data loss risk; additive change only
    - RLS policies on tool_pages already cover this column
*/

ALTER TABLE tool_pages
  ADD COLUMN IF NOT EXISTS limitations jsonb DEFAULT '[]'::jsonb;
