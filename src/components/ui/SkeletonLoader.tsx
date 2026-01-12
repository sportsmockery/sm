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
  const baseClasses = 'animate-pulse bg-zinc-200 dark:bg-zinc-800'

  if (variant === 'circular') {
    return (
      <div
        className={`${baseClasses} rounded-full ${className}`}
        style={{
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
          width: width || '100%',
          height: height || '200px',
        }}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div className={`overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
        <div className={`${baseClasses} aspect-video w-full`} />
        <div className="space-y-3 p-4">
          <div className={`${baseClasses} h-4 w-20 rounded`} />
          <div className={`${baseClasses} h-6 w-full rounded`} />
          <div className={`${baseClasses} h-4 w-3/4 rounded`} />
          <div className="flex items-center gap-2 pt-2">
            <div className={`${baseClasses} h-8 w-8 rounded-full`} />
            <div className={`${baseClasses} h-4 w-24 rounded`} />
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
            width: i === lines - 1 && lines > 1 ? '75%' : (width || '100%'),
            height: height || '16px',
          }}
        />
      ))}
    </div>
  )
}
