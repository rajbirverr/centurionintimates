'use client'

import { useState, useEffect, useRef } from 'react'

interface ShineCarouselProduct {
    id: string
    name: string
    location: string
    image: string
    slug?: string
}

interface ShineCarouselProps {
    products: ShineCarouselProduct[]
}

export default function ShineCarousel({ products }: ShineCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    // Handle auto-rotation
    useEffect(() => {
        if (products.length === 0) return

        startAutoRotation()

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [products.length])

    const startAutoRotation = () => {
        if (timerRef.current) clearInterval(timerRef.current)

        timerRef.current = setInterval(() => {
            if (!isAnimating && products.length > 0) {
                handleNextSlide()
            }
        }, 3000)
    }

    const pauseAutoRotation = () => {
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const resumeAutoRotation = () => {
        startAutoRotation()
    }

    const handleNextSlide = () => {
        if (isAnimating || products.length === 0) return

        setIsAnimating(true)
        setActiveIndex(prev => (prev + 1) % products.length)

        setTimeout(() => {
            setIsAnimating(false)
        }, 600)
    }

    const handlePrevSlide = () => {
        if (isAnimating || products.length === 0) return

        setIsAnimating(true)
        setActiveIndex(prev => (prev - 1 + products.length) % products.length)

        setTimeout(() => {
            setIsAnimating(false)
        }, 600)
    }

    const handleDotClick = (index: number) => {
        if (isAnimating || index === activeIndex) return

        setIsAnimating(true)
        setActiveIndex(index)

        setTimeout(() => {
            setIsAnimating(false)
        }, 600)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        pauseAutoRotation()
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        const touchThreshold = 50
        const touchDiff = touchEndX.current - touchStartX.current

        if (Math.abs(touchDiff) > touchThreshold) {
            if (touchDiff > 0) {
                handlePrevSlide()
            } else {
                handleNextSlide()
            }
        }
        resumeAutoRotation()
    }

    if (products.length === 0) {
        return (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-gray-100">
                <p className="text-gray-400 text-sm font-light">No products in carousel</p>
            </div>
        )
    }

    return (
        <div className="absolute inset-0 z-10">
            {/* Carousel Container */}
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-3xl">
                {/* Carousel items */}
                <div
                    className="relative w-full h-full"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {products.map((product, index) => {
                        const position = (index - activeIndex + products.length) % products.length
                        let normalizedPosition = position
                        if (position > Math.floor(products.length / 2)) {
                            normalizedPosition = position - products.length
                        }

                        const isActive = normalizedPosition === 0
                        const zIndex = isActive ? 2 : 1
                        const opacity = isActive ? 1 : 0

                        return (
                            <div
                                key={product.id}
                                className="absolute inset-0 transition-all duration-500 ease-in-out overflow-hidden rounded-3xl"
                                style={{
                                    opacity,
                                    zIndex,
                                    pointerEvents: isActive ? 'auto' : 'none'
                                }}
                                onClick={() => {
                                    pauseAutoRotation()
                                    handleDotClick(index)
                                    resumeAutoRotation()
                                }}
                            >
                                {/* Full product image as background */}
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />

                                {/* Dark gradient overlay at bottom for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>

                                {/* Text overlay - bottom left corner */}
                                <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-10 pointer-events-none">
                                    {/* Large bold product name */}
                                    <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                                        fontWeight: '700',
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {product.name}
                                    </h3>
                                    {/* Smaller subtitle */}
                                    <p className="text-white text-sm sm:text-base font-normal mb-4" style={{
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                                        fontWeight: '400',
                                        letterSpacing: '0.01em'
                                    }}>
                                        {product.location}
                                    </p>
                                    {/* Button with white border */}
                                    <a
                                        href={product.slug ? `/product/${product.slug}` : `/product/${product.id}`}
                                        className="inline-block pointer-events-auto"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                        }}
                                    >
                                        <button className="px-6 py-2.5 rounded-full border-2 border-white text-white text-sm font-medium transition-all duration-200 hover:bg-white/10" style={{
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                                            fontWeight: '500',
                                            letterSpacing: '0.05em'
                                        }}>
                                            VIEW PRODUCT
                                        </button>
                                    </a>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Navigation Controls - minimal dots at bottom center */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-2 z-20">
                    {products.map((_, index) => {
                        const isActive = activeIndex === index
                        return (
                            <button
                                key={index}
                                aria-label={`Go to slide ${index + 1}`}
                                className="relative transition-all duration-300 ease-out flex-shrink-0 focus:outline-none"
                                onClick={() => {
                                    pauseAutoRotation()
                                    handleDotClick(index)
                                    resumeAutoRotation()
                                }}
                            >
                                <div className="relative flex items-center justify-center">
                                    {isActive ? (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    ) : (
                                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/70 transition-all duration-300"></div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
