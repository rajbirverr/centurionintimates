-- ============================================
-- ADD PLACEHOLDER IMAGES
-- Run this to verify the UI with sample images
-- ============================================

-- BRAS
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=800&q=80'
WHERE slug = 'bras';

-- PANTIES
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1596144890908-41595819d7e0?auto=format&fit=crop&w=800&q=80'
WHERE slug = 'panties';

-- LINGERIE
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1576186726580-a816e8b12896?auto=format&fit=crop&w=800&q=80'
WHERE slug = 'lingerie';

-- SLEEPWEAR
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1624772398066-98d9aa70d471?auto=format&fit=crop&w=800&q=80'
WHERE slug = 'sleepwear';

-- SHAPEWEAR
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1616186173038-f860e3745217?auto=format&fit=crop&w=800&q=80'
WHERE slug = 'shapewear';

-- ACCESSORIES
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&w=800&q=80'
WHERE slug = 'accessories';

-- NOTE: Subcategories will still show placeholders in NavBar, which is fine.
-- This script primarily fixes the Homepage Carousel which requires images to show anything.
