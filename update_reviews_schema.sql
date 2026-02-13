-- 1. Add new columns for review management
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected', 'hidden'
ADD COLUMN IF NOT EXISTS admin_response TEXT,
ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN DEFAULT false; -- Just in case

-- 2. Fix RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access (only approved reviews)
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews
FOR SELECT
TO public
USING (status = 'approved'); 
-- Note: This means admin needs a different policy or bypass to see 'pending'/'rejected'

-- Allow simple insert for authenticated users
DROP POLICY IF EXISTS "Authenticated insert reviews" ON reviews;
CREATE POLICY "Authenticated insert reviews" ON reviews
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow full access for admins (or all authenticated for now if no roles)
-- Ideally: USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() IN (SELECT user_id FROM admins))
-- For this setup, we'll allow authenticated users to UPDATE/DELETE for simplicity as per "straight way" request
-- WARNING: This is permissive. Replace with specific admin check in production.
DROP POLICY IF EXISTS "Admin full access" ON reviews;
CREATE POLICY "Admin full access" ON reviews
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
