import { Suspense } from 'react'
import HomepageHeroImage from './HomepageHeroImage'
import HeroReviewSection from './HeroReviewSection'

/**
 * Hero section - renders immediately without waiting for data
 * This is the first thing users see, so it should load instantly
 */
export default function HomepageHero() {
  return (
    <section className="relative" aria-label="Hero Section">
      {/* Full-width image container with max-width constraint for zoom fix */}
      <div className="w-full relative flex justify-center">
        <div className="w-full max-w-[1440px] relative">
          {/* Background image - streams in with Suspense */}
          <Suspense fallback={<div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-100 animate-pulse"></div>}>
            <HomepageHeroImage />
          </Suspense>
        </div>
      </div>

      {/* Constraints for Review Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        {/* Review Section - Attached to Hero Image */}
        <HeroReviewSection />
      </div>
    </section>
  )
}