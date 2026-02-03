import { getHeroImageSettings, getHeroImageMobileSettings } from '@/lib/actions/homepage-hero'
import Link from 'next/link'

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
      <div className="w-full rounded-2xl overflow-hidden">
        <div className="w-full h-[450px] bg-gray-100 animate-pulse" />
      </div>
    )
  }

  // Convert ratio string "4:5" to CSS format "4/5"
  const formatRatio = (ratio: string) => ratio.replace(':', '/')

  return (
    <div className="w-full rounded-2xl overflow-hidden">
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
      {/* Hero Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end items-start text-left px-6 pb-12 md:px-12 md:pb-16 lg:pb-20">
        {/* Subheading */}
        <span className="text-[#583432] text-[10px] md:text-[12px] uppercase tracking-[0.2em] font-medium mb-3 md:mb-4 drop-shadow-md" style={{ fontFamily: 'var(--font-audiowide)' }}>
          Comfort built on everyday life
        </span>

        {/* Heading */}
        <h1 className="text-[#583432] text-2xl md:text-4xl lg:text-5xl font-normal mb-6 md:mb-8 drop-shadow-md max-w-[900px] leading-none tracking-tight" style={{ fontFamily: 'var(--font-audiowide)' }}>
          Better Basics<br />Better Comfort
        </h1>

        {/* CTA Button */}
        <Link href="/all-products" className="inline-block">
          <button className="group bg-white text-[#5C4D3C] rounded-full px-8 py-2.5 md:px-9 md:py-3 text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-[#FAF9F7] transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl" style={{ fontFamily: 'var(--font-audiowide)' }}>
            Shop
          </button>
        </Link>
      </div>
    </div>
  )
}