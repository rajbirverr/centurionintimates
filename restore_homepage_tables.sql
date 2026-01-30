-- ============================================
-- RESTORE HOMEPAGE & FOOTER TABLES
-- Required for Homepage Sets, Footer, and Delivery sections
-- ============================================

-- 1. Homepage Sets Section
CREATE TABLE IF NOT EXISTS public.homepage_sets_section (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Just for you - we have sets',
  button_text text NOT NULL DEFAULT 'SHOP BEST SELLERS',
  button_link text NOT NULL DEFAULT '/all-products',
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT homepage_sets_section_pkey PRIMARY KEY (id)
);

-- 2. Homepage Sets Filters
CREATE TABLE IF NOT EXISTS public.homepage_sets_filters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  label text NOT NULL,
  category_slug text,
  subcategory_slug text,
  link_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_enabled boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT homepage_sets_filters_pkey PRIMARY KEY (id)
);

-- 3. Homepage Delivery Section
CREATE TABLE IF NOT EXISTS public.homepage_delivery_section (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Support crafted for a seamless wedding day',
  button_text text NOT NULL DEFAULT 'SHOP WEDDING',
  button_link text NOT NULL DEFAULT '/all-products',
  shipping_text text NOT NULL DEFAULT 'Free shipping on ₹100 and 30-day hassle-free returns',
  left_image_url text,
  right_image_url text,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT homepage_delivery_section_pkey PRIMARY KEY (id)
);

-- 4. Footer Sections
CREATE TABLE IF NOT EXISTS public.footer_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0 UNIQUE,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT footer_sections_pkey PRIMARY KEY (id)
);

-- 5. Footer Links
CREATE TABLE IF NOT EXISTS public.footer_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT footer_links_pkey PRIMARY KEY (id),
  CONSTRAINT footer_links_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.footer_sections(id)
);

-- 6. Footer Social Media
CREATE TABLE IF NOT EXISTS public.footer_social_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  url text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT footer_social_media_pkey PRIMARY KEY (id)
);

-- 7. Footer Settings
CREATE TABLE IF NOT EXISTS public.footer_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT footer_settings_pkey PRIMARY KEY (id)
);

-- GRANT PERMISSIONS (Fix RLS for these new tables)
ALTER TABLE public.homepage_sets_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sets_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_delivery_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Public Read Sets Section" ON public.homepage_sets_section FOR SELECT USING (true);
CREATE POLICY "Public Read Sets Filters" ON public.homepage_sets_filters FOR SELECT USING (true);
CREATE POLICY "Public Read Delivery" ON public.homepage_delivery_section FOR SELECT USING (true);
CREATE POLICY "Public Read Footer Sections" ON public.footer_sections FOR SELECT USING (true);
CREATE POLICY "Public Read Footer Links" ON public.footer_links FOR SELECT USING (true);
CREATE POLICY "Public Read Social" ON public.footer_social_media FOR SELECT USING (true);
CREATE POLICY "Public Read Footer Settings" ON public.footer_settings FOR SELECT USING (true);

-- Allow Admin Full Access (Service Role bypassing RLS usually handles this, but good to have)
CREATE POLICY "Admin All Sets" ON public.homepage_sets_section FOR ALL USING (auth.role() = 'authenticated'); 
-- Note: Real admin check is more complex, but for now allow auth users (admins) to edit. 
-- Ideally we rely on Service Role for Admin API.
