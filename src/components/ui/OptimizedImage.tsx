'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

/**
 * Image variant presets for consistent sizing across the site.
 * Each variant configures appropriate dimensions, sizes hints, and loading behavior.
 */
const VARIANT_CONFIG = {
  hero: {
    width: 1920,
    height: 1080,
    sizes: '100vw',
    priority: true,
    quality: 85,
  },
  card: {
    width: 800,
    height: 450,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
    priority: false,
    quality: 80,
  },
  thumbnail: {
    width: 400,
    height: 225,
    sizes: '(max-width: 768px) 50vw, 200px',
    priority: false,
    quality: 75,
  },
  avatar: {
    width: 96,
    height: 96,
    sizes: '48px',
    priority: false,
    quality: 75,
  },
} as const

type ImageVariant = keyof typeof VARIANT_CONFIG

export interface OptimizedImageProps extends Omit<ImageProps, 'width' | 'height'> {
  /** Preset variant controlling size, quality, and loading behavior */
  variant?: ImageVariant
  /** Override width (otherwise set by variant) */
  width?: number
  /** Override height (otherwise set by variant) */
  height?: number
  /** Optimized URL from the image pipeline — falls back to src if not provided */
  optimizedSrc?: string
  /** Base64 blur placeholder from the image pipeline */
  blurDataURL?: string
  /** Fallback element if image fails to load */
  fallback?: React.ReactNode
}

export default function OptimizedImage({
  variant = 'card',
  src,
  optimizedSrc,
  blurDataURL,
  alt,
  width,
  height,
  fill,
  fallback,
  className,
  style,
  ...rest
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const config = VARIANT_CONFIG[variant]

  // Use optimized URL if available, fall back to original
  const imageSrc = error ? src : (optimizedSrc || src)

  if (!imageSrc) {
    return fallback ? <>{fallback}</> : null
  }

  // If image errored and we have a fallback, show it
  if (error && fallback) {
    return <>{fallback}</>
  }

  const imageProps: ImageProps = {
    src: imageSrc,
    alt: alt || '',
    sizes: config.sizes,
    priority: config.priority,
    quality: config.quality,
    className,
    style,
    onError: () => {
      if (optimizedSrc && !error) {
        // If optimized version fails, fall back to original src
        setError(true)
      }
    },
    ...rest,
  }

  // Support blur placeholder
  if (blurDataURL) {
    imageProps.placeholder = 'blur'
    imageProps.blurDataURL = blurDataURL
  }

  // Use fill mode if explicitly set, otherwise use dimensions
  if (fill) {
    imageProps.fill = true
  } else {
    imageProps.width = width || config.width
    imageProps.height = height || config.height
  }

  // Override priority from rest props if explicitly set
  if ('priority' in rest) {
    imageProps.priority = rest.priority
  }

  return <Image {...imageProps} />
}

export { VARIANT_CONFIG, type ImageVariant }
