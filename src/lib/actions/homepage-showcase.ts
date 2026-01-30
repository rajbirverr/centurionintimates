'use server'

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShineCarouselProduct } from './homepage'

/**
 * Get showcase card image URL (cached)
 */
/**
 * Get showcase card settings (cached)
 */
export const getShowcaseCardSettings = unstable_cache(
  async (): Promise<{ url: string | null; altText: string | null; title: string | null; subtitle: string | null }> => {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, hero_image_url, alt_text')
        .in('setting_key', ['showcase_card_image', 'showcase_card_title', 'showcase_card_subtitle'])

      const imageSetting = data?.find(s => s.setting_key === 'showcase_card_image')
      const titleSetting = data?.find(s => s.setting_key === 'showcase_card_title')
      const subtitleSetting = data?.find(s => s.setting_key === 'showcase_card_subtitle')

      return {
        url: imageSetting?.hero_image_url || null,
        altText: imageSetting?.alt_text || null,
        title: titleSetting?.hero_image_url || null,
        subtitle: subtitleSetting?.hero_image_url || null
      }
    } catch (error) {
      console.error('Error fetching showcase card image:', error)
      return { url: null, altText: null, title: null, subtitle: null }
    }
  },
  ['showcase-card-settings'], // Updated cache key
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'site-settings']
  }
)

/**
 * Get shine carousel products (cached)
 */
export const getShineCarouselProducts = unstable_cache(
  async (): Promise<ShineCarouselProduct[]> => {
    try {
      const supabase = createAdminClient()

      // Get products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, category_id')
        .eq('in_shine_carousel', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!products || products.length === 0) return []

      // Get images in parallel
      const productIds = products.map(p => p.id)
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url, is_primary')
        .in('product_id', productIds)
        .eq('is_primary', true)

      // Get categories
      const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))]
      const { data: categories } = categoryIds.length > 0 ? await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds) : { data: [] }

      return products.map(product => {
        const productImage = images?.find(img => img.product_id === product.id)
        const category = categories?.find(cat => cat.id === product.category_id)

        return {
          id: product.id,
          name: product.name,
          location: category?.name || '',
          image: productImage?.image_url || ''
        }
      })
    } catch (error) {
      console.error('Error fetching shine carousel products:', error)
      return []
    }
  },
  ['shine-carousel-products'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage', 'products']
  }
)
