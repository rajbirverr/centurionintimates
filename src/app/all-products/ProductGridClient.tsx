'use client'

import { useState, useEffect } from 'react'
import { Product, ProductGrid } from '@/components/allproducts'
import { FilterConfig } from '@/lib/actions/filter-config'

interface ProductGridClientProps {
  products: Product[]
  filterConfigs: FilterConfig[]
}

export default function ProductGridClient({
  products,
  filterConfigs
}: ProductGridClientProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state (products are already loaded from server, but show brief loading)
  useEffect(() => {
    // Small delay to show loading state if needed
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#5a4c46] text-sm">Loading products...</div>
      </div>
    )
  }

  return (
    <>
      <ProductGrid products={products} filterConfigs={filterConfigs} />
    </>
  )
}

