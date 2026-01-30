'use client'

import { useState, useEffect, useRef } from 'react'
import { updateShowcaseCardImage, uploadShowcaseCardImageToStorage, getShowcaseCardImage } from '@/lib/actions/site-settings'

export default function ShowcaseCardImageUpload() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [currentAltText, setCurrentAltText] = useState<string | null>(null)

  // Display Text Fields
  const [cardTitle, setCardTitle] = useState('Intimate Attire')
  const [cardSubtitle, setCardSubtitle] = useState('Collection')

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
  const [context, setContext] = useState('Intimate Attire')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCurrentSettings()
  }, [])

  const loadCurrentSettings = async () => {
    const settings = await getShowcaseCardImage()
    if (settings.url) setCurrentImageUrl(settings.url)
    if (settings.altText) setCurrentAltText(settings.altText)
    if (settings.title) setCardTitle(settings.title)
    if (settings.subtitle) setCardSubtitle(settings.subtitle)
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

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB. For larger images, use "Enter URL" mode instead.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    let finalImageUrl: string
    let finalAltText = currentAltText || ''

    // 1. Upload Logic
    if (inputMode === 'upload') {
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        // If no new file, we might be just updating text
        if (currentImageUrl) {
          finalImageUrl = currentImageUrl
        } else {
          setError('Please select an image file')
          return
        }
      } else {
        // We have a file to upload
        if (!keyword.trim()) {
          setError('Please enter a Product Name / Keyword for SEO')
          return
        }

        setUploading(true)
        try {
          // Rename file for SEO
          const extension = file.name.split('.').pop() || 'jpg'
          const seoFilename = `${generatedFilename()}.${extension}`
          const seoFile = new File([file], seoFilename, { type: file.type })
          finalAltText = generatedAltText() // Update Alt Text

          const result = await uploadShowcaseCardImageToStorage(seoFile)
          if (!result.success || !result.url) {
            setError(result.error || 'Failed to upload image')
            setUploading(false)
            return
          }
          finalImageUrl = result.url
        } catch (err: any) {
          setError(err.message || 'Failed to upload image')
          setUploading(false)
          return
        }
        setUploading(false)
      }
    } else {
      // URL Mode
      if (!urlInput.trim() && !currentImageUrl) {
        setError('Please enter an image URL')
        return
      }
      finalImageUrl = urlInput.trim() || currentImageUrl!
      if (keyword.trim()) {
        finalAltText = generatedAltText()
      }
    }

    // 2. Save Settings Logic
    setSaving(true)
    try {
      const result = await updateShowcaseCardImage(
        finalImageUrl,
        finalAltText,
        cardTitle,
        cardSubtitle
      )

      if (!result.success) {
        setError(result.error || 'Failed to save settings')
        setSaving(false)
        return
      }

      setCurrentImageUrl(finalImageUrl)
      setCurrentAltText(finalAltText)
      setPreviewUrl(null)
      setUrlInput('')
      setSuccess(true)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Showcase Card Settings</h2>
      <p className="text-sm text-gray-600 mb-6">Manage "The Fashion Jewelry Shop" / "Intimate Attire" card image and text.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column: Inputs */}
        <div className="space-y-6">

          {/* Text Settings */}
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Card Text</h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Intimate Attire"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={cardSubtitle}
                  onChange={(e) => setCardSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Collection"
                />
              </div>
            </div>
          </div>

          {/* Image Upload & SEO */}
          <div>
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${inputMode === 'upload' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setInputMode('url')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${inputMode === 'url' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Enter URL
              </button>
            </div>

            {inputMode === 'upload' && (
              <div className="space-y-6">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#5a4c46] file:text-white hover:file:bg-[#4a3c36] cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-gray-500">Max size: 5MB</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span>✨ Auto-SEO Magic</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Enter Product Name / Keyword</label>
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="e.g. Peach Lingerie"
                        className="w-full px-3 py-2 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-[10px] text-blue-600 mt-1">
                        We automatically add "{brand}" and "{context}"
                      </p>
                    </div>

                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-900 font-medium">
                        Advanced Settings (Brand, Context)
                      </summary>
                      <div className="grid grid-cols-2 gap-2 mt-2 pl-2 border-l-2 border-gray-200">
                        <div>
                          <label className="block text-[10px] text-gray-500">Brand</label>
                          <input
                            value={brand}
                            onChange={e => setBrand(e.target.value)}
                            className="w-full p-1 border rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500">Context</label>
                          <input
                            value={context}
                            onChange={e => setContext(e.target.value)}
                            className="w-full p-1 border rounded text-xs"
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {inputMode === 'url' && (
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {uploading ? 'Uploading...' : saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded">Settings updated successfully!</div>}

        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</h3>

          {/* Image Preview */}
          <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {displayImageUrl ? (
              <>
                <img src={displayImageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-2xl font-bold text-[#A47864] mb-1 leading-tight">
                    {cardTitle || 'Title'}
                  </h3>
                  <p className="text-sm text-[#A47864]/90">{cardSubtitle || 'Subtitle'}</p>
                  <button className="mt-3 px-4 py-1.5 bg-white/90 text-xs font-bold uppercase tracking-wide rounded-full">
                    Visit Shop
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No image selected</div>
            )}
          </div>

          {/* SEO Preview Card */}
          {keyword && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="mb-2">
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">SRC (Filename)</span>
                <code className="block text-xs text-gray-800 break-all mt-1 font-mono">{generatedFilename()}.jpg</code>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">ALT Text (SEO)</span>
                <p className="text-xs text-gray-800 mt-1 italic">"{generatedAltText()}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
