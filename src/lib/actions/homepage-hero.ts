'use server'

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Get hero image settings (cached)
 */
export const getHeroImageSettings = unstable_cache(
  async (): Promise<{ url: string | null; altText: string | null }> => {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('site_settings')
        .select('hero_image_url, alt_text')
        .eq('setting_key', 'hero_image')
        .single()

      return {
        url: data?.hero_image_url || null,
        altText: data?.alt_text || null
      }
    } catch (error) {
      console.error('Error fetching hero image:', error)
      return { url: null, altText: null }
    }
  },
  ['hero-image-settings'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'site-settings']
  }
)

/**
 * Get mobile hero image settings (cached)
 */
export const getHeroImageMobileSettings = unstable_cache(
  async (): Promise<{ url: string | null; altText: string | null; aspectRatio: string | null }> => {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('site_settings')
        .select('hero_image_url, alt_text, setting_value')
        .eq('setting_key', 'hero_image_mobile')
        .single()

      return {
        url: data?.hero_image_url || null,
        altText: data?.alt_text || null,
        aspectRatio: data?.setting_value || null
      }
    } catch (error) {
      console.error('Error fetching mobile hero image:', error)
      return { url: null, altText: null, aspectRatio: null }
    }
  },
  ['hero-image-mobile-settings'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'site-settings']
  }
)
