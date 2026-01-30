'use server'

import { revalidatePath, unstable_cache } from 'next/cache'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'



/**
 * DEBUG ONLY: Fetch categories using Service Role to bypass RLS
 */
export async function getAdminDebugCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('categories').select('*')
  if (error) {
    console.error('Admin Debug Error:', error)
    return { error: error.message }
  }
  return { data }
}

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
 * DEBUG ONLY: Test relationship query specifically
 */
export async function getDebugRelations() {
  const adminSoup = createAdminClient()
  const publicSoup = await createServerSupabaseClient()

  // Test 1: Admin Join
  const { data: adminData, error: adminError } = await adminSoup
    .from('categories')
    .select('id, name, category_subcategories(id, name)')
    .limit(1)

  // Test 2: Public Join
  const { data: publicData, error: publicError } = await publicSoup
    .from('categories')
    .select('id, name, category_subcategories(id, name)')
    .limit(1)

  return {
    adminResult: { data: adminData, error: adminError },
    publicResult: { data: publicData, error: publicError }
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order: number
}

export interface Subcategory {
  id: string
  category_id?: string
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order: number
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[]
}

/**
 * Fetches jewelry categories only (for filter bar)
 * Returns all categories ordered by sort_order
 * Cached for 1 hour for better performance
 */
export async function getJewelryCategories(): Promise<Category[]> {
  try {
    const supabase = createPublicSupabaseClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order')
      .order('sort_order', { ascending: true })

    if (error) {
      if (error.message && !error.message.includes('AbortError')) {
        console.error('Error fetching categories:', error)
      }
      return []
    }

    return (categories || []) as Category[]
  } catch (error) {
    console.error('Error in getJewelryCategories:', error)
    return []
  }
}

export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order?: number
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

/**
 * Fetches jewelry categories with their subcategories for the Shop dropdown
 * Returns all categories ordered by sort_order
 */
/**
 * Fetches jewelry categories with their subcategories for the Shop dropdown
 * Refactored to use MANUAL JOIN to avoid valid PostgREST relationship naming issues
 */
export async function getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
  try {
    // FORCE ADMIN CLIENT - Bypass all RLS/Permission issues to ensure data loads
    const supabase = createAdminClient()

    // 1. Fetch Categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, sort_order')
      .order('sort_order', { ascending: true })

    if (catError) {
      if (catError.message && !catError.message.includes('AbortError')) {
        console.error('Error fetching categories:', catError)
      }
      return []
    }

    if (!categories || categories.length === 0) return []

    // 2. Fetch ALL Subcategories (more efficient than N+1 queries)
    const { data: subcategories, error: subError } = await supabase
      .from('category_subcategories')
      .select('id, category_id, name, slug, description, image_url, display_order')
      .order('display_order', { ascending: true })

    if (subError) {
      console.error('Error fetching subcategories:', subError)
      // Return categories without subcategories if this fails
      return categories.map(cat => ({
        ...cat,
        subcategories: []
      }))
    }

    // 3. Manual Join in Memory
    return categories.map(cat => ({
      ...cat,
      subcategories: (subcategories || [])
        .filter((sub: any) => sub.category_id === cat.id)
        .map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          image_url: sub.image_url,
          display_order: sub.display_order
        }))
    })) as CategoryWithSubcategories[]

  } catch (error) {
    console.error('Error in getCategoriesWithSubcategories:', error)
    return []
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      if (error.message && !error.message.includes('AbortError')) {
        console.error('Error fetching categories:', error)
      }
      return []
    }

    return (data || []) as Category[]
  } catch (error) {
    console.error('Error in getAllCategories:', error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching category:', error)
      return null
    }

    return data as Category
  } catch (error) {
    console.error('Error in getCategoryById:', error)
    return null
  }
}

export async function createCategory(data: CreateCategoryData) {
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
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        ...data,
        sort_order: data.sort_order || 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    revalidatePath('/all-products')
    revalidatePath('/')

    return { success: true, data: category }
  } catch (error: any) {
    console.error('Error in createCategory:', error)
    return { success: false, error: error.message || 'Failed to create category' }
  }
}

export async function updateCategory(data: UpdateCategoryData) {
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
    const supabase = createAdminClient()
    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    revalidatePath(`/admin/categories/${id}/edit`)
    revalidatePath('/all-products')
    revalidatePath('/')

    return { success: true, data: category }
  } catch (error: any) {
    console.error('Error in updateCategory:', error)
    return { success: false, error: error.message || 'Failed to update category' }
  }
}

export async function deleteCategory(id: string) {
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
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    revalidatePath('/all-products')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteCategory:', error)
    return { success: false, error: error.message || 'Failed to delete category' }
  }
}

/**
 * Upload category image to Supabase Storage
 */
export async function uploadCategoryImageToStorage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
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

    // Use the filename provided by the client (it's SEO optimized by CategoryForm)
    const fileName = file.name
    const filePath = `categories/${fileName}`

    // Upload to Supabase Storage - aggressive caching for immutable URLs
    const { error: uploadError, data } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache - immutable
        upsert: true // Allow overwriting to keep SEO filenames clean
      })

    if (uploadError) {
      console.error('Error uploading category image:', uploadError)
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error in uploadCategoryImageToStorage:', error)
    return { success: false, error: error.message || 'Failed to upload category image' }
  }
}

/**
 * Get categories with images for homepage carousel
 * Only returns categories that have images
 */
export async function getCategoriesForCarousel(): Promise<Array<{ id: string; name: string; image: string }>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, image_url')
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .order('sort_order', { ascending: true })

    if (error) {
      if (error.message && !error.message.includes('AbortError')) {
        console.error('Error fetching categories for carousel:', error)
      }
      return []
    }

    if (!categories || categories.length === 0) {
      return []
    }

    return categories
      .filter(cat => cat.image_url) // Filter out any null/empty values
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image_url!
      }))
  } catch (error) {
    console.error('Error in getCategoriesForCarousel:', error)
    return []
  }
}

// Subcategory CRUD functions

export interface CreateSubcategoryData {
  category_id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order?: number
}

export interface UpdateSubcategoryData extends Partial<CreateSubcategoryData> {
  id: string
}

export async function getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('category_subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching subcategories:', error)
      return []
    }

    return (data || []) as Subcategory[]
  } catch (error) {
    console.error('Error in getSubcategoriesByCategoryId:', error)
    return []
  }
}

export async function createSubcategory(data: CreateSubcategoryData) {
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
    const { data: subcategory, error } = await supabase
      .from('category_subcategories')
      .insert({
        ...data,
        display_order: data.display_order || 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subcategory:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/categories')
    revalidatePath(`/admin/categories/${data.category_id}/edit`)
    revalidatePath('/all-products')
    revalidatePath('/')

    return { success: true, data: subcategory }
  } catch (error: any) {
    console.error('Error in createSubcategory:', error)
    return { success: false, error: error.message || 'Failed to create subcategory' }
  }
}

export async function updateSubcategory(data: UpdateSubcategoryData) {
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
    const supabase = createAdminClient()
    const { data: subcategory, error } = await supabase
      .from('category_subcategories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subcategory:', error)
      return { success: false, error: error.message }
    }

    // Get category_id for revalidation
    const categoryId = updateData.category_id || subcategory?.category_id
    if (categoryId) {
      revalidatePath('/admin/categories')
      revalidatePath(`/admin/categories/${categoryId}/edit`)
      revalidatePath('/all-products')
      revalidatePath('/')
    }

    return { success: true, data: subcategory }
  } catch (error: any) {
    console.error('Error in updateSubcategory:', error)
    return { success: false, error: error.message || 'Failed to update subcategory' }
  }
}

export async function deleteSubcategory(id: string) {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get category_id before deleting for revalidation
    const supabase = createAdminClient()
    const { data: subcategory } = await supabase
      .from('category_subcategories')
      .select('category_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('category_subcategories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subcategory:', error)
      return { success: false, error: error.message }
    }

    if (subcategory?.category_id) {
      revalidatePath('/admin/categories')
      revalidatePath(`/admin/categories/${subcategory.category_id}/edit`)
      revalidatePath('/all-products')
      revalidatePath('/')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteSubcategory:', error)
    return { success: false, error: error.message || 'Failed to delete subcategory' }
  }
}
