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
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <section className="sm-hero-bg" style={{ position: 'relative', overflow: 'hidden', padding: '64px 0 80px', borderBottom: '1px solid var(--sm-border)' }}>
        <div className="sm-grid-overlay" />
        {/* Glow orbs */}
        <div className="glow-orb" style={{ background: 'rgba(245, 158, 11, 0.08)', width: 400, height: 400, top: -100, left: '25%' }} />
        <div className="glow-orb" style={{ background: 'rgba(249, 115, 22, 0.06)', width: 400, height: 400, bottom: -100, right: '25%' }} />

        <div style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Logo */}
            <div style={{
              marginBottom: 24,
              display: 'flex',
              height: 80,
              width: 80,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--sm-radius-lg)',
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)',
            }}>
              <svg style={{ height: 40, width: 40, color: '#fff' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* Title */}
            <h1 style={{
              marginBottom: 16,
              fontFamily: 'var(--sm-font-heading)',
              fontSize: 'clamp(32px, 6vw, 56px)',
              fontWeight: 900,
              color: 'var(--sm-text)',
              lineHeight: 1.1,
            }}>
              SM{' '}
              <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Prophecy
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{ marginBottom: 32, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: 'var(--sm-text-muted)' }}>
              AI-powered predictions and analysis for Chicago sports. Our models analyze thousands of data points
              to forecast outcomes and provide insights.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--sm-text)' }}>{predictions.length}</div>
                <div style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>Active Predictions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--sm-success)' }}>{accuracy}%</div>
                <div style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>Historical Accuracy</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b' }}>{resolvedPredictions.length}</div>
                <div style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>Resolved Predictions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Predictions */}
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ height: 32, width: 6, borderRadius: 'var(--sm-radius-pill)', background: 'linear-gradient(to bottom, #f59e0b, #ea580c)' }} />
          <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--sm-text)', fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
            Active Predictions
          </h2>
        </div>

        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
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
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ height: 32, width: 6, borderRadius: 'var(--sm-radius-pill)', background: 'linear-gradient(to bottom, var(--sm-text-muted), var(--sm-text-dim))' }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--sm-text)', fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
              Past Predictions
            </h2>
          </div>
          <span className="sm-tag">
            {correctPredictions.length}/{resolvedPredictions.length} Correct
          </span>
        </div>

        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
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
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px 48px' }}>
        <div className="glass-card glass-card-static glass-card-sm" style={{ textAlign: 'center', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <p style={{ fontSize: 13, color: 'rgba(245, 158, 11, 0.7)', margin: 0 }}>
            <strong style={{ color: '#f59e0b' }}>Disclaimer:</strong> SM Prophecy predictions are generated
            for entertainment purposes only. They should not be used as the basis for betting or gambling
            decisions. Past performance does not guarantee future results.
          </p>
        </div>
      </section>

      {/* Back link */}
      <div style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px 64px' }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--sm-text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
        >
          <svg style={{ height: 16, width: 16 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
