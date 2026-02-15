"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryFilterBarProps {
  categories: Category[]
}

// Color palette for buttons
const BUTTON_COLORS = [
  { bg: '#3E2723', text: '#FFFFFF' }, // Very Dark Brown
  { bg: '#5D4037', text: '#FFFFFF' }, // Dark Brown
  { bg: '#795548', text: '#FFFFFF' }, // Chocolate
  { bg: '#A1887F', text: '#FFFFFF' }, // Mocha
  { bg: '#BCAAA4', text: '#000000' }, // Light Brown
  { bg: '#D7CCC8', text: '#000000' }, // Pale Brown
  { bg: '#F5F5F5', text: '#000000' }, // Creme
];

export default function CategoryFilterBar({ categories }: CategoryFilterBarProps) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  return (
    <div className="z-30 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide p-3 justify-start md:justify-center">
            {/* SHOP ALL Button - Always first */}
            <Link
              href="/all-products"
              prefetch={true}
              className={`flex-shrink-0 relative group px-2.5 py-1 rounded-md text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95`}
              style={{
                backgroundColor: !activeCategory ? '#2d2420' : '#F5F5F5',
                color: !activeCategory ? '#FFFFFF' : '#000000'
              }}
            >
              <span className="relative z-10">SHOP ALL</span>
            </Link>

            {/* Category Buttons */}
            {categories.map((category, index) => {
              const isActive = activeCategory === category.slug;
              // Cycle through colors based on index
              const colorTheme = BUTTON_COLORS[index % BUTTON_COLORS.length];

              // If active, use specific active style (e.g., solid dark or keep its color?)
              // Request says "give the button different shades", implying they should always have these colors?
              // Or maybe only when selected? 
              // Usually in this design, each category HAS a color. Active state might just be opacity/border or scale.
              // Let's assume the colors are permanent, and active state adds a ring or shadow.
              // Actually, user said "text visibility... depending upon the color".
              // Let's apply the color always.

              const bgColor = colorTheme.bg;
              const textColor = colorTheme.text;

              return (
                <Link
                  key={category.id}
                  href={`/all-products?category=${category.slug}`}
                  prefetch={true}
                  className={`flex-shrink-0 relative group px-2.5 py-1 rounded-md text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${isActive ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                  style={{
                    backgroundColor: bgColor,
                    color: textColor
                  }}
                >
                  <span className="relative z-10">{category.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

