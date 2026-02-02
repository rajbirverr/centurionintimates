import { getHeroImageSettings, getHeroImageMobileSettings } from '@/lib/actions/homepage-hero'

export default async function HomepageHeroImage() {
  // Fetch both desktop and mobile images
  const [desktopSettings, mobileSettings] = await Promise.all([
    getHeroImageSettings(),
    getHeroImageMobileSettings()
  ])

  const desktopUrl = desktopSettings.url
  const mobileUrl = mobileSettings.url || desktopSettings.url // Fallback to desktop if no mobile
  const altText = desktopSettings.altText || "Hero Image"
  const mobileAspectRatio = mobileSettings.aspectRatio || '4/5'
  const desktopAspectRatio = '16/9' // Default desktop ratio

  // If no images at all, show placeholder
  if (!desktopUrl && !mobileUrl) {
    return (
      <div className="w-full rounded-t-2xl overflow-hidden">
        <div className="w-full h-[450px] bg-gray-100 animate-pulse" />
      </div>
    )
  }

  // Convert ratio string "4:5" to CSS format "4/5"
  const formatRatio = (ratio: string) => ratio.replace(':', '/')

  return (
    <div className="w-full rounded-t-2xl overflow-hidden">
      {/* Desktop Image */}
      <div
        className="hidden md:block w-full relative"
        style={{ aspectRatio: formatRatio(desktopAspectRatio) }}
      >
        <img
          src={desktopUrl || mobileUrl || ''}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Mobile Image */}
      <div
        className="block md:hidden w-full relative"
        style={{ aspectRatio: formatRatio(mobileAspectRatio) }}
      >
        <img
          src={mobileUrl || desktopUrl || ''}
          alt={altText}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}