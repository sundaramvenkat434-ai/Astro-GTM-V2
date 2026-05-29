/*
  # Create gifaa_page_views table for article analytics

  1. New Tables
    - `gifaa_page_views`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references gifaa_articles.id ON DELETE CASCADE)
      - `visitor_hash` (text, hashed IP+UA for unique user tracking)
      - `event_type` (text, 'view' or 'cta_click')
      - `viewed_at` (timestamptz, when the event occurred)

  2. Indexes
    - Composite index on (article_id, event_type) for fast aggregation
    - Index on viewed_at for time-range queries

  3. Security
    - RLS enabled
    - Anon can insert (for public page view tracking)
    - Authenticated can read (for admin analytics)
*/

CREATE TABLE IF NOT EXISTS gifaa_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES gifaa_articles(id) ON DELETE CASCADE,
  visitor_hash text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'view' CHECK (event_type IN ('view', 'cta_click')),
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gifaa_page_views_article_event_idx ON gifaa_page_views(article_id, event_type);
CREATE INDEX IF NOT EXISTS gifaa_page_views_viewed_at_idx ON gifaa_page_views(viewed_at);

ALTER TABLE gifaa_page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page view events"
  ON gifaa_page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read analytics"
  ON gifaa_page_views
  FOR SELECT
  TO authenticated
  USING (true);
