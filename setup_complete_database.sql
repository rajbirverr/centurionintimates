-- ============================================
-- COMPLETE DATABASE SETUP
-- Run this single script to set up everything
-- ============================================

-- ----------------------------------------------------------------
-- 1. PROFILES (Must be first for RLS policies)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;
CREATE POLICY "Service role can update profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can view profiles" ON public.profiles;
CREATE POLICY "Service role can view profiles" ON public.profiles FOR SELECT USING (true);


-- ----------------------------------------------------------------
-- 2. SITE SETTINGS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_setting_key ON public.site_settings(setting_key);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin write access to site_settings" ON public.site_settings;
CREATE POLICY "Allow admin write access to site_settings" ON public.site_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- ----------------------------------------------------------------
-- 3. CUSTOMER ADDRESSES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own addresses" ON customer_addresses;
CREATE POLICY "Users can view their own addresses" ON customer_addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addresses" ON customer_addresses;
CREATE POLICY "Users can insert their own addresses" ON customer_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON customer_addresses;
CREATE POLICY "Users can update their own addresses" ON customer_addresses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses" ON customer_addresses;
CREATE POLICY "Users can delete their own addresses" ON customer_addresses FOR DELETE USING (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- 4. NEWSLETTER
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view active subscribers" ON newsletter_subscribers;
CREATE POLICY "Anyone can view active subscribers" ON newsletter_subscribers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can view all subscribers" ON newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can view send history" ON newsletter_sends;
CREATE POLICY "Admins can view send history" ON newsletter_sends FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- ----------------------------------------------------------------
-- 5. CATEGORIES (Now safe to create as profiles exists)
-- ----------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS public.category_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_subcategories ENABLE ROW LEVEL SECURITY;

-- Categories Policies
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Subcategories Policies
DROP POLICY IF EXISTS "Public can view subcategories" ON public.category_subcategories;
CREATE POLICY "Public can view subcategories" ON public.category_subcategories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.category_subcategories;
CREATE POLICY "Admins can manage subcategories" ON public.category_subcategories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- ----------------------------------------------------------------
-- 6. PRODUCTS (Depends on Categories)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  images TEXT[], -- Array of image URLs
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.category_subcategories(id),
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO public USING (is_active = true);


-- ----------------------------------------------------------------
-- 7. CART ITEMS (Depends on Products)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  variant TEXT NOT NULL, 
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  product_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;
CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- 8. TRIGGERS & FUNCTIONS
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customer_addresses_updated_at ON public.customer_addresses;
CREATE TRIGGER set_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER set_newsletter_subscribers_updated_at BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER set_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ----------------------------------------------------------------
-- 9. POPULATE DATA (Categories)
-- ----------------------------------------------------------------

DO $$ 
DECLARE
  v_category_id UUID;
BEGIN
  -- BRAS
  INSERT INTO public.categories (name, slug, sort_order) VALUES ('Bras', 'bras', 10)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order) VALUES 
    (v_category_id, 'T-Shirt', 't-shirt-bras', 10),
    (v_category_id, 'Push Up', 'push-up-bras', 20),
    (v_category_id, 'Strapless', 'strapless-bras', 30),
    (v_category_id, 'Wireless', 'wireless-bras', 40),
    (v_category_id, 'Sports', 'sports-bras', 50),
    (v_category_id, 'Balconette', 'balconette-bras', 60)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- PANTIES
  INSERT INTO public.categories (name, slug, sort_order) VALUES ('Panties', 'panties', 20)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order) VALUES 
    (v_category_id, 'Thongs', 'thongs', 10),
    (v_category_id, 'Bikinis', 'bikinis', 20),
    (v_category_id, 'Hipsters', 'hipsters', 30),
    (v_category_id, 'Briefs', 'briefs', 40),
    (v_category_id, 'Boyshorts', 'boyshorts', 50)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- LINGERIE
  INSERT INTO public.categories (name, slug, sort_order) VALUES ('Lingerie', 'lingerie', 30)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order) VALUES 
    (v_category_id, 'Teddies', 'teddies', 10),
    (v_category_id, 'Babydolls', 'babydolls', 20),
    (v_category_id, 'Corsets', 'corsets', 30),
    (v_category_id, 'Chemises', 'chemises', 40),
    (v_category_id, 'Garter Belts', 'garter-belts', 50)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- SLEEPWEAR
  INSERT INTO public.categories (name, slug, sort_order) VALUES ('Sleepwear', 'sleepwear', 40)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order) VALUES 
    (v_category_id, 'Pajama Sets', 'pajama-sets', 10),
    (v_category_id, 'Nightgowns', 'nightgowns', 20),
    (v_category_id, 'Robes', 'robes', 30),
    (v_category_id, 'Slippers', 'slippers', 40)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- SHAPEWEAR
  INSERT INTO public.categories (name, slug, sort_order) VALUES ('Shapewear', 'shapewear', 50)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order) VALUES 
    (v_category_id, 'Bodysuits', 'bodysuits', 10),
    (v_category_id, 'Waist Cinchers', 'waist-cinchers', 20),
    (v_category_id, 'Thigh Slimmers', 'thigh-slimmers', 30)
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- ACCESSORIES
  INSERT INTO public.categories (name, slug, sort_order) VALUES ('Accessories', 'accessories', 60)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_category_id;

  INSERT INTO public.category_subcategories (category_id, name, slug, display_order) VALUES 
    (v_category_id, 'Hosiery', 'hosiery', 10),
    (v_category_id, 'Nipple Covers', 'nipple-covers', 20),
    (v_category_id, 'Body Tape', 'body-tape', 30)
  ON CONFLICT (category_id, slug) DO NOTHING;

END $$;
