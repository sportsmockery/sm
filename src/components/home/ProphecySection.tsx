import GlowCard from '@/components/ui/GlowCard'

interface Prediction {
  id: string
  text: string
  confidence: number
  team: string
  date: string
}

const samplePredictions: Prediction[] = [
  { id: '1', text: "Bears clinch NFC North by Week 17", confidence: 78, team: 'bears', date: 'Dec 22' },
  { id: '2', text: "Bulls make Eastern Conference playoffs", confidence: 65, team: 'bulls', date: 'Dec 20' },
  { id: '3', text: "Cubs trade for ace pitcher before deadline", confidence: 72, team: 'cubs', date: 'Dec 19' },
  { id: '4', text: "Blackhawks rookie wins Calder Trophy", confidence: 58, team: 'blackhawks', date: 'Dec 18' },
]

interface ProphecySectionProps {
  predictions?: Prediction[]
  className?: string
}

export default function ProphecySection({
  predictions = samplePredictions,
  className = '',
}: ProphecySectionProps) {
  return (
    <section className={className}>
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#FF0000] to-[#8B0000]" />
          <h2 className="font-heading text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
            AI Prophecies
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Powered by Claude AI
        </div>
      </div>

      {/* Predictions grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {predictions.map((prediction, index) => (
          <GlowCard
            key={prediction.id}
            color={prediction.confidence >= 70 ? 'red' : 'blue'}
            className="p-6 animate-fade-in"
          >
            {/* Prediction text */}
            <p className="mb-4 font-heading text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
              &ldquo;{prediction.text}&rdquo;
            </p>

            {/* Confidence meter */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span style={{ color: 'var(--sm-text-muted)' }}>Confidence</span>
                <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>
                  {prediction.confidence}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
                <div
                  className={`h-full rounded-full transition-all ${
                    prediction.confidence >= 70
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : prediction.confidence >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                      : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{
                    width: `${prediction.confidence}%`,
                    animationDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sm-text-muted)' }}>
              <span className="capitalize">{prediction.team}</span>
              <span>{prediction.date}</span>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-center text-xs" style={{ color: 'var(--sm-text-muted)' }}>
        AI predictions are for entertainment purposes only. Not financial or betting advice.
      </p>
    </section>
  )
}
