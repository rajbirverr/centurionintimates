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
