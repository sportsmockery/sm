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

const MEDAL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'rgba(255, 215, 0, 0.12)', text: '#ffd700', border: 'rgba(255, 215, 0, 0.3)' },
  2: { bg: 'rgba(192, 192, 192, 0.10)', text: '#c0c0c0', border: 'rgba(192, 192, 192, 0.25)' },
  3: { bg: 'rgba(205, 127, 50, 0.10)', text: '#cd7f32', border: 'rgba(205, 127, 50, 0.25)' },
}

export default function LeaderboardsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedSport, setSelectedSport] = useState('NFL')
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  if (authLoading || loading) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--sm-text-muted)' }}>Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--sm-error)', marginBottom: 16 }}>{error}</p>
          <button onClick={fetchData} className="btn-primary btn-sm">
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
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)', color: 'var(--sm-text)' }}>
      {/* Hero */}
      <section className="sm-hero-bg" style={{ position: 'relative', overflow: 'hidden', paddingBottom: 0 }}>
        <div className="sm-grid-overlay" />
        <main style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '24px 16px 0', paddingTop: 96 }}>
          {/* Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4, fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
              Leaderboards
            </h1>
            <p style={{ fontSize: 16, color: 'var(--sm-text-muted)', marginTop: 8 }}>
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
                className={selectedSport === sport ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Competition Info Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            marginBottom: 32,
            flexWrap: 'wrap',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Competition Ends
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: daysLeft > 0 ? 'var(--sm-text)' : 'var(--sm-success)' }}>
                {daysLeft > 0 ? `${daysLeft} days` : 'Completed'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Total Competitors
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {leaderboard?.total_participants || 0}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                {leaderboard?.status === 'active' && (
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--sm-success)',
                    display: 'inline-block',
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }} />
                )}
                <span style={{ fontSize: 16, fontWeight: 700, color: leaderboard?.status === 'active' ? 'var(--sm-success)' : 'var(--sm-text-muted)' }}>
                  {leaderboard?.status === 'active' ? 'LIVE' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </section>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px 48px' }}>
        {/* YOUR POSITION CARD */}
        {userPosition?.competing && (
          <div className="glass-card glass-card-static" style={{
            marginBottom: 24,
            border: userInTop20 ? '2px solid var(--sm-success)' : '2px solid var(--sm-red)',
            background: userInTop20 ? 'rgba(0, 208, 132, 0.06)' : 'var(--sm-card)',
          }}>
            {/* Card Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid var(--sm-border)',
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'var(--sm-font-heading)' }}>
                Your Position
              </h3>
              {userInTop20 ? (
                <span className="sm-tag" style={{
                  background: 'var(--sm-success)',
                  color: '#fff',
                  border: 'none',
                }}>
                  Top 20!
                </span>
              ) : (
                <span className="sm-tag" style={{
                  background: 'var(--sm-surface)',
                  color: 'var(--sm-text-dim)',
                  border: '1px solid var(--sm-border)',
                  fontSize: 10,
                }}>
                  Only You Can See This
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
                background: 'var(--sm-surface)',
                borderRadius: 'var(--sm-radius-sm)',
                border: '1px solid var(--sm-border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Your Rank
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--sm-red)' }}>
                  #{userPosition.rank}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>
                  out of {userPosition.total_participants}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 16,
                background: 'var(--sm-surface)',
                borderRadius: 'var(--sm-radius-sm)',
                border: '1px solid var(--sm-border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Your Score
                </div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>
                  {userPosition.score}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>
                  {userInTop20 ? 'Top 20' : `Top ${userPosition.percentile}%`}
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: 16,
                background: 'var(--sm-surface)',
                borderRadius: 'var(--sm-radius-sm)',
                border: '1px solid var(--sm-border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Your Activities
                </div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>
                  {userPosition.activities_count}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>
                  {userPosition.trades_count}T / {userPosition.drafts_count}D / {userPosition.sims_count}S
                </div>
              </div>
            </div>

            {/* Improvement Tips */}
            {!userInTop20 && userPosition.points_to_top20 !== undefined && userPosition.points_to_top20 > 0 && (
              <div style={{ borderTop: '1px solid var(--sm-border)', paddingTop: 20 }}>
                <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>How to reach top 20:</p>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                  {[
                    { text: <><strong>Score needed:</strong> You need {Math.ceil(userPosition.points_to_top20)} more points</> },
                    { text: <><strong>Current top 20 cutoff:</strong> {userPosition.top20_cutoff} points (#{top20[19]?.rank || 20})</> },
                    { text: <><strong>Tip:</strong> Make high-quality trades to improve your average score</> },
                  ].map((item, i) => (
                    <li key={i} style={{
                      position: 'relative',
                      paddingLeft: 20,
                      marginBottom: 8,
                      fontSize: 14,
                      color: 'var(--sm-text-muted)',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--sm-red)' }}>→</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
                <Link href="/gm" className="btn-primary btn-sm" style={{ marginTop: 16, display: 'inline-flex' }}>
                  Make More Trades
                </Link>
              </div>
            )}

            {/* Top 20 Message */}
            {userInTop20 && (
              <div style={{
                padding: 16,
                background: 'rgba(0, 208, 132, 0.08)',
                border: '1px solid rgba(0, 208, 132, 0.2)',
                borderRadius: 'var(--sm-radius-sm)',
                textAlign: 'center',
              }}>
                <p style={{ margin: 0, color: 'var(--sm-success)', fontWeight: 600 }}>
                  You're in the top 20! Keep up the great work!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Top 20 Public Leaderboard */}
        <div className="glass-card glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Leaderboard Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--sm-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'var(--sm-font-heading)' }}>
              Top 20 - Public Leaderboard
            </h2>
            {daysLeft > 0 && (
              <span style={{ fontSize: 12, color: 'var(--sm-text-dim)' }}>
                Updates in real-time
              </span>
            )}
          </div>

          {/* Desktop Table */}
          <div className="sm-table-wrapper" style={{ display: 'block' }}>
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                  <th style={{ textAlign: 'right' }}>Activities</th>
                  <th>Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((entry, idx) => {
                  const isCurrentUser = entry.user_id === user?.id
                  const isMedal = entry.rank <= 3
                  const medalStyle = MEDAL_COLORS[entry.rank]

                  return (
                    <tr
                      key={entry.id || idx}
                      style={{
                        background: isCurrentUser
                          ? 'rgba(188, 0, 0, 0.08)'
                          : isMedal
                            ? medalStyle?.bg
                            : undefined,
                      }}
                    >
                      {/* Rank */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {entry.rank === 1 && <span style={{ fontSize: 20 }}>🥇</span>}
                          {entry.rank === 2 && <span style={{ fontSize: 20 }}>🥈</span>}
                          {entry.rank === 3 && <span style={{ fontSize: 20 }}>🥉</span>}
                          <span style={{
                            fontWeight: 700,
                            fontSize: isMedal ? 16 : 14,
                            color: isMedal ? (medalStyle?.text || 'var(--sm-text)') : 'var(--sm-text)',
                          }}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>

                      {/* Username */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>
                            {entry.users?.username || `User ${entry.user_id.slice(0, 6)}`}
                          </span>
                          {isCurrentUser && (
                            <span className="sm-tag" style={{
                              padding: '2px 8px',
                              fontSize: 10,
                              background: 'var(--sm-red)',
                              color: '#fff',
                              border: 'none',
                            }}>
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="stat-num" style={{ fontWeight: 700, fontSize: 16 }}>
                        {entry.score}
                      </td>

                      {/* Activities */}
                      <td className="stat-num">
                        {entry.activities_count}
                      </td>

                      {/* Breakdown */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {entry.trades_count > 0 && (
                            <span className="sm-tag" style={{ padding: '4px 8px', fontSize: 11 }}>
                              {entry.trades_count} trades
                            </span>
                          )}
                          {entry.drafts_count > 0 && (
                            <span className="sm-tag" style={{ padding: '4px 8px', fontSize: 11 }}>
                              {entry.drafts_count} drafts
                            </span>
                          )}
                          {entry.sims_count > 0 && (
                            <span className="sm-tag" style={{ padding: '4px 8px', fontSize: 11 }}>
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
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--sm-text-muted)' }}>
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
            background: 'var(--sm-surface)',
            borderTop: '1px solid var(--sm-border)',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--sm-text-dim)' }}>
              Only top 20 players are shown publicly.
              {userPosition?.competing && !userInTop20 && ' You can see your personal rank above.'}
            </p>
          </div>
        </div>

        {/* Not Competing CTA */}
        {!userPosition?.competing && (
          <div className="glass-card glass-card-static" style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, fontFamily: 'var(--sm-font-heading)' }}>
              You're Not Competing Yet!
            </h3>
            <p style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginBottom: 20 }}>
              Complete a trade or mock draft for {selectedSport} to join the leaderboard.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/gm" className="btn-primary btn-sm">
                Make a Trade
              </Link>
              <Link href="/mock-draft" className="btn-secondary btn-sm">
                Mock Draft
              </Link>
            </div>
          </div>
        )}

        {/* How Scoring Works */}
        <div className="glass-card glass-card-static" style={{ marginTop: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, textAlign: 'center', fontFamily: 'var(--sm-font-heading)', margin: '0 0 20px' }}>
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
                background: 'var(--sm-surface)',
                borderRadius: 'var(--sm-radius-sm)',
                border: '1px solid var(--sm-border)',
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--sm-gradient)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}>
                  {step}
                </span>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--sm-text-muted)' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
