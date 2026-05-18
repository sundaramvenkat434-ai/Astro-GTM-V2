/*
  # Create tool-logos storage bucket

  1. New Bucket
    - `tool-logos` — public bucket for tool logo images (PNG/JPG/WebP)
  2. Security
    - Authenticated users can upload, update, and delete objects
    - Anyone can read/view objects (public bucket)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tool-logos',
  'tool-logos',
  true,
  524288,  -- 512 KB max
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload tool logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tool-logos');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update tool logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tool-logos')
  WITH CHECK (bucket_id = 'tool-logos');

-- Allow authenticated users to delete tool logos
CREATE POLICY "Authenticated users can delete tool logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tool-logos');

-- Allow public read access
CREATE POLICY "Public can view tool logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tool-logos');
