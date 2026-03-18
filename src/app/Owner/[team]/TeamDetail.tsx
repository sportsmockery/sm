'use client'

import Link from 'next/link'
import OwnershipCard from '@/components/ownership/OwnershipCard'
import GradeTimeline from '@/components/ownership/GradeTimeline'

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
  payroll_rank: number | null
  market_size_rank: number | null
  win_pct: number | null
  payroll_usd: number | null
  notes: string | null
  agree_count: number
  disagree_count: number
}

interface HistoryPoint {
  recorded_at: string
  spend_grade: number
  results_grade: number
  sentiment_grade: number
  loyalty_tax: number
  overall_grade: number
  trigger_event: string | null
}

const TEAM_NAMES: Record<string, string> = {
  bears: 'Chicago Bears',
  bulls: 'Chicago Bulls',
  blackhawks: 'Chicago Blackhawks',
  cubs: 'Chicago Cubs',
  whitesox: 'Chicago White Sox',
}

function formatMoney(usd: number | null): string {
  if (!usd) return 'N/A'
  return `$${(usd / 1_000_000).toFixed(0)}M`
}

export default function TeamDetail({ grade, history }: { grade: OwnershipGrade; history: HistoryPoint[] }) {
  const teamName = TEAM_NAMES[grade.team_slug] || grade.team_slug

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'calc(var(--sm-nav-height, 72px) + 32px) 24px 64px',
      maxWidth: 800,
      margin: '0 auto',
    }}>
      {/* Breadcrumb */}
      <Link
        href="/Owner"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--sm-text-muted)',
          textDecoration: 'none',
          marginBottom: 24,
        }}
      >
        ← All Report Cards
      </Link>

      {/* Team header */}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', margin: '0 0 8px' }}>
        {teamName} Report Card
      </h1>
      <p style={{ fontSize: 14, color: 'var(--sm-text-dim)', margin: '0 0 32px' }}>
        {grade.season_label} Season &middot; Owner: {grade.owner_name}
        {grade.gm_name && <> &middot; GM: {grade.gm_name}</>}
      </p>

      {/* Main grade card */}
      <div style={{ marginBottom: 32 }}>
        <OwnershipCard grade={grade} showLink={false} />
      </div>

      {/* Key stats */}
      {(grade.payroll_usd || grade.win_pct || grade.payroll_rank) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}>
          {grade.payroll_usd && (
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--sm-border)', background: 'var(--sm-card)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--sm-text)' }}>{formatMoney(grade.payroll_usd)}</div>
              <div style={{ fontSize: 11, color: 'var(--sm-text-muted)', marginTop: 4 }}>Payroll</div>
            </div>
          )}
          {grade.payroll_rank && (
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--sm-border)', background: 'var(--sm-card)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--sm-text)' }}>#{grade.payroll_rank}</div>
              <div style={{ fontSize: 11, color: 'var(--sm-text-muted)', marginTop: 4 }}>Payroll Rank</div>
            </div>
          )}
          {grade.win_pct !== null && grade.win_pct !== undefined && (
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--sm-border)', background: 'var(--sm-card)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--sm-text)' }}>{(grade.win_pct * 100).toFixed(1)}%</div>
              <div style={{ fontSize: 11, color: 'var(--sm-text-muted)', marginTop: 4 }}>Win %</div>
            </div>
          )}
          {grade.market_size_rank && (
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--sm-border)', background: 'var(--sm-card)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--sm-text)' }}>#{grade.market_size_rank}</div>
              <div style={{ fontSize: 11, color: 'var(--sm-text-muted)', marginTop: 4 }}>Market Size</div>
            </div>
          )}
        </div>
      )}

      {/* Grade Timeline */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16 }}>
          Grade Evolution
        </h2>
        <GradeTimeline history={history} />
      </div>
    </div>
  )
}
