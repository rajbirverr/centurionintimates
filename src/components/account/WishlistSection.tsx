'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/allproducts/ProductCard'
import { Product } from '@/components/allproducts/ProductGrid'
import { getWishlistItems, addToWishlist, removeFromWishlist, syncWishlistFromLocalStorage } from '@/lib/actions/wishlist'

export default function WishlistSection() {
  const [wishlist, setWishlist] = useState<(string | number)[]>([])
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showWishlistToast, setShowWishlistToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('skims-wishlist')
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist)
        if (Array.isArray(parsed)) {
          setWishlist(parsed)
        }
      } catch (error) {
        console.error('Error parsing wishlist:', error)
      }
    }
    setLoading(false)
  }, [])

  // Fetch products from database based on wishlist IDs
  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setWishlistedProducts([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Convert all IDs to strings for database query
        const productIds = wishlist.map(id => String(id))

        // Fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, slug, price, category_id')
          .in('id', productIds)
          .eq('status', 'published')

        if (productsError) {
          console.error('Error fetching wishlist products:', productsError)
          setWishlistedProducts([])
          return
        }

        if (!products || products.length === 0) {
          setWishlistedProducts([])
          return
        }

        // Fetch images
        const productIdsArray = products.map(p => p.id)
        const { data: images } = await supabase
          .from('product_images')
          .select('product_id, image_url, is_primary')
          .in('product_id', productIdsArray)

        // Fetch categories
        const categoryIds = [...new Set(products.map(p => p.category_id).filter((id): id is string => Boolean(id)))]
        let categoriesData: Array<{ id: string; name: string; slug: string }> = []
        
        if (categoryIds.length > 0) {
          const { data: categories } = await supabase
            .from('categories')
            .select('id, name, slug')
            .in('id', categoryIds)
          
          categoriesData = categories || []
        }

        const categoryMap = new Map(categoriesData.map(cat => [cat.id, cat]))
        const imageMap = new Map<string, string>()
        
        // Create image map
        images?.forEach(img => {
          if (!imageMap.has(img.product_id)) {
            if (img.is_primary) {
              imageMap.set(img.product_id, img.image_url)
            }
          }
        })

        // If no primary images, use any image
        images?.forEach(img => {
          if (!imageMap.has(img.product_id)) {
            imageMap.set(img.product_id, img.image_url)
          }
        })

        // Map to Product format
        const productsWithData: Product[] = products.map((product) => {
          const priceNumber = product.price ? Number(product.price) : 0
          const formattedPrice = isNaN(priceNumber) || priceNumber <= 0
            ? '₹0'
            : `₹${priceNumber.toLocaleString('en-IN')}`

          const imageUrl = imageMap.get(product.id) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkIi8+PC9zdmc+'

          return {
            id: product.id,
            name: product.name || 'Unnamed Product',
            slug: product.slug || '',
            price: formattedPrice,
            image: imageUrl,
            colors: [],
            category: product.category_id ? categoryMap.get(product.category_id) || null : null,
            isNew: false,
            isSoldOut: false,
          }
        })

        setWishlistedProducts(productsWithData)
      } catch (error) {
        console.error('Error loading wishlist products:', error)
        setWishlistedProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadWishlistProducts()
  }, [wishlist])

  const handleToggleWishlist = (productId: number | string) => {
    setWishlist(prevWishlist => {
      let newWishlist: (string | number)[]
      if (prevWishlist.includes(productId)) {
        // Remove from wishlist
        setToastMessage('Removed from wishlist')
        setShowWishlistToast(true)
        newWishlist = prevWishlist.filter(id => id !== productId)
      } else {
        // Add to wishlist
        setToastMessage('Added to wishlist')
        setShowWishlistToast(true)
        newWishlist = [...prevWishlist, productId]
      }

      // Save to localStorage
      localStorage.setItem('skims-wishlist', JSON.stringify(newWishlist))
      return newWishlist
    })

    // Hide toast after 2 seconds
    setTimeout(() => {
      setShowWishlistToast(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-[#84756f]">Loading wishlist...</div>
      </div>
    )
  }

  return (
    <div>
      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-12 border border-[#e5e2e0] rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          <p className="text-[#84756f] mb-4">Your wishlist is empty</p>
          <Link
            href="/all-products"
            className="px-4 py-2 bg-[#5a4c46] text-white hover:bg-[#4a3c36] rounded-md uppercase tracking-wider text-xs transition-colors duration-200 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-16">
          {wishlistedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>
      )}

      {/* Wishlist toast notification */}
      <div
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white py-2 px-4 rounded-full text-sm transition-opacity duration-300 z-50 ${
          showWishlistToast ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {toastMessage}
      </div>
    </div>
  )
}
