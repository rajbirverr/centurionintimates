"use client"

import React, { useState, useEffect, useCallback } from 'react';
import SafeImage from '@/components/common/SafeImage';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "../ui/carousel";

interface DripProduct {
    id: number | string;
    name: string;
    description: string;
    image: string;
    secondaryImage?: string | null;
    price: number;
}

interface ProductGridProps {
    products?: DripProduct[];
}

const ProductCard: React.FC<{ product: DripProduct; index: number }> = ({ product, index }) => {
    const [showSecondary, setShowSecondary] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(hover: none), (pointer: coarse)').matches);
        };
        checkMobile();

        // Robust fallback: if any touch event happens, we are on a device supporting touch
        const onTouch = () => setIsMobile(true);
        window.addEventListener('touchstart', onTouch, { once: true });

        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('touchstart', onTouch);
        };
    }, []);

    const hasSecondaryImage = product.secondaryImage && product.secondaryImage !== product.image;

    // Mobile: tap to toggle, Desktop: hover
    const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        // Prevent event from bubbling to parent components (like Carousel)
        if (e && e.stopPropagation) e.stopPropagation();

        if (isMobile && hasSecondaryImage) {
            setShowSecondary(prev => !prev);
        }
    }, [isMobile, hasSecondaryImage]);

    return (
        <div className="flex flex-col items-center text-center h-full">
            <div
                className="mb-5 w-full aspect-[3/4] overflow-hidden relative rounded-2xl cursor-pointer bg-white"
                onClick={handleInteraction}
                onMouseEnter={() => !isMobile && hasSecondaryImage && setShowSecondary(true)}
                onMouseLeave={() => !isMobile && setShowSecondary(false)}
            >
                {/* Primary Image */}
                <div
                    className="absolute inset-0"
                    style={{
                        opacity: showSecondary ? 0 : 1,
                        transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    <SafeImage
                        src={product.image}
                        alt={product.name}
                        fill
                        className="rounded-t-2xl"
                        style={{ objectFit: 'cover' }}
                        priority={index < 3}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        sizes="(max-width: 1024px) 33vw, 20vw"
                    />
                </div>

                {/* Secondary Image (only render if exists) */}
                {hasSecondaryImage && (
                    <div
                        className="absolute inset-0"
                        style={{
                            opacity: showSecondary ? 1 : 0,
                            transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    >
                        <SafeImage
                            src={product.secondaryImage!}
                            alt={`${product.name} - alternate view`}
                            fill
                            className="rounded-t-2xl"
                            style={{ objectFit: 'cover' }}
                            loading="lazy"
                            sizes="(max-width: 1024px) 33vw, 20vw"
                        />
                    </div>
                )}

                {/* Subtle indicator for mobile when secondary image exists */}
                {isMobile && hasSecondaryImage && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        <div
                            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: !showSecondary ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                        />
                        <div
                            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: showSecondary ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                        />
                    </div>
                )}
            </div>
            <h4 className="text-sm font-light text-[#5C4D3C] mb-1 tracking-wide">{product.name}</h4>
            <div className="text-xs text-[#8B7355] mb-5 px-4 leading-relaxed max-w-[200px]">
                <p className="line-clamp-2">
                    {product.description}
                </p>
                <button
                    className="text-[#784D2C] text-xs underline mt-1 hover:no-underline"
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/product/${product.id}`;
                    }}
                >
                    for more information click
                </button>
            </div>
            <button
                className="mt-auto w-full max-w-[180px] py-2 px-4 bg-white text-[#5C4D3C] text-[11px] uppercase tracking-[0.2em] font-light border border-[#5C4D3C] hover:bg-[#5C4D3C] hover:text-white transition-all duration-200"
            >
                ADD TO BAG
                <span className="ml-2">₹{product.price}</span>
            </button>
        </div>
    );
};

const MobileDripCarousel: React.FC<ProductGridProps> = ({ products = [] }) => {
    const [api, setApi] = useState<CarouselApi | null>(null);

    return (
        <div className="mb-16 px-4 md:px-8 lg:px-12">
            {/* Rhode-style Cream Container */}
            <div className="max-w-[1440px] mx-auto">
                <div className="bg-[#FAF9F7] rounded-2xl pt-8 pb-6 md:pt-12 md:pb-12 px-4 md:px-8 overflow-visible">
                    {/* Section Title and Description */}
                    <div className="text-center mb-4 md:mb-10">
                        <h2 className="uppercase tracking-[0.2em] text-[11px] font-medium mb-2 text-[#8B7355]">EXPLORE</h2>
                        <h3 className="text-2xl md:text-3xl font-light text-[#5C4D3C]" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>Drip for Days Under ₹500</h3>
                    </div>

                    {/* Mobile View - Standard Carousel with 2 columns */}
                    <div className="md:hidden">
                        <Carousel
                            setApi={setApi}
                            className="w-full"
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                        >
                            <CarouselContent>
                                {products.length > 0 ? (
                                    products.map((product, index) => (
                                        <CarouselItem key={product.id} className="basis-[50%] px-[10px] h-full">
                                            <ProductCard product={product} index={index} />
                                        </CarouselItem>
                                    ))
                                ) : (
                                    <CarouselItem className="basis-full px-[10px]">
                                        <div className="p-1 flex justify-center items-center h-56 text-gray-500">
                                            <p>No products available. Add products from the admin panel.</p>
                                        </div>
                                    </CarouselItem>
                                )}
                            </CarouselContent>
                            {/* Navigation Arrows */}
                            <div className="pt-4 pb-1" style={{ backgroundColor: '#FAF9F7' }}>
                                <div className="flex justify-center items-center">
                                    <CarouselPrevious className="relative static transform-none mx-2 h-8 w-8 bg-transparent border-none text-[#5a4c46]" />
                                    <CarouselNext className="relative static transform-none mx-2 h-8 w-8 bg-transparent border-none text-[#5a4c46]" />
                                </div>
                            </div>
                        </Carousel>
                    </div>

                    {/* Desktop Grid View */}
                    {products.length > 0 ? (
                        <div className="hidden md:block">
                            <div className="grid grid-cols-3 lg:grid-cols-5 gap-5">
                                {products.map((product, index) => (
                                    <div key={product.id} className="w-full">
                                        <ProductCard product={product} index={index} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:block text-center py-12 text-gray-500">
                            <p>No products available in this carousel. Add products from the admin panel.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileDripCarousel;
