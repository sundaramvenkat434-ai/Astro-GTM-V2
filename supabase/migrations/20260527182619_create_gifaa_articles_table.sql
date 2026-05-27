/*
  # Create gifaa_articles table

  1. New Tables
    - `gifaa_articles`
      - `id` (uuid, primary key)
      - `slug` (text, unique, URL-friendly identifier)
      - `title` (text, article title)
      - `excerpt` (text, short description for cards)
      - `hero_image` (text, URL of hero/cover image)
      - `category` (text, article category label)
      - `author_name` (text)
      - `author_role` (text)
      - `author_avatar` (text, URL)
      - `read_time` (text, e.g. "12 min read")
      - `sections` (jsonb, array of content sections)
      - `faqs` (jsonb, array of FAQ objects)
      - `related_slugs` (text[], slugs of related articles)
      - `meta_title` (text)
      - `meta_description` (text)
      - `status` (text, draft/published)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `gifaa_articles`
    - Anon users can SELECT published articles
    - Authenticated users have full CRUD access

  3. Notes
    - sections jsonb stores an ordered array of section objects
    - Each section has: type, heading, content, image_url, table_data, reviews, etc.
*/

CREATE TABLE IF NOT EXISTS gifaa_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  hero_image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  author_role text NOT NULL DEFAULT '',
  author_avatar text NOT NULL DEFAULT '',
  read_time text NOT NULL DEFAULT '',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_slugs text[] NOT NULL DEFAULT '{}',
  meta_title text NOT NULL DEFAULT '',
  meta_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gifaa_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon users can read published articles"
  ON gifaa_articles
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Authenticated users can read all articles"
  ON gifaa_articles
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert articles"
  ON gifaa_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update articles"
  ON gifaa_articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete articles"
  ON gifaa_articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
