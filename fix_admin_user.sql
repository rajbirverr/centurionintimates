-- ============================================
-- FIX ADMIN USER
-- Run this to ensure your user is an admin
-- ============================================

-- 1. Check if your user exists
SELECT id, email, created_at FROM auth.users WHERE email = 'vuppuloori@gmail.com';

-- 2. Grant Admin Role in public.profiles (if not already)
-- Note: The trigger should handle profile creation, but we force update here.
INSERT INTO public.profiles (id, display_name, first_name, role)
SELECT 
    id, 
    'Admin User', 
    'Admin', 
    'admin'
FROM auth.users 
WHERE email = 'vuppuloori@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- 3. Verify the role
SELECT * FROM public.profiles WHERE role = 'admin';

-- NOTE: If you still cannot login, use the "Forgot Password" feature or dashboard to reset password.
-- This script only ensures PERMISSIONS, not Password.
