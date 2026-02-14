import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import ProductGridClient from './ProductGridClient'
import { RecommendedProducts, WishlistPage, Product } from '@/components/allproducts'
import { getFilterConfigs } from '@/lib/actions/filter-config'
import { getJewelryCategories, getSubcategoriesByCategoryId } from '@/lib/actions/categories'
import { getProductsByCategory, getProductImages, getCategoriesByIds } from '@/lib/actions/products-cached'
import CategoryFilterBar from '@/components/allproducts/CategoryFilterBar'
import SubcategoryGrid from '@/components/allproducts/SubcategoryGrid'


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
  title: 'All Products | Centurion - Premium Jewelry Collection',
  description: 'Browse our complete collection of premium jewelry including bangles, earrings, necklaces, rings, and more. Discover handcrafted pieces that are playful, pretty, and totally extra.',
  keywords: 'jewelry, bangles, earrings, necklaces, rings, bracelets, anklets, premium jewelry, centurion',
  openGraph: {
    title: 'All Products | Centurion',
    description: 'Browse our complete collection of premium jewelry.',
    type: 'website',
  },
}

// Keep recommended products for now (can be made dynamic later)
const recommendedProducts: Product[] = [
  {
    id: 101,
    name: "COTTON JERSEY T-SHIRT",
    price: "₹4,500",
    image: "https://m.media-amazon.com/images/I/B1pppR4gVKL._CLa%7C2140%2C2000%7C61CgtrEvOKL.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_UY1000_.png",
    colors: [
      { name: "Black", code: "#000000" },
      { name: "Sienna", code: "#b5846b" },
      { name: "Sand", code: "#e4d2d0" }
    ]
  },
  // Add more recommended products as needed
]

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string; search?: string }>
}) {
  // AWAIT searchParams in Next.js 15+
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

  // Parallelize all independent queries
  const [
    categoryResult,
    categoriesResult,
    filterConfigsResult
  ] = await Promise.all([
    // Get category if category slug is provided (cached)
    params.category ? getCategoryBySlug(params.category).catch(() => ({ data: null, error: null })) : Promise.resolve({ data: null, error: null }),

    // Fetch jewelry categories for filter bar (already cached in getJewelryCategories)
    getJewelryCategories(),

    // Fetch filter configurations (already cached in getFilterConfigs)
    getFilterConfigs()
  ])

  // Extract category data
  let categoryId: string | null = null
  let categoryName: string | null = null
  let categorySlug: string | null = null

  if (categoryResult.data && !categoryResult.error) {
    categoryId = categoryResult.data.id
    categoryName = categoryResult.data.name
    categorySlug = categoryResult.data.slug
  }

  // Fetch subcategories and subcategory ID in parallel if category is selected
  let subcategories: Array<{
    id: string
    name: string
    slug: string
    description?: string
    image_url?: string
    display_order: number
  }> = []
  let subcategoryId: string | null = null

  // Cache subcategory lookup
  const getSubcategoryBySlug = unstable_cache(
    async (categoryId: string, slug: string) => {
      const supabase = createPublicSupabaseClient()
      const { data } = await supabase
        .from('category_subcategories')
        .select('id')
        .eq('category_id', categoryId)
        .eq('slug', slug)
        .single()
      return data
    },
    [`subcategory-${categoryId}-${params.subcategory || 'none'}`],
    { revalidate: 3600, tags: ['subcategories'] }
  )

  if (categoryId) {
    const [subcategoriesData, subcategoryResult] = await Promise.all([
      getSubcategoriesByCategoryId(categoryId), // Already cached
      params.subcategory ? getSubcategoryBySlug(categoryId, params.subcategory).catch(() => null) : Promise.resolve(null)
    ])

    subcategories = subcategoriesData
    subcategoryId = subcategoryResult?.id || null
  }

  // Use cached product fetching
  const safeProducts = await getProductsByCategory(
    categoryId,
    subcategoryId,
    params.search || null
  )

  // Fetch images and categories in parallel using cached functions (only if we have products)
  const productIds = safeProducts.map(p => p.id)
  const categoryIds = [...new Set(safeProducts.map(p => p.category_id).filter((id): id is string => Boolean(id)))]

  const [images, categoriesData] = await Promise.all([
    productIds.length > 0 ? getProductImages(productIds) : Promise.resolve([]),
    categoryIds.length > 0 ? getCategoriesByIds(categoryIds) : Promise.resolve([])
  ])

  // Create a map of category_id to category data for quick lookup
  const categoryMap = new Map(
    categoriesData?.map(cat => [cat.id, cat]) || []
  )

  // Map images and categories to products
  const productsWithImages = safeProducts.map(product => {
    const productImage = images.find(img => img.product_id === product.id)
    const categoryId = product.category_id
    const category = categoryId ? categoryMap.get(categoryId) || null : null

    // Validate and format price
    const priceNumber = product.price ? Number(product.price) : 0
    const formattedPrice = isNaN(priceNumber) || priceNumber <= 0
      ? '₹0'
      : `₹${priceNumber.toLocaleString('en-IN')}`

    // Use placeholder if no image found
    const productImageUrl = productImage?.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkIi8+PC9zdmc+'

    return {
      id: product.id,
      name: product.name || 'Unnamed Product',
      slug: product.slug || '',
      image: productImageUrl,
      price: formattedPrice,
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
  })

  const filterConfigs = filterConfigsResult.success && filterConfigsResult.data ? filterConfigsResult.data : []
  const categories = categoriesResult

  return (
    <div className="app bg-[#fafafa]">
      {/* Category Filter Bar - Positioned below header */}
      <CategoryFilterBar categories={categories} />

      {/* Subcategory Grid - Show when category is selected */}
      {categorySlug && categoryName && subcategories.length > 0 && (
        <SubcategoryGrid
          subcategories={subcategories}
          categorySlug={categorySlug}
          categoryName={categoryName}
        />
      )}



      <div className="max-w-[1440px] mx-auto px-2 md:px-8 py-1 md:py-2">
        <ProductGridClient
          products={productsWithImages}
          filterConfigs={filterConfigs}
        />
      </div>
    </div>
  )
}
