import { Suspense } from 'react'
import ProductGrid from '@/components/homepage/MobileDripCarousel'
import { getDripCarouselProducts } from '@/lib/actions/homepage-drip'

async function ProductGridContent() {
  const dripCarouselProducts = await getDripCarouselProducts()
  return <ProductGrid products={dripCarouselProducts} />
}

function ProductGridSkeleton() {
  return (
    <div className="mb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[100/127] w-full mb-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FeaturedDripGrid() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductGridContent />
    </Suspense>
  )
}