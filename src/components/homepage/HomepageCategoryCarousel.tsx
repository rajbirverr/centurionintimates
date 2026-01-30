import { Suspense } from 'react'
import CategoryCarousel from '@/components/CategoryCarousel'
import { getCategoryCarouselItems } from '@/lib/actions/homepage-categories'

async function CategoryCarouselContent() {
  const categoryCarouselItems = await getCategoryCarouselItems()
  return <CategoryCarousel categories={categoryCarouselItems} />
}

function CategoryCarouselSkeleton() {
  return (
    <div className="mb-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomepageCategoryCarousel() {
  return (
    <Suspense fallback={<CategoryCarouselSkeleton />}>
      <CategoryCarouselContent />
    </Suspense>
  )
}