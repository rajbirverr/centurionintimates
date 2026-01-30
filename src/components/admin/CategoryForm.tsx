'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  createCategory,
  updateCategory,
  uploadCategoryImageToStorage,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData,
  type Subcategory,
  type CreateSubcategoryData,
  type UpdateSubcategoryData
} from '@/lib/actions/categories'
import { Button, Input } from './ui'

interface CategoryFormProps {
  category?: Category
  initialSubcategories?: Subcategory[]
}

export default function CategoryForm({ category, initialSubcategories = [] }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(category?.image_url || null)
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('url')
  const [urlInput, setUrlInput] = useState(category?.image_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories)
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null)
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false)
  const [subcategoryUploading, setSubcategoryUploading] = useState(false)
  const [subcategoryInputMode, setSubcategoryInputMode] = useState<'upload' | 'url'>('url')
  const [subcategoryPreviewUrl, setSubcategoryPreviewUrl] = useState<string | null>(null)
  const [subcategoryUrlInput, setSubcategoryUrlInput] = useState('')
  const subcategoryFileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CreateCategoryData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    sort_order: category?.sort_order || 0
  })

  const [subcategoryForm, setSubcategoryForm] = useState<CreateSubcategoryData>({
    category_id: category?.id || '',
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: subcategories.length
  })

  useEffect(() => {
    if (category?.id) {
      setSubcategoryForm(prev => ({ ...prev, category_id: category.id }))
    }
  }, [category?.id])

  useEffect(() => {
    setSubcategories(initialSubcategories)
  }, [initialSubcategories])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB. For larger images, use "Enter URL" mode instead.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Auto-SEO: Rename file
    const brand = 'centurionintimate'
    // Use current slug or generate from name
    const slug = formData.slug.trim() || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const fileExt = file.name.split('.').pop() || 'jpg'
    const seoFilename = `${brand}-${slug}.${fileExt}`

    // Create new file with SEO name
    const seoFile = new File([file], seoFilename, { type: file.type })

    // Upload file
    setUploading(true)
    // Pass the renamed file
    const result = await uploadCategoryImageToStorage(seoFile)
    setUploading(false)

    if (result.success && result.url) {
      setFormData({ ...formData, image_url: result.url })
      setUrlInput(result.url)
    } else {
      setError(result.error || 'Failed to upload image')
      setPreviewUrl(null)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setUrlInput(url)
    setFormData({ ...formData, image_url: url })
    if (url) {
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (category) {
        result = await updateCategory({
          id: category.id,
          ...formData
        })
      } else {
        result = await createCategory(formData)
      }

      if (result.success) {
        router.push('/admin/categories')
        router.refresh()
      } else {
        setError(result.error || 'Failed to save category')
      }
    } catch (err: any) {
      console.error('Error saving category:', err)
      setError(err.message || 'Failed to save category')
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

  const handleSubcategorySlugGenerate = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setSubcategoryForm({ ...subcategoryForm, slug })
  }

  const handleAddSubcategory = () => {
    if (!category?.id) {
      setError('Please save the category first before adding subcategories')
      return
    }
    setSubcategoryForm({
      category_id: category.id,
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: subcategories.length
    })
    setEditingSubcategoryId(null)
    setShowSubcategoryForm(true)
    setSubcategoryPreviewUrl(null)
    setSubcategoryUrlInput('')
    setSubcategoryInputMode('url')
  }

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSubcategoryForm({
      category_id: subcategory.category_id || category?.id || '',
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || '',
      image_url: subcategory.image_url || '',
      display_order: subcategory.display_order
    })
    setEditingSubcategoryId(subcategory.id)
    setShowSubcategoryForm(true)
    setSubcategoryPreviewUrl(subcategory.image_url || null)
    setSubcategoryUrlInput(subcategory.image_url || '')
    setSubcategoryInputMode(subcategory.image_url ? 'url' : 'url')
  }

  const handleSaveSubcategory = async () => {
    if (!subcategoryForm.name || !subcategoryForm.slug) {
      setError('Name and slug are required')
      return
    }

    try {
      let result
      if (editingSubcategoryId) {
        result = await updateSubcategory({
          id: editingSubcategoryId,
          ...subcategoryForm
        })
      } else {
        result = await createSubcategory(subcategoryForm)
      }

      if (result.success) {
        // Refresh the page to get updated subcategories
        router.refresh()
        setShowSubcategoryForm(false)
        setEditingSubcategoryId(null)
        setSubcategoryForm({
          category_id: category?.id || '',
          name: '',
          slug: '',
          description: '',
          image_url: '',
          display_order: subcategories.length
        })
        setSubcategoryPreviewUrl(null)
        setSubcategoryUrlInput('')
        setSubcategoryInputMode('url')
        setError(null)
      } else {
        setError(result.error || 'Failed to save subcategory')
      }
    } catch (err: any) {
      console.error('Error saving subcategory:', err)
      setError(err.message || 'Failed to save subcategory')
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return
    }

    try {
      const result = await deleteSubcategory(id)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Failed to delete subcategory')
      }
    } catch (err: any) {
      console.error('Error deleting subcategory:', err)
      setError(err.message || 'Failed to delete subcategory')
    }
  }

  const handleSubcategoryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB. For larger images, use "Enter URL" mode instead.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setSubcategoryPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Auto-SEO: Rename subcategory file
    const brand = 'centurionintimate'
    // Use subcategory slug/name. If empty, fallback to timestamp
    const slug = subcategoryForm.slug.trim() || subcategoryForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `subcat-${Date.now()}`
    const fileExt = file.name.split('.').pop() || 'jpg'
    const seoFilename = `${brand}-${slug}.${fileExt}`

    const seoFile = new File([file], seoFilename, { type: file.type })

    // Upload file
    setSubcategoryUploading(true)
    const result = await uploadCategoryImageToStorage(seoFile)
    setSubcategoryUploading(false)

    if (result.success && result.url) {
      setSubcategoryForm(prev => ({ ...prev, image_url: result.url! }))
      setSubcategoryUrlInput(result.url)
    } else {
      setError(result.error || 'Failed to upload image')
      setSubcategoryPreviewUrl(null)
    }
  }

  const handleSubcategoryUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setSubcategoryUrlInput(url)
    setSubcategoryForm(prev => ({ ...prev, image_url: url }))
    if (url) {
      setSubcategoryPreviewUrl(url)
    } else {
      setSubcategoryPreviewUrl(null)
    }
  }

  const handleCancelSubcategory = () => {
    setShowSubcategoryForm(false)
    setEditingSubcategoryId(null)
    setSubcategoryForm({
      category_id: category?.id || '',
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: subcategories.length
    })
    setSubcategoryPreviewUrl(null)
    setSubcategoryUrlInput('')
    setSubcategoryInputMode('url')
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
          label="Category Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

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

        <div className="md:col-span-2">
          <label htmlFor="category_description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="category_description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
            placeholder="Category description"
            aria-label="Category description"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${inputMode === 'upload'
                  ? 'bg-[#5a4c46] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${inputMode === 'url'
                  ? 'bg-[#5a4c46] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Enter URL
            </button>
          </div>

          {/* Upload Mode */}
          {inputMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {uploading ? 'Uploading...' : 'Choose Image File'}
              </button>
            </div>
          )}

          {/* URL Mode */}
          {inputMode === 'url' && (
            <Input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              helperText="Enter image URL"
            />
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="w-full max-w-xs aspect-[3/4] overflow-hidden rounded-md border border-gray-300 bg-gray-100">
                <img
                  src={previewUrl}
                  alt="Category preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label="Sort Order"
          type="number"
          value={formData.sort_order || 0}
          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
          helperText="Lower numbers appear first"
        />
      </div>

      {/* Subcategories Section - Only show when editing existing category */}
      {category?.id && (
        <div className="md:col-span-2 pt-6 border-t">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#5a4c46]">Subcategories</h2>
            <Button
              type="button"
              onClick={handleAddSubcategory}
              variant="outline"
            >
              + Add Subcategory
            </Button>
          </div>

          {/* Subcategory Form */}
          {showSubcategoryForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <h3 className="text-lg font-medium text-[#5a4c46] mb-4">
                {editingSubcategoryId ? 'Edit Subcategory' : 'Add New Subcategory'}
              </h3>
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  // Prevent form submission when pressing Enter in subcategory form
                  if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
              >
                <Input
                  label="Subcategory Name"
                  value={subcategoryForm.name}
                  onChange={(e) => {
                    e.stopPropagation()
                    const name = e.target.value
                    setSubcategoryForm(prev => ({ ...prev, name }))
                    if (!editingSubcategoryId) {
                      const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                      setSubcategoryForm(prev => ({ ...prev, name, slug }))
                    }
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  required
                />
                <div className="flex gap-2">
                  <Input
                    label="Slug"
                    value={subcategoryForm.slug}
                    onChange={(e) => {
                      e.stopPropagation()
                      setSubcategoryForm(prev => ({ ...prev, slug: e.target.value }))
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    required
                    className="flex-1"
                  />
                  {!editingSubcategoryId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const slug = subcategoryForm.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '')
                        setSubcategoryForm(prev => ({ ...prev, slug }))
                      }}
                      className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                    >
                      Generate
                    </button>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="subcategory_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="subcategory_description"
                    value={subcategoryForm.description || ''}
                    onChange={(e) => {
                      e.stopPropagation()
                      setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                    placeholder="Subcategory description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory Image (Optional)
                  </label>

                  {/* Mode Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSubcategoryInputMode('upload')
                      }}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${subcategoryInputMode === 'upload'
                          ? 'bg-[#5a4c46] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSubcategoryInputMode('url')
                      }}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${subcategoryInputMode === 'url'
                          ? 'bg-[#5a4c46] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      Enter URL
                    </button>
                  </div>

                  {/* Upload Mode */}
                  {subcategoryInputMode === 'upload' && (
                    <div className="space-y-3">
                      <input
                        ref={subcategoryFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSubcategoryFileSelect}
                        className="hidden"
                        disabled={subcategoryUploading}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          subcategoryFileInputRef.current?.click()
                        }}
                        disabled={subcategoryUploading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {subcategoryUploading ? 'Uploading...' : 'Choose Image File'}
                      </button>
                    </div>
                  )}

                  {/* URL Mode */}
                  {subcategoryInputMode === 'url' && (
                    <Input
                      type="url"
                      value={subcategoryUrlInput}
                      onChange={handleSubcategoryUrlChange}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="https://example.com/image.jpg"
                      helperText="Enter image URL"
                    />
                  )}

                  {/* Preview */}
                  {subcategoryPreviewUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="w-full max-w-xs aspect-[3/4] overflow-hidden rounded-md border border-gray-300 bg-gray-100">
                        <img
                          src={subcategoryPreviewUrl}
                          alt="Subcategory preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Input
                  label="Display Order"
                  type="number"
                  value={subcategoryForm.display_order || 0}
                  onChange={(e) => {
                    e.stopPropagation()
                    setSubcategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  helperText="Lower numbers appear first"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCancelSubcategory()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSaveSubcategory()
                  }}
                >
                  {editingSubcategoryId ? 'Update' : 'Add'} Subcategory
                </Button>
              </div>
            </div>
          )}

          {/* Existing Subcategories List */}
          {subcategories.length > 0 ? (
            <div className="space-y-2">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-[#5a4c46]">{subcategory.name}</div>
                    <div className="text-sm text-gray-500">Slug: {subcategory.slug}</div>
                    {subcategory.description && (
                      <div className="text-sm text-gray-600 mt-1">{subcategory.description}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEditSubcategory(subcategory)}
                      className="text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                      className="text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No subcategories yet. Click "Add Subcategory" to create one.</p>
          )}
        </div>
      )}

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
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}

