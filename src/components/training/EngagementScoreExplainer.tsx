export function EngagementScoreExplainer() {
  const rows: [string, string, string][] = [
    ['Comments', '20%', 'Measures discussion and reader response.'],
    ['Time on Page', '20%', 'Measures whether readers actually stay.'],
    ['Scroll Depth', '15%', 'Measures whether readers finish the article.'],
    ['Headline Integrity', '15%', 'Measures whether the headline matched the story.'],
    ['Originality', '10%', 'Measures whether the piece adds new value.'],
    ['Depth', '10%', 'Measures insight vs surface-level writing.'],
    ['Accuracy', '10%', 'Measures factual trust and rumor framing.'],
  ]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <h3 className="text-xl font-bold">Engagement Score Formula</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Each weighting feeds the per-article score on your dashboard.
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        {rows.map(([name, weight, desc]) => (
          <div
            key={name}
            className="grid grid-cols-[120px_60px_1fr] gap-3 border-b border-white/10 p-3 text-sm last:border-b-0 sm:grid-cols-[160px_80px_1fr]"
          >
            <div className="font-semibold text-white">{name}</div>
            <div className="text-cyan-300">{weight}</div>
            <div className="text-zinc-400">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
