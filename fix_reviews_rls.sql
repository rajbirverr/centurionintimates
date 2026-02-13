-- Enable RLS on reviews table if not already enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. Allow public/authenticated users to INSERT reviews
-- Drop existing insert policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated insert reviews" ON reviews;

-- Create new policy allowing anyone to insert (since users might be guests? or authenticated)
-- If your app requires login, use 'authenticated'. If guests can review, use 'anon'.
-- Based on previous context, users might need to be logged in, but let's be permissive for now or check auth.
-- The error "new row violates row-level security policy" suggests NO policy allowed insert.

CREATE POLICY "Enable insert for authenticated users only" ON "public"."reviews"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow admins full access (SELECT, UPDATE, DELETE)
-- Assuming you have an 'admin' role or check specific emails. 
-- For simplicity in this setup, we often allow service_role (which backend uses) full access.
-- But for the admin panel (which might use client-side or server-side calls), we need a policy.
-- If using server actions, we often use the Service Role key which bypasses RLS.
-- However, if using standard client connection:

DROP POLICY IF EXISTS "Enable full access for admins" ON reviews;

-- Create a policy that allows specific users (admins) to do everything.
-- Often checking `auth.uid()` against an `admins` table or `users` table `is_admin` flag.
-- For now, let's ensure the Server Actions (using service role typically) can work, 
-- but if we need a client-side policy:

-- (This part depends on your exact auth setup. I will add a generic one for now)
-- READ access for everyone (so product pages can show reviews)
DROP POLICY IF EXISTS "Enable read access for all users" ON reviews;
CREATE POLICY "Enable read access for all users" ON "public"."reviews"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- 3. Allow users to update THEIR OWN reviews? (Optional, maybe not needed yet)
