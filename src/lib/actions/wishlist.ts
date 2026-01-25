'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Get server user (helper function)
 */
async function getServerUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Get all wishlist items for the current user
 */
export async function getWishlistItems(): Promise<{ success: boolean; items?: Array<{ product_id: string }>; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wishlist items:', error)
      return { success: false, error: error.message }
    }

    return { success: true, items: data || [] }
  } catch (error: any) {
    console.error('Error in getWishlistItems:', error)
    return { success: false, error: error.message || 'Failed to fetch wishlist' }
  }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()
    
    // Try to insert (will fail if already exists due to unique constraint)
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: user.id,
        product_id: productId
      })

    if (error) {
      // If error is due to unique constraint, item already exists - that's okay
      if (error.code === '23505') {
        return { success: true } // Already in wishlist
      }
      console.error('Error adding to wishlist:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in addToWishlist:', error)
    return { success: false, error: error.message || 'Failed to add to wishlist' }
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing from wishlist:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in removeFromWishlist:', error)
    return { success: false, error: error.message || 'Failed to remove from wishlist' }
  }
}

/**
 * Sync localStorage wishlist to database (called when user logs in)
 */
export async function syncWishlistFromLocalStorage(productIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (!productIds || productIds.length === 0) {
      return { success: true } // Nothing to sync
    }

    const supabase = await createServerSupabaseClient()
    
    // Insert all items (ignore duplicates due to unique constraint)
    const items = productIds.map(productId => ({
      user_id: user.id,
      product_id: productId
    }))

    const { error } = await supabase
      .from('wishlist_items')
      .upsert(items, {
        onConflict: 'user_id,product_id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error syncing wishlist:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in syncWishlistFromLocalStorage:', error)
    return { success: false, error: error.message || 'Failed to sync wishlist' }
  }
}
