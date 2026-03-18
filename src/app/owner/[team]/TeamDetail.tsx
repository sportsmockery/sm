'use client'

import Link from 'next/link'
import OwnershipCard from '@/components/ownership/OwnershipCard'
import GradeTimeline from '@/components/ownership/GradeTimeline'
import ScoutCommentary from '@/components/ownership/ScoutCommentary'

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
  season_label?: string
  spend_grade: number
  results_grade: number
  sentiment_grade: number
  loyalty_tax: number
  overall_grade: number
  trigger_event: string | null
  notes?: string | null
}

const TEAM_NAMES: Record<string, string> = {
  bears: 'Chicago Bears',
  bulls: 'Chicago Bulls',
  blackhawks: 'Chicago Blackhawks',
  cubs: 'Chicago Cubs',
  whitesox: 'Chicago White Sox',
}

const TEAM_LOGOS: Record<string, string> = {
  bears: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  bulls: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
  blackhawks: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
  cubs: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
  whitesox: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
}

const TEAM_TENURE: Record<string, {
  owner: string; ownerSince: string;
  gm?: string; gmSince?: string;
  gmRecords?: string[];
}> = {
  bears: {
    owner: 'McCaskey Family', ownerSince: '1983',
    gm: 'Ryan Poles', gmSince: '2022',
    gmRecords: ['2022: 3-14', '2023: 7-10', '2024: 5-12', '2025: 11-6'],
  },
  bulls: {
    owner: 'Jerry Reinsdorf', ownerSince: '1985',
    gm: 'Arturas Karnisovas', gmSince: '2020',
    gmRecords: ['2020-21: 31-41', '2021-22: 46-36', '2022-23: 40-42', '2023-24: 39-43', '2024-25: 23-22*'],
  },
  blackhawks: {
    owner: 'Rocky Wirtz', ownerSince: '2007',
    gm: 'Kyle Davidson', gmSince: '2022',
    gmRecords: ['2022-23: 26-49-7', '2023-24: 23-53-6', '2024-25: 21-22-8*'],
  },
  cubs: {
    owner: 'Ricketts Family', ownerSince: '2009',
    gm: 'Jed Hoyer', gmSince: '2020',
    gmRecords: ['2020: 34-26', '2021: 71-91', '2022: 74-88', '2023: 83-79', '2024: 83-79', '2025: 92-70'],
  },
  whitesox: {
    owner: 'Jerry Reinsdorf', ownerSince: '1981',
    gm: 'Chris Getz', gmSince: '2023',
    gmRecords: ['2024: 41-121', '2025: 60-102'],
  },
}

function formatMoney(usd: number | null): string {
  if (!usd) return 'N/A'
  return `$${(usd / 1_000_000).toFixed(0)}M`
}

export default function TeamDetail({ grade, history }: { grade: OwnershipGrade; history: HistoryPoint[] }) {
  const teamName = TEAM_NAMES[grade.team_slug] || grade.team_slug
  const tenure = TEAM_TENURE[grade.team_slug]
  const currentYear = new Date().getFullYear()

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'calc(var(--sm-nav-height, 72px) + 8px) 24px 64px',
      maxWidth: 800,
      margin: '0 auto',
    }}>
      {/* Breadcrumb */}
      <Link
        href="/owner"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--sm-text-muted)',
          textDecoration: 'none',
          marginBottom: 24,
          lineHeight: 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        All Report Cards
      </Link>

      {/* Team header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', margin: '0 0 8px' }}>
            {teamName} Report Card
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sm-text-dim)', margin: '0 0 20px', lineHeight: 1.5 }}>
            {grade.season_label} Season &middot; Grades reflect 3 years of ownership performance (Q1 2023 – Present)
          </p>
        </div>
        {TEAM_LOGOS[grade.team_slug] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={TEAM_LOGOS[grade.team_slug]}
            alt={teamName}
            style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0, opacity: 0.9 }}
          />
        )}
      </div>

      {/* Owner & GM Tenure */}
      {tenure && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: tenure.gm ? '1fr 1fr' : '1fr',
          gap: 12,
          marginBottom: 32,
        }}>
          <div style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--sm-border)',
            background: 'var(--sm-card)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginBottom: 6 }}>Owner</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sm-text)', lineHeight: 1.2 }}>{tenure.owner}</div>
            <div style={{ fontSize: 12, color: 'var(--sm-text-dim)', marginTop: 4 }}>Since {tenure.ownerSince} ({currentYear - Number(tenure.ownerSince)} years)</div>
          </div>
          {tenure.gm && (
            <div style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--sm-border)',
              background: 'var(--sm-card)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginBottom: 6 }}>GM / President</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sm-text)', lineHeight: 1.2 }}>{tenure.gm}</div>
                <span style={{ fontSize: 12, color: 'var(--sm-text-dim)' }}>Since {tenure.gmSince}</span>
              </div>
              {tenure.gmRecords && tenure.gmRecords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {tenure.gmRecords.map(rec => {
                    const [year, record] = rec.split(': ')
                    return (
                      <span key={year} style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: 'var(--sm-surface)',
                        border: '1px solid var(--sm-border)',
                        color: 'var(--sm-text)',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{ color: 'var(--sm-text-dim)' }}>{year}:</span> {record?.replace('*', '')}{record?.includes('*') ? <span style={{ color: 'var(--sm-text-dim)' }}> *</span> : null}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* Signings & Transactions Timeline */}
      {history.filter(h => h.notes).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16 }}>
            Key Moves & Transactions
          </h2>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: 7,
              top: 8,
              bottom: 8,
              width: 2,
              backgroundColor: 'var(--sm-border)',
            }} />

            {[...history].filter(h => h.notes).reverse().map((h, i, arr) => {
              const overallNum = Number(h.overall_grade)
              const prevIdx = i < arr.length - 1 ? i + 1 : null
              const prevOverall = prevIdx !== null ? Number(arr[prevIdx].overall_grade) : null
              const delta = prevOverall !== null ? overallNum - prevOverall : null
              const gradeColor = overallNum >= 7 ? '#00d084' : overallNum >= 5 ? '#facc15' : overallNum >= 3 ? '#fb923c' : '#ef4444'

              return (
                <div
                  key={h.recorded_at}
                  style={{
                    position: 'relative',
                    paddingBottom: i < arr.length - 1 ? 20 : 0,
                  }}
                >
                  {/* Dot on the line */}
                  <div style={{
                    position: 'absolute',
                    left: -24,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: gradeColor,
                    border: '2px solid var(--sm-card, #0B0F14)',
                    zIndex: 1,
                  }} />

                  {/* Quarter label */}
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--sm-text-muted)',
                    marginBottom: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    {h.season_label || new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    <span style={{ color: gradeColor, fontWeight: 700, fontSize: 12 }}>
                      {overallNum.toFixed(1)}
                    </span>
                    {delta !== null && delta !== 0 && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: delta > 0 ? '#00d084' : '#ef4444',
                      }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Event text */}
                  <div style={{ fontSize: 13, color: 'var(--sm-text)', lineHeight: 1.5 }}>
                    {h.notes}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scout Commentary */}
      <ScoutCommentary teamSlug={grade.team_slug} />
    </div>
  )
}
