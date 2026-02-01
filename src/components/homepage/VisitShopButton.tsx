'use client'

import Link from 'next/link'

export default function VisitShopButton() {
  return (
    <Link href="/all-products" className="inline-block pointer-events-auto">
      <button
        className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm border-2 border-[#5C4D3C] bg-transparent hover:bg-[#5C4D3C] transition-all duration-300 group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-white transition-colors">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5C4D3C] group-hover:text-white" />
        </svg>
        <span className="text-[#5C4D3C] group-hover:text-white font-medium tracking-wide transition-colors">Visit shop</span>
      </button>
    </Link>
  )
}