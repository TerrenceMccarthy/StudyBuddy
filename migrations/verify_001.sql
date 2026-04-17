-- Verification script for migration 001_add_profile_columns.sql
-- Run this after executing the migration to verify success

-- Check that columns were added with correct types and defaults
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('profile_picture_url', 'is_moderator')
ORDER BY column_name;

-- Expected output:
-- column_name          | data_type | is_nullable | column_default
-- ---------------------|-----------|-------------|---------------
-- is_moderator         | boolean   | YES         | false
-- profile_picture_url  | text      | YES         | NULL

-- Verify no NULL values in is_moderator column
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_moderator IS NULL THEN 1 END) as null_moderator_count,
    COUNT(CASE WHEN is_moderator = TRUE THEN 1 END) as moderator_count,
    COUNT(CASE WHEN is_moderator = FALSE THEN 1 END) as non_moderator_count
FROM profiles;

-- Expected: null_moderator_count should be 0

-- Sample data check (first 5 profiles)
SELECT 
    id,
    profile_picture_url,
    is_moderator,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;

-- Check column comments
SELECT 
    col_description('profiles'::regclass, ordinal_position) as column_comment,
    column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('profile_picture_url', 'is_moderator')
ORDER BY column_name;
