export default function AuthorLoading() {
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-b py-16" style={{ backgroundImage: 'linear-gradient(to bottom, var(--sm-surface), var(--sm-card))' }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="h-32 w-32 rounded-full md:h-40 md:w-40" style={{ backgroundColor: 'var(--sm-surface)' }} />

            <div className="flex-1 text-center md:text-left">
              {/* Name */}
              <div className="mx-auto mb-3 h-10 w-64 rounded-lg md:mx-0" style={{ backgroundColor: 'var(--sm-surface)' }} />

              {/* Role */}
              <div className="mx-auto mb-4 h-6 w-48 rounded md:mx-0" style={{ backgroundColor: 'var(--sm-surface)' }} />

              {/* Bio */}
              <div className="mx-auto mb-2 h-4 w-full max-w-xl rounded md:mx-0" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="mx-auto mb-2 h-4 w-3/4 max-w-md rounded md:mx-0" style={{ backgroundColor: 'var(--sm-surface)' }} />

              {/* Social links */}
              <div className="mt-6 flex justify-center gap-3 md:justify-start">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full"
                    style={{ backgroundColor: 'var(--sm-surface)' }}
                  />
                ))}
              </div>
            </div>

            {/* Follow button */}
            <div className="h-12 w-32 rounded-xl" style={{ backgroundColor: 'var(--sm-surface)' }} />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="border-b py-6" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-2 h-10 w-20 rounded-lg" style={{ backgroundColor: 'var(--sm-surface)' }} />
                <div className="mx-auto h-4 w-24 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-20 rounded-full"
                    style={{ backgroundColor: 'var(--sm-surface)' }}
                  />
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border"
                  style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
                >
                  <div className="aspect-video" style={{ backgroundColor: 'var(--sm-surface)' }} />
                  <div className="p-4">
                    <div className="mb-2 h-4 w-20 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="mb-2 h-6 w-full rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="h-6 w-3/4 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-3 w-12 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Latest Section */}
            <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
              <div className="mb-4 h-6 w-32 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="flex-1">
                      <div className="mb-1 h-4 w-full rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-4 w-2/3 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="mt-2 h-3 w-16 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Section */}
            <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
              <div className="mb-4 h-6 w-40 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    <div className="flex-1">
                      <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
              <div className="mb-4 h-6 w-36 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="mb-1 flex justify-between">
                      <div className="h-4 w-24 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                      <div className="h-4 w-8 rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
                    </div>
                    <div className="h-2 w-full rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }} />
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
