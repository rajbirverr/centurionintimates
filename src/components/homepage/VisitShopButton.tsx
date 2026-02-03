'use client'

import Link from 'next/link'

export default function VisitShopButton() {
  return (
    <Link href="/all-products" className="inline-block pointer-events-auto">
      <button
        className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm border-2 border-[#8B7355] bg-white/10 backdrop-blur-sm hover:bg-[#8B7355] transition-all duration-300 group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-white transition-colors animate-pulse">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B7355] group-hover:text-white" />
        </svg>
        <span className="text-[#8B7355] group-hover:text-white font-medium tracking-wide transition-colors" style={{ fontFamily: 'var(--font-manrope)' }}>Visit shop</span>
      </button>
    </Link>
  )
}