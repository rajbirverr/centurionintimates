'use client'
// Recompile force 1

import { useState } from 'react'
import Image from 'next/image'
import { shouldUnoptimizeImage } from '@/lib/utils/image-helpers'
import { getOptimizedSupabaseUrl } from '@/lib/utils/image-optimization'

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

  // Optimize Supabase images automatically
  // Determines optimal width based on viewport and container
  const optimizedSrc = (() => {
    if (!src) return src

    // For fill images (responsive), use larger size
    if (fill) {
      return getOptimizedSupabaseUrl(src, 1200, 80)
    }

    // For fixed-width images, use specified width or default
    const imageWidth = width || 800
    return getOptimizedSupabaseUrl(src, imageWidth, 80)
  })()

  // Force unoptimized to ensure images show up reliably.
  // Next.js optimization seems to be failing or misconfigured for these domains.
  const unoptimized = true

  // If image failed to load or we should use fallback, use regular img
  if (useFallback || imgError || !src) {
    if (fill) {
      return (
        <img
          src={optimizedSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkiLz48L3N2Zz4='}
          alt={alt}
          className={className}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            color: 'transparent',
            objectFit: 'cover',
            ...style
          }}
        />
      )
    }
    return (
      <img
        src={optimizedSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmOWY5ZjkiLz48L3N2Zz4='}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    )
  }

  // Use Next.js Image component with fetchpriority for critical images
  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          objectFit: 'cover',
          ...style
        }}
        unoptimized={unoptimized}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => {
          setUseFallback(true)
          setImgError(true)
        }}
      />
    )
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      priority={priority}
      loading={loading}
      sizes={sizes}
      style={style}
      unoptimized={unoptimized}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => {
        setUseFallback(true)
        setImgError(true)
      }}
      suppressHydrationWarning
    />
  )
}