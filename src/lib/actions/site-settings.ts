'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServerUser } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Get hero image settings from database
 */
export async function getHeroImage(): Promise<{ url: string | null; altText: string | null }> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('hero_image_url, alt_text')
      .eq('setting_key', 'hero_image')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { url: null, altText: null }
      }
      console.error('Error fetching hero image:', error)
      return { url: null, altText: null }
    }

    return {
      url: data?.hero_image_url || null,
      altText: data?.alt_text || null
    }
  } catch (error: any) {
    console.error('Error in getHeroImage:', error)
    return { url: null, altText: null }
  }
}

/**
 * Update hero image URL and Alt Text (admin only)
 */
export async function updateHeroImage(imageUrl: string, altText: string = ''): Promise<{ success: boolean; error?: string }> {
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

    // Use upsert to insert or update
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'hero_image',
        hero_image_url: imageUrl,
        alt_text: altText,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })

    if (error) {
      console.error('Error updating hero image:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateHeroImage:', error)
    return { success: false, error: error.message || 'Failed to update hero image' }
  }
}

/**
 * Upload image file to Supabase Storage and return public URL
 */
export async function uploadHeroImageToStorage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await getServerUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const isAdmin = await verifyAdmin(user.id)
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only image files are allowed' }
    }

    const supabase = createAdminClient()

    // Use the EXACT filename provided by the frontend for SEO
    // The frontend constructs this as "centurionshoppe-[keyword]-[branding]-hero-banner.jpg"
    const fileName = file.name
    const filePath = `hero/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Allow overwriting if the name is identical (user intent)
        cacheControl: '31536000'
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      // Provide helpful error message for missing bucket
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return {
          success: false,
          error: 'Storage bucket "images" not found. Please create it in Supabase Storage, or use URL mode instead.'
        }
      }
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error in uploadHeroImageToStorage:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

/**
 * Get showcase card image URL from database
 */
/**
 * Get showcase card settings from database
 */
export async function getShowcaseCardImage(): Promise<{ url: string | null; altText: string | null; title: string | null; subtitle: string | null }> {
  try {
    const supabase = createAdminClient()

    // Fetch all related settings in parallel
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, hero_image_url, alt_text')
      .in('setting_key', ['showcase_card_image', 'showcase_card_title', 'showcase_card_subtitle'])

    if (error) {
      console.error('Error fetching showcase card settings:', error)
      return { url: null, altText: null, title: null, subtitle: null }
    }

    const imageSetting = data.find(s => s.setting_key === 'showcase_card_image')
    const titleSetting = data.find(s => s.setting_key === 'showcase_card_title')
    const subtitleSetting = data.find(s => s.setting_key === 'showcase_card_subtitle')

    return {
      url: imageSetting?.hero_image_url || null,
      altText: imageSetting?.alt_text || null,
      title: titleSetting?.hero_image_url || null, // Storing text in hero_image_url column
      subtitle: subtitleSetting?.hero_image_url || null
    }
  } catch (error: any) {
    console.error('Error in getShowcaseCardImage:', error)
    return { url: null, altText: null, title: null, subtitle: null }
  }
}

/**
 * Update showcase card settings (admin only)
 */
export async function updateShowcaseCardImage(
  imageUrl: string,
  altText: string = '',
  title: string = '',
  subtitle: string = ''
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
    const updatedAt = new Date().toISOString()

    // Upsert all settings
    const updates = [
      {
        setting_key: 'showcase_card_image',
        hero_image_url: imageUrl,
        alt_text: altText,
        updated_at: updatedAt
      },
      {
        setting_key: 'showcase_card_title',
        hero_image_url: title, // Storing title in image_url column
        alt_text: null,
        updated_at: updatedAt
      },
      {
        setting_key: 'showcase_card_subtitle',
        hero_image_url: subtitle, // Storing subtitle in image_url column
        alt_text: null,
        updated_at: updatedAt
      }
    ]

    const { error } = await supabase
      .from('site_settings')
      .upsert(updates, { onConflict: 'setting_key' })

    if (error) {
      console.error('Error updating showcase card settings:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateShowcaseCardImage:', error)
    return { success: false, error: error.message || 'Failed to update showcase card settings' }
  }
}

/**
 * Upload showcase card image file to Supabase Storage
 */
export async function uploadShowcaseCardImageToStorage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
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

    // Use the EXACT filename provided by the frontend for SEO
    const fileName = file.name
    const filePath = `showcase/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Allow overwriting for SEO filenames
        cacheControl: '31536000'
      })

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError)
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return {
          success: false,
          error: 'Storage bucket "images" not found. Please create it in Supabase Storage, or use URL mode instead.'
        }
      }
      return { success: false, error: uploadError.message || 'Failed to upload image' }
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error in uploadShowcaseCardImageToStorage:', error)
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

/**
 * Get homepage carousel product images from database
 */
export async function getHomepageCarouselProducts(): Promise<Array<{ id: number; name: string; location: string; image: string }> | null> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('site_settings')
      .select('hero_image_url')
      .eq('setting_key', 'homepage_carousel_products')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching carousel products:', error)
      return null
    }

    if (data?.hero_image_url) {
      try {
        return JSON.parse(data.hero_image_url)
      } catch {
        return null
      }
    }

    return null
  } catch (error: any) {
    console.error('Error in getHomepageCarouselProducts:', error)
    return null
  }
}

/**
 * Update homepage carousel product images (admin only)
 */
export async function updateHomepageCarouselProducts(products: Array<{ id: number; name: string; location: string; image: string }>): Promise<{ success: boolean; error?: string }> {
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
      .from('site_settings')
      .upsert({
        setting_key: 'homepage_carousel_products',
        hero_image_url: JSON.stringify(products),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })

    if (error) {
      console.error('Error updating carousel products:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Error in updateHomepageCarouselProducts:', error)
    return { success: false, error: error.message || 'Failed to update carousel products' }
  }
}
