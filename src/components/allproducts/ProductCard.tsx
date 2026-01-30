"use client"

import React, { useState } from 'react';
import Link from 'next/link';
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

  return (
    <Link href={productUrl} className="block">
      <div
        className="product-card relative group overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="product-image relative mb-3 aspect-[1/1.444] md:aspect-[1/1.25] overflow-hidden">
          <SafeImage
            src={product.image}
            alt={product.name || 'Product image'}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {/* Watermark Overlay - Show if product.watermark_enabled is true (defaults to true) */}
          <WatermarkOverlay
            show={product.watermark_enabled !== false}
            color={product.watermark_color}
            fontSize={product.watermark_font_size}
            position={product.watermark_position}
            text={product.watermark_text}
          />

          {/* Wishlist heart icon */}
          <button
            className={`absolute top-3 right-3 z-20 transition-transform duration-300 ${heartHovered ? 'scale-110' : 'scale-100'}`}
            onClick={handleWishlistToggle}
            onMouseEnter={() => setHeartHovered(true)}
            onMouseLeave={() => setHeartHovered(false)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF4C4C" className="w-6 h-6">
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white hover:text-gray-200">
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" strokeWidth="1.5" stroke="#fff" fillOpacity="0" />
              </svg>
            )}
          </button>

          {/* New badge */}
          {product.isNew && (
            <div className="absolute top-3 left-3 bg-black text-white text-[10px] px-1.5 py-0.5 uppercase tracking-wide font-light z-10">
              New
            </div>
          )}

          {/* Sold out overlay */}
          {product.isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
              <div className="text-base font-medium uppercase tracking-wider">Sold Out</div>
            </div>
          )}

          {/* Quick add button on hover */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-2.5 bg-white/90 backdrop-blur-sm text-center transform transition-transform duration-300 ease-out ${hovered && !product.isSoldOut ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <button
              className="quick-add w-full py-2 rounded-full bg-[#e8ded0] text-[#5a4c46] text-[10px] uppercase tracking-widest font-medium 
            hover:bg-[#e8ded0] hover:text-[#000000] hover:border-[#000000] hover:border active:bg-[#e8ded0] active:text-[#000000] transition-all duration-300 shadow-sm 
            flex items-center justify-center space-x-1"
              onClick={(e) => {
                // iOS-style animation feedback
                const button = e.currentTarget;
                button.classList.add('scale-95');
                setTimeout(() => button.classList.remove('scale-95'), 200);
              }}
            >
              <span>Quick Add</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-1">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="product-info text-left pl-[15px] pr-0.5">
          {product.category?.name && (
            <p className="product-line text-[10px] uppercase font-normal tracking-wider mb-0.5 leading-snug">{product.category.name}</p>
          )}
          <h3 className="product-name text-[12px] uppercase font-bold tracking-wider mb-0.5 leading-tight" style={{ fontWeight: '700', color: '#784D2C' }}>{product.name}</h3>
          <div className="product-price text-[11px] font-normal">
            {product.originalPrice && product.discountPercent ? (
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-medium">{product.price}</span>
                <span className="text-gray-400 line-through text-[10px]">{product.originalPrice}</span>
                <span className="text-red-600 text-[10px] font-medium">-{product.discountPercent}%</span>
              </div>
            ) : (
              <span>{product.price}</span>
            )}
          </div>

          <div className="color-options flex justify-center gap-1.5 mt-2">
            {product.colors.map((color, index) => (
              <button
                key={`${product.id}-${color.name}`}
                className={`color-dot w-3 h-3 rounded-full transition-all duration-200 ${selectedColor === index ? 'ring-1 ring-black ring-offset-1' : ''}`}
                style={{ backgroundColor: color.code }}
                onClick={() => setSelectedColor(index)}
                aria-label={`Color: ${color.name}`}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;


