'use client'

import Link from 'next/link'

export default function VisitShopButton() {
  return (
    <Link href="/all-products" className="inline-block pointer-events-auto">
      <button 
        className="visit-shop-button flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm border border-red-400/30"
        style={{
          background: 'rgba(220, 38, 38, 0.4)',
          backdropFilter: 'blur(10px) saturate(150%)',
          WebkitBackdropFilter: 'blur(10px) saturate(150%)',
          boxShadow: '0 2px 8px 0 rgba(220, 38, 38, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          transition: 'background 50ms ease-out, box-shadow 50ms ease-out'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.boxShadow = 'none'
        }}
        onMouseUp={(e) => {
          setTimeout(() => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.4)'
            e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(220, 38, 38, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
          }, 100)
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(220, 38, 38, 0.4)'
          e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(220, 38, 38, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ color: '#ffffff', fontWeight: '400' }}>Visit shop</span>
      </button>
    </Link>
  )
}
