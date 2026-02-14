"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BaseDropdown from './BaseDropdown';
import { searchProducts } from '@/lib/actions/products';

const RECENT_SEARCHES_KEY = 'centurion_recent_searches';
const MAX_RECENT_SEARCHES = 5;

interface SearchResult {
  id: string
  name: string
  slug: string
  price: string
  image: string
  category: string | null
}

interface SearchDropdownProps {
  isOpen: boolean;
  navHeight: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  navHeight,
  onMouseEnter,
  onMouseLeave
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Popular searches - common jewelry categories
  const [popularSearches] = useState<string[]>(['Bangles', 'Necklaces', 'Earrings', 'Rings', 'Bracelets']);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const searches = JSON.parse(stored);
          setRecentSearches(Array.isArray(searches) ? searches : []);
        }
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    if (!query || query.trim().length === 0) return;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        let searches: string[] = stored ? JSON.parse(stored) : [];

        // Remove if already exists
        searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
        // Add to beginning
        searches.unshift(query);
        // Keep only last MAX_RECENT_SEARCHES
        searches = searches.slice(0, MAX_RECENT_SEARCHES);

        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
        setRecentSearches(searches);
      } catch (error) {
        console.error('Error saving recent search:', error);
      }
    }
  }, []);

  // Debounced search - only search if 2+ characters
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 2) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchProducts(trimmed, 6);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150); // 150ms debounce for faster response

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchClick = (query: string) => {
    setSearchTerm(query);
    saveRecentSearch(query);
    // Navigate to all-products with search query
    router.push(`/all-products?search=${encodeURIComponent(query)}`);
  };

  const handleResultClick = (slug: string, query: string) => {
    saveRecentSearch(query);
    router.push(`/product/${slug}`);
  };

  const handleViewAllResults = () => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
      router.push(`/all-products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <BaseDropdown
      isOpen={isOpen}
      navHeight={navHeight}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search input */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, categories..."
                className="w-full bg-[#f3f0ef] border-none px-5 py-3 text-[#5a4c46] placeholder-[#84756f] focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                value={searchTerm}
                onChange={handleSearchInput}
                autoFocus
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5a4c46]"></div>
                ) : (
                  <button
                    className="text-[#5a4c46] focus:outline-none"
                    aria-label="Search"
                    onClick={handleViewAllResults}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Show search results if user has typed something */}
          {showResults && searchTerm.trim().length > 0 ? (
            <div className="mt-6">
              <h3 className="text-[#5a4c46] uppercase text-xs tracking-wider mb-4 font-medium">RESULTS</h3>
              {isSearching ? (
                <div className="text-center py-8 text-[#84756f]">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.slug, searchTerm)}
                        className="group block text-left w-full"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-[#f3f0ef] w-20 h-20 flex items-center justify-center overflow-hidden">
                            <img
                              src={result.image}
                              alt={result.name}
                              className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {result.category && (
                              <p className="text-[#84756f] text-xs truncate">{result.category}</p>
                            )}
                            <h4 className="text-[#5a4c46] text-sm font-medium truncate">{result.name}</h4>
                            <p className="text-[#5a4c46] text-sm mt-1">{result.price}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <button
                      onClick={handleViewAllResults}
                      className="text-[#5a4c46] hover:text-[#91594c] text-sm underline"
                    >
                      View all results
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-[#84756f]">No products found</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Popular searches */}
              <div>
                <h3 className="text-[#5a4c46] uppercase text-xs tracking-wider mb-4 font-medium">POPULAR SEARCHES</h3>
                <ul className="space-y-2">
                  {popularSearches.length > 0 ? (
                    popularSearches.map((search, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleSearchClick(search)}
                          className="text-[#84756f] hover:text-[#5a4c46] text-sm block py-1 text-left w-full"
                        >
                          {search}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-[#84756f] text-sm py-1">Loading...</li>
                  )}
                </ul>
              </div>

              {/* Recent searches */}
              <div>
                <h3 className="text-[#5a4c46] uppercase text-xs tracking-wider mb-4 font-medium">RECENT SEARCHES</h3>
                <ul className="space-y-2">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleSearchClick(search)}
                          className="text-[#84756f] hover:text-[#5a4c46] text-sm block py-1 text-left w-full"
                        >
                          {search}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-[#84756f] text-sm py-1 italic">No recent searches</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseDropdown>
  );
};

export default SearchDropdown;
