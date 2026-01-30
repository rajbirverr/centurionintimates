import { getHeroImageSettings } from '@/lib/actions/homepage-hero'
import { getShowcaseCardSettings } from '@/lib/actions/homepage-showcase'

/**
 * Server component that preloads critical images
 * This runs in parallel and doesn't block rendering
 */
export default async function PreloadImages() {
  // Fetch images in parallel (non-blocking)
  const [heroSettings, showcaseSettings] = await Promise.all([
    getHeroImageSettings().catch(() => ({ url: null })),
    getShowcaseCardSettings().catch(() => ({ url: null }))
  ])

  const heroImageUrl = heroSettings?.url
  const showcaseImageUrl = showcaseSettings?.url

  return (
    <>
      {heroImageUrl && (
        <link
          rel="preload"
          as="image"
          href={heroImageUrl}
          fetchPriority="high"
        />
      )}
      {showcaseImageUrl && (
        <link
          rel="preload"
          as="image"
          href={showcaseImageUrl}
          fetchPriority="high"
        />
      )}
    </>
  )
}