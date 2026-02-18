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

  const subText = 'var(--sm-text-muted)'
  const cardBg = ''

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sm-dark)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#bc0000', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const hasActivity = (userScore?.trade_count || 0) > 0 || (userScore?.mock_count || 0) > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)', color: 'var(--sm-text)' }}>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl" style={{ fontWeight: 800, color: 'var(--sm-text)', marginBottom: 4 }}>
                My GM Score
              </h1>
              <p className="text-sm" style={{ color: subText }}>
                Track your combined trading and mock draft performance
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/gm"
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  backgroundColor: '#bc0000',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Trade Simulator
              </Link>
              <Link
                href="/mock-draft"
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '2px solid var(--sm-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--sm-text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Mock Draft
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 16,
            backgroundColor: '#ef444420',
            border: '1px solid #ef444440',
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {!hasActivity ? (
          <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
            <div style={{ fontSize: '48px', marginBottom: 12 }}>🏈</div>
            <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: 8, color: 'var(--sm-text)' }}>
              No Activity Yet
            </h2>
            <p style={{ fontSize: '14px', color: subText, marginBottom: 20 }}>
              Start trading or complete a mock draft to build your GM reputation.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/gm"
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  backgroundColor: '#bc0000',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Start Trading
              </Link>
              <Link
                href="/mock-draft"
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: '2px solid #bc0000',
                  backgroundColor: 'transparent',
                  color: '#bc0000',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Mock Draft
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Combined Score Hero */}
            <div className="rounded-xl p-6 mb-6" style={{ textAlign: 'center', border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
              <div style={{ fontSize: '12px', color: subText, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Combined GM Score
              </div>
              {userScore && userScore.combined_gm_score !== null ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        backgroundColor: getGradeColor(userScore.combined_gm_score),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: '32px', lineHeight: 1 }}>
                        {getLetterGrade(userScore.combined_gm_score)}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 600 }}>
                        {userScore.combined_gm_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: '13px', color: subText }}>
                    <span style={{ fontWeight: 600 }}>{Math.round(userScore.trade_weight * 100)}%</span> Trades +
                    <span style={{ fontWeight: 600 }}> {Math.round(userScore.mock_weight * 100)}%</span> Mock Drafts
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '16px', color: subText }}>
                  Complete both a trade and mock draft to see your combined score
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Trade Score */}
              <div className="rounded-xl p-5" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--sm-text)' }}>
                    Trade Score
                  </h3>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: 'var(--sm-surface)',
                    color: subText,
                    fontWeight: 600,
                  }}>
                    {Math.round((userScore?.trade_weight || 0.60) * 100)}% weight
                  </span>
                </div>
                {userScore && userScore.best_trade_score !== null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: getGradeColor(userScore.best_trade_score),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>
                        {getLetterGrade(userScore.best_trade_score)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '24px', color: 'var(--sm-text)' }}>
                        {userScore.best_trade_score.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '13px', color: subText }}>
                        {userScore.trade_count} trades completed
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: subText, fontSize: '14px' }}>
                    Complete a trade to get your score
                  </div>
                )}
              </div>

              {/* Mock Draft Score */}
              <div className="rounded-xl p-5" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--sm-text)' }}>
                    Mock Draft Score
                  </h3>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: 'var(--sm-surface)',
                    color: subText,
                    fontWeight: 600,
                  }}>
                    {Math.round((userScore?.mock_weight || 0.40) * 100)}% weight
                  </span>
                </div>
                {userScore && userScore.best_mock_draft_score !== null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: getGradeColor(userScore.best_mock_draft_score),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>
                        {getLetterGrade(userScore.best_mock_draft_score)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '24px', color: 'var(--sm-text)' }}>
                        {userScore.best_mock_draft_score.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '13px', color: subText }}>
                        {userScore.mock_count} drafts completed
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: subText, fontSize: '14px' }}>
                    Complete a mock draft to get your score
                  </div>
                )}
              </div>
            </div>

            {/* Mock Draft History */}
            {mockDrafts.length > 0 && (
              <div className="rounded-xl p-5 mb-6" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: 16, color: 'var(--sm-text)' }}>
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
                          borderRadius: 10,
                          backgroundColor: isBest
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'var(--sm-surface)',
                          border: isBest ? '2px solid #22c55e' : 'none',
                        }}
                      >
                        {teamInfo && (
                          <img src={teamInfo.logo} alt={teamInfo.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {teamInfo?.name || mock.chicago_team} {mock.draft_year}
                            {isBest && (
                              <span style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: 4,
                                backgroundColor: '#22c55e',
                                color: '#fff',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                              }}>
                                Best
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: subText }}>
                            {mock.completed_at
                              ? new Date(mock.completed_at).toLocaleDateString()
                              : new Date(mock.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {/* Score breakdown */}
                        {mock.mock_score !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {mock.value_score !== null && (
                              <div style={{ textAlign: 'center', fontSize: '11px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--sm-text)' }}>{mock.value_score.toFixed(0)}</div>
                                <div style={{ color: subText }}>Value</div>
                              </div>
                            )}
                            {mock.need_fit_score !== null && (
                              <div style={{ textAlign: 'center', fontSize: '11px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--sm-text)' }}>{mock.need_fit_score.toFixed(0)}</div>
                                <div style={{ color: subText }}>Fit</div>
                              </div>
                            )}
                            {mock.upside_risk_score !== null && (
                              <div style={{ textAlign: 'center', fontSize: '11px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--sm-text)' }}>{mock.upside_risk_score.toFixed(0)}</div>
                                <div style={{ color: subText }}>Upside</div>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Grade */}
                        <div
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            backgroundColor: mock.mock_score !== null ? getGradeColor(mock.mock_score) : '#6b7280',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '14px',
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
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--sm-border)',
                              backgroundColor: 'transparent',
                              color: 'var(--sm-text)',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: settingBest === mock.id ? 'not-allowed' : 'pointer',
                              opacity: settingBest === mock.id ? 0.5 : 1,
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

            {/* Trade Analytics (from original analytics endpoint) */}
            {analytics && analytics.total_trades > 0 && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <div className="rounded-xl p-4 sm:p-6" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: 16, color: 'var(--sm-text)' }}>
                    Trade Grade Distribution
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analytics.grade_distribution
                      .filter(d => d.count > 0)
                      .map(d => (
                        <div key={d.bucket} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ width: 50, fontSize: '13px', fontWeight: 600, color: 'var(--sm-text)' }}>
                            {d.bucket}
                          </span>
                          <div style={{ flex: 1, height: 24, backgroundColor: 'var(--sm-surface)', borderRadius: 4, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${d.percentage}%`,
                                height: '100%',
                                backgroundColor: '#bc0000',
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <span style={{ width: 60, fontSize: '13px', color: subText, textAlign: 'right' }}>
                            {d.count} ({d.percentage}%)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Performance by Team */}
                <div className="rounded-xl p-4 sm:p-6" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: 16, color: 'var(--sm-text)' }}>
                    Trade Performance by Team
                  </h3>
                  {analytics.chicago_teams.length === 0 ? (
                    <p style={{ fontSize: '14px', color: subText }}>No team-specific data yet</p>
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
                              borderRadius: 8,
                              backgroundColor: 'var(--sm-surface)',
                            }}
                          >
                            {teamInfo && (
                              <img src={teamInfo.logo} alt={teamInfo.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)' }}>
                                {teamInfo?.name || team.team}
                              </div>
                              <div style={{ fontSize: '12px', color: subText }}>
                                {team.trade_count} trades • {team.accepted_rate}% accepted
                              </div>
                            </div>
                            <div
                              style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                backgroundColor: getGradeColor(team.avg_grade),
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '13px',
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
