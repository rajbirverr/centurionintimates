'use client'

import { useState } from 'react'
import Image from 'next/image'
import { shouldUnoptimizeImage } from '@/lib/utils/image-helpers'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  sizes?: string
  style?: React.CSSProperties
}

/**
 * Safe Image component that falls back to regular img if Next.js Image fails
 */
export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  priority = false,
  loading = 'lazy',
  sizes,
  style
}: SafeImageProps) {
  const [useFallback, setUseFallback] = useState(false)
  const [imgError, setImgError] = useState(false)
  const unoptimized = shouldUnoptimizeImage(src)

  // If image failed to load or we should use fallback, use regular img
  if (useFallback || imgError || !src) {
    if (fill) {
      return (
        <img
          src={src || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkIi8+PC9zdmc+'}
          alt={alt}
          className={className}
          style={style}
        />
      )
    }
    return (
      <img
        src={src || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkIi8+PC9zdmc+'}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    )
  }

  // Use Next.js Image component
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        style={style}
        unoptimized={unoptimized}
        onError={() => {
          setUseFallback(true)
          setImgError(true)
        }}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      priority={priority}
      loading={loading}
      sizes={sizes}
      style={style}
      unoptimized={unoptimized}
      onError={() => {
        setUseFallback(true)
        setImgError(true)
      }}
    />
  )
}
