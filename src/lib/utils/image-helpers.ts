/**
 * Helper function to determine if an image should be unoptimized
 * Next.js Image optimization works with Supabase URLs via remotePatterns
 * Only unoptimize data URIs and external URLs not in remotePatterns
 */
export function shouldUnoptimizeImage(imageUrl: string | undefined | null): boolean {
  // Force unoptimization for all images to ensure consistency and prevent hydration mismatches
  // caused by stale server code optimizing Supabase images while client does not.
  return true
}

/**
 * Get image src with fallback
 */
export function getImageSrc(imageUrl: string | undefined | null, fallback?: string): string {
  if (!imageUrl) return fallback || '/placeholder-image.png'
  return imageUrl
}
