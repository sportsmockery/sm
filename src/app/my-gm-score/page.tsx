'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

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
  activity_timeline: Array<{
    date: string
    trade_count: number
    avg_grade: number
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login?next=/my-gm-score')
      return
    }

    fetchAnalytics()
  }, [authLoading, isAuthenticated, router])

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/gm/analytics')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?next=/my-gm-score')
          return
        }
        throw new Error('Failed to fetch analytics')
      }
      const data = await res.json()
      setAnalytics(data)
    } catch (e) {
      setError('Failed to load GM score data')
    } finally {
      setLoading(false)
    }
  }

  // Get letter grade from numeric grade
  function getLetterGrade(grade: number): string {
    if (grade >= 90) return 'A'
    if (grade >= 80) return 'B+'
    if (grade >= 70) return 'B'
    if (grade >= 60) return 'C'
    if (grade >= 50) return 'D'
    return 'F'
  }

  // Get grade color
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl" style={{ fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 4 }}>
                My GM Score
              </h1>
              <p className="text-sm" style={{ color: subText }}>
                Track your trading performance across all Chicago teams
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
                  border: `2px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: 'transparent',
                  color: isDark ? '#fff' : '#1a1a1a',
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

        {analytics && analytics.total_trades === 0 ? (
          <div className={`rounded-xl border p-8 text-center ${cardBg}`}>
            <div style={{ fontSize: '48px', marginBottom: 12 }}>🏈</div>
            <h2 style={{ fontWeight: 700, fontSize: '20px', marginBottom: 8, color: isDark ? '#fff' : '#1a1a1a' }}>
              No Trades Yet
            </h2>
            <p style={{ fontSize: '14px', color: subText, marginBottom: 20 }}>
              Start trading to build your GM reputation and see your performance analytics.
            </p>
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
                display: 'inline-block',
              }}
            >
              Start Trading
            </Link>
          </div>
        ) : analytics && (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Total GM Score */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Total GM Score
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#bc0000' }}>
                  {analytics.total_gm_score.toLocaleString()}
                </div>
              </div>

              {/* Average Grade */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Avg Trade Grade
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: getGradeColor(analytics.average_grade) }}>
                    {getLetterGrade(analytics.average_grade)}
                  </span>
                  <span style={{ fontSize: '16px', color: subText, fontWeight: 600 }}>
                    {analytics.average_grade}
                  </span>
                </div>
              </div>

              {/* Total Trades */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Trades
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a' }}>
                  {analytics.total_trades}
                </div>
              </div>

              {/* Accepted Rate */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                  Accepted Rate
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>
                  {analytics.total_trades > 0 ? Math.round((analytics.accepted_trades / analytics.total_trades) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Trade Breakdown */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl border p-4 text-center ${cardBg}`}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{analytics.accepted_trades}</div>
                <div style={{ fontSize: '13px', color: subText, fontWeight: 600 }}>Accepted Trades</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${cardBg}`}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444' }}>{analytics.rejected_trades}</div>
                <div style={{ fontSize: '13px', color: subText, fontWeight: 600 }}>Rejected Trades</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${cardBg}`}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{analytics.dangerous_trades}</div>
                <div style={{ fontSize: '13px', color: subText, fontWeight: 600 }}>Dangerous Trades</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Grade Distribution */}
              <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: 16, color: isDark ? '#fff' : '#1a1a1a' }}>
                  Grade Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analytics.grade_distribution
                    .filter(d => d.count > 0)
                    .map(d => (
                      <div key={d.bucket} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 50, fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a' }}>
                          {d.bucket}
                        </span>
                        <div style={{ flex: 1, height: 24, backgroundColor: isDark ? '#374151' : '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${d.percentage}%`,
                              height: '100%',
                              backgroundColor: '#bc0000',
                              borderRadius: 4,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ width: 50, fontSize: '13px', color: subText, textAlign: 'right' }}>
                          {d.count} ({d.percentage}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Chicago Teams Performance */}
              <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: 16, color: isDark ? '#fff' : '#1a1a1a' }}>
                  Performance by Team
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
                            backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          }}
                        >
                          {teamInfo && (
                            <img src={teamInfo.logo} alt={teamInfo.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: isDark ? '#fff' : '#1a1a1a' }}>
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

              {/* Top Trading Partners */}
              <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: 16, color: isDark ? '#fff' : '#1a1a1a' }}>
                  Top Trading Partners
                </h3>
                {analytics.trading_partners.length === 0 ? (
                  <p style={{ fontSize: '14px', color: subText }}>No trading partner data yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {analytics.trading_partners.slice(0, 5).map((partner, i) => (
                      <div
                        key={partner.team_name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 8,
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                        }}
                      >
                        <span style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: '#bc0000',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: isDark ? '#fff' : '#1a1a1a' }}>
                            {partner.team_name}
                          </div>
                          <div style={{ fontSize: '12px', color: subText }}>
                            {partner.trade_count} trades
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: getGradeColor(partner.avg_grade) }}>
                            {partner.avg_grade}
                          </div>
                          <div style={{ fontSize: '11px', color: subText }}>avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grade Extremes */}
              <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: 16, color: isDark ? '#fff' : '#1a1a1a' }}>
                  Grade Records
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ textAlign: 'center', padding: 16, borderRadius: 8, backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                    <div style={{ fontSize: '12px', color: subText, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                      Best Trade
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#10b981' }}>
                      {analytics.highest_grade}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16, borderRadius: 8, backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                    <div style={{ fontSize: '12px', color: subText, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                      Worst Trade
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#ef4444' }}>
                      {analytics.lowest_grade}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
