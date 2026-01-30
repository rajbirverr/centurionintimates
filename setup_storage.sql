-- ============================================
-- SETUP STORAGE BUCKET
-- Run this to create the 'images' bucket and enable access
-- ============================================

-- 1. Create the 'images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects (Skipped: Already enabled by default on Supabase)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies for the 'images' bucket

-- Policy 1: Allow Public Read Access (Everyone can view images)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Policy 2: Allow Authenticated Users (Admins) to Upload
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- Policy 3: Allow Authenticated Users (Admins) to Update
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

-- Policy 4: Allow Authenticated Users (Admins) to Delete
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );

-- 4. Verify creation
SELECT * FROM storage.buckets WHERE id = 'images';
