"use client"

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import FilterBar, { FilterState, SORT_OPTIONS } from './FilterBar';
import { supabase } from '@/lib/supabase';

// Define types for our product data
export type Color = {
  name: string;
  code: string;
};

export type Product = {
  id: number | string;
  name: string;
  slug?: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  image: string;
  colors: Color[];
  category?: { id: string; name: string; slug: string } | null;
  isNew?: boolean;
  isSoldOut?: boolean;
  watermark_enabled?: boolean;
  watermark_color?: string;
  watermark_font_size?: number;
  watermark_position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  watermark_text?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "SEAMLESS SCULPT THONG BODYSUIT",
    price: "$68",
    image: "https://skims.imgix.net/s/files/1/0259/5448/4284/products/SKIMS-SHAPEWEAR-BD-THG-3369-IA-SIE_0005_FR.jpg?auto=format&w=2000&h=2000&q=100",
    colors: [
      { name: "Sienna", code: "#b5846b" },
      { name: "Sand", code: "#e4d2d0" },
      { name: "Mica", code: "#cccbce" },
      { name: "Onyx", code: "#403b38" },
    ],
    isNew: true
  },
  {
    id: 2,
    name: "FITS EVERYBODY TRIANGLE BRALETTE",
    price: "$32",
    image: "https://skims.imgix.net/s/files/1/0259/5448/4284/products/SKIMS-SHAPEWEAR-BD-THG-3371-SIE-Fcopy.jpg?auto=format&w=2000&h=2000&q=100",
    colors: [
      { name: "Sienna", code: "#b5846b" },
      { name: "Bone", code: "#e9c3a9" },
      { name: "Cocoa", code: "#926657" },
      { name: "Onyx", code: "#403b38" },
    ]
  },
  {
    id: 3,
    name: "OUTDOOR OPEN BACK BODYSUIT",
    price: "$64",
    image: "https://cdn.shopify.com/s/files/1/0259/5448/4284/files/SKIMS-BODYSUIT-SL-THG-7113W-FWN-FLT.jpg?v=1738608716",
    colors: [
      { name: "Fawn", code: "#b5846b" },
      { name: "Clay", code: "#d4a591" },
      { name: "Cocoa", code: "#926657" },
      { name: "Onyx", code: "#403b38" },
    ]
  },
  {
    id: 4,
    name: "WEIGHTLESS DEMI BRA",
    price: "$58",
    image: "https://skims.imgix.net/s/files/1/0259/5448/4284/products/SKIMS-BRA-BR-DEM-1893-BRZ-F.jpg?auto=format&w=2000&h=2000&q=100",
    colors: [
      { name: "Bronze", code: "#b5846b" },
      { name: "Bone", code: "#e9c3a9" },
      { name: "Cocoa", code: "#926657" },
      { name: "Onyx", code: "#403b38" },
    ],
    isSoldOut: true
  },
  {
    id: 5,
    name: "SKIMS BODY UNLINED PLUNGE THONG BODYSUIT",
    price: "$62",
    image: "https://skims.imgix.net/s/files/1/0259/5448/4284/files/SKIMS-BODYSUIT-BD-THG-3286-CLY_4d6570a7-c852-45da-a8db-ce9eeb4d2965.jpg?auto=format&w=2000&h=2000&q=100",
    colors: [
      { name: "Clay", code: "#d4a591" },
      { name: "Bone", code: "#e9c3a9" },
      { name: "Cocoa", code: "#926657" },
      { name: "Onyx", code: "#403b38" },
    ],
    isNew: true
  },
  {
    id: 6,
    name: "SEAMLESS SCULPT THONG BODYSUIT",
    price: "$68",
    image: "https://skims.imgix.net/s/files/1/0259/5448/4284/products/SKIMS-SHAPEWEAR-SH-BST-0200-SND_f35a2958-4278-4b2f-a8b4-9366b22f310b.jpg?auto=format&w=2000&h=2000&q=100",
    colors: [
      { name: "Sand", code: "#e4d2d0" },
      { name: "Sienna", code: "#b5846b" },
      { name: "Mica", code: "#cccbce" },
      { name: "Onyx", code: "#403b38" },
    ]
  },
  {
    id: 7,
    name: "SEAMLESS SCULPT LOW BACK THONG BODYSUIT",
    price: "$68",
    image: "https://skims.imgix.net/s/files/1/0259/5448/4284/products/SKIMS-SHAPEWEAR-BD-THG-3371-SAND-Fcopy.jpg?auto=format&w=2000&h=2000&q=100",
    colors: [
      { name: "Sand", code: "#e4d2d0" },
      { name: "Sienna", code: "#b5846b" },
      { name: "Cocoa", code: "#926657" },
      { name: "Onyx", code: "#403b38" },
    ]
  },
  {
    id: 8,
    name: "SEAMLESS SCULPT LACE THONG BODYSUIT",
    price: "$72",
    image: "https://skims.imgix.net/s/files/1/0259/5448/4284/files/BD-THG-6223W-ONX-NA-SKIMS-SHAPEWEAR_0047-SD.jpg?auto=format&w=2000&h=2000&q=100",
    colors: [
      { name: "Onyx", code: "#403b38" },
      { name: "Cocoa", code: "#926657" },
      { name: "Sienna", code: "#b5846b" },
      { name: "Sand", code: "#e4d2d0" },
    ],
    isNew: true
  }
];

// Helper function to get price as a number (handles ₹ and $)
const getPriceNumber = (priceString: string): number => {
  const cleaned = priceString.replace(/[₹$,]/g, '');
  return parseFloat(cleaned) || 0;
};

interface ProductGridProps {
  products?: Product[];
  filterConfigs?: unknown[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products: productsProp = []
}) => {
  // Use provided products, don't fallback to hardcoded products
  // This ensures we show empty state when no products from DB
  const productsToUse = productsProp;
  
  const [wishlist, setWishlist] = useState<(number | string)[]>([]);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsToUse);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    productType: [],
    color: [],
    price: [],
    size: [],
    sort: SORT_OPTIONS.FEATURED
  });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is logged in and sync wishlist
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // User is logged in - sync localStorage to database and load from database
        setIsSyncing(true);
        try {
          const { getWishlistItems, syncWishlistFromLocalStorage } = await import('@/lib/actions/wishlist');
          
          // Get localStorage wishlist
          const savedWishlist = localStorage.getItem('skims-wishlist');
          const localWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
          
          // Sync localStorage to database if there are items
          if (localWishlist.length > 0) {
            await syncWishlistFromLocalStorage(localWishlist.map((id: any) => String(id)));
          }
          
          // Load from database
          const result = await getWishlistItems();
          if (result.success && result.items) {
            const dbWishlist = result.items.map(item => item.product_id);
            setWishlist(dbWishlist);
            // Update localStorage to match database
            localStorage.setItem('skims-wishlist', JSON.stringify(dbWishlist));
          }
        } catch (error) {
          console.error('Error syncing wishlist:', error);
          // Fallback to localStorage
          const savedWishlist = localStorage.getItem('skims-wishlist');
          if (savedWishlist) {
            try {
              const parsed = JSON.parse(savedWishlist);
              if (Array.isArray(parsed)) {
                setWishlist(parsed);
              }
            } catch (e) {
              console.error('Error parsing wishlist from localStorage:', e);
            }
          }
        } finally {
          setIsSyncing(false);
        }
      } else {
        // User not logged in - use localStorage only
        const savedWishlist = localStorage.getItem('skims-wishlist');
        if (savedWishlist) {
          try {
            const parsed = JSON.parse(savedWishlist);
            if (Array.isArray(parsed)) {
              setWishlist(parsed);
            }
          } catch (error) {
            console.error('Error parsing wishlist from localStorage:', error);
          }
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      
      if (loggedIn && event === 'SIGNED_IN') {
        // User just logged in - sync wishlist
        setIsSyncing(true);
        try {
          const { getWishlistItems, syncWishlistFromLocalStorage } = await import('@/lib/actions/wishlist');
          
          const savedWishlist = localStorage.getItem('skims-wishlist');
          const localWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
          
          if (localWishlist.length > 0) {
            await syncWishlistFromLocalStorage(localWishlist.map((id: any) => String(id)));
          }
          
          const result = await getWishlistItems();
          if (result.success && result.items) {
            const dbWishlist = result.items.map(item => item.product_id);
            setWishlist(dbWishlist);
            localStorage.setItem('skims-wishlist', JSON.stringify(dbWishlist));
          }
        } catch (error) {
          console.error('Error syncing wishlist on login:', error);
        } finally {
          setIsSyncing(false);
        }
      } else if (!loggedIn && event === 'SIGNED_OUT') {
        // User logged out - keep localStorage wishlist
        const savedWishlist = localStorage.getItem('skims-wishlist');
        if (savedWishlist) {
          try {
            const parsed = JSON.parse(savedWishlist);
            if (Array.isArray(parsed)) {
              setWishlist(parsed);
            }
          } catch (error) {
            console.error('Error parsing wishlist from localStorage:', error);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save wishlist to localStorage and database whenever it changes
  useEffect(() => {
    localStorage.setItem('skims-wishlist', JSON.stringify(wishlist));
    
    // If logged in, also save to database
    if (isLoggedIn && !isSyncing) {
      const syncToDatabase = async () => {
        try {
          const { addToWishlist, removeFromWishlist, getWishlistItems } = await import('@/lib/actions/wishlist');
          
          // Get current database wishlist
          const dbResult = await getWishlistItems();
          const dbWishlist = dbResult.success && dbResult.items 
            ? dbResult.items.map(item => item.product_id)
            : [];
          
          // Find items to add and remove
          const toAdd = wishlist.filter(id => !dbWishlist.includes(String(id)));
          const toRemove = dbWishlist.filter(id => !wishlist.includes(id));
          
          // Add new items
          for (const productId of toAdd) {
            await addToWishlist(String(productId));
          }
          
          // Remove items
          for (const productId of toRemove) {
            await removeFromWishlist(String(productId));
          }
        } catch (error) {
          console.error('Error syncing wishlist to database:', error);
        }
      };
      
      syncToDatabase();
    }
  }, [wishlist, isLoggedIn, isSyncing]);

  // Initialize filtered products when products prop changes
  useEffect(() => {
    if (productsToUse.length > 0) {
      setFilteredProducts([...productsToUse]);
    }
  }, [productsToUse.length]);

  // Apply filters and sort products
  useEffect(() => {
    console.log('=== APPLYING FILTERS AND SORTING ===');
    console.log('Active filters:', activeFilters);
    console.log('Products to filter:', productsToUse.length);

    // 1. First, filter the products
    let filtered = [...productsToUse];

    // Filter by product type (using category data)
    if (activeFilters.productType.length > 0) {
      filtered = filtered.filter(product =>
        activeFilters.productType.some(type => {
          const productCategoryName = product.category?.name || '';
          const productCategorySlug = product.category?.slug || '';
          return productCategoryName.toLowerCase().includes(type.toLowerCase()) ||
                 productCategorySlug.toLowerCase().includes(type.toLowerCase());
        })
      );
    }

    // Filter by color
    if (activeFilters.color.length > 0) {
      filtered = filtered.filter(product =>
        (product.colors || []).some(color =>
          activeFilters.color.includes(color.name)
        )
      );
    }

    // Filter by price (handles both ₹ and $)
    if (activeFilters.price.length > 0) {
      filtered = filtered.filter(product => {
        const price = getPriceNumber(product.price);

        return activeFilters.price.some(range => {
          // Handle both dollar and rupee ranges
          if (range.includes('Under') || range.includes('under')) {
            const maxPrice = range.includes('$50') ? 3750 : (range.includes('₹3,750') ? 3750 : 3750);
            return price < maxPrice;
          }
          if (range.includes('$50 - $100') || range.includes('₹3,750 - ₹7,500')) {
            return price >= 3750 && price <= 7500;
          }
          if (range.includes('$100 - $150') || range.includes('₹7,500 - ₹11,250')) {
            return price > 7500 && price <= 11250;
          }
          if (range.includes('Over') || range.includes('over')) {
            const minPrice = range.includes('$150') ? 11250 : (range.includes('₹11,250') ? 11250 : 11250);
            return price > minPrice;
          }
          return false;
        });
      });
    }

    // 2. Then, apply sorting
    console.log('Currently using sort option:', activeFilters.sort);

    // Create a copy to avoid mutating filtered array
    const sortedProducts = [...filtered];

    switch (activeFilters.sort) {
      case SORT_OPTIONS.PRICE_LOW_TO_HIGH:
        console.log('Sorting by price: Low to High');
        sortedProducts.sort((a, b) =>
          getPriceNumber(a.price) - getPriceNumber(b.price)
        );
        break;

      case SORT_OPTIONS.PRICE_HIGH_TO_LOW:
        console.log('Sorting by price: High to Low');
        sortedProducts.sort((a, b) =>
          getPriceNumber(b.price) - getPriceNumber(a.price)
        );
        break;

      case SORT_OPTIONS.NEWEST:
        console.log('Sorting by newest');
        sortedProducts.sort((a, b) => {
          // Sort new items first
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;

      case SORT_OPTIONS.FEATURED:
      default:
        console.log('Using default sorting (Featured)');
        // No sorting for featured - use default product order
        break;
    }

    // Log the sorting results for debugging
    console.log('Sorted product prices:', sortedProducts.map(p => `${p.name}: ${p.price}`));

    // Update state with sorted products
    setFilteredProducts(sortedProducts);

  }, [activeFilters, productsToUse]);

  const handleToggleWishlist = (productId: number | string) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.includes(productId)) {
        // Remove from wishlist
        setToastMessage('Removed from wishlist');
        setShowWishlistToast(true);
        return prevWishlist.filter(id => id !== productId);
      } else {
        // Add to wishlist
        setToastMessage('Added to wishlist');
        setShowWishlistToast(true);
        return [...prevWishlist, productId];
      }
    });

    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // Hide toast after 2 seconds - store timeout for cleanup
    toastTimeoutRef.current = setTimeout(() => {
      setShowWishlistToast(false);
      toastTimeoutRef.current = null;
    }, 2000);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    console.log('Filter/sort change received:', filters);

    // Create a new object to ensure React detects the change
    const newFilters = { ...filters };

    // Update the state with the new filters
    setActiveFilters(newFilters);
  };

  return (
    <div className="product-grid relative">
      {/* Filter Bar */}
      <FilterBar
        totalProducts={filteredProducts.length}
        onFilterChange={handleFilterChange}
        initialFilters={activeFilters}
      />

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[3px] md:gap-x-1.5 gap-y-8 md:gap-y-16">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No products match your filters. Try adjusting your selection.</p>
          </div>
        )}
      </div>

      {/* Wishlist toast notification */}
      <div
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white py-2 px-4 rounded-full text-sm transition-opacity duration-300 z-50 ${
          showWishlistToast ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
};

export default ProductGrid;


