'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NewsletterTemplateProps {
  type: 'welcome' | 'sale' | 'festival' | 'blog-post' | 'order-confirmation' | 'cart-reminder' | 'invoice'
}

export default function NewsletterTemplate({ type }: NewsletterTemplateProps) {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setContent(getTemplateContent(type))
      setLoading(false)
    }, 500)
  }, [type])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#84756f]">Loading newsletter...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Newsletter Container - Max width for email-like appearance */}
      <div className="max-w-[600px] mx-auto bg-white">
        {/* Header */}
        <header className="bg-white border-b border-[#e8ded0] px-6 py-4 text-center">
          <Link href="/" className="inline-block">
            <h1 
              className="text-2xl md:text-3xl font-bold text-[#5a4c46] tracking-wider"
              style={{ fontFamily: "'Rhode', sans-serif" }}
            >
              CENTURION
            </h1>
            <div className="w-16 h-0.5 bg-[#784D2C] mx-auto mt-1"></div>
          </Link>
        </header>

        {/* Newsletter Content */}
        <div className="px-6 py-8">
          {type === 'welcome' && <WelcomeNewsletter content={content} />}
          {type === 'sale' && <SaleNewsletter content={content} />}
          {type === 'festival' && <FestivalNewsletter content={content} />}
          {type === 'blog-post' && <BlogPostNewsletter content={content} />}
          {type === 'order-confirmation' && <OrderConfirmationNewsletter content={content} />}
          {type === 'cart-reminder' && <CartReminderNewsletter content={content} />}
          {type === 'invoice' && <InvoiceNewsletter content={content} />}
        </div>

        {/* Footer */}
        <footer className="bg-[#fafafa] border-t border-[#e8ded0] px-6 py-8 text-center">
          <div className="space-y-4">
            {/* Social Links */}
            <div className="flex justify-center gap-4">
              <a href="#" className="text-[#84756f] hover:text-[#5a4c46] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-[#84756f] hover:text-[#5a4c46] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-[#84756f] hover:text-[#5a4c46] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Unsubscribe */}
            <p className="text-xs text-[#84756f]">
              You're receiving this email because you subscribed to Centurion newsletters.
            </p>
            <p className="text-xs text-[#84756f]">
              <a href="#" className="underline hover:text-[#5a4c46]">Unsubscribe</a> | 
              <Link href="/" className="underline hover:text-[#5a4c46] ml-1">Visit Website</Link>
            </p>
            <p className="text-xs text-[#84756f] mt-4">
              © {new Date().getFullYear()} Centurion. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Welcome Newsletter Component
function WelcomeNewsletter({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 bg-[#d4cdc3] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#5a4c46] mb-4"
              style={{ fontFamily: "'Rhode', sans-serif" }}
            >
              Welcome to Centurion
            </h2>
            <p className="text-lg text-[#84756f] max-w-md mx-auto">
              We're thrilled to have you join our community of jewelry lovers
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="text-center space-y-4">
        <p className="text-base text-[#5a4c46] leading-relaxed">
          Thank you for subscribing! You're now part of an exclusive community that celebrates beauty, empowerment, and timeless elegance.
        </p>
        <p className="text-sm text-[#84756f]">
          Get ready to discover handcrafted jewelry that's playful, pretty, and totally extra.
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          href="/all-products"
          className="inline-block bg-[#5a4c46] hover:bg-[#4a3c36] text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  )
}

// Sale Newsletter Component
function SaleNewsletter({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Sale Banner */}
      <div className="bg-[#E91E63] text-white text-center py-6 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">SALE NOW ON</h2>
        <p className="text-lg">Up to 50% off selected items</p>
      </div>

      {/* Sale Message */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-medium text-[#5a4c46]">Limited Time Offer</h3>
        <p className="text-base text-[#84756f]">
          Don't miss out on our biggest sale of the season. Shop now before it's too late!
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          href="/sale"
          className="inline-block bg-[#E91E63] hover:bg-[#d81b60] text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          Shop Sale
        </Link>
      </div>
    </div>
  )
}

// Festival Newsletter Component
function FestivalNewsletter({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Festival Banner */}
      <div className="bg-gradient-to-r from-[#784D2C] to-[#5a4c46] text-white text-center py-8 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Festival Collection</h2>
        <p className="text-lg">Celebrate in style with our exclusive designs</p>
      </div>

      {/* Festival Message */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-medium text-[#5a4c46]">Special Festival Offer</h3>
        <p className="text-base text-[#84756f]">
          Make this festival memorable with our curated collection of traditional and modern jewelry pieces.
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          href="/all-products"
          className="inline-block bg-[#784D2C] hover:bg-[#5a3d20] text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    </div>
  )
}

// Blog Post Newsletter Component
function BlogPostNewsletter({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Blog Image */}
      <div className="relative w-full h-64 bg-[#d4cdc3] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-2xl md:text-3xl font-medium text-[#5a4c46]">Latest from The Centurion Edit</h2>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-[#5a4c46]">Jewelry Trends & Style Tips</h3>
        <p className="text-base text-[#84756f] leading-relaxed">
          Discover the latest trends, styling tips, and expert advice from our jewelry experts...
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          href="/blogs"
          className="inline-block bg-[#5a4c46] hover:bg-[#4a3c36] text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          Read More
        </Link>
      </div>
    </div>
  )
}

// Order Confirmation Newsletter Component
function OrderConfirmationNewsletter({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Success Icon */}
      <div className="text-center">
        <div className="w-16 h-16 bg-[#784D2C] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-medium text-[#5a4c46] mb-2">Order Confirmed!</h2>
        <p className="text-base text-[#84756f]">Thank you for your purchase</p>
      </div>

      {/* Order Details */}
      <div className="bg-[#fafafa] border border-[#e8ded0] rounded-lg p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#84756f]">Order Number:</span>
          <span className="font-medium text-[#5a4c46]">#CR29845</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#84756f]">Order Date:</span>
          <span className="font-medium text-[#5a4c46]">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#84756f]">Total Amount:</span>
          <span className="font-medium text-[#5a4c46]">₹2,999</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link
          href="/account?tab=orders"
          className="flex-1 text-center bg-[#5a4c46] hover:bg-[#4a3c36] text-white px-6 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          View Order
        </Link>
        <Link
          href="/all-products"
          className="flex-1 text-center bg-white border border-[#e8ded0] hover:border-[#5a4c46] text-[#5a4c46] px-6 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

// Cart Reminder Newsletter Component
function CartReminderNewsletter({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Reminder Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-medium text-[#5a4c46]">Don't Forget Your Items!</h2>
        <p className="text-base text-[#84756f]">You left some beautiful pieces in your cart</p>
      </div>

      {/* Cart Items Preview */}
      <div className="bg-[#fafafa] border border-[#e8ded0] rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[#d4cdc3] rounded-md flex-shrink-0"></div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-[#5a4c46]">Product Name</h4>
            <p className="text-xs text-[#84756f] mt-1">₹2,999</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          href="/cart"
          className="inline-block bg-[#5a4c46] hover:bg-[#4a3c36] text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          Complete Purchase
        </Link>
      </div>
    </div>
  )
}

// Invoice Newsletter Component
function InvoiceNewsletter({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="text-center border-b border-[#e8ded0] pb-6">
        <h2 className="text-2xl md:text-3xl font-medium text-[#5a4c46] mb-2">Invoice</h2>
        <p className="text-sm text-[#84756f]">Invoice #INV-2024-001</p>
      </div>

      {/* Invoice Details */}
      <div className="space-y-6">
        {/* Billing Info */}
        <div className="bg-[#fafafa] border border-[#e8ded0] rounded-lg p-6 space-y-3">
          <h3 className="text-sm font-medium text-[#5a4c46] uppercase tracking-wide mb-3">Billing Information</h3>
          <div className="text-sm text-[#84756f] space-y-1">
            <p>John Doe</p>
            <p>123 Main Street</p>
            <p>City, State 12345</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#5a4c46] uppercase tracking-wide">Order Items</h3>
          <div className="border border-[#e8ded0] rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#84756f]">Product Name</span>
              <span className="font-medium text-[#5a4c46]">₹2,999</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#84756f]">Subtotal</span>
              <span className="font-medium text-[#5a4c46]">₹2,999</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#84756f]">Tax</span>
              <span className="font-medium text-[#5a4c46]">₹540</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-[#e8ded0]">
              <span className="font-medium text-[#5a4c46]">Total</span>
              <span className="font-medium text-[#784D2C] text-base">₹3,539</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          href="/account?tab=orders"
          className="inline-block bg-[#5a4c46] hover:bg-[#4a3c36] text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
        >
          View Order Details
        </Link>
      </div>
    </div>
  )
}

// Helper function to get template content
function getTemplateContent(type: string) {
  return {
    type,
    timestamp: new Date().toISOString()
  }
}
