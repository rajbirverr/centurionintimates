-- ============================================
-- RESTORE ADMIN & REMAINING TABLES
-- Required for Admin Dashboard Tabs (Orders, Blogs, Customers, etc.)
-- ============================================

-- 1. ORDERS & CHECKOUT
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number text NOT NULL UNIQUE,
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address_line1 text NOT NULL,
  shipping_address_line2 text,
  shipping_city text NOT NULL,
  shipping_state text NOT NULL,
  shipping_postal_code text NOT NULL,
  shipping_country text NOT NULL DEFAULT 'IN',
  subtotal numeric NOT NULL,
  shipping_cost numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  total numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  tracking_number text,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  courier_name text DEFAULT 'Delhivery',
  billing_address jsonb,
  shipping_address jsonb,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  product_sku text,
  product_image_url text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- 2. BLOGS
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  featured_image text,
  category text DEFAULT 'All',
  author text DEFAULT 'Centurion Edit',
  published_at timestamp with time zone,
  is_featured boolean DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blogs_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.blog_products (
  blog_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_products_pkey PRIMARY KEY (blog_id, product_id),
  CONSTRAINT blog_products_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id),
  CONSTRAINT blog_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- 3. CUSTOMERS & USER DATA
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Home',
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customer_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT customer_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlist_items_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid,
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  variant text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  product_image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- 4. NEWSLETTER
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  name text,
  subscribed_at timestamp with time zone DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  template_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text,
  sent_at timestamp with time zone DEFAULT now(),
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT newsletter_sends_pkey PRIMARY KEY (id)
);

-- 5. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  author_name text NOT NULL,
  age_range text,
  favorite_features text[], 
  helpful_yes integer DEFAULT 0,
  helpful_no integer DEFAULT 0,
  is_verified_purchase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 6. RETURNS & SETTINGS
CREATE TABLE IF NOT EXISTS public.returns_faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT returns_faqs_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.returns_page_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'Centurion Returns',
  hero_subtitle text DEFAULT 'We want you to love your purchase. That is why we offer free shipping on all exchanges and returns for store credit.',
  hero_image_url text,
  step_1_title text DEFAULT 'Start Your Return',
  step_1_desc text DEFAULT 'Click the button below to start your return. You will need your order number and email.',
  step_2_title text DEFAULT 'Get Your Label',
  step_2_desc text DEFAULT 'Follow the steps to select your item and get a prepaid shipping label.',
  step_3_title text DEFAULT 'Pack & Ship',
  step_3_desc text DEFAULT 'Pack your items with the label and drop it off at any courier location.',
  policy_html text DEFAULT '<p>Items must be returned within 30 days of delivery...</p>',
  start_return_url text DEFAULT '#',
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT returns_page_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.filter_config (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  config_type text NOT NULL CHECK (config_type IN ('product_type', 'color', 'price_range', 'size', 'sort_option')),
  name text NOT NULL,
  value text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT filter_config_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  hero_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);


-- ============================================
-- ENABLE RLS & PERMISSIONS
-- ============================================

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filter_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified for Restore)

-- Admin Full Access to Everything
CREATE POLICY "Admin Orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Order Items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Blogs" ON public.blogs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Blog Products" ON public.blog_products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Subscribers" ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Returns" ON public.returns_page_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Site Settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Public Read Access where needed
CREATE POLICY "Public Read Blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Public Read Blog Products" ON public.blog_products FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Returns Settings" ON public.returns_page_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Returns FAQs" ON public.returns_faqs FOR SELECT USING (true);
CREATE POLICY "Public Read Filter Config" ON public.filter_config FOR SELECT USING (true);
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);

-- User Own Data Access
CREATE POLICY "User Own Addresses" ON public.customer_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User Own Wishlist" ON public.wishlist_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User Own Cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User Own Orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

