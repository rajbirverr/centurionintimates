-- CLEANUP: Remove all demo/placeholder images from products.images
-- and replace them with the REAL image from product_images table.

-- Step 1: Show which products have fake Unsplash demo images
SELECT p.id, p.name, p.images[1] AS current_fake_image,
       pi.image_url AS real_image
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
WHERE p.images[1] LIKE '%unsplash.com%'
   OR p.images[1] LIKE '%picsum.photos%'
   OR p.images[1] LIKE '%placeholder%';

-- Step 2: Fix them — replace fake images with real ones from product_images
UPDATE products p
SET images = ARRAY[pi.image_url]
FROM product_images pi
WHERE pi.product_id = p.id
  AND pi.is_primary = true
  AND (p.images[1] LIKE '%unsplash.com%'
    OR p.images[1] LIKE '%picsum.photos%'
    OR p.images[1] LIKE '%placeholder%');

-- Step 3: For products with fake images but NO entry in product_images, 
-- just clear the images array so they show the default placeholder
UPDATE products
SET images = NULL
WHERE (images[1] LIKE '%unsplash.com%'
    OR images[1] LIKE '%picsum.photos%'
    OR images[1] LIKE '%placeholder%')
  AND id NOT IN (SELECT product_id FROM product_images);
