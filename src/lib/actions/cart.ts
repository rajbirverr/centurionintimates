'use server'

import { revalidatePath } from 'next/cache'
import { getServerUser } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface CartItemDB {
  id: string
  user_id: string
  product_id: string | null
  product_name: string
  product_price: number
  variant: string // Size/color variant
  quantity: number
  product_image: string | null
  created_at: string
  updated_at: string
}

export interface AddCartItemData {
  product_id: string
  product_name: string
  product_price: number
  variant: string // Size/color variant
  quantity: number
  product_image?: string
}

// Get all cart items for logged-in user
export async function getCartItems(): Promise<{ success: boolean; items?: CartItemDB[]; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cart items:', error)
      return { success: false, error: error.message }
    }

    // Deduplicate items by (product_id + variant) - keep the most recent one and sum quantities
    const itemsMap = new Map<string, CartItemDB>()
    const items = (cartItems || []) as CartItemDB[]

    for (const item of items) {
      const key = `${item.product_id}-${item.variant}`
      const existing = itemsMap.get(key)

      if (existing) {
        // Merge duplicates: sum quantities, keep most recent
        const mergedQuantity = existing.quantity + item.quantity
        const mostRecent = new Date(item.updated_at) > new Date(existing.updated_at) ? item : existing

        itemsMap.set(key, {
          ...mostRecent,
          quantity: mergedQuantity
        })
      } else {
        itemsMap.set(key, item)
      }
    }

    // If duplicates were found and merged, update the database
    if (items.length !== itemsMap.size) {
      console.log(`[getCartItems] Found ${items.length - itemsMap.size} duplicate items, merging...`)

      // Delete duplicates and keep only the merged items
      const mergedItems = Array.from(itemsMap.values())
      const duplicateIds = items
        .filter(item => {
          const key = `${item.product_id}-${item.variant}`
          const merged = itemsMap.get(key)
          return merged && merged.id !== item.id
        })
        .map(item => item.id)

      if (duplicateIds.length > 0) {
        // Delete duplicates
        await supabase
          .from('cart_items')
          .delete()
          .in('id', duplicateIds)

        // Update the kept items with merged quantities
        for (const mergedItem of mergedItems) {
          const original = items.find(i => i.id === mergedItem.id)
          if (original && original.quantity !== mergedItem.quantity) {
            await supabase
              .from('cart_items')
              .update({ quantity: mergedItem.quantity })
              .eq('id', mergedItem.id)
          }
        }
      }
    }

    return { success: true, items: Array.from(itemsMap.values()) }
  } catch (error: any) {
    console.error('Error in getCartItems:', error)
    return { success: false, error: error.message || 'Failed to fetch cart items' }
  }
}

// Add or update cart item (upsert based on user_id, product_id, variant)
export async function addCartItem(data: AddCartItemData): Promise<{ success: boolean; item?: CartItemDB; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    // Strategy: Try to insert first. If it fails due to unique constraint, then update.
    // This is more efficient than always checking first, and handles race conditions better.

    // First, try to insert
    const { data: newItem, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: data.product_id,
        product_name: data.product_name,
        product_price: data.product_price,
        variant: data.variant,
        quantity: data.quantity,
        product_image: data.product_image || null
      })
      .select()
      .single()

    if (insertError) {
      // If insert failed due to unique constraint violation, item exists - update it
      if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('unique constraint')) {
        console.log('[addCartItem] Item exists (unique constraint), updating instead...')

        // Fetch existing item to get current quantity
        // Use maybeSingle() to handle case where item might not exist (race condition)
        const { data: existingItem, error: fetchError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', data.product_id)
          .eq('variant', data.variant)
          .maybeSingle()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('[addCartItem] Error fetching existing item for update:', fetchError)
          return { success: false, error: fetchError.message || 'Failed to fetch existing cart item' }
        }

        if (!existingItem) {
          // Item doesn't exist (race condition - was deleted or doesn't exist)
          // Try to insert again
          console.log('[addCartItem] Item not found after unique constraint, trying insert again...')
          const { data: retryItem, error: retryError } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: data.product_id,
              product_name: data.product_name,
              product_price: data.product_price,
              variant: data.variant,
              quantity: data.quantity,
              product_image: data.product_image || null
            })
            .select()
            .single()

          if (retryError) {
            console.error('[addCartItem] Error on retry insert:', retryError)
            return { success: false, error: retryError.message }
          }

          return { success: true, item: retryItem as CartItemDB }
        }

        // Increment quantity - ensure we're using the actual current quantity from DB
        const currentQuantity = Number(existingItem.quantity) || 0
        const quantityToAdd = Number(data.quantity) || 1
        const newQuantity = currentQuantity + quantityToAdd

        console.log('[addCartItem] Updating existing item - Current:', currentQuantity, '+ Adding:', quantityToAdd, '= New:', newQuantity)

        const { data: updatedItem, error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            product_price: data.product_price,
            product_image: data.product_image || existingItem.product_image,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single()

        if (updateError) {
          console.error('[addCartItem] Error updating cart item:', updateError)
          return { success: false, error: updateError.message }
        }

        return { success: true, item: updatedItem as CartItemDB }
      } else {
        // Some other error occurred
        console.error('[addCartItem] Error inserting cart item:', insertError)
        return { success: false, error: insertError.message }
      }
    }

    // Insert succeeded - item was new
    console.log('[addCartItem] New item inserted successfully - Quantity:', newItem.quantity)
    revalidatePath('/cart')
    revalidatePath('/checkout')
    return { success: true, item: newItem as CartItemDB }
  } catch (error: any) {
    console.error('Error in addCartItem:', error)
    return { success: false, error: error.message || 'Failed to add cart item' }
  }
}

// Update cart item quantity
export async function updateCartItem(cartItemId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('cart_items')
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .eq('user_id', user.id) // Ensure user owns this item

    if (error) {
      console.error('Error updating cart item:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/cart')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Error in updateCartItem:', error)
    return { success: false, error: error.message || 'Failed to update cart item' }
  }
}

// Remove cart item
export async function removeCartItem(cartItemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.id) // Ensure user owns this item

    if (error) {
      console.error('Error removing cart item:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/cart')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Error in removeCartItem:', error)
    return { success: false, error: error.message || 'Failed to remove cart item' }
  }
}

// Clear all cart items for user
export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing cart:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/cart')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Error in clearCart:', error)
    return { success: false, error: error.message || 'Failed to clear cart' }
  }
}

