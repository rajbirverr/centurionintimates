"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/common/SafeImage';
import WatermarkOverlay from '@/components/common/WatermarkOverlay';

type Color = {
  name: string;
  code: string;
};

type Product = {
  id: number | string;
  name: string;
  slug?: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  image: string;
  hoverImage?: string;
  colors: Color[];
  category?: { id: string; name: string; slug: string } | null;
  isNew?: boolean;
  isSoldOut?: boolean;
  watermark_enabled?: boolean;
  watermark_color?: string;
  watermark_font_size?: number;
  watermark_position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  watermark_text?: string;
};

interface ProductCardProps {
  product: Product;
  onToggleWishlist: (productId: number | string) => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onToggleWishlist, isWishlisted }) => {
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [heartHovered, setHeartHovered] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleWishlist(product.id);
  };

  // Get product URL - use slug if available, otherwise use id
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;

  const router = useRouter();

  // Track if we're using touch to prevent double-firing and handle "tap vs click"
  const isTouchRef = React.useRef(false);

  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  // Handle image click - distinguishes between touch tap and mouse click
  const handleImageClick = (e: React.MouseEvent) => {
    // If this was triggered by a touch event (checked via ref), toggle image
    if (isTouchRef.current) {
      e.preventDefault();
      e.stopPropagation();
      setHovered(!hovered);
      // Reset touch ref after a short delay to allow future mouse interactions if needed
      setTimeout(() => { isTouchRef.current = false; }, 500);
    } else {
      // It's a mouse click - navigate
      router.push(productUrl);
    }
  };

  return (
    <div className="block group">
      <div
        className="product-card relative mb-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="product-image relative aspect-[1/1.5] overflow-hidden bg-[#f0f0f0] cursor-pointer"
          onClick={handleImageClick}
          onTouchStart={handleTouchStart}
        >
          <SafeImage
            src={product.image}
            alt={product.name || 'Product image'}
            fill
            className={`object-cover transition-transform duration-300 ease-out ${hovered && !product.hoverImage ? 'scale-105' : ''} ${hovered && product.hoverImage ? 'scale-105' : ''}`}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Hover Image - Shows on hover */}
          {product.hoverImage && (
            <SafeImage
              src={product.hoverImage}
              alt={`${product.name} - Alternate view`}
              fill
              className={`object-cover absolute inset-0 transition-all duration-300 ease-out ${hovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
              loading="lazy"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
          {/* Watermark Overlay - Show if product.watermark_enabled is true (defaults to true) */}
          <WatermarkOverlay
            show={product.watermark_enabled !== false}
            color={product.watermark_color}
            fontSize={product.watermark_font_size}
            position={product.watermark_position}
            text={product.watermark_text}
          />

          {/* Wishlist heart icon - Top Right */}
          <button
            className={`absolute top-2 right-2 z-20 transition-transform duration-300 ${heartHovered ? 'scale-110' : 'scale-100'}`}
            onClick={handleWishlistToggle}
            onMouseEnter={() => setHeartHovered(true)}
            onMouseLeave={() => setHeartHovered(false)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" className="w-5 h-5">
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-white drop-shadow-sm">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            )}
          </button>

          {/* New badge - Bottom Center Pill */}
          {product.isNew && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-[#fdfdfd] text-[#333] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-medium z-10 shadow-sm opacity-90">
              Newly Added
            </div>
          )}

          {/* Sold out overlay */}
          {product.isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <div className="text-sm font-medium uppercase tracking-widest text-gray-800">Sold Out</div>
            </div>
          )}

          {/* Quick add button on hover - Slides up from bottom, pushing badge if needed (but badge is absolute so it overlays) */}
          {/* Note: In the reference design, quick add might not be visible or might interact differently. 
              Keeping the slide-up behavior but ensuring it looks clean. */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-3 transform transition-transform duration-300 ease-out z-20 ${hovered && !product.isSoldOut ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <button
              className="w-full py-2.5 rounded bg-white text-black text-[11px] uppercase tracking-widest font-medium 
              hover:bg-[#f5f5f5] transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation(); // Stop bubbling to image click handler
                const button = e.currentTarget;
                button.classList.add('scale-95');
                setTimeout(() => button.classList.remove('scale-95'), 200);
              }}
            >
              <span>Quick Add</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>
          </div>
        </div>

        <Link href={productUrl} className="product-info space-y-1 block">
          {product.category?.name && (
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">{product.category.name}</p>
          )}
          <h3 className="text-[13px] uppercase font-bold tracking-wide text-black leading-snug">
            {product.name}
          </h3>
          <div className="text-[12px] font-normal text-gray-900">
            {product.originalPrice && product.discountPercent ? (
              <div className="flex items-center gap-2">
                <span className="text-red-700">{product.price}</span>
                <span className="text-gray-400 line-through text-[11px]">{product.originalPrice}</span>
              </div>
            ) : (
              <span>{product.price}</span>
            )}
          </div>

          {/* Color swatches - Optional, keeping existing logic but styling to match */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1 pt-1">
              {product.colors.map((color, index) => (
                <div
                  key={`${product.id}-${color.name}`}
                  className={`w-2.5 h-2.5 rounded-full border border-gray-200 ${selectedColor === index ? 'ring-1 ring-black ring-offset-1' : ''}`}
                  style={{ backgroundColor: color.code }}
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColor(index);
                  }}
                  aria-label={`Color: ${color.name}`}
                />
              ))}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
