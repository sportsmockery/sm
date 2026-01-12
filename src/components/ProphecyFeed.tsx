'use client'

interface Prediction {
  id: string
  title: string
  confidence: number
  team?: string
}

interface ProphecyFeedProps {
  predictions?: Prediction[]
}

export default function ProphecyFeed({ predictions = [] }: ProphecyFeedProps) {
  const defaultPredictions: Prediction[] = predictions.length > 0 ? predictions : [
    { id: '1', title: 'Bears playoff chances increasing', confidence: 67, team: 'Bears' },
    { id: '2', title: 'Bulls trade deadline moves expected', confidence: 82, team: 'Bulls' },
    { id: '3', title: 'Cubs spring training outlook positive', confidence: 74, team: 'Cubs' },
  ]

  return (
    <aside className="relative overflow-hidden rounded-2xl">
      {/* Animated glowing border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-75 blur-sm animate-[glow_3s_ease-in-out_infinite]" />
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

      {/* Inner content */}
      <div className="relative rounded-2xl bg-zinc-900 p-6">
        {/* Futuristic pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Glowing orbs */}
        <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl" />

        {/* Header */}
        <div className="relative mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-white">AI Predictions</h2>
            <p className="text-xs text-zinc-400">Powered by Sports AI</p>
          </div>
        </div>

        {/* Predictions list */}
        <div className="relative space-y-3">
          {defaultPredictions.map((prediction) => (
            <div
              key={prediction.id}
              className="group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-800"
            >
              <div className="mb-2 flex items-center justify-between">
                {prediction.team && (
                  <span className="text-xs font-medium text-cyan-400">
                    {prediction.team}
                  </span>
                )}
                <span className="text-xs text-zinc-500">
                  {prediction.confidence}% confidence
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-200">
                {prediction.title}
              </p>
              {/* Confidence bar */}
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                  style={{ width: `${prediction.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon badge */}
        <div className="relative mt-4 text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live predictions coming soon
          </span>
        </div>
      </div>
    </aside>
  )
}
