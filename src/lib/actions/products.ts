'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  compare_price?: number
  category_id?: string
  subcategory_id?: string
  inventory_count: number
  status: 'draft' | 'published' | 'archived'
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  weight_grams?: number
  dimensions?: string
  watermark_enabled?: boolean
  watermark_color?: string
  watermark_font_size?: number
  watermark_position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  watermark_text?: string
  in_shine_carousel?: boolean
  in_drip_carousel?: boolean
  in_category_carousel?: boolean
  in_sale_page?: boolean
  discount_percentage?: number
  created_at: string
  updated_at: string
}

export interface CreateProductData {
  sku: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  compare_price?: number
  category_id?: string
  subcategory_id?: string
  inventory_count?: number
  status?: 'draft' | 'published' | 'archived'
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  weight_grams?: number
  dimensions?: string
  watermark_enabled?: boolean
  watermark_color?: string
  watermark_font_size?: number
  watermark_position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  watermark_text?: string
  in_shine_carousel?: boolean
  in_drip_carousel?: boolean
  in_category_carousel?: boolean
  in_sale_page?: boolean
  discount_percentage?: number
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Skip logging harmless AbortErrors from cache restarts
      if (error.message && !error.message.includes('AbortError')) {
        console.error('Error fetching products:', error)
      }
      return []
    }

    return (data || []) as Product[]
  } catch (error) {
    console.error('Error in getAllProducts:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createServerSupabaseClient()

    // Try to select all fields including watermark fields
    // If watermark columns don't exist, Supabase will return null/undefined for those fields
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching product:', error)
      return null
    }

    // Return data - preserve actual database values (don't default watermark_enabled to true if it's explicitly false)
    return {
      ...data,
      watermark_enabled: (data as any).watermark_enabled !== undefined ? (data as any).watermark_enabled : true,
      watermark_color: (data as any).watermark_color || undefined
    } as Product
  } catch (error) {
    console.error('Error in getProductById:', error)
    return null
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      console.error('Error fetching product by slug:', error)
      return null
    }

    return data as Product
  } catch (error) {
    console.error('Error in getProductBySlug:', error)
    return null
  }
}

export async function createProduct(data: CreateProductData) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    // Remove watermark_enabled and watermark_color from insert if columns don't exist yet
    // This prevents errors until migrations are run
    const { watermark_enabled, watermark_color, ...safeInsertData } = data

    const supabase = createAdminClient()
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...safeInsertData,
        inventory_count: safeInsertData.inventory_count || 0,
        status: safeInsertData.status || 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/all-products')
    revalidatePath('/')

    return { success: true, data: product }
  } catch (error: any) {
    console.error('Error in createProduct:', error)
    return { success: false, error: error.message || 'Failed to create product' }
  }
}

export async function updateProduct(data: UpdateProductData) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const { id, ...updateData } = data

    // Note: watermark_enabled and watermark_color are included in updateData
    // They will be included in the update if the columns exist
    // If columns don't exist, Supabase will ignore them or return an error (handled below)
    const safeUpdateData = updateData

    const supabase = createAdminClient()
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...safeUpdateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}/edit`)
    revalidatePath(`/product/${product.slug}`)
    revalidatePath('/all-products')
    revalidatePath('/')

    return { success: true, data: product }
  } catch (error: any) {
    console.error('Error in updateProduct:', error)
    return { success: false, error: error.message || 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/all-products')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteProduct:', error)
    return { success: false, error: error.message || 'Failed to delete product' }
  }
}

/**
 * Update carousel flags for a product
 */
export async function updateProductCarouselFlags(
  productId: string,
  flags: {
    in_shine_carousel?: boolean
    in_drip_carousel?: boolean
    in_category_carousel?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .update({
        ...flags,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (error) {
      console.error('Error updating carousel flags:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateProductCarouselFlags:', error)
    return { success: false, error: error.message || 'Failed to update carousel flags' }
  }
}

/**
 * Update sale page flags for a product
 */
export async function updateProductSalePageFlags(
  productId: string,
  flags: {
    in_sale_page?: boolean
    discount_percentage?: number
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .update({
        ...flags,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (error) {
      console.error('Error updating sale page flags:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    revalidatePath('/sale')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateProductSalePageFlags:', error)
    return { success: false, error: error.message || 'Failed to update sale page flags' }
  }
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string, limit: number = 6): Promise<Array<{
  id: string
  name: string
  slug: string
  price: string
  image: string
  category: string | null
}>> {
  try {
    const supabase = await createServerSupabaseClient()

    if (!query || query.trim().length === 0) {
      return []
    }

    const trimmedQuery = query.trim()

    // First, get the products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, price, category_id')
      .eq('status', 'published')
      .ilike('name', `%${trimmedQuery}%`)
      .limit(limit)

    if (productsError) {
      console.error('Error searching products:', productsError)
      return []
    }

    if (!products || products.length === 0) {
      return []
    }

    const productIds = products.map(p => p.id)
    const categoryIds = [...new Set(products.map(p => p.category_id).filter((id): id is string => Boolean(id)))]

    // Optimized: Fetch images and categories in parallel, but only for the products we found
    const [imagesResult, categoriesResult] = await Promise.all([
      // Get images only for the products we found
      categoryIds.length > 0 ? supabase
        .from('product_images')
        .select('product_id, image_url, is_primary')
        .in('product_id', productIds)
        .eq('is_primary', true) : Promise.resolve({ data: [], error: null }),

      // Get categories only for the products we found
      categoryIds.length > 0 ? supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds) : Promise.resolve({ data: [], error: null })
    ])

    const images = imagesResult.data || []
    const categories = categoriesResult.data || []

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))
    const imageMap = new Map<string, string>()

    // Create image map (product_id -> image_url)
    images.forEach(img => {
      if (!imageMap.has(img.product_id)) {
        imageMap.set(img.product_id, img.image_url)
      }
    })

    // Map products with images and categories
    return products.map((product) => {
      const imageUrl = imageMap.get(product.id) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkIi8+PC9zdmc+'

      const priceNumber = product.price ? Number(product.price) : 0
      const formattedPrice = isNaN(priceNumber) || priceNumber <= 0
        ? '₹0'
        : `₹${priceNumber.toLocaleString('en-IN')}`

      return {
        id: product.id,
        name: product.name || 'Unnamed Product',
        slug: product.slug || '',
        price: formattedPrice,
        image: imageUrl,
        category: product.category_id ? categoryMap.get(product.category_id) || null : null
      }
    })
  } catch (error: any) {
    console.error('Error in searchProducts:', error)
    return []
  }
}

/**
 * Get products for Shine carousel with images
 */
export async function getShineCarouselProducts(): Promise<Array<{ id: string; name: string; location: string; image: string; slug?: string }>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category_id, slug')
      .eq('in_shine_carousel', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching Shine carousel products:', error)
      return []
    }

    if (!products || products.length === 0) {
      console.log('No products found for Shine carousel')
      return []
    }

    console.log(`Found ${products.length} products for Shine carousel:`, products.map(p => p.name))

    // Get primary images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        // Get primary image (or first image if no primary)
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
          // If no primary image, get first image
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
          image: imageUrl,
          slug: product.slug
        }
      })
    )

    return productsWithImages
  } catch (error) {
    console.error('Error in getShineCarouselProducts:', error)
    return []
  }
}

/**
 * Get products for Drip for Days carousel with images (primary and secondary for hover effect)
 */
export async function getDripCarouselProducts(): Promise<Array<{ id: number | string; name: string; description: string; image: string; secondaryImage: string | null; price: number }>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, short_description, description, price')
      .eq('in_drip_carousel', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching Drip carousel products:', error)
      return []
    }

    if (!products || products.length === 0) {
      console.log('No products found for Drip carousel')
      return []
    }

    console.log(`Found ${products.length} products for Drip carousel:`, products.map(p => p.name))

    // Get primary and secondary images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        let imageUrl = '/placeholder-product.png'
        let secondaryImageUrl: string | null = null

        // Get all images for this product, ordered by is_primary (primary first), then sort_order
        const { data: productImages } = await supabase
          .from('product_images')
          .select('image_url, is_primary, sort_order')
          .eq('product_id', product.id)
          .order('is_primary', { ascending: false })
          .order('sort_order', { ascending: true })
          .limit(2)

        if (productImages && productImages.length > 0) {
          imageUrl = productImages[0].image_url
          // Secondary image is the second one if available
          if (productImages.length > 1) {
            secondaryImageUrl = productImages[1].image_url
          }
        }

        return {
          id: product.id,
          name: product.name,
          description: product.short_description || product.description || '',
          image: imageUrl,
          secondaryImage: secondaryImageUrl,
          price: product.price
        }
      })
    )

    return productsWithImages
  } catch (error) {
    console.error('Error in getDripCarouselProducts:', error)
    return []
  }
}

/**
 * Get products for Category carousel with images and category names
 */
export async function getCategoryCarouselProducts(): Promise<Array<{ id: string; name: string; image: string; category_name: string }>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category_id')
      .eq('in_category_carousel', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching Category carousel products:', error)
      return []
    }

    if (!products || products.length === 0) {
      console.log('No products found for Category carousel')
      return []
    }

    console.log(`Found ${products.length} products for Category carousel:`, products.map(p => p.name))

    // Get images and category names for each product
    const productsWithData = await Promise.all(
      products.map(async (product) => {
        // Get primary image (or first image if no primary)
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
        let categoryName = 'JEWELRY'
        if (product.category_id) {
          const { data: category } = await supabase
            .from('categories')
            .select('name')
            .eq('id', product.category_id)
            .maybeSingle()

          if (category?.name) {
            categoryName = category.name.toUpperCase()
          }
        }

        return {
          id: product.id,
          name: product.name,
          image: imageUrl,
          category_name: categoryName
        }
      })
    )

    return productsWithData
  } catch (error) {
    console.error('Error in getCategoryCarouselProducts:', error)
    return []
  }
}

