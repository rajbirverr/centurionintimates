-- ============================================
-- UPDATE PRODUCTS TABLE
-- Add missing columns for SEO, Watermarking, and Pricing
-- ============================================

--  1. Core Columns (Status, Slug, IDs) - Fixes "status missing" error
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS price numeric,
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

--  2. Pricing & Inventory & Description
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.category_subcategories(id),
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS compare_price numeric,
ADD COLUMN IF NOT EXISTS inventory_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0;

-- 2. SEO Fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS seo_keywords text[];

-- 3. Shipping Info
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight_grams numeric,
ADD COLUMN IF NOT EXISTS dimensions text;

-- 4. Watermark Settings
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS watermark_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS watermark_color text,
ADD COLUMN IF NOT EXISTS watermark_font_size integer,
ADD COLUMN IF NOT EXISTS watermark_position text,
ADD COLUMN IF NOT EXISTS watermark_text text;

-- 5. Carousel & Display Flags
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS in_shine_carousel boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS in_drip_carousel boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS in_category_carousel boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS in_sale_page boolean DEFAULT false;

-- 6. Grant Permissions (just in case they were reset or new columns need specific grants)
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT SELECT ON public.products TO anon; -- Public needs to see products

-- 7. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
