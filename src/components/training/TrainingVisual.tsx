import type { VisualType } from '@/lib/training/curriculum'

const ITEMS: Record<VisualType, [string, string][]> = {
  engagement: [
    ['Comments', '20%'],
    ['Time on Page', '20%'],
    ['Scroll Depth', '15%'],
    ['Headline Integrity', '15%'],
    ['Originality', '10%'],
    ['Depth', '10%'],
    ['Accuracy', '10%'],
  ],
  authority: [
    ['Thesis', 'Clear take'],
    ['Context', 'What happened'],
    ['Insight', 'What others missed'],
    ['Why It Matters', 'Chicago fan impact'],
    ['Finish', 'Memorable ending'],
  ],
  signal: [
    ['Rumor / News', 'Identify'],
    ['Source', 'Verify'],
    ['Short Update', 'Publish'],
    ['Evergreen Page', 'Feed'],
    ['Reader Value', 'Inform'],
  ],
  headline: [
    ['Bad', 'Misleading or vague'],
    ['Strong', 'Specific and honest'],
    ['Better', 'Trustworthy + memorable'],
  ],
}

export function TrainingVisual({
  type,
  title,
}: {
  type: VisualType
  title: string
}) {
  const items = ITEMS[type] ?? ITEMS.authority

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="text-cyan-300">✶ EDGE</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
          >
            <div className="text-sm font-semibold text-white">{label}</div>
            <div className="mt-1 text-xs text-zinc-400">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
