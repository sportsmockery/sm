export default function PlayerLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Header skeleton */}
      <div className="skeleton" style={{ height: '288px' }} />

      {/* Nav skeleton */}
      <div style={{ height: '56px', borderBottom: '1px solid var(--sm-border)', background: 'var(--sm-card)' }}>
        <div style={{ display: 'flex', maxWidth: 'var(--container-xl)', margin: '0 auto', gap: '16px', padding: '16px' }}>
          {[1, 2, 3].map((i) => (
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
            {/* Stats table skeleton */}
            <div className="skeleton" style={{ height: '192px', borderRadius: 'var(--sm-radius-md)' }} />

            {/* Game log skeleton */}
            <div className="skeleton" style={{ height: '256px', borderRadius: 'var(--sm-radius-md)' }} />
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: '160px', borderRadius: 'var(--sm-radius-md)' }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
