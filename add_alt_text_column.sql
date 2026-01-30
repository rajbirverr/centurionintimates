-- Add alt_text column to site_settings table for SEO optimization
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS alt_text text;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
