-- ============================================
-- SEED PRODUCTS
-- Run this to populate the products table
-- ============================================

DO $$ 
DECLARE
  v_bras_id UUID;
  v_panties_id UUID;
  v_lingerie_id UUID;
  v_sleepwear_id UUID;
  
  v_tshirt_bras_id UUID;
  v_thongs_id UUID;
  v_teddies_id UUID;
  v_pajama_sets_id UUID;
BEGIN
  -- 1. Get Category IDs
  SELECT id INTO v_bras_id FROM public.categories WHERE slug = 'bras';
  SELECT id INTO v_panties_id FROM public.categories WHERE slug = 'panties';
  SELECT id INTO v_lingerie_id FROM public.categories WHERE slug = 'lingerie';
  SELECT id INTO v_sleepwear_id FROM public.categories WHERE slug = 'sleepwear';

  -- 2. Get Subcategory IDs (Just a few for demo)
  SELECT id INTO v_tshirt_bras_id FROM public.category_subcategories WHERE slug = 't-shirt-bras';
  SELECT id INTO v_thongs_id FROM public.category_subcategories WHERE slug = 'thongs';
  SELECT id INTO v_teddies_id FROM public.category_subcategories WHERE slug = 'teddies';
  SELECT id INTO v_pajama_sets_id FROM public.category_subcategories WHERE slug = 'pajama-sets';

  -- 3. Insert Products

  -- BRAS
  INSERT INTO public.products (name, slug, description, price, sale_price, images, category_id, subcategory_id, is_active, stock_quantity)
  VALUES 
  (
    'Everyday Comfort T-Shirt Bra', 
    'everyday-comfort-t-shirt-bra', 
    'The perfect T-shirt bra for everyday wear. Soft, seamless, and supportive.', 
    45.00, 
    NULL, 
    ARRAY['https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=800&q=80'], 
    v_bras_id, 
    v_tshirt_bras_id, 
    true, 
    100
  ),
  (
    'Luxe Lace Balconette', 
    'luxe-lace-balconette', 
    'Elegant lace balconette bra with delicate detailing and superior lift.', 
    58.00, 
    NULL, 
    ARRAY['https://images.unsplash.com/photo-1576186726580-a816e8b12896?auto=format&fit=crop&w=800&q=80'], 
    v_bras_id, 
    NULL, 
    true, 
    50
  );

  -- PANTIES
  INSERT INTO public.products (name, slug, description, price, sale_price, images, category_id, subcategory_id, is_active, stock_quantity)
  VALUES 
  (
    'Seamless Silk Thong', 
    'seamless-silk-thong', 
    'Invisible under clothing, this silk thong offers ultimate comfort and luxury.', 
    25.00, 
    18.00, 
    ARRAY['https://images.unsplash.com/photo-1596144890908-41595819d7e0?auto=format&fit=crop&w=800&q=80'], 
    v_panties_id, 
    v_thongs_id, 
    true, 
    200
  ),
  (
    'Onalu Signature Hipster', 
    'onalu-signature-hipster', 
    'Our signature hipster panty tailored for a perfect fit.', 
    22.00, 
    NULL, 
    ARRAY['https://images.unsplash.com/photo-1616186173038-f860e3745217?auto=format&fit=crop&w=800&q=80'], 
    v_panties_id, 
    NULL, 
    true, 
    150
  );

  -- LINGERIE
  INSERT INTO public.products (name, slug, description, price, sale_price, images, category_id, subcategory_id, is_active, stock_quantity)
  VALUES 
  (
    'Midnight Lace Teddy', 
    'midnight-lace-teddy', 
    'A stunning one-piece teddy featuring intricate lace and a plunging neckline.', 
    85.00, 
    NULL, 
    ARRAY['https://images.unsplash.com/photo-1576186726580-a816e8b12896?auto=format&fit=crop&w=800&q=80'], 
    v_lingerie_id, 
    v_teddies_id, 
    true, 
    40
  );

  -- SLEEPWEAR
  INSERT INTO public.products (name, slug, description, price, sale_price, images, category_id, subcategory_id, is_active, stock_quantity)
  VALUES 
  (
    'Silk Satin Pajama Set', 
    'silk-satin-pajama-set', 
    'Luxurious silk satin pajama set for the ultimate night''s sleep.', 
    120.00, 
    99.00, 
    ARRAY['https://images.unsplash.com/photo-1624772398066-98d9aa70d471?auto=format&fit=crop&w=800&q=80'], 
    v_sleepwear_id, 
    v_pajama_sets_id, 
    true, 
    60
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error seeding products: %', SQLERRM;
END $$;
