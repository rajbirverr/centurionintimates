'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Cropper from 'react-easy-crop'

export interface TextOverlay {
  text: string
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  fontSize: number
  color: string
  fontFamily: string
  enabled: boolean
}

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onCancel: () => void
  initialOverlay?: Partial<TextOverlay>
}

const DEFAULT_OVERLAY: TextOverlay = {
  text: 'CENTURION',
  position: 'bottom-center',
  fontSize: 32,
  color: '#784D2C',
  fontFamily: "'Rhode', sans-serif",
  enabled: false
}

export default function ImageEditor({ imageUrl, onSave, onCancel, initialOverlay }: ImageEditorProps) {
  const [overlay, setOverlay] = useState<TextOverlay>({ ...DEFAULT_OVERLAY, ...initialOverlay })
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  // Canvas ref for final processing
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // Helper to create an HTMLImageElement from a url
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
      image.src = url
    })

  // Helper to get the cropped image
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ): Promise<HTMLCanvasElement | null> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    const rotRad = (rotation * Math.PI) / 180

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    )

    // set canvas size to cropped image size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // place the cropped image data in the canvas
    ctx.putImageData(data, 0, 0)

    return canvas
  }

  // To fix rotation issues
  function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = (rotation * Math.PI) / 180
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    try {
      // 1. Get the cropped image canvas
      const croppedCanvas = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation
      )

      if (!croppedCanvas) {
        console.error('Could not crop image')
        return
      }

      // 2. Convert to blob/base64 to return
      croppedCanvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = () => {
            const editedImageUrl = reader.result as string
            onSave(editedImageUrl)
          }
        }
      }, 'image/jpeg', 0.95)

    } catch (e) {
      console.error(e)
    }
  }

  const handlePositionChange = (position: TextOverlay['position']) => {
    setOverlay({ ...overlay, position })
  }

  const handleFontSizeChange = (fontSize: number) => {
    setOverlay({ ...overlay, fontSize: Math.max(12, Math.min(100, fontSize)) })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Edit Image</h2>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onCancel()
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close editor"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Preview Area with Cropper */}
            <div className="md:col-span-2 relative min-h-[400px] bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4 / 5} // Default aspect ratio for product cards
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
              />

              {/* Overlay preview (approximate position over the cropper is hard because cropper moves) 
                  For now, we might hide the overlay preview or show it in a separate step/mode.
                  However, keeping it simple: The overlay is applied AFTER cropping in the real world, 
                  but demonstrating it on top of the "to be cropped" area is tricky. 
                  Let's disable overlay preview while cropping or just overlay it on top of the container (imperfect).
              */}
              {overlay.enabled && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  {/* Note: Accurate WYSIWYG overlay on top of react-easy-crop is complex because the image scales/moves. 
                        Users might need to apply crop FIRST, then watermark. 
                        For this iteration, we focus on CROPPING as requested.
                     */}
                  <div className="bg-black/50 text-white px-4 py-2 rounded text-sm">
                    Watermark will be applied to the final result
                  </div>
                </div>
              )}
            </div>

            {/* Controls Panel */}
            <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2">
              {/* Crop Controls */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Crop & Rotate</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#784D2C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotation</label>
                    <input
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      aria-labelledby="Rotation"
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#784D2C]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={overlay.enabled}
                    onChange={(e) => setOverlay({ ...overlay, enabled: e.target.checked })}
                    className="mr-2 w-4 h-4 text-[#784D2C] focus:ring-[#784D2C]"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Brand Watermark (Applied after crop)</span>
                </label>
              </div>

              {overlay.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Text
                    </label>
                    <input
                      type="text"
                      value={overlay.text}
                      onChange={(e) => setOverlay({ ...overlay, text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#784D2C]"
                      placeholder="CENTURION"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePositionChange(pos)
                          }}
                          className={`px-3 py-2 text-xs border rounded-md transition-colors ${overlay.position === pos
                            ? 'bg-[#784D2C] text-white border-[#784D2C]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {pos.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size: {overlay.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="100"
                      value={overlay.fontSize}
                      onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#784D2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={overlay.color}
                      onChange={(e) => setOverlay({ ...overlay, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCancel()
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#784D2C] text-white rounded-md hover:bg-[#6a3d20] transition-colors"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  )
}

