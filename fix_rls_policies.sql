-- ============================================
-- FIX RLS POLICIES & ADMIN SETUP
-- Run this to ensure your website can actually READ the data
-- ============================================

-- 1. Force Enable RLS (Good practice)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Grant PUBLIC Read Access (Crucial for the shop to work without logging in)
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can view subcategories" ON public.category_subcategories;
CREATE POLICY "Public can view subcategories" ON public.category_subcategories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO public USING (is_active = true);


-- 3. SETUP ADMIN ACCOUNT
-- To make yourself an admin, you need to sign up on the website first.
-- Then, uncomment the line below, replace the email, and run it.

-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id IN (SELECT id FROM auth.users WHERE email = 'your_email@example.com');


-- 4. Verify Policies exist
SELECT tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('categories', 'category_subcategories', 'products');
