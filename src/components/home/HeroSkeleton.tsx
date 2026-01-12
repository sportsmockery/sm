export default function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden bg-zinc-900">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main featured skeleton */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-2xl aspect-[16/10] lg:aspect-[16/9] bg-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 space-y-4">
                <div className="h-7 w-24 bg-white/20 rounded-full animate-pulse" />
                <div className="h-10 w-full bg-white/30 rounded-lg animate-pulse" />
                <div className="h-10 w-3/4 bg-white/30 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Secondary articles skeleton */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-zinc-800 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
