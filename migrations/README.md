# Database Migrations

This directory contains SQL migration scripts for the StudyBuddy database.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to the project root
cd StudyBuddy

# Run the migration
supabase db push migrations/001_add_profile_columns.sql
```

### Option 3: Direct Database Connection

If you have direct PostgreSQL access:

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f migrations/001_add_profile_columns.sql
```

## Migration Files

### 001_add_profile_columns.sql

**Purpose**: Adds support for profile pictures and moderator roles

**Changes**:
- Adds `profile_picture_url` column to `profiles` table (TEXT, nullable)
- Adds `is_moderator` column to `profiles` table (BOOLEAN, default FALSE)
- Backfills `is_moderator=false` for existing users

**Requirements**: 9.4, 10.1

**Safe to re-run**: Yes (uses `IF NOT EXISTS` and conditional updates)

## Verification

After running the migration, verify the changes:

```sql
-- Check that columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('profile_picture_url', 'is_moderator');

-- Verify all existing users have is_moderator set
SELECT COUNT(*) 
FROM profiles 
WHERE is_moderator IS NULL;
-- Should return 0

-- Check sample data
SELECT id, profile_picture_url, is_moderator 
FROM profiles 
LIMIT 5;
```

## Rollback

If you need to rollback this migration:

```sql
-- Remove the columns
ALTER TABLE profiles DROP COLUMN IF EXISTS profile_picture_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS is_moderator;
```

**Warning**: Rollback will permanently delete all profile pictures and moderator role assignments.
