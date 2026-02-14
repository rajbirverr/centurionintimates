-- RESTORE BACKUP: Check 'product_images' table if it holds the real URL.
-- This table is separate from the 'products.images' array.

DO $$
DECLARE
    v_product_id UUID;
    v_backup_url TEXT;
BEGIN
    -- 1. Find the product ID
    SELECT id INTO v_product_id FROM products WHERE name ILIKE '%Second Skin Seamless Bandeau%' LIMIT 1;
    
    IF v_product_id IS NULL THEN
        RAISE NOTICE 'Product not found.';
        RETURN;
    END IF;

    RAISE NOTICE 'Product ID: %', v_product_id;

    -- 2. Check for backup URL in product_images table
    -- Using ILIKE to find anything that looks like a storage URL
    SELECT image_url INTO v_backup_url 
    FROM product_images 
    WHERE product_id = v_product_id 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_backup_url IS NOT NULL THEN
        RAISE NOTICE 'FOUND BACKUP URL: %', v_backup_url;
        
        -- restore it!
        UPDATE products 
        SET images = ARRAY[v_backup_url] 
        WHERE id = v_product_id;
        
        RAISE NOTICE 'Restored successfully!';
    ELSE
        RAISE NOTICE 'No backup URL found in product_images table.';
    END IF;

END $$;
