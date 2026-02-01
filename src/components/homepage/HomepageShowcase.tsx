import { Suspense } from 'react'
import SafeImage from '@/components/common/SafeImage'
import VisitShopButton from '@/components/homepage/VisitShopButton'
import ShineCarousel from '@/components/homepage/ShineCarousel'
import { getShowcaseCardSettings, getShineCarouselProducts } from '@/lib/actions/homepage-showcase'

async function ShowcaseContent() {
  // Fetch data in parallel
  const [showcaseSettings, shineCarouselProducts] = await Promise.all([
    getShowcaseCardSettings(),
    getShineCarouselProducts()
  ])

  const { url: showcaseCardImageUrl, altText, title, subtitle } = showcaseSettings

  // Preload showcase image for instant reload
  const preloadLinks = showcaseCardImageUrl ? (
    <link
      rel="preload"
      as="image"
      href={showcaseCardImageUrl}
      fetchPriority="high"
    />
  ) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* First Jewelry Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#FAF9F7] group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.06)] transform transition-transform duration-500 hover:scale-[1.01]">
        <div className="aspect-[4/5] relative">
          {showcaseCardImageUrl ? (
            <>
              <SafeImage
                src={showcaseCardImageUrl}
                alt={altText || "Luxury intimate collection"}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                style={{ objectPosition: "center 10%" }}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-10 pointer-events-none w-full">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 leading-tight drop-shadow-md" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  color: '#5C4D3C'
                }}>
                  {title || "Intimate Attire"}
                </h3>
                <p className="text-sm sm:text-base font-normal mb-4 text-[#8B7355]" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                  fontWeight: '400',
                  letterSpacing: '0.01em'
                }}>
                  {subtitle || "Collection"}
                </p>
                <div className="pointer-events-auto">
                  <VisitShopButton />
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Second Jewelry Card with Shine Carousel */}
      <div className="relative overflow-hidden rounded-2xl bg-[#FAF9F7] group shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <div className="aspect-[4/5] relative">
          <ShineCarousel products={shineCarouselProducts} />
        </div>
      </div>
    </div>
  )
}

function ShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl bg-[#FAF9F7] animate-pulse">
          <div className="aspect-[4/5]"></div>
        </div>
      ))}
    </div>
  )
}

export default function HomepageShowcase() {
  return (
    <section className="bg-white pt-4 pb-12 md:pt-6 md:pb-16 px-4 md:px-8 lg:px-12" aria-label="Featured Collections">
      <div className="max-w-[1440px] mx-auto">
        {/* Rhode-Style Header */}
        <div className="text-center mb-10">
          <span className="text-[#8B7355] text-[11px] uppercase tracking-[0.2em] font-medium">Featured Collections</span>
          <h2 className="text-[#3D3229] text-2xl md:text-3xl font-light mt-2" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>Our Exclusive Designs</h2>
        </div>
        <Suspense fallback={<ShowcaseSkeleton />}>
          <ShowcaseContent />
        </Suspense>
      </div>
    </section>
  )
}