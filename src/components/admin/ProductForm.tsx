'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct, type Product, type CreateProductData, type UpdateProductData } from '@/lib/actions/products'
import { getAllCategories, getSubcategoriesByCategoryId, type Category, type Subcategory } from '@/lib/actions/categories'
import ImageUpload from './ImageUpload'
import { Button, Input } from './ui'

interface ProductFormProps {
  product?: Product
  initialImages?: Array<{
    id: string
    product_id: string
    image_url: string
    alt_text?: string
    sort_order: number
    is_primary: boolean
    created_at: string
  }>
}

export default function ProductForm({ product, initialImages = [] }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  const [formData, setFormData] = useState<CreateProductData>({
    sku: product?.sku || '',
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price || 0,
    compare_price: product?.compare_price || undefined,
    category_id: product?.category_id || '',
    subcategory_id: product?.subcategory_id || '',
    inventory_count: product?.inventory_count || 0,
    status: product?.status || 'draft',
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || '',
    seo_keywords: product?.seo_keywords || [],
    weight_grams: product?.weight_grams || undefined,
    dimensions: product?.dimensions || '',
    watermark_enabled: product?.watermark_enabled ?? true,
    watermark_color: product?.watermark_color || undefined,
    watermark_font_size: product?.watermark_font_size || undefined,
    watermark_position: product?.watermark_position || undefined,
    watermark_text: product?.watermark_text || undefined
  })

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getAllCategories()
      setCategories(data)
    }
    loadCategories()
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (formData.category_id) {
        const data = await getSubcategoriesByCategoryId(formData.category_id)
        setSubcategories(data)
        // Reset subcategory_id if current selection is not valid for new category
        if (formData.subcategory_id && !data.find(s => s.id === formData.subcategory_id)) {
          setFormData(prev => ({ ...prev, subcategory_id: '' }))
        }
      } else {
        setSubcategories([])
        setFormData(prev => ({ ...prev, subcategory_id: '' }))
      }
    }
    loadSubcategories()
  }, [formData.category_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (product) {
        result = await updateProduct({
          id: product.id,
          ...formData
        })
      } else {
        result = await createProduct(formData)
      }

      if (result.success) {
        router.push('/admin/products')
        router.refresh()
      } else {
        setError(result.error || 'Failed to save product')
      }
    } catch (err: any) {
      console.error('Error saving product:', err)
      setError(err.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleSlugGenerate = () => {
    if (!formData.name) return
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData({ ...formData, slug })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="SKU"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          required
        />

        <div className="md:col-span-2">
          <div className="flex gap-2">
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="flex-1"
            />
            <button
              type="button"
              onClick={handleSlugGenerate}
              className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category_id"
            value={formData.category_id || ''}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value || undefined, subcategory_id: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            aria-label="Select product category"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subcategory_id" className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <select
            id="subcategory_id"
            value={formData.subcategory_id || ''}
            onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            aria-label="Select product subcategory"
            disabled={!formData.category_id}
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          {!formData.category_id && (
            <p className="mt-1 text-xs text-gray-500">Please select a category first</p>
          )}
          {formData.category_id && subcategories.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">No subcategories available for this category</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compare Price (₹)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.compare_price || ''}
            onChange={(e) => setFormData({ ...formData, compare_price: e.target.value ? parseFloat(e.target.value) : undefined })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inventory Count
          </label>
          <Input
            type="number"
            min="0"
            value={formData.inventory_count || ''}
            onChange={(e) => setFormData({ ...formData, inventory_count: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            aria-label="Select product status"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <textarea
            id="short_description"
            value={formData.short_description || ''}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Brief product description"
            aria-label="Short product description"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Full product description"
            aria-label="Full product description"
          />
        </div>

        <div className="md:col-span-2 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
        </div>

        <div className="md:col-span-2">
          <Input
            label="SEO Title"
            value={formData.seo_title || ''}
            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-1">
            SEO Description
          </label>
          <textarea
            id="seo_description"
            value={formData.seo_description || ''}
            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="SEO meta description"
            aria-label="SEO meta description"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Keywords (comma-separated)
          </label>
          <Input
            value={formData.seo_keywords?.join(', ') || ''}
            onChange={(e) => setFormData({
              ...formData,
              seo_keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
            })}
          />
        </div>

        <div className="md:col-span-2 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="watermark_enabled"
                checked={formData.watermark_enabled ?? true}
                onChange={(e) => setFormData({ ...formData, watermark_enabled: e.target.checked })}
                className="w-4 h-4 text-[#5a4c46] border-gray-300 rounded focus:ring-[#5a4c46] focus:ring-2"
              />
              <label htmlFor="watermark_enabled" className="ml-2 text-sm font-medium text-gray-700">
                Enable watermark on product images
              </label>
            </div>

            {formData.watermark_enabled !== false && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="watermark_text" className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Text (optional - uses "CENTURION" if not set)
                  </label>
                  <input
                    type="text"
                    id="watermark_text"
                    value={formData.watermark_text || ''}
                    onChange={(e) => setFormData({ ...formData, watermark_text: e.target.value.trim() || undefined })}
                    placeholder="CENTURION"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                  />
                </div>

                <div>
                  <label htmlFor="watermark_color" className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Color (optional - uses global color if not set)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="watermark_color"
                      value={formData.watermark_color || '#784D2C'}
                      onChange={(e) => setFormData({ ...formData, watermark_color: e.target.value || undefined })}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.watermark_color || ''}
                      onChange={(e) => {
                        const value = e.target.value.trim()
                        setFormData({ ...formData, watermark_color: value || undefined })
                      }}
                      placeholder="Hex color (e.g., #784D2C) or leave empty for global color"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                    />
                    {formData.watermark_color && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, watermark_color: undefined })}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="watermark_font_size" className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Font Size (px) - Leave empty for default (32px)
                  </label>
                  <input
                    type="number"
                    id="watermark_font_size"
                    min="12"
                    max="200"
                    value={formData.watermark_font_size || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      setFormData({ ...formData, watermark_font_size: value ? parseInt(value) : undefined })
                    }}
                    placeholder="32"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                  />
                  {formData.watermark_font_size && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, watermark_font_size: undefined })}
                      className="mt-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor="watermark_position" className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Position
                  </label>
                  <select
                    id="watermark_position"
                    value={formData.watermark_position || ''}
                    onChange={(e) => {
                      const value = e.target.value || undefined
                      setFormData({ ...formData, watermark_position: value as any })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                  >
                    <option value="">Default (Bottom Center)</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                  {formData.watermark_position && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, watermark_position: undefined })}
                      className="mt-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {product && (
          <div className="md:col-span-2 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            <ImageUpload
              productId={product.id}
              initialImages={initialImages}
              productName={formData.name}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={loading}
          disabled={loading}
        >
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}

