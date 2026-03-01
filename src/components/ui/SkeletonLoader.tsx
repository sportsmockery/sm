import React from 'react'

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  className?: string
  lines?: number
}

export default function SkeletonLoader({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 1,
}: SkeletonLoaderProps) {
  const baseClasses = 'skeleton-shimmer'
  const baseStyle: React.CSSProperties = {}

  if (variant === 'circular') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{
          ...baseStyle,
          width: width || '40px',
          height: height || '40px',
        }}
      />
    )
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={`${baseClasses} rounded-lg ${className}`}
        style={{
          ...baseStyle,
          width: width || '100%',
          height: height || '200px',
        }}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div className={`overflow-hidden rounded-2xl ${className}`} style={{ border: '1px solid var(--sm-border)' }}>
        <div className={`${baseClasses} aspect-video w-full`} style={baseStyle} />
        <div className="space-y-3 p-4">
          <div className={`${baseClasses} h-4 w-20 rounded`} style={baseStyle} />
          <div className={`${baseClasses} h-6 w-full rounded`} style={baseStyle} />
          <div className={`${baseClasses} h-4 w-3/4 rounded`} style={baseStyle} />
          <div className="flex items-center gap-2 pt-2">
            <div className={`${baseClasses} h-8 w-8 rounded-full`} style={baseStyle} />
            <div className={`${baseClasses} h-4 w-24 rounded`} style={baseStyle} />
          </div>
        </div>
      </div>
    )
  }

  // Text variant
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} rounded`}
          style={{
            ...baseStyle,
            width: i === lines - 1 && lines > 1 ? '75%' : (width || '100%'),
            height: height || '16px',
          }}
        />
      ))}
    </div>
  )
}
