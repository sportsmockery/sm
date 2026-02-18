export default function PlayerLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Header skeleton */}
      <div className="h-72 animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />

      {/* Nav skeleton */}
      <div className="h-14 border-b" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4">
          {[1, 2, 3].map((i) => (
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
            {/* Stats table skeleton */}
            <div className="h-48 animate-pulse rounded-xl" style={{ backgroundColor: 'var(--sm-surface)' }} />

            {/* Game log skeleton */}
            <div className="h-64 animate-pulse rounded-xl" style={{ backgroundColor: 'var(--sm-surface)' }} />
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl"
                style={{ backgroundColor: 'var(--sm-surface)' }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
