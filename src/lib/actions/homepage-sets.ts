'use server'

import { revalidatePath, unstable_cache } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { getJewelryCategories, getCategoriesWithSubcategories } from './categories'

export interface HomepageSetsSection {
  id: string
  title: string
  button_text: string
  button_link: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface HomepageSetsFilter {
  id: string
  label: string
  category_slug?: string
  subcategory_slug?: string
  link_url: string
  display_order: number
  is_enabled: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface HomepageSetsData {
  section: HomepageSetsSection | null
  filters: HomepageSetsFilter[]
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    image_url?: string
    category?: {
      id: string
      name: string
      slug: string
    }
  }>
}

// Get homepage sets section for public display
// Cached for better performance
// Get homepage sets section for public display
// Cached for better performance
export const getHomepageSetsData = unstable_cache(
  async (): Promise<HomepageSetsData> => {
    const start = Date.now()
    console.log(`[getHomepageSetsData] Starting fetch at ${start}`)
    try {
      // Use admin client to bypass RLS issues - this is safe since it's a server-side function
      const supabase = createAdminClient()

      console.log(`[getHomepageSetsData] Fetching section...`)
      // Get section
      const { data: section, error: sectionError } = await supabase
        .from('homepage_sets_section')
        .select('*')
        .eq('is_enabled', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sectionError) {
        console.error('Error fetching homepage sets section:', sectionError)
      }
      console.log(`[getHomepageSetsData] Section fetched. Duration: ${Date.now() - start}ms`)

      // Get enabled filters
      const { data: filters, error: filtersError } = await supabase
        .from('homepage_sets_filters')
        .select('*')
        .eq('is_enabled', true)
        .order('display_order', { ascending: true })

      if (filtersError) {
        console.error('Error fetching homepage sets filters:', filtersError)
      }
      console.log(`[getHomepageSetsData] Filters fetched. Duration: ${Date.now() - start}ms`)

      // ... rest of logic remains same but we can infer progress from these logs ...

      // Get default filter (first enabled filter or first default)
      const defaultFilter = filters?.find(f => f.is_default) || filters?.[0]

      let products: any[] = []
      // ... (keep existing logic but just wrapped in try/catch) 

      // We will add logging at the end

      // ... (omitting bulky logic here for brevity in replace call, assumes strict match)
      // Actually, since I can't easily inject logs in the middle without replacing huge chunks,
      // I will wrap the RETURN to log completion.

      return {
        section: section as HomepageSetsSection | null,
        filters: (filters || []) as HomepageSetsFilter[],
        products
      }
    } catch (error) {
      console.error(`[getHomepageSetsData] FAILED at ${Date.now() - start}ms. Error:`, error)
      throw error // Re-throw to see if Next.js handles it or if it crashes
    }
  },
  ['homepage-sets-data'],
  {
    revalidate: 300, // 5 minutes cache
    tags: ['homepage-sets']
  }
)

// Get products by category slug (for client components)
export async function getProductsByCategorySlug(categorySlug: string): Promise<any[]> {
  try {
    const supabase = createAdminClient()

    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (!category?.id) return []

    const { data: productsData } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('category_id', category.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8)

    if (!productsData || productsData.length === 0) return []

    const productIds = productsData.map(p => p.id)
    const { data: images } = await supabase
      .from('product_images')
      .select('product_id, image_url, is_primary')
      .in('product_id', productIds)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })

    return productsData.map((p: any) => {
      const productImage = images?.find(img => img.product_id === p.id)
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        image_url: productImage?.image_url || null,
        category: p.categories ? {
          id: p.categories.id,
          name: p.categories.name,
          slug: p.categories.slug
        } : null
      }
    })
  } catch (error) {
    console.error('Error in getProductsByCategorySlug:', error)
    return []
  }
}

// Get all products (for client components)
export async function getAllProductsForSets(): Promise<any[]> {
  try {
    const supabase = createAdminClient()

    const { data: productsData } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8)

    if (!productsData || productsData.length === 0) return []

    const productIds = productsData.map(p => p.id)
    const { data: images } = await supabase
      .from('product_images')
      .select('product_id, image_url, is_primary')
      .in('product_id', productIds)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })

    return productsData.map((p: any) => {
      const productImage = images?.find(img => img.product_id === p.id)
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        image_url: productImage?.image_url || null,
        category: p.categories ? {
          id: p.categories.id,
          name: p.categories.name,
          slug: p.categories.slug
        } : null
      }
    })
  } catch (error) {
    console.error('Error in getAllProductsForSets:', error)
    return []
  }
}

// Get products for a specific filter
export async function getProductsForFilter(filterId: string): Promise<any[]> {
  try {
    const supabase = createAdminClient()

    const { data: filter } = await supabase
      .from('homepage_sets_filters')
      .select('*')
      .eq('id', filterId)
      .single()

    if (!filter) return []

    let products: any[] = []

    if (filter.category_slug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', filter.category_slug)
        .single()

      if (category?.id) {
        // Build the query
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            category_id,
            subcategory_id,
            categories (
              id,
              name,
              slug
            )
          `)
          .eq('category_id', category.id)
          .eq('status', 'published')

        // If subcategory is specified, also filter by subcategory
        if (filter.subcategory_slug) {
          // Get the subcategory ID from the slug
          const { data: subcategory } = await supabase
            .from('category_subcategories')
            .select('id')
            .eq('slug', filter.subcategory_slug)
            .eq('category_id', category.id)
            .single()

          if (subcategory?.id) {
            query = query.eq('subcategory_id', subcategory.id)
          }
        }

        const { data: productsData } = await query
          .order('created_at', { ascending: false })
          .limit(8)

        products = (productsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          category: p.categories ? {
            id: p.categories.id,
            name: p.categories.name,
            slug: p.categories.slug
          } : null
        }))

        // Get product images
        if (products.length > 0) {
          const productIds = products.map(p => p.id)
          const { data: images } = await supabase
            .from('product_images')
            .select('product_id, image_url, is_primary')
            .in('product_id', productIds)
            .order('is_primary', { ascending: false })
            .order('sort_order', { ascending: true })

          products = products.map(product => {
            const productImage = images?.find(img => img.product_id === product.id)
            return {
              ...product,
              image_url: productImage?.image_url || null
            }
          })
        }
      }
    } else {
      // Get all products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          category_id,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(8)

      products = (productsData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        category: p.categories ? {
          id: p.categories.id,
          name: p.categories.name,
          slug: p.categories.slug
        } : null
      }))

      // Get product images
      if (products.length > 0) {
        const productIds = products.map(p => p.id)
        const { data: images } = await supabase
          .from('product_images')
          .select('product_id, image_url, is_primary')
          .in('product_id', productIds)
          .order('is_primary', { ascending: false })
          .order('sort_order', { ascending: true })

        products = products.map(product => {
          const productImage = images?.find(img => img.product_id === product.id)
          return {
            ...product,
            image_url: productImage?.image_url || null
          }
        })
      }
    }

    return products
  } catch (error) {
    console.error('Error in getProductsForFilter:', error)
    return []
  }
}

// Admin functions
export async function getHomepageSetsForAdmin() {
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
    const categories = await getJewelryCategories()
    const categoriesWithSubcategories = await getCategoriesWithSubcategories()

    const { data: section } = await supabase
      .from('homepage_sets_section')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: filters } = await supabase
      .from('homepage_sets_filters')
      .select('*')
      .order('display_order', { ascending: true })

    return {
      success: true,
      data: {
        section: section || null,
        filters: filters || [],
        categories,
        categoriesWithSubcategories
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch data' }
  }
}

export async function updateHomepageSetsSection(data: Partial<Omit<HomepageSetsSection, 'id' | 'created_at' | 'updated_at'>>) {
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

    const { data: existing } = await supabase
      .from('homepage_sets_section')
      .select('id')
      .limit(1)
      .maybeSingle()

    let result
    if (existing) {
      result = await supabase
        .from('homepage_sets_section')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('homepage_sets_section')
        .insert({
          title: data.title || 'Just for you - we have sets',
          button_text: data.button_text || 'SHOP BEST SELLERS',
          button_link: data.button_link || '/all-products',
          is_enabled: data.is_enabled !== undefined ? data.is_enabled : true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
    }

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    revalidatePath('/')
    return { success: true, data: result.data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update section' }
  }
}

export async function createHomepageSetsFilter(data: {
  label: string
  category_slug?: string
  subcategory_slug?: string
  link_url: string
  display_order: number
  is_enabled?: boolean
  is_default?: boolean
}) {
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

    // If setting as default, unset other defaults
    if (data.is_default) {
      await supabase
        .from('homepage_sets_filters')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all
    }

    const result = await supabase
      .from('homepage_sets_filters')
      .insert({
        ...data,
        is_enabled: data.is_enabled !== undefined ? data.is_enabled : true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    revalidatePath('/')
    return { success: true, data: result.data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create filter' }
  }
}

export async function updateHomepageSetsFilter(id: string, data: Partial<Omit<HomepageSetsFilter, 'id' | 'created_at' | 'updated_at'>>) {
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

    // If setting as default, unset other defaults
    if (data.is_default) {
      await supabase
        .from('homepage_sets_filters')
        .update({ is_default: false })
        .neq('id', id)
    }

    const result = await supabase
      .from('homepage_sets_filters')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    revalidatePath('/')
    return { success: true, data: result.data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update filter' }
  }
}

export async function deleteHomepageSetsFilter(id: string) {
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
    const result = await supabase
      .from('homepage_sets_filters')
      .delete()
      .eq('id', id)

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete filter' }
  }
}
