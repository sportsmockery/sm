'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Competition {
  id: string
  name: string
  start_date: string
  end_date: string | null
  status: 'active' | 'completed' | 'upcoming'
  max_scored_trades_per_day: number
  created_at: string
}

interface UserScore {
  user_email: string
  user_id: string
  gm_score: number
  accepted_trades: number
  unique_trades: number
  capped_trades: number
  best_grade: number
}

export default function AdminLeaderboardPage() {
  const { isAuthenticated } = useAuth()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [scores, setScores] = useState<UserScore[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [newCompName, setNewCompName] = useState('')
  const [maxPerDay, setMaxPerDay] = useState(5)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [compRes, scoresRes] = await Promise.all([
        fetch('/api/admin/leaderboard/competitions'),
        fetch('/api/admin/leaderboard/scores'),
      ])
      if (compRes.ok) {
        const data = await compRes.json()
        setCompetitions(data.competitions || [])
      }
      if (scoresRes.ok) {
        const data = await scoresRes.json()
        setScores(data.scores || [])
      }
    } catch (e) {
      console.error('Failed to fetch:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function startCompetition() {
    if (!newCompName.trim()) return
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/leaderboard/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCompName, max_scored_trades_per_day: maxPerDay }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Competition "${newCompName}" started!` })
        setNewCompName('')
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start competition' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    }
    setActionLoading(false)
  }

  async function endCompetition(compId: string) {
    if (!confirm('End this competition? Final standings will be archived and scores reset for the new period.')) return
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/leaderboard/competitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competition_id: compId, action: 'end' }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: `Competition ended! ${data.archived || 0} results archived.` })
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to end competition' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    }
    setActionLoading(false)
  }

  const activeComp = competitions.find(c => c.status === 'active')
  const pastComps = competitions.filter(c => c.status === 'completed')

  const subText = 'var(--sm-text-muted)'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, fontFamily: 'var(--sm-font-heading)' }}>
        Leaderboard Admin
      </h1>
      <p style={{ color: subText, fontSize: 14, marginBottom: 24 }}>
        Manage competition periods, view scores, and prevent inflation.
      </p>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 16,
          backgroundColor: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
          fontSize: 13, fontWeight: 600,
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #BC0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {/* Active Competition */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--sm-font-heading)' }}>
              Active Competition
            </h2>
            {activeComp ? (
              <div style={{
                padding: 20, borderRadius: 12,
                border: '2px solid #22c55e',
                backgroundColor: 'rgba(34,197,94,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{activeComp.name}</div>
                    <div style={{ fontSize: 13, color: subText }}>
                      Started: {new Date(activeComp.start_date).toLocaleDateString()} — Max {activeComp.max_scored_trades_per_day} scored trades/day
                    </div>
                  </div>
                  <button
                    onClick={() => endCompetition(activeComp.id)}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: 'none',
                      backgroundColor: '#BC0000', color: '#FAFAFB',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    End Competition
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: 24, borderRadius: 12,
                border: '1px solid var(--sm-border)',
                backgroundColor: 'var(--sm-card)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Start a New Competition</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ fontSize: 12, color: subText, display: 'block', marginBottom: 4 }}>Competition Name</label>
                    <input
                      type="text"
                      value={newCompName}
                      onChange={e => setNewCompName(e.target.value)}
                      placeholder="e.g. March 2026"
                      className="sm-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ width: 140 }}>
                    <label style={{ fontSize: 12, color: subText, display: 'block', marginBottom: 4 }}>Max Trades/Day</label>
                    <input
                      type="number"
                      value={maxPerDay}
                      onChange={e => setMaxPerDay(parseInt(e.target.value) || 5)}
                      min={1}
                      max={50}
                      className="sm-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button
                    onClick={startCompetition}
                    disabled={actionLoading || !newCompName.trim()}
                    style={{
                      padding: '8px 24px', borderRadius: 8, border: 'none',
                      backgroundColor: '#00D4FF', color: '#0B0F14',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      opacity: !newCompName.trim() ? 0.5 : 1,
                    }}
                  >
                    Start
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Anti-Inflation Settings */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--sm-font-heading)' }}>
              Anti-Inflation Rules
            </h2>
            <div style={{
              padding: 20, borderRadius: 12,
              border: '1px solid rgba(0,212,255,0.2)',
              backgroundColor: 'var(--sm-card)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 12, background: 'var(--sm-surface)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Cap</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{activeComp?.max_scored_trades_per_day || 5} trades/day</div>
                  <div style={{ fontSize: 12, color: subText }}>Only top N accepted trades per day count</div>
                </div>
                <div style={{ padding: 12, background: 'var(--sm-surface)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duplicate Detection</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>trade_hash</div>
                  <div style={{ fontSize: 12, color: subText }}>Identical trades only count once</div>
                </div>
                <div style={{ padding: 12, background: 'var(--sm-surface)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guest Filter</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Logged in only</div>
                  <div style={{ fontSize: 12, color: subText }}>Guest trades excluded from leaderboard</div>
                </div>
              </div>
            </div>
          </section>

          {/* Current Scores */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--sm-font-heading)' }}>
              Current Standings ({scores.length} users)
            </h2>
            <div style={{ borderRadius: 12, border: '1px solid var(--sm-border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--sm-surface)', borderBottom: '1px solid var(--sm-border)' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>#</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>User</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>GM Score</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>Accepted</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>Best</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, i) => (
                    <tr key={s.user_id} style={{ borderBottom: '1px solid var(--sm-border)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 700 }}>#{i + 1}</td>
                      <td style={{ padding: '10px 16px' }}>{s.user_email?.split('@')[0] || 'Unknown'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: '#BC0000' }}>{s.gm_score.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>{s.accepted_trades}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>{s.best_grade}</td>
                    </tr>
                  ))}
                  {scores.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: subText }}>No scores yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Past Competitions */}
          {pastComps.length > 0 && (
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--sm-font-heading)' }}>
                Past Competitions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pastComps.map(comp => (
                  <div key={comp.id} style={{
                    padding: 16, borderRadius: 10,
                    border: '1px solid var(--sm-border)',
                    backgroundColor: 'var(--sm-card)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{comp.name}</div>
                      <div style={{ fontSize: 12, color: subText }}>
                        {new Date(comp.start_date).toLocaleDateString()} — {comp.end_date ? new Date(comp.end_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: subText, fontWeight: 600 }}>Completed</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
