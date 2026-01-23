"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Product } from './ProductGrid';

interface RecommendedProductsProps {
  products: Product[];
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState<(number | string)[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [productsPerPage, setProductsPerPage] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update products per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setProductsPerPage(1);
      } else if (window.innerWidth < 768) {
        setProductsPerPage(2);
      } else if (window.innerWidth < 1024) {
        setProductsPerPage(3);
      } else {
        setProductsPerPage(5);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update visible products when page or products per page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    // Set transitioning state for animation
    setIsTransitioning(true);

    // Short delay to allow animation to occur
    setTimeout(() => {
      setVisibleProducts(products.slice(startIndex, endIndex));
      setIsTransitioning(false);
    }, 300);
  }, [currentPage, productsPerPage, products]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('skims-wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    // Initialize visible products
    const startIndex = 0;
    const endIndex = startIndex + productsPerPage;
    setVisibleProducts(products.slice(startIndex, endIndex));
  }, []);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('skims-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handleToggleWishlist = (productId: number | string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // iOS-style heart animation
    const target = e.currentTarget;
    target.classList.add('scale-125');
    setTimeout(() => {
      target.classList.remove('scale-125');
    }, 200);

    setWishlist(prevWishlist => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist.filter(id => id !== productId);
      } else {
        return [...prevWishlist, productId];
      }
    });
  };

  const goToPrevious = () => {
    if (currentPage > 1 && !isTransitioning) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages && !isTransitioning) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // iOS-style swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const diff = touchStartX - touchEndX;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swiped left - go next
          goToNext();
        } else {
          // Swiped right - go previous
          goToPrevious();
        }
      }
    }

    // Reset values
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="mt-0 bg-white" ref={containerRef}>
      {/* iOS-style header with blur effect on scroll */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-200 py-4">
        <div className="flex items-center justify-between px-5">
          <h2 className="flex-1 text-center font-normal text-sm uppercase tracking-wider">
            WE THINK YOU&apos;D LIKE
          </h2>
          <div className="flex items-center space-x-3">
            <div className="text-xs font-light px-2 py-1 rounded-full bg-[#f5f5f7] text-[#68686e]">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* iOS-style pagination indicators */}
      <div className="flex justify-center pt-2 pb-4 space-x-1.5">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentPage(index + 1)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentPage === index + 1
              ? "bg-[#69696e] w-4"
              : "bg-[#d1d1d6]"
              }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      {/* iOS-style scroll carousel with swipe support */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
            }`}
        >
          {visibleProducts.map((product) => (
            <div key={product.id} className="group relative">
              <div className="p-4 flex flex-col items-center">
                {/* iOS-style card with subtle shadow and rounded corners */}
                <div className="w-[75%] mx-auto aspect-[1/1.25] rounded-xl overflow-hidden shadow-sm group-hover:shadow transition-all duration-200 bg-[#f5f5f7]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* iOS-style interactive heart button with haptic-like animation */}
                  <button
                    onClick={(e) => handleToggleWishlist(product.id, e)}
                    className="absolute top-6 right-[15%] w-8 h-8 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm shadow-sm transition-all duration-200"
                    aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 transition-all duration-300 ${wishlist.includes(product.id) ? 'text-red-500' : 'text-gray-500'}`}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                {/* iOS typography maintaining existing font styles */}
                <div className="text-center mt-3 w-[80%] group-hover:scale-105 transition-transform duration-200">
                  <div className="text-[8px] uppercase text-[#767676] font-light mb-0.5 truncate">
                    {product.name.split(' ')[0]} {product.name.split(' ')[1]}
                  </div>
                  <div className="text-[8px] uppercase font-normal mb-1 truncate">
                    {product.name.split(' ').slice(2).join(' ')}
                  </div>
                  <div className="text-[8px] font-light text-[#86868b] inline-block px-2 py-0.5 rounded-full bg-[#f5f5f7]">
                    {product.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* iOS-style minimal edge swipe buttons */}
        <button
          onClick={goToPrevious}
          disabled={currentPage === 1 || isTransitioning}
          className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-start pl-1 focus:outline-none transition-opacity duration-300 ${currentPage === 1 ? 'opacity-0 cursor-default' : 'opacity-70 hover:opacity-100'
            }`}
          aria-label="Previous"
        >
          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="#68686e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        <button
          onClick={goToNext}
          disabled={currentPage >= totalPages || isTransitioning}
          className={`absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end pr-1 focus:outline-none transition-opacity duration-300 ${currentPage >= totalPages ? 'opacity-0 cursor-default' : 'opacity-70 hover:opacity-100'
            }`}
          aria-label="Next"
        >
          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="#68686e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RecommendedProducts;


