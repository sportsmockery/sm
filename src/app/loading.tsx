export default function HomeLoading() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* Hero skeleton */}
      <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div className="sm-container" style={{ textAlign: 'center', width: '100%' }}>
          {/* Tag skeleton */}
          <div style={{ display: 'inline-block', height: 28, width: 200, borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-card)', marginBottom: 24 }} className="animate-pulse" />

          {/* Headline skeletons */}
          <div style={{ height: 56, width: '60%', borderRadius: 12, background: 'var(--sm-card)', margin: '0 auto 16px' }} className="animate-pulse" />
          <div style={{ height: 56, width: '40%', borderRadius: 12, background: 'var(--sm-card)', margin: '0 auto 24px' }} className="animate-pulse" />

          {/* Subtitle skeleton */}
          <div style={{ height: 20, width: 420, maxWidth: '80%', borderRadius: 8, background: 'var(--sm-card)', margin: '0 auto 40px' }} className="animate-pulse" />

          {/* Button skeletons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <div style={{ height: 50, width: 160, borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-card)' }} className="animate-pulse" />
            <div style={{ height: 50, width: 160, borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-card)' }} className="animate-pulse" />
          </div>

          {/* Team logos skeleton */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--sm-card)' }} className="animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Feed skeleton */}
      <section style={{ position: 'relative', zIndex: 1 }}>
        <div className="sm-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ height: 28, width: 100, borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-card)' }} className="animate-pulse" />
            <div style={{ height: 36, width: 280, borderRadius: 12, background: 'var(--sm-card)' }} className="animate-pulse" />
          </div>

          {/* Cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Image skeleton */}
                <div style={{ aspectRatio: '16/9', background: 'var(--sm-surface)' }} className="animate-pulse" />
                {/* Content */}
                <div style={{ padding: 24 }}>
                  <div style={{ height: 24, width: 80, borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-surface)', marginBottom: 12 }} className="animate-pulse" />
                  <div style={{ height: 20, width: '100%', borderRadius: 8, background: 'var(--sm-surface)', marginBottom: 8 }} className="animate-pulse" />
                  <div style={{ height: 20, width: '70%', borderRadius: 8, background: 'var(--sm-surface)', marginBottom: 16 }} className="animate-pulse" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--sm-surface)' }} className="animate-pulse" />
                    <div style={{ height: 14, width: 100, borderRadius: 6, background: 'var(--sm-surface)' }} className="animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
