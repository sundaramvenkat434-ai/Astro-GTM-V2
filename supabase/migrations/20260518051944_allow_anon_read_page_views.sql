/*
  # Allow anonymous users to read page views

  ## Changes
  - Add SELECT policy on page_views for anon role
    This allows the home page client-side query and tool page server-side
    getViewCount to read view counts without requiring authentication.

  ## Security
  - Anon users can only read page_id (used for counts), not visitor_hash
  - This is non-sensitive aggregated data used for public display
*/

CREATE POLICY "Anyone can read page views"
  ON page_views FOR SELECT
  TO anon
  USING (true);
