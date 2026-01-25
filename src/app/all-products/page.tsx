import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ProductGridClient from './ProductGridClient'
import { RecommendedProducts, WishlistPage, Product } from '@/components/allproducts'
import { getFilterConfigs } from '@/lib/actions/filter-config'
import { getJewelryCategories, getSubcategoriesByCategoryId } from '@/lib/actions/categories'
import CategoryFilterBar from '@/components/allproducts/CategoryFilterBar'
import SubcategoryGrid from '@/components/allproducts/SubcategoryGrid'

// Force dynamic rendering to ensure searchParams are read correctly
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour for better performance

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
  const supabase = await createServerSupabaseClient()

  // AWAIT searchParams in Next.js 15+
  const params = await searchParams

  // Get category ID if category slug is provided
  let categoryId: string | null = null
  let categoryName: string | null = null
  let categorySlug: string | null = null
  if (params.category) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', params.category)
      .single()

    if (categoryError) {
      // Log error but continue - will show all products
      console.error('[CATEGORY FILTER] Error fetching category:', {
        slug: params.category,
        error: categoryError
      })
    }

    if (category && category.id) {
      categoryId = category.id
      categoryName = category.name
      categorySlug = category.slug
    }
  }

  // Fetch subcategories if category is selected
  let subcategories: Array<{
    id: string
    name: string
    slug: string
    description?: string
    image_url?: string
    display_order: number
  }> = []
  if (categoryId) {
    subcategories = await getSubcategoriesByCategoryId(categoryId)
  }

  // Get subcategory ID if subcategory slug is provided
  let subcategoryId: string | null = null
  if (params.subcategory && categoryId) {
    const { data: subcategory } = await supabase
      .from('category_subcategories')
      .select('id')
      .eq('category_id', categoryId)
      .eq('slug', params.subcategory)
      .single()

    if (subcategory?.id) {
      subcategoryId = subcategory.id
    }
  }

  // Build query - filter by category_id, subcategory_id, or search query
  // Try to select watermark fields if they exist (graceful fallback)
  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'published')

  // Filter by search query if provided
  if (params.search && params.search.trim().length > 0) {
    query = query.ilike('name', `%${params.search.trim()}%`)
  }
  // Filter by category_id if category is provided and found (and no search query)
  else if (categoryId) {
    // Only show products with this exact category_id (will exclude NULL automatically)
    query = query.eq('category_id', categoryId)

    // Filter by subcategory_id if subcategory is provided
    // Note: Requires products table to have subcategory_id column
    // Run: ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES category_subcategories(id);
    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId)
    }
  } else if (params.category) {
    // Category slug was provided but not found - return empty results by using impossible filter
    // This is better than showing all products when user expects filtered results
    query = query.eq('category_id', '00000000-0000-0000-0000-000000000000')
  }
  // If no category param, show all published products (SHOP ALL)

  let productsResult = await query.order('created_at', { ascending: false })
  let products = productsResult.data
  let error = productsResult.error

  // If error is due to missing watermark columns, try again with select('*')
  if (error && error.message?.includes('watermark')) {
    console.warn('[PRODUCT QUERY] Watermark columns not found, retrying with select(*)')
    const retryQuery = supabase
      .from('products')
      .select('*')
      .eq('status', 'published')

    if (categoryId) {
      retryQuery.eq('category_id', categoryId)
      if (subcategoryId) {
        retryQuery.eq('subcategory_id', subcategoryId)
      }
    } else if (params.category) {
      retryQuery.eq('category_id', '00000000-0000-0000-0000-000000000000')
    }

    const retryResult = await retryQuery.order('created_at', { ascending: false })
    products = retryResult.data
    error = retryResult.error
  }

  // Handle errors gracefully
  if (error) {
    console.error('[PRODUCT QUERY] Error fetching products:', error)
    // Return empty array on error to prevent crash
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
      console.error('[PRODUCT IMAGES] Error fetching images:', imagesError)
    } else {
      images = imagesData || []
    }
  }

  // Fetch categories for products that have category_id
  const categoryIds = [...new Set(safeProducts.map(p => p.category_id).filter((id): id is string => Boolean(id)))]
  let categoriesData: Array<{ id: string; name: string; slug: string }> = []

  if (categoryIds.length > 0) {
    const { data, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds)

    if (categoriesError) {
      console.error('[CATEGORIES] Error fetching categories:', categoriesError)
    } else {
      categoriesData = data || []
    }
  }

  // Create a map of category_id to category data for quick lookup
  const categoryMap = new Map(
    categoriesData?.map(cat => [cat.id, cat]) || []
  )

  // Map images and categories to products with proper error handling
  const productsWithImages = safeProducts.map(product => {
    const productImage = images.find(img => img.product_id === product.id)
    const categoryId = product.category_id
    const category = categoryId ? categoryMap.get(categoryId) || null : null

    // Validate and format price
    const priceNumber = product.price ? Number(product.price) : 0
    const formattedPrice = isNaN(priceNumber) || priceNumber <= 0
      ? '₹0'
      : `₹${priceNumber.toLocaleString('en-IN')}`

    // Use placeholder data URI if no image found (1x1 transparent pixel)
    // This prevents broken image icons while maintaining layout
    const productImageUrl = productImage?.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkIi8+PC9zdmc+'

    return {
      id: product.id,
      name: product.name || 'Unnamed Product',
      slug: product.slug || '',
      image: productImageUrl,
      price: formattedPrice,
      colors: [], // Can be added later if needed - colors should be stored in DB
      category: category ? {
        id: category.id,
        name: category.name,
        slug: category.slug
      } : null,
      isNew: false, // Can be determined by created_at date
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

  // Fetch jewelry categories for filter bar
  const categories = await getJewelryCategories()

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
          recommendedProducts={recommendedProducts}
          filterConfigs={filterConfigs}
        />
      </div>
    </div>
  )
}
