'use client'

import { useState, useEffect, useRef } from 'react'
import { updateHeroImage, uploadHeroImageToStorage, getHeroImage } from '@/lib/actions/site-settings'

export default function HeroImageUpload() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [currentAltText, setCurrentAltText] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')

  // SEO Fields
  const [brand, setBrand] = useState('CenturionIntimate')
  const [keyword, setKeyword] = useState('')
  const [context, setContext] = useState('Hero Banner')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load current hero image on mount
  useEffect(() => {
    loadCurrentImage()
  }, [])

  const loadCurrentImage = async () => {
    const { url, altText } = await getHeroImage()
    if (url) {
      setCurrentImageUrl(url)
    }
    if (altText) {
      setCurrentAltText(altText)
    }
  }

  // Derived values
  const getSlug = (text: string) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const generatedFilename = () => {
    const parts = [
      getSlug(brand),
      getSlug(keyword),
      getSlug(context)
    ].filter(p => p)
    return parts.join('-')
  }

  const generatedAltText = () => {
    return `Luxury ${keyword} ${context} by ${brand}`.replace(/\s+/g, ' ').trim()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(false)

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
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
    setError(null)
    setSuccess(false)

    // Validate URL format
    if (e.target.value) {
      try {
        new URL(e.target.value)
        setPreviewUrl(e.target.value)
      } catch {
        setPreviewUrl(null)
      }
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    // Validate SEO fields if uploading
    if (inputMode === 'upload' && (!keyword || !context)) {
      setError('Please fill in Main Keyword and Context for SEO optimization')
      return
    }

    let imageUrl: string
    const altText = generatedAltText()

    if (inputMode === 'upload') {
      let file = fileInputRef.current?.files?.[0]
      if (!file) {
        setError('Please select an image file')
        return
      }

      // Rename file using strict SEO format
      const extension = file.name.split('.').pop() || 'jpg'
      const newName = `${generatedFilename()}.${extension}`

      // Create new file with SEO-friendly name
      file = new File([file], newName, { type: file.type })

      setUploading(true)
      try {
        const result = await uploadHeroImageToStorage(file)
        if (!result.success || !result.url) {
          const errorMsg = result.error || 'Failed to upload image'
          if (errorMsg.includes('Bucket not found') || errorMsg.includes('not found')) {
            setError(`${errorMsg}\n\nTip: Use "Enter URL" mode instead, or create the "images" bucket in Supabase Storage.`)
          } else {
            setError(errorMsg)
          }
          setUploading(false)
          return
        }
        imageUrl = result.url
      } catch (err: any) {
        setError(err.message || 'Failed to upload image')
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    } else {
      // URL mode
      if (!urlInput.trim()) {
        setError('Please enter an image URL')
        return
      }

      try {
        new URL(urlInput.trim())
      } catch {
        setError('Please enter a valid URL')
        return
      }

      imageUrl = urlInput.trim()
    }

    // Save to database
    setSaving(true)
    try {
      const result = await updateHeroImage(imageUrl, altText)
      if (!result.success) {
        setError(result.error || 'Failed to save hero image')
        setSaving(false)
        return
      }

      setCurrentImageUrl(imageUrl)
      setCurrentAltText(altText)
      setPreviewUrl(null)
      setUrlInput('')
      setSuccess(true)

      // Clear fields
      setKeyword('')
      setContext('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save hero image')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setUrlInput('')
    setError(null)
    setKeyword('')
    setContext('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Hero Image Settings</h2>

      {/* Current/Preview Image */}
      {displayImageUrl && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {previewUrl ? 'Preview' : 'Current Hero Image'}
          </label>
          <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 mb-2">
            <img
              src={displayImageUrl}
              alt={previewUrl ? generatedAltText() : (currentAltText || "Hero image")}
              className="w-full h-full object-cover"
              onError={() => setError('Failed to load image')}
            />
          </div>
          {/* Show current Alt Text if viewing current image */}
          {!previewUrl && currentAltText && (
            <p className="text-xs text-gray-500">Current Alt Text: <span className="font-medium">{currentAltText}</span></p>
          )}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="mb-4">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => {
              setInputMode('upload')
              handleCancel()
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${inputMode === 'upload'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode('url')
              handleCancel()
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${inputMode === 'url'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Enter URL
          </button>
        </div>

        {/* Upload Mode */}
        {inputMode === 'upload' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Select Image File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>✨ 2. Auto-SEO Magic</span>
                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded border">Just type the product name!</span>
              </h3>

              <div className="space-y-4">
                {/* Main Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Enter Product Name / Keyword
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. Peach Lingerie"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We automatically add "CenturionShoppe" and "Hero Banner" for you.
                  </p>
                </div>

                {/* Advanced Fields (Hidden by default unless needed) */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-900 font-medium mb-2">
                    Show Advanced Settings (Brand, Context)
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pl-2 border-l-2 border-gray-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Context</label>
                      <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </details>

                {/* Live Preview Card */}
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm mt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Result Preview</h4>

                  <div className="grid gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">SRC (Filename)</span>
                      <code className="block text-sm text-gray-800 break-all mt-1 font-mono">
                        {generatedFilename()}.jpg
                      </code>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">ALT Text (SEO)</span>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        "{generatedAltText()}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* URL Mode */}
        {inputMode === 'url' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          Hero image updated successfully with strict SEO naming!
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {(previewUrl || (inputMode === 'url' && urlInput)) && (
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading || saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Hero Image'}
          </button>
        )}
        {(previewUrl || (inputMode === 'url' && urlInput)) && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading || saving}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
