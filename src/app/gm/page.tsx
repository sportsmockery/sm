'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatePresence } from 'framer-motion'

import { TeamSelector, TEAMS } from '@/components/gm/TeamSelector'
import { RosterPanel } from '@/components/gm/RosterPanel'
import { TradeBoard } from '@/components/gm/TradeBoard'
import { OpponentRosterPanel } from '@/components/gm/OpponentRosterPanel'
import { OpponentTeamPicker } from '@/components/gm/OpponentTeamPicker'
import { DraftPickSelector } from '@/components/gm/DraftPickSelector'
import { GradeReveal } from '@/components/gm/GradeReveal'
import { TradeHistory } from '@/components/gm/TradeHistory'
import { LeaderboardPanel } from '@/components/gm/LeaderboardPanel'
import { WarRoomHeader } from '@/components/gm/WarRoomHeader'
import { StatComparison } from '@/components/gm/StatComparison'
import { SessionManager } from '@/components/gm/SessionManager'
import type { PlayerData } from '@/components/gm/PlayerCard'

interface DraftPick { year: number; round: number; condition?: string }
interface OpponentTeam { team_key: string; team_name: string; abbreviation: string; logo_url: string; primary_color: string; sport: string }
interface Session { id: string; session_name: string; chicago_team: string; is_active: boolean; num_trades: number; num_approved: number; num_dangerous: number; num_failed: number; total_improvement: number; created_at: string }
interface GradeResult { grade: number; reasoning: string; status: string; is_dangerous: boolean; trade_summary?: string; improvement_score?: number; shared_code?: string; breakdown?: { talent_balance: number; contract_value: number; team_fit: number; future_assets: number }; cap_analysis?: string }

interface CapData { total_cap: number; cap_used: number; cap_available: number; dead_money: number }

type ReceivedPlayer = PlayerData | { name: string; position: string }

export default function GMPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()
  const { theme } = useTheme()

  // Team & roster
  const [selectedTeam, setSelectedTeam] = useState('')
  const [roster, setRoster] = useState<PlayerData[]>([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set())

  // Opponent
  const [opponentTeam, setOpponentTeam] = useState<OpponentTeam | null>(null)
  const [showOpponentPicker, setShowOpponentPicker] = useState(false)
  const [receivedPlayers, setReceivedPlayers] = useState<ReceivedPlayer[]>([])
  const [opponentRoster, setOpponentRoster] = useState<PlayerData[]>([])
  const [opponentRosterLoading, setOpponentRosterLoading] = useState(false)
  const [selectedOpponentIds, setSelectedOpponentIds] = useState<Set<string>>(new Set())

  // Cap data
  const [chicagoCap, setChicagoCap] = useState<CapData | null>(null)
  const [opponentCap, setOpponentCap] = useState<CapData | null>(null)

  // Draft picks
  const [draftPicksSent, setDraftPicksSent] = useState<DraftPick[]>([])
  const [draftPicksReceived, setDraftPicksReceived] = useState<DraftPick[]>([])

  // Grading
  const [grading, setGrading] = useState(false)
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)
  const [showGradeReveal, setShowGradeReveal] = useState(false)
  const [gradeError, setGradeError] = useState<string | null>(null)

  // History & leaderboard
  const [trades, setTrades] = useState<any[]>([])
  const [tradesPage, setTradesPage] = useState(1)
  const [tradesTotalPages, setTradesTotalPages] = useState(1)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [gmScore, setGmScore] = useState(0)

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  // Mobile
  const [activeTab, setActiveTab] = useState<'build' | 'history' | 'leaderboard'>('build')

  const isDark = theme === 'dark'
  const currentTeamConfig = TEAMS.find(t => t.key === selectedTeam)
  const teamColor = currentTeamConfig?.color || '#bc0000'
  const sport = currentTeamConfig?.sport || 'nfl'

  // Handle auth redirect and initial data loading
  useEffect(() => {
    if (authLoading) return // Wait for auth to complete

    if (!isAuthenticated) {
      router.push('/login?next=/gm')
      return
    }

    // User is authenticated, load data
    setPageLoading(false)
    fetchTrades()
    fetchLeaderboard()
    fetchSessions()
  }, [authLoading, isAuthenticated, router])

  const fetchTrades = useCallback(async (page = 1) => {
    try {
      const res = await fetch(`/api/gm/trades?page=${page}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setTrades(data.trades || [])
        setTradesPage(data.page || 1)
        setTradesTotalPages(data.total_pages || 1)
        const accepted = (data.trades || []).filter((t: any) => t.status === 'accepted')
        setGmScore(accepted.reduce((sum: number, t: any) => sum + t.grade, 0))
      }
    } catch (e) {
      fetch('/api/gm/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'frontend', error_type: 'api', error_message: e instanceof Error ? e.message : String(e), route: '/api/gm/trades' }) }).catch(() => {})
    }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/gm/leaderboard')
      if (res.ok) { const data = await res.json(); setLeaderboard(data.leaderboard || []) }
    } catch (e) {
      fetch('/api/gm/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'frontend', error_type: 'api', error_message: e instanceof Error ? e.message : String(e), route: '/api/gm/leaderboard' }) }).catch(() => {})
    }
  }, [])

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/gm/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
        const active = (data.sessions || []).find((s: Session) => s.is_active)
        if (active) setActiveSession(active)
      }
    } catch (e) {
      fetch('/api/gm/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'frontend', error_type: 'api', error_message: e instanceof Error ? e.message : String(e), route: '/api/gm/sessions' }) }).catch(() => {})
    }
  }, [])

  async function loadRoster(team: string) {
    setRosterLoading(true)
    setSelectedPlayerIds(new Set())
    try {
      const res = await fetch(`/api/gm/roster?team=${team}`)
      if (res.ok) { const data = await res.json(); setRoster(data.players || []) }
      else setRoster([])
    } catch (e) {
      fetch('/api/gm/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'frontend', error_type: 'api', error_message: e instanceof Error ? e.message : String(e), route: '/api/gm/roster' }) }).catch(() => {})
      setRoster([])
    }
    setRosterLoading(false)
  }

  function handleTeamSelect(teamKey: string) {
    setSelectedTeam(teamKey)
    loadRoster(teamKey)
    setOpponentTeam(null)
    setReceivedPlayers([])
    setSelectedOpponentIds(new Set())
    setOpponentRoster([])
    setDraftPicksSent([])
    setDraftPicksReceived([])
    setGradeResult(null)
    setGradeError(null)
    setChicagoCap(null)
    setOpponentCap(null)
    createSession(teamKey)
    // Fetch Chicago cap data
    const teamSport = TEAMS.find(t => t.key === teamKey)?.sport || 'nfl'
    fetch(`/api/gm/cap?team_key=${teamKey}&sport=${teamSport}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.cap && setChicagoCap(d.cap))
      .catch(() => {})
  }

  async function createSession(teamKey: string) {
    try {
      const res = await fetch('/api/gm/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chicago_team: teamKey }),
      })
      if (res.ok) {
        const data = await res.json()
        setActiveSession(data.session)
        fetchSessions()
      }
    } catch (e) {
      fetch('/api/gm/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'frontend', error_type: 'api', error_message: e instanceof Error ? e.message : String(e), route: '/api/gm/sessions POST' }) }).catch(() => {})
    }
  }

  function togglePlayer(playerId: string) {
    setSelectedPlayerIds(prev => {
      const next = new Set(prev)
      if (next.has(playerId)) next.delete(playerId)
      else next.add(playerId)
      return next
    })
  }

  function toggleOpponentPlayer(playerId: string) {
    setSelectedOpponentIds(prev => {
      const next = new Set(prev)
      if (next.has(playerId)) {
        next.delete(playerId)
        setReceivedPlayers(rp => rp.filter(p => !('player_id' in p) || p.player_id !== playerId))
      } else {
        next.add(playerId)
        const player = opponentRoster.find(p => p.player_id === playerId)
        if (player) setReceivedPlayers(rp => [...rp, player])
      }
      return next
    })
  }

  function addCustomReceivedPlayer(name: string, position: string) {
    setReceivedPlayers(prev => [...prev, { name, position }])
  }

  function handleOpponentSelect(team: OpponentTeam) {
    setOpponentTeam(team)
    setReceivedPlayers([])
    setSelectedOpponentIds(new Set())
    setOpponentCap(null)
    // Fetch opponent cap data
    fetch(`/api/gm/cap?team_key=${team.team_key}&sport=${team.sport}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.cap && setOpponentCap(d.cap))
      .catch(() => {})
  }

  const selectedPlayers = roster.filter(p => selectedPlayerIds.has(p.player_id))
  const canGrade = selectedPlayerIds.size > 0 && opponentTeam !== null && receivedPlayers.length > 0

  async function gradeTrade() {
    if (!canGrade) return
    setGrading(true)
    setGradeResult(null)
    setGradeError(null)
    setShowGradeReveal(true)

    try {
      const res = await fetch('/api/gm/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chicago_team: selectedTeam,
          trade_partner: opponentTeam!.team_name,
          partner_team_key: opponentTeam!.team_key,
          players_sent: selectedPlayers.map(p => ({
            name: p.full_name,
            position: p.position,
            stat_line: p.stat_line,
            age: p.age,
            jersey_number: p.jersey_number,
            headshot_url: p.headshot_url,
            college: p.college,
            weight_lbs: p.weight_lbs,
            years_exp: p.years_exp,
            draft_info: p.draft_info,
            espn_id: p.espn_id,
            stats: p.stats,
            cap_hit: p.cap_hit,
            contract_years: p.contract_years,
          })),
          players_received: receivedPlayers.map(p => {
            if ('player_id' in p) {
              return {
                name: p.full_name, position: p.position, stat_line: p.stat_line,
                age: p.age, jersey_number: p.jersey_number, headshot_url: p.headshot_url,
                college: p.college, weight_lbs: p.weight_lbs, years_exp: p.years_exp,
                draft_info: p.draft_info, espn_id: p.espn_id, stats: p.stats,
                cap_hit: p.cap_hit, contract_years: p.contract_years,
              }
            }
            return p
          }),
          draft_picks_sent: draftPicksSent,
          draft_picks_received: draftPicksReceived,
          session_id: activeSession?.id,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setGradeResult(data)
        fetchTrades()
        fetchLeaderboard()
        fetchSessions()
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        setGradeError(err.error || 'Failed to grade trade')
        setShowGradeReveal(false)
      }
    } catch (e) {
      setGradeError('Network error. Please try again.')
      setShowGradeReveal(false)
      fetch('/api/gm/log-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'frontend', error_type: 'api', error_message: e instanceof Error ? e.message : String(e), route: '/api/gm/grade' }) }).catch(() => {})
    }
    setGrading(false)
  }

  function resetTrade() {
    setSelectedPlayerIds(new Set())
    setReceivedPlayers([])
    setSelectedOpponentIds(new Set())
    setDraftPicksSent([])
    setDraftPicksReceived([])
    setGradeResult(null)
    setGradeError(null)
    setShowGradeReveal(false)
  }

  async function clearAllTrades() {
    if (!confirm('Clear all your trades and reset your GM Score?')) return
    await fetch('/api/gm/trades', { method: 'DELETE' })
    setTrades([])
    setGmScore(0)
    setGradeResult(null)
    fetchLeaderboard()
    fetchSessions()
  }

  // Show loading while auth is checking or page is initializing
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const cardBg = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const inputBg = isDark ? '#374151' : '#fff'
  const inputBorder = isDark ? '#4b5563' : '#d1d5db'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* War Room Header */}
        <WarRoomHeader
          gmScore={gmScore}
          sessionName={activeSession?.session_name}
          numApproved={activeSession?.num_approved}
          numDangerous={activeSession?.num_dangerous}
          numFailed={activeSession?.num_failed}
        />

        {/* Session manager */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <SessionManager
            sessions={sessions}
            activeSession={activeSession}
            onNewSession={() => selectedTeam && createSession(selectedTeam)}
            onSelectSession={s => setActiveSession(s)}
          />
          {trades.length > 0 && (
            <button
              onClick={clearAllTrades}
              style={{
                padding: '6px 16px', borderRadius: 8,
                border: '2px solid #bc0000', backgroundColor: 'transparent',
                color: '#bc0000', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear All Trades
            </button>
          )}
        </div>

        {/* Team Selector */}
        <div className={`rounded-xl border p-4 mb-6 ${cardBg}`}>
          <TeamSelector selected={selectedTeam} onSelect={handleTeamSelect} />
        </div>

        {/* Mobile tab switcher */}
        <div className="lg:hidden" style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {(['build', 'history', 'leaderboard'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                backgroundColor: activeTab === tab ? '#bc0000' : (isDark ? '#374151' : '#e5e7eb'),
                color: activeTab === tab ? '#fff' : subText,
                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'build' ? 'Build Trade' : tab === 'history' ? 'History' : 'Leaderboard'}
            </button>
          ))}
        </div>

        {selectedTeam && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Roster Panel - Left column */}
            <div className={`lg:col-span-1 ${activeTab !== 'build' ? 'hidden lg:block' : ''}`}>
              <div className={`rounded-xl border p-4 ${cardBg}`} style={{ height: 'calc(100vh - 280px)', minHeight: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <RosterPanel
                  players={roster}
                  loading={rosterLoading}
                  selectedIds={selectedPlayerIds}
                  onToggle={togglePlayer}
                  sport={sport}
                  teamColor={teamColor}
                />
              </div>
            </div>

            {/* Trade Board - Center */}
            <div className={`lg:col-span-2 space-y-4 ${activeTab !== 'build' ? 'hidden lg:block' : ''}`}>
              {/* Trade Board Visualization - FIRST */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <TradeBoard
                  chicagoTeam={selectedTeam}
                  chicagoLogo={currentTeamConfig?.logo || ''}
                  chicagoColor={teamColor}
                  opponentName={opponentTeam?.team_name || ''}
                  opponentLogo={opponentTeam?.logo_url || null}
                  opponentColor={opponentTeam?.primary_color || '#666'}
                  playersSent={selectedPlayers}
                  playersReceived={receivedPlayers}
                  draftPicksSent={draftPicksSent}
                  draftPicksReceived={draftPicksReceived}
                  onRemoveSent={id => togglePlayer(id)}
                  onRemoveReceived={i => {
                    const removed = receivedPlayers[i]
                    if ('player_id' in removed) {
                      setSelectedOpponentIds(prev => { const next = new Set(prev); next.delete(removed.player_id); return next })
                    }
                    setReceivedPlayers(prev => prev.filter((_, idx) => idx !== i))
                  }}
                  onRemoveDraftSent={i => setDraftPicksSent(prev => prev.filter((_, idx) => idx !== i))}
                  onRemoveDraftReceived={i => setDraftPicksReceived(prev => prev.filter((_, idx) => idx !== i))}
                  canGrade={canGrade}
                  grading={grading}
                  onGrade={gradeTrade}
                />
              </div>

              {/* Draft picks */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <DraftPickSelector
                    sport={sport}
                    picks={draftPicksSent}
                    onAdd={pk => setDraftPicksSent(prev => [...prev, pk])}
                    onRemove={i => setDraftPicksSent(prev => prev.filter((_, idx) => idx !== i))}
                    label="Draft Picks to Send"
                  />
                  <DraftPickSelector
                    sport={sport}
                    picks={draftPicksReceived}
                    onAdd={pk => setDraftPicksReceived(prev => [...prev, pk])}
                    onRemove={i => setDraftPicksReceived(prev => prev.filter((_, idx) => idx !== i))}
                    label="Draft Picks to Receive"
                  />
                </div>
              </div>

              {/* Trade Partner selector */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: isDark ? '#fff' : '#1a1a1a' }}>Trade Partner</span>
                  <button
                    onClick={() => setShowOpponentPicker(true)}
                    style={{
                      padding: '6px 16px', borderRadius: 8, border: 'none',
                      backgroundColor: '#bc0000', color: '#fff',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    {opponentTeam ? 'Change Team' : 'Select Team'}
                  </button>
                </div>
                {opponentTeam && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={opponentTeam.logo_url} alt={opponentTeam.team_name} style={{ width: 32, height: 32, objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span style={{ fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a' }}>{opponentTeam.team_name}</span>
                  </div>
                )}

                {/* Cap status cards */}
                {(chicagoCap || opponentCap) && opponentTeam && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                    {chicagoCap && (
                      <div style={{
                        padding: '8px 10px', borderRadius: 8,
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: teamColor, marginBottom: 4, textTransform: 'uppercase' }}>
                          {selectedTeam} Cap
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
                          ${(chicagoCap.cap_used / 1_000_000).toFixed(1)}M / ${(chicagoCap.total_cap / 1_000_000).toFixed(1)}M
                        </div>
                        <div style={{
                          height: 4, borderRadius: 2, marginTop: 4,
                          backgroundColor: isDark ? '#374151' : '#e5e7eb', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${Math.min(100, (chicagoCap.cap_used / chicagoCap.total_cap) * 100)}%`,
                            backgroundColor: chicagoCap.cap_used / chicagoCap.total_cap > 0.9 ? '#ef4444' : teamColor,
                          }} />
                        </div>
                        <div style={{ fontSize: '10px', color: subText, marginTop: 2 }}>
                          ${(chicagoCap.cap_available / 1_000_000).toFixed(1)}M avail
                        </div>
                      </div>
                    )}
                    {opponentCap && (
                      <div style={{
                        padding: '8px 10px', borderRadius: 8,
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: opponentTeam.primary_color, marginBottom: 4, textTransform: 'uppercase' }}>
                          {opponentTeam.abbreviation} Cap
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
                          ${(opponentCap.cap_used / 1_000_000).toFixed(1)}M / ${(opponentCap.total_cap / 1_000_000).toFixed(1)}M
                        </div>
                        <div style={{
                          height: 4, borderRadius: 2, marginTop: 4,
                          backgroundColor: isDark ? '#374151' : '#e5e7eb', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${Math.min(100, (opponentCap.cap_used / opponentCap.total_cap) * 100)}%`,
                            backgroundColor: opponentCap.cap_used / opponentCap.total_cap > 0.9 ? '#ef4444' : opponentTeam.primary_color,
                          }} />
                        </div>
                        <div style={{ fontSize: '10px', color: subText, marginTop: 2 }}>
                          ${(opponentCap.cap_available / 1_000_000).toFixed(1)}M avail
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stat comparison */}
              {selectedPlayers.length > 0 && receivedPlayers.length > 0 && (
                <StatComparison playersSent={selectedPlayers} playersReceived={receivedPlayers} sport={sport} />
              )}

              {/* Error toast */}
              {gradeError && (
                <div style={{
                  padding: '12px 16px', borderRadius: 10,
                  backgroundColor: '#ef444420', border: '1px solid #ef444440',
                  color: '#ef4444', fontSize: '13px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>{gradeError}</span>
                  <button
                    onClick={() => setGradeError(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}
                  >
                    &#x2715;
                  </button>
                </div>
              )}

              {/* Trade history (desktop) */}
              <div className={`${activeTab !== 'build' && activeTab !== 'history' ? 'hidden lg:block' : ''}`}>
                <TradeHistory
                  trades={trades}
                  page={tradesPage}
                  totalPages={tradesTotalPages}
                  onPageChange={p => fetchTrades(p)}
                />
              </div>
            </div>

            {/* Opponent Roster - Right column */}
            <div className={`lg:col-span-1 ${activeTab !== 'build' ? 'hidden lg:block' : ''}`}>
              <div className={`rounded-xl border p-4 ${cardBg}`} style={{ height: 'calc(100vh - 280px)', minHeight: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {opponentTeam ? (
                  <OpponentRosterPanel
                    teamKey={opponentTeam.team_key}
                    sport={opponentTeam.sport}
                    teamColor={opponentTeam.primary_color || '#666'}
                    selectedIds={selectedOpponentIds}
                    onToggle={toggleOpponentPlayer}
                    roster={opponentRoster}
                    setRoster={setOpponentRoster}
                    loading={opponentRosterLoading}
                    setLoading={setOpponentRosterLoading}
                    onAddCustomPlayer={addCustomReceivedPlayer}
                  />
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: subText, textAlign: 'center', padding: 20 }}>
                    <div style={{ fontSize: '32px', marginBottom: 12 }}>🤝</div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 4 }}>Opponent Roster</div>
                    <div style={{ fontSize: '12px' }}>Select a trade partner to browse their players</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedTeam && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: subText }}>
            <div style={{ fontSize: '48px', marginBottom: 16 }}>&#x1F3C8;</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: 8, color: isDark ? '#fff' : '#1a1a1a' }}>
              Select a Team to Start
            </div>
            <div style={{ fontSize: '14px' }}>
              Choose a Chicago team above to begin building trades
            </div>
          </div>
        )}
      </main>

      {/* Opponent team picker modal */}
      <OpponentTeamPicker
        open={showOpponentPicker}
        onClose={() => setShowOpponentPicker(false)}
        onSelect={handleOpponentSelect}
        sport={sport}
        chicagoTeam={selectedTeam}
      />

      {/* Grade reveal overlay */}
      <GradeReveal
        result={gradeResult}
        show={showGradeReveal}
        onClose={() => setShowGradeReveal(false)}
        onNewTrade={resetTrade}
        tradeDetails={{
          chicagoTeam: currentTeamConfig?.label || selectedTeam,
          chicagoLogo: currentTeamConfig?.logo,
          chicagoColor: teamColor,
          opponentName: opponentTeam?.team_name || '',
          opponentLogo: opponentTeam?.logo_url,
          opponentColor: opponentTeam?.primary_color,
          playersSent: selectedPlayers,
          playersReceived: receivedPlayers,
          draftPicksSent,
          draftPicksReceived,
        }}
      />
    </div>
  )
}
