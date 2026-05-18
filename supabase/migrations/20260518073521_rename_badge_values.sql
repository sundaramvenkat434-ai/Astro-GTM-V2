/*
  # Rename badge values in tool_pages

  1. Changes
    - Rename 'popular' → 'trending'
    - Rename 'free' → 'free-tier'
    - 'new', 'hot' remain unchanged
  2. Handles all existing DB rows
*/

UPDATE tool_pages SET badge = 'trending'  WHERE badge = 'popular';
UPDATE tool_pages SET badge = 'free-tier' WHERE badge = 'free';
