"use client"

import React, { useState, useEffect, useRef } from 'react';

// Import sort options from FilterBar to maintain consistency
import { SORT_OPTIONS } from './FilterBar';

interface SortButtonProps {
  currentSort: string;
  onSortChange: (sortOption: string) => void;
}

const SortButton: React.FC<SortButtonProps> = ({ currentSort, onSortChange }) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortButtonRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    if (!showSortDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        sortButtonRef.current &&
        !sortButtonRef.current.contains(target)
      ) {
        setShowSortDropdown(false);
      }
    };

    // Use a slight delay to avoid closing immediately when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showSortDropdown]);

  const toggleSortDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSortDropdown(prev => !prev);
  };

  const handleSortChange = (sortOption: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSortChange(sortOption);
    setShowSortDropdown(false);
  };

  // Sort options array - ensure no duplicates
  const sortOptions = React.useMemo(() => {
    const options = [
      SORT_OPTIONS.FEATURED,
      SORT_OPTIONS.PRICE_LOW_TO_HIGH,
      SORT_OPTIONS.PRICE_HIGH_TO_LOW,
      SORT_OPTIONS.NEWEST,
    ];
    // Remove any duplicates
    return [...new Set(options)];
  }, []);

  return (
    <div className="relative inline-block" ref={sortButtonRef} style={{ overflow: 'visible' }}>
      <button
        onClick={toggleSortDropdown}
        className={`group flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium px-2.5 py-1 rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${showSortDropdown
          ? 'bg-[#3E2723] text-white ring-2 ring-offset-2 ring-gray-900'
          : 'bg-[#795548] text-white'
          }`}
        aria-expanded={showSortDropdown}
        aria-haspopup="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V3" />
        </svg>
        <span>Sort: {currentSort}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Sort dropdown menu */}
      {showSortDropdown && (
        <div
          className="absolute left-0 top-full mt-2 rounded-2xl p-2 w-56 z-[100] bg-white shadow-2xl border border-[#e5e2e0]/50 backdrop-blur-sm"
          role="menu"
          aria-orientation="vertical"
        >
          {sortOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              className={`block w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-200 ${currentSort === option
                ? 'font-medium text-[#5a4c46] bg-[#f5f5f5]'
                : 'font-light text-[#5a4c46] hover:bg-[#fafafa] hover:translate-x-1'
                } ${index !== sortOptions.length - 1 ? 'mb-1' : ''}`}
              onClick={(e) => handleSortChange(option, e)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortButton;


