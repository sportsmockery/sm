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
      padding: 'calc(var(--sm-nav-height, 72px) + 16px) 24px 64px',
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
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sm-text)', lineHeight: 1.2 }}>{tenure.gm}</div>
              <div style={{ fontSize: 12, color: 'var(--sm-text-dim)', marginTop: 4 }}>Since {tenure.gmSince} ({currentYear - Number(tenure.gmSince)} years)</div>
            </div>
          )}
        </div>
      )}

      {/* GM-Era Records */}
      {tenure?.gmRecords && tenure.gmRecords.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 12 }}>
            Record Under {tenure.gm}
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {tenure.gmRecords.map(rec => {
              const [year, record] = rec.split(': ')
              const isInProgress = record?.includes('*')
              return (
                <div key={year} style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--sm-border)',
                  background: 'var(--sm-card)',
                  textAlign: 'center',
                  minWidth: 80,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--sm-text-muted)', fontWeight: 600, marginBottom: 2 }}>{year}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sm-text)', lineHeight: 1 }}>
                    {record?.replace('*', '')}
                  </div>
                  {isInProgress && <div style={{ fontSize: 10, color: 'var(--sm-text-dim)', marginTop: 2 }}>In Progress</div>}
                </div>
              )
            })}
          </div>
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

      {/* Signings & Transactions Log */}
      {history.filter(h => h.notes).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16 }}>
            Key Moves & Transactions
          </h2>
          <div style={{
            borderRadius: 12,
            border: '1px solid var(--sm-border)',
            background: 'var(--sm-card)',
            overflow: 'hidden',
          }}>
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
                    display: 'flex',
                    gap: 14,
                    padding: '14px 16px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--sm-border)' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Quarter label */}
                  <div style={{
                    flexShrink: 0,
                    width: 64,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--sm-text-muted)',
                    paddingTop: 1,
                  }}>
                    {h.season_label || new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>

                  {/* Dot + line */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: gradeColor,
                      flexShrink: 0,
                    }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--sm-text)', lineHeight: 1.5 }}>
                      {h.notes}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 12 }}>
                      <span style={{ color: gradeColor, fontWeight: 700 }}>
                        {overallNum.toFixed(1)}
                      </span>
                      {delta !== null && delta !== 0 && (
                        <span style={{
                          color: delta > 0 ? '#00d084' : '#ef4444',
                          fontWeight: 600,
                        }}>
                          {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
