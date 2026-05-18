/*
  # Normalize badge values

  Sets any badge values that are not in the allowed set (new, trending, free-tier, top-choice)
  to 'new'. This covers legacy 'popular' and any other stray values.
*/

UPDATE tool_pages
SET badge = 'new'
WHERE badge IS NOT NULL
  AND badge NOT IN ('new', 'trending', 'free-tier', 'top-choice');
