import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import ProductGridClient from '../all-products/ProductGridClient'
import { RecommendedProducts, Product } from '@/components/allproducts'
import { getFilterConfigs } from '@/lib/actions/filter-config'
import { getJewelryCategories } from '@/lib/actions/categories'
import { getProductImages, getCategoriesByIds } from '@/lib/actions/products-cached'
import SaleCategoryFilterBar from '@/components/allproducts/SaleCategoryFilterBar'

/**
 * Create a public Supabase client for cached queries (no cookies needed)
 */
function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Note: revalidate is not compatible with cacheComponents
// Caching is handled automatically by cacheComponents and unstable_cache

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
  const params = await searchParams

  // Cache category lookup by slug
  const getCategoryBySlug = unstable_cache(
    async (slug: string) => {
      const supabase = createPublicSupabaseClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()
      return { data, error }
    },
    [`category-by-slug-${params.category || 'none'}`],
    { revalidate: 3600, tags: ['categories'] }
  )

  // Get category ID if category slug is provided (cached)
  let categoryId: string | null = null
  if (params.category) {
    const categoryResult = await getCategoryBySlug(params.category).catch(() => ({ data: null, error: null }))
    if (categoryResult.data && categoryResult.data.id) {
      categoryId = categoryResult.data.id
    }
  }

  // Cache sale products query
  const getSaleProducts = unstable_cache(
    async (categoryId: string | null) => {
      const supabase = createPublicSupabaseClient()
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .eq('in_sale_page', true)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      return { data: data || [], error }
    },
    [`sale-products-${categoryId || 'all'}`],
    { revalidate: 300, tags: ['products', 'sale-products'] }
  )

  // Fetch sale products (cached)
  const productsResult = await getSaleProducts(categoryId)
  const safeProducts = productsResult.data || []

  // Fetch images and categories in parallel using cached functions
  const productIds = safeProducts.map(p => p.id)
  const categoryIds = [...new Set(safeProducts.map(p => p.category_id).filter((id): id is string => Boolean(id)))]

  const [imagesData, categoriesData] = await Promise.all([
    productIds.length > 0 ? getProductImages(productIds) : Promise.resolve([]),
    categoryIds.length > 0 ? getCategoriesByIds(categoryIds) : Promise.resolve([])
  ])

  // Convert images to expected format
  const images = imagesData.map((img: any) => ({
    product_id: img.product_id,
    image_url: img.image_url,
    is_primary: img.is_primary
  }))

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
          filterConfigs={filterConfigs}
        />
      </div>
    </div>
  )
}
