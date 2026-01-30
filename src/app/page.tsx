import { Suspense } from 'react'
import { Metadata } from 'next'
import HomepageHero from '@/components/homepage/HomepageHero'
import HomepageShowcase from '@/components/homepage/HomepageShowcase'
import FeaturedDripGrid from '@/components/homepage/FeaturedDripGrid'
import FeaturedSets from "@/components/homepage/FeaturedSets";
import HomepageCategoryCarousel from '@/components/homepage/HomepageCategoryCarousel'
import { getHomepageSetsData } from '@/lib/actions/homepage-sets'

export const metadata: Metadata = {
  title: 'INTIMATE - Premium Intimate Apparel',
  description: 'Intimate makes apparel that\'s playful, pretty, and totally extra — for days when you wanna shine like you mean it.',
};

// Note: revalidate is not compatible with cacheComponents
// Caching is handled automatically by cacheComponents

// Force page rebuild to fix hydration
export default async function HomePage() {
  // Start fetching homepageSetsData but don't await - let it stream in
  // This allows the page to start rendering immediately
  const homepageSetsDataPromise = getHomepageSetsData().catch(err => {
    console.error('Failed to fetch sets data:', err)
    return { section: null, filters: [], products: [] }
  })

  return (
    <main className="App">
      {/* Hero section - renders immediately, image streams in */}
      <HomepageHero />

      {/* Showcase section - streams in with Suspense */}
      <HomepageShowcase />

      {/* Product Grid - streams in with Suspense */}
      <FeaturedDripGrid />

      {/* Homepage Sets Section - streams in with Suspense */}
      <Suspense fallback={<div className="mb-16 h-96 bg-gray-100 animate-pulse"></div>}>
        <HomepageSetsSectionWrapper dataPromise={homepageSetsDataPromise} />
      </Suspense>

      {/* Category Carousel - streams in with Suspense */}
      <HomepageCategoryCarousel />
    </main>
  );
}

// Wrapper component to handle the promise
async function HomepageSetsSectionWrapper({ dataPromise }: { dataPromise: Promise<any> }) {
  try {
    const homepageSetsData = await dataPromise
    return <FeaturedSets initialData={homepageSetsData} />
  } catch (error) {
    console.error('Error in HomepageSetsSectionWrapper:', error)
    return <FeaturedSets initialData={null} />
  }
}
