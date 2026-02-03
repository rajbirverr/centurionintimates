"use client"

import React, { useState, useEffect, useCallback } from 'react';
import SafeImage from '@/components/common/SafeImage';
import StylizedTitle from '@/components/common/StylizedTitle';
import ViewToggle from '@/components/common/ViewToggle';
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

const ProductCard: React.FC<{ product: DripProduct; index: number; isSingleView: boolean }> = ({ product, index, isSingleView }) => {
    const [showSecondary, setShowSecondary] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(hover: none), (pointer: coarse)').matches);
        };
        checkMobile();

        const onTouch = () => setIsMobile(true);
        window.addEventListener('touchstart', onTouch, { once: true });

        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('touchstart', onTouch);
        };
    }, []);

    const hasSecondaryImage = product.secondaryImage && product.secondaryImage !== product.image;

    const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (isMobile && hasSecondaryImage) {
            setShowSecondary(prev => !prev);
        }
    }, [isMobile, hasSecondaryImage]);

    return (
        <div className="flex flex-col items-center text-center h-full">
            <div
                className={`mb-5 w-full overflow-hidden relative rounded-2xl cursor-pointer bg-white transition-all duration-300 ${isSingleView ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}
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
                        sizes={isSingleView ? "(max-width: 768px) 90vw, 50vw" : "(max-width: 1024px) 33vw, 20vw"}
                    />
                </div>

                {/* Secondary Image */}
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
                            sizes={isSingleView ? "(max-width: 768px) 90vw, 50vw" : "(max-width: 1024px) 33vw, 20vw"}
                        />
                    </div>
                )}
            </div>
            {/* Optimized text for single view */}
            <h4 className={`font-light text-[#5C4D3C] mb-1 tracking-wide ${isSingleView ? 'text-lg' : 'text-sm'}`}>{product.name}</h4>
            <div className={`text-[#8B7355] mb-5 px-4 leading-relaxed ${isSingleView ? 'max-w-[280px] text-sm' : 'max-w-[200px] text-xs'}`}>
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
    const [isSingleView, setIsSingleView] = useState(false);

    return (
        <div className="mb-16 px-4 md:px-8 lg:px-12">
            {/* Rhode-style Cream Container */}
            <div className="max-w-[1440px] mx-auto">
                <div className="bg-[#FAF9F7] rounded-2xl pt-8 pb-6 md:pt-12 md:pb-12 px-4 md:px-8 overflow-visible relative">

                    {/* Header + Toggle */}
                    <div className="flex flex-col items-center mb-4 md:mb-10 relative">
                        <div className="text-center">
                            <StylizedTitle
                                text="Explore"
                                className="text-[#583432] text-3xl md:text-5xl font-black italic mb-3 uppercase tracking-wider"
                                style={{ fontFamily: 'var(--font-montserrat)' }}
                            />
                            <p className="text-[#8B7355] text-lg md:text-xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-manrope)' }}>
                                Drip for Days Under ₹500
                            </p>
                        </div>

                        {/* Toggle Button - Visible on all screens */}
                        <div className="mt-4">
                            <ViewToggle isSingleView={isSingleView} onToggle={() => setIsSingleView(!isSingleView)} />
                        </div>
                    </div>

                    {/* Mobile View - Layout changes based on state */}
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
                                        <CarouselItem key={product.id} className={`${isSingleView ? 'basis-full px-4' : 'basis-[50%] px-[10px]'} h-full transition-all duration-300`}>
                                            <ProductCard product={product} index={index} isSingleView={isSingleView} />
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
                            <div className={`grid ${isSingleView ? 'grid-cols-3' : 'grid-cols-3 lg:grid-cols-5'} gap-5 transition-all duration-300`}>
                                {products.map((product, index) => (
                                    <div key={product.id} className="w-full">
                                        <ProductCard product={product} index={index} isSingleView={isSingleView} />
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
