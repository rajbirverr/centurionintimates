DO $$
DECLARE
  v_category_id UUID;
BEGIN
  -- Get the Sets category ID
  SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sets';

  -- If Sets category exists, update its subcategories
  IF v_category_id IS NOT NULL THEN

    -- 1. Unlink products from the old subcategories to avoid Foreign Key errors
    -- This sets subcategory_id to NULL for any product currently in 'Matching Sets', etc.
    UPDATE public.products
    SET subcategory_id = NULL
    WHERE subcategory_id IN (
        SELECT id FROM public.category_subcategories WHERE category_id = v_category_id
    );
    
    -- 2. Clean up old subcategories
    DELETE FROM public.category_subcategories 
    WHERE category_id = v_category_id;

    -- 3. Insert the NEW subcategories user requested
    INSERT INTO public.category_subcategories (category_id, name, slug, description, display_order)
    VALUES 
      (v_category_id, 'Bra Sets', 'bra-sets', 'Matching bra and panty sets', 10),
      (v_category_id, 'Undies Sets', 'undies-sets', 'Coordinated underwear packs', 20),
      (v_category_id, 'Shop All Sets', 'all-sets', 'View all our matching sets', 30);
      
  END IF;
END $$;
