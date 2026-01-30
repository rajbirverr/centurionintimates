'use server'

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'


// Types for homepage data
export interface ShineCarouselProduct {
    id: string
    name: string
    location: string
    image: string
}

export interface DripCarouselProduct {
    id: number | string
    name: string
    description: string
    image: string
    secondaryImage?: string | null
    price: number
}

export interface CategoryCarouselItem {
    id: string
    name: string
    image: string
}

export interface HomepageData {
    heroImageUrl: string | null
    showcaseCardImageUrl: string | null
    shineCarouselProducts: ShineCarouselProduct[]
    dripCarouselProducts: DripCarouselProduct[]
    categoryCarouselItems: CategoryCarouselItem[]
}

/**
 * Fetch all homepage data in parallel (internal function)
 */
async function fetchAllHomepageData(): Promise<HomepageData> {
    const supabase = createAdminClient()

    // Fetch all data in parallel
    const [
        heroImageResult,
        showcaseImageResult,
        shineProductsResult,
        dripProductsResult,
        categoriesResult
    ] = await Promise.all([
        // Hero image
        supabase
            .from('site_settings')
            .select('hero_image_url')
            .eq('setting_key', 'hero_image')
            .single(),

        // Showcase card image
        supabase
            .from('site_settings')
            .select('hero_image_url')
            .eq('setting_key', 'showcase_card_image')
            .single(),

        // Shine carousel products
        supabase
            .from('products')
            .select('id, name, category_id')
            .eq('in_shine_carousel', true)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(5),

        // Drip carousel products
        supabase
            .from('products')
            .select('id, name, short_description, description, price')
            .eq('in_drip_carousel', true)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(5),

        // Categories for carousel
        supabase
            .from('categories')
            .select('id, name, image_url')
            .not('image_url', 'is', null)
            .neq('image_url', '')
            .order('sort_order', { ascending: true })
    ])

    // Process hero and showcase images
    const heroImageUrl = heroImageResult.data?.hero_image_url || null
    const showcaseCardImageUrl = showcaseImageResult.data?.hero_image_url || null

    // Process Shine carousel products with images
    const shineProducts = shineProductsResult.data || []
    const shineCarouselProducts: ShineCarouselProduct[] = await Promise.all(
        shineProducts.map(async (product) => {
            // Get primary image
            let imageUrl = '/placeholder-product.png'

            const { data: primaryImage } = await supabase
                .from('product_images')
                .select('image_url')
                .eq('product_id', product.id)
                .eq('is_primary', true)
                .limit(1)
                .maybeSingle()

            if (primaryImage?.image_url) {
                imageUrl = primaryImage.image_url
            } else {
                const { data: firstImage } = await supabase
                    .from('product_images')
                    .select('image_url')
                    .eq('product_id', product.id)
                    .limit(1)
                    .maybeSingle()

                if (firstImage?.image_url) {
                    imageUrl = firstImage.image_url
                }
            }

            // Get category name
            const { data: category } = await supabase
                .from('categories')
                .select('name')
                .eq('id', product.category_id)
                .maybeSingle()

            return {
                id: product.id,
                name: product.name,
                location: category?.name || 'Jewelry Collection',
                image: imageUrl
            }
        })
    )

    // Process Drip carousel products with images
    const dripProducts = dripProductsResult.data || []
    const dripCarouselProducts: DripCarouselProduct[] = await Promise.all(
        dripProducts.map(async (product) => {
            let imageUrl = '/placeholder-product.png'

            const { data: primaryImage } = await supabase
                .from('product_images')
                .select('image_url')
                .eq('product_id', product.id)
                .eq('is_primary', true)
                .limit(1)
                .maybeSingle()

            if (primaryImage?.image_url) {
                imageUrl = primaryImage.image_url
            } else {
                const { data: firstImage } = await supabase
                    .from('product_images')
                    .select('image_url')
                    .eq('product_id', product.id)
                    .limit(1)
                    .maybeSingle()

                if (firstImage?.image_url) {
                    imageUrl = firstImage.image_url
                }
            }

            return {
                id: product.id,
                name: product.name,
                description: product.short_description || product.description || '',
                image: imageUrl,
                price: product.price
            }
        })
    )

    // Process categories for carousel
    const categories = categoriesResult.data || []
    const categoryCarouselItems: CategoryCarouselItem[] = categories
        .filter(cat => cat.image_url)
        .map(cat => ({
            id: cat.id,
            name: cat.name,
            image: cat.image_url!
        }))

    return {
        heroImageUrl,
        showcaseCardImageUrl,
        shineCarouselProducts,
        dripCarouselProducts,
        categoryCarouselItems
    }
}

/**
 * Get all homepage data with caching (5 minute TTL)
 * This is the main function to call from Server Components
 */
export const getHomepageData = unstable_cache(
    fetchAllHomepageData,
    ['homepage-data'],
    { revalidate: 300, tags: ['homepage'] } // 5 minutes cache
)

/**
 * Revalidate homepage cache (call from admin actions)
 */
export async function revalidateHomepageCache() {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/')
}
