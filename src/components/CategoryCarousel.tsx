"use client"

import React, { useState } from 'react';
import SafeImage from '@/components/common/SafeImage';
import StylizedTitle from '@/components/common/StylizedTitle';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "./ui/carousel";

import ViewToggle from '@/components/common/ViewToggle';

interface CategoryItem {
  id: string;
  name: string;
  image: string;
}

interface CategoryCarouselProps {
  categories?: CategoryItem[];
}
const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories = [] }) => {
  const [, setApi] = useState<CarouselApi | null>(null);
  const [isSingleView, setIsSingleView] = useState(false);

  const displayItems = categories;

  return (
    <div className="mb-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Rhode-style Cream Container */}
        <div className="bg-[#FAF9F7] rounded-2xl px-4 md:px-8 py-8 md:py-12 relative">

          {/* Heading + Toggle */}
          <div className="text-center mb-6 relative">
            <StylizedTitle
              text="Shop by category"
              className="text-[#583432] text-2xl md:text-4xl font-black italic mb-3 tracking-wider"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            />
            <h3
              className="text-[#8B7355] text-lg md:text-xl tracking-wide"
              style={{ fontFamily: 'var(--font-audiowide)' }}
            >
              Intimate Collection
            </h3>
            <p className="text-[#8B7355] text-sm mt-3 max-w-[500px] mx-auto hidden md:block opacity-80">
              Explore our handcrafted accessories for every occasion
            </p>

            {/* Toggle Button - Visible on all screens */}
            <div className="mt-4 flex justify-center relative z-10">
              <ViewToggle isSingleView={isSingleView} onToggle={() => setIsSingleView(!isSingleView)} />
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 1,
              }}
            >
              <CarouselContent className={isSingleView ? '' : ''}>
                {displayItems.length > 0 ? (
                  displayItems.map((category) => (
                    <CarouselItem key={category.id} className={`${isSingleView ? 'basis-1/3' : 'basis-1/5'} transition-[flex-basis] duration-300`}>
                      <div className="pr-5 cursor-pointer group">
                        <div className={`overflow-hidden mb-3 bg-[#f5f5f5] relative rounded-2xl transition-all duration-300 ${isSingleView ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
                          <SafeImage
                            src={category.image}
                            alt={`Luxury ${category.name} by CenturionIntimate`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            sizes={isSingleView ? "400px" : "(max-width: 1024px) 20vw, 20vw"}
                          />
                        </div>
                        <h3 className={`text-[#5a4c46] text-center font-light tracking-wide ${isSingleView ? 'text-lg' : 'text-sm'}`} style={{ fontFamily: 'var(--font-manrope)' }}>{category.name}</h3>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem className="basis-1/5">
                    <div className="pr-4 text-center text-gray-500 text-sm">
                      <p>No categories available. Add category images from the admin panel.</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <div className="flex justify-center mt-6">
                <CarouselPrevious className="relative static transform-none mx-3 h-10 w-10 bg-transparent border-none text-[#5C4D3C] hover:text-[#5C4D3C] hover:bg-[#E8E4DE] transition-colors" />
                <CarouselNext className="relative static transform-none mx-3 h-10 w-10 bg-transparent border-none text-[#5C4D3C] hover:text-[#5C4D3C] hover:bg-[#E8E4DE] transition-colors" />
              </div>
            </Carousel>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "start",
                loop: false,
              }}
            >
              <CarouselContent>
                {displayItems.length > 0 ? (
                  displayItems.map((category) => (
                    <CarouselItem key={category.id} className={`${isSingleView ? 'basis-full px-4' : 'basis-[50%] px-[10px]'} transition-all duration-300`}>
                      <div className="cursor-pointer group">
                        <div className={`overflow-hidden mb-3 bg-[#f5f5f5] relative rounded-2xl transition-all duration-300 ${isSingleView ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
                          <SafeImage
                            src={category.image}
                            alt={`Luxury ${category.name} by CenturionIntimate`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            sizes={isSingleView ? "(max-width: 768px) 90vw, 50vw" : "(max-width: 640px) 50vw, 33vw"}
                          />
                        </div>
                        <h3 className={`text-[#5a4c46] text-center font-light tracking-wide ${isSingleView ? 'text-lg' : 'text-sm'}`} style={{ fontFamily: 'var(--font-manrope)' }}>{category.name}</h3>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem className="basis-3/4 sm:basis-1/2">
                    <div className="pr-4 text-center text-gray-500 text-sm">
                      <p>No categories available. Add category images from the admin panel.</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative static transform-none mx-2 h-8 w-8 bg-transparent border-none text-[#5C4D3C]" />
                <CarouselNext className="relative static transform-none mx-2 h-8 w-8 bg-transparent border-none text-[#5C4D3C]" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;
