"use client"

import React, { useState, useEffect, useRef } from 'react';
import SortButton from './SortButton';

interface FilterBarProps {
  totalProducts: number;
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  productType: string[];
  color: string[];
  price: string[];
  size: string[];
  sort: string;
}

// Define sort options as constants to avoid string mismatches
export const SORT_OPTIONS = {
  FEATURED: 'Featured',
  PRICE_LOW_TO_HIGH: 'Price: Low to High',
  PRICE_HIGH_TO_LOW: 'Price: High to Low',
  NEWEST: 'Newest'
};

const FilterBar: React.FC<FilterBarProps> = ({
  totalProducts,
  onFilterChange,
  initialFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    productType: [],
    color: [],
    price: [],
    size: [],
    sort: SORT_OPTIONS.FEATURED
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Re-enable sticky behavior as per user request
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const filterBarHeight = useRef<number>(0);

  // Sync with initialFilters from parent component
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Calculate active filter count on mount and when filters change
  useEffect(() => {
    const count =
      filters.productType.length +
      filters.color.length +
      filters.price.length +
      filters.size.length;

    setActiveFilterCount(count);
  }, [filters]);

  // Set up scroll event listener for sticky behavior
  useEffect(() => {
    if (filterBarRef.current) {
      filterBarHeight.current = filterBarRef.current.offsetHeight;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if scrolling up and past the initial position of filter bar
      if (currentScrollY < lastScrollY && currentScrollY > filterBarHeight.current) {
        setIsSticky(true);
      } else if (currentScrollY <= filterBarHeight.current) {
        // At top of page, not sticky
        setIsSticky(false);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down, hide
        setIsSticky(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleFilter = () => {
    setShowFilters(!showFilters);
  };

  // Handle sort changes from SortButton component
  const handleSortChange = (sortOption: string) => {
    console.log('FilterBar received sort change:', sortOption);

    // Create new filters object with the new sort option
    const newFilters = {
      ...filters,
      sort: sortOption
    };

    // Update local state
    setFilters(newFilters);

    // Call parent callback
    if (onFilterChange) {
      console.log('Sending updated filters to parent with sort:', newFilters);
      onFilterChange(newFilters);
    }
  };

  const handleFilterChange = (category: keyof FilterState, value: string) => {
    const newFilters = { ...filters };

    if (category === 'sort') {
      // For sort, just replace the value
      newFilters.sort = value;

      console.log('Sort changed to:', value); // Debug log
    } else {
      // For multi-select filters
      const categoryFilters = filters[category] as string[];

      if (categoryFilters.includes(value)) {
        // Remove the filter if already selected
        newFilters[category] = categoryFilters.filter(item => item !== value);
      } else {
        // Add the filter if not already selected
        newFilters[category] = [...categoryFilters, value];
      }
    }

    // Count total active filters
    const filterCount =
      newFilters.productType.length +
      newFilters.color.length +
      newFilters.price.length +
      newFilters.size.length;

    setActiveFilterCount(filterCount);
    setFilters(newFilters);

    if (onFilterChange) {
      console.log('Sending filters to parent:', newFilters); // Debug log
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    const resetFilters = {
      productType: [],
      color: [],
      price: [],
      size: [],
      sort: SORT_OPTIONS.FEATURED
    };

    setFilters(resetFilters);
    setActiveFilterCount(0);

    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  const filterOptions = {
    productType: [
      'Bodysuits',
      'Bras',
      'Dresses',
      'Tops',
      'Bottoms',
      'Sets'
    ],
    color: [
      { name: 'Sienna', code: '#b5846b' },
      { name: 'Sand', code: '#e4d2d0' },
      { name: 'Clay', code: '#d4a591' },
      { name: 'Cocoa', code: '#926657' },
      { name: 'Onyx', code: '#403b38' },
      { name: 'Mica', code: '#cccbce' }
    ],
    price: [
      'Under $50',
      '$50 - $100',
      '$100 - $150',
      'Over $150'
    ],
    size: [
      'XXS',
      'XS',
      'S',
      'M',
      'L',
      'XL',
      '1X',
      '2X',
      '3X',
      '4X',
    ],
    sort: [
      SORT_OPTIONS.FEATURED,
      SORT_OPTIONS.PRICE_LOW_TO_HIGH,
      SORT_OPTIONS.PRICE_HIGH_TO_LOW,
      SORT_OPTIONS.NEWEST,
    ]
  };

  return (
    <>
      {/* Placeholder div when sticky to maintain layout */}
      {isSticky && <div style={{ height: `${filterBarHeight.current}px` }} />}

      <div
        ref={filterBarRef}
        className={`filter-bar mb-3 w-full z-30 ${showFilters ? 'bg-transparent' : 'bg-white'
          } ${isSticky ? 'fixed top-0 left-0 right-0 shadow-md px-4 md:px-8 animate-slideDown' : ''
          }`}
        style={{ overflow: 'visible' }}
      >
        {/* Top bar with product count and filter/sort buttons */}
        <div className="flex justify-between items-center py-2">
          <nav className="fashion-breadcrumb flex items-center gap-2.5 text-xs tracking-[0.2em] uppercase">
            <span className="text-[#403b38]/75 font-light italic transition-colors duration-300 hover:text-[#403b38]">Collection</span>
          </nav>

          <div className="flex items-center space-x-3" style={{ overflow: 'visible' }}>
            <button
              onClick={toggleFilter}
              className={`group flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium px-2.5 py-1 rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${showFilters || activeFilterCount > 0
                ? 'bg-[#3E2723] text-white ring-2 ring-offset-2 ring-gray-900'
                : 'bg-[#5D4037] text-white'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className={`text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center transition-colors ${showFilters || activeFilterCount > 0
                  ? 'bg-white text-[#3E2723]'
                  : 'bg-white/20 text-white'
                  }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Add SortButton component */}
            <SortButton
              currentSort={filters.sort}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div
            className="white-glass-button filter-panel border-t border-gray-200/30 py-4 mt-2 rounded-2xl px-4"
            style={{
              background: 'rgba(245, 245, 245, 0.98)',
              backdropFilter: 'blur(0px) saturate(120%)',
              WebkitBackdropFilter: 'blur(0px) saturate(120%)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-[#403b38]">Filter by</h3>
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#403b38] underline hover:text-[#403b38]/80"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Product Type filter */}
              <div>
                <h4 className="text-xs uppercase tracking-wider mb-2 text-[#403b38]">Product Type</h4>
                <div className="space-y-2">
                  {filterOptions.productType.map(type => (
                    <label key={type} className="flex items-center hover:bg-[rgba(230,230,230,0.9)] rounded px-2 py-1 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={filters.productType.includes(type)}
                        onChange={() => handleFilterChange('productType', type)}
                      />
                      <span className="ml-2 text-xs text-[#403b38] font-light">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color filter */}
              <div>
                <h4 className="text-xs uppercase tracking-wider mb-2 text-[#403b38]">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.color.map(color => (
                    <button
                      key={color.name}
                      className={`w-6 h-6 rounded-full ${filters.color.includes(color.name) ? 'ring-2 ring-offset-1 ring-[#403b38]' : ''
                        }`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                      onClick={() => handleFilterChange('color', color.name)}
                    />
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div>
                <h4 className="text-xs uppercase tracking-wider mb-2 text-[#403b38]">Price</h4>
                <div className="space-y-2">
                  {filterOptions.price.map(range => (
                    <label key={range} className="flex items-center hover:bg-[rgba(230,230,230,0.9)] rounded px-2 py-1 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={filters.price.includes(range)}
                        onChange={() => handleFilterChange('price', range)}
                      />
                      <span className="ml-2 text-xs text-[#403b38] font-light">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size filter */}
              <div>
                <h4 className="text-xs uppercase tracking-wider mb-2 text-[#403b38]">Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {filterOptions.size.map(size => (
                    <button
                      key={size}
                      className={`py-1 px-2 text-xs border transition-all duration-200 ${filters.size.includes(size)
                        ? 'border-[#403b38] bg-[#403b38] text-white hover:bg-[#403b38]'
                        : 'border-gray-300/50 text-[#403b38] hover:bg-[rgba(230,230,230,0.9)] hover:border-gray-400/60'
                        }`}
                      onClick={() => handleFilterChange('size', size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterBar;


