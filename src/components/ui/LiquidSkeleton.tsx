/**
 * LiquidSkeleton — frosted-glass loading placeholder (Pillar 3).
 *
 * Drop-in replacement for gray-box skeletons. Uses the project's Liquid Glass
 * aesthetic: subtle frosted surface + animated gradient sweep, light/dark aware,
 * `prefers-reduced-motion` safe.
 *
 *   <LiquidSkeleton className="h-40 w-full" />
 *   <LiquidSkeleton variant="circular" className="h-12 w-12" />
 *   <LiquidSkeleton variant="text" className="w-3/4" />
 *   <LiquidSkeleton variant="text" count={3} className="w-full" />
 *
 * Variants:
 *   - rectangular (default): rounded card, shape sized via className
 *   - circular: perfect circle, size via className (h-X w-X)
 *   - text: short pill, height fixed at 1rem, width via className
 */

import { cn } from '@/lib/utils'

export type LiquidSkeletonVariant = 'rectangular' | 'circular' | 'text'

export interface LiquidSkeletonProps {
  className?: string
  variant?: LiquidSkeletonVariant
  /** Render multiple stacked skeletons (useful for text lines / list rows). */
  count?: number
  /** Override aria-label. Defaults to "Loading". */
  ariaLabel?: string
}

const VARIANT_CLASS: Record<LiquidSkeletonVariant, string> = {
  rectangular: 'rounded-2xl',
  circular: 'rounded-full',
  text: 'rounded-md h-4',
}

export function LiquidSkeleton({
  className,
  variant = 'rectangular',
  count = 1,
  ariaLabel = 'Loading',
}: LiquidSkeletonProps) {
  if (count > 1) {
    return (
      <div role="status" aria-busy="true" aria-label={ariaLabel} className="flex flex-col gap-2">
        {Array.from({ length: count }, (_, i) => (
          <LiquidSkeletonNode
            key={i}
            variant={variant}
            className={className}
            // Stagger the sweep so stacked rows don't pulse in lockstep
            delayMs={i * 120}
          />
        ))}
      </div>
    )
  }

  return (
    <div role="status" aria-busy="true" aria-label={ariaLabel}>
      <LiquidSkeletonNode variant={variant} className={className} />
    </div>
  )
}

function LiquidSkeletonNode({
  variant = 'rectangular',
  className,
  delayMs = 0,
}: {
  variant?: LiquidSkeletonVariant
  className?: string
  delayMs?: number
}) {
  return (
    <div className={cn('liquid-skeleton', VARIANT_CLASS[variant], className)}>
      <div
        className="liquid-skeleton-sweep"
        style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
      />
    </div>
  )
}

export default LiquidSkeleton
