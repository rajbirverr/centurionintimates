'use client'

import React, { useState, useEffect } from 'react'
import { getProductAssociations, addManualAssociation, removeAssociation, searchProducts, refreshAutoAssociations, type ProductAssociation } from '@/lib/actions/product-associations'
import { Button, Input } from './ui'
import SafeImage from '@/components/common/SafeImage'

interface ProductAssociationsManagerProps {
    productId: string
}

export default function ProductAssociationsManager({ productId }: ProductAssociationsManagerProps) {
    const [associations, setAssociations] = useState<ProductAssociation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const loadAssociations = async () => {
        try {
            const result = await getProductAssociations(productId)
            if (result.success && result.associations) {
                setAssociations(result.associations)
            }
        } catch (error) {
            console.error('Failed to load associations:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAssociations()
    }, [productId])

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        setSearching(true)
        try {
            const result = await searchProducts(searchQuery, productId)
            if (result.success && result.products) {
                // Filter out already associated products
                const associatedIds = new Set(associations.map(a => a.associated_product_id))
                setSearchResults(result.products.filter((p: any) => !associatedIds.has(p.id)))
            }
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setSearching(false)
        }
    }

    const handleAddStart = async (associatedProductId: string) => {
        try {
            await addManualAssociation(productId, associatedProductId)
            setSearchQuery('')
            setSearchResults([])
            loadAssociations()
        } catch (error) {
            console.error('Failed to add association:', error)
            alert('Failed to add product')
        }
    }

    const handleRemove = async (associationId: string) => {
        if (!confirm('Are you sure you want to remove this association?')) return
        try {
            await removeAssociation(associationId)
            loadAssociations()
        } catch (error) {
            console.error('Failed to remove association:', error)
            alert('Failed to remove association')
        }
    }

    const handleRefreshAuto = async () => {
        setRefreshing(true)
        try {
            await refreshAutoAssociations()
            // Wait a moment for DB to update
            setTimeout(() => {
                loadAssociations()
                setRefreshing(false)
                alert('Auto-associations refreshed!')
            }, 1000)
        } catch (error) {
            console.error('Failed to refresh:', error)
            setRefreshing(false)
            alert('Failed to refresh auto associations')
        }
    }

    return (
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Frequently Bought Together</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshAuto}
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Auto-Associations'}
                </Button>
            </div>

            {/* Search & Add */}
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search products to add..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    />
                    <Button onClick={handleSearch} disabled={searching || !searchQuery}>
                        {searching ? 'Selling...' : 'Search'}
                    </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <ul className="border rounded-md bg-white divide-y">
                        {searchResults.map((product) => (
                            <li key={product.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden">
                                        <SafeImage src={product.images?.[0] || '/placeholder.png'} alt={product.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-500">₹{product.price}</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => handleAddStart(product.id)}>Add</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Existing Associations */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Current Associations</h4>
                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : associations.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No associations found. Add some manually or wait for auto-detection.</p>
                ) : (
                    <ul className="bg-white rounded-md border divide-y">
                        {associations.map((assoc) => (
                            <li key={assoc.id} className="p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden">
                                        <SafeImage
                                            src={assoc.associated_product?.images?.[0] || '/placeholder.png'}
                                            alt={assoc.associated_product?.name || 'Product'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{assoc.associated_product?.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${assoc.type === 'manual'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {assoc.type}
                                            </span>
                                            {assoc.type === 'auto' && (
                                                <span className="text-xs text-gray-500">Score: {assoc.score}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    onClick={() => handleRemove(assoc.id)}
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
