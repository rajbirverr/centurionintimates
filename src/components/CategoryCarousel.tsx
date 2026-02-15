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
        <div className="bg-white rounded-2xl pt-8 pb-8 md:pt-12 md:pb-12 overflow-hidden relative">

          {/* Heading + Toggle */}
          <div className="text-center mb-6 relative px-4">
            <StylizedTitle
              text="Shop by category"
              className="text-[#BDBEBF] text-xl md:text-3xl mb-3 tracking-wider"
              style={{ fontFamily: 'var(--font-rhode)' }}
            />
            <h3
              className="text-[#8B7355] text-lg md:text-xl tracking-wide"
              style={{ fontFamily: 'var(--font-audiowide)' }}
            >
              choose your closet
            </h3>


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
                duration: 30,
                dragFree: true,
              }}
            >
              <CarouselContent className="-ml-4">
                {displayItems.length > 0 ? (
                  displayItems.map((category) => (
                    <CarouselItem key={category.id} className={`${isSingleView ? 'basis-1/3' : 'basis-1/5'} transition-[flex-basis] duration-300 pl-4`}>
                      <div className="cursor-pointer group">
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
                  <CarouselItem className="basis-1/5 pl-4">
                    <div className="text-center text-gray-500 text-sm">
                      <p>No categories available. Add category images from the admin panel.</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <div className="pt-6 flex justify-end">
                <CarouselNext className="static transform-none h-10 w-14 rounded-full bg-[#3d2e22] text-white border-none hover:bg-[#2a1f17] transition-colors" />
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
                duration: 30,
                dragFree: true,
              }}
            >
              <CarouselContent className="-ml-4">
                {displayItems.length > 0 ? (
                  displayItems.map((category) => (
                    <CarouselItem key={category.id} className={`${isSingleView ? 'basis-full' : 'basis-[50%]'} transition-all duration-300 pl-4`}>
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
                  <CarouselItem className="basis-3/4 sm:basis-1/2 pl-4">
                    <div className="text-center text-gray-500 text-sm">
                      <p>No categories available. Add category images from the admin panel.</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <div className="flex justify-end mt-4 mr-4">
                <CarouselNext className="static transform-none h-10 w-14 rounded-full bg-[#3d2e22] text-white border-none hover:bg-[#2a1f17] transition-colors" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;
