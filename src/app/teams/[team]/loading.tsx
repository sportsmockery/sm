export default function TeamLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Header skeleton */}
      <div className="skeleton" style={{ height: '256px' }} />

      {/* Nav skeleton */}
      <div style={{ height: '56px', borderBottom: '1px solid var(--sm-border)', background: 'var(--sm-card)' }}>
        <div style={{ display: 'flex', maxWidth: 'var(--container-xl)', margin: '0 auto', gap: '16px', padding: '16px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '24px', width: '80px', borderRadius: 'var(--sm-radius-sm)' }}
            />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <main style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: '96px', borderRadius: 'var(--sm-radius-md)' }}
                />
              ))}
            </div>

            {/* Table skeleton */}
            <div className="skeleton" style={{ height: '384px', borderRadius: 'var(--sm-radius-md)' }} />
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: '192px', borderRadius: 'var(--sm-radius-md)' }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
