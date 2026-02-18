export default function CategoryLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Header skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-4 w-24 bg-white/10 rounded-full animate-pulse mb-4" />
          <div className="h-10 w-64 bg-white/20 rounded-lg animate-pulse mb-4" />
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Section header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-8 bg-gradient-to-b rounded-full" style={{ backgroundImage: 'linear-gradient(to bottom, var(--sm-surface), var(--sm-border))' }} />
          <div className="h-7 w-40 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', animationDelay: `${i * 50}ms` }}
            >
              {/* Image skeleton with shimmer */}
              <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: 'var(--sm-surface)' }}>
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              <div className="p-5 space-y-3">
                <div className="h-6 w-20 rounded-full animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                <div className="h-6 w-full rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                <div className="h-4 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--sm-border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                  </div>
                  <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="h-10 w-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          <div className="h-10 w-10 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          <div className="h-10 w-10 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          <div className="h-10 w-10 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          <div className="h-10 w-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
        </div>
      </div>
    </div>
  )
}
