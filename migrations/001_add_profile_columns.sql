-- Migration: Add profile_picture_url and is_moderator columns to profiles table
-- Date: 2024
-- Requirements: 9.4, 10.1

-- Add profile_picture_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add is_moderator column to profiles table with default value
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT FALSE;

-- Backfill is_moderator=false for existing users (in case column already exists without default)
UPDATE profiles 
SET is_moderator = FALSE 
WHERE is_moderator IS NULL;

-- Add comment to document the columns
COMMENT ON COLUMN profiles.profile_picture_url IS 'URL to user profile picture stored in Supabase Storage';
COMMENT ON COLUMN profiles.is_moderator IS 'Flag indicating if user has moderator privileges';
