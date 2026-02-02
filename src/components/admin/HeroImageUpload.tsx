'use client'

import { useState, useEffect, useRef } from 'react'
import {
  updateHeroImageDesktop,
  updateHeroImageMobile,
  uploadHeroImageToStorage,
  getHeroImage,
  getHeroImageMobile
} from '@/lib/actions/site-settings'
import AspectRatioPicker from './AspectRatioPicker'

type DeviceTab = 'desktop' | 'mobile'

export default function HeroImageUpload() {
  // Active tab
  const [activeTab, setActiveTab] = useState<DeviceTab>('desktop')

  // Desktop state
  const [desktopImageUrl, setDesktopImageUrl] = useState<string | null>(null)
  const [desktopAltText, setDesktopAltText] = useState<string | null>(null)
  const [desktopAspectRatio, setDesktopAspectRatio] = useState<string>('16:9')
  const [desktopPreviewUrl, setDesktopPreviewUrl] = useState<string | null>(null)

  // Mobile state
  const [mobileImageUrl, setMobileImageUrl] = useState<string | null>(null)
  const [mobileAltText, setMobileAltText] = useState<string | null>(null)
  const [mobileAspectRatio, setMobileAspectRatio] = useState<string>('4:5')
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState<string | null>(null)

  // Common state
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

  // Load current images on mount
  useEffect(() => {
    loadCurrentImages()
  }, [])

  const loadCurrentImages = async () => {
    // Load desktop
    const desktop = await getHeroImage()
    if (desktop.url) setDesktopImageUrl(desktop.url)
    if (desktop.altText) setDesktopAltText(desktop.altText)

    // Load mobile
    const mobile = await getHeroImageMobile()
    if (mobile.url) setMobileImageUrl(mobile.url)
    if (mobile.altText) setMobileAltText(mobile.altText)
    if (mobile.aspectRatio) setMobileAspectRatio(mobile.aspectRatio)
  }

  // Derived values
  const getSlug = (text: string) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const generatedFilename = () => {
    const parts = [
      getSlug(brand),
      getSlug(keyword),
      getSlug(context),
      activeTab // Add device type to filename
    ].filter(p => p)
    return parts.join('-')
  }

  const generatedAltText = () => {
    return `Luxury ${keyword} ${context} by ${brand}`.replace(/\s+/g, ' ').trim()
  }

  // Current values based on active tab
  const currentImageUrl = activeTab === 'desktop' ? desktopImageUrl : mobileImageUrl
  const currentPreviewUrl = activeTab === 'desktop' ? desktopPreviewUrl : mobilePreviewUrl
  const currentAspectRatio = activeTab === 'desktop' ? desktopAspectRatio : mobileAspectRatio
  const setCurrentAspectRatio = activeTab === 'desktop' ? setDesktopAspectRatio : setMobileAspectRatio
  const setCurrentPreviewUrl = activeTab === 'desktop' ? setDesktopPreviewUrl : setMobilePreviewUrl

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
      setCurrentPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
    setError(null)
    setSuccess(false)

    if (e.target.value) {
      try {
        new URL(e.target.value)
        setCurrentPreviewUrl(e.target.value)
      } catch {
        setCurrentPreviewUrl(null)
      }
    } else {
      setCurrentPreviewUrl(null)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

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

      const extension = file.name.split('.').pop() || 'jpg'
      const newName = `${generatedFilename()}.${extension}`
      file = new File([file], newName, { type: file.type })

      setUploading(true)
      try {
        const result = await uploadHeroImageToStorage(file)
        if (!result.success || !result.url) {
          setError(result.error || 'Failed to upload image')
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

    // Save to database based on active tab
    setSaving(true)
    try {
      let result
      if (activeTab === 'desktop') {
        result = await updateHeroImageDesktop(imageUrl, altText, currentAspectRatio)
        if (result.success) {
          setDesktopImageUrl(imageUrl)
          setDesktopAltText(altText)
        }
      } else {
        result = await updateHeroImageMobile(imageUrl, altText, currentAspectRatio)
        if (result.success) {
          setMobileImageUrl(imageUrl)
          setMobileAltText(altText)
        }
      }

      if (!result.success) {
        setError(result.error || 'Failed to save hero image')
        setSaving(false)
        return
      }

      setCurrentPreviewUrl(null)
      setUrlInput('')
      setSuccess(true)
      setKeyword('')
      setContext('Hero Banner')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save hero image')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setCurrentPreviewUrl(null)
    setUrlInput('')
    setError(null)
    setKeyword('')
    setContext('Hero Banner')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImageUrl = currentPreviewUrl || currentImageUrl

  // Calculate aspect ratio dimensions for preview
  const getPreviewDimensions = (ratio: string, maxWidth: number = 400) => {
    const [w, h] = ratio.split(':').map(Number)
    const aspectRatio = w / h
    if (aspectRatio >= 1) {
      return { width: maxWidth, height: maxWidth / aspectRatio }
    } else {
      const maxHeight = 300
      return { width: maxHeight * aspectRatio, height: maxHeight }
    }
  }

  const previewDimensions = getPreviewDimensions(currentAspectRatio)

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Hero Image Settings</h2>

      {/* Device Tab Switcher */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => { setActiveTab('desktop'); handleCancel() }}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'desktop'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
            <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Desktop
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('mobile'); handleCancel() }}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === 'mobile'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
          Mobile
        </button>
      </div>

      {/* Two-column layout: Preview + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Device Preview */}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-700 mb-3 self-start">
            {activeTab === 'desktop' ? 'Desktop Preview' : 'Mobile Preview'}
          </label>

          {/* Device Frame */}
          <div className={`relative ${activeTab === 'mobile' ? 'max-w-[200px]' : 'w-full max-w-[400px]'}`}>
            {activeTab === 'mobile' ? (
              // Phone Frame
              <div className="bg-gray-900 rounded-[2rem] p-2 shadow-xl">
                <div className="bg-gray-900 rounded-[1.5rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
                  {/* Screen */}
                  <div
                    className="bg-gray-100 overflow-hidden"
                    style={{
                      aspectRatio: currentAspectRatio.replace(':', '/'),
                      maxHeight: '350px'
                    }}
                  >
                    {displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt="Mobile preview"
                        className="w-full h-full object-cover"
                        onError={() => setError('Failed to load image')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Laptop Frame
              <div className="bg-gray-800 rounded-t-xl pt-2 px-3 pb-0 shadow-xl">
                {/* Camera */}
                <div className="w-2 h-2 bg-gray-600 rounded-full mx-auto mb-2" />
                {/* Screen */}
                <div
                  className="bg-gray-100 rounded-sm overflow-hidden"
                  style={{
                    aspectRatio: currentAspectRatio.replace(':', '/'),
                    maxHeight: '250px'
                  }}
                >
                  {displayImageUrl ? (
                    <img
                      src={displayImageUrl}
                      alt="Desktop preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Failed to load image')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stand for laptop */}
            {activeTab === 'desktop' && (
              <div className="bg-gray-700 h-4 rounded-b-lg mx-auto" style={{ width: '60%' }} />
            )}
          </div>

          {/* Aspect Ratio Display */}
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-500">Current Aspect Ratio:</span>
            <span className="ml-2 text-sm font-bold text-gray-900">{currentAspectRatio}</span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="space-y-6">
          {/* Aspect Ratio Picker */}
          <AspectRatioPicker
            selectedRatio={currentAspectRatio}
            onSelect={setCurrentAspectRatio}
            orientation={activeTab === 'mobile' ? 'portrait' : 'landscape'}
          />

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setInputMode('upload'); handleCancel() }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${inputMode === 'upload'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => { setInputMode('url'); handleCancel() }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${inputMode === 'url'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Enter URL
            </button>
          </div>

          {/* Upload Mode */}
          {inputMode === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image File
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product/Keyword (for SEO)
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Peach Lingerie"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
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
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} hero image updated successfully!
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        {(currentPreviewUrl || (inputMode === 'url' && urlInput)) && (
          <button
            type="button"
            onClick={handleSave}
            disabled={uploading || saving}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : saving ? 'Saving...' : `Save ${activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Image`}
          </button>
        )}
        {(currentPreviewUrl || (inputMode === 'url' && urlInput)) && (
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
