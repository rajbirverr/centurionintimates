import { Suspense } from 'react'
import HomepageHeroImage from './HomepageHeroImage'

/**
 * Hero section - renders immediately without waiting for data
 * This is the first thing users see, so it should load instantly
 */
export default function HomepageHero() {
  return (
    <section className="mb-16 px-4 md:px-8 lg:px-12 relative" aria-label="Hero Section">
      <div className="max-w-[1440px] mx-auto">
        {/* Full-width image container */}
        <div className="w-full relative">
          {/* Background image - streams in with Suspense */}
          <Suspense fallback={<div className="absolute inset-0 w-full h-full rounded-t-2xl overflow-hidden bg-gray-100 animate-pulse"></div>}>
            <HomepageHeroImage />
          </Suspense>
        </div>

      </div>
    </section>
  )
}