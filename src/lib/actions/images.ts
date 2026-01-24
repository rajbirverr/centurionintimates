'use server'

import { revalidatePath } from 'next/cache'
import { getServerUser } from '@/lib/supabase/server'
import { createAdminClient, verifyAdmin } from '@/lib/supabase/admin'

// Upload product image file to Supabase Storage
export async function uploadProductImageToStorage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' }
    }

    const supabase = createAdminClient()
    
    const fileExt = file.name.split('.').pop()
    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return { 
          success: false, 
          error: 'Storage bucket "images" not found. Please create it in Supabase Storage.' 
        }
      }
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error in uploadProductImageToStorage:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text?: string
  sort_order: number
  is_primary: boolean
  created_at: string
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching product images:', error)
      return []
    }

    return (data || []) as ProductImage[]
  } catch (error) {
    console.error('Error in getProductImages:', error)
    return []
  }
}

export async function uploadProductImage(data: {
  product_id: string
  image_url: string
  alt_text?: string
  sort_order?: number
  is_primary?: boolean
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
    
    // If this is marked as primary, unset other primary images first
    if (data.is_primary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', data.product_id)
        .eq('is_primary', true)
    }

    const { data: image, error } = await supabase
      .from('product_images')
      .insert({
        ...data,
        sort_order: data.sort_order || 0,
        is_primary: data.is_primary || false
      })
      .select()
      .single()

    if (error) {
      console.error('Error uploading product image:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/admin/products/${data.product_id}/edit`)
    revalidatePath(`/product/${data.product_id}`)

    return { success: true, data: image }
  } catch (error: any) {
    console.error('Error in uploadProductImage:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

export async function deleteProductImage(imageId: string, productId: string) {
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
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('Error deleting product image:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/admin/products/${productId}/edit`)
    revalidatePath(`/product/${productId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error in deleteProductImage:', error)
    return { success: false, error: error.message || 'Failed to delete image' }
  }
}

export async function updateProductImageOrder(updates: Array<{ id: string; sort_order: number }>) {
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
    
    for (const update of updates) {
      const { error } = await supabase
        .from('product_images')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id)

      if (error) {
        console.error('Error updating image order:', error)
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateProductImageOrder:', error)
    return { success: false, error: error.message || 'Failed to update image order' }
  }
}

export async function setPrimaryImage(imageId: string, productId: string) {
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
    
    // Unset all primary images first
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    // Set this image as primary
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    if (error) {
      console.error('Error setting primary image:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/admin/products/${productId}/edit`)
    revalidatePath(`/product/${productId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error in setPrimaryImage:', error)
    return { success: false, error: error.message || 'Failed to set primary image' }
  }
}

