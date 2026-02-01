"use client"

import React, { useState } from 'react';
import SafeImage from '@/components/common/SafeImage';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "./ui/carousel";

interface CategoryItem {
  id: string;
  name: string;
  image: string;
}

interface CategoryCarouselProps {
  categories?: CategoryItem[];
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories = [] }) => {
  // Using setApi to store carousel reference for controls
  const [, setApi] = useState<CarouselApi | null>(null);

  // Use empty array if no categories
  const displayItems = categories;

  return (
    <div className="mb-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Rhode-style Cream Container */}
        <div className="bg-[#FAF9F7] rounded-2xl px-4 md:px-8 py-8 md:py-12">
          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="uppercase text-[#8B7355] tracking-[0.2em] text-[11px] font-medium mb-2">SHOP BY CATEGORY</h2>
            <h3 className="text-[#5C4D3C] text-2xl md:text-3xl font-light" style={{ fontFamily: "'Rhode', sans-serif", letterSpacing: '0.01em' }}>Intimate Collection</h3>
            <p className="text-[#8B7355] text-sm mt-3 max-w-[500px] mx-auto">Explore our handcrafted accessories for every occasion</p>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 5,
              }}
            >
              <CarouselContent>
                {displayItems.length > 0 ? (
                  displayItems.map((category) => (
                    <CarouselItem key={category.id} className="basis-1/5">
                      <div className="pr-5 cursor-pointer group">
                        <div className="aspect-[3/4] overflow-hidden mb-3 bg-[#f5f5f5] relative rounded-2xl">
                          <SafeImage
                            src={category.image}
                            alt={`Luxury ${category.name} by CenturionIntimate`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                            sizes="(max-width: 1024px) 20vw, 20vw"
                          />
                        </div>
                        <h3 className="text-[#5a4c46] text-center font-light text-sm tracking-wide">{category.name}</h3>
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
                    <CarouselItem key={category.id} className="basis-1/2">
                      <div className="pr-[5px] cursor-pointer">
                        <div className="aspect-[3/4] overflow-hidden mb-3 bg-[#f5f5f5] relative rounded-2xl">
                          <SafeImage
                            src={category.image}
                            alt={`Luxury ${category.name} by CenturionIntimate`}
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="(max-width: 640px) 75vw, 50vw"
                          />
                        </div>
                        <h3 className="text-[#5a4c46] text-center font-light text-sm tracking-wide">{category.name}</h3>
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
