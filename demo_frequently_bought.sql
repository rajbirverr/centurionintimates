-- DEMO v7: The "Straight Way" Fix 🛠️
-- This script SPECIFICALLY targets the "Second Skin" product and ensures it has an image.
-- It also re-runs the previous fix for good measure.

DO $$
DECLARE
    -- Variables to hold product data
    v_product_id UUID;
BEGIN
    -- 1. Find the specific product the user is looking at
    SELECT id INTO v_product_id FROM products WHERE name ILIKE '%Second Skin Seamless Bandeau%' LIMIT 1;

    IF v_product_id IS NOT NULL THEN
        RAISE NOTICE 'Found "Second Skin" product. Updating image...';
        -- Update with a nice placeholder
        UPDATE products 
        SET images = ARRAY['https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop'] 
        WHERE id = v_product_id;
    ELSE
        RAISE NOTICE 'Could not find "Second Skin" product. Checking others...';
    END IF;

    -- 2. General cleanup for any product with missing images randomly picked
    UPDATE products 
    SET images = ARRAY['https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop'] 
    WHERE (images IS NULL OR array_length(images, 1) IS NULL) 
    AND id IN (
        SELECT product_id FROM product_associations WHERE type = 'auto'
        UNION
        SELECT associated_product_id FROM product_associations WHERE type = 'auto'
    );

    RAISE NOTICE 'Images updated successfully.';

END $$;
