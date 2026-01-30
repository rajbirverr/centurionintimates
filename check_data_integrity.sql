-- ============================================
-- CHECK DATA INTEGRITY
-- Run this to see if Subcategories are actually linked to Categories
-- ============================================

-- 1. Count valid joins
SELECT count(*) as valid_links_count
FROM public.categories c
JOIN public.category_subcategories s ON c.id = s.category_id;

-- 2. Show me some orphans (Subcategories with no parent)
SELECT s.name as orphan_subcategory, s.category_id 
FROM public.category_subcategories s
LEFT JOIN public.categories c ON s.category_id = c.id
WHERE c.id IS NULL;

-- 3. Show me Categories with no children
SELECT c.name as childless_category
FROM public.categories c
LEFT JOIN public.category_subcategories s ON c.id = s.category_id
WHERE s.id IS NULL;
