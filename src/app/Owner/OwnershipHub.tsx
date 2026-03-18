'use client'

import OwnershipCard from '@/components/ownership/OwnershipCard'
import LeagueCompareTable from '@/components/ownership/LeagueCompareTable'

interface OwnershipGrade {
  id: string
  team_slug: string
  league: string
  owner_name: string
  gm_name: string | null
  season_label: string
  spend_grade: number
  results_grade: number
  sentiment_grade: number
  loyalty_tax: number
  overall_grade: number
  notes: string | null
  agree_count: number
  disagree_count: number
}

export default function OwnershipHub({ grades }: { grades: OwnershipGrade[] }) {
  return (
    <div style={{
      minHeight: '100vh',
      padding: 'calc(var(--sm-nav-height, 72px) + 32px) 24px 64px',
      maxWidth: 'var(--sm-max-width, 1200px)',
      margin: '0 auto',
    }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--sm-red)',
          marginBottom: 8,
        }}>
          Sports Mockery Data Lab
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--sm-text)',
          margin: '0 0 12px',
          lineHeight: 1.1,
        }}>
          Owner & GM Report Cards
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--sm-text-dim)',
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          Transparent, data-backed grades on every Chicago ownership group.
          Four dimensions: Spending, Results, Fan Sentiment, and Loyalty Tax.
        </p>
      </div>

      {/* League Comparison Table */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16 }}>
          League Comparison
        </h2>
        <LeagueCompareTable grades={grades} />
      </div>

      {/* Team Cards Grid */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16 }}>
          Team Report Cards
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {grades.map(grade => (
            <OwnershipCard key={grade.id} grade={grade} />
          ))}
        </div>
      </div>

      {/* Methodology note */}
      <div style={{
        padding: 20,
        borderRadius: 12,
        border: '1px solid var(--sm-border)',
        background: 'var(--sm-card)',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--sm-text)', margin: '0 0 8px' }}>
          How We Grade
        </h3>
        <div style={{ fontSize: 13, color: 'var(--sm-text-dim)', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 8px' }}><strong>Spending (0-10):</strong> How much does ownership invest relative to market size? Measures payroll rank vs. expected rank for a top-3 market.</p>
          <p style={{ margin: '0 0 8px' }}><strong>Results (0-10):</strong> Are they winning? Win percentage percentile plus payroll efficiency (wins per dollar).</p>
          <p style={{ margin: '0 0 8px' }}><strong>Fan Sentiment (0-10):</strong> AI-aggregated fan sentiment from Reddit, Twitter/X, and local media. Updated quarterly.</p>
          <p style={{ margin: 0 }}><strong>Loyalty Tax (0-10, lower is better):</strong> Broken promises, failed rebuilds, and superstar departures. The cost of being a loyal fan.</p>
        </div>
      </div>
    </div>
  )
}
