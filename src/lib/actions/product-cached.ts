'use server'

import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

/**
 * Create a public Supabase client for cached queries (no cookies needed)
 */
function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Cached function to get product by slug
 */
export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient()

      // Check if the string is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)

      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'published')

      if (isUuid) {
        query = query.eq('id', slug)
      } else {
        query = query.eq('slug', slug)
      }

      const { data, error } = await query.single()

      if (error || !data) {
        return null
      }

      return data
    },
    [`product-${slug}`],
    {
      revalidate: 300, // 5 minutes cache
      tags: ['products', `product-${slug}`]
    }
  )()
}

/**
 * Cached function to get product images
 */
export async function getProductImagesByProductId(productId: string) {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient()
      const { data, error } = await supabase
        .from('product_images')
        .select('image_url, alt_text, is_primary, sort_order')
        .eq('product_id', productId)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('[PRODUCT IMAGES] Error:', error)
        return []
      }

      return data?.map(img => img.image_url) || []
    },
    [`product-images-${productId}`],
    {
      revalidate: 3600, // 1 hour cache
      tags: ['product-images', `product-images-${productId}`]
    }
  )()
}

/**
 * Cached function to get category by ID
 */
export async function getCategoryById(categoryId: string) {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', categoryId)
        .single()

      return data
    },
    [`category-${categoryId}`],
    {
      revalidate: 3600, // 1 hour cache
      tags: ['categories', `category-${categoryId}`]
    }
  )()
}
