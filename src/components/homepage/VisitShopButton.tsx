'use client'

import Link from 'next/link'

export default function VisitShopButton() {
  return (
    <Link
      href="/all-products"
      className="inline-block pointer-events-auto px-8 py-2.5 rounded-lg border text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 text-[#3d2e22] hover:bg-[#3d2e22] hover:text-white bg-white/60 backdrop-blur-sm active:scale-[0.98] z-30"
      style={{
        fontFamily: 'var(--font-manrope)',
        borderColor: '#3d2e22'
      }}
    >
      <span>VISIT SHOP</span>
    </Link>
  )
}