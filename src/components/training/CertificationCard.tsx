export function CertificationCard({
  certified,
  score,
  completed,
  total,
}: {
  certified: boolean
  score: number
  completed: number
  total: number
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6 text-center sm:p-8">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-3xl text-cyan-300">
        ✶
      </div>
      <h3 className="text-2xl font-bold">
        {certified ? 'EDGE Certified' : 'Certification Pending'}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
        {certified
          ? 'You are certified to publish under the EDGE writer standard.'
          : 'Complete every module and pass the final certification to unlock Authority Article publishing.'}
      </p>

      <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="text-xs uppercase tracking-wider text-zinc-400">
            Modules
          </div>
          <div className="text-xl font-bold text-white">
            {completed}
            <span className="text-sm text-zinc-500">/{total}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="text-xs uppercase tracking-wider text-zinc-400">
            Score
          </div>
          <div className="text-xl font-bold text-cyan-300">{score}%</div>
        </div>
      </div>
    </div>
  )
}
