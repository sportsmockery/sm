'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

import { TeamSelector, TEAMS } from '@/components/gm/TeamSelector'
import { RosterPanel } from '@/components/gm/RosterPanel'
import { TradeBoard } from '@/components/gm/TradeBoard'
import { OpponentRosterPanel } from '@/components/gm/OpponentRosterPanel'
import { OpponentTeamPicker } from '@/components/gm/OpponentTeamPicker'
import { TradeHistory } from '@/components/gm/TradeHistory'
import { TeamFitOverlay } from '@/components/gm/TeamFitOverlay'
import { PreferencesModal, GMPreferences } from '@/components/gm/PreferencesModal'
import { TradeModePicker } from '@/components/gm/TradeModePicker'
import { SimulationTrigger } from '@/components/gm/SimulationTrigger'
import { SimulationResults } from '@/components/gm/SimulationResults'
import type { PlayerData } from '@/components/gm/PlayerCard'
import type { ValidationState } from '@/components/gm/ValidationIndicator'
import type { TradeMode, MLBProspect, SimulationResult } from '@/types/gm'

const DEFAULT_PREFERENCES: GMPreferences = {
  risk_tolerance: 'moderate',
  favorite_team: null,
  team_phase: 'auto',
  preferred_trade_style: 'balanced',
  cap_flexibility_priority: 'medium',
  age_preference: 'any',
}

interface DraftPick { year: number; round: number; condition?: string }
interface OpponentTeam { team_key: string; team_name: string; abbreviation: string; logo_url: string; primary_color: string; sport: string }
interface Session { id: string; session_name: string; chicago_team: string; is_active: boolean; num_trades: number; num_approved: number; num_dangerous: number; num_failed: number; total_improvement: number; created_at: string }
interface DraftPickValue { pickNumber: number; round: number; year: number; jimmyJohnson: number; richHill: number; fitzgeraldSpielberger: number; harvard: number; gmSynthesized: number; positionAdjusted?: number | null; teamAdjusted?: number | null; expectedSurplusValue?: number; hitRate?: number }
interface VeteranTradeValue { playerName: string; position: string; age: number; performanceLevel: 'elite' | 'pro_bowl' | 'good' | 'average' | 'below_avg'; contractYearsRemaining: number; capHit: number; baseValue: number; ageMultiplier: number; ageAdjustedValue: number; contractMultiplier: number; contractAdjustedValue: number; capMultiplier?: number; positionMultiplier?: number; positionAdjustedValue: number; finalValue: number; draftPickEquivalent: string; draftPickRange?: { low: number; high: number } }
interface FuturePickValue { pickNumber?: number; round: number; year: number; yearsInFuture: number; currentYearValue: number; discountRate: number; discountedValue: number; equivalentCurrentPick?: string }
interface AgingCurveData { playerName: string; position: string; playerAge: number; peakAgeStart: number; peakAgeEnd: number; declineStart: number; cliffAge: number; multiplier: number; assessment: 'developing' | 'in_prime' | 'declining' | 'past_prime'; primeYearsRemaining: number }
interface GradeResult { grade: number; reasoning: string; status: string; is_dangerous: boolean; trade_summary?: string; improvement_score?: number; shared_code?: string; breakdown?: { talent_balance: number; contract_value: number; team_fit: number; future_assets: number }; cap_analysis?: string; draft_analysis?: string; service_time_analysis?: string; arb_projection?: string; control_timeline?: string; cbt_impact?: string; rejection_reason?: string; draftPickValuesSent?: DraftPickValue[]; draftPickValuesReceived?: DraftPickValue[]; veteranValueSent?: VeteranTradeValue[]; veteranValueReceived?: VeteranTradeValue[]; futurePicksSent?: FuturePickValue[]; futurePicksReceived?: FuturePickValue[]; agingCurvesSent?: AgingCurveData[]; agingCurvesReceived?: AgingCurveData[] }

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
  const [gradeError, setGradeError] = useState<string | null>(null)

  // Validation
  const [validation, setValidation] = useState<ValidationState>({ status: 'idle', issues: [] })
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // History & leaderboard
  const [trades, setTrades] = useState<any[]>([])
  const [tradesPage, setTradesPage] = useState(1)
  const [tradesTotalPages, setTradesTotalPages] = useState(1)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [gmScore, setGmScore] = useState(0)

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  // Trade mode (2-team vs 3-team)
  const [tradeMode, setTradeMode] = useState<TradeMode>('2-team')

  // Third team (for 3-team trades)
  const [thirdTeam, setThirdTeam] = useState<OpponentTeam | null>(null)
  const [thirdTeamRoster, setThirdTeamRoster] = useState<PlayerData[]>([])
  const [thirdTeamLoading, setThirdTeamLoading] = useState(false)
  const [selectedThirdTeamIds, setSelectedThirdTeamIds] = useState<Set<string>>(new Set())
  const [draftPicksTeam3Sent, setDraftPicksTeam3Sent] = useState<DraftPick[]>([])
  const [draftPicksTeam3Received, setDraftPicksTeam3Received] = useState<DraftPick[]>([])

  // Prospects (MLB only)
  const [selectedProspectIds, setSelectedProspectIds] = useState<Set<string>>(new Set())
  const [selectedOpponentProspectIds, setSelectedOpponentProspectIds] = useState<Set<string>>(new Set())
  const [selectedThirdTeamProspectIds, setSelectedThirdTeamProspectIds] = useState<Set<string>>(new Set())
  const [prospects, setProspects] = useState<MLBProspect[]>([])
  const [opponentProspects, setOpponentProspects] = useState<MLBProspect[]>([])
  const [thirdTeamProspects, setThirdTeamProspects] = useState<MLBProspect[]>([])

  // Mobile
  const [activeTab, setActiveTab] = useState<'build' | 'history' | 'leaderboard'>('build')
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  // Team Fit Overlay
  const [fitPlayer, setFitPlayer] = useState<PlayerData | null>(null)
  const [showFitOverlay, setShowFitOverlay] = useState(false)

  // Season Simulation
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [showSimulationResults, setShowSimulationResults] = useState(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  const handleViewFit = useCallback((player: PlayerData) => {
    setFitPlayer(player)
    setShowFitOverlay(true)
  }, [])

  // Preferences
  const [preferences, setPreferences] = useState<GMPreferences>(DEFAULT_PREFERENCES)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    if (!user) return
    fetch('/api/gm/preferences')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.preferences && setPreferences(d.preferences))
      .catch(() => {})
  }, [user])

  const isDark = theme === 'dark'
  const currentTeamConfig = TEAMS.find(t => t.key === selectedTeam)
  const teamColor = currentTeamConfig?.color || '#bc0000'
  const teamLabel = currentTeamConfig?.label || 'Team'
  const sport = (currentTeamConfig?.sport || 'nfl') as 'nfl' | 'nba' | 'nhl' | 'mlb'

  // Handle auth redirect and initial data loading
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.push('/login?next=/gm')
      return
    }

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
      console.error('Failed to fetch trades', e)
    }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/gm/leaderboard')
      if (res.ok) { const data = await res.json(); setLeaderboard(data.leaderboard || []) }
    } catch (e) {
      console.error('Failed to fetch leaderboard', e)
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
      console.error('Failed to fetch sessions', e)
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
      console.error('Failed to create session', e)
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

  function toggleProspect(prospectId: string) {
    setSelectedProspectIds(prev => {
      const next = new Set(prev)
      if (next.has(prospectId)) next.delete(prospectId)
      else next.add(prospectId)
      return next
    })
  }

  function toggleOpponentProspect(prospectId: string) {
    setSelectedOpponentProspectIds(prev => {
      const next = new Set(prev)
      if (next.has(prospectId)) next.delete(prospectId)
      else next.add(prospectId)
      return next
    })
  }

  function handleOpponentSelect(team: OpponentTeam) {
    setOpponentTeam(team)
    setReceivedPlayers([])
    setSelectedOpponentIds(new Set())
    setOpponentCap(null)
    fetch(`/api/gm/cap?team_key=${team.team_key}&sport=${team.sport}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.cap && setOpponentCap(d.cap))
      .catch(() => {})
  }

  const selectedPlayers = roster.filter(p => selectedPlayerIds.has(p.player_id))
  const selectedProspects = prospects.filter(p => selectedProspectIds.has(p.id || p.prospect_id || ''))
  const selectedOpponentProspects = opponentProspects.filter(p => selectedOpponentProspectIds.has(p.id || p.prospect_id || ''))

  // Convert prospects to PlayerData format for TradeBoard display
  const prospectsAsPlayers: PlayerData[] = selectedProspects.map(p => ({
    player_id: p.id || p.prospect_id || `prospect-${p.name}`,
    full_name: p.name,
    position: p.position,
    jersey_number: null,
    headshot_url: p.headshot_url || null,
    age: p.age || null,
    weight_lbs: null,
    college: null,
    years_exp: 0,
    draft_info: null,
    espn_id: null,
    stat_line: `Prospect • ${p.current_level || p.level || 'MiLB'}`,
    stats: {},
    status: 'prospect',
  }))
  const opponentProspectsAsPlayers: PlayerData[] = selectedOpponentProspects.map(p => ({
    player_id: p.id || p.prospect_id || `prospect-${p.name}`,
    full_name: p.name,
    position: p.position,
    jersey_number: null,
    headshot_url: p.headshot_url || null,
    age: p.age || null,
    weight_lbs: null,
    college: null,
    years_exp: 0,
    draft_info: null,
    espn_id: null,
    stat_line: `Prospect • ${p.current_level || p.level || 'MiLB'}`,
    stats: {},
    status: 'prospect',
  }))

  const hasSomethingToSend = selectedPlayerIds.size > 0 || selectedProspectIds.size > 0 || draftPicksSent.length > 0
  const hasSomethingToReceive = receivedPlayers.length > 0 || selectedOpponentProspectIds.size > 0 || draftPicksReceived.length > 0
  const canGrade = hasSomethingToSend && opponentTeam !== null && hasSomethingToReceive

  // Determine current step
  const currentStep = !hasSomethingToSend ? 1 : !hasSomethingToReceive ? 2 : validation.status === 'validating' ? 3 : 4

  const validateTrade = useCallback(async () => {
    if (!selectedTeam || !opponentTeam) {
      setValidation({ status: 'idle', issues: [] })
      return
    }
    if (selectedPlayerIds.size === 0 && draftPicksSent.length === 0) {
      setValidation({ status: 'idle', issues: [] })
      return
    }
    if (receivedPlayers.length === 0 && draftPicksReceived.length === 0) {
      setValidation({ status: 'idle', issues: [] })
      return
    }

    setValidation(prev => ({ ...prev, status: 'validating' }))

    try {
      const res = await fetch('/api/gm/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chicago_team: selectedTeam,
          partner_team_key: opponentTeam.team_key,
          players_sent: selectedPlayers.map(p => ({
            name: p.full_name, position: p.position, espn_id: p.espn_id, cap_hit: p.cap_hit, age: p.age,
          })),
          players_received: receivedPlayers.map(p => {
            if ('player_id' in p) {
              return { name: p.full_name, position: p.position, espn_id: p.espn_id, cap_hit: p.cap_hit, age: p.age }
            }
            return { name: p.name, position: p.position }
          }),
          draft_picks_sent: draftPicksSent,
          draft_picks_received: draftPicksReceived,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setValidation({ status: data.status || 'valid', issues: data.issues || [] })
      } else {
        setValidation({ status: 'valid', issues: [] })
      }
    } catch {
      setValidation({ status: 'valid', issues: [] })
    }
  }, [selectedTeam, opponentTeam, selectedPlayers, receivedPlayers, draftPicksSent, draftPicksReceived, selectedPlayerIds.size])

  useEffect(() => {
    if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current)
    validationTimeoutRef.current = setTimeout(() => validateTrade(), 500)
    return () => { if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current) }
  }, [validateTrade])

  async function gradeTrade() {
    if (!canGrade) return
    setGrading(true)
    setGradeResult(null)
    setGradeError(null)

    try {
      const res = await fetch('/api/gm/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chicago_team: selectedTeam,
          trade_partner: opponentTeam!.team_name,
          partner_team_key: opponentTeam!.team_key,
          players_sent: selectedPlayers.map(p => ({
            name: p.full_name, position: p.position, stat_line: p.stat_line,
            age: p.age, jersey_number: p.jersey_number, headshot_url: p.headshot_url,
            college: p.college, weight_lbs: p.weight_lbs, years_exp: p.years_exp,
            draft_info: p.draft_info, espn_id: p.espn_id, stats: p.stats,
            cap_hit: p.cap_hit, contract_years: p.contract_years,
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
      }
    } catch (e) {
      setGradeError('Network error. Please try again.')
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
    setValidation({ status: 'idle', issues: [] })
  }

  function editTrade() {
    // Keep all selected players and assets, just clear the grade result
    // This allows users to add more pieces to the trade
    setGradeResult(null)
    setGradeError(null)
    setValidation({ status: 'idle', issues: [] })
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

  // Season Simulation
  async function handleSimulateSeason() {
    if (!activeSession || !selectedTeam) return

    setIsSimulating(true)
    setSimulationError(null)

    try {
      const response = await fetch('/api/gm/sim/season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          sport: sport,
          teamKey: selectedTeam,
          seasonYear: 2026,
        }),
      })

      if (!response.ok) {
        throw new Error('Simulation failed')
      }

      const data: SimulationResult = await response.json()

      if (data.success) {
        setSimulationResult(data)
        setShowSimulationResults(true)
      } else {
        throw new Error('Simulation returned unsuccessful')
      }
    } catch (error: any) {
      console.error('Simulation error:', error)
      setSimulationError(error.message || 'Simulation failed')
    } finally {
      setIsSimulating(false)
    }
  }

  function handleSimulateAgain() {
    setShowSimulationResults(false)
    setSimulationResult(null)
    handleSimulateSeason()
  }

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#f9fafb' : '#1f2937'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const pageBg = isDark ? '#111827' : '#f3f4f6'

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: textColor }}>
      {/* BAND 1: Header + GM Score */}
      <div style={{
        backgroundColor: cardBg,
        borderBottom: `1px solid ${borderColor}`,
        padding: '12px 24px',
        position: 'sticky',
        top: 64,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Left: Title */}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: textColor, margin: 0, letterSpacing: '-0.5px' }}>WAR ROOM</h1>
            <p style={{ fontSize: 13, color: subText, margin: '2px 0 0', fontWeight: 500 }}>
              {selectedTeam ? `${teamLabel} Trade Session` : 'Select a team to start trading'}
            </p>
          </div>

          {/* Right: Icons + GM Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Analytics */}
            <button
              onClick={() => router.push('/gm/analytics')}
              title="Analytics"
              style={{
                padding: 8, borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2" strokeLinecap="round">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </button>

            {/* Preferences */}
            <button
              onClick={() => setShowPreferencesModal(true)}
              title="Preferences"
              style={{
                padding: 8, borderRadius: 8,
                border: `1px solid ${borderColor}`,
                backgroundColor: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>

            {/* GM Score Card */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', borderRadius: 12,
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                border: `1px solid ${borderColor}`,
              }}
              title="Your GM Score updates when you grade trades"
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#bc000015', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#bc0000" stroke="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#bc0000', lineHeight: 1 }}>{gmScore}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: subText }}>GM Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BAND 2: Team Tabs + Session + Clear */}
      <div style={{
        backgroundColor: cardBg,
        borderBottom: `1px solid ${borderColor}`,
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          {/* Team tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, alignItems: 'center' }}>
            {TEAMS.map(t => {
              const isActive = selectedTeam === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => handleTeamSelect(t.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 20,
                    border: isActive ? 'none' : `1px solid ${borderColor}`,
                    backgroundColor: isActive ? t.color : 'transparent',
                    color: isActive ? '#fff' : subText,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: isActive ? 14 : 13,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <img src={t.logo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  {t.label}
                </button>
              )
            })}

            {/* Trade Mode Picker */}
            {selectedTeam && (
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <TradeModePicker
                  mode={tradeMode}
                  onChange={(mode) => {
                    setTradeMode(mode)
                    if (mode === '2-team') {
                      // Reset third team state when switching to 2-team
                      setThirdTeam(null)
                      setThirdTeamRoster([])
                      setSelectedThirdTeamIds(new Set())
                      setDraftPicksTeam3Sent([])
                      setDraftPicksTeam3Received([])
                      setSelectedThirdTeamProspectIds(new Set())
                    }
                  }}
                  disabled={!selectedTeam}
                />
              </div>
            )}
          </div>

          {/* Session info */}
          {activeSession && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: subText }}>
                Session: <strong style={{ color: textColor }}>{activeSession.session_name}</strong> ({activeSession.num_trades} trades)
              </span>
              <button
                onClick={() => selectedTeam && createSession(selectedTeam)}
                style={{
                  padding: '6px 12px', borderRadius: 6,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: 'transparent',
                  color: subText, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                New Session
              </button>
            </div>
          )}

          {/* Clear trades */}
          {trades.length > 0 && (
            <button
              onClick={clearAllTrades}
              style={{
                padding: '6px 12px', borderRadius: 6,
                border: '1px solid #ef4444',
                backgroundColor: 'transparent',
                color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Clear All Trades
            </button>
          )}
        </div>
      </div>

      {/* MODE TABS: Build Trade / History / Leaderboard */}
      <div style={{
        backgroundColor: cardBg,
        borderBottom: `1px solid ${borderColor}`,
        position: 'sticky',
        top: 130,
        zIndex: 35,
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex' }}>
          {(['build', 'history', 'leaderboard'] as const).map(tab => {
            const isActive = activeTab === tab
            const labels = { build: 'Build Trade', history: 'History', leaderboard: 'Leaderboard' }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '12px 16px',
                  border: 'none', borderBottom: isActive ? '3px solid #bc0000' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? '#bc0000' : subText,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px' }}>
        {!selectedTeam ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: subText }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🏈</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: textColor, marginBottom: 8 }}>Select a Team to Start</div>
            <div style={{ fontSize: 15 }}>Choose a Chicago team above to begin building trades</div>
          </div>
        ) : activeTab === 'build' ? (
          <>
            {/* DESKTOP: 3-column layout */}
            <div className="hidden lg:grid" style={{ gridTemplateColumns: '280px 1fr 320px', gap: 20, alignItems: 'start' }}>
              {/* LEFT: Chicago Roster */}
              <div style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 160px)',
                minHeight: 500,
                position: 'sticky',
                top: 140,
                overflow: 'auto',
              }}>
                <RosterPanel
                  players={roster}
                  loading={rosterLoading}
                  selectedIds={selectedPlayerIds}
                  onToggle={togglePlayer}
                  sport={sport}
                  teamColor={teamColor}
                  teamName={teamLabel}
                  teamKey={selectedTeam}
                  onViewFit={handleViewFit}
                  draftPicks={draftPicksSent}
                  onAddDraftPick={pk => setDraftPicksSent(prev => [...prev, pk])}
                  onRemoveDraftPick={i => setDraftPicksSent(prev => prev.filter((_, idx) => idx !== i))}
                  selectedProspectIds={selectedProspectIds}
                  onToggleProspect={toggleProspect}
                  onProspectsLoaded={setProspects}
                />
              </div>

              {/* CENTER: Trade Board */}
              <div style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
              }}>
                <TradeBoard
                  chicagoTeam={selectedTeam}
                  chicagoLabel={teamLabel}
                  chicagoLogo={currentTeamConfig?.logo || ''}
                  chicagoColor={teamColor}
                  opponentName={opponentTeam?.team_name || ''}
                  opponentLogo={opponentTeam?.logo_url || null}
                  opponentColor={opponentTeam?.primary_color || '#666'}
                  playersSent={[...selectedPlayers, ...prospectsAsPlayers]}
                  playersReceived={[...receivedPlayers, ...opponentProspectsAsPlayers]}
                  draftPicksSent={draftPicksSent}
                  draftPicksReceived={draftPicksReceived}
                  onRemoveSent={id => {
                    // Check if it's a prospect or a player
                    if (selectedProspectIds.has(id)) {
                      toggleProspect(id)
                    } else {
                      togglePlayer(id)
                    }
                  }}
                  onRemoveReceived={i => {
                    const allReceived = [...receivedPlayers, ...opponentProspectsAsPlayers]
                    const removed = allReceived[i]
                    if ('player_id' in removed) {
                      // Check if it's a prospect
                      if (removed.status === 'prospect') {
                        toggleOpponentProspect(removed.player_id)
                      } else {
                        setSelectedOpponentIds(prev => { const next = new Set(prev); next.delete(removed.player_id); return next })
                        setReceivedPlayers(prev => prev.filter((_, idx) => idx !== i))
                      }
                    } else {
                      setReceivedPlayers(prev => prev.filter((_, idx) => idx !== i))
                    }
                  }}
                  onRemoveDraftSent={i => setDraftPicksSent(prev => prev.filter((_, idx) => idx !== i))}
                  onRemoveDraftReceived={i => setDraftPicksReceived(prev => prev.filter((_, idx) => idx !== i))}
                  canGrade={canGrade}
                  grading={grading}
                  onGrade={gradeTrade}
                  validation={validation}
                  gradeResult={gradeResult}
                  onNewTrade={resetTrade}
                  onEditTrade={editTrade}
                  sport={sport}
                />

                {/* Error */}
                {gradeError && (
                  <div style={{
                    marginTop: 12, padding: 12, borderRadius: 8,
                    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                    color: '#dc2626', fontSize: 13, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{gradeError}</span>
                    <button onClick={() => setGradeError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>×</button>
                  </div>
                )}

                {/* Season Simulation - inside center column, only show for accepted trades */}
                {activeSession && activeSession.num_approved > 0 && !gradeResult && (
                  <SimulationTrigger
                    tradeCount={activeSession.num_approved}
                    sport={sport}
                    onSimulate={handleSimulateSeason}
                    isSimulating={isSimulating}
                    teamColor={teamColor}
                  />
                )}
              </div>

              {/* RIGHT: Opponent Roster */}
              <div style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 160px)',
                minHeight: 500,
                position: 'sticky',
                top: 140,
                overflow: 'auto',
              }}>
                {/* Opponent header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${borderColor}`,
                }}>
                  {opponentTeam ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={opponentTeam.logo_url} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: opponentTeam.primary_color }}>{opponentTeam.team_name}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: subText }}>Select opponent</span>
                  )}
                  <button
                    onClick={() => setShowOpponentPicker(true)}
                    style={{
                      padding: '6px 12px', borderRadius: 6,
                      border: `1px solid ${borderColor}`,
                      backgroundColor: 'transparent',
                      color: subText, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {opponentTeam ? 'Change' : 'Select Team'}
                  </button>
                </div>

                {opponentTeam ? (
                  <OpponentRosterPanel
                    teamKey={opponentTeam.team_key}
                    sport={opponentTeam.sport}
                    teamColor={opponentTeam.primary_color || '#666'}
                    teamName={opponentTeam.team_name}
                    selectedIds={selectedOpponentIds}
                    onToggle={toggleOpponentPlayer}
                    roster={opponentRoster}
                    setRoster={setOpponentRoster}
                    loading={opponentRosterLoading}
                    setLoading={setOpponentRosterLoading}
                    onAddCustomPlayer={addCustomReceivedPlayer}
                    onViewFit={handleViewFit}
                    draftPicks={draftPicksReceived}
                    onAddDraftPick={pk => setDraftPicksReceived(prev => [...prev, pk])}
                    onRemoveDraftPick={i => setDraftPicksReceived(prev => prev.filter((_, idx) => idx !== i))}
                    selectedProspectIds={selectedOpponentProspectIds}
                    onToggleProspect={toggleOpponentProspect}
                    onProspectsLoaded={setOpponentProspects}
                  />
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: subText }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Select a Trade Partner</div>
                    <div style={{ fontSize: 12, textAlign: 'center' }}>Click "Select Team" above to browse opponent rosters</div>
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE: Stacked layout */}
            <div className="lg:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Trade Board (center content) */}
              <div style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                padding: 16,
              }}>
                <TradeBoard
                  chicagoTeam={selectedTeam}
                  chicagoLabel={teamLabel}
                  chicagoLogo={currentTeamConfig?.logo || ''}
                  chicagoColor={teamColor}
                  opponentName={opponentTeam?.team_name || ''}
                  opponentLogo={opponentTeam?.logo_url || null}
                  opponentColor={opponentTeam?.primary_color || '#666'}
                  playersSent={[...selectedPlayers, ...prospectsAsPlayers]}
                  playersReceived={[...receivedPlayers, ...opponentProspectsAsPlayers]}
                  draftPicksSent={draftPicksSent}
                  draftPicksReceived={draftPicksReceived}
                  onRemoveSent={id => {
                    if (selectedProspectIds.has(id)) {
                      toggleProspect(id)
                    } else {
                      togglePlayer(id)
                    }
                  }}
                  onRemoveReceived={i => {
                    const allReceived = [...receivedPlayers, ...opponentProspectsAsPlayers]
                    const removed = allReceived[i]
                    if ('player_id' in removed) {
                      if (removed.status === 'prospect') {
                        toggleOpponentProspect(removed.player_id)
                      } else {
                        setSelectedOpponentIds(prev => { const next = new Set(prev); next.delete(removed.player_id); return next })
                        setReceivedPlayers(prev => prev.filter((_, idx) => idx !== i))
                      }
                    } else {
                      setReceivedPlayers(prev => prev.filter((_, idx) => idx !== i))
                    }
                  }}
                  onRemoveDraftSent={i => setDraftPicksSent(prev => prev.filter((_, idx) => idx !== i))}
                  onRemoveDraftReceived={i => setDraftPicksReceived(prev => prev.filter((_, idx) => idx !== i))}
                  canGrade={canGrade}
                  grading={grading}
                  onGrade={gradeTrade}
                  validation={validation}
                  gradeResult={gradeResult}
                  onNewTrade={resetTrade}
                  onEditTrade={editTrade}
                  mobile
                  sport={sport}
                />

                {/* Season Simulation - mobile, only show for accepted trades */}
                {activeSession && activeSession.num_approved > 0 && !gradeResult && (
                  <SimulationTrigger
                    tradeCount={activeSession.num_approved}
                    sport={sport}
                    onSimulate={handleSimulateSeason}
                    isSimulating={isSimulating}
                    teamColor={teamColor}
                  />
                )}
              </div>

              {/* Chicago Roster Collapsible */}
              <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  style={{
                    width: '100%', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={currentTeamConfig?.logo} alt="" style={{ width: 24, height: 24 }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: teamColor }}>{teamLabel} Roster</span>
                    {selectedPlayerIds.size > 0 && (
                      <span style={{ fontSize: 11, color: '#fff', backgroundColor: teamColor, padding: '2px 8px', borderRadius: 10 }}>
                        {selectedPlayerIds.size} selected
                      </span>
                    )}
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2" style={{ transform: leftPanelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <AnimatePresence>
                  {leftPanelOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: 16, borderTop: `1px solid ${borderColor}`, maxHeight: 400, overflowY: 'auto' }}>
                        <RosterPanel
                          players={roster}
                          loading={rosterLoading}
                          selectedIds={selectedPlayerIds}
                          onToggle={togglePlayer}
                          sport={sport}
                          teamColor={teamColor}
                          teamName={teamLabel}
                          teamKey={selectedTeam}
                          onViewFit={handleViewFit}
                          draftPicks={draftPicksSent}
                          onAddDraftPick={pk => setDraftPicksSent(prev => [...prev, pk])}
                          onRemoveDraftPick={i => setDraftPicksSent(prev => prev.filter((_, idx) => idx !== i))}
                          selectedProspectIds={selectedProspectIds}
                          onToggleProspect={toggleProspect}
                          onProspectsLoaded={setProspects}
                          compact
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Opponent Roster Collapsible */}
              <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => { if (!opponentTeam) setShowOpponentPicker(true); else setRightPanelOpen(!rightPanelOpen) }}
                  style={{
                    width: '100%', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {opponentTeam ? (
                      <>
                        <img src={opponentTeam.logo_url} alt="" style={{ width: 24, height: 24 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: opponentTeam.primary_color }}>{opponentTeam.team_name}</span>
                        {selectedOpponentIds.size > 0 && (
                          <span style={{ fontSize: 11, color: '#fff', backgroundColor: opponentTeam.primary_color, padding: '2px 8px', borderRadius: 10 }}>
                            {selectedOpponentIds.size} selected
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 14, color: subText }}>Select Trade Partner</span>
                    )}
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2" style={{ transform: rightPanelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <AnimatePresence>
                  {rightPanelOpen && opponentTeam && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: 16, borderTop: `1px solid ${borderColor}`, maxHeight: 400, overflowY: 'auto' }}>
                        <OpponentRosterPanel
                          teamKey={opponentTeam.team_key}
                          sport={opponentTeam.sport}
                          teamColor={opponentTeam.primary_color || '#666'}
                          teamName={opponentTeam.team_name}
                          selectedIds={selectedOpponentIds}
                          onToggle={toggleOpponentPlayer}
                          roster={opponentRoster}
                          setRoster={setOpponentRoster}
                          loading={opponentRosterLoading}
                          setLoading={setOpponentRosterLoading}
                          onAddCustomPlayer={addCustomReceivedPlayer}
                          onViewFit={handleViewFit}
                          draftPicks={draftPicksReceived}
                          onAddDraftPick={pk => setDraftPicksReceived(prev => [...prev, pk])}
                          onRemoveDraftPick={i => setDraftPicksReceived(prev => prev.filter((_, idx) => idx !== i))}
                          selectedProspectIds={selectedOpponentProspectIds}
                          onToggleProspect={toggleOpponentProspect}
                          onProspectsLoaded={setOpponentProspects}
                          compact
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : activeTab === 'history' ? (
          <TradeHistory
            trades={trades}
            page={tradesPage}
            totalPages={tradesTotalPages}
            onPageChange={p => fetchTrades(p)}
          />
        ) : (
          <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p style={{ color: subText }}>No trades graded yet. Be the first!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leaderboard.map((entry: any, i: number) => (
                  <div key={entry.user_id || i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 8,
                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: i < 3 ? '#bc0000' : subText }}>#{i + 1}</span>
                      <span style={{ fontWeight: 600 }}>{entry.display_name || 'Anonymous'}</span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#bc0000' }}>{entry.total_score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <OpponentTeamPicker
        open={showOpponentPicker}
        onClose={() => setShowOpponentPicker(false)}
        onSelect={handleOpponentSelect}
        sport={sport}
        chicagoTeam={selectedTeam}
      />


      <TeamFitOverlay
        player={fitPlayer}
        targetTeam={selectedTeam}
        targetTeamName={teamLabel}
        targetTeamColor={teamColor}
        sport={sport}
        show={showFitOverlay}
        onClose={() => { setShowFitOverlay(false); setFitPlayer(null) }}
      />

      <PreferencesModal
        show={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        preferences={preferences}
        onSave={setPreferences}
      />

      {/* Season Simulation Results Modal */}
      <AnimatePresence>
        {showSimulationResults && simulationResult && (
          <SimulationResults
            result={simulationResult}
            tradeCount={activeSession?.num_trades || 0}
            teamName={teamLabel}
            teamColor={teamColor}
            onSimulateAgain={handleSimulateAgain}
            onClose={() => setShowSimulationResults(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
