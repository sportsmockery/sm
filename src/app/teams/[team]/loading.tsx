export default function TeamLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Header skeleton */}
      <div className="h-64 animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />

      {/* Nav skeleton */}
      <div className="h-14 border-b" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-6 w-20 animate-pulse rounded"
              style={{ backgroundColor: 'var(--sm-surface)' }}
            />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl"
                  style={{ backgroundColor: 'var(--sm-surface)' }}
                />
              ))}
            </div>

            {/* Table skeleton */}
            <div className="h-96 animate-pulse rounded-xl" style={{ backgroundColor: 'var(--sm-surface)' }} />
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl"
                style={{ backgroundColor: 'var(--sm-surface)' }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
