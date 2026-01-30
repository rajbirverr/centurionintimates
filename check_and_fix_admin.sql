-- 1. Check current status
SELECT 
    u.email, 
    p.role AS profile_role, 
    p.first_name, 
    p.last_name,
    u.id AS user_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'vuppuloori@gmail.com';

-- 2. If the role is NOT 'admin', run this to fix it:
/*
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'vuppuloori@gmail.com');
*/
