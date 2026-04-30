'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PlayerImageProps {
  src: string
  alt: string
  fallbackText: string
  fallbackColor: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
}

export default function PlayerImage({
  src,
  alt,
  fallbackText,
  fallbackColor,
  fill,
  width,
  height,
  className = '',
}: PlayerImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center text-white font-bold text-sm ${className}`}
        style={{ backgroundColor: fallbackColor, width: fill ? '100%' : width, height: fill ? '100%' : height, borderRadius: '50%' }}
      >
        {fallbackText}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      onError={() => setError(true)}
    />
  )
}
