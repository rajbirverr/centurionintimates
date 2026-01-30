-- ============================================
-- CATEGORIES & SUBCATEGORIES SETUP
-- ============================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create category_subcategories table
CREATE TABLE IF NOT EXISTS public.category_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- Unique constraint removed to allow same slug in diff categories if needed, but usually good to be unique combined with category
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 3. Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_subcategories ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Categories: Public Read
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT TO public USING (true);

-- Categories: Admin Full Access
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Subcategories: Public Read
DROP POLICY IF EXISTS "Public can view subcategories" ON public.category_subcategories;
CREATE POLICY "Public can view subcategories" ON public.category_subcategories FOR SELECT TO public USING (true);

-- Subcategories: Admin Full Access
DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.category_subcategories;
CREATE POLICY "Admins can manage subcategories" ON public.category_subcategories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 5. Insert Intimate Apparel Categories & Subcategories
-- Helper function to insert if not exists (simplified logic using DO block)

DO $$ 
DECLARE
  v_category_id UUID;
BEGIN
  -- ----------------------------------------------------------------
  -- CATEGORY: BRAS
  -- ----------------------------------------------------------------
  INSERT INTO public.categories (name, slug, sort_order)
  VALUES ('Bras', 'bras', 10)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order)
  VALUES 
    (v_category_id, 'T-Shirt', 't-shirt-bras', 10),
    (v_category_id, 'Push Up', 'push-up-bras', 20),
    (v_category_id, 'Strapless', 'strapless-bras', 30),
    (v_category_id, 'Wireless', 'wireless-bras', 40),
    (v_category_id, 'Sports', 'sports-bras', 50),
    (v_category_id, 'Balconette', 'balconette-bras', 60)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- ----------------------------------------------------------------
  -- CATEGORY: PANTIES
  -- ----------------------------------------------------------------
  INSERT INTO public.categories (name, slug, sort_order)
  VALUES ('Panties', 'panties', 20)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order)
  VALUES 
    (v_category_id, 'Thongs', 'thongs', 10),
    (v_category_id, 'Bikinis', 'bikinis', 20),
    (v_category_id, 'Hipsters', 'hipsters', 30),
    (v_category_id, 'Briefs', 'briefs', 40),
    (v_category_id, 'Boyshorts', 'boyshorts', 50)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- ----------------------------------------------------------------
  -- CATEGORY: LINGERIE
  -- ----------------------------------------------------------------
  INSERT INTO public.categories (name, slug, sort_order)
  VALUES ('Lingerie', 'lingerie', 30)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order)
  VALUES 
    (v_category_id, 'Teddies', 'teddies', 10),
    (v_category_id, 'Babydolls', 'babydolls', 20),
    (v_category_id, 'Corsets', 'corsets', 30),
    (v_category_id, 'Chemises', 'chemises', 40),
    (v_category_id, 'Garter Belts', 'garter-belts', 50)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- ----------------------------------------------------------------
  -- CATEGORY: SLEEPWEAR
  -- ----------------------------------------------------------------
  INSERT INTO public.categories (name, slug, sort_order)
  VALUES ('Sleepwear', 'sleepwear', 40)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order)
  VALUES 
    (v_category_id, 'Pajama Sets', 'pajama-sets', 10),
    (v_category_id, 'Nightgowns', 'nightgowns', 20),
    (v_category_id, 'Robes', 'robes', 30),
    (v_category_id, 'Slippers', 'slippers', 40)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- ----------------------------------------------------------------
  -- CATEGORY: SHAPEWEAR
  -- ----------------------------------------------------------------
  INSERT INTO public.categories (name, slug, sort_order)
  VALUES ('Shapewear', 'shapewear', 50)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order)
  VALUES 
    (v_category_id, 'Bodysuits', 'bodysuits', 10),
    (v_category_id, 'Waist Cinchers', 'waist-cinchers', 20),
    (v_category_id, 'Thigh Slimmers', 'thigh-slimmers', 30)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- ----------------------------------------------------------------
  -- CATEGORY: ACCESSORIES
  -- ----------------------------------------------------------------
  INSERT INTO public.categories (name, slug, sort_order)
  VALUES ('Accessories', 'accessories', 60)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order)
  VALUES 
    (v_category_id, 'Hosiery', 'hosiery', 10),
    (v_category_id, 'Nipple Covers', 'nipple-covers', 20),
    (v_category_id, 'Body Tape', 'body-tape', 30)
  ON CONFLICT (category_id, slug) DO NOTHING;

END $$;
