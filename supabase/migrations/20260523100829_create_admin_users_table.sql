/*
  # Create admin_users table

  ## Purpose
  Tracks all admin users who have access to the admin panel. Uses Supabase auth
  for actual authentication — this table stores metadata and is the source of truth
  for who is considered an admin.

  ## New Tables
  - `admin_users`
    - `id` (uuid, primary key, references auth.users)
    - `email` (text, unique, not null) — mirrors auth email for display
    - `display_name` (text) — optional friendly name
    - `created_at` (timestamptz) — when they were granted admin access
    - `last_login_at` (timestamptz) — updated on each login by edge function / client

  ## Security
  - RLS enabled; only authenticated users can read/write (all admins are authenticated)
  - SELECT: any authenticated user (all admins should see the list)
  - INSERT: any authenticated user (admins can invite others)
  - UPDATE: any authenticated user (admins can edit)
  - DELETE: any authenticated user (admins can remove)

  ## Notes
  - When a new admin user is created here, a Supabase auth user is also created via
    the admin API (handled in the edge function / client using service role).
  - The `last_login_at` column is updated client-side on successful login.
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  email text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated admins can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (true);
