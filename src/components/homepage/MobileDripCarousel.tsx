"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Premium alternating card background colors - warm browns/creams/taupes
const cardColors = [
    'bg-[#f5ede3]', // warm cream
    'bg-[#e8ddd0]', // soft beige
    'bg-[#d9cdbf]', // warm taupe
    'bg-[#f0e6d8]', // light champagne
    'bg-[#e2d5c5]', // sandy cream
    'bg-[#efe0ce]', // golden cream
    'bg-[#ddd0c0]', // muted caramel
    'bg-[#f3e9db]', // ivory sand
];

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

    const bgColor = cardColors[index % cardColors.length];

    return (
        <div className={`flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full ${bgColor}`}>
            {/* Image Container */}
            <div
                className={`w-full overflow-hidden relative cursor-pointer transition-all duration-300 ${isSingleView ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}
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
                            style={{ objectFit: 'cover' }}
                            loading="lazy"
                            sizes={isSingleView ? "(max-width: 768px) 90vw, 50vw" : "(max-width: 1024px) 33vw, 20vw"}
                        />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col flex-1 p-4 pt-3 pb-4">
                <h4
                    className={`font-semibold text-[#3d2e22] mb-1 leading-snug uppercase tracking-wide line-clamp-2 min-h-[2.5em] ${isSingleView ? 'text-sm' : 'text-[11px]'}`}
                    style={{ fontFamily: 'var(--font-manrope)' }}
                >
                    {product.name}
                </h4>

                {/* Price */}
                <p
                    className={`text-[#6b5744] font-medium mb-2 ${isSingleView ? 'text-base' : 'text-sm'}`}
                    style={{ fontFamily: 'var(--font-manrope)' }}
                >
                    ₹{product.price.toLocaleString()}
                </p>

                {/* Description */}
                <p
                    className={`text-[#8B7355] leading-relaxed line-clamp-2 mb-3 ${isSingleView ? 'text-xs' : 'text-[10px]'}`}
                    style={{ fontFamily: 'var(--font-manrope)' }}
                >
                    {product.description}
                </p>

                {/* Preview Button */}
                <button
                    className="mt-auto w-full py-2.5 bg-white/60 text-[#3d2e22] text-[10px] uppercase tracking-[0.2em] font-semibold rounded-lg border border-[#3d2e22] hover:bg-[#3d2e22] hover:text-white active:scale-[0.98] transition-all duration-200"
                    style={{ fontFamily: 'var(--font-manrope)' }}
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/product/${product.id}`;
                    }}
                >
                    PREVIEW
                </button>
            </div>
        </div>
    );
};

const MobileDripCarousel: React.FC<ProductGridProps> = ({ products = [] }) => {
    const [api, setApi] = useState<CarouselApi | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isSingleView, setIsSingleView] = useState(false);

    useEffect(() => {
        if (!api) return;
        const onScroll = () => {
            const progress = Math.max(0, Math.min(1, api.scrollProgress()));
            if (progressRef.current) {
                progressRef.current.style.width = `${Math.max(10, progress * 100)}%`;
            }
        };
        api.on('scroll', onScroll);
        api.on('reInit', onScroll);
        return () => {
            api.off('scroll', onScroll);
            api.off('reInit', onScroll);
        };
    }, [api]);

    return (
        <div className="mb-16 px-4 md:px-8 lg:px-12">
            {/* Container */}
            <div className="max-w-[1440px] mx-auto">
                <div className="bg-white rounded-2xl pt-8 pb-6 md:pt-12 md:pb-12 overflow-visible relative">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-6 md:mb-10">
                        <StylizedTitle
                            text="Explore"
                            className="text-[#BDBEBF] text-xl md:text-3xl mb-3 tracking-wider"
                            style={{ fontFamily: 'var(--font-rhode)' }}
                        />
                        <p className="text-[#8B7355] text-lg md:text-xl tracking-wide" style={{ fontFamily: 'var(--font-audiowide)' }}>
                            Drip for Days Under ₹500
                        </p>
                        <div className="mt-4 flex justify-center relative z-10">
                            <ViewToggle isSingleView={isSingleView} onToggle={() => setIsSingleView(!isSingleView)} />
                        </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                        <Carousel
                            setApi={setApi}
                            className="w-full"
                            opts={{
                                align: "start",
                                loop: true,
                                slidesToScroll: 1,
                                duration: 30,
                                dragFree: true,
                            }}
                        >
                            <CarouselContent className="ml-0">
                                {products.length > 0 ? (
                                    products.map((product, index) => (
                                        <CarouselItem key={product.id} className={`${isSingleView ? 'basis-full pl-0 pr-4' : 'basis-[50%] pl-0 pr-2'} h-full flex flex-col transition-[flex-basis] duration-300`}>
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
                            {/* Bottom: Progress Bar + Arrow */}
                            <div className="pt-8 pb-2 flex items-center justify-between">
                                <div className="flex-1" />
                                {/* Progress Bar */}
                                <div className="w-24 h-[3px] bg-[#e5ddd3] rounded-full overflow-hidden">
                                    <div
                                        ref={progressRef}
                                        className="h-full bg-[#3d2e22] rounded-full"
                                        style={{ width: '10%', transition: 'none' }}
                                    />
                                </div>
                                {/* Arrow Button */}
                                <div className="flex-1 flex justify-end">
                                    <CarouselNext className="static transform-none h-10 w-14 rounded-full bg-[#3d2e22] text-white border-none hover:bg-[#2a1f17] transition-colors" />
                                </div>
                            </div>
                        </Carousel>
                    </div>

                    {/* Desktop Carousel View */}
                    {products.length > 0 ? (
                        <div className="hidden md:block">
                            <Carousel
                                className="w-full"
                                opts={{
                                    align: "start",
                                    loop: true,
                                    slidesToScroll: 1,
                                    duration: 30,
                                    dragFree: true,
                                }}
                            >
                                <CarouselContent className="ml-0">
                                    {products.map((product, index) => (
                                        <CarouselItem key={product.id} className={`${isSingleView ? 'basis-1/3 pl-0 pr-4' : 'basis-1/3 lg:basis-1/5 pl-0 pr-4'} h-full flex flex-col transition-[flex-basis] duration-300`}>
                                            <ProductCard product={product} index={index} isSingleView={isSingleView} />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {/* Desktop Arrow */}
                                <div className="pt-6 flex justify-end">
                                    <CarouselNext className="static transform-none h-10 w-14 rounded-full bg-[#3d2e22] text-white border-none hover:bg-[#2a1f17] transition-colors" />
                                </div>
                            </Carousel>
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
