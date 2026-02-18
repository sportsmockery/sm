'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  user_id: string
  rank: number
  score: number
  activities_count: number
  trades_count: number
  drafts_count: number
  sims_count: number
  users?: {
    username: string | null
    email: string | null
  }
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  total_participants: number
  sport: string
  month: number
  month_name: string
  year: number
  days_remaining: number
  status: 'active' | 'completed'
}

interface UserPosition {
  user_id: string
  sport: string
  competing: boolean
  rank?: number
  score?: number
  activities_count?: number
  trades_count?: number
  drafts_count?: number
  sims_count?: number
  total_participants?: number
  percentile?: number
  last_activity_at?: string | null
  top20_cutoff?: number
  points_to_top20?: number
  message?: string
}

const SPORT_CONFIG = [
  { sport: 'NFL', emoji: '🏈', label: 'NFL', color: '#0B162A' },
  { sport: 'NBA', emoji: '🏀', label: 'NBA', color: '#CE1141' },
  { sport: 'MLB', emoji: '⚾', label: 'MLB', color: '#0E3386' },
  { sport: 'NHL', emoji: '🏒', label: 'NHL', color: '#CF0A2C' },
]

export default function LeaderboardsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedSport, setSelectedSport] = useState('NFL')
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subText = 'var(--sm-text-muted)'
  const cardBg = 'var(--sm-card)'
  const cardBorder = 'var(--sm-border)'

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch top 20 leaderboard
      const leaderboardRes = await fetch(`/api/gm/leaderboard?sport=${selectedSport}&limit=20`)
      if (!leaderboardRes.ok) {
        if (leaderboardRes.status === 401) {
          router.push('/login?next=/leaderboards')
          return
        }
        throw new Error('Failed to fetch leaderboard')
      }
      const leaderboardData = await leaderboardRes.json()
      setLeaderboard(leaderboardData)

      // Fetch user's personal position
      const positionRes = await fetch(`/api/gm/user-position?sport=${selectedSport}`)
      if (positionRes.ok) {
        const positionData = await positionRes.json()
        setUserPosition(positionData)
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Failed to load leaderboard. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [selectedSport, router])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login?next=/leaderboards')
      return
    }
    fetchData()
  }, [authLoading, isAuthenticated, fetchData, router])

  function calculatePercentile(rank: number, total: number): number {
    return Math.round(100 - (rank / total) * 100)
  }

  function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sm-dark)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#bc0000', borderTopColor: 'transparent' }} />
          <p style={{ color: subText }}>Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sm-dark)' }}>
        <div className="text-center">
          <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              backgroundColor: '#bc0000',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const top20 = leaderboard?.leaderboard || []
  const userInTop20 = userPosition?.competing && userPosition?.rank && userPosition.rank <= 20
  const daysLeft = leaderboard?.days_remaining || 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)', color: 'var(--sm-text)' }}>
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24">
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: 4 }}>
            🏆 Leaderboards
          </h1>
          <p style={{ fontSize: '16px', color: subText }}>
            {leaderboard?.month_name} {leaderboard?.year}
          </p>
        </div>

        {/* Sport Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          {SPORT_CONFIG.map(({ sport, emoji, label }) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                border: selectedSport === sport ? 'none' : `2px solid ${cardBorder}`,
                backgroundColor: selectedSport === sport ? '#bc0000' : cardBg,
                color: selectedSport === sport ? '#fff' : 'var(--sm-text)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '18px' }}>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Competition Info Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: subText, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Competition Ends
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: daysLeft > 0 ? 'var(--sm-text)' : '#10b981' }}>
              {daysLeft > 0 ? `${daysLeft} days` : 'Completed'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: subText, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Competitors
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>
              {leaderboard?.total_participants || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: subText, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              {leaderboard?.status === 'active' && (
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulse 2s infinite',
                }} />
              )}
              <span style={{ fontSize: '16px', fontWeight: 700, color: leaderboard?.status === 'active' ? '#10b981' : subText }}>
                {leaderboard?.status === 'active' ? 'LIVE' : 'Completed'}
              </span>
            </div>
          </div>
        </div>

        {/* YOUR POSITION CARD - Always show if competing */}
        {userPosition?.competing && (
          <div style={{
            backgroundColor: userInTop20 ? 'rgba(34, 197, 94, 0.1)' : cardBg,
            border: `2px solid ${userInTop20 ? '#22c55e' : '#bc0000'}`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
          }}>
            {/* Card Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: `1px solid ${cardBorder}`,
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                📍 Your Position
              </h3>
              {userInTop20 ? (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  borderRadius: 20,
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}>
                  Top 20!
                </span>
              ) : (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  backgroundColor: 'var(--sm-surface)',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 20,
                  fontSize: '11px',
                  fontWeight: 600,
                  color: subText,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  🔒 Only You Can See This
                </span>
              )}
            </div>

            {/* Position Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 20,
            }}>
              <div style={{
                textAlign: 'center',
                padding: 16,
                backgroundColor: 'var(--sm-surface)',
                borderRadius: 12,
                border: `1px solid ${cardBorder}`,
              }}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Rank
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#bc0000' }}>
                  #{userPosition.rank}
                </div>
                <div style={{ fontSize: '12px', color: subText }}>
                  out of {userPosition.total_participants}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 16,
                backgroundColor: 'var(--sm-surface)',
                borderRadius: 12,
                border: `1px solid ${cardBorder}`,
              }}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Score
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>
                  {userPosition.score}
                </div>
                <div style={{ fontSize: '12px', color: subText }}>
                  {userInTop20 ? 'Top 20 🎯' : `Top ${userPosition.percentile}%`}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 16,
                backgroundColor: 'var(--sm-surface)',
                borderRadius: 12,
                border: `1px solid ${cardBorder}`,
              }}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Activities
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>
                  {userPosition.activities_count}
                </div>
                <div style={{ fontSize: '12px', color: subText }}>
                  {userPosition.trades_count}T • {userPosition.drafts_count}D • {userPosition.sims_count}S
                </div>
              </div>
            </div>

            {/* Improvement Tips - Only show if not in top 20 */}
            {!userInTop20 && userPosition.points_to_top20 !== undefined && userPosition.points_to_top20 > 0 && (
              <div style={{ borderTop: `1px solid ${cardBorder}`, paddingTop: 20 }}>
                <p style={{ fontWeight: 600, marginBottom: 12 }}>How to reach top 20:</p>
                <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'none' }}>
                  <li style={{
                    position: 'relative',
                    paddingLeft: 20,
                    marginBottom: 8,
                    fontSize: '14px',
                    color: subText,
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: '#bc0000' }}>→</span>
                    <strong>Score needed:</strong> You need {Math.ceil(userPosition.points_to_top20)} more points
                  </li>
                  <li style={{
                    position: 'relative',
                    paddingLeft: 20,
                    marginBottom: 8,
                    fontSize: '14px',
                    color: subText,
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: '#bc0000' }}>→</span>
                    <strong>Current top 20 cutoff:</strong> {userPosition.top20_cutoff} points (#{top20[19]?.rank || 20})
                  </li>
                  <li style={{
                    position: 'relative',
                    paddingLeft: 20,
                    marginBottom: 16,
                    fontSize: '14px',
                    color: subText,
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: '#bc0000' }}>→</span>
                    <strong>Tip:</strong> Make high-quality trades to improve your average score
                  </li>
                </ul>
                <Link
                  href="/gm"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    borderRadius: 8,
                    backgroundColor: '#bc0000',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Make More Trades
                </Link>
              </div>
            )}

            {/* Top 20 Message */}
            {userInTop20 && (
              <div style={{
                padding: 16,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 12,
                textAlign: 'center',
              }}>
                <p style={{ margin: 0, color: '#22c55e', fontWeight: 600 }}>
                  🎉 You're in the top 20! Keep up the great work!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Top 20 Public Leaderboard */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Leaderboard Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${cardBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              Top 20 - Public Leaderboard
            </h2>
            {daysLeft > 0 && (
              <span style={{ fontSize: '12px', color: subText }}>
                Updates in real-time
              </span>
            )}
          </div>

          {/* Leaderboard Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--sm-surface)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Rank</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Player</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Score</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Activities</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((entry, idx) => {
                  const isCurrentUser = entry.user_id === user?.id
                  const isMedal = entry.rank <= 3

                  return (
                    <tr
                      key={entry.id || idx}
                      style={{
                        borderTop: `1px solid ${cardBorder}`,
                        backgroundColor: isCurrentUser
                          ? 'rgba(188, 0, 0, 0.1)'
                          : 'transparent',
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {entry.rank === 1 && <span style={{ fontSize: '20px' }}>🥇</span>}
                          {entry.rank === 2 && <span style={{ fontSize: '20px' }}>🥈</span>}
                          {entry.rank === 3 && <span style={{ fontSize: '20px' }}>🥉</span>}
                          <span style={{
                            fontWeight: 700,
                            fontSize: isMedal ? '16px' : '14px',
                            color: isMedal ? '#bc0000' : 'var(--sm-text)',
                          }}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>

                      {/* Username */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>
                            {entry.users?.username || `User ${entry.user_id.slice(0, 6)}`}
                          </span>
                          {isCurrentUser && (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: '#bc0000',
                              color: '#fff',
                              borderRadius: 4,
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}>
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Score */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>
                          {entry.score}
                        </span>
                      </td>

                      {/* Activities */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {entry.activities_count}
                      </td>

                      {/* Breakdown */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {entry.trades_count > 0 && (
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: 'var(--sm-surface)',
                              borderRadius: 6,
                              fontSize: '11px',
                              fontWeight: 600,
                            }}>
                              {entry.trades_count} trades
                            </span>
                          )}
                          {entry.drafts_count > 0 && (
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: 'var(--sm-surface)',
                              borderRadius: 6,
                              fontSize: '11px',
                              fontWeight: 600,
                            }}>
                              {entry.drafts_count} drafts
                            </span>
                          )}
                          {entry.sims_count > 0 && (
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: 'var(--sm-surface)',
                              borderRadius: 6,
                              fontSize: '11px',
                              fontWeight: 600,
                            }}>
                              {entry.sims_count} sims
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {top20.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: subText }}>
                      No competitors yet. Be the first!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Leaderboard Footer */}
          <div style={{
            padding: 16,
            backgroundColor: 'var(--sm-surface)',
            borderTop: `1px solid ${cardBorder}`,
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: subText }}>
              Only top 20 players are shown publicly.
              {userPosition?.competing && !userInTop20 && ' You can see your personal rank above.'}
            </p>
          </div>
        </div>

        {/* Not Competing CTA */}
        {!userPosition?.competing && (
          <div style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            marginTop: 24,
          }}>
            <div style={{ fontSize: '48px', marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontWeight: 700, fontSize: '20px', marginBottom: 8 }}>
              You're Not Competing Yet!
            </h3>
            <p style={{ fontSize: '14px', color: subText, marginBottom: 20 }}>
              Complete a trade or mock draft for {selectedSport} to join the leaderboard.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                🏈 Make a Trade
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
                📋 Mock Draft
              </Link>
            </div>
          </div>
        )}

        {/* How Scoring Works */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 16,
          padding: 24,
          marginTop: 24,
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: 20, textAlign: 'center' }}>
            How Scoring Works
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {[
              { step: '1', text: 'Complete trades, mock drafts, or season simulations' },
              { step: '2', text: 'Each activity gives you a score (0-100)' },
              { step: '3', text: 'Your average score = your leaderboard score' },
              { step: '4', text: 'More activities = more chances to improve your average!' },
            ].map(({ step, text }) => (
              <div key={step} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 16,
                backgroundColor: 'var(--sm-surface)',
                borderRadius: 12,
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#bc0000',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {step}
                </span>
                <p style={{ margin: 0, fontSize: '14px', color: subText }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
