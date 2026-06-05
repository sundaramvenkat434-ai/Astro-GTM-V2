-- Add is_super_admin flag to admin_users (non-editable via UI)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Insert the owner as super admin (srvenkat94@gmail.com)
INSERT INTO admin_users (auth_user_id, email, display_name, is_super_admin, created_at)
VALUES (
  '16a446e9-c520-4d14-95e0-489553ca6c25',
  'srvenkat94@gmail.com',
  'Venkat SR',
  true,
  '2026-04-20 20:20:23.191337+00'
)
ON CONFLICT (email) DO UPDATE SET
  is_super_admin = true,
  auth_user_id = EXCLUDED.auth_user_id;