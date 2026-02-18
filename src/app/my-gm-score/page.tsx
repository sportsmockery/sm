'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface MockDraft {
  id: string
  chicago_team: string
  sport: string
  draft_year: number
  completed: boolean
  completed_at: string | null
  mock_score: number | null
  value_score: number | null
  need_fit_score: number | null
  upside_risk_score: number | null
  mock_grade_letter: string | null
  is_best_of_three: boolean
  created_at: string
}

interface UserScore {
  user_id: string
  combined_gm_score: number | null
  best_trade_score: number | null
  best_mock_draft_score: number | null
  best_mock_draft_id: string | null
  trade_count: number
  mock_count: number
  trade_weight: number
  mock_weight: number
}

interface TradeStats {
  total: number
  accepted: number
  average_grade: number
}

interface AnalyticsData {
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  dangerous_trades: number
  average_grade: number
  highest_grade: number
  lowest_grade: number
  total_gm_score: number
  grade_distribution: Array<{
    bucket: string
    count: number
    percentage: number
  }>
  trading_partners: Array<{
    team_name: string
    team_key: string
    trade_count: number
    avg_grade: number
  }>
  chicago_teams: Array<{
    team: string
    trade_count: number
    avg_grade: number
    accepted_rate: number
  }>
}

const CHICAGO_TEAMS: Record<string, { name: string; logo: string; color: string }> = {
  bears: { name: 'Chicago Bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', color: '#0B162A' },
  bulls: { name: 'Chicago Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', color: '#CE1141' },
  blackhawks: { name: 'Chicago Blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', color: '#CF0A2C' },
  cubs: { name: 'Chicago Cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', color: '#0E3386' },
  whitesox: { name: 'Chicago White Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', color: '#27251F' },
}

export default function MyGMScorePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [userScore, setUserScore] = useState<UserScore | null>(null)
  const [mockDrafts, setMockDrafts] = useState<MockDraft[]>([])
  const [tradeStats, setTradeStats] = useState<TradeStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settingBest, setSettingBest] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login?next=/my-gm-score')
      return
    }

    fetchData()
  }, [authLoading, isAuthenticated, router])

  async function fetchData() {
    try {
      // Fetch combined score data
      const scoreRes = await fetch('/api/gm/user-score')
      if (scoreRes.ok) {
        const scoreData = await scoreRes.json()
        setUserScore(scoreData.user_score)
        setMockDrafts(scoreData.mock_drafts || [])
        setTradeStats(scoreData.trade_stats)
      }

      // Also fetch detailed trade analytics
      const analyticsRes = await fetch('/api/gm/analytics')
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }
    } catch (e) {
      setError('Failed to load GM score data')
    } finally {
      setLoading(false)
    }
  }

  async function setBestMock(mockId: string) {
    setSettingBest(mockId)
    try {
      const res = await fetch('/api/gm/user-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock_id: mockId }),
      })
      if (res.ok) {
        // Refresh data
        await fetchData()
      }
    } catch (e) {
      console.error('Failed to set best mock:', e)
    } finally {
      setSettingBest(null)
    }
  }

  function getLetterGrade(grade: number): string {
    if (grade >= 90) return 'A'
    if (grade >= 85) return 'A-'
    if (grade >= 80) return 'B+'
    if (grade >= 75) return 'B'
    if (grade >= 70) return 'B-'
    if (grade >= 65) return 'C+'
    if (grade >= 60) return 'C'
    if (grade >= 55) return 'C-'
    if (grade >= 50) return 'D+'
    if (grade >= 40) return 'D'
    return 'F'
  }

  function getGradeColor(grade: number): string {
    if (grade >= 90) return '#10b981'
    if (grade >= 80) return '#22c55e'
    if (grade >= 70) return '#84cc16'
    if (grade >= 60) return '#f59e0b'
    if (grade >= 50) return '#f97316'
    return '#ef4444'
  }

  if (authLoading || loading) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const hasActivity = (userScore?.trade_count || 0) > 0 || (userScore?.mock_count || 0) > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)', color: 'var(--sm-text)' }}>
      {/* Hero */}
      <section className="sm-hero-bg" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
        <div className="sm-grid-overlay" />
        <main style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '24px 16px 0', paddingTop: 96 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: 'var(--sm-text)', fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
                  My GM Score
                </h1>
                <p style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginTop: 4 }}>
                  Track your combined trading and mock draft performance
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/gm" className="btn-primary btn-sm">
                  Trade Simulator
                </Link>
                <Link href="/mock-draft" className="btn-secondary btn-sm">
                  Mock Draft
                </Link>
              </div>
            </div>
          </div>
        </main>
      </section>

      <main style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px 48px' }}>
        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--sm-radius-sm)',
            marginBottom: 16,
            background: 'rgba(255, 68, 68, 0.08)',
            border: '1px solid rgba(255, 68, 68, 0.2)',
            color: 'var(--sm-error)',
            fontSize: 13,
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {!hasActivity ? (
          <div className="glass-card glass-card-static" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏈</div>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, fontFamily: 'var(--sm-font-heading)' }}>
              No Activity Yet
            </h2>
            <p style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginBottom: 20 }}>
              Start trading or complete a mock draft to build your GM reputation.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/gm" className="btn-primary btn-sm">
                Start Trading
              </Link>
              <Link href="/mock-draft" className="btn-secondary btn-sm">
                Mock Draft
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Combined Score Hero */}
            <div className="glass-card glass-card-static" style={{ textAlign: 'center', marginBottom: 24, border: '2px solid var(--sm-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Combined GM Score
              </div>
              {userScore && userScore.combined_gm_score !== null ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: getGradeColor(userScore.combined_gm_score),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 40px ${getGradeColor(userScore.combined_gm_score)}40`,
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 900, fontSize: 36, lineHeight: 1 }}>
                        {getLetterGrade(userScore.combined_gm_score)}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600 }}>
                        {userScore.combined_gm_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13, color: 'var(--sm-text-muted)' }}>
                    <span style={{ fontWeight: 600 }}>{Math.round(userScore.trade_weight * 100)}%</span> Trades +
                    <span style={{ fontWeight: 600 }}> {Math.round(userScore.mock_weight * 100)}%</span> Mock Drafts
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 16, color: 'var(--sm-text-muted)' }}>
                  Complete both a trade and mock draft to see your combined score
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
              {/* Trade Score */}
              <div className="glass-card glass-card-sm glass-card-static">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
                    Trade Score
                  </h3>
                  <span className="sm-tag" style={{ padding: '4px 8px', fontSize: 11 }}>
                    {Math.round((userScore?.trade_weight || 0.60) * 100)}% weight
                  </span>
                </div>
                {userScore && userScore.best_trade_score !== null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: getGradeColor(userScore.best_trade_score),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 24px ${getGradeColor(userScore.best_trade_score)}30`,
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>
                        {getLetterGrade(userScore.best_trade_score)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 24 }}>
                        {userScore.best_trade_score.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>
                        {userScore.trade_count} trades completed
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--sm-text-muted)', fontSize: 14 }}>
                    Complete a trade to get your score
                  </div>
                )}
              </div>

              {/* Mock Draft Score */}
              <div className="glass-card glass-card-sm glass-card-static">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
                    Mock Draft Score
                  </h3>
                  <span className="sm-tag" style={{ padding: '4px 8px', fontSize: 11 }}>
                    {Math.round((userScore?.mock_weight || 0.40) * 100)}% weight
                  </span>
                </div>
                {userScore && userScore.best_mock_draft_score !== null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: getGradeColor(userScore.best_mock_draft_score),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 24px ${getGradeColor(userScore.best_mock_draft_score)}30`,
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>
                        {getLetterGrade(userScore.best_mock_draft_score)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 24 }}>
                        {userScore.best_mock_draft_score.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>
                        {userScore.mock_count} drafts completed
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--sm-text-muted)', fontSize: 14 }}>
                    Complete a mock draft to get your score
                  </div>
                )}
              </div>
            </div>

            {/* Mock Draft History */}
            {mockDrafts.length > 0 && (
              <div className="glass-card glass-card-static" style={{ marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, fontFamily: 'var(--sm-font-heading)', margin: '0 0 20px' }}>
                  Mock Draft History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mockDrafts.filter(m => m.completed).map(mock => {
                    const teamInfo = CHICAGO_TEAMS[mock.chicago_team]
                    const isBest = userScore?.best_mock_draft_id === mock.id || mock.is_best_of_three
                    return (
                      <div
                        key={mock.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 'var(--sm-radius-sm)',
                          background: isBest
                            ? 'rgba(0, 208, 132, 0.06)'
                            : 'var(--sm-surface)',
                          border: isBest ? '2px solid var(--sm-success)' : '1px solid var(--sm-border)',
                          flexWrap: 'wrap',
                        }}
                      >
                        {teamInfo && (
                          <img src={teamInfo.logo} alt={teamInfo.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        )}
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {teamInfo?.name || mock.chicago_team} {mock.draft_year}
                            {isBest && (
                              <span className="sm-tag" style={{
                                padding: '2px 6px',
                                fontSize: 10,
                                background: 'var(--sm-success)',
                                color: '#fff',
                                border: 'none',
                              }}>
                                Best
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>
                            {mock.completed_at
                              ? new Date(mock.completed_at).toLocaleDateString()
                              : new Date(mock.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {/* Score breakdown */}
                        {mock.mock_score !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {mock.value_score !== null && (
                              <div style={{ textAlign: 'center', fontSize: 11 }}>
                                <div style={{ fontWeight: 700 }}>{mock.value_score.toFixed(0)}</div>
                                <div style={{ color: 'var(--sm-text-dim)' }}>Value</div>
                              </div>
                            )}
                            {mock.need_fit_score !== null && (
                              <div style={{ textAlign: 'center', fontSize: 11 }}>
                                <div style={{ fontWeight: 700 }}>{mock.need_fit_score.toFixed(0)}</div>
                                <div style={{ color: 'var(--sm-text-dim)' }}>Fit</div>
                              </div>
                            )}
                            {mock.upside_risk_score !== null && (
                              <div style={{ textAlign: 'center', fontSize: 11 }}>
                                <div style={{ fontWeight: 700 }}>{mock.upside_risk_score.toFixed(0)}</div>
                                <div style={{ color: 'var(--sm-text-dim)' }}>Upside</div>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Grade */}
                        <div
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--sm-radius-sm)',
                            background: mock.mock_score !== null ? getGradeColor(mock.mock_score) : 'var(--sm-text-dim)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 14,
                            minWidth: 50,
                            textAlign: 'center',
                          }}
                        >
                          {mock.mock_grade_letter || (mock.mock_score !== null ? getLetterGrade(mock.mock_score) : '-')}
                        </div>
                        {/* Set as best button */}
                        {!isBest && mock.mock_score !== null && (
                          <button
                            onClick={() => setBestMock(mock.id)}
                            disabled={settingBest === mock.id}
                            className="btn-secondary btn-sm"
                            style={{
                              padding: '6px 10px',
                              fontSize: 11,
                              opacity: settingBest === mock.id ? 0.5 : 1,
                              cursor: settingBest === mock.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {settingBest === mock.id ? '...' : 'Set Best'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Trade Analytics */}
            {analytics && analytics.total_trades > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {/* Grade Distribution */}
                <div className="glass-card glass-card-static">
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, fontFamily: 'var(--sm-font-heading)', margin: '0 0 20px' }}>
                    Trade Grade Distribution
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analytics.grade_distribution
                      .filter(d => d.count > 0)
                      .map(d => (
                        <div key={d.bucket} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ width: 50, fontSize: 13, fontWeight: 600 }}>
                            {d.bucket}
                          </span>
                          <div style={{ flex: 1, height: 24, background: 'var(--sm-surface)', borderRadius: 'var(--sm-radius-pill)', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${d.percentage}%`,
                                height: '100%',
                                background: 'var(--sm-gradient)',
                                borderRadius: 'var(--sm-radius-pill)',
                              }}
                            />
                          </div>
                          <span style={{ width: 70, fontSize: 13, color: 'var(--sm-text-muted)', textAlign: 'right' }}>
                            {d.count} ({d.percentage}%)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Performance by Team */}
                <div className="glass-card glass-card-static">
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, fontFamily: 'var(--sm-font-heading)', margin: '0 0 20px' }}>
                    Trade Performance by Team
                  </h3>
                  {analytics.chicago_teams.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--sm-text-muted)' }}>No team-specific data yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {analytics.chicago_teams.map(team => {
                        const teamInfo = CHICAGO_TEAMS[team.team]
                        return (
                          <div
                            key={team.team}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 'var(--sm-radius-sm)',
                              background: 'var(--sm-surface)',
                              border: '1px solid var(--sm-border)',
                            }}
                          >
                            {teamInfo && (
                              <img src={teamInfo.logo} alt={teamInfo.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>
                                {teamInfo?.name || team.team}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>
                                {team.trade_count} trades / {team.accepted_rate}% accepted
                              </div>
                            </div>
                            <div
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--sm-radius-sm)',
                                background: getGradeColor(team.avg_grade),
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {team.avg_grade}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
