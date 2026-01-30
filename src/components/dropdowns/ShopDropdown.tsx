"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import BaseDropdown from './BaseDropdown'
import { CategoryWithSubcategories } from '@/lib/actions/categories'

interface ShopDropdownProps {
  isOpen: boolean
  navHeight: number
  onMouseEnter: () => void
  onMouseLeave: () => void
  categories: CategoryWithSubcategories[]
}

const ShopDropdown: React.FC<ShopDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave,
  categories
}) => {
  const setsCategory: CategoryWithSubcategories = {
    id: 'sets-static',
    name: 'Sets',
    slug: 'sets',
    description: 'Curated matching sets for every mood',
    // Use the same image as the homepage section for consistency
    image_url: '/sets-background.jpg',
    subcategories: [
      { id: 'sets-all', name: 'Shop All Sets', slug: 'sets', description: 'View all matching sets', category_id: 'sets-static', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]
  };

  const displayCategories = [...categories];
  // Ensure Sets is present, if not, add it
  if (!displayCategories.find(c => c.slug === 'sets')) {
    displayCategories.push(setsCategory);
  }

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(
    displayCategories.length > 0 ? displayCategories[0].slug : null
  )

  const activeCategory = displayCategories.find(cat => cat.slug === hoveredCategory) || displayCategories[0]
  const activeSubcategories = activeCategory?.subcategories || []

  // Update effect to reset hover if categories change
  // Not needed strictly as we initialize state 

  return (
    <BaseDropdown
      isOpen={isOpen}
      navHeight={navHeight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Categories tabs */}
      {displayCategories.length > 0 && (
        <div className="flex justify-center border-b border-[#e5e2e0]">
          {displayCategories.map((category, index) => {
            const isActive = category.slug === hoveredCategory || (index === 0 && !hoveredCategory)
            return (
              <button
                key={category.id}
                onMouseEnter={() => setHoveredCategory(category.slug)}
                className={`px-6 py-4 text-sm uppercase tracking-[0.1em] transition-colors ${isActive
                  ? 'border-b-2 border-[#5a4c46] text-[#5a4c46]'
                  : 'text-[#84756f] hover:text-[#5a4c46]'
                  }`}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Subcategories list with category image - always show same layout */}
      {displayCategories.length > 0 && (
        <div className="bg-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex" style={{ gap: '192px' }}>
              {/* Left side: Subcategories list */}
              <div className="flex-shrink-0">
                <h2 className="text-[#5a4c46] text-base font-medium mb-6">Style</h2>
                {activeSubcategories.length > 0 ? (
                  <div className="space-y-0">
                    {activeSubcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={`/all-products?category=${activeCategory.slug}&subcategory=${subcategory.slug}`}
                        className="block py-2 group"
                      >
                        <h3 className="text-[#5a4c46] text-sm font-normal group-hover:text-[#91594c] transition-colors">
                          {subcategory.name}
                        </h3>
                        {subcategory.description && (
                          <p className="text-[#84756f] text-xs mt-0.5 leading-relaxed">
                            {subcategory.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0">
                    <Link
                      href={`/all-products?category=${activeCategory.slug}`}
                      className="block py-2 group"
                    >
                      <h3 className="text-[#5a4c46] text-sm font-normal group-hover:text-[#91594c] transition-colors">
                        Shop All {activeCategory.name}
                      </h3>
                      {activeCategory.description && (
                        <p className="text-[#84756f] text-xs mt-0.5 leading-relaxed">
                          {activeCategory.description}
                        </p>
                      )}
                    </Link>
                  </div>
                )}
              </div>

              {/* Right side: Main category image */}
              <div className="flex flex-col items-start flex-shrink-0">
                {activeCategory.image_url ? (
                  <>
                    <div className="bg-[#f3f0ef] overflow-hidden mb-3" style={{ aspectRatio: '2/3', width: '192px', height: '288px' }}>
                      <img
                        src={activeCategory.image_url}
                        alt={activeCategory.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="max-w-[192px]">
                      <h3 className="text-[#5a4c46] text-sm font-medium mb-0.5">
                        {activeCategory.name}
                      </h3>
                      {activeCategory.description && (
                        <p className="text-[#84756f] text-xs leading-relaxed">
                          {activeCategory.description}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-[#f3f0ef] flex items-center justify-center mb-3" style={{ aspectRatio: '2/3', width: '192px', height: '288px' }}>
                      <svg
                        className="w-16 h-16 text-[#84756f]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="max-w-[192px]">
                      <h3 className="text-[#5a4c46] text-sm font-medium mb-0.5">
                        {activeCategory.name}
                      </h3>
                      {activeCategory.description && (
                        <p className="text-[#84756f] text-xs leading-relaxed">
                          {activeCategory.description}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseDropdown>
  )
}

export default ShopDropdown
