export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
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
              <div className="w-1.5 h-8 bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 rounded-full" />
              <div className="h-7 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            </div>

            {/* Articles grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
                >
                  <div className="relative aspect-video bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                        <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Trending skeleton */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment orb skeleton */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
              <div className="w-24 h-24 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="mt-4 h-4 w-20 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
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
