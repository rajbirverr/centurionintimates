/**
 * Image optimization utilities for Skims-level performance
 */

/**
 * Generate versioned image URL to ensure immutable caching
 * Never overwrite images - always create new versions
 */
export function getVersionedImageUrl(baseUrl: string, version?: string): string {
  if (!baseUrl) return baseUrl

  // If URL already has version/hash, return as-is
  if (baseUrl.includes('?v=') || baseUrl.includes('&v=')) {
    return baseUrl
  }

  // Add version parameter for cache busting when image updates
  const versionParam = version || Date.now().toString(36)
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}v=${versionParam}`
}

/**
 * Get optimized image sizes for responsive images
 * Returns appropriate sizes attribute based on container
 */
export function getImageSizes(container: 'full' | 'half' | 'third' | 'quarter' | 'product-card'): string {
  const sizesMap = {
    'full': '100vw',
    'half': '(max-width: 768px) 100vw, 50vw',
    'third': '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    'quarter': '(max-width: 768px) 50vw, 25vw',
    'product-card': '(max-width: 768px) 50vw, 25vw'
  }
  return sizesMap[container] || '100vw'
}

/**
 * Check if image should use priority loading
 * Use for above-the-fold, hero images, and first product in grid
 */
export function shouldUsePriority(index: number = 0, isHero: boolean = false): boolean {
  return isHero || index < 4 // First 4 images get priority
}

/**
 * Optimize Supabase Storage images by adding transformation parameters
 * Supabase automatically resizes images when width/quality params are present
 * @param url - Original Supabase image URL
 * @param width - Desired width in pixels (default: 800)
 * @param quality - Image quality 1-100 (default: 80)
 * @returns Optimized URL with transformation parameters
 */
export function getOptimizedSupabaseUrl(
  url: string,
  width: number = 800,
  quality: number = 80
): string {
  // Return as-is if not a Supabase URL
  if (!url || !url.includes('supabase.co/storage')) {
    return url
  }

  // Return as-is if already has transformation params
  if (url.includes('width=') || url.includes('quality=')) {
    return url
  }

  // Add transformation parameters
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}width=${width}&quality=${quality}`
}

/**
 * Get optimal image width based on viewport and container type
 * Used with getOptimizedSupabaseUrl for responsive optimization
 */
export function getOptimalImageWidth(container: 'hero' | 'product' | 'category' | 'thumbnail'): number {
  const widthMap = {
    'hero': 1200,      // Full-width hero images
    'product': 800,    // Product cards and showcase
    'category': 600,   // Category images 
    'thumbnail': 400  // Small thumbnails
  }
  return widthMap[container] || 800
}

