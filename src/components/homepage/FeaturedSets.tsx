'use client'
// Layout Fix Version 3 - Interactive & Restored

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import StylizedTitle from '@/components/common/StylizedTitle'
import ViewToggle from '@/components/common/ViewToggle'
import { getHomepageSetsData, getProductsForFilter, getProductsByCategorySlug, getAllProductsForSets, type HomepageSetsFilter } from '@/lib/actions/homepage-sets'

// Default values outside component to avoid recreating on each render
const defaultSection = {
    id: 'default',
    title: 'Just for you - we have sets',
    button_text: 'SHOP BEST SETS',
    button_link: '/all-products',
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}

const defaultFilters: HomepageSetsFilter[] = [
    {
        id: 'default-1',
        label: 'SETS',
        category_slug: 'sets',
        link_url: '/all-products?category=sets',
        display_order: 1,
        is_enabled: true,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'default-2',
        label: 'CURATED COMBOS',
        link_url: '/all-products',
        display_order: 2,
        is_enabled: true,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'default-3',
        label: 'MATCHING SETS',
        link_url: '/all-products',
        display_order: 3,
        is_enabled: true,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

interface FeaturedSetsSectionProps {
    initialData?: {
        section: typeof defaultSection | null
        filters: HomepageSetsFilter[]
        products: any[]
    } | null
}

// Simple Rhode-style title - no animation, solid light brown text
const InteractiveTitle = ({ section }: { section: any }) => {
    // Split "Just for you - we have sets" or use full title if no separator
    const [mainTitle, subTitle] = section.title.includes(' - ')
        ? section.title.split(' - ')
        : [section.title, ''];

    return (
        <div className="flex flex-col items-center">
            <StylizedTitle
                text={mainTitle}
                className="text-[#583432] text-2xl md:text-4xl font-black italic mb-2 tracking-wider"
                style={{ fontFamily: 'var(--font-montserrat)' }}
            />
            {subTitle && (
                <p
                    className="text-[#8B7355] text-lg md:text-xl tracking-wide mb-6"
                    style={{ fontFamily: 'var(--font-audiowide)' }}
                >
                    {subTitle}
                </p>
            )}
            {!subTitle && <div className="mb-6" />}
        </div>
    )
}

// Helper function to ensure image URL is absolute
const getAbsoluteImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }
    // If relative URL starting with /, make it absolute using current origin
    if (url.startsWith('/')) {
        return typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
    }
    return url
}



export default function FeaturedSets({ initialData }: FeaturedSetsSectionProps) {
    const [data, setData] = useState<any>(initialData || null)
    const [loading, setLoading] = useState(!initialData)
    const [activeFilterId, setActiveFilterId] = useState<string | null>(null)
    const [products, setProducts] = useState<any[]>(initialData?.products || [])
    const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
    const [isSingleView, setIsSingleView] = useState(false)

    // Use database data or defaults
    const section = useMemo(() => data?.section || defaultSection, [data?.section])
    const filters = useMemo(() => {
        return (data?.filters && data.filters.length > 0) ? data.filters : defaultFilters
    }, [data?.filters])

    // Load initial data only if not provided as prop
    useEffect(() => {
        if (initialData) {
            // Set active filter from initial data
            if (initialData.filters && initialData.filters.length > 0) {
                const defaultFilter = initialData.filters.find((f: HomepageSetsFilter) => f.is_default) || initialData.filters[0]
                setActiveFilterId(defaultFilter.id)
            }
            return
        }

        const loadData = async () => {
            try {
                const result = await getHomepageSetsData()
                setData(result)
                if (result.filters && result.filters.length > 0) {
                    const defaultFilter = result.filters.find((f: HomepageSetsFilter) => f.is_default) || result.filters[0]
                    setActiveFilterId(defaultFilter.id)
                    setProducts(result.products || [])
                }
            } catch (error) {
                console.error('Error loading homepage sets:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [initialData])

    // Set default filter and load products when data is ready
    useEffect(() => {
        if (!loading && filters.length > 0 && !activeFilterId) {
            const defaultFilter = filters.find((f: HomepageSetsFilter) => f.is_default) || filters[0]
            setActiveFilterId(defaultFilter.id)

            // Use products from data if available, otherwise load them
            if (data?.products && data.products.length > 0) {
                setProducts(data.products)
            } else if (!defaultFilter.id.startsWith('default-')) {
                // For database filters, use the server action
                getProductsForFilter(defaultFilter.id).then(setProducts).catch(console.error)
            } else {
                // For default filters, load products based on category
                if (defaultFilter.category_slug) {
                    getProductsByCategorySlug(defaultFilter.category_slug).then(setProducts).catch(console.error)
                } else {
                    getAllProductsForSets().then(setProducts).catch(console.error)
                }
            }
        }
    }, [loading, filters, activeFilterId, data])

    const handleFilterClick = async (filter: HomepageSetsFilter) => {
        setActiveFilterId(filter.id)

        // For database filters, use the server action
        if (!filter.id.startsWith('default-')) {
            try {
                const filterProducts = await getProductsForFilter(filter.id)
                setProducts(filterProducts)
            } catch (error) {
                console.error('Error loading filter products:', error)
                setProducts([])
            }
        } else {
            // For default filters, use category slug or all products
            try {
                if (filter.category_slug) {
                    const categoryProducts = await getProductsByCategorySlug(filter.category_slug)
                    setProducts(categoryProducts)
                } else {
                    const allProducts = await getAllProductsForSets()
                    setProducts(allProducts)
                }
            } catch (error) {
                console.error('Error loading filter products:', error)
                setProducts([])
            }
        }
    }

    // Early returns after all hooks
    if (loading) {
        return null // Don't show while loading
    }

    // Don't show if explicitly disabled
    if (data?.section && !data.section.is_enabled) {
        return null
    }

    // If no filters, don't show
    if (filters.length === 0) {
        return null
    }

    return (
        <section
            className="w-full bg-white mb-16"
        // ...
        >
            <div className="px-4 md:px-8 lg:px-12">
                <div className="max-w-[1440px] mx-auto">
                    {/* Title - Above the background */}
                    <div className="text-center mb-2 relative">
                        <InteractiveTitle section={section} />

                        {/* Toggle Button - Visible on all screens */}
                        <div className="mt-4 flex justify-center relative z-10">
                            <ViewToggle isSingleView={isSingleView} onToggle={() => setIsSingleView(!isSingleView)} />
                        </div>
                    </div>

                    {/* Main Cream Card Container */}
                    <div className="bg-[#FAF9F7] rounded-2xl overflow-hidden">

                        {/* Filters Section */}
                        <div className="px-4 md:px-8 pt-4 pb-6 md:pt-6 md:pb-8">
                            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                                {filters.map((filter: HomepageSetsFilter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => handleFilterClick(filter)}
                                        className={`
                                            px-5 py-2.5 rounded-full text-sm font-bold tracking-wide
                                            transition-all duration-300 ease-out
                                            ${activeFilterId === filter.id
                                                ? 'bg-[#E8E4DE] text-[#5C4D3C] shadow-sm'
                                                : 'bg-transparent text-[#8B7355] hover:bg-[#F5F3F0] hover:text-[#5C4D3C]'
                                            }
                                        `}
                                        style={{ fontFamily: 'var(--font-manrope)' }}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="px-4 md:px-8 py-6 md:py-8 border-t border-black/5">

                            {/* Products Grid - EXACT Honeylove layout */}
                            {products.length > 0 ? (
                                <div className={`grid ${isSingleView ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'} gap-5 mb-4 md:mb-6 transition-all duration-300`}>
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex flex-col justify-between items-start"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                            }}
                                        >
                                            <div className="flex flex-col justify-between items-start w-full grow">
                                                <div className="flex flex-col justify-start items-start w-full">
                                                    {/* Product Image - Conditional Aspect Ratio */}
                                                    <div className={`relative box-border w-full mb-4 overflow-hidden bg-white rounded-2xl transition-all duration-300 ${isSingleView ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
                                                        {(() => {
                                                            const imageUrl = getAbsoluteImageUrl(product.image_url)
                                                            return imageUrl ? (
                                                                <img
                                                                    key={imageUrl}
                                                                    src={imageUrl}
                                                                    alt={product.name}
                                                                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        console.error('Image failed to load:', imageUrl);
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                                                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )
                                                        })()}
                                                    </div>

                                                    {/* Product Info - EXACT Honeylove structure */}
                                                    <div className="text-left w-full">
                                                        {/* Category Name - ABOVE product name */}
                                                        {product.category && (
                                                            <p className="text-xs md:text-sm text-[#8B7355] uppercase tracking-[0.15em] mb-1 font-light" style={{ fontFamily: 'var(--font-manrope)' }}>
                                                                {product.category.name}
                                                            </p>
                                                        )}

                                                        {/* Product Name */}
                                                        <div className="mb-2">
                                                            <h4 className="text-sm font-light text-[#5C4D3C] tracking-wide" style={{ fontFamily: 'var(--font-manrope)' }}>
                                                                {expandedProductId === product.id ? (
                                                                    <Link
                                                                        href={`/product/${product.slug}`}
                                                                        className="inline-block"
                                                                    >
                                                                        {product.name}
                                                                    </Link>
                                                                ) : (
                                                                    <>
                                                                        <Link
                                                                            href={`/product/${product.slug}`}
                                                                            className="inline-block"
                                                                        >
                                                                            {product.name.split(' ').slice(0, 4).join(' ')}
                                                                            {product.name.split(' ').length > 4 && '...'}
                                                                        </Link>
                                                                        {product.name.split(' ').length > 4 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault()
                                                                                    e.stopPropagation()
                                                                                    setExpandedProductId(product.id)
                                                                                }}
                                                                                className="block text-xs text-[#5a4c46]/50 hover:text-[#5a4c46] mt-0.5 font-light"
                                                                                style={{ fontFamily: 'var(--font-manrope)' }}
                                                                            >
                                                                                more
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </h4>
                                                        </div>

                                                        {/* Price */}
                                                        <p className="text-base text-[#403b38] font-light mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>
                                                            ₹{product.price.toLocaleString('en-IN')}
                                                        </p>

                                                        {/* Color Swatches */}
                                                        {product.colors && product.colors.length > 0 && (
                                                            <div className="flex items-center gap-1.5 mb-3">
                                                                {product.colors.slice(0, 6).map((color: any, index: number) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        className="w-3 h-3 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                                                                        style={{ backgroundColor: color.code || '#ccc' }}
                                                                        title={color.name}
                                                                        aria-label={`Color: ${color.name}`}
                                                                    />
                                                                ))}
                                                                {product.colors.length > 6 && (
                                                                    <span className="text-[13px] text-[#757575] pt-2">+{product.colors.length - 6}</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Shop Link */}
                                                        <Link
                                                            href={`/product/${product.slug}`}
                                                            className="inline-block text-base font-normal text-[#403b38] hover:underline"
                                                            style={{ fontFamily: 'var(--font-manrope)' }}
                                                        >
                                                            Shop
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4 md:px-6 lg:px-8">
                                    <p className="text-[#2B2B2B]/60">No products found for this filter.</p>
                                </div>
                            )}

                            {/* Button - EXACT Honeylove link style */}
                            <div className="flex justify-center">
                                <Link
                                    href={section?.button_link || '/all-products'}
                                    className="w-full max-w-[180px] py-2 px-4 bg-white text-[#5a4c46] text-[11px] uppercase tracking-[0.2em] font-light border border-[#ddd] shadow-sm hover:bg-transparent hover:border-[#5a4c46] hover:text-[#5a4c46] transition-all duration-200 mx-auto block text-center"
                                    style={{ fontFamily: 'var(--font-manrope)' }}
                                >
                                    SHOP BEST SETS
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}
