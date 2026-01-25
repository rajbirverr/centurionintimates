import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ProductGridClient from '../all-products/ProductGridClient'
import { RecommendedProducts, Product } from '@/components/allproducts'
import { getFilterConfigs } from '@/lib/actions/filter-config'
import { getJewelryCategories } from '@/lib/actions/categories'
import SaleCategoryFilterBar from '@/components/allproducts/SaleCategoryFilterBar'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'Sale | Centurion - Discounted Premium Jewelry',
  description: 'Shop our sale collection of premium jewelry at discounted prices. Limited time offers on bangles, earrings, necklaces, and more.',
  keywords: 'jewelry sale, discounted jewelry, jewelry deals, sale jewelry, centurion sale',
  openGraph: {
    title: 'Sale | Centurion',
    description: 'Shop our sale collection of premium jewelry at discounted prices.',
    type: 'website',
  },
}

// Keep recommended products for now (can be made dynamic later)
const recommendedProducts: Product[] = []

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const params = await searchParams

  // Get category ID if category slug is provided
  let categoryId: string | null = null
  if (params.category) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', params.category)
      .single()

    if (categoryError) {
      console.error('[SALE PAGE CATEGORY] Error fetching category:', {
        slug: params.category,
        error: categoryError
      })
    }

    if (category && category.id) {
      categoryId = category.id
    }
  }

  // Build query - filter by sale page flag AND category if provided
  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('in_sale_page', true)

  // Filter by category_id if category is provided and found
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  } else if (params.category) {
    // Category slug was provided but not found - return empty results
    query = query.eq('category_id', '00000000-0000-0000-0000-000000000000')
  }

  let productsResult = await query.order('created_at', { ascending: false })
  let products = productsResult.data
  let error = productsResult.error

  // Handle errors gracefully
  if (error) {
    console.error('[SALE PAGE] Error fetching products:', error)
  }

  // Ensure products is always an array
  const safeProducts = products || []

  // Fetch images for products - only if we have products
  let images: Array<{ product_id: string; image_url: string; is_primary: boolean }> = []
  const productIds = safeProducts.map(p => p.id)

  if (productIds.length > 0) {
    const { data: imagesData, error: imagesError } = await supabase
      .from('product_images')
      .select('product_id, image_url, is_primary')
      .in('product_id', productIds)
      .eq('is_primary', true)

    if (imagesError) {
      console.error('[SALE PAGE IMAGES] Error fetching images:', imagesError)
    } else {
      images = imagesData || []
    }
  }

  // Fetch categories for products that have category_id (for filter bar)
  const categoryIds = [...new Set(safeProducts.map(p => p.category_id).filter((id): id is string => Boolean(id)))]
  let categoriesData: Array<{ id: string; name: string; slug: string }> = []

  if (categoryIds.length > 0) {
    const { data, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds)

    if (categoriesError) {
      console.error('[SALE PAGE CATEGORIES] Error fetching categories:', categoriesError)
    } else {
      categoriesData = data || []
    }
  }

  // Fetch all jewelry categories for the filter bar (to show all categories, not just those with sale products)
  const allCategories = await getJewelryCategories()

  // Create a map of category_id to category data for quick lookup
  const categoryMap = new Map(
    categoriesData?.map(cat => [cat.id, cat]) || []
  )

  // Map images and categories to products with discounted prices
  const productsWithImages = safeProducts.map(product => {
    const productImage = images.find(img => img.product_id === product.id)
    const categoryId = product.category_id
    const category = categoryId ? categoryMap.get(categoryId) || null : null

    // Calculate discounted price
    const originalPrice = product.price ? Number(product.price) : 0
    const discountPercent = product.discount_percentage || 0
    const discountedPrice = originalPrice > 0 && discountPercent > 0
      ? Math.round(originalPrice * (1 - discountPercent / 100))
      : originalPrice

    const formattedPrice = isNaN(discountedPrice) || discountedPrice <= 0
      ? '₹0'
      : `₹${discountedPrice.toLocaleString('en-IN')}`

    const originalFormattedPrice = isNaN(originalPrice) || originalPrice <= 0
      ? '₹0'
      : `₹${originalPrice.toLocaleString('en-IN')}`

    // Use placeholder data URI if no image found
    const productImageUrl = productImage?.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkIi8+PC9zdmc+'

    return {
      id: product.id,
      name: product.name || 'Unnamed Product',
      slug: product.slug || '',
      image: productImageUrl,
      price: formattedPrice,
      originalPrice: discountPercent > 0 ? originalFormattedPrice : undefined,
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      colors: [],
      category: category ? {
        id: category.id,
        name: category.name,
        slug: category.slug
      } : null,
      isNew: false,
      isSoldOut: (product.inventory_count || 0) === 0,
      watermark_enabled: (product as any).watermark_enabled !== undefined ? (product as any).watermark_enabled : true,
      watermark_color: (product as any).watermark_color || undefined,
      watermark_font_size: (product as any).watermark_font_size || undefined,
      watermark_position: (product as any).watermark_position || undefined,
      watermark_text: (product as any).watermark_text || undefined,
    }
  }) || []

  // Fetch filter configurations
  const filterConfigsResult = await getFilterConfigs()
  const filterConfigs = filterConfigsResult.success && filterConfigsResult.data ? filterConfigsResult.data : []

  return (
    <div className="app bg-[#fafafa]">
      {/* Sale Category Filter Bar - Positioned below header */}
      <SaleCategoryFilterBar categories={allCategories} />

      <div className="max-w-[1440px] mx-auto px-2 md:px-8 py-1 md:py-2">
        <ProductGridClient
          products={productsWithImages}
          recommendedProducts={recommendedProducts}
          filterConfigs={filterConfigs}
        />
      </div>
    </div>
  )
}
