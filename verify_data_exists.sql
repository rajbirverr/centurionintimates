-- ============================================
-- VERIFY DATA EXISTS
-- Run this to check if your categories are actually in the database
-- ============================================

SELECT 
  (SELECT COUNT(*) FROM public.categories) as category_count,
  (SELECT COUNT(*) FROM public.category_subcategories) as subcategory_count,
  (SELECT COUNT(*) FROM public.products) as product_count;

-- If you see "0" for any of these, the data population step failed or wasn't run.
