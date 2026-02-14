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
  const [showSizePrompt, setShowSizePrompt] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showCottonInfo, setShowCottonInfo] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [sizeGuideTab, setSizeGuideTab] = useState<'bra' | 'panty' | 'measure'>('bra')
  const [showCareInstructions, setShowCareInstructions] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Access cart context - CartProvider is in root layout, so it should be available
  const { addItem, isLoggedIn, isLoading } = useCart()
  const addingRef = useRef(false) // Use ref to prevent multiple simultaneous calls
  const autoAddExecutedRef = useRef(false) // Track if auto-add after login has been executed

  // Touch/swipe refs for product image carousel
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const isDragging = useRef(false)
  const minSwipeDistance = 50

  const handleSwipe = () => {
    const distance = touchStartX.current - touchEndX.current
    if (Math.abs(distance) >= minSwipeDistance && product.images) {
      if (distance > 0 && activeImage < product.images.length - 1) {
        setActiveImage(prev => prev + 1) // swipe left = next
      } else if (distance < 0 && activeImage > 0) {
        setActiveImage(prev => prev - 1) // swipe right = prev
      }
    }
  }

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

    if (isAdding) {
      return
    }

    if (!selectedSize) {
      // Show the size selection popup instead of blocking
      setShowSizePrompt(true)
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
          <ol className="flex items-center space-x-2 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
            <li>
              <Link href="/" className="text-[#8B7355]/60 hover:text-[#5a4c46] transition-colors">Home</Link>
            </li>
            <li className="text-[#8B7355]/40">
              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/all-products" className="text-[#8B7355]/60 hover:text-[#5a4c46] transition-colors">Shop</Link>
            </li>
            {product.category && (
              <>
                <li className="text-[#8B7355]/40">
                  <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <Link href={`/all-products?category=${product.category.slug}`} className="text-[#8B7355]/60 hover:text-[#5a4c46] transition-colors">
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li className="text-[#8B7355]/40">
              <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[#5a4c46] font-semibold truncate max-w-[200px] md:max-w-none">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            {/* Main Image */}
            <div
              className="aspect-[4/5] bg-[#f9f9f9] overflow-hidden relative rounded-2xl cursor-grab active:cursor-grabbing select-none"
              onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX }}
              onTouchMove={(e) => { touchEndX.current = e.targetTouches[0].clientX }}
              onTouchEnd={() => handleSwipe()}
              onMouseDown={(e) => { isDragging.current = true; touchStartX.current = e.clientX }}
              onMouseMove={(e) => { if (isDragging.current) touchEndX.current = e.clientX }}
              onMouseUp={() => { if (isDragging.current) { isDragging.current = false; handleSwipe() } }}
              onMouseLeave={() => { if (isDragging.current) { isDragging.current = false; handleSwipe() } }}
            >
              {product.images && product.images.length > 0 ? (
                <div
                  className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform"
                  style={{ transform: `translateX(-${activeImage * 100}%)` }}
                >
                  {product.images.map((img, idx) => (
                    <div key={idx} className="min-w-full h-full relative shrink-0">
                      <SafeImage
                        src={img}
                        alt={`${product.name} - View ${idx + 1}`}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              {/* Watermark Overlay - Show if product.watermark_enabled is true (defaults to true) */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <WatermarkOverlay
                  show={product.watermark_enabled !== false}
                  color={product.watermark_color}
                  fontSize={product.watermark_font_size}
                  position={product.watermark_position}
                />
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center mt-4">
                <div className="inline-flex rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-20 md:w-20 md:h-24 overflow-hidden relative transition-opacity ${activeImage === index ? 'opacity-100 ring-2 ring-inset ring-[#5a4c46]' : 'opacity-70 hover:opacity-100'
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
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3 bg-[#fff5f7] p-6 md:p-8 rounded-2xl h-full flex flex-col justify-between">
            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl text-[#6b4423] uppercase tracking-wide font-bold">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-[#6b4423]">₹{product.price.toLocaleString()}</p>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <p className="text-lg text-[#8B7355]/60 line-through font-medium">
                    ₹{product.compare_price.toLocaleString()}
                  </p>
                  <span className="text-xs font-bold text-[#b91c1c] bg-[#fee2e2] px-2 py-1 rounded-full uppercase tracking-wider">
                    {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% Off
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {isSoldOut && (
              <p className="text-sm text-red-600 font-medium">Out of Stock</p>
            )}

            {/* Details Button + Description */}
            {product.description && (
              <div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`px-6 py-2 text-xs uppercase tracking-[0.2em] font-semibold rounded-full border transition-all duration-200 ${showDetails
                      ? 'bg-[#c4a882] text-white border-[#c4a882]'
                      : 'bg-[#f5ede3] text-[#5a4c46] border-[#e5ddd3] hover:border-[#c4a882]'
                      }`}
                  >
                    Details
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-[#5a4c46]/70 tracking-wide">Country of Origin — India 🇮🇳</span>
                    <button
                      onClick={() => setShowCottonInfo(!showCottonInfo)}
                      className="flex items-center gap-1.5 text-xs text-[#5a4c46]/70 tracking-wide hover:text-[#5a4c46] transition-colors"
                    >
                      Cloth Fabric Type — Cotton
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Cotton Advantages - expandable */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${showCottonInfo ? 'max-h-60 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
                    }`}
                >
                  <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-[#5a4c46] uppercase tracking-wider mb-2">Why Cotton Innerwear?</p>
                    <p className="text-xs text-[#5a4c46]/70">✦ Naturally breathable & moisture-absorbing</p>
                    <p className="text-xs text-[#5a4c46]/70">✦ Hypoallergenic — gentle on sensitive skin</p>
                    <p className="text-xs text-[#5a4c46]/70">✦ Soft, lightweight & comfortable all day</p>
                    <p className="text-xs text-[#5a4c46]/70">✦ Durable & easy to maintain</p>
                    <p className="text-xs text-[#5a4c46]/70">✦ Ideal for tropical & humid climates</p>
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${showDetails ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                    }`}
                >
                  <p className="text-sm text-[#5a4c46]/80 leading-relaxed">{product.description}</p>
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs uppercase tracking-wider text-[#5a4c46]">
                  Size: {selectedSize || 'Select a size'}
                </p>
                <button onClick={() => setShowSizeGuide(true)} className="text-xs text-[#5a4c46] underline">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={isSoldOut}
                    className={`h-9 w-full flex items-center justify-center text-xs font-medium border rounded-full transition-all duration-200 ${selectedSize === size
                      ? 'border-[#c4a882] bg-[#c4a882] text-white shadow-md'
                      : 'border-[#e5ddd3] text-[#5a4c46] bg-[#f5ede3] hover:border-[#c4a882] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
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
              <div className="flex items-center border border-[#e5ddd3] w-fit rounded-full bg-[#f5ede3] overflow-hidden shadow-sm hover:border-[#c4a882] transition-colors h-9">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={isSoldOut}
                  className="px-4 h-full text-[#5a4c46] hover:bg-[#efe4d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
                >
                  −
                </button>
                <div className="w-px h-4 bg-[#e5e5e5]"></div>
                <span className="px-4 h-full text-[#5a4c46] flex items-center justify-center font-medium min-w-[3rem]">{quantity}</span>
                <div className="w-px h-4 bg-[#e5e5e5]"></div>
                <button
                  onClick={() => !isSoldOut && setQuantity(quantity + 1)}
                  disabled={isSoldOut || quantity >= product.inventory_count}
                  className="px-4 h-full text-[#5a4c46] hover:bg-[#efe4d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
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
              disabled={isSoldOut || isAdding || isLoading}
              className="w-full h-12 rounded-full bg-[#c4a882] text-white uppercase text-sm tracking-widest hover:bg-[#b89970] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-medium flex items-center justify-center mt-2"
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
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Free returns within 7 days</span>
              </div>
              <p className="text-[11px] text-[#5a4c46]/60 leading-relaxed pl-8">
                All standard return policies apply to final sale item(s). The item(s) must be new, unworn, unwashed and in the original packaging with tags attached. Returns must be initiated within 7 days of receiving the item(s).
              </p>
            </div>

            {/* Delivery Estimate */}
            <div className="flex items-center space-x-3 text-sm text-[#5a4c46]">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h.375" />
              </svg>
              <span>Estimated delivery: 3–5 business days</span>
            </div>

            {/* Care Instructions Toggle */}
            <div>
              <button
                onClick={() => setShowCareInstructions(!showCareInstructions)}
                className="flex items-center space-x-3 text-sm text-[#5a4c46] hover:text-[#c4a882] transition-colors w-full"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <span>Care Instructions</span>
                <svg className={`w-4 h-4 ml-auto transition-transform duration-200 ${showCareInstructions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${showCareInstructions ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className="bg-white rounded-xl border border-[#e5ddd3] p-4 space-y-1.5 ml-8">
                  <p className="text-xs text-[#5a4c46]/70">✦ Hand wash or machine wash cold on gentle cycle</p>
                  <p className="text-xs text-[#5a4c46]/70">✦ Use mild detergent — avoid bleach</p>
                  <p className="text-xs text-[#5a4c46]/70">✦ Hang dry in shade — do not tumble dry</p>
                  <p className="text-xs text-[#5a4c46]/70">✦ Do not iron directly on lace or embroidery</p>
                  <p className="text-xs text-[#5a4c46]/70">✦ Store flat or use a lingerie bag</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#c4a882]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-[10px] text-[#5a4c46]/60 uppercase tracking-wider">Secure Checkout</span>
              </div>
              <div className="w-px h-4 bg-[#e5ddd3]"></div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#c4a882]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-[10px] text-[#5a4c46]/60 uppercase tracking-wider">Authentic</span>
              </div>
              <div className="w-px h-4 bg-[#e5ddd3]"></div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#c4a882]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span className="text-[10px] text-[#5a4c46]/60 uppercase tracking-wider">Made in India</span>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#5a4c46]/50 uppercase tracking-wider">Share</span>
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(product.name + ' — ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#f5ede3] flex items-center justify-center hover:bg-[#c4a882] hover:text-white text-[#5a4c46] transition-all duration-200"
                  title="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#f5ede3] flex items-center justify-center hover:bg-[#c4a882] hover:text-white text-[#5a4c46] transition-all duration-200"
                  title="Share on X"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href)
                      setLinkCopied(true)
                      setTimeout(() => setLinkCopied(false), 2000)
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-[#f5ede3] flex items-center justify-center hover:bg-[#c4a882] hover:text-white text-[#5a4c46] transition-all duration-200"
                  title="Copy link"
                >
                  {linkCopied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  )}
                </button>
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

      {/* Size Selection Popup */}
      {showSizePrompt && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          onClick={() => setShowSizePrompt(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"></div>

          {/* Popup Card */}
          <div
            className="relative bg-white w-full md:w-[400px] md:rounded-2xl rounded-t-2xl p-6 pb-8 animate-[slideUp_0.35s_cubic-bezier(0.32,0.72,0,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center mb-4 md:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Close button (desktop) */}
            <button
              onClick={() => setShowSizePrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-center text-sm uppercase tracking-widest text-[#5a4c46] font-semibold mb-5">
              Select a Size
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size)
                    setShowSizePrompt(false)
                  }}
                  className={`h-12 rounded-full text-sm font-medium border-2 transition-all duration-200 active:scale-95 ${selectedSize === size
                    ? 'border-[#5a4c46] bg-[#5a4c46] text-white shadow-md'
                    : 'border-[#e5e5e5] text-[#5a4c46] bg-white hover:border-[#5a4c46] hover:scale-105'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400">Tap a size to continue</p>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          onClick={() => setShowSizeGuide(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"></div>
          <div
            className="relative bg-white w-full md:w-[520px] md:max-h-[85vh] max-h-[80vh] md:rounded-2xl rounded-t-2xl overflow-hidden animate-[slideUp_0.35s_cubic-bezier(0.32,0.72,0,1)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 md:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="p-5 pb-0">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-center text-sm uppercase tracking-widest text-[#5a4c46] font-semibold mb-4">Size Guide</h3>

              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                {([['bra', 'Bras'], ['panty', 'Panties & Lingerie'], ['measure', 'How to Measure']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSizeGuideTab(key)}
                    className={`flex-1 py-2 text-[10px] md:text-xs font-medium rounded-full transition-all duration-200 ${sizeGuideTab === key
                      ? 'bg-[#5a4c46] text-white shadow-sm'
                      : 'text-[#5a4c46]/70 hover:text-[#5a4c46]'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 overflow-y-auto">
              {sizeGuideTab === 'bra' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#5a4c46] uppercase tracking-wider mb-2">Band Size Conversion</p>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#faf5f0]">
                          <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">India</th>
                          <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">UK</th>
                          <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">US</th>
                          <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">Underbust (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#5a4c46]/80">
                        {[
                          ['28', '28', '28', '63–67'],
                          ['30', '30', '30', '68–72'],
                          ['32', '32', '32', '73–77'],
                          ['34', '34', '34', '78–82'],
                          ['36', '36', '36', '83–87'],
                          ['38', '38', '38', '88–92'],
                          ['40', '40', '40', '93–97'],
                          ['42', '42', '42', '98–102'],
                        ].map(([india, uk, us, cm], i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fdfbf9]'}>
                            <td className="border border-[#e5e5e5] px-3 py-1.5">{india}</td>
                            <td className="border border-[#e5e5e5] px-3 py-1.5">{uk}</td>
                            <td className="border border-[#e5e5e5] px-3 py-1.5">{us}</td>
                            <td className="border border-[#e5e5e5] px-3 py-1.5">{cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5a4c46] uppercase tracking-wider mb-2">Cup Size Conversion</p>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#faf5f0]">
                          <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">India / UK</th>
                          <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">US</th>
                          <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">Bust − Band (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#5a4c46]/80">
                        {[
                          ['A', 'A', '12–14'],
                          ['B', 'B', '14–16'],
                          ['C', 'C', '16–18'],
                          ['D', 'D', '18–20'],
                          ['DD', 'DD', '20–22'],
                          ['E', 'DDD/F', '22–24'],
                        ].map(([induk, us, diff], i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fdfbf9]'}>
                            <td className="border border-[#e5e5e5] px-3 py-1.5">{induk}</td>
                            <td className="border border-[#e5e5e5] px-3 py-1.5">{us}</td>
                            <td className="border border-[#e5e5e5] px-3 py-1.5">{diff}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {sizeGuideTab === 'panty' && (
                <div>
                  <p className="text-xs font-semibold text-[#5a4c46] uppercase tracking-wider mb-2">Panty & Lingerie Size Chart</p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#faf5f0]">
                        <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">Size</th>
                        <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">Hip (cm)</th>
                        <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">US</th>
                        <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">UK</th>
                        <th className="border border-[#e5e5e5] px-3 py-2 text-left text-[#5a4c46] font-semibold">Waist (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#5a4c46]/80">
                      {[
                        ['XS', '75–82', '4', '8', '58–63'],
                        ['S', '83–89', '5', '10', '64–69'],
                        ['M', '90–97', '6', '12', '70–75'],
                        ['L', '98–104', '7', '14', '76–81'],
                        ['XL', '105–112', '8', '16', '82–87'],
                        ['XXL', '113–119', '9', '18', '88–93'],
                      ].map(([size, hip, us, uk, waist], i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fdfbf9]'}>
                          <td className="border border-[#e5e5e5] px-3 py-1.5 font-medium">{size}</td>
                          <td className="border border-[#e5e5e5] px-3 py-1.5">{hip}</td>
                          <td className="border border-[#e5e5e5] px-3 py-1.5">{us}</td>
                          <td className="border border-[#e5e5e5] px-3 py-1.5">{uk}</td>
                          <td className="border border-[#e5e5e5] px-3 py-1.5">{waist}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sizeGuideTab === 'measure' && (
                <div className="space-y-4 text-sm text-[#5a4c46]/80 leading-relaxed">
                  <div>
                    <p className="text-xs font-semibold text-[#5a4c46] uppercase tracking-wider mb-2">For Bras</p>
                    <div className="space-y-2">
                      <p><span className="font-medium text-[#5a4c46]">Band Size:</span> Measure snugly around your ribcage, just under your bust. Round to the nearest even number.</p>
                      <p><span className="font-medium text-[#5a4c46]">Cup Size:</span> Measure around the fullest part of your bust. Subtract your band measurement — the difference determines your cup size.</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5a4c46] uppercase tracking-wider mb-2">For Panties & Lingerie</p>
                    <div className="space-y-2">
                      <p><span className="font-medium text-[#5a4c46]">Waist:</span> Measure around the narrowest part of your natural waistline.</p>
                      <p><span className="font-medium text-[#5a4c46]">Hips:</span> Stand with feet together. Measure around the fullest part of your hips and buttocks.</p>
                    </div>
                  </div>
                  <div className="bg-[#faf5f0] rounded-lg p-3 text-xs">
                    <p className="font-medium text-[#5a4c46] mb-1">💡 Tip</p>
                    <p>Use a soft measuring tape. Keep it snug but not tight. Measure over light clothing or directly on skin for best accuracy.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

