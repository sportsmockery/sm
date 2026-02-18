import { Metadata } from 'next'
import Link from 'next/link'
import PredictionCard from '@/components/PredictionCard'

export const metadata: Metadata = {
  title: 'SM Prophecy | AI Predictions - Sports Mockery',
  description: 'AI-powered predictions and analysis for Chicago sports. See our track record and latest forecasts.',
}

const predictions = [
  {
    id: '1',
    title: 'Bears vs Packers Week 18',
    prediction: 'The Bears will cover the spread with a strong defensive performance. Expect 3+ turnovers forced and under 200 passing yards allowed.',
    confidence: 78,
    outcome: 'pending' as const,
    team: 'Bears',
    teamColor: '#C83200',
    timestamp: 'January 5, 2026',
    reasoning: 'Historical data shows the Bears defense performs 34% better in divisional games. Combined with recent improvements in secondary coverage and the Packers&apos; road struggles, our model projects a high-probability cover scenario.',
  },
  {
    id: '2',
    title: 'Bulls Trade Deadline Move',
    prediction: 'The Bulls will make a significant trade before the deadline, moving at least one veteran for draft capital and young talent.',
    confidence: 65,
    outcome: 'pending' as const,
    team: 'Bulls',
    teamColor: '#CE1141',
    timestamp: 'January 4, 2026',
    reasoning: 'Cap analysis indicates flexibility for a rebuild-focused move. Front office tendencies and recent player evaluations suggest a pivot toward youth development.',
  },
  {
    id: '3',
    title: 'Cubs Opening Day Rotation',
    prediction: 'The Cubs will have a completely revamped starting rotation with 3 new acquisitions by Opening Day.',
    confidence: 82,
    outcome: 'pending' as const,
    team: 'Cubs',
    teamColor: '#0E3386',
    timestamp: 'January 3, 2026',
    reasoning: 'Payroll flexibility and stated organizational goals align with aggressive pitching acquisition. Market conditions favor buyers with deep pockets.',
  },
  {
    id: '4',
    title: 'White Sox Rebuild Timeline',
    prediction: 'The rebuild will see meaningful results within 2 seasons, with a .500+ record by 2028.',
    confidence: 54,
    outcome: 'pending' as const,
    team: 'White Sox',
    teamColor: '#27251F',
    timestamp: 'January 2, 2026',
    reasoning: 'Farm system analysis shows above-average talent progression. Historical rebuild comparisons and prospect development timelines support this projection.',
  },
  {
    id: '5',
    title: 'Blackhawks Playoff Push',
    prediction: 'Despite early struggles, the Blackhawks will make a late-season push and finish within 5 points of a playoff spot.',
    confidence: 41,
    outcome: 'pending' as const,
    team: 'Blackhawks',
    teamColor: '#CF0A2C',
    timestamp: 'January 1, 2026',
    reasoning: 'Young core development trajectory and favorable second-half schedule create a narrow path to contention. High variance but possible.',
  },
]

const pastPredictions = [
  {
    id: '101',
    title: 'Bears Draft Pick',
    prediction: 'The Bears will select an offensive lineman in the first round of the 2025 draft.',
    confidence: 71,
    outcome: 'correct' as const,
    team: 'Bears',
    teamColor: '#C83200',
    timestamp: 'April 2025',
  },
  {
    id: '102',
    title: 'Bulls All-Star Selection',
    prediction: 'The Bulls will have at least one All-Star representative.',
    confidence: 58,
    outcome: 'incorrect' as const,
    team: 'Bulls',
    teamColor: '#CE1141',
    timestamp: 'February 2025',
  },
  {
    id: '103',
    title: 'Cubs Postseason',
    prediction: 'The Cubs will make the postseason and win at least one series.',
    confidence: 62,
    outcome: 'correct' as const,
    team: 'Cubs',
    teamColor: '#0E3386',
    timestamp: 'October 2025',
  },
]

export default function PredictionsPage() {
  // Calculate accuracy stats - pastPredictions only contains resolved predictions
  const resolvedPredictions = pastPredictions
  const correctPredictions = resolvedPredictions.filter(p => p.outcome === 'correct')
  const accuracy = resolvedPredictions.length > 0
    ? Math.round((correctPredictions.length / resolvedPredictions.length) * 100)
    : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24" style={{ borderBottom: '1px solid var(--sm-border)' }}>
        {/* Background effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,165,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,165,0,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/30">
              <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="mb-4 font-heading text-4xl font-black sm:text-5xl lg:text-6xl" style={{ color: 'var(--sm-text)' }}>
              SM{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Prophecy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-8 max-w-2xl text-lg" style={{ color: 'var(--sm-text-muted)' }}>
              AI-powered predictions and analysis for Chicago sports. Our models analyze thousands of data points
              to forecast outcomes and provide insights.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-black" style={{ color: 'var(--sm-text)' }}>{predictions.length}</div>
                <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Active Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">{accuracy}%</div>
                <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Historical Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-amber-400">{resolvedPredictions.length}</div>
                <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Resolved Predictions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Predictions */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--sm-text)' }}>
            Active Predictions
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PredictionCard {...prediction} />
            </div>
          ))}
        </div>
      </section>

      {/* Past Predictions */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1.5 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--sm-text-muted), var(--sm-text-dim))' }} />
            <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--sm-text)' }}>
              Past Predictions
            </h2>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
            {correctPredictions.length}/{resolvedPredictions.length} Correct
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pastPredictions.map((prediction, index) => (
            <div
              key={prediction.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PredictionCard {...prediction} />
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl bg-amber-500/10 p-6 text-center">
          <p className="text-sm text-amber-300/80">
            <strong className="text-amber-300">Disclaimer:</strong> SM Prophecy predictions are generated
            for entertainment purposes only. They should not be used as the basis for betting or gambling
            decisions. Past performance does not guarantee future results.
          </p>
        </div>
      </section>

      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--sm-text-muted)' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
