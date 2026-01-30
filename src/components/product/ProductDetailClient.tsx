'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/common/SafeImage'
import { useCart, type CartItem } from '@/context/CartContext'
import WatermarkOverlay from '@/components/common/WatermarkOverlay'

interface ProductDetailClientProps {
  product: {
    id: string
    name: string
    slug: string
    description?: string
    short_description?: string
    price: number
    compare_price?: number
    inventory_count: number
    images: string[]
    category?: { id: string; name: string; slug: string } | null
    watermark_enabled?: boolean
    watermark_color?: string
    watermark_font_size?: number
    watermark_position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    watermark_text?: string
  }
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Access cart context - CartProvider is in root layout, so it should be available
  const { addItem, isLoggedIn, isLoading } = useCart()
  const addingRef = useRef(false) // Use ref to prevent multiple simultaneous calls
  const autoAddExecutedRef = useRef(false) // Track if auto-add after login has been executed

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] // Default sizes - can be made dynamic later

  // Handle action=add_to_cart URL param after login redirect
  useEffect(() => {
    const action = searchParams?.get('action')
    const hasLoggedIn = isLoggedIn

    // Only run once when conditions are met
    if (action === 'add_to_cart' && hasLoggedIn && selectedSize && !autoAddExecutedRef.current) {
      // Mark as executed immediately to prevent duplicate calls
      autoAddExecutedRef.current = true

      // Auto-add product to cart after login
      const addToCartAfterLogin = async () => {
        try {
          await addItem({
            id: String(product.id),
            dbId: '',
            name: product.name,
            price: product.price,
            color: selectedSize,
            quantity: quantity,
            image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.png'
          })

          // Show success toast
          setShowSuccessToast(true)
          setTimeout(() => {
            setShowSuccessToast(false)
          }, 2000)

          // Remove action param from URL
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('action')
          router.replace(newUrl.pathname + newUrl.search, { scroll: false })
        } catch (error) {
          console.error('Error adding item to cart after login:', error)
          // Reset flag on error so it can retry
          autoAddExecutedRef.current = false
        }
      }

      addToCartAfterLogin()
    }

    // Reset flag when action param is removed or user logs out
    if (!action || action !== 'add_to_cart') {
      autoAddExecutedRef.current = false
    }
  }, [searchParams, isLoggedIn, selectedSize, product, quantity, addItem, router])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // CRITICAL: Prevent multiple calls - check ref FIRST before any async operations
    if (addingRef.current) {
      console.warn('[ProductDetailClient] Already adding to cart, ignoring duplicate call')
      return
    }

    if (!selectedSize || isAdding) {
      // Size selection is required - button is disabled if no size selected
      // Also prevent double-clicks and multiple simultaneous calls
      return
    }

    // Check if user is logged in - if not, redirect to login page
    if (!isLoading && !isLoggedIn) {
      // Build return URL with action param
      const returnUrl = encodeURIComponent(`${window.location.pathname}?action=add_to_cart`)
      router.push(`/login?return_url=${returnUrl}`)
      return
    }

    // If still loading, wait
    if (isLoading) {
      return
    }

    // Validate inventory - check if quantity exceeds available stock
    if (product.inventory_count > 0 && quantity > product.inventory_count) {
      alert(`Only ${product.inventory_count} items available in stock.`)
      return
    }

    // Validate quantity is positive
    if (quantity < 1) {
      alert('Quantity must be at least 1.')
      return
    }

    // Validate price is valid
    if (!product.price || product.price <= 0) {
      alert('Invalid product price. Please contact support.')
      return
    }

    // Set both state and ref to prevent multiple calls - MUST be set synchronously
    addingRef.current = true
    setIsAdding(true)

    // Always add exactly 1 item per click (not the quantity selector value)
    // The quantity selector is for future bulk adds, but for now we add 1 at a time
    const quantityToAdd = 1

    console.log('[ProductDetailClient] handleAddToCart called - Product:', product.id, 'Size:', selectedSize, 'Adding quantity:', quantityToAdd)

    try {
      // Add product to cart with real product data - always add 1
      console.log('[ProductDetailClient] Calling addItem with quantity:', quantityToAdd)
      await addItem({
        id: String(product.id), // Use product UUID as string
        dbId: '', // Will be set by the server action
        name: product.name,
        price: product.price,
        color: selectedSize, // Use size as color/variant
        quantity: quantityToAdd, // Always add 1 per click
        image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.png'
      })
      console.log('[ProductDetailClient] addItem completed')

      // Show success toast
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 2000)
    } catch (error) {
      console.error('[ProductDetailClient] Error adding item to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    } finally {
      // Reset after a delay to prevent rapid clicks
      setTimeout(() => {
        setIsAdding(false)
        addingRef.current = false
      }, 500) // Reduced delay but still safe
    }
  }


  const isSoldOut = product.inventory_count === 0

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-xs text-[#5a4c46]">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link href="/all-products" className="hover:underline">Shop</Link></li>
            {product.category && (
              <>
                <li>/</li>
                <li>
                  <Link href={`/all-products?category=${product.category.slug}`} className="hover:underline">
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-[#84756f]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/5] bg-[#f9f9f9] overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <SafeImage
                  src={product.images[activeImage]}
                  alt={product.name || 'Product image'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              {/* Watermark Overlay - Show if product.watermark_enabled is true (defaults to true) */}
              <WatermarkOverlay
                show={product.watermark_enabled !== false}
                color={product.watermark_color}
                fontSize={product.watermark_font_size}
                position={product.watermark_position}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-24 overflow-hidden border-2 transition-colors relative ${activeImage === index ? 'border-[#5a4c46]' : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <SafeImage
                      src={image}
                      alt={`${product.name || 'Product'} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      loading="lazy"
                    />
                    {/* Watermark Overlay - smaller on thumbnails */}
                    <WatermarkOverlay
                      className="text-[10px]"
                      show={product.watermark_enabled ?? true}
                      color={product.watermark_color}
                      fontSize={product.watermark_font_size}
                      position={product.watermark_position}
                      text={product.watermark_text}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl text-[#5a4c46] uppercase tracking-wide font-light">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <p className="text-xl text-[#5a4c46]">₹{product.price.toLocaleString()}</p>
              {product.compare_price && product.compare_price > product.price && (
                <p className="text-sm text-gray-400 line-through">
                  ₹{product.compare_price.toLocaleString()}
                </p>
              )}
            </div>

            {/* Stock Status */}
            {isSoldOut && (
              <p className="text-sm text-red-600 font-medium">Out of Stock</p>
            )}

            {/* Description */}
            {product.description && (
              <div className="text-sm text-[#5a4c46]/80 leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs uppercase tracking-wider text-[#5a4c46]">
                  Size: {selectedSize || 'Select a size'}
                </p>
                <button className="text-xs text-[#5a4c46] underline">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={isSoldOut}
                    className={`py-2 px-3 text-sm border transition-all ${selectedSize === size
                      ? 'border-[#5a4c46] bg-[#5a4c46] text-white'
                      : 'border-[#ddd] text-[#5a4c46] hover:border-[#5a4c46] disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-xs uppercase tracking-wider text-[#5a4c46] mb-3">
                Quantity
              </p>
              <div className="flex items-center border border-[#ddd] w-fit">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={isSoldOut}
                  className="px-4 py-2 text-[#5a4c46] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-4 py-2 text-[#5a4c46]">{quantity}</span>
                <button
                  onClick={() => !isSoldOut && setQuantity(quantity + 1)}
                  disabled={isSoldOut || quantity >= product.inventory_count}
                  className="px-4 py-2 text-[#5a4c46] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {product.inventory_count > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {product.inventory_count} in stock
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut || (!selectedSize && isLoggedIn) || isAdding || isLoading}
              className="w-full py-4 bg-[#5a4c46] text-white uppercase text-sm tracking-widest hover:bg-[#4a3c36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSoldOut
                ? 'Out of Stock'
                : isAdding
                  ? 'Adding...'
                  : !isLoggedIn && !isLoading
                    ? 'Login to Add to Cart'
                    : `Add to Bag — ₹${(product.price * quantity).toLocaleString()}`
              }
            </button>

            {/* Additional Info */}
            <div className="border-t border-[#eee] pt-6 space-y-4">
              <div className="flex items-center space-x-3 text-sm text-[#5a4c46]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Free shipping on orders over ₹1000</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-[#5a4c46]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Free returns within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black text-white py-3 px-6 rounded-full text-sm z-50 animate-fade-in">
          Product added to cart
        </div>
      )}
    </div>
  )
}

