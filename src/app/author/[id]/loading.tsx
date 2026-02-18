export default function AuthorLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Header Skeleton */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '64px 0', background: 'linear-gradient(to bottom, var(--sm-surface), var(--sm-dark))' }}>
        <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '0 16px' }}>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="skeleton" style={{ width: '128px', height: '128px', borderRadius: '50%' }} />

            <div style={{ flex: 1 }} className="text-center md:text-left">
              {/* Name */}
              <div className="skeleton" style={{ height: '40px', width: '256px', borderRadius: 'var(--sm-radius-md)', marginBottom: '12px' }} />

              {/* Role */}
              <div className="skeleton" style={{ height: '24px', width: '192px', borderRadius: 'var(--sm-radius-sm)', marginBottom: '16px' }} />

              {/* Bio */}
              <div className="skeleton" style={{ height: '16px', width: '100%', maxWidth: '560px', borderRadius: 'var(--sm-radius-sm)', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '16px', width: '75%', maxWidth: '420px', borderRadius: 'var(--sm-radius-sm)', marginBottom: '8px' }} />

              {/* Social links */}
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  />
                ))}
              </div>
            </div>

            {/* Follow button */}
            <div className="skeleton" style={{ height: '48px', width: '128px', borderRadius: 'var(--sm-radius-md)' }} />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div style={{ padding: '24px 0', borderBottom: '1px solid var(--sm-border)', background: 'var(--sm-card)' }}>
        <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '0 16px' }}>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="skeleton" style={{ height: '40px', width: '80px', margin: '0 auto 8px', borderRadius: 'var(--sm-radius-md)' }} />
                <div className="skeleton" style={{ height: '16px', width: '96px', margin: '0 auto', borderRadius: 'var(--sm-radius-sm)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '48px 16px' }}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="skeleton" style={{ height: '32px', width: '192px', borderRadius: 'var(--sm-radius-md)' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: '40px', width: '80px', borderRadius: 'var(--sm-radius-pill)' }}
                  />
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{ overflow: 'hidden' }}
                >
                  <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '16px', width: '80px', borderRadius: 'var(--sm-radius-sm)', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '24px', width: '100%', borderRadius: 'var(--sm-radius-sm)', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '24px', width: '75%', borderRadius: 'var(--sm-radius-sm)' }} />
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="skeleton" style={{ height: '12px', width: '64px', borderRadius: 'var(--sm-radius-sm)' }} />
                      <div className="skeleton" style={{ height: '12px', width: '12px', borderRadius: '50%' }} />
                      <div className="skeleton" style={{ height: '12px', width: '48px', borderRadius: 'var(--sm-radius-sm)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Latest Section */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="skeleton" style={{ height: '24px', width: '128px', borderRadius: 'var(--sm-radius-sm)', marginBottom: '16px' }} />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <div className="skeleton" style={{ height: '64px', width: '64px', flexShrink: 0, borderRadius: 'var(--sm-radius-md)' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: '16px', width: '100%', borderRadius: 'var(--sm-radius-sm)', marginBottom: '4px' }} />
                      <div className="skeleton" style={{ height: '16px', width: '66%', borderRadius: 'var(--sm-radius-sm)' }} />
                      <div className="skeleton" style={{ height: '12px', width: '64px', borderRadius: 'var(--sm-radius-sm)', marginTop: '8px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Section */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="skeleton" style={{ height: '24px', width: '160px', borderRadius: 'var(--sm-radius-sm)', marginBottom: '16px' }} />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: '16px', width: '100%', borderRadius: 'var(--sm-radius-sm)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="skeleton" style={{ height: '24px', width: '144px', borderRadius: 'var(--sm-radius-sm)', marginBottom: '16px' }} />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <div className="skeleton" style={{ height: '16px', width: '96px', borderRadius: 'var(--sm-radius-sm)' }} />
                      <div className="skeleton" style={{ height: '16px', width: '32px', borderRadius: 'var(--sm-radius-sm)' }} />
                    </div>
                    <div className="skeleton" style={{ height: '8px', width: '100%', borderRadius: 'var(--sm-radius-pill)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
