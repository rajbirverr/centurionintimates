import { getHeroImageSettings, getHeroImageMobileSettings } from '@/lib/actions/homepage-hero'
import HeroWidgetButton from './HeroWidgetButton'

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
    <div className="w-full rounded-2xl overflow-hidden relative">
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
      {/* Subtle bottom gradient — rhodeskin style (very light) */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Hero Content — Bottom Left, rhodeskin.com style */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end items-start px-6 pb-8 md:px-10 md:pb-12 lg:px-14 lg:pb-14">
        {/* Headline */}
        <h1
          className="text-[#F5EDE3] text-[22px] md:text-[32px] lg:text-[40px] font-bold leading-[1.15] tracking-tight mb-2 md:mb-3"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Skin First. Always.
        </h1>
        <p
          className="text-[#F5EDE3]/70 text-[14px] md:text-[18px] lg:text-[22px] font-light leading-[1.3] tracking-tight mb-2 md:mb-3"
          style={{ fontFamily: 'var(--font-montserrat)' }}
        >
          Better Basics.<br />
          Better Comfort.
        </p>
        <p
          className="text-[#F5EDE3]/50 text-[10px] md:text-[12px] uppercase tracking-[0.3em] font-normal mb-4 md:mb-5"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Pure Cotton Intimates
        </p>

        {/* CTA */}
        <HeroWidgetButton />
      </div>
    </div>
  )
}