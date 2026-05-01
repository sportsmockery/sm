export function TrainingHero({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const pct = total ? Math.round((completed / total) * 100) : 0

  return (
    <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="mb-3 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
        EDGE Writer Training
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Write less filler. Create more impact.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-zinc-300 sm:text-lg">
            Complete the Sports Mockery EDGE curriculum to learn Authority
            Articles, Signal Updates, Engagement Score, headline integrity,
            originality, depth, and accuracy standards.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex justify-between text-sm text-zinc-300">
            <span>Certification Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            {completed} of {total} modules completed.
          </p>
        </div>
      </div>
    </section>
  )
}
