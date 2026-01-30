DO $$
DECLARE
  v_category_id UUID;
BEGIN
  -- Insert Sets Category
  INSERT INTO public.categories (name, slug, description, image_url, sort_order)
  VALUES (
    'Sets', 
    'sets', 
    'Curated matching sets for every mood',
    '/sets-background.jpg',
    5  -- Place it at the top or near top (Bras is 10)
  )
  ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description
  RETURNING id INTO v_category_id;

  -- Insert Subcategory
  INSERT INTO public.category_subcategories (category_id, name, slug, description, display_order)
  VALUES 
    (v_category_id, 'Shop All Sets', 'all-sets', 'View all matching sets', 10),
    (v_category_id, 'Matching Sets', 'matching-sets', 'Perfectly coordinated top and bottom', 20),
    (v_category_id, 'Curated Combos', 'curated-combos', 'Hand-picked combinations', 30)
  ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name;

END $$;
