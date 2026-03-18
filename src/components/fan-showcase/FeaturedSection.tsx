'use client'

import ShowcaseCard from './ShowcaseCard'
import type { FanSubmission, FanSubmissionAsset, FanCreator } from '@/types/fan-showcase'

type FeaturedSubmission = FanSubmission & {
  creator: FanCreator
  assets: FanSubmissionAsset[]
}

interface FeaturedSectionProps {
  title: string
  subtitle: string
  items: FeaturedSubmission[]
  layout?: 'grid' | 'masonry' | 'list'
}

export default function FeaturedSection({
  title,
  subtitle,
  items,
  layout = 'grid',
}: FeaturedSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="py-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>

      {layout === 'masonry' ? (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map(item => (
            <div key={item.id} className="mb-5 break-inside-avoid">
              <ShowcaseCard submission={item} />
            </div>
          ))}
        </div>
      ) : layout === 'list' ? (
        <div className="grid gap-3">
          {items.map(item => (
            <ShowcaseCard key={item.id} submission={item} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <ShowcaseCard key={item.id} submission={item} />
          ))}
        </div>
      )}
    </section>
  )
}
