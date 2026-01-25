/**
 * Helper function to determine if an image should be unoptimized
 * Supabase images and data URIs should be unoptimized
 */
export function shouldUnoptimizeImage(imageUrl: string | undefined | null): boolean {
  if (!imageUrl) return true
  return imageUrl.startsWith('data:') || imageUrl.includes('supabase.co')
}

/**
 * Get image src with fallback
 */
export function getImageSrc(imageUrl: string | undefined | null, fallback?: string): string {
  if (!imageUrl) return fallback || '/placeholder-image.png'
  return imageUrl
}
