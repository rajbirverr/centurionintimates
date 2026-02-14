'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SafeImage from '@/components/common/SafeImage'

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
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#FAF9F7]">
                <p className="text-[#8B7355] text-sm font-light">No products in carousel</p>
            </div>
        )
    }

    return (
        <div className="absolute inset-0 z-10">
            {/* Carousel Container */}
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
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
                                className="absolute inset-0 transition-all duration-500 ease-in-out overflow-hidden rounded-2xl"
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
                                <SafeImage
                                    src={product.image}
                                    alt={product.name || 'Product image'}
                                    fill
                                    className="object-cover object-center"
                                    priority={index === activeIndex}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />

                                {/* Text overlay - bottom left corner */}
                                <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-10 pointer-events-none">
                                    {/* Large bold product name */}
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight drop-shadow-md" style={{
                                        fontFamily: 'var(--font-manrope)',
                                        fontWeight: '700',
                                        letterSpacing: '-0.02em',
                                        color: '#8B7355'
                                    }}>
                                        {product.name}
                                    </h3>
                                    {/* Smaller subtitle */}
                                    <p className="text-sm sm:text-base font-normal mb-4 text-[#8B7355]" style={{
                                        fontFamily: 'var(--font-manrope)',
                                        fontWeight: '400',
                                        letterSpacing: '0.01em'
                                    }}>
                                        {product.location}
                                    </p>
                                    {/* Button with white border */}
                                    <Link
                                        href={product.slug ? `/product/${product.slug}` : `/product/${product.id}`}
                                        className="inline-block pointer-events-auto px-8 py-2.5 rounded-lg border text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 text-[#3d2e22] hover:bg-[#3d2e22] hover:text-white bg-white/60 backdrop-blur-sm active:scale-[0.98] z-30"
                                        style={{
                                            fontFamily: 'var(--font-manrope)',
                                            borderColor: '#3d2e22'
                                        }}
                                    >
                                        <span>VIEW PRODUCT</span>
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>


            </div>
        </div>
    )
}