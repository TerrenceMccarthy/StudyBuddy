# Profile Picture Storage Setup

## Supabase Storage Bucket Configuration

This document provides instructions for setting up the `profile-pictures` storage bucket in Supabase for the StudyBuddy application.

### Step 1: Create the Storage Bucket

1. Log in to your Supabase dashboard at https://supabase.com
2. Navigate to your StudyBuddy project
3. Click on "Storage" in the left sidebar
4. Click "New bucket" button
5. Configure the bucket with the following settings:
   - **Bucket name**: `profile-pictures`
   - **Public bucket**: ✅ Enabled (allows public read access)
   - **File size limit**: 5MB (5242880 bytes)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### Step 2: Configure Bucket Policies

After creating the bucket, set up the following policies:

#### Public Read Access Policy

```sql
-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');
```

#### Authenticated Upload Policy

```sql
-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
);
```

#### User Update Policy

```sql
-- Allow users to update their own profile pictures
CREATE POLICY "Users can update own pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### User Delete Policy

```sql
-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete own pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Verify Configuration

1. Go to Storage > profile-pictures in Supabase dashboard
2. Check that the bucket is marked as "Public"
3. Verify the policies are active in the "Policies" tab
4. Test upload by running the application and uploading a profile picture

### Step 4: Database Schema

Ensure the `profiles` table has the `profile_picture_url` column:

```sql
-- Add profile_picture_url column if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
```

This column should already exist if you've run the migration in `StudyBuddy/migrations/001_add_profile_columns.sql`.

### Step 5: CORS Configuration (if needed)

If you encounter CORS issues when uploading from localhost or your domain:

1. Go to Settings > API in Supabase dashboard
2. Add your application URLs to the "CORS allowed origins" list:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (if using different port)
   - Your production domain (e.g., `https://studybuddy.app`)

### Troubleshooting

**Issue**: Upload fails with "Policy violation" error
- **Solution**: Verify that the authenticated upload policy is active and the user is logged in

**Issue**: Images don't display after upload
- **Solution**: Check that the bucket is set to "Public" and the public read policy is active

**Issue**: File size limit exceeded
- **Solution**: The frontend validates files < 5MB. Check that the bucket file size limit matches

**Issue**: CORS errors in browser console
- **Solution**: Add your application URL to the CORS allowed origins in Supabase settings

### Security Notes

- Profile pictures are publicly readable by design (anyone can view them)
- Only authenticated users can upload pictures
- Users can only modify/delete their own pictures
- File size is limited to 5MB to prevent abuse
- Only image MIME types are allowed

### Implementation Details

The profile picture upload is implemented in:
- **Frontend**: `StudyBuddy/client/src/pages/Profile.jsx` - Upload UI and logic
- **Validation**: `StudyBuddy/client/src/utils/validation.js` - File validation
- **Display**: Profile pictures are shown in:
  - Profile page avatar
  - PostCard component (session cards)
  - Matches page
  - Session detail page

### File Naming Convention

Uploaded files are named using the pattern:
```
{user_id}-{timestamp}.{extension}
```

Example: `a1b2c3d4-1234567890.jpg`

This ensures:
- Unique filenames (no collisions)
- Easy identification of file owner
- Automatic versioning (newer uploads have higher timestamps)
