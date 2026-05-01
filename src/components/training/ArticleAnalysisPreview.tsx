const METRICS: { label: string; value: string; weight: string; tone: 'good' | 'mid' | 'low' }[] = [
  { label: 'Engagement Score', value: '78', weight: 'overall', tone: 'good' },
  { label: 'Comments', value: '12', weight: '20%', tone: 'good' },
  { label: 'Time on Page', value: '1:42', weight: '20%', tone: 'good' },
  { label: 'Scroll Depth', value: '68%', weight: '15%', tone: 'mid' },
  { label: 'Headline Integrity', value: '92%', weight: '15%', tone: 'good' },
  { label: 'Originality', value: '74%', weight: '10%', tone: 'mid' },
  { label: 'Depth', value: '62%', weight: '10%', tone: 'mid' },
  { label: 'Accuracy', value: '95%', weight: '10%', tone: 'good' },
]

const toneColor: Record<'good' | 'mid' | 'low', string> = {
  good: 'text-cyan-300',
  mid: 'text-amber-300',
  low: 'text-red-300',
}

export function ArticleAnalysisPreview() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Article Analysis Detail · Google Tab
          </div>
          <h3 className="mt-1 text-xl font-bold">
            Sample: “Caleb Williams’ Latest Comments…”
          </h3>
        </div>
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          Strong
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
          >
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              {m.label}
            </div>
            <div className={`mt-1 text-2xl font-bold ${toneColor[m.tone]}`}>
              {m.value}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{m.weight}</div>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4 text-sm text-cyan-100">
        If this score is low, do not ask how to get more clicks. Ask which part
        of the reader experience failed.
      </p>
    </div>
  )
}
