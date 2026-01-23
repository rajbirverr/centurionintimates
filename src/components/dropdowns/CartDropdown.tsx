"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import BaseDropdown from './BaseDropdown';
import { useCart } from '@/context/CartContext';

// Define shipping options
const shippingOptions: { id: 'standard' | 'express'; name: string; price: number; estimate: string }[] = [
  { id: 'standard', name: 'Standard Shipping', price: 120, estimate: '3-5 business days' },
  { id: 'express', name: 'Express Shipping', price: 350, estimate: '1-2 business days' }
];

// Shipping costs from CartContext
const SHIPPING_COSTS = {
  standard: 120,
  express: 350,
};

interface CartDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave
}) => {
  const { items: cartItems, updateQuantity, removeItem, subtotal: cartSubtotal, setShippingMethod, shippingMethod: cartShippingMethod, shippingCost: cartShippingCost, total: cartTotal, isLoggedIn } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express'>(cartShippingMethod || 'standard');

  // Sync selectedShipping with cartShippingMethod
  React.useEffect(() => {
    setSelectedShipping(cartShippingMethod || 'standard');
  }, [cartShippingMethod]);

  // Use cart context values
  const subtotal = cartSubtotal;

  // Handle shipping change - update cart context
  const handleShippingChange = (shippingId: 'standard' | 'express') => {
    setSelectedShipping(shippingId);
    const shippingMap: Record<string, 'standard' | 'express'> = {
      'standard': 'standard',
      'express': 'express'
    };
    if (shippingMap[shippingId]) {
      setShippingMethod(shippingMap[shippingId]);
    }
  };

  // Use cart context shipping cost and total
  const shippingCost = cartShippingCost;
  const total = cartTotal;

  // Handle quantity change - use cart context
  const handleQuantityChange = (id: string | number, color: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity, color);
  };

  // Handle item removal - use cart context
  const handleRemoveItem = (id: string | number, color: string) => {
    removeItem(id, color);
  };

  return (
    <BaseDropdown
      isOpen={isOpen}
      navHeight={navHeight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-[#5a4c46] text-xl font-light text-center mb-6">Your Shopping Bag</h2>

          {!isLoggedIn ? (
            /* Login prompt - show when user is not logged in */
            <div className="text-center py-8">
              <p className="text-[#84756f] mb-6">Please login or create an account to view your cart.</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Link
                  href="/login"
                  className="w-full py-3 bg-black text-white hover:bg-[#1a1a1a] uppercase tracking-[0.1em] text-xs font-normal rounded-[14px] transition-all duration-200 text-center"
                  onClick={() => onMouseLeave()}
                >
                  LOGIN
                </Link>
                <Link
                  href="/account/register"
                  className="w-full py-3 border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white uppercase tracking-[0.1em] text-xs font-normal rounded-[14px] transition-all duration-200 text-center"
                  onClick={() => onMouseLeave()}
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="md:col-span-2">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.color}`} className="border-b border-[#e5e2e0] py-4 flex items-start">
                    {/* Product image */}
                    <div className="bg-[#f3f0ef] w-20 h-20 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Product details */}
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="text-[#5a4c46] text-sm font-medium">{item.name}</h3>
                        <p className="text-[#5a4c46] text-sm">₹{item.price * item.quantity}</p>
                      </div>
                      <p className="text-[#84756f] text-xs mt-1">Color: {item.color}</p>

                      {/* Quantity selector and remove button */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-[#e5e2e0]">
                          <button
                            className="px-2 py-1 text-[#84756f] hover:text-[#5a4c46] focus:outline-none"
                            onClick={() => handleQuantityChange(item.id, item.color, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-sm">{item.quantity}</span>
                          <button
                            className="px-2 py-1 text-[#84756f] hover:text-[#5a4c46] focus:outline-none"
                            onClick={() => handleQuantityChange(item.id, item.color, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="text-[#84756f] text-xs hover:text-[#5a4c46] underline focus:outline-none"
                          onClick={() => handleRemoveItem(item.id, item.color)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="bg-[#f3f0ef] p-4">
                <h3 className="text-[#5a4c46] text-sm font-medium mb-4 uppercase tracking-wider">Order Summary</h3>

                {/* Subtotal */}
                <div className="flex justify-between mb-2">
                  <span className="text-[#84756f] text-sm">Subtotal</span>
                  <span className="text-[#5a4c46] text-sm">₹{subtotal}</span>
                </div>

                {/* Shipping options */}
                <div className="mb-4">
                  <p className="text-[#84756f] text-sm mb-2">Shipping</p>
                  <div className="space-y-2">
                    {shippingOptions.map(option => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          id={option.id}
                          name="shipping"
                          checked={selectedShipping === option.id}
                          onChange={() => handleShippingChange(option.id)}
                          className="text-[#5a4c46] focus:ring-[#5a4c46]"
                        />
                        <label htmlFor={option.id} className="ml-2 flex-grow">
                          <span className="text-[#5a4c46] text-xs">{option.name}</span>
                          <span className="text-[#84756f] text-xs block">{option.estimate}</span>
                        </label>
                        <span className="text-[#5a4c46] text-xs">₹{option.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#e5e2e0] pt-4 mb-4">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#5a4c46] text-sm">Total</span>
                    <span className="text-[#5a4c46] text-sm">₹{total}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <Link
                  href="/checkout"
                  className="block w-full bg-[#5a4c46] text-white hover:bg-[#4a3c36] px-4 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200 mb-2 text-center"
                >
                  Checkout
                </Link>

                {/* Continue shopping */}
                <button
                  className="w-full border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white px-4 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200"
                  onClick={() => onMouseLeave()}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Empty cart */
            <div className="text-center py-8">
              <p className="text-[#84756f] mb-6">Your shopping bag is empty.</p>
              <button
                className="border border-[#5a4c46] text-[#5a4c46] hover:bg-[#5a4c46] hover:text-white px-8 py-2 uppercase text-xs tracking-[0.2em] transition-colors duration-200"
                onClick={() => onMouseLeave()}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </BaseDropdown>
  );
};

export default CartDropdown;
