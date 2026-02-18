export default function SearchLoading() {
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 py-16">
        <div className="mx-auto max-w-4xl px-4">
          {/* Title */}
          <div className="mx-auto mb-6 h-12 w-64 rounded-lg bg-zinc-700" />

          {/* Search input skeleton */}
          <div className="h-16 w-full rounded-2xl bg-zinc-700" />

          {/* Popular searches */}
          <div className="mt-8">
            <div className="mx-auto mb-4 h-4 w-32 rounded bg-zinc-700" />
            <div className="flex flex-wrap justify-center gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 rounded-full bg-zinc-700"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar filters */}
          <aside className="hidden lg:block">
            <div className="h-80 rounded-xl" style={{ backgroundColor: 'var(--sm-surface)' }} />
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="h-6 w-48 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
            </div>

            {/* Result cards */}
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border p-4"
                  style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
                >
                  <div className="h-24 w-24 flex-shrink-0 rounded-xl sm:h-32 sm:w-32" style={{ backgroundColor: 'var(--sm-surface)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="h-6 w-full rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="h-6 w-3/4 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-4 w-20 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
