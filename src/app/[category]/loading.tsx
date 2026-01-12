export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-4 w-24 bg-white/10 rounded-full animate-pulse mb-4" />
          <div className="h-10 w-64 bg-white/20 rounded-lg animate-pulse mb-4" />
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Section header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-8 bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 rounded-full" />
          <div className="h-7 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Image skeleton with shimmer */}
              <div className="relative aspect-video bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              <div className="p-5 space-y-3">
                <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
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

        {/* Pagination skeleton */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
