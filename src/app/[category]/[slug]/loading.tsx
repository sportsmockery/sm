export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero image skeleton */}
      <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 -mt-24">
        {/* Content card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Category badge */}
          <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse mb-6" />

          {/* Title skeleton */}
          <div className="space-y-3 mb-8">
            <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-10 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>

          {/* Meta info skeleton */}
          <div className="flex items-center gap-6 pb-8 mb-8 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            {/* Paragraph 1 */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Paragraph 2 */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
            </div>

            {/* Quote block skeleton */}
            <div className="pl-6 border-l-4 border-zinc-300 dark:border-zinc-700 py-4">
              <div className="space-y-2">
                <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>

            {/* Paragraph 3 */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>

          {/* Tags skeleton */}
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Related articles skeleton */}
        <div className="mt-12 pb-12">
          <div className="h-7 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
