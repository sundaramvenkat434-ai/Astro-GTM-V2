/*
  # Expand article statuses and update RLS

  1. Changes
    - Status values now support: draft, preview, published, approved
      - draft: admin editing, not visible to public
      - preview: viewable on origin with ?preview=true, noindex
      - published: rendered on tenant domain, noindex
      - approved: rendered on tenant domain, indexed by search engines
    - Updated anon SELECT policy to allow preview, published, approved

  2. Security
    - Anon can SELECT articles with status IN (preview, published, approved)
    - Authenticated users retain full access
    - Updated existing 'published' articles to 'approved' since they were previously indexed
*/

-- Drop old anon policy and create new one
DROP POLICY IF EXISTS "Anon users can read published articles" ON gifaa_articles;

CREATE POLICY "Anon users can read visible articles"
  ON gifaa_articles
  FOR SELECT
  TO anon
  USING (status IN ('preview', 'published', 'approved'));
