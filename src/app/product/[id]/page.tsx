import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { getProductBySlug, getProductImagesByProductId, getCategoryById } from '@/lib/actions/product-cached'
import ProductDetailWrapper from '@/components/product/ProductDetailWrapper'
import ReviewsSection from '@/components/reviews/ReviewsSection'
import FrequentlyBoughtCarousel from '@/components/product/FrequentlyBoughtCarousel'

// Note: revalidate is not compatible with cacheComponents
// Caching is handled automatically by cacheComponents and unstable_cache

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductBySlug(id)

  if (!product) {
    return {
      title: 'Product Not Found | Centurion',
    }
  }

  return {
    title: product.seo_title || `${product.name} | Centurion`,
    description: product.seo_description || product.description || '',
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params

  // Fetch product by slug (cached)
  const product = await getProductBySlug(id)

  if (!product) {
    notFound()
  }

  // Fetch product images and category in parallel (both cached)
  const [productImages, category] = await Promise.all([
    getProductImagesByProductId(product.id),
    product.category_id ? getCategoryById(product.category_id) : Promise.resolve(null)
  ])

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading product...</div>}>
        <ProductDetailWrapper
          product={{
            ...product,
            images: productImages,
            price: Number(product.price),
            compare_price: product.compare_price ? Number(product.compare_price) : undefined,
            category: category ? {
              id: category.id,
              name: category.name,
              slug: category.slug
            } : null,
            watermark_enabled: product.watermark_enabled ?? true,
            watermark_color: product.watermark_color || undefined,
            watermark_font_size: product.watermark_font_size || undefined,
            watermark_position: product.watermark_position || undefined,
            watermark_text: product.watermark_text || undefined
          }}
        />
      </Suspense>

      <FrequentlyBoughtCarousel productId={product.id} />

      <ReviewsSection
        productId={product.id}
        productName={product.name}
      />
    </div>
  )
}
