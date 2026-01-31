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
