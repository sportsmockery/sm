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
      padding: 'calc(var(--sm-nav-height, 72px) + 16px) 24px 64px',
      maxWidth: 'var(--sm-max-width, 1200px)',
      margin: '0 auto',
    }}>
      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#FAFAFB',
            backgroundColor: '#BC0000',
            padding: '3px 8px',
            borderRadius: 4,
            lineHeight: 1,
          }}>
            Data Lab
          </div>
        </div>
        <h1 style={{
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 800,
          color: 'var(--sm-text)',
          margin: '0 0 8px',
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
        }}>
          Owner & GM Report Cards
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--sm-text-dim)',
          maxWidth: 520,
          margin: 0,
          lineHeight: 1.5,
        }}>
          Data-backed grades on every Chicago ownership group. Spending, Results, Fan Sentiment, and Loyalty Tax.
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
