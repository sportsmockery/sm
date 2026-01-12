export default function PlayerLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header skeleton */}
      <div className="h-72 animate-pulse bg-zinc-200 dark:bg-zinc-800" />

      {/* Nav skeleton */}
      <div className="h-14 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-6 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats table skeleton */}
            <div className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />

            {/* Game log skeleton */}
            <div className="h-64 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
