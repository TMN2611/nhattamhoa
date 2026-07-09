-- Add password-reset support to admin_users
-- Run this in your Supabase project's SQL Editor

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS reset_token text,
ADD COLUMN IF NOT EXISTS reset_expires timestamptz;

-- Set the owner email address for password recovery
UPDATE admin_users
SET email = 'minhnhan26112000@gmail.com'
WHERE username = 'owner' AND email IS NULL;
