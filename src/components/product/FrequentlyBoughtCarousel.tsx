'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import SafeImage from '@/components/common/SafeImage'
import { getProductAssociations } from '@/lib/actions/product-associations'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

interface FrequentlyBoughtCarouselProps {
    productId: string
}

interface AssociatedProduct {
    id: string
    name: string
    images: string[]
    price: number
}

export default function FrequentlyBoughtCarousel({ productId }: FrequentlyBoughtCarouselProps) {
    const [products, setProducts] = useState<AssociatedProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAssociations() {
            try {
                const result = await getProductAssociations(productId)
                if (result.success && result.associations) {
                    // Extract the associated product details
                    const productList = result.associations
                        .map(assoc => assoc.associated_product)
                        .filter((p): p is AssociatedProduct => !!p)

                    setProducts(productList)
                }
            } catch (error) {
                console.error('Failed to load frequently bought products:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAssociations()
    }, [productId])

    if (loading || products.length === 0) {
        return null
    }

    return (
        <div className="mb-16 px-4 md:px-8 lg:px-12">
            <div className="max-w-[1440px] mx-auto">
                <div className="bg-[#FAF9F7] rounded-2xl px-4 md:px-8 py-8 md:py-12 relative">

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h2
                            className="text-[#583432] text-2xl md:text-4xl font-black italic mb-2 tracking-wider"
                            style={{ fontFamily: 'var(--font-montserrat)' }}
                        >
                            Frequently Bought Together
                        </h2>
                        <p className="text-[#8B7355] text-sm opacity-80">
                            Customers who bought this item also bought
                        </p>
                    </div>

                    {/* Carousel */}
                    <Carousel
                        className="w-full"
                        opts={{
                            align: "start",
                            loop: true,
                            slidesToScroll: 1,
                        }}
                    >
                        <CarouselContent>
                            {products.map((product) => (
                                <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5 pl-4">
                                    <Link href={`/product/${product.id}`} className="group block h-full">
                                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                                            {/* Image */}
                                            <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden">
                                                <SafeImage
                                                    src={(product.images && product.images[0]) ? product.images[0] : '/placeholder-product.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 50vw, 20vw"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="p-4 flex flex-col flex-grow text-center">
                                                <h3
                                                    className="text-[#5a4c46] font-medium text-sm mb-2 line-clamp-2"
                                                    style={{ fontFamily: 'var(--font-manrope)' }}
                                                >
                                                    {product.name}
                                                </h3>
                                                <div className="mt-auto">
                                                    <span className="text-[#8B7355] font-semibold text-sm">
                                                        ₹{product.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <div className="flex justify-center mt-8">
                            <CarouselPrevious className="relative static transform-none mx-2 h-10 w-10 bg-white border border-[#E8E4DE] text-[#5C4D3C] hover:bg-[#5C4D3C] hover:text-white transition-colors" />
                            <CarouselNext className="relative static transform-none mx-2 h-10 w-10 bg-white border border-[#E8E4DE] text-[#5C4D3C] hover:bg-[#5C4D3C] hover:text-white transition-colors" />
                        </div>
                    </Carousel>

                </div>
            </div>
        </div>
    )
}
