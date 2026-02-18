interface ArticleCardSkeletonProps {
  variant?: 'default' | 'compact' | 'horizontal'
  className?: string
}

export default function ArticleCardSkeleton({
  variant = 'default',
  className = '',
}: ArticleCardSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="w-6 h-6 rounded-full bg-[var(--sm-surface)] animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full bg-[var(--sm-surface)] rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-[var(--sm-surface)] rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex gap-4 ${className}`}>
        <div className="relative w-32 h-24 sm:w-40 sm:h-28 rounded-lg bg-[var(--sm-surface)] overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <div className="h-5 w-20 bg-[var(--sm-surface)] rounded-full animate-pulse" />
          <div className="h-5 w-full bg-[var(--sm-surface)] rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-[var(--sm-surface)] rounded animate-pulse" />
          <div className="h-3 w-24 bg-[var(--sm-surface)] rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${className}`}
      style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
    >
      {/* Image skeleton */}
      <div className="relative aspect-video bg-[var(--sm-surface)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Category badge */}
        <div className="h-6 w-20 bg-[var(--sm-surface)] rounded-full animate-pulse" />

        {/* Title */}
        <div className="h-5 w-full bg-[var(--sm-surface)] rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-[var(--sm-surface)] rounded animate-pulse" />

        {/* Meta */}
        <div className="pt-4 border-t border-[var(--sm-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--sm-surface)] animate-pulse" />
            <div className="h-3 w-20 bg-[var(--sm-surface)] rounded animate-pulse" />
          </div>
          <div className="h-3 w-16 bg-[var(--sm-surface)] rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
