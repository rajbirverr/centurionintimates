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
      console.error('Error fetching products:', error)
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
 * Get products for Shine carousel with images
 */
export async function getShineCarouselProducts(): Promise<Array<{ id: string; name: string; location: string; image: string }>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category_id')
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
          image: imageUrl
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
 * Get products for Drip for Days carousel with images
 */
export async function getDripCarouselProducts(): Promise<Array<{ id: number | string; name: string; description: string; image: string; price: number }>> {
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

    // Get primary images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        let imageUrl = '/placeholder-product.png'

        // Get primary image (or first image if no primary)
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

        return {
          id: product.id,
          name: product.name,
          description: product.short_description || product.description || '',
          image: imageUrl,
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

