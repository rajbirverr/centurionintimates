"use client"

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

// Import products and types
import { products, Product } from './ProductGrid';

interface WishlistPageProps {
  onBack: () => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ onBack }) => {
  const [wishlist, setWishlist] = useState<(number | string)[]>([]);
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([]);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('skims-wishlist');
    if (savedWishlist) {
      const parsedWishlist = JSON.parse(savedWishlist);
      setWishlist(parsedWishlist);

      // Filter products that are in the wishlist
      const filtered = products.filter(product => parsedWishlist.includes(product.id));
      setWishlistedProducts(filtered);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('skims-wishlist', JSON.stringify(wishlist));

    // Update filtered products
    const filtered = products.filter(product => wishlist.includes(product.id));
    setWishlistedProducts(filtered);
  }, [wishlist]);

  const handleToggleWishlist = (productId: number | string) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.includes(productId)) {
        // Remove from wishlist
        setToastMessage('Removed from wishlist');
        setShowWishlistToast(true);
        return prevWishlist.filter(id => id !== productId);
      } else {
        // Add to wishlist
        setToastMessage('Added to wishlist');
        setShowWishlistToast(true);
        return [...prevWishlist, productId];
      }
    });

    // Hide toast after 2 seconds
    setTimeout(() => {
      setShowWishlistToast(false);
    }, 2000);
  };

  return (
    <div className="wishlist-page relative">
      {wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          <p className="text-base text-gray-500 mb-2">Your wishlist is empty</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-black text-white text-xs uppercase tracking-wider"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-16">
          {wishlistedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>
      )}

      {/* Wishlist toast notification */}
      <div
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white py-2 px-4 rounded-full text-sm transition-opacity duration-300 z-50 ${showWishlistToast ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        {toastMessage}
      </div>
    </div>
  );
};

export default WishlistPage;


