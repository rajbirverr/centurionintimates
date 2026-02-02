-- Add setting_value column to site_settings table for storing additional metadata like aspect ratios
-- Run this in Supabase SQL Editor

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS setting_value TEXT;

COMMENT ON COLUMN public.site_settings.setting_value IS 'Generic text field for storing additional setting values (e.g., aspect ratio)';
