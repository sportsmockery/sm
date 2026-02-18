export default function HomeLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Hero section skeleton */}
      <section className="relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main featured skeleton */}
            <div className="lg:col-span-8">
              <div className="relative overflow-hidden rounded-2xl aspect-[16/10] lg:aspect-[16/9] bg-zinc-800">
                <div className="absolute inset-0 animate-shimmer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 space-y-4">
                  <div className="h-7 w-24 bg-white/20 rounded-full animate-pulse" />
                  <div className="h-12 w-full bg-white/30 rounded-lg animate-pulse" />
                  <div className="h-12 w-3/4 bg-white/30 rounded-lg animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Secondary articles skeleton */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="shrink-0 w-24 h-24 rounded-lg bg-zinc-800 animate-pulse" />
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="h-3 w-16 bg-zinc-700 rounded animate-pulse" />
                    <div className="h-4 w-full bg-zinc-700 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team quick links skeleton */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-zinc-800 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main content skeleton */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Articles column */}
          <div className="lg:col-span-2">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-8 bg-gradient-to-b rounded-full" style={{ backgroundImage: 'linear-gradient(to bottom, var(--sm-surface), var(--sm-border))' }} />
              <div className="h-7 w-40 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            </div>

            {/* Articles grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
                >
                  <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: 'var(--sm-surface)' }}>
                    <div className="absolute inset-0 animate-shimmer" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 w-20 rounded-full animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="h-5 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
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
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Trending skeleton */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
              <div className="h-6 w-24 rounded animate-pulse mb-6" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full animate-pulse shrink-0" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-3 w-2/3 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment orb skeleton */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
              <div className="h-6 w-32 rounded animate-pulse mb-4" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="w-24 h-24 mx-auto rounded-full animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="mt-4 h-4 w-20 mx-auto rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
            </div>

            {/* Newsletter skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
                <div className="h-5 w-24 bg-zinc-700 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-zinc-700/50 rounded animate-pulse mb-4" />
              <div className="h-12 w-full bg-zinc-700 rounded-lg animate-pulse mb-3" />
              <div className="h-12 w-full bg-zinc-600 rounded-lg animate-pulse" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
