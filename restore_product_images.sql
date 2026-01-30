-- ============================================
-- RESTORE PRODUCT IMAGES TABLE
-- Required for Product Image Management
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policies

-- Public Read Access
CREATE POLICY "Public Read Product Images" 
ON public.product_images FOR SELECT 
USING (true);

-- Admin Full Access
CREATE POLICY "Admin All Product Images" 
ON public.product_images FOR ALL 
USING (auth.role() = 'authenticated');

-- Refresh Schema
NOTIFY pgrst, 'reload schema';
