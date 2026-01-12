export default function AuthorLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-zinc-50 dark:bg-zinc-950">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-50 py-16 dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="h-32 w-32 rounded-full bg-zinc-300 dark:bg-zinc-700 md:h-40 md:w-40" />

            <div className="flex-1 text-center md:text-left">
              {/* Name */}
              <div className="mx-auto mb-3 h-10 w-64 rounded-lg bg-zinc-300 dark:bg-zinc-700 md:mx-0" />

              {/* Role */}
              <div className="mx-auto mb-4 h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-800 md:mx-0" />

              {/* Bio */}
              <div className="mx-auto mb-2 h-4 w-full max-w-xl rounded bg-zinc-200 dark:bg-zinc-800 md:mx-0" />
              <div className="mx-auto mb-2 h-4 w-3/4 max-w-md rounded bg-zinc-200 dark:bg-zinc-800 md:mx-0" />

              {/* Social links */}
              <div className="mt-6 flex justify-center gap-3 md:justify-start">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700"
                  />
                ))}
              </div>
            </div>

            {/* Follow button */}
            <div className="h-12 w-32 rounded-xl bg-zinc-300 dark:bg-zinc-700" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="border-b border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-2 h-10 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="mx-auto h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
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
              <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800"
                  />
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="aspect-video bg-zinc-200 dark:bg-zinc-800" />
                  <div className="p-4">
                    <div className="mb-2 h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="mb-2 h-6 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-6 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Latest Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1">
                      <div className="mb-1 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="mt-2 h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex-1">
                      <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 h-6 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="mb-1 flex justify-between">
                      <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-4 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
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
