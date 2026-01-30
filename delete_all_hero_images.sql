-- ⚠️ WARNING: This will delete ALL images in the "hero" folder of your "images" bucket.
-- usage: Run this in the Supabase SQL Editor.

-- 1. Delete all hero images from Storage
DELETE FROM storage.objects
WHERE bucket_id = 'images'
AND name LIKE 'hero/%';

-- 2. Reset the active Hero Image setting on the website to empty
UPDATE public.site_settings
SET 
    hero_image_url = NULL, 
    alt_text = NULL
WHERE setting_key = 'hero_image';

-- 3. Confirm deletion
SELECT count(*) as remaining_files FROM storage.objects 
WHERE bucket_id = 'images' AND name LIKE 'hero/%';
