export default function ArticleLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Hero image skeleton */}
      <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 -mt-24">
        {/* Content card */}
        <div className="rounded-2xl shadow-2xl p-8 md:p-12" style={{ backgroundColor: 'var(--sm-card)' }}>
          {/* Category badge */}
          <div className="h-7 w-24 rounded-full animate-pulse mb-6" style={{ backgroundColor: 'var(--sm-surface)' }} />

          {/* Title skeleton */}
          <div className="space-y-3 mb-8">
            <div className="h-10 w-full rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            <div className="h-10 w-3/4 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          </div>

          {/* Meta info skeleton */}
          <div className="flex items-center gap-6 pb-8 mb-8 border-b" style={{ borderColor: 'var(--sm-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              </div>
            </div>
            <div className="h-8 w-px" style={{ backgroundColor: 'var(--sm-surface)' }} />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="h-4 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            {/* Paragraph 1 */}
            <div className="space-y-3">
              <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="h-4 w-4/5 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            </div>

            {/* Paragraph 2 */}
            <div className="space-y-3">
              <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="h-4 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            </div>

            {/* Quote block skeleton */}
            <div className="pl-6 border-l-4 py-4" style={{ borderColor: 'var(--sm-border)' }}>
              <div className="space-y-2">
                <div className="h-5 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                <div className="h-5 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              </div>
            </div>

            {/* Paragraph 3 */}
            <div className="space-y-3">
              <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="h-4 w-2/3 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            </div>
          </div>

          {/* Tags skeleton */}
          <div className="mt-12 pt-8 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--sm-border)' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            ))}
          </div>
        </div>

        {/* Related articles skeleton */}
        <div className="mt-12 pb-12">
          <div className="h-7 w-40 rounded-lg animate-pulse mb-6" style={{ backgroundColor: 'var(--sm-surface)' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                <div className="aspect-video animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                  <div className="h-4 w-2/3 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
