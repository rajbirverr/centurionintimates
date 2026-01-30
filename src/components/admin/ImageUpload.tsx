'use client'

import { useState, useRef } from 'react'
import { uploadProductImage, deleteProductImage, uploadProductImageToStorage, type ProductImage } from '@/lib/actions/images'
import ImageEditor from './ImageEditor'

interface ImageUploadProps {
  productId: string
  initialImages?: ProductImage[]
  onImagesChange?: (images: ProductImage[]) => void
  productName?: string // Added for SEO automation
}

export default function ImageUpload({ productId, initialImages = [], onImagesChange, productName = '' }: ImageUploadProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<{ url: string; id: string } | null>(null)
  const [savingEditedImage, setSavingEditedImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const fileArray = Array.from(files)

      for (let i = 0; i < fileArray.length; i++) {
        let file = fileArray[i]

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed')
          continue
        }

        // Validate AVIF support
        if (file.type === 'image/avif' || file.name.endsWith('.avif')) {
          // AVIF is allowed
        }

        // SEO Automation: Rename file and generate Alt Text
        let seoAltText = file.name

        if (productName) {
          // 1. Generate Strict SEO Filename: centurionshoppe-[product-slug]-[index].ext
          const brand = 'centurionintimate'
          const slug = productName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
          const extension = file.name.split('.').pop() || 'jpg'
          // Add timestamp/random to ensure uniqueness in batch
          const uniqueId = `${Date.now().toString().slice(-4)}${i}`
          const seoFilename = `${brand}-${slug}-${uniqueId}.${extension}`

          // Rename file object
          file = new File([file], seoFilename, { type: file.type })

          // 2. Generate Intelligent Alt Text: "Luxury [Product Name] by CenturionShoppe"
          // Keep it under 4-6 words as requested
          seoAltText = `Luxury ${productName} by CenturionIntimate`
        }

        // Upload to Supabase Storage first
        const uploadResult = await uploadProductImageToStorage(file)

        if (!uploadResult.success || !uploadResult.url) {
          setError(uploadResult.error || 'Failed to upload image to storage')
          continue
        }

        // Save the Supabase Storage URL to database
        const result = await uploadProductImage({
          product_id: productId,
          image_url: uploadResult.url,
          alt_text: seoAltText, // Use generated SEO Alt Text
          sort_order: images.length + i,
          is_primary: images.length === 0 && i === 0
        })

        if (result.success && result.data) {
          setImages(prev => {
            const newImages = [...prev, result.data!]
            if (onImagesChange) onImagesChange(newImages)
            return newImages
          })
        } else {
          setError(result.error || 'Failed to save image to database')
        }
      }
    } catch (err: any) {
      console.error('Error uploading images:', err)
      setError(err.message || 'Failed to upload images')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    try {
      const result = await deleteProductImage(imageId, productId)
      if (result.success) {
        const newImages = images.filter(img => img.id !== imageId)
        setImages(newImages)
        if (onImagesChange) {
          onImagesChange(newImages)
        }
      } else {
        setError(result.error || 'Failed to delete image')
      }
    } catch (err: any) {
      console.error('Error deleting image:', err)
      setError(err.message || 'Failed to delete image')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      // This will be handled by a separate server action
      // For now, update locally
      const newImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
      setImages(newImages)
      if (onImagesChange) {
        onImagesChange(newImages)
      }
    } catch (err: any) {
      console.error('Error setting primary image:', err)
      setError(err.message || 'Failed to set primary image')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,image/avif,.avif"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          aria-label="Upload product images"
          title="Select images to upload"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#5a4c46] file:text-white hover:file:bg-[#4a3c36] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: JPG, PNG, AVIF, WebP
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {uploading && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
          Uploading images...
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-[#5a4c46] text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setEditingImage({ url: image.image_url, id: image.id })
                  }}
                  className="px-3 py-1.5 bg-white text-gray-900 rounded text-xs hover:bg-gray-100 transition-colors"
                >
                  Edit
                </button>
                {!image.is_primary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSetPrimary(image.id)
                    }}
                    className="px-3 py-1.5 bg-white text-gray-900 rounded text-xs hover:bg-gray-100 transition-colors"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDelete(image.id)
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingImage && (
        <ImageEditor
          imageUrl={editingImage.url}
          onSave={async (editedImageUrl) => {
            if (!editingImage.id) return

            try {
              setSavingEditedImage(true)
              setError(null)

              // editedImageUrl is already base64 from ImageEditor
              const currentImage = images.find(img => img.id === editingImage.id)

              if (!currentImage) {
                setError('Could not find original image data')
                return
              }

              // Validate that editedImageUrl is a valid base64 string
              if (!editedImageUrl || !editedImageUrl.startsWith('data:image')) {
                setError('Invalid image data. Please try again.')
                return
              }

              // Upload the edited image as a new image entry
              // IMPORTANT: Preserve is_primary status from the original image
              const wasPrimary = currentImage.is_primary || false

              const result = await uploadProductImage({
                product_id: productId,
                image_url: editedImageUrl,
                alt_text: currentImage.alt_text || 'Edited product image',
                sort_order: currentImage.sort_order || 0,
                is_primary: wasPrimary // Preserve primary status
              })

              if (!result.success || !result.data) {
                setError(result.error || 'Failed to upload edited image')
                console.error('Upload failed:', result.error)
                return
              }

              // CRITICAL: Ensure the new image is set as primary if the old one was primary
              // This must happen BEFORE deleting the old image
              if (wasPrimary && result.data.id) {
                const { setPrimaryImage } = await import('@/lib/actions/images')
                const primaryResult = await setPrimaryImage(result.data.id, productId)
                if (!primaryResult.success) {
                  console.error('Failed to set primary image:', primaryResult.error)
                  setError('Image saved but failed to set as primary. Please set it manually.')
                  return
                }
              }

              // Delete the old image entry AFTER ensuring the new one is primary
              const deleteResult = await deleteProductImage(editingImage.id, productId)
              if (!deleteResult.success) {
                console.warn('Failed to delete old image:', deleteResult.error)
                // Don't fail the whole operation, but log the warning
              }

              // Update local state - replace old image with new one
              const updatedImages = images.map(img =>
                img.id === editingImage.id ? result.data : img
              )
              setImages(updatedImages)
              if (onImagesChange) {
                onImagesChange(updatedImages)
              }

              setEditingImage(null)

              // Refresh the page to show the updated image
              window.location.reload()
            } catch (err: any) {
              console.error('Error saving edited image:', err)
              setError(err.message || 'Failed to save edited image')
            } finally {
              setSavingEditedImage(false)
            }
          }}
          onCancel={() => setEditingImage(null)}
        />
      )}

      {savingEditedImage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
          Saving edited image...
        </div>
      )}
    </div>
  )
}

