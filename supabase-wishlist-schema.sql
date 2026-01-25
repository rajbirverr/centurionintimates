-- Wishlist Schema
-- Run this in Supabase SQL Editor

-- 1. Create wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of user_id and product_id
  UNIQUE(user_id, product_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_product ON public.wishlist_items(user_id, product_id);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.wishlist_items;

-- RLS Policies
CREATE POLICY "Users can view their own wishlist items"
  ON public.wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
  ON public.wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON public.wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE public.wishlist_items IS 'Stores user wishlist items';
COMMENT ON COLUMN public.wishlist_items.user_id IS 'Reference to auth.users';
COMMENT ON COLUMN public.wishlist_items.product_id IS 'Reference to products table';
