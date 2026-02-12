# GM Trade Simulator - Frontend Code Documentation

> **Generated:** February 11, 2026
> **Total Files:** 73 (4 pages, 29 API routes, 40 components)
> **Lines of Code:** ~16,000

## Table of Contents

### Part 1: Pages (`src/app/gm/`)
- layout.tsx
- page.tsx (main trade simulator)
- analytics/page.tsx
- share/[code]/page.tsx

### Part 2: Core API Routes (`src/app/api/gm/`)
- grade/route.ts - AI trade grading
- roster/route.ts - Player rosters
- teams/route.ts - League teams
- sessions/route.ts - Session management
- trades/route.ts - Trade history
- leaderboard/route.ts - Rankings
- share/[code]/route.ts - Share trades
- validate/route.ts - Trade validation
- audit/route.ts - AI audit

### Part 3: Supporting API Routes
- cap/route.ts - Salary cap
- fit/route.ts - Team fit analysis
- analytics/route.ts - User analytics
- preferences/route.ts - GM preferences
- scenarios/route.ts - What-if scenarios
- simulate/route.ts - Monte Carlo sim
- export/route.ts - Export trades
- prospects/route.ts - MLB prospects
- log-error/route.ts - Error logging
- user-score/route.ts - Combined score
- user-position/route.ts - Leaderboard position
- sim/season/route.ts - Season sim

### Part 3b: Draft API Routes (`src/app/api/gm/draft/`)
- start/route.ts
- prospects/route.ts
- pick/route.ts
- auto/route.ts
- grade/route.ts
- history/route.ts
- eligibility/route.ts
- share/[mockId]/route.ts

### Part 4: Components (`src/components/gm/`)
40 components including: TeamSelector, RosterPanel, TradeBoard, ThreeTeamTradeBoard, OpponentRosterPanel, OpponentTeamPicker, TradeHistory, TeamFitOverlay, PreferencesModal, TradeModePicker, SimulationTrigger, SimulationResults, DestinationPicker, PlayerCard, GradeReveal, LeaderboardPanel, and more.

---

# Part 1: Page Files (`src/app/gm/`)

## src/app/gm/layout.tsx

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trade Simulator',
  description: 'Build and grade trades for Chicago sports teams. AI-powered trade analysis for Bears, Bulls, Blackhawks, Cubs, and White Sox.',
}

export default function GMLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

## src/app/gm/page.tsx

```tsx
'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

import { TeamSelector, TEAMS } from '@/components/gm/TeamSelector'
import { RosterPanel } from '@/components/gm/RosterPanel'
import { TradeBoard } from '@/components/gm/TradeBoard'
import { ThreeTeamTradeBoard } from '@/components/gm/ThreeTeamTradeBoard'
import { OpponentRosterPanel } from '@/components/gm/OpponentRosterPanel'
import { OpponentTeamPicker } from '@/components/gm/OpponentTeamPicker'
import { TradeHistory } from '@/components/gm/TradeHistory'
import { TeamFitOverlay } from '@/components/gm/TeamFitOverlay'
import { PreferencesModal, GMPreferences } from '@/components/gm/PreferencesModal'
import { TradeModePicker } from '@/components/gm/TradeModePicker'
import { SimulationTrigger } from '@/components/gm/SimulationTrigger'
import { SimulationResults } from '@/components/gm/SimulationResults'
import { DestinationPicker } from '@/components/gm/DestinationPicker'
import type { PlayerData } from '@/components/gm/PlayerCard'
import type { ValidationState } from '@/components/gm/ValidationIndicator'
import type { TradeMode, MLBProspect, SimulationResult, TradeFlow } from '@/types/gm'

const DEFAULT_PREFERENCES: GMPreferences = {
  risk_tolerance: 'moderate',
  favorite_team: null,
  team_phase: 'auto',
  preferred_trade_style: 'balanced',
  cap_flexibility_priority: 'medium',
  age_preference: 'any',
}

interface DraftPick { year: number; round: number; condition?: string; pickNumber?: number; originalTeam?: string }
interface OpponentTeam { team_key: string; team_name: string; abbreviation: string; logo_url: string; primary_color: string; sport: string }
interface Session { id: string; session_name: string; chicago_team: string; is_active: boolean; num_trades: number; num_approved: number; num_dangerous: number; num_failed: number; total_improvement: number; created_at: string }
interface DraftPickValue { pickNumber: number; round: number; year: number; jimmyJohnson: number; richHill: number; fitzgeraldSpielberger: number; harvard: number; gmSynthesized: number; positionAdjusted?: number | null; teamAdjusted?: number | null; expectedSurplusValue?: number; hitRate?: number }
interface VeteranTradeValue { playerName: string; position: string; age: number; performanceLevel: 'elite' | 'pro_bowl' | 'good' | 'average' | 'below_avg'; contractYearsRemaining: number; capHit: number; baseValue: number; ageMultiplier: number; ageAdjustedValue: number; contractMultiplier: number; contractAdjustedValue: number; capMultiplier?: number; positionMultiplier?: number; positionAdjustedValue: number; finalValue: number; draftPickEquivalent: string; draftPickRange?: { low: number; high: number } }
interface FuturePickValue { pickNumber?: number; round: number; year: number; yearsInFuture: number; currentYearValue: number; discountRate: number; discountedValue: number; equivalentCurrentPick?: string }
interface AgingCurveData { playerName: string; position: string; playerAge: number; peakAgeStart: number; peakAgeEnd: number; declineStart: number; cliffAge: number; multiplier: number; assessment: 'developing' | 'in_prime' | 'declining' | 'past_prime'; primeYearsRemaining: number }
// Legacy historical trade reference (backwards compatible)
interface HistoricalTradeRef { trade: string; haul: string; year: number; outcome: string }
// Legacy suggested trade (backwards compatible)
interface SuggestedTrade { type: 'add_picks' | 'add_players' | 'remove_players' | 'restructure' | 'three_team'; summary: string; reasoning: string; specific_suggestions: string[]; historical_precedent?: string; estimated_grade_improvement: number }
// Enhanced historical context (Feb 2026)
interface SimilarTrade { trade_id?: string; date: string; description: string; teams: string[]; outcome: 'worked' | 'failed' | 'neutral'; grade_given?: number; similarity_score: number; key_difference?: string }
interface HistoricalContext { similar_trades: SimilarTrade[]; success_rate: number; key_patterns: string[]; why_this_fails_historically?: string; what_works_instead?: string }
interface TradeItem { type: 'player' | 'pick' | 'prospect' | 'cash'; name?: string; position?: string; year?: number; round?: number; amount?: number }
interface ValueBalance { chicago_value: number; partner_value: number; difference: number; fair_value_range: [number, number] }
interface HistoricalPrecedent { example_trades: string[]; success_rate_for_structure: number; realistic_because: string }
interface EnhancedSuggestedTrade { description: string; chicago_sends: TradeItem[]; chicago_receives: TradeItem[]; value_balance: ValueBalance; cap_salary_notes: string; why_this_works: string; likelihood: string; historical_precedent: HistoricalPrecedent; type?: 'add_picks' | 'add_players' | 'remove_players' | 'restructure' | 'three_team'; summary?: string; reasoning?: string; specific_suggestions?: string[]; estimated_grade_improvement?: number }
// Data freshness tracking (Feb 2026)
interface DataFreshness { roster_updated_at: string; stats_updated_at: string; contracts_updated_at: string; age_hours: number; is_stale: boolean; warning?: string }
interface GradeResult { grade: number; reasoning: string; status: string; is_dangerous: boolean; trade_summary?: string; improvement_score?: number; shared_code?: string; breakdown?: { talent_balance: number; contract_value: number; team_fit: number; future_assets: number }; cap_analysis?: string; draft_analysis?: string; service_time_analysis?: string; arb_projection?: string; control_timeline?: string; cbt_impact?: string; rejection_reason?: string; draftPickValuesSent?: DraftPickValue[]; draftPickValuesReceived?: DraftPickValue[]; veteranValueSent?: VeteranTradeValue[]; veteranValueReceived?: VeteranTradeValue[]; futurePicksSent?: FuturePickValue[]; futurePicksReceived?: FuturePickValue[]; agingCurvesSent?: AgingCurveData[]; agingCurvesReceived?: AgingCurveData[]; historical_comparisons?: HistoricalTradeRef[]; suggested_trade?: SuggestedTrade | null; historical_context?: HistoricalContext | null; enhanced_suggested_trade?: EnhancedSuggestedTrade | null; data_freshness?: DataFreshness | null }

interface CapData { total_cap: number; cap_used: number; cap_available: number; dead_money: number }

type ReceivedPlayer = PlayerData | { name: string; position: string }

// Convert frontend draft pick format to API format (camelCase -> snake_case)
function formatDraftPicksForAPI(picks: DraftPick[]): Array<{ year: number; round: number; condition?: string; pick_number?: number; original_team?: string }> {
  return picks.map(pk => ({
    year: pk.year,
    round: pk.round,
    condition: pk.condition,
    pick_number: pk.pickNumber,
    original_team: pk.originalTeam,
  }))
}

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
  const [showThirdTeamPicker, setShowThirdTeamPicker] = useState(false)
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

  // 3-team trade flows (who sends what to whom)
  const [tradeFlows, setTradeFlows] = useState<TradeFlow[]>([])

  // Destination picker state
  const [showDestinationPicker, setShowDestinationPicker] = useState(false)
  const [pendingPlayer, setPendingPlayer] = useState<{ player: PlayerData; fromTeamKey: string } | null>(null)
  const [pendingPick, setPendingPick] = useState<{ pick: DraftPick; fromTeamKey: string } | null>(null)

  // Prospects (MLB only)
  const [selectedProspectIds, setSelectedProspectIds] = useState<Set<string>>(new Set())
  const [selectedOpponentProspectIds, setSelectedOpponentProspectIds] = useState<Set<string>>(new Set())
  const [selectedThirdTeamProspectIds, setSelectedThirdTeamProspectIds] = useState<Set<string>>(new Set())
  const [prospects, setProspects] = useState<MLBProspect[]>([])
  const [opponentProspects, setOpponentProspects] = useState<MLBProspect[]>([])
  const [thirdTeamProspects, setThirdTeamProspects] = useState<MLBProspect[]>([])

  // MLB salary retention & cash considerations
  const [salaryRetentions, setSalaryRetentions] = useState<Record<string, number>>({})
  const [cashSent, setCashSent] = useState(0)
  const [cashReceived, setCashReceived] = useState(0)

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

  // MLB salary retention handler
  const handleSalaryRetentionChange = useCallback((playerId: string, pct: number) => {
    setSalaryRetentions(prev => ({ ...prev, [playerId]: Math.min(50, Math.max(0, pct)) }))
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
    fetchAnalytics()
  }, [authLoading, isAuthenticated, router])

  // Migrate 2-team selections to 3-team flows when switching modes
  useEffect(() => {
    if (tradeMode !== '3-team' || !opponentTeam || !selectedTeam) return

    const has2TeamSelections = selectedPlayerIds.size > 0 || draftPicksSent.length > 0 ||
                               selectedOpponentIds.size > 0 || draftPicksReceived.length > 0
    const hasExistingFlows = tradeFlows.length > 0

    if (has2TeamSelections && !hasExistingFlows) {
      const newFlows: TradeFlow[] = []

      const chicagoPlayers = roster.filter(p => selectedPlayerIds.has(p.player_id))
      if (chicagoPlayers.length > 0 || draftPicksSent.length > 0) {
        newFlows.push({
          from: selectedTeam,
          to: opponentTeam.team_key,
          players: chicagoPlayers,
          picks: [...draftPicksSent],
        })
      }

      const opponentPlayers = opponentRoster.filter(p => selectedOpponentIds.has(p.player_id))
      if (opponentPlayers.length > 0 || draftPicksReceived.length > 0) {
        newFlows.push({
          from: opponentTeam.team_key,
          to: selectedTeam,
          players: opponentPlayers,
          picks: [...draftPicksReceived],
        })
      }

      if (newFlows.length > 0) {
        setTradeFlows(newFlows)
      }
    }
  }, [tradeMode, opponentTeam, selectedTeam, selectedPlayerIds, draftPicksSent, selectedOpponentIds, draftPicksReceived, roster, opponentRoster, tradeFlows.length])

  const fetchTrades = useCallback(async (page = 1) => {
    try {
      const res = await fetch(`/api/gm/trades?page=${page}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setTrades(data.trades || [])
        setTradesPage(data.page || 1)
        setTradesTotalPages(data.total_pages || 1)
      }
    } catch (e) {
      console.error('Failed to fetch trades', e)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/gm/analytics')
      if (res.ok) {
        const data = await res.json()
        setGmScore(data.total_gm_score || 0)
      }
    } catch (e) {
      console.error('Failed to fetch analytics', e)
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

    // Clear opponent state
    setOpponentTeam(null)
    setReceivedPlayers([])
    setSelectedOpponentIds(new Set())
    setOpponentRoster([])
    setOpponentProspects([])
    setSelectedOpponentProspectIds(new Set())

    // Clear draft picks
    setDraftPicksSent([])
    setDraftPicksReceived([])

    // Clear grade state
    setGradeResult(null)
    setGradeError(null)
    setValidation({ status: 'idle', issues: [] })

    // Clear cap info
    setChicagoCap(null)
    setOpponentCap(null)

    // Clear Chicago prospects (new team = new prospects)
    setProspects([])
    setSelectedProspectIds(new Set())

    // Clear 3-team trade state
    setTradeMode('2-team')
    setThirdTeam(null)
    setThirdTeamRoster([])
    setThirdTeamProspects([])
    setSelectedThirdTeamIds(new Set())
    setSelectedThirdTeamProspectIds(new Set())
    setDraftPicksTeam3Sent([])
    setDraftPicksTeam3Received([])
    setTradeFlows([])

    // Clear MLB salary retention & cash
    setSalaryRetentions({})
    setCashSent(0)
    setCashReceived(0)

    // Create new session for new team
    createSession(teamKey)

    // Fetch cap info for new team
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
    const isSelected = selectedPlayerIds.has(playerId)

    if (isSelected) {
      setSelectedPlayerIds(prev => {
        const next = new Set(prev)
        next.delete(playerId)
        return next
      })
      if (tradeMode === '3-team') {
        setTradeFlows(prev => prev.map(f =>
          f.from === selectedTeam
            ? { ...f, players: f.players.filter((p: any) => p.player_id !== playerId) }
            : f
        ).filter(f => f.players.length > 0 || f.picks.length > 0))
      }
    } else {
      if (tradeMode === '3-team' && opponentTeam && thirdTeam) {
        const player = roster.find(p => p.player_id === playerId)
        if (player) {
          setPendingPlayer({ player, fromTeamKey: selectedTeam })
          setShowDestinationPicker(true)
        }
      } else {
        setSelectedPlayerIds(prev => new Set([...prev, playerId]))
      }
    }
  }

  function toggleOpponentPlayer(playerId: string, playerData?: PlayerData) {
    const isSelected = selectedOpponentIds.has(playerId)

    if (isSelected) {
      setSelectedOpponentIds(prev => {
        const next = new Set(prev)
        next.delete(playerId)
        return next
      })
      setReceivedPlayers(rp => rp.filter(p => !('player_id' in p) || p.player_id !== playerId))
      if (tradeMode === '3-team') {
        setTradeFlows(prev => prev.map(f =>
          f.from === opponentTeam?.team_key
            ? { ...f, players: f.players.filter((p: any) => p.player_id !== playerId) }
            : f
        ).filter(f => f.players.length > 0 || f.picks.length > 0))
      }
    } else {
      const player = playerData || opponentRoster.find(p => p.player_id === playerId)
      if (tradeMode === '3-team' && thirdTeam && opponentTeam) {
        if (player) {
          setPendingPlayer({ player, fromTeamKey: opponentTeam.team_key })
          setShowDestinationPicker(true)
        }
      } else {
        setSelectedOpponentIds(prev => new Set([...prev, playerId]))
        if (player) setReceivedPlayers(rp => [...rp, player])
      }
    }
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

  function handleThirdTeamSelect(team: OpponentTeam) {
    setThirdTeam(team)
    setSelectedThirdTeamIds(new Set())
    setThirdTeamRoster([])
    setDraftPicksTeam3Sent([])
    setDraftPicksTeam3Received([])
    setSelectedThirdTeamProspectIds(new Set())
  }

  function toggleThirdTeamPlayer(playerId: string, playerData?: PlayerData) {
    const isSelected = selectedThirdTeamIds.has(playerId)

    if (isSelected) {
      setSelectedThirdTeamIds(prev => {
        const next = new Set(prev)
        next.delete(playerId)
        return next
      })
      setTradeFlows(prev => prev.map(f =>
        f.from === thirdTeam?.team_key
          ? { ...f, players: f.players.filter((p: any) => p.player_id !== playerId) }
          : f
      ).filter(f => f.players.length > 0 || f.picks.length > 0))
    } else {
      const player = playerData || thirdTeamRoster.find(p => p.player_id === playerId)
      if (player && opponentTeam && thirdTeam) {
        setPendingPlayer({ player, fromTeamKey: thirdTeam.team_key })
        setShowDestinationPicker(true)
      }
    }
  }

  function toggleThirdTeamProspect(prospectId: string) {
    setSelectedThirdTeamProspectIds(prev => {
      const next = new Set(prev)
      if (next.has(prospectId)) next.delete(prospectId)
      else next.add(prospectId)
      return next
    })
  }

  function handlePlayerWithDestination(player: PlayerData, fromTeamKey: string) {
    if (tradeMode === '2-team') {
      if (fromTeamKey === selectedTeam) {
        togglePlayer(player.player_id)
      } else {
        toggleOpponentPlayer(player.player_id)
      }
    } else {
      setPendingPlayer({ player, fromTeamKey })
      setShowDestinationPicker(true)
    }
  }

  function handleDestinationSelect(toTeamKey: string) {
    if (pendingPlayer) {
      const { player, fromTeamKey } = pendingPlayer

      setTradeFlows(prev => {
        const existingFlow = prev.find(f => f.from === fromTeamKey && f.to === toTeamKey)
        if (existingFlow) {
          return prev.map(f =>
            f.from === fromTeamKey && f.to === toTeamKey
              ? { ...f, players: [...f.players, player as any] }
              : f
          )
        } else {
          return [...prev, { from: fromTeamKey, to: toTeamKey, players: [player as any], picks: [] }]
        }
      })

      if (fromTeamKey === selectedTeam) {
        setSelectedPlayerIds(prev => new Set([...prev, player.player_id]))
      } else if (fromTeamKey === opponentTeam?.team_key) {
        setSelectedOpponentIds(prev => new Set([...prev, player.player_id]))
        if (toTeamKey === selectedTeam) {
          setReceivedPlayers(prev => [...prev, player])
        }
      } else if (fromTeamKey === thirdTeam?.team_key) {
        setSelectedThirdTeamIds(prev => new Set([...prev, player.player_id]))
      }

      setPendingPlayer(null)
    }

    if (pendingPick) {
      const { pick, fromTeamKey } = pendingPick

      setTradeFlows(prev => {
        const existingFlow = prev.find(f => f.from === fromTeamKey && f.to === toTeamKey)
        if (existingFlow) {
          return prev.map(f =>
            f.from === fromTeamKey && f.to === toTeamKey
              ? { ...f, picks: [...f.picks, pick] }
              : f
          )
        } else {
          return [...prev, { from: fromTeamKey, to: toTeamKey, players: [], picks: [pick] }]
        }
      })

      if (fromTeamKey === selectedTeam) {
        setDraftPicksSent(prev => [...prev, pick])
      } else if (fromTeamKey === opponentTeam?.team_key) {
        setDraftPicksReceived(prev => [...prev, pick])
      } else if (fromTeamKey === thirdTeam?.team_key) {
        setDraftPicksTeam3Received(prev => [...prev, pick])
      }

      setPendingPick(null)
    }

    setShowDestinationPicker(false)
  }

  function handleAddDraftPick(pick: DraftPick, fromTeamKey: string, target: 'sent' | 'received' | 'team3') {
    console.log('[handleAddDraftPick] called with:', { pick, fromTeamKey, target, tradeMode, hasOpponent: !!opponentTeam, hasThirdTeam: !!thirdTeam })
    if (tradeMode === '3-team' && opponentTeam && thirdTeam) {
      console.log('[handleAddDraftPick] 3-team mode - showing destination picker')
      setPendingPick({ pick, fromTeamKey })
      setShowDestinationPicker(true)
    } else {
      console.log('[handleAddDraftPick] 2-team mode - adding directly, target:', target)
      if (target === 'sent') {
        console.log('[handleAddDraftPick] Adding to draftPicksSent')
        setDraftPicksSent(prev => [...prev, pick])
      } else if (target === 'received') {
        console.log('[handleAddDraftPick] Adding to draftPicksReceived')
        setDraftPicksReceived(prev => [...prev, pick])
      }
    }
  }

  function getTeamsForPicker() {
    const teams: { key: string; name: string; logo: string | null; color: string }[] = []

    const chicagoConfig = TEAMS.find(t => t.key === selectedTeam)
    if (chicagoConfig) {
      teams.push({
        key: selectedTeam,
        name: chicagoConfig.label,
        logo: chicagoConfig.logo,
        color: chicagoConfig.color,
      })
    }

    if (opponentTeam) {
      teams.push({
        key: opponentTeam.team_key,
        name: opponentTeam.team_name,
        logo: opponentTeam.logo_url,
        color: opponentTeam.primary_color,
      })
    }

    if (thirdTeam) {
      teams.push({
        key: thirdTeam.team_key,
        name: thirdTeam.team_name,
        logo: thirdTeam.logo_url,
        color: thirdTeam.primary_color,
      })
    }

    return teams
  }

  function getFlowsForTeam(teamKey: string, direction: 'sending' | 'receiving') {
    if (direction === 'sending') {
      return tradeFlows.filter(f => f.from === teamKey)
    }
    return tradeFlows.filter(f => f.to === teamKey)
  }

  function handleRemoveFromFlow(fromTeam: string, toTeam: string, type: 'player' | 'pick', id: string | number) {
    setTradeFlows(prev => {
      return prev.map(f => {
        if (f.from !== fromTeam || f.to !== toTeam) return f
        if (type === 'player') {
          return { ...f, players: f.players.filter((p: any) => p.player_id !== id) }
        } else {
          return { ...f, picks: f.picks.filter((_: any, idx: number) => idx !== id) }
        }
      }).filter(f => f.players.length > 0 || f.picks.length > 0)
    })

    if (type === 'player') {
      const playerId = id as string
      if (fromTeam === selectedTeam) {
        setSelectedPlayerIds(prev => { const next = new Set(prev); next.delete(playerId); return next })
      } else if (fromTeam === opponentTeam?.team_key) {
        setSelectedOpponentIds(prev => { const next = new Set(prev); next.delete(playerId); return next })
        setReceivedPlayers(prev => prev.filter(p => !('player_id' in p) || p.player_id !== playerId))
      } else if (fromTeam === thirdTeam?.team_key) {
        setSelectedThirdTeamIds(prev => { const next = new Set(prev); next.delete(playerId); return next })
      }
    }
  }

  const selectedPlayers = roster.filter(p => selectedPlayerIds.has(p.player_id))
  const selectedProspects = prospects.filter(p => selectedProspectIds.has(p.id || p.prospect_id || ''))
  const selectedOpponentProspects = opponentProspects.filter(p => selectedOpponentProspectIds.has(p.id || p.prospect_id || ''))

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

  const threeTeamHasAssets = tradeFlows.some(f => f.players.length > 0 || f.picks.length > 0)
  const canGrade3Team = tradeMode === '3-team' && opponentTeam !== null && thirdTeam !== null && threeTeamHasAssets

  const canGrade = tradeMode === '2-team'
    ? (hasSomethingToSend && opponentTeam !== null && hasSomethingToReceive)
    : canGrade3Team

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
          draft_picks_sent: formatDraftPicksForAPI(draftPicksSent),
          draft_picks_received: formatDraftPicksForAPI(draftPicksReceived),
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
    console.log('[gradeTrade] called, canGrade:', canGrade, 'tradeMode:', tradeMode, 'thirdTeam:', !!thirdTeam)
    if (!canGrade) {
      console.log('[gradeTrade] canGrade is false, returning early')
      return
    }
    setGrading(true)
    setGradeResult(null)
    setGradeError(null)

    try {
      let requestBody: Record<string, any>

      if (tradeMode === '3-team' && thirdTeam) {
        console.log('[gradeTrade] Building 3-team trade request')
        console.log('[gradeTrade] tradeFlows:', tradeFlows)

        const chicagoKey = selectedTeam
        const partner1Key = opponentTeam!.team_key
        const partner2Key = thirdTeam.team_key

        const formatAsset = (player?: { full_name: string }, pick?: DraftPick, prospect?: MLBProspect): string => {
          if (player) return player.full_name
          if (prospect) return `${prospect.name} (PROSPECT)`
          if (pick) return `${pick.year} R${pick.round}${pick.pickNumber ? ` #${pick.pickNumber}` : ''}`
          return ''
        }

        const threeTeamDetails: Record<string, string[]> = {
          chicago_sends_to_partner_1: [],
          chicago_sends_to_partner_2: [],
          chicago_receives_from_partner_1: [],
          chicago_receives_from_partner_2: [],
          partner_1_sends_to_chicago: [],
          partner_1_receives_from_chicago: [],
          partner_1_sends_to_partner_2: [],
          partner_1_receives_from_partner_2: [],
          partner_2_sends_to_chicago: [],
          partner_2_sends_to_partner_1: [],
          partner_2_receives_from_chicago: [],
          partner_2_receives_from_partner_1: [],
        }

        for (const flow of tradeFlows) {
          const assets: string[] = []

          for (const player of flow.players) {
            assets.push(formatAsset(player))
          }
          if (flow.prospects) {
            for (const prospect of flow.prospects) {
              assets.push(formatAsset(undefined, undefined, prospect))
            }
          }
          for (const pick of flow.picks) {
            assets.push(formatAsset(undefined, pick))
          }

          if (flow.from === chicagoKey && flow.to === partner1Key) {
            threeTeamDetails.chicago_sends_to_partner_1.push(...assets)
            threeTeamDetails.partner_1_receives_from_chicago.push(...assets)
          } else if (flow.from === chicagoKey && flow.to === partner2Key) {
            threeTeamDetails.chicago_sends_to_partner_2.push(...assets)
            threeTeamDetails.partner_2_receives_from_chicago.push(...assets)
          } else if (flow.from === partner1Key && flow.to === chicagoKey) {
            threeTeamDetails.partner_1_sends_to_chicago.push(...assets)
            threeTeamDetails.chicago_receives_from_partner_1.push(...assets)
          } else if (flow.from === partner1Key && flow.to === partner2Key) {
            threeTeamDetails.partner_1_sends_to_partner_2.push(...assets)
            threeTeamDetails.partner_2_receives_from_partner_1.push(...assets)
          } else if (flow.from === partner2Key && flow.to === chicagoKey) {
            threeTeamDetails.partner_2_sends_to_chicago.push(...assets)
            threeTeamDetails.chicago_receives_from_partner_2.push(...assets)
          } else if (flow.from === partner2Key && flow.to === partner1Key) {
            threeTeamDetails.partner_2_sends_to_partner_1.push(...assets)
            threeTeamDetails.partner_1_receives_from_partner_2.push(...assets)
          }
        }

        console.log('[gradeTrade] 3-team threeTeamDetails:', threeTeamDetails)

        requestBody = {
          chicago_team: selectedTeam,
          trade_partner: opponentTeam!.team_name,
          partner_team_key: partner1Key,
          is_three_team: true,
          partner_2: thirdTeam.team_name,
          partner_2_key: partner2Key,
          sport: sport,
          three_team_details: threeTeamDetails,
          session_id: activeSession?.id,
        }
      } else {
        const playersSentArray = [
          ...selectedPlayers.map(p => ({
            name: p.full_name, position: p.position, stat_line: p.stat_line,
            age: p.age, jersey_number: p.jersey_number, headshot_url: p.headshot_url,
            college: p.college, weight_lbs: p.weight_lbs, years_exp: p.years_exp,
            draft_info: p.draft_info, espn_id: p.espn_id, stats: p.stats,
            cap_hit: p.cap_hit, contract_years: p.contract_years,
          })),
          ...selectedProspects.map(p => ({
            name: p.name,
            position: p.position,
            is_prospect: true,
            player_type: 'prospect' as const,
            prospect_grade: p.prospect_grade_numeric || 50,
            trade_value: p.trade_value || 0,
            org_rank: p.org_rank,
            current_level: p.current_level || p.level || 'MiLB',
            age: p.age || null,
            headshot_url: p.headshot_url || null,
          })),
        ]

        const playersReceivedArray = [
          ...receivedPlayers.map(p => {
            if ('player_id' in p) {
              return {
                name: p.full_name, position: p.position, stat_line: p.stat_line,
                age: p.age, jersey_number: p.jersey_number, headshot_url: p.headshot_url,
                college: p.college, weight_lbs: p.weight_lbs, years_exp: p.years_exp,
                draft_info: p.draft_info, espn_id: p.espn_id, stats: p.stats,
                cap_hit: p.cap_hit, contract_years: p.contract_years,
                salary_retention_pct: sport === 'mlb' ? (salaryRetentions[p.player_id] || 0) : undefined,
              }
            }
            return p
          }),
          ...selectedOpponentProspects.map(p => ({
            name: p.name,
            position: p.position,
            is_prospect: true,
            player_type: 'prospect' as const,
            prospect_grade: p.prospect_grade_numeric || 50,
            trade_value: p.trade_value || 0,
            org_rank: p.org_rank,
            current_level: p.current_level || p.level || 'MiLB',
            age: p.age || null,
            headshot_url: p.headshot_url || null,
          })),
        ]

        requestBody = {
          chicago_team: selectedTeam,
          trade_partner: opponentTeam!.team_name,
          partner_team_key: opponentTeam!.team_key,
          players_sent: playersSentArray,
          players_received: playersReceivedArray,
          draft_picks_sent: formatDraftPicksForAPI(draftPicksSent),
          draft_picks_received: formatDraftPicksForAPI(draftPicksReceived),
          session_id: activeSession?.id,
          salary_retentions: sport === 'mlb' ? salaryRetentions : undefined,
          cash_sent: sport === 'mlb' ? cashSent : undefined,
          cash_received: sport === 'mlb' ? cashReceived : undefined,
        }
      }

      console.log('[gradeTrade] Sending request:', requestBody)

      let res = await fetch('/api/v2/gm/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      console.log('[gradeTrade] v2 Response status:', res.status)

      if (!res.ok) {
        const v2Data = await res.json().catch(() => ({}))
        if (v2Data.fallback_to_legacy || res.status === 503 || res.status === 401 || res.status >= 400) {
          console.log('[gradeTrade] Falling back to v1 API (v2 status:', res.status, ')')
          res = await fetch('/api/gm/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          })
          console.log('[gradeTrade] v1 Response status:', res.status)
        }
      }

      if (res.ok) {
        const data = await res.json()
        console.log('[gradeTrade] Success response:', data)
        console.log('[gradeTrade] New fields check:', {
          grade: data.grade,
          hasHistoricalComparisons: !!data.historical_comparisons,
          historicalComparisonsCount: data.historical_comparisons?.length ?? 0,
          hasSuggestedTrade: !!data.suggested_trade,
          suggestedTradeType: data.suggested_trade?.type ?? 'none',
        })
        setGradeResult(data)
        fetchTrades()
        fetchLeaderboard()
        fetchSessions()
        fetchAnalytics()
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.log('[gradeTrade] Error response:', err)
        setGradeError(err.error || 'Failed to grade trade')
      }
    } catch (e) {
      console.error('[gradeTrade] Network error:', e)
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
    setSalaryRetentions({})
    setCashSent(0)
    setCashReceived(0)
    setTradeFlows([])
    setSelectedThirdTeamIds(new Set())
    setDraftPicksTeam3Sent([])
    setDraftPicksTeam3Received([])
    setSelectedThirdTeamProspectIds(new Set())
  }

  function editTrade() {
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

  // ... (JSX rendering continues - truncated for brevity)
  // The full JSX includes the main layout with:
  // - Header band with title and GM Score
  // - Team selection tabs
  // - Trade mode picker
  // - 3-column layout for desktop (Chicago roster, Trade board, Opponent roster)
  // - Mobile collapsible panels
  // - Modals for opponent picker, third team picker, destination picker
  // - Team fit overlay, preferences modal, simulation results

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: textColor }}>
      {/* Full JSX implementation... */}
    </div>
  )
}
```

## src/app/gm/analytics/page.tsx

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { AnalyticsDashboard } from '@/components/gm/AnalyticsDashboard'

export default function GMAnalyticsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login?next=/gm/analytics')
      return
    }
    setPageLoading(false)
  }, [authLoading, isAuthenticated, router])

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: textColor, margin: 0, letterSpacing: '-0.5px' }}>
              GM Analytics
            </h1>
            <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
              Track your trade performance and patterns
            </p>
          </div>
          <Link
            href="/gm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 10,
              backgroundColor: '#bc0000',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to War Room
          </Link>
        </div>

        {/* Dashboard */}
        <div className={`rounded-xl border p-6 ${cardBg}`}>
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}
```

## src/app/gm/share/[code]/page.tsx

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface TradeData {
  id: string
  chicago_team: string
  sport: string
  trade_partner: string
  players_sent: any[]
  players_received: any[]
  draft_picks_sent: any[]
  draft_picks_received: any[]
  grade: number
  grade_reasoning: string
  status: string
  is_dangerous: boolean
  improvement_score: number
  trade_summary: string
  talent_balance: number
  contract_value: number
  team_fit: number
  future_assets: number
  partner_team_key: string
  partner_team_logo: string
  chicago_team_logo: string
  created_at: string
  items: any[]
}

const TEAM_CONFIG: Record<string, { name: string; color: string; logo: string }> = {
  'chicago-bears': { name: 'Chicago Bears', color: '#0B162A', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  'chicago-bulls': { name: 'Chicago Bulls', color: '#CE1141', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  'chicago-blackhawks': { name: 'Chicago Blackhawks', color: '#CF0A2C', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  'chicago-cubs': { name: 'Chicago Cubs', color: '#0E3386', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  'chicago-white-sox': { name: 'Chicago White Sox', color: '#27251F', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
}

export default function SharePage() {
  const params = useParams()
  const code = params?.code as string
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [trade, setTrade] = useState<TradeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return

    fetch(`/api/gm/share/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('Trade not found')
        return res.json()
      })
      .then(data => {
        setTrade(data.trade)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [code])

  const textColor = isDark ? '#f9fafb' : '#1f2937'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const pageBg = isDark ? '#111827' : '#f3f4f6'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: pageBg }}>
        <div className="w-8 h-8 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: pageBg, color: textColor }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>404</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Trade Not Found</h1>
          <p style={{ color: subText, marginBottom: 24 }}>This trade link may have expired or doesn't exist.</p>
          <Link
            href="/gm"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#bc0000',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Build Your Own Trade
          </Link>
        </div>
      </div>
    )
  }

  const chicagoConfig = TEAM_CONFIG[trade.chicago_team] || { name: trade.chicago_team, color: '#bc0000', logo: trade.chicago_team_logo }
  const gradeColor = trade.grade >= 70 ? '#22c55e' : trade.grade >= 50 ? '#eab308' : '#ef4444'

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: textColor }}>
      {/* Header */}
      <div style={{
        backgroundColor: cardBg,
        borderBottom: `1px solid ${borderColor}`,
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/sm-icon.png" alt="SportsMockery" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#bc0000' }}>SportsMockery</span>
          </Link>
          <Link
            href="/gm"
            style={{
              padding: '8px 16px',
              backgroundColor: '#bc0000',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Build Your Trade
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* Trade Card */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {/* Grade Header */}
          <div style={{
            background: `linear-gradient(135deg, ${chicagoConfig.color}20, ${gradeColor}20)`,
            padding: '32px 24px',
            textAlign: 'center',
            borderBottom: `1px solid ${borderColor}`,
          }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>
              {trade.grade}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <span style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '1px',
                backgroundColor: trade.status === 'accepted' ? '#22c55e20' : '#ef444420',
                color: trade.status === 'accepted' ? '#22c55e' : '#ef4444',
              }}>
                {trade.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
              </span>
              {trade.is_dangerous && (
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: 12,
                  backgroundColor: '#eab30820',
                  color: '#eab308',
                }}>
                  DANGEROUS
                </span>
              )}
            </div>
          </div>

          {/* Trade Details */}
          <div style={{ padding: 24 }}>
            {/* Teams */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={chicagoConfig.logo || trade.chicago_team_logo}
                  alt={chicagoConfig.name}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: chicagoConfig.color }}>{chicagoConfig.name}</div>
                  <div style={{ fontSize: 12, color: subText }}>Sends</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoConfig.color} strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: textColor }}>{trade.trade_partner}</div>
                  <div style={{ fontSize: 12, color: subText }}>Sends</div>
                </div>
                {trade.partner_team_logo && (
                  <img
                    src={trade.partner_team_logo}
                    alt={trade.trade_partner}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
              </div>
            </div>

            {/* Assets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Chicago sends */}
              <div style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? '#111827' : '#f9fafb',
                border: `1px solid ${borderColor}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                  {chicagoConfig.name} Sends
                </div>
                {trade.players_sent?.map((p: any, i: number) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: subText }}>{p.position}</div>
                  </div>
                ))}
                {trade.draft_picks_sent?.map((pk: any, i: number) => (
                  <div key={`dp-${i}`} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#8b5cf6' }}>
                      {pk.year} Round {pk.round} Pick
                    </div>
                  </div>
                ))}
              </div>

              {/* Opponent sends */}
              <div style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? '#111827' : '#f9fafb',
                border: `1px solid ${borderColor}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                  {trade.trade_partner} Sends
                </div>
                {trade.players_received?.map((p: any, i: number) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: subText }}>{p.position}</div>
                  </div>
                ))}
                {trade.draft_picks_received?.map((pk: any, i: number) => (
                  <div key={`dp-${i}`} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#8b5cf6' }}>
                      {pk.year} Round {pk.round} Pick
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {trade.trade_summary && (
              <div style={{
                fontSize: 14,
                color: subText,
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: isDark ? '#111827' : '#f9fafb',
              }}>
                "{trade.trade_summary}"
              </div>
            )}

            {/* Reasoning */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: isDark ? '#111827' : '#f9fafb',
              fontSize: 13,
              lineHeight: 1.6,
              color: textColor,
            }}>
              {trade.grade_reasoning}
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div style={{
          backgroundColor: '#bc0000',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>Think you can do better?</div>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>
            Build your own trades and get AI-powered grades from our GM Trade Simulator
          </p>
          <Link
            href="/gm"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#fff',
              color: '#bc0000',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Try the Trade Simulator
          </Link>
          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
            Free for all SportsMockery members
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 32,
          padding: '16px 0',
          borderTop: `1px solid ${borderColor}`,
          color: subText,
          fontSize: 12,
        }}>
          <p>Created with SportsMockery GM Trade Simulator</p>
          <p style={{ marginTop: 4 }}>test.sportsmockery.com/gm</p>
        </div>
      </main>
    </div>
  )
}
```

---

# Part 2: API Routes (`src/app/api/gm/`)

## src/app/api/gm/grade/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

// Version marker for debugging
const API_VERSION = 'v2.0.0-edge-function'

// Supabase Edge Function URL for deterministic grading
const EDGE_FUNCTION_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co/functions/v1/grade-trade'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

// Call the Supabase Edge Function to get deterministic grade
async function getDeterministicGrade(payload: {
  chicago_team: string
  sport: string
  players_sent: any[]
  players_received: any[]
  draft_picks_sent?: any[]
  draft_picks_received?: any[]
}): Promise<{ grade: number; breakdown: any; debug?: any } | null> {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DATALAB_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Edge function error:', response.status, await response.text())
      return null
    }

    const result = await response.json()
    if (result.grade !== undefined) {
      return {
        grade: result.grade,
        breakdown: result.breakdown,
        debug: result.debug,
      }
    }
    return null
  } catch (error) {
    console.error('Edge function call failed:', error)
    return null
  }
}

const TEAM_SPORT_MAP: Record<string, string> = {
  bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb',
}

// Fetch data freshness for a team
async function getDataFreshness(teamKey: string, sport: string): Promise<{
  roster_updated_at: string
  stats_updated_at: string
  contracts_updated_at: string
  age_hours: number
  is_stale: boolean
  warning?: string
} | null> {
  // Implementation fetches from gm_data_freshness or calculates from team tables
  // ... (full implementation in source)
}

const MODEL_NAME = 'claude-sonnet-4-20250514'

const GM_SYSTEM_PROMPT = `You are "GM", a practical sports trade evaluator...`
// Full system prompt defines grading anchors, criteria, sport-specific rules, etc.

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const user = await getGMAuthUser(request)
    const userId = user?.id || 'guest'
    const isGuest = !user

    // Rate limiting: max 10 trades per minute
    if (!isGuest) {
      const oneMinAgo = new Date(Date.now() - 60000).toISOString()
      const { count: recentCount } = await datalabAdmin
        .from('gm_trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneMinAgo)
      if ((recentCount || 0) >= 10) {
        return NextResponse.json({ error: 'Rate limited. Max 10 trades per minute.' }, { status: 429 })
      }
    }

    const body = await request.json()
    // Extract trade data from body...

    // Detect 3-team trade
    const isThreeTeamTrade = !!(body.trade_partner_1 && body.trade_partner_2)

    if (isThreeTeamTrade) {
      // Handle 3-team trade grading
      // ... (calls AI, saves to database)
    }

    // 2-team trade logic
    // 1. Call Edge Function for deterministic grade
    // 2. Call AI for contextual analysis
    // 3. Combine grades with override limits
    // 4. Save trade to database
    // 5. Update leaderboard and session

    return NextResponse.json({
      grade,
      reasoning,
      status,
      is_dangerous,
      // ... other fields
    })

  } catch (error) {
    console.error('GM grade error:', error)
    return NextResponse.json({ error: 'Failed to grade trade' }, { status: 500 })
  }
}
```

## src/app/api/gm/roster/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const TEAM_CONFIG: Record<string, {
  table: string
  activeCol: string
  sport: string
  nameCol: string
  statsTable: string
  statsJoinCol: string
  seasonValue: number
  gmRosterTeamKey: string
}> = {
  bears: { table: 'bears_players', activeCol: 'is_active', sport: 'nfl', nameCol: 'name', statsTable: 'bears_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025, gmRosterTeamKey: 'bears' },
  bulls: { table: 'bulls_players', activeCol: 'is_current_bulls', sport: 'nba', nameCol: 'display_name', statsTable: 'bulls_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2026, gmRosterTeamKey: 'bulls' },
  blackhawks: { table: 'blackhawks_players', activeCol: 'is_active', sport: 'nhl', nameCol: 'name', statsTable: 'blackhawks_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2026, gmRosterTeamKey: 'blackhawks' },
  cubs: { table: 'cubs_players', activeCol: 'is_active', sport: 'mlb', nameCol: 'name', statsTable: 'cubs_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025, gmRosterTeamKey: 'cubs' },
  whitesox: { table: 'whitesox_players', activeCol: 'is_active', sport: 'mlb', nameCol: 'name', statsTable: 'whitesox_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025, gmRosterTeamKey: 'whitesox' },
}

const SPORT_ROSTER_TABLE: Record<string, string> = {
  nfl: 'gm_nfl_rosters',
  nba: 'gm_nba_rosters',
  nhl: 'gm_nhl_rosters',
  mlb: 'gm_mlb_rosters',
}

async function fetchOpponentRoster(teamKey: string, sport: string, search?: string, posFilter?: string) {
  const table = SPORT_ROSTER_TABLE[sport]
  if (!table) throw new Error('Invalid sport')

  const { data: rawPlayers, error } = await datalabAdmin
    .from(table)
    .select('espn_player_id, full_name, position, jersey_number, headshot_url, age, weight_lbs, college, years_exp, draft_year, draft_round, draft_pick, base_salary, cap_hit, contract_years_remaining, contract_expires_year, contract_signed_year, is_rookie_deal, status')
    .eq('team_key', teamKey)
    .eq('is_active', true)
    .order('position')
    .order('full_name')

  if (error) throw error
  // Map and filter players...
  return players
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Please sign in to use the GM Trade Simulator', code: 'AUTH_REQUIRED' }, { status: 401 })

    // Handle opponent roster (team_key + sport params)
    // Handle Chicago roster (team param)
    // Fetch stats and build stat lines

    return NextResponse.json({ players, sport })
  } catch (error) {
    console.error('GM roster error:', error)
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 })
  }
}
```

## src/app/api/gm/teams/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sport = request.nextUrl.searchParams.get('sport')
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase()
    const excludeTeam = request.nextUrl.searchParams.get('exclude')

    let query = datalabAdmin
      .from('gm_league_teams')
      .select('team_key, team_name, abbreviation, city, logo_url, primary_color, secondary_color, conference, division, sport')
      .order('conference')
      .order('division')
      .order('team_name')
      .limit(150)

    if (sport) query = query.eq('sport', sport)
    if (excludeTeam) query = query.neq('team_key', excludeTeam)

    const { data: teams, error } = await query
    if (error) throw error

    let filtered = teams || []
    if (search) {
      filtered = filtered.filter((t: any) =>
        t.team_name.toLowerCase().includes(search) ||
        t.abbreviation.toLowerCase().includes(search) ||
        t.city.toLowerCase().includes(search)
      )
    }

    return NextResponse.json({ teams: filtered })
  } catch (error) {
    console.error('GM teams error:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}
```

## src/app/api/gm/sessions/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const TEAM_SPORT_MAP: Record<string, string> = {
  bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Sign in to save your trade sessions', code: 'AUTH_REQUIRED' }, { status: 401 })

    const { data: sessions, error } = await datalabAdmin
      .from('gm_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ sessions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    const body = await request.json()
    const { chicago_team, session_name } = body

    if (!chicago_team || !TEAM_SPORT_MAP[chicago_team]) {
      return NextResponse.json({ error: 'Invalid chicago_team' }, { status: 400 })
    }

    // Return fake session for guests
    if (!user) {
      return NextResponse.json({
        session: {
          id: 'guest-session',
          session_name: session_name || `${chicago_team.charAt(0).toUpperCase() + chicago_team.slice(1)} Trade Session`,
          // ... other fields
        }
      })
    }

    // Deactivate previous sessions, create new one
    // Update leaderboard with active session
    return NextResponse.json({ session })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
```

## src/app/api/gm/trades/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Sign in to view your trade history', code: 'AUTH_REQUIRED' }, { status: 401 })

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100)
    const sessionId = request.nextUrl.searchParams.get('session_id')
    const offset = (page - 1) * limit

    let query = datalabAdmin
      .from('gm_trades')
      .select('*, gm_trade_items(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sessionId) query = query.eq('session_id', sessionId)

    const { data: trades, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      trades: trades || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Please sign in to manage your trades', code: 'AUTH_REQUIRED' }, { status: 401 })

    await datalabAdmin.from('gm_sessions').update({ is_active: false, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    await datalabAdmin.from('gm_trades').delete().eq('user_id', user.id)
    await datalabAdmin.from('gm_leaderboard').delete().eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear trades' }, { status: 500 })
  }
}
```

## src/app/api/gm/leaderboard/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const SPORT_TO_TEAM: Record<string, string> = {
  'NFL': 'bears',
  'NBA': 'bulls',
  'MLB': 'cubs',
  'NHL': 'blackhawks',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Sign in to view the GM leaderboard', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const team = request.nextUrl.searchParams.get('team')
    const sport = request.nextUrl.searchParams.get('sport')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10)

    let teamFilter = team
    if (sport && SPORT_TO_TEAM[sport]) teamFilter = SPORT_TO_TEAM[sport]

    let query = datalabAdmin
      .from('gm_leaderboard')
      .select('*, users:user_id(username, email)')
      .order('total_improvement', { ascending: false })
      .limit(limit)

    if (teamFilter) query = query.eq('favorite_team', teamFilter)

    const { data: leaderboard, error } = await query
    if (error) throw error

    // Add rank and format response
    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      total_participants,
      sport,
      month_name,
      year,
      days_remaining,
      status: 'active',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
```

## src/app/api/gm/share/[code]/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const { data: trade, error } = await datalabAdmin
      .from('gm_trades')
      .select('id, chicago_team, sport, trade_partner, players_sent, players_received, grade, grade_reasoning, status, is_dangerous, improvement_score, trade_summary, talent_balance, contract_value, team_fit, future_assets, partner_team_key, partner_team_logo, chicago_team_logo, draft_picks_sent, draft_picks_received, created_at')
      .eq('shared_code', code)
      .single()

    if (error || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    const { data: items } = await datalabAdmin
      .from('gm_trade_items')
      .select('*')
      .eq('trade_id', trade.id)
      .order('side')
      .order('asset_type')

    return NextResponse.json({ trade: { ...trade, items: items || [] } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 })
  }
}
```

## src/app/api/gm/cap/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const SPORT_CAP_TABLE: Record<string, string> = {
  nfl: 'gm_nfl_salary_cap',
  nba: 'gm_nba_salary_cap',
  nhl: 'gm_nhl_salary_cap',
  mlb: 'gm_mlb_salary_cap',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Please sign in', code: 'AUTH_REQUIRED' }, { status: 401 })

    const teamKey = request.nextUrl.searchParams.get('team_key')
    const sport = request.nextUrl.searchParams.get('sport')

    if (!teamKey || !sport || !SPORT_CAP_TABLE[sport]) {
      return NextResponse.json({ error: 'team_key and valid sport required' }, { status: 400 })
    }

    const { data, error } = await datalabAdmin
      .from(SPORT_CAP_TABLE[sport])
      .select('total_cap, cap_used, cap_available, dead_money')
      .eq('team_key', teamKey)
      .order('season', { ascending: false })
      .limit(1)
      .single()

    if (error) return NextResponse.json({ cap: null })
    return NextResponse.json({ cap: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cap data' }, { status: 500 })
  }
}
```

## src/app/api/gm/fit/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export interface TeamFitResult {
  player_name: string
  player_espn_id?: string
  target_team: string
  overall_fit: number
  breakdown: {
    positional_need: number
    age_fit: number
    cap_fit: number
    scheme_fit: number
  }
  insights: {
    positional_need: string
    age_fit: string
    cap_fit: string
    scheme_fit: string
  }
  recommendation: string
  comparable_acquisitions?: Array<{
    player_name: string
    team: string
    fit_score: number
    outcome: 'success' | 'neutral' | 'failure'
  }>
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    // Get params and call Data Lab for fit analysis
    // Return fallback if Data Lab unavailable
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze team fit' }, { status: 500 })
  }
}
```

## src/app/api/gm/validate/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export interface ValidationResult {
  status: 'valid' | 'warning' | 'invalid'
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    code: string
    message: string
    player_name?: string
  }>
  cap_impact?: { chicago_delta: number; partner_delta: number; chicago_over_cap: boolean; partner_over_cap: boolean }
  roster_impact?: { chicago_roster_size_after: number; partner_roster_size_after: number; position_conflicts: string[] }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithToken()
    if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await request.json()

    // Quick client-side validation (empty trade, untouchable players)
    // Then call Data Lab for comprehensive validation
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ status: 'valid', issues: [] })
  }
}
```

## src/app/api/gm/analytics/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

interface AnalyticsResult {
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  dangerous_trades: number
  average_grade: number
  highest_grade: number
  lowest_grade: number
  total_gm_score: number
  grade_distribution: Array<{ bucket: string; count: number; percentage: number }>
  trading_partners: Array<{ team_name: string; team_key: string; trade_count: number; avg_grade: number }>
  position_analysis: Array<{ position: string; sent_count: number; received_count: number; net_value: number }>
  activity_timeline: Array<{ date: string; trade_count: number; avg_grade: number }>
  chicago_teams: Array<{ team: string; trade_count: number; avg_grade: number; accepted_rate: number }>
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    // Try Data Lab first, fallback to local analytics calculation
    // Calculates grade distribution, trading partners, position analysis, etc.
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
```

## src/app/api/gm/preferences/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export interface GMPreferences {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  favorite_team: string | null
  team_phase: 'rebuilding' | 'contending' | 'win_now' | 'auto'
  preferred_trade_style: 'balanced' | 'star_hunting' | 'depth_building' | 'draft_focused'
  cap_flexibility_priority: 'low' | 'medium' | 'high'
  age_preference: 'young' | 'prime' | 'veteran' | 'any'
}

export async function GET(request: NextRequest) {
  // Fetch user preferences from Data Lab or local database
}

export async function POST(request: NextRequest) {
  // Validate and save preferences
}
```

## src/app/api/gm/scenarios/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

export type ScenarioType = 'player_improvement' | 'player_decline' | 'injury_impact' | 'add_pick' | 'remove_player' | 'age_progression'

export interface ScenarioResult {
  scenario_type: ScenarioType
  description: string
  original_grade: number
  adjusted_grade: number
  grade_delta: number
  reasoning: string
  breakdown_changes?: { talent_balance_delta: number; contract_value_delta: number; team_fit_delta: number; future_assets_delta: number }
  probability?: number
}

export async function POST(request: NextRequest) {
  // Call Data Lab for scenario analysis or run local simulation
}
```

## src/app/api/gm/simulate/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

interface SimulationResult {
  num_simulations: number
  original_grade: number
  mean_grade: number
  median_grade: number
  std_deviation: number
  percentiles: { p5: number; p10: number; p25: number; p50: number; p75: number; p90: number; p95: number }
  distribution: Array<{ grade_bucket: number; count: number; percentage: number }>
  risk_analysis: { downside_risk: number; upside_potential: number; variance_band: [number, number] }
  key_factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; magnitude: number; description: string }>
}

export async function POST(request: NextRequest) {
  // Run Monte Carlo simulation locally or via Data Lab
}
```

## src/app/api/gm/export/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export type ExportFormat = 'json' | 'csv' | 'pdf'

export async function POST(request: NextRequest) {
  // Export trades in requested format (JSON, CSV, or PDF)
}
```

## src/app/api/gm/audit/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const MODEL_NAME = 'claude-sonnet-4-20250514'

const AUDITOR_SYSTEM_PROMPT = `You are GM Auditor, an expert sports trade analyst who validates trade grades...`

export async function POST(request: NextRequest) {
  // Fetch trade, get verified player data, call AI auditor
  // Cache audit results in gm_audits table
}
```

## src/app/api/gm/prospects/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const TEAM_KEY_TO_ABBREV: Record<string, string> = {
  'cubs': 'chc',
  'whitesox': 'chw',
  // ... all MLB teams
}

export async function GET(request: NextRequest) {
  // Fetch MLB prospects from gm_mlb_prospects table
  return NextResponse.json({ prospects, count })
}
```

## src/app/api/gm/log-error/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Fetch errors for admin page
}

export async function POST(request: NextRequest) {
  // Log a new error from frontend or backend
}
```

## src/app/api/gm/user-score/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Get user's combined score (trade + mock draft)
}

export async function POST(request: NextRequest) {
  // Set best mock draft for combined scoring
}
```

## src/app/api/gm/user-position/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Get user's position in leaderboard for specific sport
  // Returns rank, score, percentile, points to top 20
}
```

## src/app/api/gm/sim/season/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { simulateSeason } from '@/lib/sim/season-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, sport, teamKey, seasonYear } = body

    if (!sessionId || !sport || !teamKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await simulateSeason({
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
```

---

# Part 3: Draft API Routes (`src/app/api/gm/draft/`)

## src/app/api/gm/draft/start/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const CHICAGO_TEAMS: Record<string, { key: string; name: string; sport: string }> = {
  bears: { key: 'chi', name: 'Chicago Bears', sport: 'nfl' },
  bulls: { key: 'chi', name: 'Chicago Bulls', sport: 'nba' },
  blackhawks: { key: 'chi', name: 'Chicago Blackhawks', sport: 'nhl' },
  cubs: { key: 'chc', name: 'Chicago Cubs', sport: 'mlb' },
  whitesox: { key: 'chw', name: 'Chicago White Sox', sport: 'mlb' },
}

export async function POST(request: NextRequest) {
  // Create mock draft session via RPC
  // Fetch draft order from gm_draft_order
  // Create all picks via RPC
  return NextResponse.json({ draft: { id, picks, user_picks, ... } })
}
```

## src/app/api/gm/draft/prospects/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Fetch prospects from draft_prospects table
  // Filter by sport, year, search, position
  return NextResponse.json({ prospects: mappedProspects })
}
```

## src/app/api/gm/draft/pick/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Update pick via RPC
  // Advance to next pick
  return NextResponse.json({ draft: { ... } })
}
```

## src/app/api/gm/draft/auto/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Auto-advance draft using BPA (Best Player Available)
  // Simulate picks until reaching user's pick
  return NextResponse.json({ draft: { ... }, picksAdvanced })
}
```

## src/app/api/gm/draft/grade/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const MODEL_NAME = 'claude-sonnet-4-20250514'

const GRADE_SYSTEM_PROMPT = `You are an expert draft analyst grading a user's mock draft performance...`

export async function POST(request: NextRequest) {
  // Get user's picks, call AI for grading
  // Complete mock draft via RPC
  // Update combined user score
  return NextResponse.json({ grade: { overall_grade, letter_grade, analysis, ... } })
}
```

## src/app/api/gm/draft/history/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Fetch user's draft history with pick counts
  return NextResponse.json({ drafts, total, page, limit })
}
```

## src/app/api/gm/draft/eligibility/route.ts

```ts
import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Check draft eligibility based on prospect availability and window status
  return NextResponse.json({ teams: enhancedTeams })
}
```

## src/app/api/gm/draft/share/[mockId]/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mockId: string }> }
) {
  // Fetch mock draft with grade data and picks
  return NextResponse.json({ draft: { ... } })
}
```

---

*End of Part 1 - API Routes. Components documentation to follow.*

---

# Part 4: Components (`src/components/gm/`)


## src/components/gm/AgingCurveWidget.tsx

```tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface AgingCurveData {
  playerName: string
  position: string
  playerAge: number
  peakAgeStart: number
  peakAgeEnd: number
  declineStart: number
  cliffAge: number
  multiplier: number
  assessment: 'developing' | 'in_prime' | 'declining' | 'past_prime'
  primeYearsRemaining: number
}

interface AgingCurveWidgetProps {
  data: AgingCurveData
  teamColor: string
}

const ASSESSMENT_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  developing: { label: 'DEVELOPING', color: '#22c55e', bg: '#22c55e20' },
  in_prime: { label: 'IN PRIME', color: '#3b82f6', bg: '#3b82f620' },
  declining: { label: 'DECLINING', color: '#f59e0b', bg: '#f59e0b20' },
  past_prime: { label: 'PAST PRIME', color: '#ef4444', bg: '#ef444420' },
}

// Generate curve points for SVG path
function generateCurvePath(
  peakStart: number,
  peakEnd: number,
  declineStart: number,
  cliffAge: number,
  minAge: number = 22,
  maxAge: number = 38,
  width: number = 280,
  height: number = 100
): string {
  const ageRange = maxAge - minAge
  const xScale = (age: number) => ((age - minAge) / ageRange) * width
  const yScale = (pct: number) => height - (pct * height)

  // Build curve points
  const points: Array<{ x: number; y: number }> = []

  // Before peak (developing)
  for (let age = minAge; age < peakStart; age++) {
    const progress = (age - minAge) / (peakStart - minAge)
    const pct = 0.5 + (progress * 0.5) // 50% to 100%
    points.push({ x: xScale(age), y: yScale(pct) })
  }

  // Peak years (100%)
  for (let age = peakStart; age <= peakEnd; age++) {
    points.push({ x: xScale(age), y: yScale(1) })
  }

  // Decline phase
  for (let age = peakEnd + 1; age <= cliffAge; age++) {
    const progress = (age - peakEnd) / (cliffAge - peakEnd)
    const pct = 1 - (progress * 0.6) // 100% to 40%
    points.push({ x: xScale(age), y: yScale(pct) })
  }

  // After cliff (sharp drop)
  for (let age = cliffAge + 1; age <= maxAge; age++) {
    const progress = (age - cliffAge) / (maxAge - cliffAge)
    const pct = 0.4 - (progress * 0.25) // 40% to 15%
    points.push({ x: xScale(age), y: yScale(Math.max(0.1, pct)) })
  }

  // Create smooth curve path
  if (points.length < 2) return ''

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    path += ` Q ${prev.x + 10} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`
  }
  path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`

  return path
}

export function AgingCurveWidget({ data, teamColor }: AgingCurveWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!data) return null

  const assessmentStyle = ASSESSMENT_STYLES[data.assessment] || ASSESSMENT_STYLES.declining

  const minAge = 22
  const maxAge = 38
  const chartWidth = 280
  const chartHeight = 100

  const xScale = (age: number) => ((age - minAge) / (maxAge - minAge)) * chartWidth
  const yScale = (pct: number) => chartHeight - (pct * chartHeight)

  // Calculate player's current position on curve
  let playerPct = 1 // Default to peak
  if (data.playerAge < data.peakAgeStart) {
    const progress = (data.playerAge - minAge) / (data.peakAgeStart - minAge)
    playerPct = 0.5 + (progress * 0.5)
  } else if (data.playerAge > data.peakAgeEnd && data.playerAge <= data.cliffAge) {
    const progress = (data.playerAge - data.peakAgeEnd) / (data.cliffAge - data.peakAgeEnd)
    playerPct = 1 - (progress * 0.6)
  } else if (data.playerAge > data.cliffAge) {
    const progress = Math.min(1, (data.playerAge - data.cliffAge) / (maxAge - data.cliffAge))
    playerPct = 0.4 - (progress * 0.25)
  }

  const playerX = xScale(data.playerAge)
  const playerY = yScale(Math.max(0.1, playerPct))

  const curvePath = generateCurvePath(
    data.peakAgeStart,
    data.peakAgeEnd,
    data.declineStart,
    data.cliffAge,
    minAge,
    maxAge,
    chartWidth,
    chartHeight
  )

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>📈</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {data.position} Aging Curve
        </h4>
      </div>

      {/* Chart Container */}
      <div style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        marginBottom: 12,
      }}>
        {/* Y-Axis Labels */}
        <div style={{
          display: 'flex',
          gap: 8,
        }}>
          <div style={{
            width: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: 10,
            color: isDark ? '#64748b' : '#94a3b8',
            textAlign: 'right',
            paddingRight: 4,
            height: chartHeight,
          }}>
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
          </div>

          {/* SVG Chart */}
          <div style={{ position: 'relative' }}>
            <svg
              width={chartWidth}
              height={chartHeight}
              style={{ overflow: 'visible' }}
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1={0}
                  y1={yScale(pct)}
                  x2={chartWidth}
                  y2={yScale(pct)}
                  stroke={isDark ? '#1e293b' : '#e2e8f0'}
                  strokeDasharray="4"
                />
              ))}

              {/* Peak range highlight */}
              <rect
                x={xScale(data.peakAgeStart)}
                y={0}
                width={xScale(data.peakAgeEnd) - xScale(data.peakAgeStart)}
                height={chartHeight}
                fill={isDark ? '#22c55e10' : '#22c55e15'}
              />

              {/* Curve */}
              <path
                d={curvePath}
                fill="none"
                stroke={teamColor}
                strokeWidth={3}
                strokeLinecap="round"
              />

              {/* Player marker */}
              <circle
                cx={playerX}
                cy={playerY}
                r={8}
                fill={assessmentStyle.color}
                stroke="#fff"
                strokeWidth={2}
              />

              {/* Player age label */}
              <text
                x={playerX}
                y={playerY - 15}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={assessmentStyle.color}
              >
                Age {data.playerAge}
              </text>
            </svg>

            {/* X-Axis Labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 10,
              color: isDark ? '#64748b' : '#94a3b8',
              width: chartWidth,
            }}>
              {[22, 26, 30, 34, 38].map((age) => (
                <span key={age} style={{ textAlign: 'center', width: 30 }}>{age}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player Summary */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `2px solid ${assessmentStyle.color}`,
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 15,
          color: teamColor,
          marginBottom: 8,
        }}>
          {data.playerName}, Age {data.playerAge}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 10,
        }}>
          <div style={{
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            Peak Range: <strong style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{data.peakAgeStart}-{data.peakAgeEnd}</strong>
          </div>
          <div style={{
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            Multiplier: <strong style={{ color: assessmentStyle.color }}>{data.multiplier.toFixed(2)}x</strong>
          </div>
          <div style={{
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            Prime Years Left: <strong style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{data.primeYearsRemaining}</strong>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
          }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: assessmentStyle.bg,
              color: assessmentStyle.color,
            }}>
              {assessmentStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* Position Reference */}
      <div style={{
        marginTop: 10,
        padding: 10,
        borderRadius: 6,
        backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
        fontSize: 10,
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Position Peak Ranges:</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span>QB: 28-33</span>
          <span>EDGE: 26-29</span>
          <span>WR: 27-30</span>
          <span>CB: 25-28</span>
          <span>OT: 27-32</span>
          <span>RB: 22-27</span>
        </div>
      </div>
    </div>
  )
}
```


## src/components/gm/AnalyticsDashboard.tsx

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

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
  position_analysis: Array<{
    position: string
    sent_count: number
    received_count: number
    net_value: number
  }>
  activity_timeline: Array<{
    date: string
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

export function AnalyticsDashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const distributionCanvasRef = useRef<HTMLCanvasElement>(null)
  const timelineCanvasRef = useRef<HTMLCanvasElement>(null)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? '#1f2937' : '#fff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      try {
        const res = await fetch('/api/gm/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const result = await res.json()
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  // Draw grade distribution chart
  useEffect(() => {
    if (!data || !distributionCanvasRef.current) return

    const canvas = distributionCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 300
    const height = 150
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const padding = { top: 10, right: 10, bottom: 25, left: 30 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom
    const barWidth = chartW / data.grade_distribution.length - 4

    const maxPct = Math.max(...data.grade_distribution.map(d => d.percentage), 1)

    data.grade_distribution.forEach((d, i) => {
      const barH = (d.percentage / maxPct) * chartH
      const x = padding.left + i * (barWidth + 4) + 2
      const y = padding.top + chartH - barH

      const bucketStart = parseInt(d.bucket.split('-')[0])
      let color = '#ef4444'
      if (bucketStart >= 70) color = '#22c55e'
      else if (bucketStart >= 50) color = '#eab308'

      ctx.fillStyle = color + '80'
      ctx.fillRect(x, y, barWidth, barH)

      ctx.fillStyle = subText
      ctx.font = '9px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(d.bucket.split('-')[0], x + barWidth / 2, height - 5)
    })

    // Y-axis
    ctx.fillStyle = subText
    ctx.font = '9px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText('0%', padding.left - 4, padding.top + chartH)
    ctx.fillText(`${maxPct}%`, padding.left - 4, padding.top + 10)
  }, [data, isDark, subText])

  // Draw timeline chart
  useEffect(() => {
    if (!data || !timelineCanvasRef.current || data.activity_timeline.length === 0) return

    const canvas = timelineCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 300
    const height = 120
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const padding = { top: 10, right: 10, bottom: 20, left: 30 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    const timeline = data.activity_timeline
    const maxCount = Math.max(...timeline.map(d => d.trade_count), 1)

    // Draw line
    ctx.strokeStyle = '#bc0000'
    ctx.lineWidth = 2
    ctx.beginPath()

    timeline.forEach((d, i) => {
      const x = padding.left + (i / (timeline.length - 1 || 1)) * chartW
      const y = padding.top + chartH - (d.trade_count / maxCount) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw dots
    timeline.forEach((d, i) => {
      const x = padding.left + (i / (timeline.length - 1 || 1)) * chartW
      const y = padding.top + chartH - (d.trade_count / maxCount) * chartH
      ctx.fillStyle = '#bc0000'
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // X-axis labels
    ctx.fillStyle = subText
    ctx.font = '8px system-ui'
    ctx.textAlign = 'center'
    if (timeline.length > 0) {
      ctx.fillText(timeline[0].date.slice(5), padding.left, height - 4)
      ctx.fillText(timeline[timeline.length - 1].date.slice(5), width - padding.right, height - 4)
    }
  }, [data, isDark, subText])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 40,
            height: 40,
            border: `3px solid ${borderColor}`,
            borderTopColor: '#bc0000',
            borderRadius: '50%',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: subText }}>Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        color: '#ef4444',
        backgroundColor: '#ef444420',
        borderRadius: 12,
      }}>
        {error}
      </div>
    )
  }

  if (!data || data.total_trades === 0) {
    return (
      <div style={{
        padding: 60,
        textAlign: 'center',
        backgroundColor: cardBg,
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
      }}>
        <div style={{ fontSize: '48px', marginBottom: 16 }}>📊</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
          No Trade Data Yet
        </h3>
        <p style={{ fontSize: '14px', color: subText }}>
          Start making trades to see your analytics!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Trades', value: data.total_trades, color: textColor },
          { label: 'Accepted', value: data.accepted_trades, color: '#22c55e' },
          { label: 'Rejected', value: data.rejected_trades, color: '#ef4444' },
          { label: 'Dangerous', value: data.dangerous_trades, color: '#eab308' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 900, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: subText, fontWeight: 600, textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Average Grade', value: data.average_grade },
          { label: 'Highest Grade', value: data.highest_grade },
          { label: 'Lowest Grade', value: data.lowest_grade },
          { label: 'GM Score', value: data.total_gm_score },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '24px',
              fontWeight: 800,
              color: stat.label === 'GM Score' ? '#bc0000' : (stat.value >= 70 ? '#22c55e' : stat.value >= 50 ? '#eab308' : '#ef4444'),
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: subText, fontWeight: 600, textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Grade Distribution
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <canvas ref={distributionCanvasRef} style={{ width: 300, height: 150 }} />
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Trade Activity (Last 30 Days)
          </h3>
          {data.activity_timeline.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <canvas ref={timelineCanvasRef} style={{ width: 300, height: 120 }} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: subText, fontSize: '13px' }}>
              No recent activity
            </div>
          )}
        </motion.div>
      </div>

      {/* Trading Partners & Chicago Teams */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Trading Partners */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Top Trading Partners
          </h3>
          {data.trading_partners.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.trading_partners.slice(0, 5).map((partner, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>{partner.team_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '11px', color: subText }}>{partner.trade_count} trades</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: partner.avg_grade >= 70 ? '#22c55e' : partner.avg_grade >= 50 ? '#eab308' : '#ef4444',
                    }}>
                      {partner.avg_grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: subText, fontSize: '13px' }}>
              No trading partners yet
            </div>
          )}
        </motion.div>

        {/* Chicago Teams */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Your Chicago Teams
          </h3>
          {data.chicago_teams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.chicago_teams.map((team, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: textColor, textTransform: 'capitalize' }}>
                    {team.team}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '11px', color: subText }}>{team.trade_count} trades</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: '#22c55e20',
                      color: '#22c55e',
                      fontWeight: 600,
                    }}>
                      {team.accepted_rate}% accepted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: subText, fontSize: '13px' }}>
              No team data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Position Analysis */}
      {data.position_analysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Position Analysis
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.position_analysis.slice(0, 10).map((pos, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  border: `1px solid ${borderColor}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                  {pos.position}
                </div>
                <div style={{ fontSize: '10px', color: subText }}>
                  Sent: {pos.sent_count} | Recv: {pos.received_count}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: pos.net_value > 0 ? '#22c55e' : pos.net_value < 0 ? '#ef4444' : subText,
                }}>
                  {pos.net_value > 0 ? '+' : ''}{pos.net_value} net
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
```


## src/components/gm/AssetRow.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { AssetType, DraftPick, MLBProspect, GMPlayerData, formatDraftPick, formatProspect, formatSalary, ASSET_ACCENT_COLORS } from '@/types/gm'
import type { PlayerData } from './PlayerCard'

// Icons as inline SVGs
const PlayerIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="none">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

const DraftPickIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="18" rx="2" />
    <line x1="9" y1="9" x2="15" y2="9" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="12" y2="17" />
  </svg>
)

const ProspectIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
  </svg>
)

interface AssetRowProps {
  type: AssetType
  player?: PlayerData | GMPlayerData
  pick?: DraftPick
  prospect?: MLBProspect
  teamColor: string
  teamAbbrev?: string
  onRemove?: () => void
  showTooltip?: boolean
  compact?: boolean    // Smaller row for 3-team view
  showOnly?: boolean   // Hide remove button, display only
}

export function AssetRow({
  type,
  player,
  pick,
  prospect,
  teamColor,
  teamAbbrev,
  onRemove,
  showTooltip = true,
  compact = false,
  showOnly = false,
}: AssetRowProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hovered, setHovered] = useState(false)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  // Compact sizing
  const padding = compact ? '6px 8px' : '10px 12px'
  const iconSize = compact ? 24 : 32
  const primaryFontSize = compact ? 11 : 13
  const secondaryFontSize = compact ? 10 : 11
  const minHeight = compact ? 36 : 48

  // Determine accent color
  const accentColor = type === 'PLAYER'
    ? teamColor
    : type === 'DRAFT_PICK'
      ? '#8b5cf6'
      : '#22c55e'

  // Build display content based on type
  let primaryText = ''
  let secondaryText = ''
  let rightText = ''
  let rightBadge = ''
  let tooltipText = ''
  let avatarUrl: string | null = null
  let avatarInitials = ''

  if (type === 'PLAYER' && player) {
    primaryText = player.full_name
    const ageStr = player.age ? `Age: ${player.age}` : ''
    const contractStr = player.cap_hit ? `Contract: $${(player.cap_hit / 1000000).toFixed(1)}M` : ''
    secondaryText = player.position + (ageStr ? ` - ${ageStr}` : '') + (contractStr ? ` ${contractStr}` : '')
    rightText = ''  // Contract now shown in secondaryText
    avatarUrl = player.headshot_url
    avatarInitials = player.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
    tooltipText = player.stat_line || ''
  } else if (type === 'DRAFT_PICK' && pick) {
    const pickNum = pick.pickNumber ? ` Pick ${pick.pickNumber}` : ''
    primaryText = `${pick.year} Round ${pick.round}${pickNum}`
    secondaryText = pick.originalTeam && pick.originalTeam !== 'Own'
      ? `Original: ${pick.originalTeam}`
      : pick.condition || ''
    rightBadge = 'Pick'
    tooltipText = 'Draft pick value varies by position'
  } else if (type === 'PROSPECT' && prospect) {
    const rank = prospect.org_rank || prospect.team_rank || prospect.rank || 0
    const level = prospect.current_level || prospect.level || ''
    const rankPrefix = rank ? `#${rank} ` : ''
    primaryText = `${rankPrefix}${prospect.name}`
    secondaryText = level ? `${level} - ${prospect.position}` : prospect.position
    if (prospect.age) secondaryText += ` - Age ${prospect.age}`
    rightBadge = prospect.prospect_grade || 'Prospect'
    if (prospect.trade_value) {
      rightText = `TV: ${prospect.trade_value}`
    } else if (prospect.eta) {
      rightText = `ETA ${prospect.eta}`
    }
    avatarInitials = prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    avatarUrl = prospect.headshot_url || null
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: type === 'PLAYER' ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: type === 'PLAYER' ? -10 : 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 6 : 10,
        padding,
        borderRadius: compact ? 6 : 10,
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${accentColor}`,
        minHeight,
      }}
    >
      {/* Left: Icon or Avatar */}
      <div style={{
        width: iconSize,
        height: iconSize,
        borderRadius: type === 'PLAYER' ? '50%' : compact ? 4 : 6,
        backgroundColor: avatarUrl ? 'transparent' : `${accentColor}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : type === 'PLAYER' ? (
          avatarInitials ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>{avatarInitials}</span>
          ) : (
            <PlayerIcon color={accentColor} />
          )
        ) : type === 'DRAFT_PICK' ? (
          <DraftPickIcon color={accentColor} />
        ) : (
          avatarInitials ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>{avatarInitials}</span>
          ) : (
            <ProspectIcon color={accentColor} />
          )
        )}
      </div>

      {/* Middle: Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: primaryFontSize,
          fontWeight: 600,
          color: textColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {primaryText}
        </div>
        {secondaryText && !compact && (
          <div style={{
            fontSize: secondaryFontSize,
            color: subText,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {secondaryText}
          </div>
        )}
      </div>

      {/* Right: Stat/Badge + Remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 4 : 8, flexShrink: 0 }}>
        {rightText && !compact && (
          <span style={{ fontSize: 11, color: subText, fontWeight: 500 }}>
            {rightText}
          </span>
        )}
        {rightBadge && !compact && (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: `${accentColor}20`,
            color: accentColor,
          }}>
            {rightBadge}
          </span>
        )}
        {!showOnly && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              fontSize: compact ? 14 : 16,
              fontWeight: 700,
              padding: compact ? 2 : 4,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &times;
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && tooltipText && hovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          padding: '6px 10px',
          borderRadius: 6,
          backgroundColor: isDark ? '#374151' : '#1f2937',
          color: '#fff',
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {tooltipText}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '6px solid transparent',
            borderTopColor: isDark ? '#374151' : '#1f2937',
          }} />
        </div>
      )}
    </motion.div>
  )
}
```


## src/components/gm/AuditButton.tsx

```tsx
'use client'
import { useState } from 'react'
import type { AuditResult } from '@/types/gm-audit'

interface AuditButtonProps {
  tradeId: string
  onAuditComplete: (audit: AuditResult) => void
  isDark?: boolean
}

export function AuditButton({ tradeId, onAuditComplete, isDark = true }: AuditButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAudit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gm/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_id: tradeId })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Audit failed')
      }

      const audit = await response.json()
      onAuditComplete(audit)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to audit trade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleAudit}
        disabled={loading}
        style={{
          flex: 1,
          padding: '10px 12px',
          borderRadius: 8,
          border: `2px solid ${isDark ? '#3b82f6' : '#2563eb'}`,
          backgroundColor: loading ? (isDark ? '#1e3a5f' : '#dbeafe') : 'transparent',
          color: isDark ? '#3b82f6' : '#2563eb',
          fontWeight: 600,
          fontSize: 13,
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          opacity: loading ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
        title={error || undefined}
      >
        {loading ? (
          <>
            <svg
              style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            ...
          </>
        ) : (
          <>
            <svg
              style={{ width: 14, height: 14 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Audit
          </>
        )}
      </button>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
```


## src/components/gm/AuditReportCard.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import type { AuditResult, Discrepancy } from '@/types/gm-audit'

interface AuditReportCardProps {
  audit: AuditResult
  gmGrade: number
  isDark?: boolean
}

const gradeColors: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  F: '#ef4444',
}

const gradeBgColors: Record<string, string> = {
  A: '#22c55e20',
  B: '#3b82f620',
  C: '#eab30820',
  D: '#f9731620',
  F: '#ef444420',
}

const severityColors: Record<string, string> = {
  minor: '#eab308',
  moderate: '#f97316',
  major: '#ef4444',
}

export function AuditReportCard({ audit, gmGrade, isDark = true }: AuditReportCardProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? '#111827' : '#f9fafb'
  const innerBg = isDark ? '#1f2937' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: textColor, margin: 0 }}>
          Audit Report
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            backgroundColor: gradeBgColors[audit.audit_grade],
            color: gradeColors[audit.audit_grade],
            fontWeight: 800,
            fontSize: '14px',
            padding: '4px 12px',
            borderRadius: 8,
          }}>
            {audit.audit_grade}
          </span>
          <span style={{ color: subText, fontSize: '13px' }}>
            Score: {audit.audit_score}/100
          </span>
          <span style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: '12px' }}>
            ({audit.confidence}% confidence)
          </span>
        </div>
      </div>

      {/* Validation Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 16,
      }}>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: textColor }}>
            {audit.validation_summary.fields_validated}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Validated</div>
        </div>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>
            {audit.validation_summary.fields_confirmed}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Confirmed</div>
        </div>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#eab308' }}>
            {audit.validation_summary.fields_conflicting}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Conflicting</div>
        </div>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: subText }}>
            {audit.validation_summary.fields_unverified}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Unverified</div>
        </div>
      </div>

      {/* Overall Assessment */}
      <div style={{
        backgroundColor: innerBg,
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
      }}>
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: textColor, margin: 0 }}>
          {audit.overall_assessment}
        </p>
      </div>

      {/* Discrepancies */}
      {audit.discrepancies && audit.discrepancies.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 700,
            color: subText,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Data Discrepancies
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {audit.discrepancies.map((d: Discrepancy, i: number) => (
              <div
                key={i}
                style={{
                  backgroundColor: innerBg,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: textColor }}>
                    {d.field}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: severityColors[d.severity],
                    textTransform: 'uppercase',
                  }}>
                    {d.severity}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: subText }}>
                  GM: <span style={{ color: '#ef4444' }}>{d.gm_value}</span>
                  {' → '}
                  Actual: <span style={{ color: '#22c55e' }}>{d.actual_value}</span>
                </div>
                <div style={{ fontSize: '10px', color: isDark ? '#4b5563' : '#9ca3af', marginTop: 4 }}>
                  Sources: {d.sources_checked.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {audit.recommendations?.for_user && audit.recommendations.for_user.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 700,
            color: subText,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            What You Should Know
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: 20,
            fontSize: '13px',
            color: textColor,
            lineHeight: 1.6,
          }}>
            {audit.recommendations.for_user.map((r: string, i: number) => (
              <li key={i} style={{ marginBottom: 4 }}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cached indicator */}
      {audit.cached && (
        <div style={{
          marginTop: 12,
          fontSize: '11px',
          color: subText,
          textAlign: 'right',
        }}>
          Loaded from cache
        </div>
      )}
    </motion.div>
  )
}
```


## src/components/gm/DataFreshnessIndicator.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DataFreshness } from '@/types/gm'

interface DataFreshnessIndicatorProps {
  freshness: DataFreshness
  isDark?: boolean
  compact?: boolean
}

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function DataFreshnessIndicator({
  freshness,
  isDark = false,
  compact = false,
}: DataFreshnessIndicatorProps) {
  const [expanded, setExpanded] = useState(false)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  // Determine status color
  const getStatusColor = () => {
    if (freshness.is_stale) return '#ef4444' // Red for stale
    if (freshness.age_hours > 12) return '#eab308' // Yellow for aging
    return '#22c55e' // Green for fresh
  }

  const statusColor = getStatusColor()
  const statusLabel = freshness.is_stale ? 'Stale' : freshness.age_hours > 12 ? 'Aging' : 'Fresh'

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          borderRadius: 6,
          backgroundColor: `${statusColor}15`,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
        title={`Data updated ${formatTimeAgo(freshness.roster_updated_at)}`}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: statusColor,
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 500, color: statusColor }}>
          {statusLabel}
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${freshness.is_stale ? '#ef444430' : borderColor}`,
        backgroundColor: isDark ? '#1f2937' : '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Header - clickable to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          cursor: 'pointer',
          backgroundColor: freshness.is_stale
            ? isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
            : 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: statusColor,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
            Data Status: {statusLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: subText }}>
            {freshness.age_hours < 1 ? 'Updated just now' : `${Math.round(freshness.age_hours)}h old`}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={subText}
            strokeWidth="2"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Warning banner if stale */}
      {freshness.is_stale && freshness.warning && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
            borderTop: `1px solid ${isDark ? '#ef444430' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>
            {freshness.warning}
          </span>
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: 12,
                borderTop: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <DataRow
                label="Roster Data"
                timestamp={freshness.roster_updated_at}
                isDark={isDark}
              />
              <DataRow
                label="Player Stats"
                timestamp={freshness.stats_updated_at}
                isDark={isDark}
              />
              <DataRow
                label="Contract Info"
                timestamp={freshness.contracts_updated_at}
                isDark={isDark}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DataRow({
  label,
  timestamp,
  isDark,
}: {
  label: string
  timestamp: string
  isDark: boolean
}) {
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const timeAgo = formatTimeAgo(timestamp)

  // Determine color based on age
  const date = new Date(timestamp)
  const now = new Date()
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  const ageColor =
    diffHours > 24 ? '#ef4444' : diffHours > 12 ? '#eab308' : '#22c55e'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        borderRadius: 6,
        backgroundColor: isDark ? '#111827' : '#f9fafb',
      }}
    >
      <span style={{ fontSize: 11, color: subText }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: ageColor }}>
        {timeAgo}
      </span>
    </div>
  )
}

export default DataFreshnessIndicator
```


## src/components/gm/DestinationPicker.tsx

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface TeamOption {
  key: string
  name: string
  logo: string | null
  color: string
}

interface DestinationPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (destinationTeamKey: string) => void
  fromTeam: TeamOption
  teams: TeamOption[]
  playerName: string
  assetType?: 'player' | 'pick'
}

export function DestinationPicker({
  open,
  onClose,
  onSelect,
  fromTeam,
  teams,
  playerName,
  assetType = 'player',
}: DestinationPickerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const bgOverlay = 'rgba(0,0,0,0.6)'
  const bgModal = isDark ? '#111827' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  // Filter out the source team - can't send to self
  const destinationTeams = teams.filter(t => t.key !== fromTeam.key)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            backgroundColor: bgOverlay,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: bgModal,
              borderRadius: 16,
              border: `1px solid ${borderColor}`,
              width: '100%',
              maxWidth: 400,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${borderColor}`,
              textAlign: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: textColor, margin: 0 }}>
                Where is {playerName} going?
              </h3>
              <p style={{ fontSize: 12, color: subText, marginTop: 4, marginBottom: 0 }}>
                Select which team receives this {assetType}
              </p>
            </div>

            {/* Source team indicator */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: isDark ? '#1f2937' : '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: `1px solid ${borderColor}`,
            }}>
              <span style={{ fontSize: 11, color: subText, fontWeight: 600, textTransform: 'uppercase' }}>From:</span>
              {fromTeam.logo && (
                <img src={fromTeam.logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              )}
              <span style={{ fontWeight: 600, fontSize: 13, color: fromTeam.color }}>{fromTeam.name}</span>
            </div>

            {/* Destination options */}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: subText, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
                Send to:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {destinationTeams.map(team => (
                  <motion.button
                    key={team.key}
                    whileHover={{ scale: 1.02, backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(team.key)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${borderColor}`,
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {team.logo ? (
                      <img src={team.logo} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: team.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff',
                      }}>
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: team.color }}>
                        {team.name}
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Cancel button */}
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${borderColor}` }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  color: textColor,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```


## src/components/gm/DraftPickList.tsx

```tsx
'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick } from '@/types/gm'

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7,
  nba: 2,
  nhl: 7,
  mlb: 20,
}

interface AvailablePick extends DraftPick {
  id: string // Unique identifier like "2026-1"
}

interface DraftPickListProps {
  sport: string
  selectedPicks: DraftPick[]
  onToggle: (pick: DraftPick) => void
  teamColor: string
  teamName?: string
  isOwn?: boolean // true for Chicago, false for opponent
}

function generateAvailablePicks(sport: string, years: number[]): AvailablePick[] {
  const maxRound = SPORT_ROUNDS[sport] || 7
  const picks: AvailablePick[] = []

  for (const year of years) {
    for (let round = 1; round <= maxRound; round++) {
      picks.push({
        id: `${year}-${round}`,
        year,
        round,
        originalTeam: 'Own',
      })
    }
  }

  return picks
}

function pickMatches(p1: DraftPick, p2: DraftPick): boolean {
  return p1.year === p2.year && p1.round === p2.round
}

export function DraftPickList({
  sport,
  selectedPicks,
  onToggle,
  teamColor,
  teamName,
  isOwn = true,
}: DraftPickListProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [collapsed, setCollapsed] = useState(true)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const checkboxBg = isDark ? '#374151' : '#ffffff'

  // Generate available picks for the next 5 years
  const years = [2026, 2027, 2028, 2029, 2030]
  const availablePicks = useMemo(() => generateAvailablePicks(sport, years), [sport])

  // Group picks by year for display
  const picksByYear = useMemo(() => {
    const grouped: Record<number, AvailablePick[]> = {}
    for (const pick of availablePicks) {
      if (!grouped[pick.year]) grouped[pick.year] = []
      grouped[pick.year].push(pick)
    }
    return grouped
  }, [availablePicks])

  const isSelected = (pick: AvailablePick) => {
    return selectedPicks.some(sp => pickMatches(sp, pick))
  }

  const handleToggle = (pick: AvailablePick) => {
    console.log('[DraftPickList.handleToggle] called with pick:', pick)
    onToggle({ year: pick.year, round: pick.round, originalTeam: pick.originalTeam })
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Collapsible header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="4" y="4" width="16" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: 13, color: textColor }}>
            Draft Picks
          </span>
          {selectedPicks.length > 0 && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              backgroundColor: `${teamColor}20`,
              color: teamColor,
            }}>
              {selectedPicks.length} selected
            </span>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={subText}
          strokeWidth="2"
          style={{
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '12px',
              marginTop: 8,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#111827' : '#ffffff',
              maxHeight: 300,
              overflowY: 'auto',
            }}>
              {/* Picks grouped by year */}
              {years.map(year => (
                <div key={year} style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: subText,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                    letterSpacing: '0.5px',
                  }}>
                    {year}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {picksByYear[year]?.map(pick => {
                      const selected = isSelected(pick)
                      return (
                        <button
                          key={pick.id}
                          onClick={() => handleToggle(pick)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: selected ? `2px solid ${teamColor}` : `1px solid ${borderColor}`,
                            backgroundColor: selected ? `${teamColor}15` : checkboxBg,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: selected ? 'none' : `2px solid ${borderColor}`,
                            backgroundColor: selected ? teamColor : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {selected && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            )}
                          </div>
                          <span style={{
                            fontSize: 12,
                            fontWeight: selected ? 600 : 500,
                            color: selected ? teamColor : textColor,
                          }}>
                            Rd {pick.round}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Helper text */}
              <div style={{
                fontSize: 11,
                color: subText,
                textAlign: 'center',
                paddingTop: 8,
                borderTop: `1px solid ${borderColor}`,
                marginTop: 8,
              }}>
                Click to {isOwn ? 'send' : 'receive'} picks
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```


## src/components/gm/DraftPickSelector.tsx

```tsx
'use client'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface DraftPick {
  year: number
  round: number
  condition?: string
  pickNumber?: number
}

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7, nba: 2, nhl: 7, mlb: 20,
}

// Picks per round by sport (for generating pick number options)
const PICKS_PER_ROUND: Record<string, number> = {
  nfl: 32, nba: 30, nhl: 32, mlb: 30,
}

interface DraftPickSelectorProps {
  sport: string
  picks: DraftPick[]
  onAdd: (pick: DraftPick) => void
  onRemove: (index: number) => void
  label: string
}

export function DraftPickSelector({ sport, picks, onAdd, onRemove, label }: DraftPickSelectorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [year, setYear] = useState(2026)
  const [round, setRound] = useState(1)
  const [condition, setCondition] = useState('')
  const [pickPosition, setPickPosition] = useState<'early' | 'mid' | 'late' | 'specific' | ''>('')
  const [specificPick, setSpecificPick] = useState<number | ''>('')

  const maxRound = SPORT_ROUNDS[sport] || 7
  const picksPerRound = PICKS_PER_ROUND[sport] || 32
  const years = [2026, 2027, 2028, 2029, 2030]
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1)

  // Generate pick numbers for the selected round
  const pickNumbers = Array.from({ length: picksPerRound }, (_, i) => {
    const pickNum = (round - 1) * picksPerRound + i + 1
    return pickNum
  })

  const selectStyle = {
    padding: '6px 8px',
    borderRadius: '6px',
    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
    backgroundColor: isDark ? '#374151' : '#fff',
    color: isDark ? '#fff' : '#000',
    fontSize: '12px',
  }

  const handleAdd = () => {
    let pickNumber: number | undefined

    if (pickPosition === 'specific' && specificPick) {
      pickNumber = specificPick as number
    } else if (pickPosition === 'early') {
      // Early = picks 1-10 in round, use middle value (5)
      pickNumber = (round - 1) * picksPerRound + 5
    } else if (pickPosition === 'mid') {
      // Mid = picks 11-21 in round, use middle value (16)
      pickNumber = (round - 1) * picksPerRound + 16
    } else if (pickPosition === 'late') {
      // Late = picks 22-32 in round, use middle value (27)
      pickNumber = (round - 1) * picksPerRound + 27
    }

    onAdd({
      year,
      round,
      condition: condition.trim() || undefined,
      pickNumber,
    })
    setCondition('')
    setPickPosition('')
    setSpecificPick('')
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={year} onChange={e => setYear(+e.target.value)} style={selectStyle}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={round} onChange={e => { setRound(+e.target.value); setSpecificPick('') }} style={selectStyle}>
          {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
        </select>
        <select
          value={pickPosition}
          onChange={e => { setPickPosition(e.target.value as typeof pickPosition); if (e.target.value !== 'specific') setSpecificPick('') }}
          style={selectStyle}
        >
          <option value="">Pick position</option>
          <option value="early">Early (1-10)</option>
          <option value="mid">Mid (11-21)</option>
          <option value="late">Late (22+)</option>
          <option value="specific">Specific #</option>
        </select>
        {pickPosition === 'specific' && (
          <select
            value={specificPick}
            onChange={e => setSpecificPick(e.target.value ? +e.target.value : '')}
            style={selectStyle}
          >
            <option value="">Pick #</option>
            {pickNumbers.map(num => (
              <option key={num} value={num}>#{num}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={condition}
          onChange={e => setCondition(e.target.value)}
          placeholder="Condition"
          style={{ ...selectStyle, width: 80 }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '6px 12px', borderRadius: 6, border: 'none',
            backgroundColor: '#bc0000', color: '#fff',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>
      {picks.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {picks.map((pk, i) => {
            // Format pick display with pick number if available
            let pickLabel = `${pk.year} R${pk.round}`
            if (pk.pickNumber) {
              pickLabel += ` #${pk.pickNumber}`
            }
            if (pk.condition) {
              pickLabel += ` (${pk.condition})`
            }
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6,
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                fontSize: '11px', color: isDark ? '#fff' : '#1a1a1a',
                fontWeight: 600,
              }}>
                {pickLabel}
                <button
                  onClick={() => onRemove(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700, padding: '0 2px' }}
                >
                  &#x2715;
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```


## src/components/gm/DraftPickValueWidget.tsx

```tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface DraftPickValue {
  pickNumber: number
  round: number
  year: number
  jimmyJohnson: number
  richHill: number
  fitzgeraldSpielberger: number
  harvard: number
  gmSynthesized: number
  positionAdjusted?: number | null
  teamAdjusted?: number | null
  expectedSurplusValue?: number
  hitRate?: number
}

interface DraftPickValueWidgetProps {
  picks: DraftPickValue[]
  side: 'sent' | 'received'
  teamColor: string
}

export function DraftPickValueWidget({ picks, side, teamColor }: DraftPickValueWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!picks || picks.length === 0) return null

  const totalGmValue = picks.reduce((sum, p) => sum + (p.gmSynthesized || 0), 0)

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      marginBottom: 16,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>📊</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Draft Pick Value Analysis ({side === 'sent' ? 'Sending' : 'Receiving'})
        </h4>
      </div>

      {picks.map((pick, idx) => (
        <div key={idx} style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          marginBottom: idx < picks.length - 1 ? 10 : 0,
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            color: teamColor,
            marginBottom: 10,
          }}>
            {pick.year} Round {pick.round} Pick {pick.pickNumber ? `(#${pick.pickNumber})` : ''}
          </div>

          {/* Value Systems Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            marginBottom: 12,
          }}>
            <ValueRow
              label="Jimmy Johnson"
              value={pick.jimmyJohnson}
              tooltip="Classic 1991 NFL draft chart - still widely used"
              isDark={isDark}
            />
            <ValueRow
              label="Rich Hill"
              value={pick.richHill}
              tooltip="Modern 2011 chart based on actual trade data"
              isDark={isDark}
            />
            <ValueRow
              label="Fitzgerald-Spielberger"
              value={pick.fitzgeraldSpielberger}
              tooltip="Data-driven surplus value model"
              isDark={isDark}
            />
            <ValueRow
              label="Harvard/Massey-Thaler"
              value={pick.harvard}
              tooltip="Academic model based on player performance"
              isDark={isDark}
            />
          </div>

          {/* GM Synthesized - Highlighted */}
          <div style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
            border: `2px solid ${isDark ? '#3b82f6' : '#60a5fa'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: isDark ? '#93c5fd' : '#1d4ed8',
            }}>
              GM SYNTHESIZED VALUE
            </span>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              color: isDark ? '#60a5fa' : '#2563eb',
            }}>
              {pick.gmSynthesized?.toLocaleString() || '—'} pts
            </span>
          </div>

          {/* Additional Info */}
          {(pick.expectedSurplusValue || pick.hitRate) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10,
              fontSize: 11,
              color: isDark ? '#94a3b8' : '#64748b',
            }}>
              {pick.expectedSurplusValue && (
                <span>Expected Surplus: ${(pick.expectedSurplusValue / 1_000_000).toFixed(0)}M over 4 years</span>
              )}
              {pick.hitRate && (
                <span>Hit Rate: {(pick.hitRate * 100).toFixed(0)}%</span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Total Value */}
      {picks.length > 1 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}>
            TOTAL DRAFT CAPITAL
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            color: teamColor,
          }}>
            {totalGmValue.toLocaleString()} pts
          </span>
        </div>
      )}
    </div>
  )
}

function ValueRow({
  label,
  value,
  tooltip,
  isDark,
}: {
  label: string
  value: number
  tooltip: string
  isDark: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 4,
        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      }}
      title={tooltip}
    >
      <span style={{
        fontSize: 11,
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: isDark ? '#e2e8f0' : '#334155',
      }}>
        {value?.toLocaleString() || '—'} pts
      </span>
    </div>
  )
}
```


## src/components/gm/ExportModal.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export type ExportFormat = 'json' | 'csv' | 'pdf'

interface ExportModalProps {
  show: boolean
  onClose: () => void
  tradeIds: string[]
  singleTrade?: boolean
}

const FORMAT_OPTIONS: Array<{ value: ExportFormat; label: string; icon: string; description: string }> = [
  { value: 'pdf', label: 'PDF', icon: '📄', description: 'Print-ready document with full details' },
  { value: 'csv', label: 'CSV', icon: '📊', description: 'Spreadsheet format for analysis' },
  { value: 'json', label: 'JSON', icon: '{ }', description: 'Raw data for developers' },
]

export function ExportModal({ show, onClose, tradeIds, singleTrade = false }: ExportModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  async function handleExport() {
    if (tradeIds.length === 0) {
      setError('No trades selected')
      return
    }

    setExporting(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/gm/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_ids: tradeIds, format }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Export failed')
      }

      const data = await res.json()

      switch (format) {
        case 'json':
          downloadFile(
            JSON.stringify(data.data, null, 2),
            `gm-trades-${new Date().toISOString().split('T')[0]}.json`,
            'application/json'
          )
          break

        case 'csv':
          downloadFile(
            data.content,
            data.filename || 'gm-trades.csv',
            'text/csv'
          )
          break

        case 'pdf':
          // Open HTML content in new window for printing
          const printWindow = window.open('', '_blank')
          if (printWindow) {
            printWindow.document.write(data.html_content)
            printWindow.document.close()
            printWindow.onload = () => {
              printWindow.print()
            }
          } else {
            throw new Error('Please allow popups to print the PDF')
          }
          break
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#111827' : '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: '100%',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>
                Export {singleTrade ? 'Trade' : 'Trades'}
              </h2>
              <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
                {tradeIds.length} trade{tradeIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: subText,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Format selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 10 }}>
              Export Format
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FORMAT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `2px solid ${format === opt.value ? '#bc0000' : borderColor}`,
                    backgroundColor: format === opt.value ? '#bc000010' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: format === opt.value ? '#bc0000' : textColor }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '11px', color: subText }}>
                      {opt.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              backgroundColor: '#ef444420',
              color: '#ef4444',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#22c55e20',
                color: '#22c55e',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              Export complete!
            </motion.div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: `2px solid ${borderColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || tradeIds.length === 0}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#bc0000',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
```


## src/components/gm/FuturePickDiscountWidget.tsx

```tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface FuturePickValue {
  pickNumber?: number
  round: number
  year: number
  yearsInFuture: number
  currentYearValue: number
  discountRate: number
  discountedValue: number
  equivalentCurrentPick?: string
}

interface FuturePickDiscountWidgetProps {
  picks: FuturePickValue[]
  teamColor: string
}

const DISCOUNT_EXPLANATIONS = [
  'Time value - immediate help more valuable',
  'Uncertainty - pick position unknown',
  'Coaching changes - new regime may not value',
]

export function FuturePickDiscountWidget({ picks, teamColor }: FuturePickDiscountWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Only show for picks that are actually in the future
  const futurePicks = picks.filter(p => p.yearsInFuture > 0)
  if (futurePicks.length === 0) return null

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>⏳</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Future Pick Discount
        </h4>
      </div>

      {futurePicks.map((pick, idx) => {
        const discountPercent = Math.round((1 - pick.discountRate) * 100)
        const valueDropped = pick.currentYearValue - pick.discountedValue

        return (
          <div key={idx} style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            marginBottom: idx < futurePicks.length - 1 ? 10 : 0,
          }}>
            {/* Pick Info */}
            <div style={{
              fontWeight: 700,
              fontSize: 14,
              color: teamColor,
              marginBottom: 10,
            }}>
              {pick.year} Round {pick.round} Pick ({pick.yearsInFuture} Year{pick.yearsInFuture !== 1 ? 's' : ''} Away)
            </div>

            {/* Value Calculation */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 12,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              }}>
                <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                  If traded today:
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
                  {pick.currentYearValue.toLocaleString()} pts
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: isDark ? '#7f1d1d20' : '#fef2f2',
              }}>
                <span style={{ fontSize: 12, color: isDark ? '#fca5a5' : '#dc2626' }}>
                  Future discount:
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
                  -{discountPercent}%
                </span>
              </div>

              {/* Divider */}
              <div style={{
                borderTop: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                margin: '4px 0',
              }} />

              {/* Discounted Value */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
                border: `2px solid ${isDark ? '#3b82f6' : '#60a5fa'}`,
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                }}>
                  Discounted value:
                </span>
                <span style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: isDark ? '#60a5fa' : '#2563eb',
                }}>
                  {pick.discountedValue.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Equivalent Pick */}
            {pick.equivalentCurrentPick && (
              <div style={{
                padding: 10,
                borderRadius: 6,
                backgroundColor: isDark ? '#14532d20' : '#dcfce720',
                border: `1px solid ${isDark ? '#166534' : '#86efac'}`,
                marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 12,
                  color: isDark ? '#86efac' : '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span>≈</span>
                  <span>Equivalent to: <strong>{pick.equivalentCurrentPick}</strong></span>
                </div>
              </div>
            )}

            {/* Warning/Explanation */}
            <div style={{
              padding: 10,
              borderRadius: 6,
              backgroundColor: isDark ? '#78350f20' : '#fef3c7',
              border: `1px solid ${isDark ? '#92400e' : '#fbbf24'}`,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: isDark ? '#fcd34d' : '#92400e',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span>⚠️</span>
                Future picks discounted due to:
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 11,
                color: isDark ? '#fde68a' : '#78350f',
                lineHeight: 1.6,
              }}>
                {DISCOUNT_EXPLANATIONS.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}

      {/* Discount Rate Reference */}
      <div style={{
        marginTop: 12,
        padding: 10,
        borderRadius: 6,
        backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
        fontSize: 10,
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Discount Rate Reference:</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>Current: 0%</span>
          <span>1 Year: 15%</span>
          <span>2 Years: 28%</span>
          <span>3+ Years: 40%</span>
        </div>
      </div>
    </div>
  )
}
```


## src/components/gm/GradeProgressButton.tsx

```tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GradeProgressButtonProps {
  grading: boolean
  canGrade: boolean
  isBlocked: boolean
  onGrade: () => void
  isDark: boolean
  label?: string
  blockedLabel?: string
}

// Estimated time for grading in ms (AI response typically takes 5-10 seconds)
const ESTIMATED_DURATION = 8000

export function GradeProgressButton({
  grading,
  canGrade,
  isBlocked,
  onGrade,
  isDark,
  label = 'GRADE TRADE',
  blockedLabel = 'FIX ISSUES TO GRADE',
}: GradeProgressButtonProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'validating' | 'analyzing' | 'grading' | 'complete'>('idle')

  const canClick = canGrade && !grading && !isBlocked
  const subText = isDark ? '#9ca3af' : '#6b7280'

  // Progress animation when grading
  useEffect(() => {
    if (!grading) {
      setProgress(0)
      setPhase('idle')
      return
    }

    setPhase('validating')
    let startTime = Date.now()
    let animationFrame: number

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      // Use an easing function that slows down as it approaches 95%
      // This gives the illusion of progress even if the API takes longer
      const rawProgress = elapsed / ESTIMATED_DURATION
      const easedProgress = 1 - Math.pow(1 - Math.min(rawProgress, 1), 3) // Cubic ease-out
      const cappedProgress = Math.min(easedProgress * 95, 95) // Never exceed 95% until complete

      setProgress(cappedProgress)

      // Update phase based on progress
      if (cappedProgress < 15) {
        setPhase('validating')
      } else if (cappedProgress < 60) {
        setPhase('analyzing')
      } else {
        setPhase('grading')
      }

      if (grading && cappedProgress < 95) {
        animationFrame = requestAnimationFrame(updateProgress)
      }
    }

    animationFrame = requestAnimationFrame(updateProgress)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [grading])

  // When grading completes, animate to 100%
  useEffect(() => {
    if (!grading && progress > 0) {
      setProgress(100)
      setPhase('complete')
      // Reset after animation
      const timer = setTimeout(() => {
        setProgress(0)
        setPhase('idle')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [grading, progress])

  const getPhaseText = () => {
    switch (phase) {
      case 'validating':
        return 'Validating trade...'
      case 'analyzing':
        return 'Analyzing player values...'
      case 'grading':
        return 'Generating grade...'
      case 'complete':
        return 'Complete!'
      default:
        return isBlocked ? blockedLabel : label
    }
  }

  const getProgressColor = () => {
    if (progress < 30) return '#eab308' // Yellow - validating
    if (progress < 70) return '#3b82f6' // Blue - analyzing
    return '#22c55e' // Green - grading/complete
  }

  return (
    <button
      onClick={onGrade}
      disabled={!canClick}
      style={{
        width: '100%',
        padding: 0,
        borderRadius: '12px',
        border: 'none',
        backgroundColor: canClick ? '#bc0000' : (isDark ? '#374151' : '#d1d5db'),
        color: canClick ? '#fff' : subText,
        fontWeight: 800,
        fontSize: '16px',
        cursor: canClick ? 'pointer' : 'not-allowed',
        letterSpacing: '0.5px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Progress bar background */}
      <AnimatePresence>
        {grading && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: getProgressColor(),
              transformOrigin: 'left',
              opacity: 0.3,
            }}
          />
        )}
      </AnimatePresence>

      {/* Shimmer effect during grading */}
      <AnimatePresence>
        {grading && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Button content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '14px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: grading ? 8 : 0,
        }}
      >
        <span>{getPhaseText()}</span>

        {/* Progress indicator */}
        <AnimatePresence>
          {grading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {/* Progress bar track */}
              <div
                style={{
                  width: '80%',
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  style={{
                    height: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* Percentage text */}
              <span style={{ fontSize: 11, opacity: 0.8 }}>
                {Math.round(progress)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  )
}

export default GradeProgressButton
```


## src/components/gm/GradeReveal.tsx

```tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { WhatIfPanel } from './WhatIfPanel'
import { ExportModal } from './ExportModal'
import { AuditButton } from './AuditButton'
import { AuditReportCard } from './AuditReportCard'
import { HistoricalContextPanel, SuggestedTradePanel } from './HistoricalContextPanel'
import { DataFreshnessIndicator } from './DataFreshnessIndicator'
import { getGradeInterpretation } from '@/lib/gm-constants'
import type { PlayerData } from '@/components/gm/PlayerCard'
import type { AuditResult } from '@/types/gm-audit'
import type { HistoricalContext, EnhancedSuggestedTrade, LegacySuggestedTrade, LegacyHistoricalTradeRef, DataFreshness } from '@/types/gm'

interface GradeResult {
  grade: number
  reasoning: string
  status: string
  is_dangerous: boolean
  trade_summary?: string
  improvement_score?: number
  shared_code?: string
  breakdown?: {
    talent_balance: number
    contract_value: number
    team_fit: number
    future_assets: number
  }
  cap_analysis?: string
  // New factors object (Feb 2026) - includes motivation score
  factors?: {
    motivation_score?: number  // 0-10 combined motivation score for both sides
    [key: string]: number | string | undefined
  }
  // Historical context - supports both legacy and enhanced formats
  historical_comparisons?: LegacyHistoricalTradeRef[]
  historical_context?: HistoricalContext | null
  // Suggested trade - supports both legacy and enhanced formats
  suggested_trade?: LegacySuggestedTrade | null
  enhanced_suggested_trade?: EnhancedSuggestedTrade | null
  // Data freshness tracking (Feb 2026)
  data_freshness?: DataFreshness | null
}

interface DraftPick {
  year: number
  round: number
  condition?: string
}

interface TradeDetails {
  chicagoTeam: string
  chicagoLogo?: string
  chicagoColor?: string
  opponentName: string
  opponentLogo?: string | null
  opponentColor?: string
  playersSent: PlayerData[]
  playersReceived: Array<PlayerData | { name: string; position: string }>
  draftPicksSent: DraftPick[]
  draftPicksReceived: DraftPick[]
}

interface GradeRevealProps {
  result: GradeResult | null
  show: boolean
  onClose: () => void
  onNewTrade: () => void
  tradeDetails?: TradeDetails
  sport?: string
}

function formatMoney(value: number | null | undefined): string {
  if (!value) return ''
  return `$${(value / 1_000_000).toFixed(1)}M`
}

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['#bc0000', '#22c55e', '#eab308', '#3b82f6', '#a855f7']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const x = Math.random() * 100
  const size = 4 + Math.random() * 6

  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x: `${x}vw`, rotate: 0 }}
      animate={{ opacity: 0, y: '100vh', rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeIn' }}
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 100,
        width: size, height: size * 1.5,
        backgroundColor: color, borderRadius: 1,
      }}
    />
  )
}

export function GradeReveal({ result, show, onClose, onNewTrade, tradeDetails, sport = 'nfl' }: GradeRevealProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [phase, setPhase] = useState(0) // 0=loading, 1=number, 2=status, 3=breakdown, 4=reasoning
  const [displayGrade, setDisplayGrade] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showWhatIf, setShowWhatIf] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)

  useEffect(() => {
    if (!show || !result) {
      setPhase(0)
      setDisplayGrade(0)
      setShowConfetti(false)
      setAuditResult(null)
      return
    }

    // Phase 0: Loading text (already showing)
    const t1 = setTimeout(() => {
      // Phase 1: Start counting
      setPhase(1)
      let current = 0
      const target = result.grade
      const step = Math.max(1, Math.ceil(target / 40))
      const interval = setInterval(() => {
        current = Math.min(current + step, target)
        setDisplayGrade(current)
        if (current >= target) {
          clearInterval(interval)
          // Phase 2: Show status
          setTimeout(() => setPhase(2), 300)
          // Phase 3: Show breakdown
          setTimeout(() => setPhase(3), 800)
          // Phase 4: Show reasoning
          setTimeout(() => setPhase(4), 1400)
          // Confetti for high grades
          if (target >= 85) {
            setTimeout(() => setShowConfetti(true), 500)
          }
        }
      }, 35)
      return () => clearInterval(interval)
    }, 1200)

    return () => clearTimeout(t1)
  }, [show, result])

  if (!show || !result) return null

  const gradeInfo = getGradeInterpretation(result.grade)
  const gradeColor = gradeInfo.color
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  const breakdownItems = result.breakdown ? [
    { label: 'Talent Balance', value: result.breakdown.talent_balance },
    { label: 'Contract Value', value: result.breakdown.contract_value },
    { label: 'Team Fit', value: result.breakdown.team_fit },
    { label: 'Future Assets', value: result.breakdown.future_assets },
  ] : []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={phase >= 4 ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: 20,
          paddingTop: 40,
          paddingBottom: 40,
          overflowY: 'auto',
        }}
      >
        {/* Confetti */}
        {showConfetti && Array.from({ length: 40 }).map((_, i) => (
          <ConfettiParticle key={i} delay={i * 0.04} />
        ))}

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#111827' : '#fff',
            borderRadius: 20,
            padding: 32,
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          {/* Loading phase */}
          {phase === 0 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ fontSize: '18px', fontWeight: 700, color: subText, padding: '40px 0' }}
            >
              ANALYZING TRADE...
            </motion.div>
          )}

          {/* Grade number */}
          {phase >= 1 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: '80px', fontWeight: 900, color: gradeColor, lineHeight: 1 }}
            >
              {displayGrade}
            </motion.div>
          )}

          {/* Status badge */}
          {phase >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}
            >
              <span style={{
                padding: '6px 20px', borderRadius: 20,
                fontWeight: 800, fontSize: '14px', letterSpacing: '1px',
                backgroundColor: result.status === 'accepted' ? '#22c55e20' : '#ef444420',
                color: result.status === 'accepted' ? '#22c55e' : '#ef4444',
              }}>
                {result.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
              </span>
              {result.is_dangerous && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1, 0.3, 1] }}
                  transition={{ duration: 1 }}
                  style={{
                    padding: '6px 16px', borderRadius: 20,
                    fontWeight: 800, fontSize: '14px',
                    backgroundColor: '#eab30820', color: '#eab308',
                  }}
                >
                  DANGEROUS
                </motion.span>
              )}
            </motion.div>
          )}

          {/* Grade interpretation message */}
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 8, fontSize: '14px', fontWeight: 600, color: gradeColor }}
            >
              {gradeInfo.message}
            </motion.div>
          )}

          {/* Trade summary */}
          {phase >= 2 && result.trade_summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 12, fontSize: '13px', color: subText, fontStyle: 'italic' }}
            >
              {result.trade_summary}
            </motion.div>
          )}

          {/* Improvement score */}
          {phase >= 2 && typeof result.improvement_score === 'number' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 8, fontSize: '13px', fontWeight: 700,
                color: result.improvement_score > 0 ? '#22c55e' : result.improvement_score < 0 ? '#ef4444' : subText,
              }}
            >
              Team Improvement: {result.improvement_score > 0 ? '+' : ''}{result.improvement_score}
            </motion.div>
          )}

          {/* Motivation score (if present from enhanced grading) */}
          {phase >= 2 && result.factors?.motivation_score !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 6, fontSize: '12px', fontWeight: 600,
                color: result.factors.motivation_score >= 7 ? '#22c55e' : result.factors.motivation_score >= 4 ? '#eab308' : '#ef4444',
              }}
            >
              Trade Realism: {result.factors.motivation_score.toFixed(1)}/10
              {result.factors.motivation_score >= 7 && ' (Highly realistic)'}
              {result.factors.motivation_score >= 4 && result.factors.motivation_score < 7 && ' (Plausible)'}
              {result.factors.motivation_score < 4 && ' (Partner unlikely to accept)'}
            </motion.div>
          )}

          {/* Data freshness indicator */}
          {phase >= 2 && result.data_freshness && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 12 }}
            >
              <DataFreshnessIndicator freshness={result.data_freshness} isDark={isDark} compact />
            </motion.div>
          )}

          {/* Trade Details */}
          {phase >= 3 && tradeDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: 12,
                textAlign: 'left',
              }}
            >
              {/* Players Sent */}
              <div style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }}>
                  {tradeDetails.chicagoLogo && (
                    <img
                      src={tradeDetails.chicagoLogo}
                      alt=""
                      style={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                  )}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: tradeDetails.chicagoColor || textColor, textTransform: 'uppercase' }}>
                    {tradeDetails.chicagoTeam} Sends
                  </span>
                </div>
                {tradeDetails.playersSent.map((player, idx) => (
                  <div key={`sent-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {player.headshot_url ? (
                      <img
                        src={player.headshot_url}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div style={{
                        width: 32, height: 32, borderRadius: 16,
                        backgroundColor: tradeDetails.chicagoColor || '#666',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, color: '#fff',
                      }}>
                        {player.full_name.charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.full_name}
                      </div>
                      <div style={{ fontSize: '10px', color: subText }}>
                        {player.position} {player.age ? `· Age: ${player.age}` : ''}
                      </div>
                      {(player.cap_hit || player.contract_years || player.contract_signed_year) && (
                        <div style={{ fontSize: '9px', color: subText }}>
                          {formatMoney(player.cap_hit)}
                          {player.contract_years ? ` · ${player.contract_years}yr` : ''}
                          {player.contract_signed_year ? ` · Signed ${player.contract_signed_year}` : ''}
                          {player.is_rookie_deal ? ' (Rookie)' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tradeDetails.draftPicksSent.map((pick, idx) => (
                  <div key={`pick-sent-${idx}`} style={{ fontSize: '11px', color: subText, marginBottom: 4, paddingLeft: 4 }}>
                    📄 {pick.year} Round {pick.round}{pick.condition ? ` (${pick.condition})` : ''}
                  </div>
                ))}
              </div>

              {/* Swap Icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', color: subText }}>⇄</span>
              </div>

              {/* Players Received */}
              <div style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }}>
                  {tradeDetails.opponentLogo && (
                    <img
                      src={tradeDetails.opponentLogo}
                      alt=""
                      style={{ width: 20, height: 20, objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: tradeDetails.opponentColor || textColor, textTransform: 'uppercase' }}>
                    {tradeDetails.opponentName} Sends
                  </span>
                </div>
                {tradeDetails.playersReceived.map((player, idx) => {
                  const isFullPlayer = 'player_id' in player
                  const playerData = player as PlayerData
                  return (
                    <div key={`recv-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {isFullPlayer && playerData.headshot_url ? (
                        <img
                          src={playerData.headshot_url}
                          alt=""
                          style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: 16,
                          backgroundColor: tradeDetails.opponentColor || '#666',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, color: '#fff',
                        }}>
                          {(isFullPlayer ? playerData.full_name : player.name).charAt(0)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isFullPlayer ? playerData.full_name : player.name}
                        </div>
                        <div style={{ fontSize: '10px', color: subText }}>
                          {player.position} {isFullPlayer && playerData.age ? `· Age: ${playerData.age}` : ''}
                        </div>
                        {isFullPlayer && (playerData.cap_hit || playerData.contract_years || playerData.contract_signed_year) && (
                          <div style={{ fontSize: '9px', color: subText }}>
                            {formatMoney(playerData.cap_hit)}
                            {playerData.contract_years ? ` · ${playerData.contract_years}yr` : ''}
                            {playerData.contract_signed_year ? ` · Signed ${playerData.contract_signed_year}` : ''}
                            {playerData.is_rookie_deal ? ' (Rookie)' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {tradeDetails.draftPicksReceived.map((pick, idx) => (
                  <div key={`pick-recv-${idx}`} style={{ fontSize: '11px', color: subText, marginBottom: 4, paddingLeft: 4 }}>
                    📄 {pick.year} Round {pick.round}{pick.condition ? ` (${pick.condition})` : ''}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Breakdown bars */}
          {phase >= 3 && breakdownItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 20, textAlign: 'left' }}
            >
              {breakdownItems.map((item, i) => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: subText, marginBottom: 3 }}>
                    <span>{item.label}</span>
                    <span>{Math.round(item.value * 100)}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      style={{ height: '100%', borderRadius: 3, backgroundColor: gradeColor }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Cap Analysis */}
          {phase >= 3 && result.cap_analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 16, padding: 12, borderRadius: 10,
                backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
                border: `1px solid ${isDark ? '#334155' : '#bbf7d0'}`,
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>$</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cap Impact
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.5, color: isDark ? '#e2e8f0' : '#334155' }}>
                  {result.cap_analysis}
                </div>
              </div>
            </motion.div>
          )}

          {/* Reasoning */}
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20, padding: 16, borderRadius: 12,
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                fontSize: '13px', lineHeight: 1.6, color: textColor,
                textAlign: 'left',
              }}
            >
              {result.reasoning}
            </motion.div>
          )}

          {/* Historical Context - supports both enhanced and legacy formats */}
          {phase >= 4 && (result.historical_context || (result.historical_comparisons && result.historical_comparisons.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ marginTop: 16 }}
            >
              <HistoricalContextPanel
                historicalContext={result.historical_context}
                historicalComparisons={result.historical_comparisons}
                isDark={isDark}
                isRejected={result.status === 'rejected' || result.grade < 70}
              />
            </motion.div>
          )}

          {/* Suggested Trade Improvements - supports both enhanced and legacy formats (for rejected trades) */}
          {phase >= 4 && result.grade < 70 && (result.enhanced_suggested_trade || result.suggested_trade) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: 16 }}
            >
              <SuggestedTradePanel
                enhancedSuggestion={result.enhanced_suggested_trade}
                legacySuggestion={result.suggested_trade}
                isDark={isDark}
                chicagoTeam={tradeDetails?.chicagoTeam}
                opponentTeam={tradeDetails?.opponentName}
              />
            </motion.div>
          )}

          {/* Audit Report */}
          {phase >= 4 && auditResult && (
            <AuditReportCard
              audit={auditResult}
              gmGrade={result.grade}
              isDark={isDark}
            />
          )}

          {/* Action buttons */}
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <button
                onClick={onNewTrade}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  backgroundColor: '#bc0000', color: '#fff',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}
              >
                New Trade
              </button>
              <button
                onClick={() => setShowWhatIf(!showWhatIf)}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  border: `2px solid ${showWhatIf ? '#3b82f6' : (isDark ? '#374151' : '#d1d5db')}`,
                  backgroundColor: showWhatIf ? '#3b82f615' : 'transparent',
                  color: showWhatIf ? '#3b82f6' : textColor,
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                {showWhatIf ? 'Hide What-If' : 'What If?'}
              </button>
              <button
                onClick={() => setShowExport(true)}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  border: `2px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  backgroundColor: 'transparent', color: textColor,
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Export
              </button>
              {result.shared_code && !auditResult && (
                <AuditButton
                  tradeId={result.shared_code}
                  onAuditComplete={setAuditResult}
                  isDark={isDark}
                />
              )}
              {result.shared_code && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/gm/share/${result.shared_code}`)
                  }}
                  style={{
                    padding: '10px 24px', borderRadius: 10,
                    border: `2px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    backgroundColor: 'transparent', color: textColor,
                    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Share Trade
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  border: `2px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  backgroundColor: 'transparent', color: textColor,
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Close
              </button>
            </motion.div>
          )}

          {/* What-If Panel */}
          {phase >= 4 && tradeDetails && (
            <WhatIfPanel
              tradeId={result.shared_code || 'temp-trade'}
              originalGrade={result.grade}
              playersSent={tradeDetails.playersSent.map(p => ({ name: p.full_name, position: p.position }))}
              playersReceived={tradeDetails.playersReceived.map(p => ('full_name' in p ? { name: p.full_name, position: p.position } : { name: p.name, position: p.position }))}
              sport={sport}
              show={showWhatIf}
              onClose={() => setShowWhatIf(false)}
            />
          )}
        </motion.div>

        {/* Export Modal */}
        <ExportModal
          show={showExport}
          onClose={() => setShowExport(false)}
          tradeIds={result.shared_code ? [result.shared_code] : []}
          singleTrade
        />
      </motion.div>
    </AnimatePresence>
  )
}
```


## src/components/gm/HistoricalContextPanel.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import type {
  HistoricalContext,
  SimilarTrade,
  LegacyHistoricalTradeRef,
  EnhancedSuggestedTrade,
  LegacySuggestedTrade,
  HistoricalPrecedent,
  isEnhancedHistoricalContext,
  isEnhancedSuggestedTrade,
} from '@/types/gm'

// =====================
// Similar Trades Display
// =====================

interface SimilarTradeCardProps {
  trade: SimilarTrade
  isDark: boolean
  index: number
}

function SimilarTradeCard({ trade, isDark, index }: SimilarTradeCardProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const outcomeColors = {
    worked: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: 'Worked' },
    failed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Failed' },
    neutral: { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', label: 'Mixed Results' },
  }

  const outcome = outcomeColors[trade.outcome] || outcomeColors.neutral

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        padding: 14,
        borderRadius: 10,
        backgroundColor: isDark ? '#1f2937' : '#fff',
        border: `1px solid ${borderColor}`,
        marginBottom: 10,
      }}
    >
      {/* Header row with similarity score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textColor, lineHeight: 1.4 }}>
            {trade.description}
          </div>
          <div style={{ fontSize: 11, color: subText, marginTop: 4 }}>
            {trade.date} {trade.teams.length > 0 && `• ${trade.teams.join(' & ')}`}
          </div>
        </div>
        {trade.similarity_score > 0 && (
          <div style={{
            padding: '4px 10px',
            borderRadius: 6,
            backgroundColor: isDark ? '#374151' : '#f3f4f6',
            fontSize: 11,
            fontWeight: 600,
            color: subText,
            marginLeft: 10,
            whiteSpace: 'nowrap',
          }}>
            {trade.similarity_score}% match
          </div>
        )}
      </div>

      {/* Outcome badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 6,
          backgroundColor: outcome.bg,
          fontSize: 11,
          fontWeight: 600,
          color: outcome.text,
        }}>
          {trade.outcome === 'worked' ? '✓' : trade.outcome === 'failed' ? '✗' : '~'}
          {outcome.label}
        </span>
        {trade.grade_given && (
          <span style={{ fontSize: 11, color: subText }}>
            Grade: {trade.grade_given}
          </span>
        )}
      </div>

      {/* Key difference */}
      {trade.key_difference && (
        <div style={{
          marginTop: 10,
          padding: '8px 10px',
          borderRadius: 6,
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          fontSize: 11,
          color: isDark ? '#93c5fd' : '#3b82f6',
          lineHeight: 1.4,
        }}>
          <strong>Key difference:</strong> {trade.key_difference}
        </div>
      )}
    </motion.div>
  )
}

// =====================
// Legacy Format Display (backwards compatible)
// =====================

interface LegacyHistoricalDisplayProps {
  comparisons: LegacyHistoricalTradeRef[]
  isDark: boolean
}

function LegacyHistoricalDisplay({ comparisons, isDark }: LegacyHistoricalDisplayProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  if (!comparisons || comparisons.length === 0) return null

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
      border: `1px solid ${borderColor}`,
    }}>
      <h4 style={{
        fontSize: 12,
        fontWeight: 700,
        color: subText,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Similar Historical Trades
      </h4>
      {comparisons.map((comp, i) => (
        <div key={i} style={{
          marginBottom: i < comparisons.length - 1 ? 12 : 0,
          paddingBottom: i < comparisons.length - 1 ? 12 : 0,
          borderBottom: i < comparisons.length - 1 ? `1px solid ${borderColor}` : 'none',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>
            {comp.trade} <span style={{ color: subText, fontWeight: 400 }}>({comp.year})</span>
          </div>
          <div style={{ fontSize: 12, color: subText, marginTop: 2 }}>
            Haul: {comp.haul}
          </div>
          <div style={{ fontSize: 12, color: '#22c55e', marginTop: 2 }}>
            {comp.outcome}
          </div>
        </div>
      ))}
    </div>
  )
}

// =====================
// Enhanced Historical Context Panel
// =====================

interface EnhancedHistoricalContextPanelProps {
  context: HistoricalContext
  isDark: boolean
  isRejected?: boolean
}

function EnhancedHistoricalContextPanel({ context, isDark, isRejected = false }: EnhancedHistoricalContextPanelProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const successColor = context.success_rate >= 60 ? '#22c55e' : context.success_rate >= 40 ? '#eab308' : '#ef4444'

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
      border: `1px solid ${borderColor}`,
    }}>
      {/* Header with success rate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{
          fontSize: 12,
          fontWeight: 700,
          color: subText,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>📊</span>
          Historical Analysis
        </h4>
        {context.success_rate !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: isDark ? '#111827' : '#fff',
            border: `1px solid ${borderColor}`,
          }}>
            <span style={{ fontSize: 11, color: subText }}>Success Rate:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: successColor }}>
              {context.success_rate}%
            </span>
          </div>
        )}
      </div>

      {/* Key Patterns */}
      {context.key_patterns && context.key_patterns.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            Key Patterns from History
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
            {context.key_patterns.map((pattern, i) => (
              <li key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4, lineHeight: 1.5 }}>
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Why This Fails Historically (for rejected trades) */}
      {isRejected && context.why_this_fails_historically && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#ef4444',
            marginBottom: 6,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>⚠️</span>
            Why This Fails Historically
          </div>
          <div style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
            {context.why_this_fails_historically}
          </div>
        </div>
      )}

      {/* What Works Instead (for rejected trades) */}
      {isRejected && context.what_works_instead && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#22c55e',
            marginBottom: 6,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>✓</span>
            What Works Instead
          </div>
          <div style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
            {context.what_works_instead}
          </div>
        </div>
      )}

      {/* Similar Trades */}
      {context.similar_trades && context.similar_trades.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: subText, marginBottom: 10, textTransform: 'uppercase' }}>
            Similar Historical Trades
          </div>
          {context.similar_trades.map((trade, i) => (
            <SimilarTradeCard key={trade.trade_id || i} trade={trade} isDark={isDark} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// =====================
// Enhanced Suggested Trade Panel
// =====================

interface EnhancedSuggestedTradePanelProps {
  suggestion: EnhancedSuggestedTrade
  isDark: boolean
  chicagoTeam?: string
  opponentTeam?: string
}

function EnhancedSuggestedTradePanel({
  suggestion,
  isDark,
  chicagoTeam = 'Chicago',
  opponentTeam = 'Partner',
}: EnhancedSuggestedTradePanelProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const formatTradeItem = (item: { type: string; name?: string; year?: number; round?: number; amount?: number; position?: string }) => {
    if (item.type === 'player') return `${item.name}${item.position ? ` (${item.position})` : ''}`
    if (item.type === 'pick') return `${item.year} Round ${item.round} Pick`
    if (item.type === 'prospect') return `${item.name} (Prospect)`
    if (item.type === 'cash') return `$${((item.amount || 0) / 1000000).toFixed(1)}M Cash`
    return item.name || 'Unknown'
  }

  const likelihoodColors: Record<string, { bg: string; text: string }> = {
    'very likely': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    'likely': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
    'possible': { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308' },
    'unlikely': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    'very unlikely': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  }

  const likelihood = likelihoodColors[suggestion.likelihood?.toLowerCase()] || likelihoodColors['possible']

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      border: '1px solid #3b82f6',
    }}>
      <h4 style={{
        fontWeight: 700,
        color: '#3b82f6',
        fontSize: 14,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        Suggested Trade Improvement
      </h4>

      {/* Description */}
      <p style={{ fontSize: 13, color: textColor, marginBottom: 16, lineHeight: 1.5 }}>
        {suggestion.description}
      </p>

      {/* Trade Structure */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#1f2937' : '#fff',
        border: `1px solid ${borderColor}`,
      }}>
        {/* Chicago Sends */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            {chicagoTeam} Sends
          </div>
          {suggestion.chicago_sends.map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              • {formatTradeItem(item)}
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, color: subText }}>⇄</span>
        </div>

        {/* Chicago Receives */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            {chicagoTeam} Receives
          </div>
          {suggestion.chicago_receives.map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              • {formatTradeItem(item)}
            </div>
          ))}
        </div>
      </div>

      {/* Value Balance */}
      {suggestion.value_balance && (
        <div style={{
          marginBottom: 16,
          padding: 10,
          borderRadius: 8,
          backgroundColor: isDark ? '#111827' : '#f3f4f6',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: subText }}>Value Balance</span>
            <span style={{
              fontWeight: 600,
              color: Math.abs(suggestion.value_balance.difference) < 10 ? '#22c55e' : '#eab308',
            }}>
              {suggestion.value_balance.difference > 0 ? '+' : ''}{suggestion.value_balance.difference} pts
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              flex: suggestion.value_balance.chicago_value,
              backgroundColor: '#3b82f6',
              borderRadius: '4px 0 0 4px',
            }} />
            <div style={{
              flex: suggestion.value_balance.partner_value,
              backgroundColor: '#22c55e',
              borderRadius: '0 4px 4px 0',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
            <span style={{ color: '#3b82f6' }}>{chicagoTeam}: {suggestion.value_balance.chicago_value}</span>
            <span style={{ color: '#22c55e' }}>{opponentTeam}: {suggestion.value_balance.partner_value}</span>
          </div>
        </div>
      )}

      {/* Cap/Salary Notes */}
      {suggestion.cap_salary_notes && (
        <div style={{
          marginBottom: 16,
          padding: 10,
          borderRadius: 8,
          backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
          fontSize: 12,
          color: textColor,
          lineHeight: 1.5,
        }}>
          <span style={{ color: subText, fontWeight: 600 }}>💰 Cap Impact: </span>
          {suggestion.cap_salary_notes}
        </div>
      )}

      {/* Why This Works */}
      <div style={{
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>
          Why This Works
        </div>
        <div style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
          {suggestion.why_this_works}
        </div>
      </div>

      {/* Historical Precedent */}
      {suggestion.historical_precedent && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          backgroundColor: isDark ? '#1f2937' : '#fff',
          border: `1px solid ${borderColor}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            📚 Historical Precedent
          </div>
          {suggestion.historical_precedent.example_trades.map((ex, i) => (
            <div key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              • {ex}
            </div>
          ))}
          <div style={{
            marginTop: 10,
            padding: '8px 10px',
            borderRadius: 6,
            backgroundColor: isDark ? '#111827' : '#f3f4f6',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div>
              <span style={{ color: subText }}>Structure Success Rate: </span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>
                {suggestion.historical_precedent.success_rate_for_structure}%
              </span>
            </div>
          </div>
          {suggestion.historical_precedent.realistic_because && (
            <div style={{ fontSize: 11, color: subText, marginTop: 8, fontStyle: 'italic' }}>
              {suggestion.historical_precedent.realistic_because}
            </div>
          )}
        </div>
      )}

      {/* Likelihood Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          padding: '6px 12px',
          borderRadius: 6,
          backgroundColor: likelihood.bg,
          fontSize: 12,
          fontWeight: 600,
          color: likelihood.text,
        }}>
          Likelihood: {suggestion.likelihood}
        </span>
        {suggestion.estimated_grade_improvement && (
          <span style={{
            fontSize: 13,
            padding: '6px 12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 6,
          }}>
            <span style={{ color: subText }}>Est. improvement: </span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>
              +{suggestion.estimated_grade_improvement} pts
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

// =====================
// Legacy Suggested Trade Panel (backwards compatible)
// =====================

interface LegacySuggestedTradePanelProps {
  suggestion: LegacySuggestedTrade
  isDark: boolean
}

function LegacySuggestedTradePanel({ suggestion, isDark }: LegacySuggestedTradePanelProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  const typeLabels: Record<string, string> = {
    add_picks: 'Add Draft Picks',
    add_players: 'Add Players',
    remove_players: 'Remove Players',
    restructure: 'Restructure Deal',
    three_team: 'Three-Team Trade',
  }

  const typeIcons: Record<string, string> = {
    add_picks: '🎯',
    add_players: '👤',
    remove_players: '➖',
    restructure: '🔄',
    three_team: '🔀',
  }

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      border: '1px solid #3b82f6',
    }}>
      <h4 style={{
        fontWeight: 700,
        color: '#3b82f6',
        fontSize: 14,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{typeIcons[suggestion.type] || '💡'}</span>
        How to Improve This Trade
      </h4>

      <div style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 6,
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        fontSize: 11,
        fontWeight: 600,
        color: subText,
        marginBottom: 12,
      }}>
        {typeLabels[suggestion.type] || suggestion.type}
      </div>

      <p style={{ fontSize: 13, color: textColor, marginBottom: 12, lineHeight: 1.5 }}>
        {suggestion.summary}
      </p>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: subText, marginBottom: 6, fontWeight: 600 }}>Suggestions:</p>
        <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
          {suggestion.specific_suggestions.map((s, i) => (
            <li key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {suggestion.historical_precedent && (
        <p style={{
          fontSize: 11,
          color: subText,
          fontStyle: 'italic',
          marginBottom: 12,
          padding: '8px 10px',
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderRadius: 6,
        }}>
          📚 {suggestion.historical_precedent}
        </p>
      )}

      <div style={{
        fontSize: 13,
        padding: '8px 12px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 6,
        display: 'inline-block',
      }}>
        <span style={{ color: subText }}>Estimated improvement: </span>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>
          +{suggestion.estimated_grade_improvement} points
        </span>
      </div>
    </div>
  )
}

// =====================
// Main Exported Component - Handles Both Formats
// =====================

export interface HistoricalContextPanelProps {
  // New enhanced format
  historicalContext?: HistoricalContext | null
  // Legacy format for backwards compatibility
  historicalComparisons?: LegacyHistoricalTradeRef[] | null
  isDark: boolean
  isRejected?: boolean
}

export function HistoricalContextPanel({
  historicalContext,
  historicalComparisons,
  isDark,
  isRejected = false,
}: HistoricalContextPanelProps) {
  // Prefer new enhanced format if available
  if (historicalContext && typeof historicalContext === 'object' && 'similar_trades' in historicalContext) {
    return (
      <EnhancedHistoricalContextPanel
        context={historicalContext}
        isDark={isDark}
        isRejected={isRejected}
      />
    )
  }

  // Fall back to legacy format
  if (historicalComparisons && Array.isArray(historicalComparisons) && historicalComparisons.length > 0) {
    return <LegacyHistoricalDisplay comparisons={historicalComparisons} isDark={isDark} />
  }

  return null
}

// =====================
// Suggested Trade Unified Component
// =====================

export interface SuggestedTradePanelProps {
  // New enhanced format
  enhancedSuggestion?: EnhancedSuggestedTrade | null
  // Legacy format for backwards compatibility
  legacySuggestion?: LegacySuggestedTrade | null
  isDark: boolean
  chicagoTeam?: string
  opponentTeam?: string
}

export function SuggestedTradePanel({
  enhancedSuggestion,
  legacySuggestion,
  isDark,
  chicagoTeam,
  opponentTeam,
}: SuggestedTradePanelProps) {
  // Prefer new enhanced format if available
  if (enhancedSuggestion && 'chicago_sends' in enhancedSuggestion) {
    return (
      <EnhancedSuggestedTradePanel
        suggestion={enhancedSuggestion}
        isDark={isDark}
        chicagoTeam={chicagoTeam}
        opponentTeam={opponentTeam}
      />
    )
  }

  // Fall back to legacy format
  if (legacySuggestion && 'type' in legacySuggestion) {
    return <LegacySuggestedTradePanel suggestion={legacySuggestion} isDark={isDark} />
  }

  return null
}

export {
  EnhancedHistoricalContextPanel,
  EnhancedSuggestedTradePanel,
  LegacyHistoricalDisplay,
  LegacySuggestedTradePanel,
  SimilarTradeCard,
}
```


## src/components/gm/LeaderboardPanel.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface LeaderboardEntry {
  user_email: string
  total_score: number
  trades_count: number
  avg_grade: number
  total_improvement?: number
  best_grade?: number
  accepted_count?: number
  rejected_count?: number
  dangerous_count?: number
  streak?: number
  favorite_team?: string
}

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[]
  currentUserEmail?: string
}

export function LeaderboardPanel({ entries, currentUserEmail }: LeaderboardPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? '#1f293780' : '#f9fafb'

  const rankColors = ['#eab308', '#9ca3af', '#b45309']

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginBottom: 16 }}>Leaderboard</h2>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: subText, fontSize: '13px' }}>
          No trades yet. Be the first GM!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry, i) => {
            const isCurrentUser = entry.user_email === currentUserEmail
            return (
              <motion.div
                key={entry.user_email}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  backgroundColor: cardBg,
                  border: isCurrentUser ? '2px solid #bc0000' : '1px solid transparent',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: i < 3 ? `${rankColors[i]}20` : 'transparent',
                  color: i < 3 ? rankColors[i] : subText,
                  fontWeight: 800, fontSize: i < 3 ? '14px' : '12px',
                }}>
                  {i === 0 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={rankColors[0]} stroke="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ) : (
                    `#${i + 1}`
                  )}
                </div>

                {/* User info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600, color: textColor,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {entry.user_email.split('@')[0]}
                    {isCurrentUser && <span style={{ fontSize: '10px', color: '#bc0000', marginLeft: 4 }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: subText }}>
                    {entry.trades_count} trades | avg {entry.avg_grade}
                    {entry.streak ? ` | ${entry.streak} streak` : ''}
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#bc0000' }}>
                    {entry.total_score}
                  </div>
                  {entry.total_improvement != null && entry.total_improvement !== 0 && (
                    <div style={{
                      fontSize: '10px', fontWeight: 600,
                      color: entry.total_improvement > 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {entry.total_improvement > 0 ? '+' : ''}{Number(entry.total_improvement).toFixed(1)} imp
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```


## src/components/gm/OpponentRosterPanel.tsx

```tsx
'use client'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerCard, PlayerData } from './PlayerCard'
import { ProspectCard } from './ProspectCard'
import { DraftPickList } from './DraftPickList'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, MLBProspect } from '@/types/gm'

const POSITION_GROUPS: Record<string, string[]> = {
  nfl: ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
  nba: ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'],
  nhl: ['ALL', 'C', 'LW', 'RW', 'D', 'G'],
  mlb: ['ALL', 'SP', 'RP', 'C', 'IF', 'OF', 'DH'],
}

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7, nba: 2, nhl: 7, mlb: 20,
}

function getPositionGroup(pos: string, sport: string): string {
  if (sport === 'nfl') {
    if (['LT', 'RT', 'LG', 'RG', 'C', 'OT', 'OG', 'OL', 'T', 'G'].includes(pos)) return 'OL'
    if (['DE', 'DT', 'NT', 'DL', 'EDGE'].includes(pos)) return 'DL'
    if (['ILB', 'OLB', 'MLB', 'LB'].includes(pos)) return 'LB'
    if (['FS', 'SS', 'S', 'DB'].includes(pos)) return 'S'
    return pos
  }
  if (sport === 'mlb') {
    if (['1B', '2B', '3B', 'SS'].includes(pos)) return 'IF'
    if (['LF', 'CF', 'RF'].includes(pos)) return 'OF'
    if (['CL', 'MR', 'SU'].includes(pos)) return 'RP'
    return pos
  }
  return pos
}

interface OpponentRosterPanelProps {
  teamKey: string
  sport: string
  teamColor: string
  teamName?: string
  selectedIds: Set<string>
  onToggle: (playerId: string, player?: PlayerData) => void
  roster: PlayerData[]
  setRoster: (players: PlayerData[]) => void
  loading: boolean
  setLoading: (v: boolean) => void
  onAddCustomPlayer: (name: string, position: string) => void
  onViewFit?: (player: PlayerData) => void
  // Draft pick props
  draftPicks: DraftPick[]
  onAddDraftPick: (pick: DraftPick) => void
  onRemoveDraftPick: (index: number) => void
  // Prospect props (MLB only)
  selectedProspectIds?: Set<string>
  onToggleProspect?: (prospectId: string) => void
  onProspectsLoaded?: (prospects: MLBProspect[]) => void
  compact?: boolean
}

export function OpponentRosterPanel({
  teamKey, sport, teamColor, teamName, selectedIds, onToggle,
  roster, setRoster, loading, setLoading, onAddCustomPlayer, onViewFit,
  draftPicks, onAddDraftPick, onRemoveDraftPick,
  selectedProspectIds, onToggleProspect, onProspectsLoaded, compact = false,
}: OpponentRosterPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [customName, setCustomName] = useState('')
  const [customPos, setCustomPos] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const [draftYear, setDraftYear] = useState(2026)
  const [draftRound, setDraftRound] = useState(1)
  const [draftCondition, setDraftCondition] = useState('')

  // MLB-only: Roster vs Prospects view
  const [viewMode, setViewMode] = useState<'roster' | 'prospects'>('roster')
  const [prospects, setProspects] = useState<MLBProspect[]>([])
  const [prospectsLoading, setProspectsLoading] = useState(false)

  const isMLB = sport === 'mlb'

  // Fetch prospects when MLB team is selected and view mode is prospects
  useEffect(() => {
    if (!isMLB || viewMode !== 'prospects' || !teamKey) {
      setProspects([])
      return
    }

    setProspectsLoading(true)
    fetch(`/api/gm/prospects?team_key=${encodeURIComponent(teamKey)}&sport=mlb&limit=30`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => {
        const fetchedProspects = data.prospects || []
        setProspects(fetchedProspects)
        onProspectsLoaded?.(fetchedProspects)
      })
      .catch(() => setProspects([]))
      .finally(() => setProspectsLoading(false))
  }, [isMLB, viewMode, teamKey, onProspectsLoaded])

  // Filter prospects by search
  const filteredProspects = useMemo(() => {
    if (!search) return prospects
    const q = search.toLowerCase()
    return prospects.filter(p => p.name.toLowerCase().includes(q))
  }, [prospects, search])

  const positions = POSITION_GROUPS[sport] || POSITION_GROUPS.nfl
  const maxRound = SPORT_ROUNDS[sport] || 7
  const years = [2026, 2027, 2028, 2029, 2030]
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1)

  useEffect(() => {
    if (!teamKey || !sport) return
    setLoading(true)
    setSearch('')
    setPosFilter('ALL')
    fetch(`/api/gm/roster?team_key=${encodeURIComponent(teamKey)}&sport=${encodeURIComponent(sport)}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => setRoster(data.players || []))
      .catch(() => setRoster([]))
      .finally(() => setLoading(false))
  }, [teamKey, sport])

  const filtered = useMemo(() => {
    let result = roster
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.full_name.toLowerCase().includes(q))
    }
    if (posFilter !== 'ALL') {
      result = result.filter(p => getPositionGroup(p.position, sport) === posFilter || p.position === posFilter)
    }
    return result
  }, [roster, search, posFilter, sport])

  const inputBg = isDark ? '#374151' : '#ffffff'
  const inputBorder = isDark ? '#4b5563' : '#d1d5db'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  function handleAddCustom() {
    if (!customName.trim()) return
    onAddCustomPlayer(customName.trim(), customPos.trim() || 'Unknown')
    setCustomName('')
    setCustomPos('')
    setShowCustom(false)
  }

  const handleAddDraftPick = () => {
    onAddDraftPick({ year: draftYear, round: draftRound, condition: draftCondition.trim() || undefined })
    setDraftCondition('')
  }

  // Handler for DraftPickList toggle
  const handleToggleDraftPick = (pick: DraftPick) => {
    console.log('[OpponentRosterPanel.handleToggleDraftPick] called with pick:', pick)
    const existingIndex = draftPicks.findIndex(p => p.year === pick.year && p.round === pick.round)
    console.log('[OpponentRosterPanel.handleToggleDraftPick] existingIndex:', existingIndex, 'draftPicks:', draftPicks)
    if (existingIndex >= 0) {
      console.log('[OpponentRosterPanel.handleToggleDraftPick] Removing pick')
      onRemoveDraftPick(existingIndex)
    } else {
      console.log('[OpponentRosterPanel.handleToggleDraftPick] Adding pick')
      onAddDraftPick(pick)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: subText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Opponent Roster
        </span>
        <button
          onClick={() => setShowCustom(!showCustom)}
          style={{
            padding: '3px 10px', borderRadius: 6, border: `1px solid ${inputBorder}`,
            backgroundColor: 'transparent', color: subText, fontSize: '11px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          {showCustom ? 'Cancel' : '+ Custom'}
        </button>
      </div>

      {/* MLB Segmented Control: Roster / Prospects */}
      {isMLB && !showDraft && (
        <div style={{
          display: 'flex',
          marginBottom: 8,
          borderRadius: 8,
          overflow: 'hidden',
          border: `1px solid ${inputBorder}`,
        }}>
          <button
            onClick={() => setViewMode('roster')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: viewMode === 'roster' ? teamColor : (isDark ? '#1f2937' : '#f9fafb'),
              color: viewMode === 'roster' ? '#fff' : subText,
              transition: 'all 0.15s',
            }}
          >
            Roster
          </button>
          <button
            onClick={() => setViewMode('prospects')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderLeft: `1px solid ${inputBorder}`,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: viewMode === 'prospects' ? '#22c55e' : (isDark ? '#1f2937' : '#f9fafb'),
              color: viewMode === 'prospects' ? '#fff' : subText,
              transition: 'all 0.15s',
            }}
          >
            Prospects
          </button>
        </div>
      )}

      {/* Custom player input */}
      {showCustom && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Player name"
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 6,
              border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
              color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none',
            }}
          />
          <input
            type="text"
            value={customPos}
            onChange={e => setCustomPos(e.target.value)}
            placeholder="Pos"
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            style={{
              width: 60, padding: '6px 8px', borderRadius: 6,
              border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
              color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none',
            }}
          />
          <button
            onClick={handleAddCustom}
            style={{
              padding: '6px 14px', borderRadius: 6, border: 'none',
              backgroundColor: '#bc0000', color: '#fff',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Search - only show when viewing players/prospects */}
      {!showDraft && (
        <input
          type="text"
          placeholder={viewMode === 'prospects' ? 'Search prospects...' : 'Search players...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px',
            border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
            color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none',
            marginBottom: 8,
          }}
        />
      )}

      {/* Position filters + Draft button - hide when viewing prospects */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
        {!showDraft && viewMode === 'roster' && positions.map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
              backgroundColor: posFilter === pos ? teamColor : (isDark ? '#374151' : '#e5e7eb'),
              color: posFilter === pos ? '#fff' : subText,
            }}
          >
            {pos}
          </button>
        ))}
        <button
          onClick={() => setShowDraft(!showDraft)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: showDraft ? teamColor : (isDark ? '#374151' : '#e5e7eb'),
            color: showDraft ? '#fff' : subText,
            transition: 'background-color 0.15s',
          }}
        >
          Draft
        </button>
      </div>

      {/* Draft Pick List (collapsible checkbox version) - hide when viewing prospects */}
      {!showDraft && viewMode === 'roster' && (
        <DraftPickList
          sport={sport}
          selectedPicks={draftPicks}
          onToggle={handleToggleDraftPick}
          teamColor={teamColor}
          teamName={teamName}
          isOwn={false}
        />
      )}

      {/* Selected count */}
      {(selectedIds.size > 0 || draftPicks.length > 0 || (selectedProspectIds?.size || 0) > 0) && !showDraft && (
        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: teamColor }}>
              {selectedIds.size} player{selectedIds.size > 1 ? 's' : ''}
            </span>
          )}
          {(selectedProspectIds?.size || 0) > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>
              {selectedProspectIds!.size} prospect{selectedProspectIds!.size > 1 ? 's' : ''}
            </span>
          )}
          {draftPicks.length > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>
              {draftPicks.length} pick{draftPicks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Draft Pick Selection View */}
      {showDraft ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 12 }}>
            Select Draft Picks to Receive
          </div>

          {/* Draft pick selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={draftYear}
                onChange={e => setDraftYear(+e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: isDark ? '#fff' : '#000',
                  fontSize: '13px',
                  flex: 1,
                }}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={draftRound}
                onChange={e => setDraftRound(+e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: isDark ? '#fff' : '#000',
                  fontSize: '13px',
                  flex: 1,
                }}
              >
                {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
              </select>
            </div>
            <input
              type="text"
              value={draftCondition}
              onChange={e => setDraftCondition(e.target.value)}
              placeholder="Condition (optional)"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${inputBorder}`,
                backgroundColor: inputBg,
                color: isDark ? '#fff' : '#000',
                fontSize: '13px',
              }}
            />
            <button
              onClick={handleAddDraftPick}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: teamColor,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add Pick
            </button>
          </div>

          {/* Selected draft picks */}
          {draftPicks.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                Selected Picks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {draftPicks.map((pk, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 8,
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    border: `1px solid ${teamColor}40`,
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a' }}>
                      {pk.year} Round {pk.round}{pk.condition ? ` (${pk.condition})` : ''}
                    </span>
                    <button
                      onClick={() => onRemoveDraftPick(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: '16px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'prospects' && isMLB ? (
        <>
          {/* Prospect list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: 4,
          }}>
            {prospectsLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{
                    height: 80, borderRadius: 12,
                    backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
                    animation: 'pulse 2s ease-in-out infinite',
                  }} />
                ))}
              </>
            ) : (
              <AnimatePresence>
                {filteredProspects.map((prospect, i) => (
                  <motion.div
                    key={prospect.id || prospect.prospect_id || `prospect-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <ProspectCard
                      prospect={prospect}
                      selected={selectedProspectIds?.has(prospect.id || prospect.prospect_id || '') || false}
                      teamColor={teamColor}
                      onClick={() => {
                        onToggleProspect?.(prospect.id || prospect.prospect_id || '')
                        setSearch('')
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {!prospectsLoading && filteredProspects.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '13px' }}>
              No prospects found
            </div>
          )}
        </>
      ) : (
        <>
          {/* Player list - single column for better card display */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: 4,
          }}>
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{
                    height: 160, borderRadius: 12,
                    backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
                    animation: 'pulse 2s ease-in-out infinite',
                  }} />
                ))}
              </>
            ) : (
              <AnimatePresence>
                {filtered.map((player, i) => (
                  <motion.div
                    key={player.player_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <PlayerCard
                      player={player}
                      selected={selectedIds.has(player.player_id)}
                      teamColor={teamColor}
                      onClick={() => {
                        onToggle(player.player_id, player)
                        setSearch('')
                      }}
                      onViewFit={onViewFit}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '13px' }}>
              No players found
            </div>
          )}
        </>
      )}
    </div>
  )
}
```


## src/components/gm/OpponentTeamPicker.tsx

```tsx
'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface LeagueTeam {
  team_key: string
  team_name: string
  abbreviation: string
  city: string
  logo_url: string
  primary_color: string
  conference: string
  division: string
  sport: string
}

// Division rivals for Chicago teams — trades with these carry penalties
const DIVISION_RIVALS: Record<string, string[]> = {
  bears: ['packers', 'vikings', 'lions'],
  bulls: ['cavaliers', 'pistons', 'pacers', 'bucks'],
  blackhawks: ['avalanche', 'stars', 'predators', 'blues', 'wild', 'jets', 'utah'],
  cubs: ['reds', 'brewers', 'pirates', 'cardinals'],
  whitesox: ['guardians', 'tigers', 'royals', 'twins'],
}

interface OpponentTeamPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (team: LeagueTeam) => void
  sport: string
  chicagoTeam: string
  excludeTeam?: string // Additional team to exclude (e.g., already-selected opponent in 3-team trades)
}

export function OpponentTeamPicker({ open, onClose, onSelect, sport, chicagoTeam, excludeTeam }: OpponentTeamPickerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [teams, setTeams] = useState<LeagueTeam[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set())

  const handleLogoError = useCallback((teamKey: string) => {
    setFailedLogos(prev => new Set(prev).add(teamKey))
  }, [])

  useEffect(() => {
    if (!open || !sport) return
    setLoading(true)
    fetch(`/api/gm/teams?sport=${sport}`)
      .then(r => r.json())
      .then(d => setTeams(d.teams || []))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false))
  }, [open, sport])

  const rivals = DIVISION_RIVALS[chicagoTeam] || []

  const grouped = useMemo(() => {
    let filtered = teams.filter(t => t.team_key !== chicagoTeam && t.team_key !== excludeTeam)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.team_name.toLowerCase().includes(q) ||
        t.abbreviation.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      )
    }
    const groups: Record<string, LeagueTeam[]> = {}
    for (const t of filtered) {
      const key = `${t.conference} - ${t.division}`
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    }
    return groups
  }, [teams, search, chicagoTeam, excludeTeam])

  const bgOverlay = 'rgba(0,0,0,0.6)'
  const bgModal = isDark ? '#111827' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: bgOverlay,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: bgModal,
              borderRadius: 16,
              border: `1px solid ${borderColor}`,
              width: '100%',
              maxWidth: 600,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>Select Trade Partner</h3>
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: subText, fontSize: '20px', padding: 4 }}
                >
                  &#x2715;
                </button>
              </div>
              <input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                  color: textColor,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Teams list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: subText }}>Loading teams...</div>
              ) : Object.keys(grouped).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: subText }}>No teams found</div>
              ) : (
                Object.entries(grouped).map(([division, divTeams]) => (
                  <div key={division} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: subText, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                      {division}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {divTeams.map(t => {
                        const isRival = rivals.includes(t.team_key)
                        return (
                          <motion.button
                            key={t.team_key}
                            whileHover={{ scale: 1.01, backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }}
                            onClick={() => { onSelect(t); onClose() }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: `1px solid ${isRival ? '#ef444440' : 'transparent'}`,
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                          >
                            {(t.logo_url && !failedLogos.has(t.team_key)) ? (
                              <img
                                src={t.logo_url}
                                alt={t.team_name}
                                style={{ width: 32, height: 32, objectFit: 'contain' }}
                                onError={() => handleLogoError(t.team_key)}
                              />
                            ) : (
                              <div style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: t.primary_color || '#666',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 700, color: '#fff',
                              }}>
                                {t.abbreviation}
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>{t.team_name}</div>
                              <div style={{ fontSize: '11px', color: subText }}>{t.abbreviation}</div>
                            </div>
                            {isRival && (
                              <div style={{
                                fontSize: '10px', fontWeight: 700,
                                color: '#ef4444', backgroundColor: '#ef444415',
                                padding: '2px 8px', borderRadius: 6,
                              }} title="Division trade penalty applies">
                                RIVAL
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```


## src/components/gm/PlayerCard.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerTrendBadge, TrendDirection } from './PlayerTrendBadge'

export interface PlayerData {
  player_id: string
  full_name: string
  position: string
  jersey_number: number | null
  headshot_url: string | null
  age: number | null
  weight_lbs: number | null
  college: string | null
  years_exp: number | null
  draft_info: string | null
  espn_id: string | null
  stat_line: string
  stats: Record<string, any>
  status?: string
  base_salary?: number | null
  cap_hit?: number | null
  contract_years?: number | null
  contract_expires_year?: number | null
  contract_signed_year?: number | null
  is_rookie_deal?: boolean | null
  // V2 Enhanced fields
  trend?: TrendDirection | null
  performance_vs_projection?: number | null
  market_sentiment?: 'buy' | 'hold' | 'sell' | null
}

interface PlayerCardProps {
  player: PlayerData
  selected?: boolean
  compact?: boolean
  teamColor?: string
  onClick?: () => void
  onViewFit?: (player: PlayerData) => void
}

export function PlayerCard({ player, selected = false, compact = false, teamColor = '#bc0000', onClick, onViewFit }: PlayerCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const borderColor = selected ? teamColor : (isDark ? '#374151' : '#e5e7eb')
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const subTextColor = isDark ? '#9ca3af' : '#6b7280'

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          borderRadius: '8px',
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          border: `1px solid ${borderColor}`,
        }}
      >
        {player.headshot_url ? (
          <img
            src={player.headshot_url}
            alt={player.full_name}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: teamColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '10px', fontWeight: 700,
          }}>
            {player.jersey_number || player.full_name.charAt(0)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {player.full_name}
            </span>
            {player.trend && <PlayerTrendBadge trend={player.trend} compact />}
          </div>
          <div style={{ fontSize: '11px', color: subTextColor }}>{player.position}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layoutId={`player-${player.player_id}`}
      whileHover={{ scale: 1.02 }}
      animate={selected ? { scale: 1.03 } : { scale: 1 }}
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: cardBg,
        border: `2px solid ${borderColor}`,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? `0 0 12px ${teamColor}40` : 'none',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Jersey number badge */}
      {player.jersey_number && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          backgroundColor: teamColor, color: '#fff',
          fontSize: '11px', fontWeight: 700,
          width: 24, height: 24, borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {player.jersey_number}
        </div>
      )}

      {/* Position badge */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {player.status && player.status !== 'Active' && (
          <span style={{
            fontSize: '9px', fontWeight: 700,
            padding: '2px 6px', borderRadius: '10px',
            backgroundColor: player.status === 'IR' ? '#ef444430' : '#6b728030',
            color: player.status === 'IR' ? '#ef4444' : '#6b7280',
          }}>
            {player.status === 'Practice Squad' ? 'PS' : player.status}
          </span>
        )}
        <span style={{
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          color: subTextColor, fontSize: '10px', fontWeight: 600,
          padding: '2px 8px', borderRadius: '10px',
        }}>
          {player.position}
        </span>
      </div>

      {/* Headshot */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, marginTop: 4 }}>
        {player.headshot_url ? (
          <img
            src={player.headshot_url}
            alt={player.full_name}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}` }}
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              el.nextElementSibling?.setAttribute('style', 'display:flex')
            }}
          />
        ) : null}
        <div style={{
          display: player.headshot_url ? 'none' : 'flex',
          width: 56, height: 56, borderRadius: '50%',
          backgroundColor: `${teamColor}20`, border: `2px solid ${teamColor}40`,
          alignItems: 'center', justifyContent: 'center',
          color: teamColor, fontSize: '20px', fontWeight: 700,
        }}>
          {player.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>

      {/* Name */}
      <div style={{
        textAlign: 'center', fontWeight: 700, fontSize: '13px',
        color: textColor, marginBottom: 4,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {player.full_name}
      </div>

      {/* Trend badge */}
      {player.trend && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <PlayerTrendBadge
            trend={player.trend}
            performanceVsProjection={player.performance_vs_projection}
            marketSentiment={player.market_sentiment}
          />
        </div>
      )}

      {/* Stat line */}
      {player.stat_line && (
        <div style={{
          textAlign: 'center', fontSize: '11px', color: teamColor,
          fontWeight: 600, marginBottom: 4,
        }}>
          {player.stat_line}
        </div>
      )}

      {/* Details */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: subTextColor }}>
        {[
          player.age ? `Age ${player.age}` : null,
          player.years_exp !== null && player.years_exp !== undefined ? `Yr ${player.years_exp + 1}` : null,
          player.college,
        ].filter(Boolean).join(' | ')}
      </div>

      {/* Contract Details */}
      {(player.base_salary || player.cap_hit || player.contract_years) && (
        <div style={{
          marginTop: 6,
          padding: '6px 8px',
          borderRadius: '6px',
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          fontSize: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
            <span style={{ color: subTextColor }}>
              {player.base_salary || player.cap_hit ? (
                <span style={{ fontWeight: 600, color: textColor }}>
                  ${((player.cap_hit || player.base_salary || 0) / 1_000_000).toFixed(1)}M
                </span>
              ) : null}
              {player.contract_years ? ` / ${player.contract_years}yr` : ''}
            </span>
            {player.is_rookie_deal && (
              <span style={{
                fontSize: '8px',
                fontWeight: 700,
                padding: '1px 4px',
                borderRadius: '4px',
                backgroundColor: '#10b98120',
                color: '#10b981',
              }}>
                ROOKIE
              </span>
            )}
          </div>
          {player.contract_signed_year && (
            <div style={{ fontSize: '9px', color: subTextColor, marginTop: 2 }}>
              Signed {player.contract_signed_year}
              {player.contract_expires_year ? ` → ${player.contract_expires_year}` : ''}
            </div>
          )}
        </div>
      )}

      {/* Selected checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute', bottom: 6, right: 6,
            width: 20, height: 20, borderRadius: '50%',
            backgroundColor: teamColor, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}

      {/* View Fit button - shows on hover */}
      {onViewFit && (
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation()
            onViewFit(player)
          }}
          style={{
            position: 'absolute',
            bottom: 6,
            left: 6,
            padding: '4px 8px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
            color: teamColor,
            fontSize: '9px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          className="view-fit-btn"
        >
          View Fit
        </motion.button>
      )}
    </motion.div>
  )
}
```


## src/components/gm/PlayerTrendBadge.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export type TrendDirection = 'hot' | 'rising' | 'stable' | 'declining' | 'cold'

interface PlayerTrendBadgeProps {
  trend?: TrendDirection | null
  performanceVsProjection?: number | null // -100 to +100
  marketSentiment?: 'buy' | 'hold' | 'sell' | null
  compact?: boolean
}

const TREND_CONFIG: Record<TrendDirection, { emoji: string; label: string; color: string; bgColor: string }> = {
  hot: { emoji: '🔥', label: 'Hot', color: '#ef4444', bgColor: '#ef444420' },
  rising: { emoji: '📈', label: 'Rising', color: '#22c55e', bgColor: '#22c55e20' },
  stable: { emoji: '➡️', label: 'Stable', color: '#6b7280', bgColor: '#6b728020' },
  declining: { emoji: '📉', label: 'Declining', color: '#eab308', bgColor: '#eab30820' },
  cold: { emoji: '❄️', label: 'Cold', color: '#3b82f6', bgColor: '#3b82f620' },
}

export function PlayerTrendBadge({ trend, performanceVsProjection, marketSentiment, compact = false }: PlayerTrendBadgeProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!trend) return null

  const config = TREND_CONFIG[trend]

  if (compact) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        title={`${config.label}${performanceVsProjection ? ` (${performanceVsProjection > 0 ? '+' : ''}${performanceVsProjection}% vs projection)` : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          fontSize: '12px',
          borderRadius: '50%',
          backgroundColor: config.bgColor,
        }}
      >
        {config.emoji}
      </motion.span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 6,
        backgroundColor: config.bgColor,
        fontSize: '10px',
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: '12px' }}>{config.emoji}</span>
      <span style={{ color: config.color }}>{config.label}</span>
      {performanceVsProjection !== null && performanceVsProjection !== undefined && (
        <span style={{
          color: performanceVsProjection > 0 ? '#22c55e' : performanceVsProjection < 0 ? '#ef4444' : '#6b7280',
          fontSize: '9px',
        }}>
          {performanceVsProjection > 0 ? '+' : ''}{performanceVsProjection}%
        </span>
      )}
      {marketSentiment && (
        <span style={{
          padding: '1px 4px',
          borderRadius: 4,
          fontSize: '8px',
          fontWeight: 700,
          textTransform: 'uppercase',
          backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
          color: marketSentiment === 'buy' ? '#22c55e' : marketSentiment === 'sell' ? '#ef4444' : '#6b7280',
        }}>
          {marketSentiment}
        </span>
      )}
    </motion.div>
  )
}

export function getTrendFromStats(stats: Record<string, any>, sport: string): TrendDirection | null {
  // Calculate trend based on recent performance
  // This is a simplified heuristic - Data Lab will provide actual trend data
  if (!stats || !stats.games) return null

  // For now, return null as Data Lab will provide the actual trend
  // This function can be used as a fallback calculation
  return null
}
```


## src/components/gm/PreferencesModal.tsx

```tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export interface GMPreferences {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  favorite_team: string | null
  team_phase: 'rebuilding' | 'contending' | 'win_now' | 'auto'
  preferred_trade_style: 'balanced' | 'star_hunting' | 'depth_building' | 'draft_focused'
  cap_flexibility_priority: 'low' | 'medium' | 'high'
  age_preference: 'young' | 'prime' | 'veteran' | 'any'
}

const DEFAULT_PREFERENCES: GMPreferences = {
  risk_tolerance: 'moderate',
  favorite_team: null,
  team_phase: 'auto',
  preferred_trade_style: 'balanced',
  cap_flexibility_priority: 'medium',
  age_preference: 'any',
}

interface PreferencesModalProps {
  show: boolean
  onClose: () => void
  preferences: GMPreferences
  onSave: (prefs: GMPreferences) => void
}

interface OptionButtonProps {
  label: string
  selected: boolean
  onClick: () => void
  description?: string
}

function OptionButton({ label, selected, onClick, description }: OptionButtonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: description ? '10px 12px' : '8px 12px',
        borderRadius: 8,
        border: `2px solid ${selected ? '#bc0000' : (isDark ? '#374151' : '#e5e7eb')}`,
        backgroundColor: selected ? '#bc000015' : 'transparent',
        color: selected ? '#bc0000' : (isDark ? '#fff' : '#1a1a1a'),
        fontWeight: selected ? 700 : 500,
        fontSize: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <div>{label}</div>
      {description && (
        <div style={{ fontSize: '10px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: 2 }}>
          {description}
        </div>
      )}
    </button>
  )
}

export function PreferencesModal({ show, onClose, preferences, onSave }: PreferencesModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [localPrefs, setLocalPrefs] = useState<GMPreferences>(preferences)
  const [saving, setSaving] = useState(false)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  useEffect(() => {
    if (show) {
      setLocalPrefs(preferences)
    }
  }, [show, preferences])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/gm/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: localPrefs }),
      })
      onSave(localPrefs)
      onClose()
    } catch (e) {
      console.error('Failed to save preferences:', e)
    }
    setSaving(false)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#111827' : '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>
                GM Preferences
              </h2>
              <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
                Customize how the AI evaluates your trades
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: subText,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Risk Tolerance */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Risk Tolerance
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['conservative', 'moderate', 'aggressive'] as const).map(opt => (
                <OptionButton
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={localPrefs.risk_tolerance === opt}
                  onClick={() => setLocalPrefs(p => ({ ...p, risk_tolerance: opt }))}
                />
              ))}
            </div>
          </div>

          {/* Team Phase */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Team Building Phase
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { value: 'auto', label: 'Auto Detect', desc: 'AI determines based on roster' },
                { value: 'rebuilding', label: 'Rebuilding', desc: 'Prioritize youth & picks' },
                { value: 'contending', label: 'Contending', desc: 'Balance present & future' },
                { value: 'win_now', label: 'Win Now', desc: 'Maximize current talent' },
              ] as const).map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  description={opt.desc}
                  selected={localPrefs.team_phase === opt.value}
                  onClick={() => setLocalPrefs(p => ({ ...p, team_phase: opt.value }))}
                />
              ))}
            </div>
          </div>

          {/* Trade Style */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Preferred Trade Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { value: 'balanced', label: 'Balanced', desc: 'Equal weight to all factors' },
                { value: 'star_hunting', label: 'Star Hunting', desc: 'Target elite talent' },
                { value: 'depth_building', label: 'Depth Building', desc: 'Acquire multiple contributors' },
                { value: 'draft_focused', label: 'Draft Focused', desc: 'Value draft picks highly' },
              ] as const).map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  description={opt.desc}
                  selected={localPrefs.preferred_trade_style === opt.value}
                  onClick={() => setLocalPrefs(p => ({ ...p, preferred_trade_style: opt.value }))}
                />
              ))}
            </div>
          </div>

          {/* Cap Flexibility */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Cap Flexibility Priority
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['low', 'medium', 'high'] as const).map(opt => (
                <OptionButton
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={localPrefs.cap_flexibility_priority === opt}
                  onClick={() => setLocalPrefs(p => ({ ...p, cap_flexibility_priority: opt }))}
                />
              ))}
            </div>
          </div>

          {/* Age Preference */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Player Age Preference
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {([
                { value: 'any', label: 'Any' },
                { value: 'young', label: 'Young' },
                { value: 'prime', label: 'Prime' },
                { value: 'veteran', label: 'Veteran' },
              ] as const).map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={localPrefs.age_preference === opt.value}
                  onClick={() => setLocalPrefs(p => ({ ...p, age_preference: opt.value }))}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setLocalPrefs(DEFAULT_PREFERENCES)}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: `2px solid ${borderColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#bc0000',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
```


## src/components/gm/ProspectCard.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { MLBProspect } from '@/types/gm'

interface ProspectCardProps {
  prospect: MLBProspect
  selected: boolean
  teamColor: string
  onClick: () => void
}

// Level colors for visual distinction
const LEVEL_COLORS: Record<string, string> = {
  'AAA': '#22c55e',
  'AA': '#3b82f6',
  'A+': '#8b5cf6',
  'A': '#a855f7',
  'R': '#f59e0b',
  'Rk': '#f59e0b',
}

// Grade colors for prospect badges
const GRADE_COLORS: Record<string, string> = {
  'A+': '#22c55e',
  'A': '#22c55e',
  'A-': '#22c55e',
  'B+': '#3b82f6',
  'B': '#3b82f6',
  'B-': '#3b82f6',
  'C+': '#f59e0b',
  'C': '#f59e0b',
  'C-': '#f59e0b',
  'D': '#ef4444',
}

// Tier colors for valuation display
const TIER_COLORS: Record<string, string> = {
  'elite': '#dc2626',
  'plus': '#22c55e',
  'average': '#3b82f6',
  'organizational': '#9ca3af',
}

export function ProspectCard({ prospect, selected, teamColor, onClick }: ProspectCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  // Support both field naming conventions
  const level = prospect.current_level || prospect.level || ''
  const rank = prospect.org_rank || prospect.team_rank || prospect.rank || 0
  const isTop100 = rank <= 5  // Top 5 org prospects highlighted
  const gradeNumeric = prospect.prospect_grade_numeric || 0

  const levelColor = LEVEL_COLORS[level] || '#6b7280'
  const gradeColor = GRADE_COLORS[prospect.prospect_grade] || '#6b7280'

  // Generate initials for avatar placeholder
  const initials = prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        backgroundColor: selected
          ? `${teamColor}15`
          : isDark ? '#1f2937' : '#ffffff',
        border: selected
          ? `2px solid ${teamColor}`
          : `1px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Rank Badge (top left corner) */}
      {rank > 0 && (
        <div style={{
          position: 'absolute',
          top: -8,
          left: -8,
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: isTop100 ? '#dc2626' : teamColor,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          #{rank}
        </div>
      )}

      {/* Avatar */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: prospect.headshot_url ? 'transparent' : `${levelColor}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        border: `2px solid ${levelColor}40`,
      }}>
        {prospect.headshot_url ? (
          <img
            src={prospect.headshot_url}
            alt={prospect.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: levelColor }}>{initials}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: textColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {prospect.name}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 2,
        }}>
          {/* Level badge */}
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: `${levelColor}20`,
            color: levelColor,
          }}>
            {level}
          </span>
          <span style={{ fontSize: 12, color: subText }}>
            {prospect.position}
          </span>
          <span style={{ fontSize: 12, color: subText }}>
            Age {prospect.age}
          </span>
        </div>

        {/* Valuation row (when available) */}
        {(prospect.prospect_fv_bucket || prospect.prospect_tier || prospect.prospect_surplus_value_millions) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
          }}>
            {/* FV bucket */}
            {prospect.prospect_fv_bucket && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 3,
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                color: subText,
              }}>
                FV {prospect.prospect_fv_bucket}
              </span>
            )}
            {/* Tier badge */}
            {prospect.prospect_tier && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                backgroundColor: `${TIER_COLORS[prospect.prospect_tier] || '#9ca3af'}20`,
                color: TIER_COLORS[prospect.prospect_tier] || '#9ca3af',
                textTransform: 'capitalize',
              }}>
                {prospect.prospect_tier}
              </span>
            )}
            {/* Surplus value */}
            {prospect.prospect_surplus_value_millions && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#22c55e',
              }}>
                ${prospect.prospect_surplus_value_millions.toFixed(1)}M
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: badges */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0,
      }}>
        {/* Grade badge */}
        {prospect.prospect_grade && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: `${gradeColor}20`,
            color: gradeColor,
          }}>
            {prospect.prospect_grade}
          </span>
        )}
        {/* Trade value badge */}
        {prospect.trade_value && (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: prospect.trade_value >= 80 ? '#dc262620' : `${teamColor}20`,
            color: prospect.trade_value >= 80 ? '#dc2626' : teamColor,
          }}>
            TV: {prospect.trade_value}
          </span>
        )}

        {/* ETA */}
        {prospect.eta && (
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            color: subText,
          }}>
            ETA {prospect.eta}
          </span>
        )}
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: teamColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
```


## src/components/gm/RosterPanel.tsx

```tsx
'use client'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerCard, PlayerData } from './PlayerCard'
import { ProspectCard } from './ProspectCard'
import { DraftPickList } from './DraftPickList'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, MLBProspect } from '@/types/gm'

const POSITION_GROUPS: Record<string, string[]> = {
  nfl: ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
  nba: ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'],
  nhl: ['ALL', 'C', 'LW', 'RW', 'D', 'G'],
  mlb: ['ALL', 'SP', 'RP', 'C', 'IF', 'OF', 'DH'],
}

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7, nba: 2, nhl: 7, mlb: 20,
}

// Map positions to their group for filtering
function getPositionGroup(pos: string, sport: string): string {
  if (sport === 'nfl') {
    if (['LT', 'RT', 'LG', 'RG', 'C', 'OT', 'OG', 'OL', 'T', 'G'].includes(pos)) return 'OL'
    if (['DE', 'DT', 'NT', 'DL', 'EDGE'].includes(pos)) return 'DL'
    if (['ILB', 'OLB', 'MLB', 'LB'].includes(pos)) return 'LB'
    if (['FS', 'SS', 'S', 'DB'].includes(pos)) return 'S'
    return pos
  }
  if (sport === 'mlb') {
    if (['1B', '2B', '3B', 'SS'].includes(pos)) return 'IF'
    if (['LF', 'CF', 'RF'].includes(pos)) return 'OF'
    if (['CL', 'MR', 'SU'].includes(pos)) return 'RP'
    return pos
  }
  return pos
}

interface RosterPanelProps {
  players: PlayerData[]
  loading: boolean
  selectedIds: Set<string>
  onToggle: (playerId: string) => void
  sport: string
  teamColor: string
  teamName?: string
  teamKey?: string  // For fetching prospects
  onViewFit?: (player: PlayerData) => void
  // Draft pick props
  draftPicks: DraftPick[]
  onAddDraftPick: (pick: DraftPick) => void
  onRemoveDraftPick: (index: number) => void
  // Prospect props (MLB only)
  selectedProspectIds?: Set<string>
  onToggleProspect?: (prospectId: string) => void
  onProspectsLoaded?: (prospects: MLBProspect[]) => void  // Callback when prospects are fetched
  compact?: boolean
}

export function RosterPanel({
  players, loading, selectedIds, onToggle, sport, teamColor, teamName, teamKey, onViewFit,
  draftPicks, onAddDraftPick, onRemoveDraftPick,
  selectedProspectIds, onToggleProspect, onProspectsLoaded, compact = false,
}: RosterPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [showDraft, setShowDraft] = useState(false)
  const [draftYear, setDraftYear] = useState(2026)
  const [draftRound, setDraftRound] = useState(1)
  const [draftCondition, setDraftCondition] = useState('')

  // MLB-only: Roster vs Prospects view
  const [viewMode, setViewMode] = useState<'roster' | 'prospects'>('roster')
  const [prospects, setProspects] = useState<MLBProspect[]>([])
  const [prospectsLoading, setProspectsLoading] = useState(false)

  const isMLB = sport === 'mlb'

  // Fetch prospects when MLB team is selected and view mode is prospects
  useEffect(() => {
    if (!isMLB || viewMode !== 'prospects' || !teamKey) {
      setProspects([])
      return
    }

    setProspectsLoading(true)
    fetch(`/api/gm/prospects?team_key=${encodeURIComponent(teamKey)}&sport=mlb&limit=30`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => {
        const fetchedProspects = data.prospects || []
        setProspects(fetchedProspects)
        onProspectsLoaded?.(fetchedProspects)
      })
      .catch(() => setProspects([]))
      .finally(() => setProspectsLoading(false))
  }, [isMLB, viewMode, teamKey, onProspectsLoaded])

  const positions = POSITION_GROUPS[sport] || POSITION_GROUPS.nfl
  const maxRound = SPORT_ROUNDS[sport] || 7
  const years = [2026, 2027, 2028, 2029, 2030]
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1)

  const filtered = useMemo(() => {
    let result = players
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.full_name.toLowerCase().includes(q))
    }
    if (posFilter !== 'ALL') {
      result = result.filter(p => getPositionGroup(p.position, sport) === posFilter || p.position === posFilter)
    }
    return result
  }, [players, search, posFilter, sport])

  const inputBg = isDark ? '#374151' : '#ffffff'
  const inputBorder = isDark ? '#4b5563' : '#d1d5db'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  const handleAddDraftPick = () => {
    onAddDraftPick({ year: draftYear, round: draftRound, condition: draftCondition.trim() || undefined })
    setDraftCondition('')
  }

  // Handler for DraftPickList toggle
  const handleToggleDraftPick = (pick: DraftPick) => {
    console.log('[RosterPanel.handleToggleDraftPick] called with pick:', pick)
    const existingIndex = draftPicks.findIndex(p => p.year === pick.year && p.round === pick.round)
    console.log('[RosterPanel.handleToggleDraftPick] existingIndex:', existingIndex, 'draftPicks:', draftPicks)
    if (existingIndex >= 0) {
      console.log('[RosterPanel.handleToggleDraftPick] Removing pick')
      onRemoveDraftPick(existingIndex)
    } else {
      console.log('[RosterPanel.handleToggleDraftPick] Adding pick')
      onAddDraftPick(pick)
    }
  }

  // Filter prospects by search
  const filteredProspects = useMemo(() => {
    if (!search) return prospects
    const q = search.toLowerCase()
    return prospects.filter(p => p.name.toLowerCase().includes(q))
  }, [prospects, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* MLB Segmented Control: Roster / Prospects */}
      {isMLB && !showDraft && (
        <div style={{
          display: 'flex',
          marginBottom: 12,
          borderRadius: 8,
          overflow: 'hidden',
          border: `1px solid ${inputBorder}`,
        }}>
          <button
            onClick={() => setViewMode('roster')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: viewMode === 'roster' ? teamColor : (isDark ? '#1f2937' : '#f9fafb'),
              color: viewMode === 'roster' ? '#fff' : subText,
              transition: 'all 0.15s',
            }}
          >
            Roster
          </button>
          <button
            onClick={() => setViewMode('prospects')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderLeft: `1px solid ${inputBorder}`,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: viewMode === 'prospects' ? '#22c55e' : (isDark ? '#1f2937' : '#f9fafb'),
              color: viewMode === 'prospects' ? '#fff' : subText,
              transition: 'all 0.15s',
            }}
          >
            Prospects
          </button>
        </div>
      )}

      {/* Search - only show when viewing players/prospects (not draft) */}
      {!showDraft && (
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder={viewMode === 'prospects' ? 'Search prospects...' : 'Search players...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              color: isDark ? '#fff' : '#000',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Position filters + Draft button - hide when viewing prospects */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        {!showDraft && viewMode === 'roster' && positions.map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: posFilter === pos ? teamColor : (isDark ? '#374151' : '#e5e7eb'),
              color: posFilter === pos ? '#fff' : subText,
              transition: 'background-color 0.15s',
            }}
          >
            {pos}
          </button>
        ))}
        <button
          onClick={() => setShowDraft(!showDraft)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: showDraft ? teamColor : (isDark ? '#374151' : '#e5e7eb'),
            color: showDraft ? '#fff' : subText,
            transition: 'background-color 0.15s',
          }}
        >
          Draft
        </button>
      </div>

      {/* Draft Pick List (collapsible checkbox version) - hide when viewing prospects */}
      {!showDraft && viewMode === 'roster' && (
        <DraftPickList
          sport={sport}
          selectedPicks={draftPicks}
          onToggle={handleToggleDraftPick}
          teamColor={teamColor}
          teamName={teamName}
          isOwn={true}
        />
      )}

      {/* Selected count */}
      {(selectedIds.size > 0 || draftPicks.length > 0 || (selectedProspectIds?.size || 0) > 0) && !showDraft && (
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: teamColor }}>
              {selectedIds.size} player{selectedIds.size > 1 ? 's' : ''}
            </span>
          )}
          {(selectedProspectIds?.size || 0) > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>
              {selectedProspectIds!.size} prospect{selectedProspectIds!.size > 1 ? 's' : ''}
            </span>
          )}
          {draftPicks.length > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>
              {draftPicks.length} pick{draftPicks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Draft Pick Selection View */}
      {showDraft ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 12 }}>
            Select Draft Picks to Send
          </div>

          {/* Draft pick selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={draftYear}
                onChange={e => setDraftYear(+e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: isDark ? '#fff' : '#000',
                  fontSize: '13px',
                  flex: 1,
                }}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={draftRound}
                onChange={e => setDraftRound(+e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: isDark ? '#fff' : '#000',
                  fontSize: '13px',
                  flex: 1,
                }}
              >
                {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
              </select>
            </div>
            <input
              type="text"
              value={draftCondition}
              onChange={e => setDraftCondition(e.target.value)}
              placeholder="Condition (optional)"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${inputBorder}`,
                backgroundColor: inputBg,
                color: isDark ? '#fff' : '#000',
                fontSize: '13px',
              }}
            />
            <button
              onClick={handleAddDraftPick}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: teamColor,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add Pick
            </button>
          </div>

          {/* Selected draft picks */}
          {draftPicks.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                Selected Picks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {draftPicks.map((pk, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 8,
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    border: `1px solid ${teamColor}40`,
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a' }}>
                      {pk.year} Round {pk.round}{pk.condition ? ` (${pk.condition})` : ''}
                    </span>
                    <button
                      onClick={() => onRemoveDraftPick(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: '16px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'prospects' && isMLB ? (
        <>
          {/* Prospect list */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: 4,
          }}>
            {prospectsLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 80,
                      borderRadius: 12,
                      backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                ))}
              </>
            ) : (
              <AnimatePresence>
                {filteredProspects.map((prospect, i) => (
                  <motion.div
                    key={prospect.id || prospect.prospect_id || `prospect-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <ProspectCard
                      prospect={prospect}
                      selected={selectedProspectIds?.has(prospect.id || prospect.prospect_id || '') || false}
                      teamColor={teamColor}
                      onClick={() => {
                        onToggleProspect?.(prospect.id || prospect.prospect_id || '')
                        setSearch('')
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {!prospectsLoading && filteredProspects.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '13px' }}>
              No prospects found
            </div>
          )}
        </>
      ) : (
        <>
          {/* Player list - single column for better card display */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: 4,
          }}>
            {loading ? (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 160,
                      borderRadius: 12,
                      backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                ))}
              </>
            ) : (
              <AnimatePresence>
                {filtered.map((player, i) => (
                  <motion.div
                    key={player.player_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <PlayerCard
                      player={player}
                      selected={selectedIds.has(player.player_id)}
                      teamColor={teamColor}
                      onClick={() => {
                        onToggle(player.player_id)
                        setSearch('')
                      }}
                      onViewFit={onViewFit}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '13px' }}>
              No players found
            </div>
          )}
        </>
      )}
    </div>
  )
}
```


## src/components/gm/ScenarioTabs.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export type ScenarioType =
  | 'player_improvement'
  | 'player_decline'
  | 'injury_impact'
  | 'add_pick'
  | 'remove_player'
  | 'age_progression'

export interface ScenarioParameters {
  improvement_pct?: number
  player_name?: string
  injured_player?: string
  injury_severity?: 'minor' | 'major' | 'season_ending'
  pick_year?: number
  pick_round?: number
  pick_side?: 'sent' | 'received'
  removed_player?: string
  removed_side?: 'sent' | 'received'
  years_forward?: number
}

interface ScenarioTabsProps {
  playersSent: Array<{ name: string }>
  playersReceived: Array<{ name: string }>
  onRunScenario: (type: ScenarioType, params: ScenarioParameters) => void
  loading: boolean
  sport: string
}

const SCENARIO_CONFIGS = [
  { type: 'player_improvement' as const, label: 'Player Improves', emoji: '📈', color: '#22c55e' },
  { type: 'player_decline' as const, label: 'Player Declines', emoji: '📉', color: '#ef4444' },
  { type: 'injury_impact' as const, label: 'Injury Risk', emoji: '🏥', color: '#f97316' },
  { type: 'add_pick' as const, label: 'Add Pick', emoji: '📄', color: '#3b82f6' },
  { type: 'remove_player' as const, label: 'Remove Player', emoji: '❌', color: '#8b5cf6' },
  { type: 'age_progression' as const, label: 'Time Forward', emoji: '⏳', color: '#6b7280' },
]

export function ScenarioTabs({ playersSent, playersReceived, onRunScenario, loading, sport }: ScenarioTabsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<ScenarioType>('player_improvement')
  const [params, setParams] = useState<ScenarioParameters>({
    improvement_pct: 15,
    injury_severity: 'minor',
    pick_year: new Date().getFullYear() + 1,
    pick_round: 1,
    pick_side: 'received',
    removed_side: 'sent',
    years_forward: 1,
  })

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#fff'
  const inputBorder = isDark ? '#4b5563' : '#d1d5db'

  const allPlayers = [
    ...playersSent.map(p => ({ name: p.name, side: 'sent' as const })),
    ...playersReceived.map(p => ({ name: p.name, side: 'received' as const })),
  ]

  const activeConfig = SCENARIO_CONFIGS.find(c => c.type === activeTab)

  function handleRun() {
    onRunScenario(activeTab, params)
  }

  // Get max rounds based on sport
  const maxRounds = sport === 'nfl' ? 7 : sport === 'nba' ? 2 : sport === 'nhl' ? 7 : 20

  return (
    <div>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {SCENARIO_CONFIGS.map(config => (
          <button
            key={config.type}
            onClick={() => setActiveTab(config.type)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: activeTab === config.type ? `${config.color}20` : (isDark ? '#374151' : '#f3f4f6'),
              color: activeTab === config.type ? config.color : subText,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: 16,
          borderRadius: 10,
          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        }}
      >
        {/* Player Improvement */}
        {activeTab === 'player_improvement' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Select Player
              </label>
              <select
                value={params.player_name || ''}
                onChange={e => setParams(p => ({ ...p, player_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name} ({p.side === 'sent' ? 'Sending' : 'Receiving'})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Improvement: +{params.improvement_pct}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={params.improvement_pct || 15}
                onChange={e => setParams(p => ({ ...p, improvement_pct: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#22c55e' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: subText }}>
                <span>+5%</span>
                <span>+50%</span>
              </div>
            </div>
          </div>
        )}

        {/* Player Decline */}
        {activeTab === 'player_decline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Select Player
              </label>
              <select
                value={params.player_name || ''}
                onChange={e => setParams(p => ({ ...p, player_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name} ({p.side === 'sent' ? 'Sending' : 'Receiving'})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Decline: -{Math.abs(params.improvement_pct || 15)}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={Math.abs(params.improvement_pct || 15)}
                onChange={e => setParams(p => ({ ...p, improvement_pct: -Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: subText }}>
                <span>-5%</span>
                <span>-50%</span>
              </div>
            </div>
          </div>
        )}

        {/* Injury Impact */}
        {activeTab === 'injury_impact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Injured Player
              </label>
              <select
                value={params.injured_player || ''}
                onChange={e => setParams(p => ({ ...p, injured_player: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Injury Severity
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['minor', 'major', 'season_ending'] as const).map(severity => (
                  <button
                    key={severity}
                    onClick={() => setParams(p => ({ ...p, injury_severity: severity }))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `2px solid ${params.injury_severity === severity ? '#f97316' : inputBorder}`,
                      backgroundColor: params.injury_severity === severity ? '#f9731615' : 'transparent',
                      color: params.injury_severity === severity ? '#f97316' : textColor,
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {severity.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Pick */}
        {activeTab === 'add_pick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                  Year
                </label>
                <select
                  value={params.pick_year || new Date().getFullYear() + 1}
                  onChange={e => setParams(p => ({ ...p, pick_year: Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${inputBorder}`,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: '13px',
                  }}
                >
                  {[0, 1, 2, 3].map(i => (
                    <option key={i} value={new Date().getFullYear() + i}>{new Date().getFullYear() + i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                  Round
                </label>
                <select
                  value={params.pick_round || 1}
                  onChange={e => setParams(p => ({ ...p, pick_round: Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${inputBorder}`,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: '13px',
                  }}
                >
                  {Array.from({ length: maxRounds }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Round {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Add to Side
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['received', 'sent'] as const).map(side => (
                  <button
                    key={side}
                    onClick={() => setParams(p => ({ ...p, pick_side: side }))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `2px solid ${params.pick_side === side ? '#3b82f6' : inputBorder}`,
                      backgroundColor: params.pick_side === side ? '#3b82f615' : 'transparent',
                      color: params.pick_side === side ? '#3b82f6' : textColor,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {side === 'received' ? 'Receive Pick' : 'Send Pick'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Remove Player */}
        {activeTab === 'remove_player' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Player to Remove
              </label>
              <select
                value={params.removed_player || ''}
                onChange={e => {
                  const player = allPlayers.find(p => p.name === e.target.value)
                  setParams(p => ({ ...p, removed_player: e.target.value, removed_side: player?.side || 'sent' }))
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name} ({p.side === 'sent' ? 'Sending' : 'Receiving'})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Age Progression */}
        {activeTab === 'age_progression' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
              Years Forward
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(years => (
                <button
                  key={years}
                  onClick={() => setParams(p => ({ ...p, years_forward: years }))}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: `2px solid ${params.years_forward === years ? '#6b7280' : inputBorder}`,
                    backgroundColor: params.years_forward === years ? '#6b728015' : 'transparent',
                    color: params.years_forward === years ? textColor : subText,
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {years} Year{years > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: subText, marginTop: 8 }}>
              See how this trade looks after players age and contracts evolve.
            </p>
          </div>
        )}

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeConfig?.color || '#bc0000',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Analyzing...' : `Run ${activeConfig?.label || 'Scenario'}`}
        </button>
      </motion.div>
    </div>
  )
}
```


## src/components/gm/SessionManager.tsx

```tsx
'use client'
import { useTheme } from '@/contexts/ThemeContext'

interface Session {
  id: string
  session_name: string
  chicago_team: string
  is_active: boolean
  num_trades: number
  num_approved: number
  num_dangerous: number
  num_failed: number
  total_improvement: number
  created_at: string
}

interface SessionManagerProps {
  sessions: Session[]
  activeSession: Session | null
  onNewSession: () => void
  onSelectSession: (session: Session) => void
}

export function SessionManager({ sessions, activeSession, onNewSession, onSelectSession }: SessionManagerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const textColor = isDark ? '#fff' : '#1a1a1a'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {activeSession && (
        <span style={{ fontSize: '12px', color: subText }}>
          Session: <strong style={{ color: textColor }}>{activeSession.session_name}</strong>
          {' '}({activeSession.num_trades} trades)
        </span>
      )}
      <button
        onClick={onNewSession}
        style={{
          padding: '4px 12px', borderRadius: 6,
          border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
          backgroundColor: 'transparent', color: subText,
          fontSize: '11px', fontWeight: 600, cursor: 'pointer',
        }}
      >
        New Session
      </button>
    </div>
  )
}
```


## src/components/gm/SimulationChart.tsx

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface SimulationResult {
  num_simulations: number
  original_grade: number
  mean_grade: number
  median_grade: number
  std_deviation: number
  percentiles: {
    p5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  distribution: Array<{
    grade_bucket: number
    count: number
    percentage: number
  }>
  risk_analysis: {
    downside_risk: number
    upside_potential: number
    variance_band: [number, number]
  }
  key_factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    magnitude: number
    description: string
  }>
}

interface SimulationChartProps {
  tradeId: string
  originalGrade: number
  show: boolean
  onClose: () => void
}

export function SimulationChart({ tradeId, originalGrade, show, onClose }: SimulationChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [volatility, setVolatility] = useState<'low' | 'medium' | 'high'>('medium')
  const [includeInjury, setIncludeInjury] = useState(true)
  const [includeDevelopment, setIncludeDevelopment] = useState(true)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  async function runSimulation() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/gm/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: tradeId,
          original_grade: originalGrade,
          num_simulations: 1000,
          player_volatility: volatility,
          injury_factor: includeInjury,
          development_factor: includeDevelopment,
        }),
      })

      if (!res.ok) throw new Error('Simulation failed')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed')
    } finally {
      setLoading(false)
    }
  }

  // Draw histogram when result changes
  useEffect(() => {
    if (!result || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up for retina
    const dpr = window.devicePixelRatio || 1
    const width = 400
    const height = 200
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Draw histogram
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    const barWidth = chartWidth / result.distribution.length - 4

    const maxPercentage = Math.max(...result.distribution.map(d => d.percentage))

    // Y-axis grid lines
    ctx.strokeStyle = isDark ? '#374151' : '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i) / 4
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    // Draw bars
    result.distribution.forEach((d, i) => {
      const barHeight = (d.percentage / maxPercentage) * chartHeight
      const x = padding.left + i * (barWidth + 4) + 2
      const y = padding.top + chartHeight - barHeight

      // Bar color based on grade
      let color = '#6b7280'
      if (d.grade_bucket >= 70) color = '#22c55e'
      else if (d.grade_bucket >= 50) color = '#eab308'
      else color = '#ef4444'

      ctx.fillStyle = color + '80'
      ctx.fillRect(x, y, barWidth, barHeight)

      // X-axis labels
      ctx.fillStyle = subText
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${d.grade_bucket}`, x + barWidth / 2, height - 8)
    })

    // Y-axis label
    ctx.save()
    ctx.translate(12, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = subText
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('%', 0, 0)
    ctx.restore()

    // Original grade marker
    const origX = padding.left + (originalGrade / 100) * chartWidth
    ctx.strokeStyle = '#bc0000'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(origX, padding.top)
    ctx.lineTo(origX, padding.top + chartHeight)
    ctx.stroke()
    ctx.setLineDash([])

    // Mean marker
    const meanX = padding.left + (result.mean_grade / 100) * chartWidth
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(meanX, padding.top)
    ctx.lineTo(meanX, padding.top + chartHeight)
    ctx.stroke()
  }, [result, isDark, originalGrade, subText])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: textColor, margin: 0 }}>
            Monte Carlo Simulation
          </h3>
          <p style={{ fontSize: '12px', color: subText, margin: '4px 0 0' }}>
            1,000 simulations of possible outcomes
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: subText,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ×
        </button>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: subText, marginBottom: 4 }}>
            Volatility
          </label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['low', 'medium', 'high'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVolatility(v)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: `1px solid ${volatility === v ? '#bc0000' : borderColor}`,
                  backgroundColor: volatility === v ? '#bc000015' : 'transparent',
                  color: volatility === v ? '#bc0000' : subText,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeInjury}
            onChange={e => setIncludeInjury(e.target.checked)}
            style={{ accentColor: '#bc0000' }}
          />
          <span style={{ fontSize: '11px', color: textColor }}>Injury Risk</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeDevelopment}
            onChange={e => setIncludeDevelopment(e.target.checked)}
            style={{ accentColor: '#bc0000' }}
          />
          <span style={{ fontSize: '11px', color: textColor }}>Development</span>
        </label>
      </div>

      {/* Run button */}
      <button
        onClick={runSimulation}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#bc0000',
          color: '#fff',
          fontWeight: 700,
          fontSize: '13px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginBottom: 16,
        }}
      >
        {loading ? 'Running Simulations...' : 'Run Simulation'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#ef444420',
          color: '#ef4444',
          fontSize: '13px',
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Chart */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <canvas
                ref={canvasRef}
                style={{ width: 400, height: 200 }}
              />
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 16, height: 2, backgroundColor: '#bc0000' }} />
                <span style={{ fontSize: '11px', color: subText }}>Original ({originalGrade})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 16, height: 2, backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '11px', color: subText }}>Mean ({result.mean_grade})</span>
              </div>
            </div>

            {/* Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginBottom: 16,
            }}>
              {[
                { label: 'Mean', value: result.mean_grade },
                { label: 'Median', value: result.median_grade },
                { label: 'Std Dev', value: result.std_deviation },
                { label: '90% Range', value: `${result.risk_analysis.variance_band[0]}-${result.risk_analysis.variance_band[1]}` },
              ].map(stat => (
                <div
                  key={stat.label}
                  style={{
                    textAlign: 'center',
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#111827' : '#fff',
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '10px', color: subText }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Risk Analysis */}
            <div style={{
              display: 'flex',
              gap: 12,
              marginBottom: 16,
            }}>
              <div style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#ef444415',
                border: '1px solid #ef444430',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>
                  {result.risk_analysis.downside_risk}%
                </div>
                <div style={{ fontSize: '11px', color: '#ef4444' }}>Downside Risk</div>
                <div style={{ fontSize: '10px', color: subText, marginTop: 2 }}>
                  Chance of grade below 50
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#22c55e15',
                border: '1px solid #22c55e30',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e' }}>
                  {result.risk_analysis.upside_potential}%
                </div>
                <div style={{ fontSize: '11px', color: '#22c55e' }}>Upside Potential</div>
                <div style={{ fontSize: '10px', color: subText, marginTop: 2 }}>
                  Chance of grade 80+
                </div>
              </div>
            </div>

            {/* Key Factors */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                Key Factors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.key_factors.map((factor, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      backgroundColor: isDark ? '#111827' : '#fff',
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      color: factor.impact === 'positive' ? '#22c55e' : factor.impact === 'negative' ? '#ef4444' : '#6b7280',
                    }}>
                      {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>
                        {factor.factor}
                      </div>
                      <div style={{ fontSize: '10px', color: subText }}>
                        {factor.description}
                      </div>
                    </div>
                    <div style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark ? '#374151' : '#e5e7eb',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${factor.magnitude * 100}%`,
                        height: '100%',
                        backgroundColor: factor.impact === 'positive' ? '#22c55e' : factor.impact === 'negative' ? '#ef4444' : '#6b7280',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```


## src/components/gm/SimulationResults.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { SimulationResult, TeamStanding, PlayoffMatchup, SimulatedGame, SeasonSegment, PlayerSimImpact } from '@/types/gm'

interface SimulationResultsProps {
  result: SimulationResult
  tradeCount: number
  teamName: string
  teamColor: string
  onSimulateAgain: () => void
  onClose: () => void
}

type Tab = 'overview' | 'games' | 'standings' | 'playoffs' | 'summary'

function formatGameDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function SimulationResults({
  result,
  tradeCount,
  teamName,
  teamColor,
  onSimulateAgain,
  onClose,
}: SimulationResultsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const surfaceBg = isDark ? '#111827' : '#f9fafb'

  const { baseline, modified, gmScore, scoreBreakdown, standings, playoffs, championship, seasonSummary,
    games, segments, playerImpacts, baselinePowerRating, modifiedPowerRating, previousSeasonRecord } = result
  const winImprovement = modified.wins - baseline.wins
  const isImprovement = winImprovement > 0

  const getGradeLetter = (score: number): string => {
    if (score >= 90) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'A-'
    if (score >= 75) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'B-'
    if (score >= 60) return 'C+'
    if (score >= 55) return 'C'
    if (score >= 50) return 'C-'
    if (score >= 45) return 'D+'
    if (score >= 40) return 'D'
    return 'F'
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    ...(games && games.length > 0 ? [{ id: 'games' as Tab, label: 'Games', icon: '🎮' }] : []),
    { id: 'standings', label: 'Standings', icon: '🏆' },
    { id: 'playoffs', label: 'Playoffs', icon: '🎯' },
    { id: 'summary', label: 'Summary', icon: '📝' },
  ]

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: 900,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 1000,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${borderColor}`,
            position: 'sticky',
            top: 0,
            backgroundColor: cardBg,
            zIndex: 10,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: textColor }}>
              2026 Season Simulation
            </h2>
            <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: subText }}>
              {teamName} • {tradeCount} trade{tradeCount !== 1 ? 's' : ''} executed
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: subText,
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '12px 20px',
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: surfaceBg,
            overflowX: 'auto',
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: activeTab === tab.id ? teamColor : 'transparent',
                color: activeTab === tab.id ? '#fff' : subText,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Before/After Comparison */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: 16,
                    padding: 20,
                    background: surfaceBg,
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: subText, marginBottom: 8, fontWeight: 600 }}>
                      Before Trades
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: textColor, lineHeight: 1 }}>
                      {baseline.wins}-{baseline.losses}
                    </div>
                    <div style={{ fontSize: 12, color: subText, marginTop: 6 }}>
                      {baseline.madePlayoffs ? '✅ Playoffs' : '❌ Missed Playoffs'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: isImprovement ? '#22c55e' : winImprovement < 0 ? '#ef4444' : subText }}>
                    →
                  </div>

                  <div style={{ textAlign: 'center', background: `${teamColor}15`, padding: 16, borderRadius: 10, margin: '-16px -4px -16px 0' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: teamColor, marginBottom: 8, fontWeight: 600 }}>
                      After Trades
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: textColor, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {modified.wins}-{modified.losses}
                      {winImprovement !== 0 && (
                        <span style={{ fontSize: 13, fontWeight: 600, padding: '4px 8px', borderRadius: 6, backgroundColor: isImprovement ? '#22c55e' : '#ef4444', color: '#fff' }}>
                          {winImprovement > 0 ? '+' : ''}{winImprovement}W
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: subText, marginTop: 6 }}>
                      {modified.madePlayoffs ? `✅ #${modified.playoffSeed} Seed` : '❌ Missed Playoffs'}
                    </div>
                  </div>
                </div>

                {/* Power Rating Comparison */}
                {baselinePowerRating != null && modifiedPowerRating != null && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: subText, marginBottom: 4 }}>Power Rating</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: subText }}>{baselinePowerRating}</div>
                    </div>
                    <div style={{ fontSize: 20, color: modifiedPowerRating > baselinePowerRating ? '#22c55e' : modifiedPowerRating < baselinePowerRating ? '#ef4444' : subText }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: teamColor, marginBottom: 4 }}>Modified</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: teamColor }}>{modifiedPowerRating}</div>
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                      backgroundColor: modifiedPowerRating > baselinePowerRating ? '#22c55e20' : modifiedPowerRating < baselinePowerRating ? '#ef444420' : `${borderColor}`,
                      color: modifiedPowerRating > baselinePowerRating ? '#22c55e' : modifiedPowerRating < baselinePowerRating ? '#ef4444' : subText,
                    }}>
                      {modifiedPowerRating > baselinePowerRating ? '+' : ''}{(modifiedPowerRating - baselinePowerRating).toFixed(1)}
                    </div>
                  </div>
                )}

                {/* Player Impacts */}
                {playerImpacts && playerImpacts.length > 0 && (
                  <div style={{
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 10, fontWeight: 600 }}>
                      Player Impact on Power Rating
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {playerImpacts.map((pi: PlayerSimImpact, idx: number) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '6px 10px', borderRadius: 6,
                          backgroundColor: pi.direction === 'added' ? '#22c55e10' : '#ef444410',
                          borderLeft: `3px solid ${pi.direction === 'added' ? '#22c55e' : '#ef4444'}`,
                        }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{pi.playerName}</span>
                            <span style={{ fontSize: 11, color: subText, marginLeft: 8 }}>{pi.position} - {pi.category}</span>
                          </div>
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: pi.powerRatingDelta > 0 ? '#22c55e' : '#ef4444',
                          }}>
                            {pi.powerRatingDelta > 0 ? '+' : ''}{pi.powerRatingDelta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Championship Banner */}
                {playoffs?.userTeamResult?.wonChampionship && championship && (
                  <div style={{
                    background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd)`,
                    color: '#fff',
                    padding: 20,
                    borderRadius: 12,
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>CHAMPIONS!</div>
                    <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
                      {teamName} defeat {championship.runnerUp.teamName} {championship.seriesScore}
                    </div>
                  </div>
                )}

                {/* GM Score */}
                <div style={{
                  background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd)`,
                  color: '#fff',
                  padding: 20,
                  borderRadius: 12,
                  textAlign: 'center',
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9, marginBottom: 4 }}>
                    Your GM Score
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    {gmScore.toFixed(1)}
                    <span style={{ fontSize: 22, fontWeight: 700, padding: '6px 12px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      {getGradeLetter(gmScore)}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: 12, marginTop: 16, textAlign: 'left' }}>
                    {[
                      { label: `Trade quality (${tradeCount} trade${tradeCount !== 1 ? 's' : ''})`, value: scoreBreakdown.tradeQualityScore, max: 30 },
                      { label: `Win improvement (${winImprovement > 0 ? '+' : ''}${scoreBreakdown.winImprovement} wins)`, value: scoreBreakdown.winImprovementScore, max: 30 },
                      { label: 'Playoff achievement', value: scoreBreakdown.playoffBonusScore, max: 20 },
                      { label: 'Championship bonus', value: scoreBreakdown.championshipBonus || 0, max: 15 },
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: idx < 3 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none' }}>
                        <span>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.value.toFixed(1)} / {item.max} pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={onSimulateAgain} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: `2px solid ${borderColor}`, backgroundColor: 'transparent', color: textColor, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    🎲 Simulate Again
                  </button>
                  <button onClick={onClose} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', backgroundColor: teamColor, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    Continue Trading
                  </button>
                </div>
              </motion.div>
            )}

            {/* GAMES TAB */}
            {activeTab === 'games' && games && games.length > 0 && (
              <motion.div
                key="games"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div style={{ fontSize: 13, color: subText, marginBottom: 16, textAlign: 'center' }}>
                  {games.length} games simulated • {modified.wins}-{modified.losses}{modified.otLosses ? `-${modified.otLosses}` : ''} final record
                </div>
                {(() => {
                  const segmentOrder: string[] = []
                  const segmentGames = new Map<string, SimulatedGame[]>()
                  for (const g of games) {
                    if (!segmentGames.has(g.segment)) {
                      segmentOrder.push(g.segment)
                      segmentGames.set(g.segment, [])
                    }
                    segmentGames.get(g.segment)!.push(g)
                  }
                  return segmentOrder.map((seg: string) => {
                    const sg = segmentGames.get(seg)!
                    const segData = segments?.find((s: SeasonSegment) => s.label === seg)
                    return (
                      <div key={seg} style={{ marginBottom: 20 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', backgroundColor: `${teamColor}15`, borderRadius: 8, marginBottom: 8,
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: teamColor }}>{seg}</span>
                          <span style={{ fontSize: 12, color: subText }}>
                            {segData ? `${segData.wins}-${segData.losses}${segData.otLosses ? `-${segData.otLosses}` : ''} (${(segData.winPct * 100).toFixed(0)}%)` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {/* Header */}
                          <div style={{
                            display: 'grid', gridTemplateColumns: '32px 56px 1fr 40px 60px 56px',
                            gap: 6, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: subText, textTransform: 'uppercase',
                          }}>
                            <span>#</span>
                            <span>Date</span>
                            <span>Opponent</span>
                            <span style={{ textAlign: 'center' }}>H/A</span>
                            <span style={{ textAlign: 'center' }}>Score</span>
                            <span style={{ textAlign: 'center' }}>Record</span>
                          </div>
                          {sg.map((g: SimulatedGame) => (
                            <div key={g.gameNumber}>
                              <div style={{
                                display: 'grid', gridTemplateColumns: '32px 56px 1fr 40px 60px 56px',
                                gap: 6, padding: '6px 8px', borderRadius: 6, alignItems: 'center',
                                backgroundColor: g.result === 'W' ? '#22c55e08' : g.result === 'OTL' ? '#eab30808' : '#ef444408',
                                borderLeft: `3px solid ${g.result === 'W' ? '#22c55e' : g.result === 'OTL' ? '#eab308' : '#ef4444'}`,
                              }}>
                                <span style={{ fontSize: 11, color: subText }}>{g.gameNumber}</span>
                                <span style={{ fontSize: 11, color: subText }}>{formatGameDate(g.date)}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                                  <img src={g.opponentLogoUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                  <span style={{ fontSize: 12, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {g.opponentName}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, color: subText, textAlign: 'center' }}>{g.isHome ? 'HOME' : 'AWAY'}</span>
                                <div style={{ textAlign: 'center' }}>
                                  <span style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: g.result === 'W' ? '#22c55e' : g.result === 'OTL' ? '#eab308' : '#ef4444',
                                  }}>
                                    {g.result}{g.isOvertime ? '/OT' : ''} {g.teamScore}-{g.opponentScore}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: textColor, textAlign: 'center' }}>
                                  {g.runningRecord.wins}-{g.runningRecord.losses}{g.runningRecord.otLosses ? `-${g.runningRecord.otLosses}` : ''}
                                </span>
                              </div>
                              {g.highlight && (
                                <div style={{ padding: '2px 8px 4px 40px', fontSize: 11, fontStyle: 'italic', color: subText }}>
                                  {g.highlight}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                })()}
              </motion.div>
            )}

            {/* STANDINGS TAB */}
            {activeTab === 'standings' && standings && (
              <motion.div
                key="standings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { name: standings.conference1Name, teams: standings.conference1 },
                    { name: standings.conference2Name, teams: standings.conference2 },
                  ].map(conf => (
                    <div key={conf.name} style={{ backgroundColor: surfaceBg, borderRadius: 12, padding: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 12, textAlign: 'center' }}>
                        {conf.name}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 48px 48px', gap: 8, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: subText, textTransform: 'uppercase' }}>
                          <span>#</span>
                          <span>Team</span>
                          <span style={{ textAlign: 'center' }}>W-L</span>
                          <span style={{ textAlign: 'center' }}>GB</span>
                        </div>
                        {conf.teams.slice(0, 12).map((team: TeamStanding, idx: number) => (
                          <div
                            key={team.teamKey}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '24px 1fr 48px 48px',
                              gap: 8,
                              padding: '8px',
                              borderRadius: 6,
                              backgroundColor: team.isUserTeam ? `${teamColor}20` : team.isTradePartner ? '#ef444420' : idx < 7 ? (isDark ? '#1f2937' : '#fff') : 'transparent',
                              border: team.isUserTeam ? `2px solid ${teamColor}` : team.isTradePartner ? '2px solid #ef4444' : 'none',
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 600, color: team.playoffSeed ? '#22c55e' : subText }}>
                              {team.conferenceRank}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                              <img
                                src={team.logoUrl}
                                alt=""
                                style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                              <span style={{ fontSize: 12, fontWeight: team.isUserTeam ? 700 : 500, color: team.isUserTeam ? teamColor : textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {team.abbreviation}
                              </span>
                              {team.tradeImpact !== undefined && team.tradeImpact !== 0 && (
                                <span style={{ fontSize: 10, padding: '1px 4px', borderRadius: 4, backgroundColor: team.tradeImpact > 0 ? '#22c55e20' : '#ef444420', color: team.tradeImpact > 0 ? '#22c55e' : '#ef4444' }}>
                                  {team.tradeImpact > 0 ? '+' : ''}{team.tradeImpact}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, color: textColor, textAlign: 'center' }}>
                              {team.wins}-{team.losses}
                            </span>
                            <span style={{ fontSize: 12, color: subText, textAlign: 'center' }}>
                              {team.gamesBack === 0 ? '-' : team.gamesBack.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 10, color: subText, textAlign: 'center' }}>
                        ✅ = Playoff spot • Your team highlighted
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PLAYOFFS TAB */}
            {activeTab === 'playoffs' && playoffs && (
              <motion.div
                key="playoffs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!modified.madePlayoffs ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>😢</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 8 }}>
                      Missed the Playoffs
                    </h3>
                    <p style={{ color: subText, fontSize: 14 }}>
                      {teamName} finished with a {modified.wins}-{modified.losses} record, not enough to make the postseason.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* User team result */}
                    {playoffs.userTeamResult && (
                      <div style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: playoffs.userTeamResult.wonChampionship ? `${teamColor}20` : surfaceBg,
                        border: playoffs.userTeamResult.wonChampionship ? `2px solid ${teamColor}` : `1px solid ${borderColor}`,
                        marginBottom: 20,
                        textAlign: 'center',
                      }}>
                        {playoffs.userTeamResult.wonChampionship ? (
                          <>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: teamColor }}>CHAMPIONS!</div>
                          </>
                        ) : playoffs.userTeamResult.eliminatedRound ? (
                          <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>💔</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>
                              Eliminated in Round {playoffs.userTeamResult.eliminatedRound}
                            </div>
                            <div style={{ fontSize: 13, color: subText, marginTop: 4 }}>
                              Lost to {playoffs.userTeamResult.eliminatedBy}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: 14, color: textColor }}>Playoffs in progress...</div>
                        )}
                      </div>
                    )}

                    {/* Bracket */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {Array.from(new Set(playoffs.bracket.map((m: PlayoffMatchup) => m.round))).map((round: number) => {
                        const roundMatches = playoffs.bracket.filter((m: PlayoffMatchup) => m.round === round)
                        const roundName = roundMatches[0]?.roundName.split(' - ')[0] || `Round ${round}`
                        return (
                          <div key={round}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                              {roundName}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                              {roundMatches.map((match: PlayoffMatchup, idx: number) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: match.userTeamInvolved ? `${teamColor}10` : surfaceBg,
                                    border: match.userTeamInvolved ? `2px solid ${teamColor}` : `1px solid ${borderColor}`,
                                  }}
                                >
                                  {/* Home team */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 0',
                                    borderBottom: `1px solid ${borderColor}`,
                                    opacity: match.winner === 'away' ? 0.5 : 1,
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 10, color: subText, width: 16 }}>({match.homeTeam.seed})</span>
                                      <img src={match.homeTeam.logoUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                      <span style={{ fontSize: 12, fontWeight: match.winner === 'home' ? 700 : 500 }}>
                                        {match.homeTeam.abbreviation}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: match.winner === 'home' ? '#22c55e' : textColor }}>
                                      {match.seriesWins[0]}
                                    </span>
                                  </div>
                                  {/* Away team */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 0',
                                    opacity: match.winner === 'home' ? 0.5 : 1,
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 10, color: subText, width: 16 }}>({match.awayTeam.seed})</span>
                                      <img src={match.awayTeam.logoUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                      <span style={{ fontSize: 12, fontWeight: match.winner === 'away' ? 700 : 500 }}>
                                        {match.awayTeam.abbreviation}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: match.winner === 'away' ? '#22c55e' : textColor }}>
                                      {match.seriesWins[1]}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Championship Result */}
                    {championship && (
                      <div style={{
                        marginTop: 20,
                        padding: 20,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${championship.winner.primaryColor}20, ${championship.winner.primaryColor}40)`,
                        border: `2px solid ${championship.winner.primaryColor}`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: subText, marginBottom: 4 }}>
                          Champion
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                          <img src={championship.winner.logoUrl} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 20, fontWeight: 800, color: championship.winner.primaryColor }}>
                            {championship.winner.teamName}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: subText, marginTop: 8 }}>
                          Defeated {championship.runnerUp.teamName} {championship.seriesScore}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* SUMMARY TAB */}
            {activeTab === 'summary' && seasonSummary && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Previous Season Comparison */}
                {previousSeasonRecord && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                    padding: 14, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: subText, marginBottom: 2 }}>Last Season</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: subText }}>
                        {previousSeasonRecord.wins}-{previousSeasonRecord.losses}{previousSeasonRecord.otLosses ? `-${previousSeasonRecord.otLosses}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, color: subText }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: teamColor, marginBottom: 2 }}>Simulated</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: teamColor }}>
                        {modified.wins}-{modified.losses}{modified.otLosses ? `-${modified.otLosses}` : ''}
                      </div>
                    </div>
                    {winImprovement !== 0 && (
                      <div style={{
                        fontSize: 14, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                        backgroundColor: isImprovement ? '#22c55e20' : '#ef444420',
                        color: isImprovement ? '#22c55e' : '#ef4444',
                      }}>
                        {winImprovement > 0 ? '+' : ''}{winImprovement}W
                      </div>
                    )}
                  </div>
                )}

                {/* Headline */}
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  backgroundColor: surfaceBg,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: textColor, marginBottom: 12, lineHeight: 1.3 }}>
                    {seasonSummary.headline}
                  </h3>
                  <p style={{ fontSize: 14, color: subText, lineHeight: 1.6 }}>
                    {seasonSummary.narrative}
                  </p>
                </div>

                {/* Trade Impact */}
                <div style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `2px solid ${teamColor}`,
                  backgroundColor: `${teamColor}10`,
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: teamColor, marginBottom: 8, fontWeight: 600 }}>
                    Trade Impact
                  </div>
                  <p style={{ fontSize: 14, color: textColor, margin: 0 }}>
                    {seasonSummary.tradeImpactSummary}
                  </p>
                </div>

                {/* Key Moments */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 12 }}>
                    Key Moments
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {seasonSummary.keyMoments.map((moment: string, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          borderRadius: 8,
                          backgroundColor: surfaceBg,
                        }}
                      >
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: teamColor,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: 13, color: textColor }}>{moment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affected Teams */}
                {seasonSummary.affectedTeams.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 12 }}>
                      Trade Partner Outcomes
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {seasonSummary.affectedTeams.map((team: { teamName: string; impact: string }, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 8,
                            backgroundColor: '#ef444410',
                            border: '1px solid #ef444430',
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>
                            {team.teamName}
                          </div>
                          <div style={{ fontSize: 12, color: subText }}>
                            {team.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
```


## src/components/gm/SimulationTrigger.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface SimulationTriggerProps {
  tradeCount: number
  sport: string
  onSimulate: () => Promise<void>
  isSimulating: boolean
  teamColor: string
}

export function SimulationTrigger({
  tradeCount,
  sport,
  onSimulate,
  isSimulating,
  teamColor,
}: SimulationTriggerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Only show if user has made at least 1 trade
  if (tradeCount === 0) return null

  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'

  // Game counts by sport
  const gameCount = sport === 'nfl' ? '17' : sport === 'mlb' ? '162' : sport === 'nba' ? '82' : sport === 'nhl' ? '82' : '82'

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        backgroundColor: cardBg,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🎮</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a' }}>
          Simulate Season
        </span>
        <span
          style={{
            background: teamColor,
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {tradeCount} trade{tradeCount > 1 ? 's' : ''} made
        </span>
      </div>

      <p
        style={{
          fontSize: 14,
          color: subText,
          lineHeight: 1.6,
          margin: 0,
          marginBottom: 16,
        }}
      >
        See how your trades impact the season. We&apos;ll simulate all {gameCount} games
        and show your improved record and GM Score.
      </p>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onSimulate}
        disabled={isSimulating}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 10,
          border: 'none',
          backgroundColor: isSimulating ? (isDark ? '#374151' : '#d1d5db') : teamColor,
          color: isSimulating ? subText : '#fff',
          fontWeight: 700,
          fontSize: 15,
          cursor: isSimulating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {isSimulating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={{
                width: 18,
                height: 18,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
              }}
            />
            Simulating Season...
          </>
        ) : (
          <>
            <span>🏆</span>
            Simulate 2026 Season
          </>
        )}
      </motion.button>
    </div>
  )
}
```


## src/components/gm/StatComparison.tsx

```tsx
'use client'
import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerData } from './PlayerCard'

type ReceivedPlayer = PlayerData | { name: string; position: string }

function isPlayerData(p: ReceivedPlayer): p is PlayerData {
  return 'player_id' in p
}

interface StatComparisonProps {
  playersSent: PlayerData[]
  playersReceived: ReceivedPlayer[]
  sport: string
}

export function StatComparison({ playersSent, playersReceived, sport }: StatComparisonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const textColor = isDark ? '#fff' : '#1a1a1a'

  const sentStats = useMemo(() => {
    if (playersSent.length === 0) return null
    const avgAge = playersSent.reduce((s, p) => s + (p.age || 0), 0) / playersSent.length
    const totalCap = playersSent.reduce((s, p) => s + (p.cap_hit || 0), 0)
    return {
      count: playersSent.length,
      avgAge: +avgAge.toFixed(1),
      positions: playersSent.map(p => p.position).join(', '),
      totalCap,
    }
  }, [playersSent])

  const recvStats = useMemo(() => {
    if (playersReceived.length === 0) return null
    const withData = playersReceived.filter(isPlayerData)
    const avgAge = withData.length > 0
      ? withData.reduce((s, p) => s + (p.age || 0), 0) / withData.length
      : 0
    const totalCap = withData.reduce((s, p) => s + (p.cap_hit || 0), 0)
    return {
      count: playersReceived.length,
      avgAge: +avgAge.toFixed(1),
      totalCap,
      hasData: withData.length > 0,
    }
  }, [playersReceived])

  if (!sentStats || !recvStats) return null

  function formatCap(v: number): string {
    if (v === 0) return '--'
    return `$${(v / 1_000_000).toFixed(1)}M`
  }

  return (
    <div style={{
      padding: 12, borderRadius: 10,
      backgroundColor: isDark ? '#1f293750' : '#f3f4f680',
      border: `1px solid ${isDark ? '#37415150' : '#e5e7eb50'}`,
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Trade Overview
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>{sentStats.count}</div>
          <div style={{ fontSize: '10px', color: subText }}>Sending</div>
        </div>
        <div style={{ fontSize: '16px', color: subText }}>&#x2194;</div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>{recvStats.count}</div>
          <div style={{ fontSize: '10px', color: subText }}>Receiving</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginTop: 10, textAlign: 'center' }}>
        {sentStats.avgAge > 0 && (
          <>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              Avg {sentStats.avgAge}
            </div>
            <div style={{ fontSize: '10px', color: subText }}>Age</div>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              {recvStats.hasData && recvStats.avgAge > 0 ? `Avg ${recvStats.avgAge}` : '--'}
            </div>
          </>
        )}
        {(sentStats.totalCap > 0 || recvStats.totalCap > 0) && (
          <>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              {formatCap(sentStats.totalCap)}
            </div>
            <div style={{ fontSize: '10px', color: subText }}>Cap Hit</div>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              {formatCap(recvStats.totalCap)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```


## src/components/gm/TeamFitOverlay.tsx

```tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { TeamFitRadar, TeamFitBars } from './TeamFitRadar'
import type { PlayerData } from './PlayerCard'

interface TeamFitResult {
  player_name: string
  player_espn_id?: string
  target_team: string
  overall_fit: number
  breakdown: {
    positional_need: number
    age_fit: number
    cap_fit: number
    scheme_fit: number
  }
  insights: {
    positional_need: string
    age_fit: string
    cap_fit: string
    scheme_fit: string
  }
  recommendation: string
  comparable_acquisitions?: Array<{
    player_name: string
    team: string
    fit_score: number
    outcome: 'success' | 'neutral' | 'failure'
  }>
}

interface TeamFitOverlayProps {
  player: PlayerData | null
  targetTeam: string
  targetTeamName: string
  targetTeamColor?: string
  sport: string
  show: boolean
  onClose: () => void
}

export function TeamFitOverlay({
  player,
  targetTeam,
  targetTeamName,
  targetTeamColor = '#bc0000',
  sport,
  show,
  onClose,
}: TeamFitOverlayProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(false)
  const [fitData, setFitData] = useState<TeamFitResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRadar, setShowRadar] = useState(true)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  useEffect(() => {
    if (!show || !player || !targetTeam) {
      setFitData(null)
      setError(null)
      return
    }

    async function fetchFit() {
      if (!player) return
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          target_team: targetTeam,
          sport,
          player_name: player.full_name,
        })
        if (player.espn_id) {
          params.append('player_espn_id', player.espn_id)
        }

        const res = await fetch(`/api/gm/fit?${params}`)
        if (!res.ok) throw new Error('Failed to fetch fit analysis')
        const data = await res.json()
        setFitData(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load fit analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchFit()
  }, [show, player, targetTeam, sport])

  if (!show || !player) return null

  const fitColor = fitData
    ? fitData.overall_fit >= 70 ? '#22c55e'
      : fitData.overall_fit >= 50 ? '#eab308'
      : '#ef4444'
    : '#6b7280'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#111827' : '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>
                Team Fit Analysis
              </h2>
              <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
                {player.full_name} → {targetTeamName}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: subText,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 40,
                  height: 40,
                  border: `3px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderTopColor: targetTeamColor,
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ color: subText, fontSize: '14px' }}>Analyzing fit...</p>
            </div>
          ) : error ? (
            <div style={{
              padding: 20,
              backgroundColor: '#ef444420',
              borderRadius: 10,
              color: '#ef4444',
              fontSize: '14px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          ) : fitData ? (
            <>
              {/* Overall score */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 24,
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? '#1f2937' : '#f9fafb',
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: `4px solid ${fitColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: fitColor }}>
                    {fitData.overall_fit}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                    Overall Fit Score
                  </div>
                  <div style={{ fontSize: '12px', color: fitColor, fontWeight: 600 }}>
                    {fitData.overall_fit >= 70 ? 'Great Fit' : fitData.overall_fit >= 50 ? 'Decent Fit' : 'Poor Fit'}
                  </div>
                </div>
              </div>

              {/* Chart toggle */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setShowRadar(true)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: showRadar ? targetTeamColor : (isDark ? '#374151' : '#e5e7eb'),
                    color: showRadar ? '#fff' : subText,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Radar
                </button>
                <button
                  onClick={() => setShowRadar(false)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: !showRadar ? targetTeamColor : (isDark ? '#374151' : '#e5e7eb'),
                    color: !showRadar ? '#fff' : subText,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Bars
                </button>
              </div>

              {/* Chart */}
              <div style={{ marginBottom: 24 }}>
                {showRadar ? (
                  <TeamFitRadar breakdown={fitData.breakdown} teamColor={targetTeamColor} />
                ) : (
                  <TeamFitBars breakdown={fitData.breakdown} teamColor={targetTeamColor} />
                )}
              </div>

              {/* Insights */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
                  Analysis Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(fitData.insights).map(([key, value]) => {
                    const score = fitData.breakdown[key as keyof typeof fitData.breakdown]
                    const labels: Record<string, string> = {
                      positional_need: 'Positional Need',
                      age_fit: 'Age Fit',
                      cap_fit: 'Cap Fit',
                      scheme_fit: 'Scheme Fit',
                    }
                    return (
                      <div
                        key={key}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: textColor }}>
                            {labels[key] || key}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444',
                          }}>
                            {score}/100
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: subText, margin: 0, lineHeight: 1.5 }}>
                          {value}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendation */}
              <div style={{
                padding: 16,
                borderRadius: 10,
                backgroundColor: `${fitColor}15`,
                border: `1px solid ${fitColor}40`,
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: fitColor, marginBottom: 6, textTransform: 'uppercase' }}>
                  Recommendation
                </div>
                <p style={{ fontSize: '13px', color: textColor, margin: 0, lineHeight: 1.6 }}>
                  {fitData.recommendation}
                </p>
              </div>

              {/* Comparable acquisitions */}
              {fitData.comparable_acquisitions && fitData.comparable_acquisitions.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 10 }}>
                    Similar Acquisitions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {fitData.comparable_acquisitions.map((comp, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 8,
                          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>
                            {comp.player_name}
                          </span>
                          <span style={{ fontSize: '11px', color: subText, marginLeft: 6 }}>
                            → {comp.team}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '11px', color: subText }}>{comp.fit_score}</span>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: 4,
                            backgroundColor: comp.outcome === 'success' ? '#22c55e20' : comp.outcome === 'failure' ? '#ef444420' : '#6b728020',
                            color: comp.outcome === 'success' ? '#22c55e' : comp.outcome === 'failure' ? '#ef4444' : '#6b7280',
                            fontWeight: 600,
                          }}>
                            {comp.outcome}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '12px 24px',
              borderRadius: 10,
              border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              backgroundColor: 'transparent',
              color: textColor,
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
```


## src/components/gm/TeamFitRadar.tsx

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface TeamFitRadarProps {
  breakdown: {
    positional_need: number
    age_fit: number
    cap_fit: number
    scheme_fit: number
  }
  teamColor?: string
  size?: number
}

const LABELS = [
  { key: 'positional_need', label: 'Position Need', angle: -90 },
  { key: 'age_fit', label: 'Age Fit', angle: 0 },
  { key: 'cap_fit', label: 'Cap Fit', angle: 90 },
  { key: 'scheme_fit', label: 'Scheme Fit', angle: 180 },
] as const

export function TeamFitRadar({ breakdown, teamColor = '#bc0000', size = 200 }: TeamFitRadarProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const center = size / 2
  const radius = (size / 2) - 40

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, size, size)

    // Colors
    const gridColor = isDark ? '#374151' : '#e5e7eb'
    const textColor = isDark ? '#9ca3af' : '#6b7280'

    // Draw concentric circles (grid)
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(center, center, (radius * i) / 4, 0, Math.PI * 2)
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw axis lines
    LABELS.forEach(({ angle }) => {
      const radian = (angle * Math.PI) / 180
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.lineTo(
        center + Math.cos(radian) * radius,
        center + Math.sin(radian) * radius
      )
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw data polygon
    ctx.beginPath()
    LABELS.forEach(({ key, angle }, i) => {
      const value = breakdown[key] / 100
      const radian = (angle * Math.PI) / 180
      const x = center + Math.cos(radian) * radius * value
      const y = center + Math.sin(radian) * radius * value

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = `${teamColor}40`
    ctx.fill()
    ctx.strokeStyle = teamColor
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw data points
    LABELS.forEach(({ key, angle }) => {
      const value = breakdown[key] / 100
      const radian = (angle * Math.PI) / 180
      const x = center + Math.cos(radian) * radius * value
      const y = center + Math.sin(radian) * radius * value

      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = teamColor
      ctx.fill()
      ctx.strokeStyle = isDark ? '#1f2937' : '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw labels
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    LABELS.forEach(({ key, label, angle }) => {
      const radian = (angle * Math.PI) / 180
      const labelRadius = radius + 25
      const x = center + Math.cos(radian) * labelRadius
      const y = center + Math.sin(radian) * labelRadius

      ctx.fillText(label, x, y)

      // Value below label
      ctx.font = 'bold 12px system-ui, sans-serif'
      ctx.fillStyle = teamColor
      ctx.fillText(`${breakdown[key]}`, x, y + 14)
      ctx.font = '11px system-ui, sans-serif'
      ctx.fillStyle = textColor
    })
  }, [breakdown, teamColor, isDark, size, center, radius])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
    </motion.div>
  )
}

// Simple bar chart alternative for mobile/accessibility
export function TeamFitBars({ breakdown, teamColor = '#bc0000' }: Omit<TeamFitRadarProps, 'size'>) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {LABELS.map(({ key, label }) => {
        const value = breakdown[key]
        const barColor = value >= 70 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'

        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a' }}>
                {label}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: teamColor }}>
                {value}
              </span>
            </div>
            <div style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
```


## src/components/gm/TeamSelector.tsx

```tsx
'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

const TEAMS = [
  { key: 'bears', label: 'Chicago Bears', sport: 'nfl', color: '#0B162A', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { key: 'bulls', label: 'Chicago Bulls', sport: 'nba', color: '#CE1141', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { key: 'blackhawks', label: 'Chicago Blackhawks', sport: 'nhl', color: '#CF0A2C', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  { key: 'cubs', label: 'Chicago Cubs', sport: 'mlb', color: '#0E3386', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { key: 'whitesox', label: 'Chicago White Sox', sport: 'mlb', color: '#27251F', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
]

interface TeamSelectorProps {
  selected: string
  onSelect: (teamKey: string) => void
}

export function TeamSelector({ selected, onSelect }: TeamSelectorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '4px 0',
      WebkitOverflowScrolling: 'touch',
      scrollSnapType: 'x mandatory',
    }}>
      {TEAMS.map(t => {
        const isSelected = selected === t.key
        return (
          <motion.button
            key={t.key}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(t.key)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: `2px solid ${isSelected ? t.color : (isDark ? '#374151' : '#d1d5db')}`,
              backgroundColor: isSelected ? `${t.color}15` : 'transparent',
              cursor: 'pointer',
              flexShrink: 0,
              scrollSnapAlign: 'start',
              transition: 'background-color 0.2s',
            }}
          >
            <img
              src={t.logo}
              alt={t.label}
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span style={{
              fontWeight: 700,
              fontSize: '14px',
              color: isSelected ? t.color : (isDark ? '#d1d5db' : '#374151'),
            }}>
              {t.label}
            </span>
            {isSelected && (
              <motion.div
                layoutId="team-underline"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '20%',
                  right: '20%',
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: t.color,
                }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export { TEAMS }
```


## src/components/gm/ThreeTeamTradeBoard.tsx

```tsx
'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssetRow } from './AssetRow'
import { ValidationIndicator, ValidationState } from './ValidationIndicator'
import { AuditButton } from './AuditButton'
import { AuditReportCard } from './AuditReportCard'
import { HistoricalContextPanel, SuggestedTradePanel } from './HistoricalContextPanel'
import { GradeProgressButton } from './GradeProgressButton'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, TradeFlow } from '@/types/gm'
import type { PlayerData } from './PlayerCard'
import type { AuditResult } from '@/types/gm-audit'

interface TeamInfo {
  key: string
  name: string
  logo: string | null
  color: string
}

interface ThreeTeamTradeBoardProps {
  team1: TeamInfo  // Chicago team
  team2: TeamInfo  // Opponent 1
  team3: TeamInfo  // Opponent 2
  flows: TradeFlow[]
  onRemoveFromFlow: (fromTeam: string, toTeam: string, type: 'player' | 'pick', id: string | number) => void
  canGrade: boolean
  grading: boolean
  onGrade: () => void
  validation?: ValidationState
  gradeResult?: any
  mobile?: boolean
  onNewTrade?: () => void
  onEditTrade?: () => void
}

export function ThreeTeamTradeBoard({
  team1, team2, team3,
  flows,
  onRemoveFromFlow,
  canGrade, grading, onGrade,
  validation,
  gradeResult,
  mobile = false,
  onNewTrade,
  onEditTrade,
}: ThreeTeamTradeBoardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const panelBg = isDark ? '#111827' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const flowBg = isDark ? '#1f2937' : '#ffffff'
  const teams = [team1, team2, team3]

  // Share state
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const gradeCardRef = useRef<HTMLDivElement>(null)

  // Audit state
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)

  const shareUrl = gradeResult?.shared_code
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/gm/share/${gradeResult.shared_code}`
    : ''

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShowShareOptions(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }, [shareUrl])

  const handleCreateImage = useCallback(async () => {
    if (!gradeCardRef.current || !gradeResult) return
    setGeneratingImage(true)

    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(gradeCardRef.current, {
        quality: 0.95,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      })
      setGeneratedImageUrl(dataUrl)
      setShowShareOptions(true)
    } catch (e) {
      console.error('Failed to generate image', e)
    } finally {
      setGeneratingImage(false)
    }
  }, [gradeResult, isDark])

  const handleDownloadImage = useCallback(() => {
    if (!generatedImageUrl) return
    const link = document.createElement('a')
    link.download = `3-team-trade-grade-${gradeResult?.grade || 0}.png`
    link.href = generatedImageUrl
    link.click()
  }, [generatedImageUrl, gradeResult?.grade])

  // Get flow between two teams
  function getFlow(from: string, to: string): TradeFlow | undefined {
    return flows.find(f => f.from === from && f.to === to)
  }

  // Count assets in a flow
  function countFlowAssets(flow: TradeFlow | undefined): number {
    if (!flow) return 0
    return (flow.players?.length || 0) + (flow.picks?.length || 0)
  }

  // Get what a team is receiving (from all sources)
  function getReceiving(teamKey: string): { from: TeamInfo; flow: TradeFlow }[] {
    return teams
      .filter(t => t.key !== teamKey)
      .map(from => ({ from, flow: getFlow(from.key, teamKey) }))
      .filter(({ flow }) => flow && countFlowAssets(flow) > 0) as { from: TeamInfo; flow: TradeFlow }[]
  }

  // Get what a team is sending (to all destinations)
  function getSending(teamKey: string): { to: TeamInfo; flow: TradeFlow }[] {
    return teams
      .filter(t => t.key !== teamKey)
      .map(to => ({ to, flow: getFlow(teamKey, to.key) }))
      .filter(({ flow }) => flow && countFlowAssets(flow) > 0) as { to: TeamInfo; flow: TradeFlow }[]
  }

  // Render a team card
  function renderTeamCard(team: TeamInfo) {
    const receiving = getReceiving(team.key)
    const sending = getSending(team.key)
    const totalReceiving = receiving.reduce((sum, { flow }) => sum + countFlowAssets(flow), 0)
    const totalSending = sending.reduce((sum, { flow }) => sum + countFlowAssets(flow), 0)

    return (
      <div
        key={team.key}
        style={{
          flex: 1,
          minWidth: mobile ? 'auto' : 0,
          backgroundColor: panelBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
        }}
      >
        {/* Team header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          backgroundColor: `${team.color}15`,
          borderBottom: `2px solid ${team.color}`,
        }}>
          {team.logo && (
            <img
              src={team.logo}
              alt={team.name}
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: team.color }}>
              {team.name}
            </div>
            <div style={{ fontSize: 11, color: subText }}>
              Sends {totalSending} · Gets {totalReceiving}
            </div>
          </div>
        </div>

        {/* Sending section */}
        <div style={{ padding: 12, borderBottom: `1px solid ${borderColor}` }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            SENDS OUT
          </div>

          {sending.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sending.map(({ to, flow }) => (
                <div key={to.key} style={{
                  backgroundColor: flowBg,
                  borderRadius: 8,
                  padding: 10,
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* Destination badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    fontSize: 10,
                    color: subText,
                  }}>
                    <span>To</span>
                    {to.logo && (
                      <img src={to.logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 600, color: to.color }}>{to.name}</span>
                  </div>

                  {/* Assets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <AnimatePresence>
                      {flow.players?.map((p: any) => (
                        <AssetRow
                          key={p.player_id}
                          type="PLAYER"
                          player={p}
                          teamColor={team.color}
                          onRemove={gradeResult ? undefined : () => onRemoveFromFlow(team.key, to.key, 'player', p.player_id)}
                          compact
                        />
                      ))}
                      {flow.picks?.map((pk: DraftPick, i: number) => (
                        <AssetRow
                          key={`pk-${i}`}
                          type="DRAFT_PICK"
                          pick={pk}
                          teamColor={team.color}
                          onRemove={gradeResult ? undefined : () => onRemoveFromFlow(team.key, to.key, 'pick', i)}
                          compact
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: 11,
              color: isDark ? '#4b5563' : '#9ca3af',
            }}>
              Not sending any assets
            </div>
          )}
        </div>

        {/* Receiving section */}
        <div style={{ padding: 12 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#22c55e',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            RECEIVES
          </div>

          {receiving.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {receiving.map(({ from, flow }) => (
                <div key={from.key} style={{
                  backgroundColor: flowBg,
                  borderRadius: 8,
                  padding: 10,
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* Source badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    fontSize: 10,
                    color: subText,
                  }}>
                    <span>From</span>
                    {from.logo && (
                      <img src={from.logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 600, color: from.color }}>{from.name}</span>
                  </div>

                  {/* Assets (read-only, removal handled from sender) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {flow.players?.map((p: any) => (
                      <div
                        key={p.player_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          borderRadius: 6,
                          borderLeft: `3px solid ${from.color}`,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>{p.full_name}</span>
                        <span style={{ fontSize: 10, color: subText }}>{p.position}</span>
                      </div>
                    ))}
                    {flow.picks?.map((pk: DraftPick, i: number) => (
                      <div
                        key={`rpk-${i}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          borderRadius: 6,
                          borderLeft: '3px solid #8b5cf6',
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
                          {pk.year} Round {pk.round}
                        </span>
                        {pk.condition && (
                          <span style={{ fontSize: 10, color: subText }}>{pk.condition}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: 11,
              color: isDark ? '#4b5563' : '#9ca3af',
            }}>
              Not receiving any assets
            </div>
          )}
        </div>
      </div>
    )
  }

  // Total assets in trade
  const totalAssets = flows.reduce((sum, f) => sum + countFlowAssets(f), 0)
  const activeFlows = flows.filter(f => countFlowAssets(f) > 0).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 3-Team Trade Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: '#bc000010',
        borderRadius: 10,
        border: '1px solid #bc000030',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#bc0000',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          3-Team Trade
        </span>
        <span style={{ color: subText, fontSize: 12 }}>
          {totalAssets} assets · {activeFlows} active flows
        </span>
      </div>

      {/* Team Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 12,
      }}>
        {renderTeamCard(team1)}
        {renderTeamCard(team2)}
        {renderTeamCard(team3)}
      </div>

      {/* Flow Diagram (visual summary) */}
      {!mobile && activeFlows > 0 && (
        <div style={{
          backgroundColor: panelBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          padding: 16,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: subText,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 12,
          }}>
            Trade Summary
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {flows.filter(f => countFlowAssets(f) > 0).map((flow, idx) => {
              const from = teams.find(t => t.key === flow.from)
              const to = teams.find(t => t.key === flow.to)
              if (!from || !to) return null

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    backgroundColor: flowBg,
                    borderRadius: 20,
                    border: `1px solid ${borderColor}`,
                    fontSize: 11,
                  }}
                >
                  {from.logo && (
                    <img src={from.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  )}
                  <span style={{ fontWeight: 600, color: from.color }}>{from.name.split(' ').pop()}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {to.logo && (
                    <img src={to.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  )}
                  <span style={{ fontWeight: 600, color: to.color }}>{to.name.split(' ').pop()}</span>
                  <span style={{
                    backgroundColor: '#bc000020',
                    color: '#bc0000',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                  }}>
                    {countFlowAssets(flow)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Validation */}
      {validation && validation.status !== 'idle' && (
        <ValidationIndicator validation={validation} />
      )}

      {/* Grade button */}
      {!gradeResult && (
        <GradeProgressButton
          grading={grading}
          canGrade={canGrade}
          isBlocked={validation?.status === 'invalid'}
          onGrade={onGrade}
          isDark={isDark}
          label="GRADE 3-TEAM TRADE"
          blockedLabel="FIX ISSUES TO GRADE"
        />
      )}

      {/* Grade Result Display */}
      {gradeResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 16 }}
        >
          <div
            ref={gradeCardRef}
            style={{
              padding: 24,
              borderRadius: 16,
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* Grade number and status */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: 64,
                fontWeight: 900,
                color: gradeResult.grade >= 70 ? '#22c55e' : gradeResult.grade >= 50 ? '#eab308' : '#ef4444',
                lineHeight: 1,
              }}>
                {gradeResult.grade}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: '1px',
                  backgroundColor: gradeResult.status === 'accepted' ? '#22c55e20' : '#ef444420',
                  color: gradeResult.status === 'accepted' ? '#22c55e' : '#ef4444',
                }}>
                  {gradeResult.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
                </span>
                {gradeResult.is_dangerous && (
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontWeight: 800,
                    fontSize: 12,
                    backgroundColor: '#eab30820',
                    color: '#eab308',
                  }}>
                    DANGEROUS
                  </span>
                )}
              </div>
            </div>

            {/* Trade summary */}
            {gradeResult.trade_summary && (
              <div style={{
                fontSize: 13,
                color: subText,
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                {gradeResult.trade_summary}
              </div>
            )}

            {/* Improvement score */}
            {typeof gradeResult.improvement_score === 'number' && (
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: 16,
                color: gradeResult.improvement_score > 0 ? '#22c55e' : gradeResult.improvement_score < 0 ? '#ef4444' : subText,
              }}>
                Team Improvement: {gradeResult.improvement_score > 0 ? '+' : ''}{gradeResult.improvement_score}
              </div>
            )}

            {/* Rejection reason box */}
            {gradeResult.status === 'rejected' && (
              <div style={{
                marginBottom: 16,
                padding: 16,
                backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : 'rgba(254, 202, 202, 0.3)',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 20, color: '#ef4444' }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: 0,
                    }}>
                      Why This Trade Was Rejected
                    </h4>
                    <p style={{
                      color: textColor,
                      fontSize: 13,
                      lineHeight: 1.5,
                      margin: '8px 0 0 0',
                    }}>
                      {gradeResult.rejection_reason || `Trade score of ${gradeResult.grade} is below the 70-point acceptance threshold.`}
                    </p>
                    <div style={{
                      marginTop: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                    }}>
                      <span style={{ color: subText }}>Current score:</span>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{gradeResult.grade}</span>
                      <span style={{ color: subText }}>|</span>
                      <span style={{ color: subText }}>Needed:</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>70+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown bars */}
            {gradeResult.breakdown && (
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: 'Talent Balance', value: gradeResult.breakdown.talent_balance },
                  { label: 'Contract Value', value: gradeResult.breakdown.contract_value },
                  { label: 'Team Fit', value: gradeResult.breakdown.team_fit },
                  { label: 'Future Assets', value: gradeResult.breakdown.future_assets },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 8 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      fontWeight: 600,
                      color: subText,
                      marginBottom: 3,
                    }}>
                      <span>{item.label}</span>
                      <span>{Math.round(item.value * 100)}%</span>
                    </div>
                    <div style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark ? '#374151' : '#e5e7eb',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${item.value * 100}%`,
                        borderRadius: 3,
                        backgroundColor: gradeResult.grade >= 70 ? '#22c55e' : gradeResult.grade >= 50 ? '#eab308' : '#ef4444',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cap Analysis */}
            {gradeResult.cap_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
                border: `1px solid ${isDark ? '#334155' : '#bbf7d0'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💰</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Cap Impact
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#e2e8f0' : '#334155',
                  }}>
                    {gradeResult.cap_analysis}
                  </div>
                </div>
              </div>
            )}

            {/* Draft Analysis */}
            {gradeResult.draft_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff',
                border: `1px solid ${isDark ? '#3730a3' : '#c4b5fd'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#a5b4fc' : '#6366f1',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Draft Capital Analysis
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#e2e8f0' : '#334155',
                  }}>
                    {gradeResult.draft_analysis}
                  </div>
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: isDark ? '#111827' : '#f3f4f6',
              fontSize: 13,
              lineHeight: 1.6,
              color: textColor,
              marginBottom: 16,
            }}>
              {gradeResult.reasoning}
            </div>

            {/* Historical Context - supports both enhanced and legacy formats */}
            {(gradeResult.historical_context || (gradeResult.historical_comparisons && gradeResult.historical_comparisons.length > 0)) && (
              <div style={{ marginBottom: 16 }}>
                <HistoricalContextPanel
                  historicalContext={gradeResult.historical_context}
                  historicalComparisons={gradeResult.historical_comparisons}
                  isDark={isDark}
                  isRejected={gradeResult.status === 'rejected' || gradeResult.grade < 70}
                />
              </div>
            )}

            {/* Suggested Trade Improvements - supports both enhanced and legacy formats (for rejected trades) */}
            {gradeResult.grade < 70 && (gradeResult.enhanced_suggested_trade || gradeResult.suggested_trade) && (
              <div style={{ marginBottom: 16 }}>
                <SuggestedTradePanel
                  enhancedSuggestion={gradeResult.enhanced_suggested_trade}
                  legacySuggestion={gradeResult.suggested_trade}
                  isDark={isDark}
                  chicagoTeam={team1.name}
                  opponentTeam={team2.name}
                />
              </div>
            )}

            {/* Audit Report */}
            {auditResult && (
              <AuditReportCard
                audit={auditResult}
                gmGrade={gradeResult.grade}
                isDark={isDark}
              />
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto' }}>
              <button
                onClick={onNewTrade}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#bc0000',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                New Trade
              </button>
              {onEditTrade && (
                <button
                  onClick={onEditTrade}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `2px solid ${borderColor}`,
                    backgroundColor: 'transparent',
                    color: textColor,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
              )}
              {gradeResult.shared_code && !auditResult && (
                <AuditButton
                  tradeId={gradeResult.shared_code}
                  onAuditComplete={setAuditResult}
                  isDark={isDark}
                />
              )}
              {gradeResult.shared_code && (
                <>
                  <button
                    onClick={handleCopyLink}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `2px solid ${copied ? '#22c55e' : borderColor}`,
                      backgroundColor: copied ? '#22c55e10' : 'transparent',
                      color: copied ? '#22c55e' : textColor,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCreateImage}
                    disabled={generatingImage}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `2px solid ${borderColor}`,
                      backgroundColor: generatingImage ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
                      color: textColor,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: generatingImage ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      opacity: generatingImage ? 0.7 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {generatingImage ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                        ...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                          <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Image
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Share Options Panel */}
            <AnimatePresence>
              {showShareOptions && generatedImageUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginTop: 16,
                    padding: 20,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#111827' : '#f3f4f6',
                    border: `1px solid ${borderColor}`,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 4 }}>
                      Share your 3-team trade
                    </div>
                    <div style={{ fontSize: 11, color: subText }}>
                      Download the image to share on social media
                    </div>
                  </div>

                  {/* Generated Image Preview */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: `1px solid ${borderColor}`,
                      marginBottom: 12,
                    }}>
                      <img
                        src={generatedImageUrl}
                        alt="Trade grade"
                        style={{ width: '100%', display: 'block' }}
                      />
                    </div>
                    <button
                      onClick={handleDownloadImage}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: '#bc0000',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Download Image
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {totalAssets === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: subText,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Build Your 3-Team Trade</div>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            Click on players from any team's roster to add them to the trade.
            <br />
            A modal will ask which team should receive each player.
          </div>
        </div>
      )}
    </div>
  )
}
```


## src/components/gm/TradeBoard.tsx

```tsx
'use client'
import { useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlayerData } from './PlayerCard'
import { AssetRow } from './AssetRow'
import { ValidationIndicator, ValidationState } from './ValidationIndicator'
import { DraftPickValueWidget, type DraftPickValue } from './DraftPickValueWidget'
import { VeteranTradeValueWidget, type VeteranTradeValue } from './VeteranTradeValueWidget'
import { FuturePickDiscountWidget, type FuturePickValue } from './FuturePickDiscountWidget'
import { AgingCurveWidget, type AgingCurveData } from './AgingCurveWidget'
import { AuditButton } from './AuditButton'
import { AuditReportCard } from './AuditReportCard'
import { HistoricalContextPanel, SuggestedTradePanel } from './HistoricalContextPanel'
import { DataFreshnessIndicator } from './DataFreshnessIndicator'
import { GradeProgressButton } from './GradeProgressButton'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, HistoricalContext, EnhancedSuggestedTrade, LegacySuggestedTrade, LegacyHistoricalTradeRef, DataFreshness } from '@/types/gm'
import type { AuditResult } from '@/types/gm-audit'

type ReceivedPlayer = PlayerData | { name: string; position: string }

function isPlayerData(p: ReceivedPlayer): p is PlayerData {
  return 'player_id' in p
}

// Legacy interfaces kept for backwards compatibility - types imported from @/types/gm

interface GradeResult {
  grade: number
  reasoning: string
  status: string
  is_dangerous: boolean
  trade_summary?: string
  improvement_score?: number
  shared_code?: string
  breakdown?: {
    talent_balance: number
    contract_value: number
    team_fit: number
    future_assets: number
  }
  cap_analysis?: string
  draft_analysis?: string
  // MLB-specific fields
  service_time_analysis?: string
  arb_projection?: string
  control_timeline?: string
  cbt_impact?: string
  rejection_reason?: string
  // NFL-specific fields
  draftPickValuesSent?: DraftPickValue[]
  draftPickValuesReceived?: DraftPickValue[]
  veteranValueSent?: VeteranTradeValue[]
  veteranValueReceived?: VeteranTradeValue[]
  futurePicksSent?: FuturePickValue[]
  futurePicksReceived?: FuturePickValue[]
  agingCurvesSent?: AgingCurveData[]
  agingCurvesReceived?: AgingCurveData[]
  // Historical context - supports both legacy and enhanced formats
  historical_comparisons?: LegacyHistoricalTradeRef[]
  historical_context?: HistoricalContext | null
  // Suggested trade - supports both legacy and enhanced formats
  suggested_trade?: LegacySuggestedTrade | null
  enhanced_suggested_trade?: EnhancedSuggestedTrade | null
  // Data freshness tracking (Feb 2026)
  data_freshness?: DataFreshness | null
}

interface TradeBoardProps {
  chicagoTeam: string
  chicagoLabel?: string
  chicagoLogo: string
  chicagoColor: string
  opponentName: string
  opponentLogo: string | null
  opponentColor: string
  playersSent: PlayerData[]
  playersReceived: ReceivedPlayer[]
  draftPicksSent: DraftPick[]
  draftPicksReceived: DraftPick[]
  onRemoveSent: (playerId: string) => void
  onRemoveReceived: (index: number) => void
  onRemoveDraftSent: (index: number) => void
  onRemoveDraftReceived: (index: number) => void
  canGrade: boolean
  grading: boolean
  onGrade: () => void
  validation?: ValidationState
  currentStep?: number
  mobile?: boolean
  gradeResult?: GradeResult | null
  onNewTrade?: () => void
  onEditTrade?: () => void
  sport?: 'nfl' | 'nba' | 'nhl' | 'mlb'
  // MLB salary retention & cash considerations
  salaryRetentions?: Record<string, number>
  onSalaryRetentionChange?: (playerId: string, pct: number) => void
  cashSent?: number
  cashReceived?: number
  onCashSentChange?: (amount: number) => void
  onCashReceivedChange?: (amount: number) => void
}

export function TradeBoard({
  chicagoTeam, chicagoLabel, chicagoLogo, chicagoColor,
  opponentName, opponentLogo, opponentColor,
  playersSent, playersReceived,
  draftPicksSent, draftPicksReceived,
  onRemoveSent, onRemoveReceived,
  onRemoveDraftSent, onRemoveDraftReceived,
  canGrade, grading, onGrade,
  validation,
  mobile = false,
  gradeResult,
  onNewTrade,
  onEditTrade,
  sport,
  salaryRetentions,
  onSalaryRetentionChange,
  cashSent,
  cashReceived,
  onCashSentChange,
  onCashReceivedChange,
}: TradeBoardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const panelBg = isDark ? '#111827' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const displayLabel = chicagoLabel || chicagoTeam

  // Share state
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const gradeCardRef = useRef<HTMLDivElement>(null)

  // Audit state
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)

  const shareUrl = gradeResult?.shared_code
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/gm/share/${gradeResult.shared_code}`
    : ''

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShowShareOptions(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }, [shareUrl])

  const handleCreateImage = useCallback(async () => {
    if (!gradeCardRef.current || !gradeResult) return
    setGeneratingImage(true)

    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(gradeCardRef.current, {
        quality: 0.95,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      })
      setGeneratedImageUrl(dataUrl)
      setShowShareOptions(true)
    } catch (e) {
      console.error('Failed to generate image', e)
    } finally {
      setGeneratingImage(false)
    }
  }, [gradeResult, isDark])

  const handleDownloadImage = useCallback(() => {
    if (!generatedImageUrl) return
    const link = document.createElement('a')
    link.download = `trade-grade-${gradeResult?.grade || 0}.png`
    link.href = generatedImageUrl
    link.click()
  }, [generatedImageUrl, gradeResult?.grade])

  const socialShareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my trade grade of ${gradeResult?.grade || 0}! Built with SportsMockery Trade Simulator`)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`My trade got a ${gradeResult?.grade || 0} grade on SportsMockery Trade Simulator`)}`,
  }

  // Check if both sides have assets
  const hasSentAssets = playersSent.length > 0 || draftPicksSent.length > 0
  const hasReceivedAssets = playersReceived.length > 0 || draftPicksReceived.length > 0
  const bothSidesHaveAssets = hasSentAssets && hasReceivedAssets

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Two-panel trade visualization - always show so users can see trade details */}
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 0, alignItems: 'stretch' }}>
        {/* Chicago side */}
        <div style={{
          flex: 1, padding: 16,
          borderRadius: mobile ? '12px 12px 0 0' : '12px 0 0 12px',
          backgroundColor: panelBg, border: `1px solid ${borderColor}`,
          borderRight: mobile ? `1px solid ${borderColor}` : 'none',
          borderBottom: mobile ? 'none' : `1px solid ${borderColor}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <img src={chicagoLogo} alt={displayLabel} style={{ width: 28, height: 28, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: chicagoColor }}>
              {displayLabel} Send
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}>
            <AnimatePresence>
              {playersSent.map(p => (
                <AssetRow
                  key={p.player_id}
                  type="PLAYER"
                  player={p}
                  teamColor={chicagoColor}
                  onRemove={gradeResult ? undefined : () => onRemoveSent(p.player_id)}
                />
              ))}
              {draftPicksSent.map((pk, i) => (
                <AssetRow
                  key={`sp-${i}`}
                  type="DRAFT_PICK"
                  pick={pk}
                  teamColor={chicagoColor}
                  onRemove={gradeResult ? undefined : () => onRemoveDraftSent(i)}
                />
              ))}
            </AnimatePresence>
            {playersSent.length === 0 && draftPicksSent.length === 0 && !gradeResult && (
              <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '12px' }}>
                Select players from roster
              </div>
            )}
          </div>
        </div>

        {/* Center arrows */}
        <div style={{
          display: 'flex', flexDirection: mobile ? 'row' : 'column', alignItems: 'center', justifyContent: 'center',
          padding: mobile ? '8px 0' : '0 8px',
          backgroundColor: isDark ? '#0f172a' : '#e5e7eb',
          borderTop: mobile ? 'none' : `1px solid ${borderColor}`,
          borderBottom: mobile ? 'none' : `1px solid ${borderColor}`,
          borderLeft: mobile ? `1px solid ${borderColor}` : 'none',
          borderRight: mobile ? `1px solid ${borderColor}` : 'none',
        }}>
          <div
            style={{ display: 'flex', flexDirection: mobile ? 'row' : 'column', gap: 4 }}
          >
            {mobile ? (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={opponentColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M12 19V5M19 12l-7-7-7 7" />
                </svg>
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={opponentColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </>
            )}
          </div>
        </div>

        {/* Opponent side */}
        <div style={{
          flex: 1, padding: 16,
          borderRadius: mobile ? '0 0 12px 12px' : '0 12px 12px 0',
          backgroundColor: panelBg, border: `1px solid ${borderColor}`,
          borderLeft: mobile ? `1px solid ${borderColor}` : 'none',
          borderTop: mobile ? 'none' : `1px solid ${borderColor}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {opponentLogo && (
              <img src={opponentLogo} alt={opponentName} style={{ width: 28, height: 28, objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
            <span style={{ fontWeight: 700, fontSize: '14px', color: opponentColor }}>
              {opponentName || 'Select Opponent'} Send
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}>
            <AnimatePresence>
              {playersReceived.map((p, i) => (
                isPlayerData(p) ? (
                  <div key={p.player_id}>
                    <AssetRow
                      type="PLAYER"
                      player={p}
                      teamColor={opponentColor}
                      onRemove={gradeResult ? undefined : () => onRemoveReceived(i)}
                    />
                    {/* MLB Salary Retention Slider */}
                    {sport === 'mlb' && p.cap_hit && !gradeResult && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginLeft: 12, marginTop: 4, marginBottom: 4,
                        padding: '6px 10px', borderRadius: 6,
                        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                        fontSize: 11, color: subText,
                      }}>
                        <span style={{ whiteSpace: 'nowrap' }}>Salary Retention:</span>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          step={5}
                          value={salaryRetentions?.[p.player_id] || 0}
                          onChange={e => onSalaryRetentionChange?.(p.player_id, Number(e.target.value))}
                          style={{ width: 80, cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600, minWidth: 30 }}>
                          {salaryRetentions?.[p.player_id] || 0}%
                        </span>
                        {(salaryRetentions?.[p.player_id] || 0) > 0 && (
                          <span style={{ color: '#22c55e' }}>
                            (${((p.cap_hit * (salaryRetentions?.[p.player_id] || 0)) / 100 / 1_000_000).toFixed(1)}M retained)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    key={`r-${i}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 10,
                      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                      border: `1px solid ${borderColor}`,
                      borderLeft: `3px solid ${opponentColor}`,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: textColor }}>{p.name}</span>
                      <span style={{ fontSize: '11px', color: subText, marginLeft: 6 }}>{p.position}</span>
                    </div>
                    {!gradeResult && (
                      <button
                        onClick={() => onRemoveReceived(i)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#ef4444', fontSize: '16px', fontWeight: 700,
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </motion.div>
                )
              ))}
              {draftPicksReceived.map((pk, i) => (
                <AssetRow
                  key={`rp-${i}`}
                  type="DRAFT_PICK"
                  pick={pk}
                  teamColor={opponentColor}
                  onRemove={gradeResult ? undefined : () => onRemoveDraftReceived(i)}
                />
              ))}
            </AnimatePresence>
            {playersReceived.length === 0 && draftPicksReceived.length === 0 && !gradeResult && (
              <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '12px' }}>
                Add players to receive
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation and Grade section - stable layout with reserved space */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Validation indicator container - always reserve space to prevent layout shift */}
        {!gradeResult && (
          <div style={{ minHeight: bothSidesHaveAssets ? 60 : 0, transition: 'min-height 0.15s ease-out' }}>
            {bothSidesHaveAssets && validation && validation.status !== 'idle' && (
              <ValidationIndicator validation={validation} />
            )}
          </div>
        )}

        {/* MLB Cash Considerations */}
        {sport === 'mlb' && !gradeResult && (
          <div style={{
            display: 'flex', gap: 16, padding: 12, borderRadius: 10,
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f3f4f6',
            fontSize: 12, alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: subText }}>Cash Sent:</span>
              <input
                type="number"
                min={0}
                max={100000}
                step={5000}
                value={cashSent || 0}
                onChange={e => onCashSentChange?.(Math.min(100000, Math.max(0, Number(e.target.value))))}
                style={{
                  width: 90, padding: '4px 8px', borderRadius: 6,
                  backgroundColor: isDark ? '#374151' : '#fff',
                  border: `1px solid ${borderColor}`,
                  color: textColor, fontSize: 12,
                }}
              />
              {(cashSent || 0) > 100000 && <span style={{ color: '#ef4444', fontSize: 10 }}>Max $100K</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: subText }}>Cash Received:</span>
              <input
                type="number"
                min={0}
                max={100000}
                step={5000}
                value={cashReceived || 0}
                onChange={e => onCashReceivedChange?.(Math.min(100000, Math.max(0, Number(e.target.value))))}
                style={{
                  width: 90, padding: '4px 8px', borderRadius: 6,
                  backgroundColor: isDark ? '#374151' : '#fff',
                  border: `1px solid ${borderColor}`,
                  color: textColor, fontSize: 12,
                }}
              />
            </div>
            <span style={{ color: subText, fontSize: 10 }}>(CBA max: $100K)</span>
          </div>
        )}

        {/* Grade button - hide when we have a result */}
        {!gradeResult && (
          <GradeProgressButton
            grading={grading}
            canGrade={canGrade}
            isBlocked={validation?.status === 'invalid'}
            onGrade={onGrade}
            isDark={isDark}
            label="GRADE TRADE"
            blockedLabel="FIX ISSUES TO GRADE"
          />
        )}

        {/* Inline Grade Result */}
        {gradeResult && (
          <div
            ref={gradeCardRef}
            style={{
              padding: 24,
              borderRadius: 16,
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* Grade number and status */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: 64,
                fontWeight: 900,
                color: gradeResult.grade >= 70 ? '#22c55e' : gradeResult.grade >= 50 ? '#eab308' : '#ef4444',
                lineHeight: 1,
              }}>
                {gradeResult.grade}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: '1px',
                  backgroundColor: gradeResult.status === 'accepted' ? '#22c55e20' : '#ef444420',
                  color: gradeResult.status === 'accepted' ? '#22c55e' : '#ef4444',
                }}>
                  {gradeResult.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
                </span>
                {gradeResult.is_dangerous && (
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontWeight: 800,
                    fontSize: 12,
                    backgroundColor: '#eab30820',
                    color: '#eab308',
                  }}>
                    DANGEROUS
                  </span>
                )}
              </div>
            </div>

            {/* Trade summary */}
            {gradeResult.trade_summary && (
              <div style={{
                fontSize: 13,
                color: subText,
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                {gradeResult.trade_summary}
              </div>
            )}

            {/* Data freshness indicator */}
            {gradeResult.data_freshness && (
              <div style={{ marginBottom: 16 }}>
                <DataFreshnessIndicator
                  freshness={gradeResult.data_freshness}
                  isDark={isDark}
                />
              </div>
            )}

            {/* Improvement score */}
            {typeof gradeResult.improvement_score === 'number' && (
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: 16,
                color: gradeResult.improvement_score > 0 ? '#22c55e' : gradeResult.improvement_score < 0 ? '#ef4444' : subText,
              }}>
                Team Improvement: {gradeResult.improvement_score > 0 ? '+' : ''}{gradeResult.improvement_score}
              </div>
            )}

            {/* Rejection reason box */}
            {gradeResult.status === 'rejected' && (
              <div style={{
                marginBottom: 16,
                padding: 16,
                backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : 'rgba(254, 202, 202, 0.3)',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 20, color: '#ef4444' }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: 0,
                    }}>
                      Why This Trade Was Rejected
                    </h4>
                    <p style={{
                      color: textColor,
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 1.5,
                      margin: '8px 0 0 0',
                    }}>
                      {gradeResult.rejection_reason || `Trade score is below the 70-point acceptance threshold.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown bars */}
            {gradeResult.breakdown && (
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: 'Talent Balance', value: gradeResult.breakdown.talent_balance },
                  { label: 'Contract Value', value: gradeResult.breakdown.contract_value },
                  { label: 'Team Fit', value: gradeResult.breakdown.team_fit },
                  { label: 'Future Assets', value: gradeResult.breakdown.future_assets },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 8 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      fontWeight: 600,
                      color: subText,
                      marginBottom: 3,
                    }}>
                      <span>{item.label}</span>
                      <span>{Math.round(item.value * 100)}%</span>
                    </div>
                    <div style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark ? '#374151' : '#e5e7eb',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${item.value * 100}%`,
                        borderRadius: 3,
                        backgroundColor: gradeResult.grade >= 70 ? '#22c55e' : gradeResult.grade >= 50 ? '#eab308' : '#ef4444',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cap Analysis */}
            {gradeResult.cap_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
                border: `1px solid ${isDark ? '#334155' : '#bbf7d0'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💰</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Cap Impact
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#e2e8f0' : '#334155',
                  }}>
                    {gradeResult.cap_analysis}
                  </div>
                </div>
              </div>
            )}

            {/* Draft Analysis */}
            {gradeResult.draft_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff',
                border: `1px solid ${isDark ? '#3730a3' : '#c4b5fd'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#a5b4fc' : '#6366f1',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Draft Capital Analysis
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#e2e8f0' : '#334155',
                  }}>
                    {gradeResult.draft_analysis}
                  </div>
                </div>
              </div>
            )}

            {/* MLB-Specific: Luxury Tax (CBT) Impact */}
            {sport === 'mlb' && gradeResult.cbt_impact && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#422006' : '#fef3c7',
                border: `1px solid ${isDark ? '#92400e' : '#fbbf24'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💰</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#fcd34d' : '#b45309',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Luxury Tax Impact
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#fef3c7' : '#78350f',
                  }}>
                    {gradeResult.cbt_impact}
                  </div>
                </div>
              </div>
            )}

            {/* MLB-Specific: Service Time Analysis */}
            {sport === 'mlb' && gradeResult.service_time_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#172554' : '#dbeafe',
                border: `1px solid ${isDark ? '#1e40af' : '#60a5fa'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⏱️</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#93c5fd' : '#1d4ed8',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Service Time
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#dbeafe' : '#1e3a8a',
                  }}>
                    {gradeResult.service_time_analysis}
                  </div>
                  {gradeResult.arb_projection && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${isDark ? '#1e40af' : '#93c5fd'}`,
                      fontSize: 12,
                      color: isDark ? '#bfdbfe' : '#1e40af',
                    }}>
                      <strong>Arbitration Projection:</strong> {gradeResult.arb_projection}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MLB-Specific: Team Control Timeline */}
            {sport === 'mlb' && gradeResult.control_timeline && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#14532d' : '#dcfce7',
                border: `1px solid ${isDark ? '#166534' : '#4ade80'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📅</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#86efac' : '#166534',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Team Control
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#dcfce7' : '#14532d',
                  }}>
                    {gradeResult.control_timeline}
                  </div>
                </div>
              </div>
            )}

            {/* NFL-Specific: Draft Pick Value Analysis */}
            {sport === 'nfl' && gradeResult.draftPickValuesSent && gradeResult.draftPickValuesSent.length > 0 && (
              <DraftPickValueWidget
                picks={gradeResult.draftPickValuesSent}
                side="sent"
                teamColor={chicagoColor}
              />
            )}

            {sport === 'nfl' && gradeResult.draftPickValuesReceived && gradeResult.draftPickValuesReceived.length > 0 && (
              <DraftPickValueWidget
                picks={gradeResult.draftPickValuesReceived}
                side="received"
                teamColor={opponentColor}
              />
            )}

            {/* NFL-Specific: Veteran Trade Value Breakdown */}
            {sport === 'nfl' && gradeResult.veteranValueSent && gradeResult.veteranValueSent.map((veteran, idx) => (
              <VeteranTradeValueWidget
                key={`vet-sent-${idx}`}
                veteran={veteran}
                teamColor={chicagoColor}
              />
            ))}

            {sport === 'nfl' && gradeResult.veteranValueReceived && gradeResult.veteranValueReceived.map((veteran, idx) => (
              <VeteranTradeValueWidget
                key={`vet-recv-${idx}`}
                veteran={veteran}
                teamColor={opponentColor}
              />
            ))}

            {/* NFL-Specific: Future Pick Discounts */}
            {sport === 'nfl' && gradeResult.futurePicksSent && gradeResult.futurePicksSent.length > 0 && (
              <FuturePickDiscountWidget
                picks={gradeResult.futurePicksSent}
                teamColor={chicagoColor}
              />
            )}

            {sport === 'nfl' && gradeResult.futurePicksReceived && gradeResult.futurePicksReceived.length > 0 && (
              <FuturePickDiscountWidget
                picks={gradeResult.futurePicksReceived}
                teamColor={opponentColor}
              />
            )}

            {/* NFL-Specific: Aging Curves */}
            {sport === 'nfl' && gradeResult.agingCurvesSent && gradeResult.agingCurvesSent.map((curve, idx) => (
              <AgingCurveWidget
                key={`aging-sent-${idx}`}
                data={curve}
                teamColor={chicagoColor}
              />
            ))}

            {sport === 'nfl' && gradeResult.agingCurvesReceived && gradeResult.agingCurvesReceived.map((curve, idx) => (
              <AgingCurveWidget
                key={`aging-recv-${idx}`}
                data={curve}
                teamColor={opponentColor}
              />
            ))}

            {/* Reasoning */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: isDark ? '#111827' : '#f3f4f6',
              fontSize: 13,
              lineHeight: 1.6,
              color: textColor,
              marginBottom: 16,
            }}>
              {gradeResult.reasoning}
            </div>

            {/* Historical Context - supports both enhanced and legacy formats */}
            {(gradeResult.historical_context || (gradeResult.historical_comparisons && gradeResult.historical_comparisons.length > 0)) && (
              <div style={{ marginBottom: 16 }}>
                <HistoricalContextPanel
                  historicalContext={gradeResult.historical_context}
                  historicalComparisons={gradeResult.historical_comparisons}
                  isDark={isDark}
                  isRejected={gradeResult.status === 'rejected' || gradeResult.grade < 70}
                />
              </div>
            )}

            {/* Suggested Trade Improvements - supports both enhanced and legacy formats (for rejected trades) */}
            {gradeResult.grade < 70 && (gradeResult.enhanced_suggested_trade || gradeResult.suggested_trade) && (
              <div style={{ marginBottom: 16 }}>
                <SuggestedTradePanel
                  enhancedSuggestion={gradeResult.enhanced_suggested_trade}
                  legacySuggestion={gradeResult.suggested_trade}
                  isDark={isDark}
                  chicagoTeam={displayLabel}
                  opponentTeam={opponentName}
                />
              </div>
            )}

            {/* Audit Report */}
            {auditResult && (
              <AuditReportCard
                audit={auditResult}
                gmGrade={gradeResult.grade}
                isDark={isDark}
              />
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto' }}>
              <button
                onClick={onNewTrade}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#bc0000',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                New Trade
              </button>
              {onEditTrade && (
                <button
                  onClick={onEditTrade}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `2px solid ${borderColor}`,
                    backgroundColor: 'transparent',
                    color: textColor,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
              )}
              {gradeResult.shared_code && !auditResult && (
                <AuditButton
                  tradeId={gradeResult.shared_code}
                  onAuditComplete={setAuditResult}
                  isDark={isDark}
                />
              )}
              {gradeResult.shared_code && (
                <>
                  <button
                    onClick={handleCopyLink}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `2px solid ${copied ? '#22c55e' : borderColor}`,
                      backgroundColor: copied ? '#22c55e10' : 'transparent',
                      color: copied ? '#22c55e' : textColor,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCreateImage}
                    disabled={generatingImage}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `2px solid ${borderColor}`,
                      backgroundColor: generatingImage ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
                      color: textColor,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: generatingImage ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      opacity: generatingImage ? 0.7 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {generatingImage ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                        ...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                          <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Image
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Share Options Panel */}
            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginTop: 16,
                    padding: 20,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#111827' : '#f3f4f6',
                    border: `1px solid ${borderColor}`,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 4 }}>
                      Share your trade
                    </div>
                    <div style={{ fontSize: 11, color: subText }}>
                      Show off your GM skills on social media
                    </div>
                  </div>

                  {/* Generated Image Preview */}
                  {generatedImageUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: `1px solid ${borderColor}`,
                        marginBottom: 12,
                      }}>
                        <img
                          src={generatedImageUrl}
                          alt="Trade Grade"
                          style={{ width: '100%', display: 'block' }}
                        />
                      </div>
                      <button
                        onClick={handleDownloadImage}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: 8,
                          border: 'none',
                          backgroundColor: '#22c55e',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Download Image
                      </button>
                    </div>
                  )}

                  {/* Social Icons */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    {/* Twitter/X */}
                    <a
                      href={socialShareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a
                      href={socialShareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: '#1877F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    {/* Reddit */}
                    <a
                      href={socialShareLinks.reddit}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: '#FF4500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                      </svg>
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#374151' : '#e5e7eb',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Promo text */}
                  <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: '#bc000010',
                    border: '1px solid #bc000030',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, color: '#bc0000', fontWeight: 600 }}>
                      Build your own trades at SportsMockery.com/gm
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setShowShareOptions(false)}
                    style={{
                      display: 'block',
                      margin: '12px auto 0',
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: subText,
                      fontWeight: 500,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Watermark for image generation */}
            <div style={{
              marginTop: 12,
              textAlign: 'center',
              fontSize: 11,
              color: subText,
              opacity: 0.7,
            }}>
              Built with SportsMockery Trade Simulator
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```


## src/components/gm/TradeHistory.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { ExportModal } from './ExportModal'

interface Trade {
  id: string
  chicago_team: string
  trade_partner: string
  players_sent: { name: string; position: string }[]
  players_received: { name: string; position: string }[]
  grade: number
  grade_reasoning: string
  status: string
  is_dangerous: boolean
  trade_summary?: string
  improvement_score?: number
  talent_balance?: number
  contract_value?: number
  team_fit?: number
  future_assets?: number
  chicago_team_logo?: string
  partner_team_logo?: string
  shared_code?: string
  created_at: string
}

interface TradeHistoryProps {
  trades: Trade[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TradeHistory({ trades, page, totalPages, onPageChange }: TradeHistoryProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? '#1f2937' : '#fff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  if (trades.length === 0) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>Trade History</h2>
        <button
          onClick={() => setShowExportModal(true)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            backgroundColor: 'transparent',
            color: subText,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>📤</span>
          Export All
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {trades.map(t => {
            const isExpanded = expandedId === t.id
            const gradeColor = t.grade >= 70 ? '#22c55e' : t.grade >= 50 ? '#eab308' : '#ef4444'

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardBg,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
              >
                {/* Collapsed header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
                  {/* Team logos */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {t.chicago_team_logo && (
                      <img src={t.chicago_team_logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <span style={{ fontSize: '11px', color: subText }}>&#x2194;</span>
                    {t.partner_team_logo && (
                      <img src={t.partner_team_logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>

                  {/* Players summary */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.players_sent.map(p => p.name).join(', ')} &#x2194; {t.players_received.map(p => p.name).join(', ')}
                    </div>
                    <div style={{ fontSize: '11px', color: subText }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Grade + status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: `${gradeColor}20`, color: gradeColor,
                      fontWeight: 800, fontSize: '14px',
                    }}>
                      {t.grade}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      backgroundColor: t.status === 'accepted' ? '#22c55e15' : '#ef444415',
                      color: t.status === 'accepted' ? '#22c55e' : '#ef4444',
                      textTransform: 'uppercase',
                    }}>
                      {t.status}
                    </span>
                    {t.is_dangerous && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        backgroundColor: '#eab30815', color: '#eab308',
                      }}>
                        !
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', borderTop: `1px solid ${borderColor}` }}
                    >
                      <div style={{ padding: 16 }}>
                        {/* Reasoning */}
                        <div style={{ fontSize: '13px', color: textColor, lineHeight: 1.6, marginBottom: 12 }}>
                          {t.grade_reasoning}
                        </div>

                        {/* Breakdown scores */}
                        {t.talent_balance != null && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                            {[
                              { label: 'Talent', value: t.talent_balance },
                              { label: 'Contract', value: t.contract_value },
                              { label: 'Fit', value: t.team_fit },
                              { label: 'Future', value: t.future_assets },
                            ].map(b => (
                              <div key={b.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: gradeColor }}>
                                  {b.value != null ? Math.round(b.value * 100) : '-'}
                                </div>
                                <div style={{ fontSize: '10px', color: subText }}>{b.label}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Share */}
                        {t.shared_code && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(`${window.location.origin}/gm/share/${t.shared_code}`)
                            }}
                            style={{
                              fontSize: '12px', color: '#3b82f6', background: 'none',
                              border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0,
                            }}
                          >
                            Copy share link
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${borderColor}`,
              backgroundColor: 'transparent', color: textColor, cursor: page > 1 ? 'pointer' : 'not-allowed',
              fontSize: '12px', fontWeight: 600, opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            Prev
          </button>
          <span style={{ padding: '6px 8px', fontSize: '12px', color: subText }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${borderColor}`,
              backgroundColor: 'transparent', color: textColor, cursor: page < totalPages ? 'pointer' : 'not-allowed',
              fontSize: '12px', fontWeight: 600, opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        tradeIds={trades.map(t => t.id)}
      />
    </div>
  )
}
```


## src/components/gm/TradeModePicker.tsx

```tsx
'use client'
import { useTheme } from '@/contexts/ThemeContext'
import type { TradeMode } from '@/types/gm'

interface TradeModePickerProps {
  mode: TradeMode
  onChange: (mode: TradeMode) => void
  disabled?: boolean
}

export function TradeModePicker({ mode, onChange, disabled = false }: TradeModePickerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const bgColor = isDark ? '#1f2937' : '#f3f4f6'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const activeColor = '#bc0000'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: subText,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Trade type:
      </span>
      <div style={{
        display: 'flex',
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}>
        <button
          onClick={() => onChange('2-team')}
          style={{
            padding: '6px 14px',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: mode === '2-team' ? activeColor : bgColor,
            color: mode === '2-team' ? '#fff' : textColor,
            transition: 'all 0.15s',
          }}
        >
          2-Team
        </button>
        <button
          onClick={() => onChange('3-team')}
          style={{
            padding: '6px 14px',
            border: 'none',
            borderLeft: `1px solid ${borderColor}`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: mode === '3-team' ? activeColor : bgColor,
            color: mode === '3-team' ? '#fff' : textColor,
            transition: 'all 0.15s',
          }}
        >
          3-Team
        </button>
      </div>
    </div>
  )
}
```


## src/components/gm/ValidationIndicator.tsx

```tsx
'use client'
import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  player_name?: string
}

export interface ValidationState {
  status: 'idle' | 'validating' | 'valid' | 'warning' | 'invalid'
  issues: ValidationIssue[]
}

interface ValidationIndicatorProps {
  validation: ValidationState
  compact?: boolean
}

export function ValidationIndicator({ validation, compact = false }: ValidationIndicatorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  // Remember the last displayable state to prevent blinking during validation
  const lastDisplayableRef = useRef<ValidationState | null>(null)

  // Update ref when we have a displayable state (not idle or validating)
  useEffect(() => {
    if (validation.status !== 'idle' && validation.status !== 'validating') {
      lastDisplayableRef.current = validation
    }
  }, [validation])

  // Don't show anything while idle (first load)
  // But during 'validating', show the last known state to prevent blinking
  if (validation.status === 'idle') return null

  // Use current validation if displayable, otherwise use last known state
  const displayValidation = (validation.status === 'validating' && lastDisplayableRef.current)
    ? lastDisplayableRef.current
    : validation

  // If still no displayable state, return null
  if (displayValidation.status === 'idle' || displayValidation.status === 'validating') return null

  const statusConfig = {
    valid: { color: '#22c55e', label: 'Ready to grade', bg: '#22c55e15' },
    warning: { color: '#eab308', label: `${displayValidation.issues.length} warning${displayValidation.issues.length !== 1 ? 's' : ''}`, bg: '#eab30815' },
    invalid: { color: '#ef4444', label: `${displayValidation.issues.filter(i => i.severity === 'error').length} issue${displayValidation.issues.filter(i => i.severity === 'error').length !== 1 ? 's' : ''}`, bg: '#ef444415' },
  }

  const config = statusConfig[displayValidation.status as keyof typeof statusConfig]
  if (!config) return null

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 20,
          backgroundColor: config.bg,
          fontSize: '12px',
          fontWeight: 600,
          color: config.color,
        }}
      >
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 10,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: displayValidation.issues.length > 0 ? 10 : 0 }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: config.color }}>
          {displayValidation.status === 'valid' && 'Trade looks good!'}
          {displayValidation.status === 'warning' && `${displayValidation.issues.length} potential issue${displayValidation.issues.length !== 1 ? 's' : ''}`}
          {displayValidation.status === 'invalid' && 'Trade cannot proceed'}
        </span>
      </div>

      {/* Issues list */}
      <AnimatePresence>
        {displayValidation.issues.length > 0 && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {displayValidation.issues.map((issue, i) => (
                <div
                  key={`${issue.code}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: '12px',
                    color: issue.severity === 'error' ? '#ef4444' : issue.severity === 'warning' ? '#eab308' : subText,
                  }}
                >
                  <span>
                    {issue.player_name && <strong>{issue.player_name}: </strong>}
                    {issue.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
```


## src/components/gm/VeteranTradeValueWidget.tsx

```tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface VeteranTradeValue {
  playerName: string
  position: string
  age: number
  performanceLevel: 'elite' | 'pro_bowl' | 'good' | 'average' | 'below_avg'
  contractYearsRemaining: number
  capHit: number

  // Calculated values
  baseValue: number
  ageMultiplier: number
  ageAdjustedValue: number
  contractMultiplier: number
  contractAdjustedValue: number
  capMultiplier?: number
  positionMultiplier?: number
  positionAdjustedValue: number
  finalValue: number
  draftPickEquivalent: string
  draftPickRange?: { low: number; high: number }
}

interface VeteranTradeValueWidgetProps {
  veteran: VeteranTradeValue
  teamColor: string
}

const PERFORMANCE_LABELS: Record<string, { label: string; color: string }> = {
  elite: { label: 'ELITE (Top 5)', color: '#22c55e' },
  pro_bowl: { label: 'PRO BOWL (Top 10-15)', color: '#3b82f6' },
  good: { label: 'GOOD (Top 20-25)', color: '#8b5cf6' },
  average: { label: 'AVERAGE (Top 30-40)', color: '#f59e0b' },
  below_avg: { label: 'BELOW AVERAGE', color: '#ef4444' },
}

export function VeteranTradeValueWidget({ veteran, teamColor }: VeteranTradeValueWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!veteran) return null

  const performanceInfo = PERFORMANCE_LABELS[veteran.performanceLevel] || PERFORMANCE_LABELS.average

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>🏈</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Veteran Trade Value Breakdown
        </h4>
      </div>

      {/* Player Info */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        marginBottom: 12,
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 16,
          color: teamColor,
          marginBottom: 4,
        }}>
          {veteran.playerName} ({veteran.position}, Age {veteran.age})
        </div>
        <div style={{
          display: 'flex',
          gap: 16,
          fontSize: 12,
          color: isDark ? '#94a3b8' : '#64748b',
        }}>
          <span>
            Performance: <span style={{ color: performanceInfo.color, fontWeight: 600 }}>{performanceInfo.label}</span>
          </span>
          <span>
            Contract: {veteran.contractYearsRemaining} year{veteran.contractYearsRemaining !== 1 ? 's' : ''} remaining
          </span>
          {veteran.capHit > 0 && (
            <span>Cap Hit: ${(veteran.capHit / 1_000_000).toFixed(1)}M</span>
          )}
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: isDark ? '#94a3b8' : '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 10,
        }}>
          Value Calculation
        </div>

        {/* Step-by-step breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CalculationRow
            label={`Base Value (${performanceInfo.label.split(' ')[0]} tier)`}
            value={`${veteran.baseValue.toLocaleString()} pts`}
            isDark={isDark}
          />

          <CalculationRow
            label={`× Age Multiplier (${veteran.age})`}
            value={`× ${veteran.ageMultiplier?.toFixed(2) || '1.00'}`}
            isDark={isDark}
            isMultiplier
          />

          <CalculationRow
            label="= Age Adjusted"
            value={`${veteran.ageAdjustedValue?.toLocaleString() || veteran.baseValue.toLocaleString()} pts`}
            isDark={isDark}
            isResult
          />

          <CalculationRow
            label={`× Contract (${veteran.contractYearsRemaining}yr ${veteran.contractYearsRemaining === 1 ? 'rental' : ''})`}
            value={`× ${veteran.contractMultiplier?.toFixed(2) || '1.00'}`}
            isDark={isDark}
            isMultiplier
          />

          <CalculationRow
            label="= Contract Adjusted"
            value={`${veteran.contractAdjustedValue?.toLocaleString() || '—'} pts`}
            isDark={isDark}
            isResult
          />

          {veteran.capMultiplier && veteran.capMultiplier !== 1 && (
            <CalculationRow
              label={`× Cap Discount ($${(veteran.capHit / 1_000_000).toFixed(0)}M)`}
              value={`× ${veteran.capMultiplier.toFixed(2)}`}
              isDark={isDark}
              isMultiplier
            />
          )}

          {veteran.positionMultiplier && veteran.positionMultiplier !== 1 && (
            <CalculationRow
              label={`× Position (${veteran.position})`}
              value={`× ${veteran.positionMultiplier.toFixed(2)}`}
              isDark={isDark}
              isMultiplier
            />
          )}

          {/* Divider */}
          <div style={{
            borderTop: `2px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
            margin: '4px 0',
          }} />

          {/* Final Value */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: 8,
            backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
            border: `2px solid ${isDark ? '#3b82f6' : '#60a5fa'}`,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 800,
              color: isDark ? '#93c5fd' : '#1d4ed8',
            }}>
              FINAL VALUE
            </span>
            <span style={{
              fontSize: 20,
              fontWeight: 800,
              color: isDark ? '#60a5fa' : '#2563eb',
            }}>
              {veteran.finalValue?.toLocaleString() || '—'} pts
            </span>
          </div>
        </div>
      </div>

      {/* Draft Pick Equivalent */}
      <div style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#14532d20' : '#dcfce720',
        border: `1px solid ${isDark ? '#166534' : '#86efac'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: isDark ? '#86efac' : '#166534',
        }}>
          Draft Pick Equivalent
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#15803d',
          }}>
            {veteran.draftPickEquivalent || '—'}
          </div>
          {veteran.draftPickRange && (
            <div style={{
              fontSize: 11,
              color: isDark ? '#86efac' : '#166534',
            }}>
              Pick Range: #{veteran.draftPickRange.low} - #{veteran.draftPickRange.high}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CalculationRow({
  label,
  value,
  isDark,
  isMultiplier = false,
  isResult = false,
}: {
  label: string
  value: string
  isDark: boolean
  isMultiplier?: boolean
  isResult?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: 4,
      backgroundColor: isResult
        ? (isDark ? '#1e293b' : '#f1f5f9')
        : 'transparent',
    }}>
      <span style={{
        fontSize: 12,
        color: isMultiplier
          ? (isDark ? '#f59e0b' : '#d97706')
          : isResult
            ? (isDark ? '#e2e8f0' : '#334155')
            : (isDark ? '#94a3b8' : '#64748b'),
        fontWeight: isResult ? 600 : 400,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: isMultiplier ? 600 : 700,
        color: isMultiplier
          ? (isDark ? '#fbbf24' : '#b45309')
          : (isDark ? '#e2e8f0' : '#334155'),
        fontFamily: 'monospace',
      }}>
        {value}
      </span>
    </div>
  )
}
```


## src/components/gm/WarRoomHeader.tsx

```tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface WarRoomHeaderProps {
  gmScore: number
  rank?: number
  sessionName?: string
  numApproved?: number
  numDangerous?: number
  numFailed?: number
  onOpenPreferences?: () => void
}

export function WarRoomHeader({ gmScore, rank, sessionName, numApproved = 0, numDangerous = 0, numFailed = 0, onOpenPreferences }: WarRoomHeaderProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16, marginBottom: 16,
    }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: textColor, margin: 0, letterSpacing: '-0.5px' }}>
          WAR ROOM
        </h1>
        <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
          {sessionName || 'Propose trades and get them graded by AI'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Analytics link */}
        <Link
          href="/gm/analytics"
          title="View Analytics"
          style={{
            padding: 8,
            borderRadius: 8,
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={subText}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        </Link>

        {/* Preferences button */}
        {onOpenPreferences && (
          <button
            onClick={onOpenPreferences}
            title="GM Preferences"
            style={{
              padding: 8,
              borderRadius: 8,
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={subText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}

        {/* Session stats */}
        {(numApproved > 0 || numDangerous > 0 || numFailed > 0) && (
          <div style={{ display: 'flex', gap: 8 }}>
            <StatChip value={numApproved} label="Approved" color="#22c55e" />
            <StatChip value={numDangerous} label="Dangerous" color="#eab308" />
            <StatChip value={numFailed} label="Failed" color="#ef4444" />
          </div>
        )}

        {/* GM Score */}
        <div style={{
          textAlign: 'center', padding: '8px 20px', borderRadius: 12,
          backgroundColor: isDark ? '#1f293780' : '#f3f4f6',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        }}>
          <motion.div
            key={gmScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{ fontSize: '28px', fontWeight: 900, color: '#bc0000', lineHeight: 1 }}
          >
            {gmScore}
          </motion.div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: subText, marginTop: 2 }}>
            GM Score{rank ? ` | #${rank}` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatChip({ value, label, color }: { value: number; label: string; color: string }) {
  if (value === 0) return null
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '4px 10px', borderRadius: 8,
      backgroundColor: `${color}10`,
    }}>
      <span style={{ fontSize: '16px', fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: '9px', color, fontWeight: 600 }}>{label}</span>
    </div>
  )
}
```


## src/components/gm/WhatIfPanel.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { ScenarioTabs, ScenarioType, ScenarioParameters } from './ScenarioTabs'
import { SimulationChart } from './SimulationChart'

interface ScenarioResult {
  scenario_type: ScenarioType
  description: string
  original_grade: number
  adjusted_grade: number
  grade_delta: number
  reasoning: string
  breakdown_changes?: {
    talent_balance_delta: number
    contract_value_delta: number
    team_fit_delta: number
    future_assets_delta: number
  }
}

interface WhatIfPanelProps {
  tradeId: string
  originalGrade: number
  playersSent: Array<{ name: string; position: string }>
  playersReceived: Array<{ name: string; position: string }>
  sport: string
  show: boolean
  onClose: () => void
}

export function WhatIfPanel({
  tradeId,
  originalGrade,
  playersSent,
  playersReceived,
  sport,
  show,
  onClose,
}: WhatIfPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ScenarioResult[]>([])
  const [activeMode, setActiveMode] = useState<'scenarios' | 'simulate'>('scenarios')

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  async function handleRunScenario(type: ScenarioType, params: ScenarioParameters) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/gm/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: tradeId,
          original_grade: originalGrade,
          scenario_type: type,
          parameters: params,
        }),
      })

      if (!res.ok) throw new Error('Failed to analyze scenario')

      const data = await res.json()
      setResult(data)
      setHistory(prev => [data, ...prev].slice(0, 5))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze scenario')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  const gradeColor = (grade: number) =>
    grade >= 70 ? '#22c55e' : grade >= 50 ? '#eab308' : '#ef4444'

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: textColor, margin: 0 }}>
            What-If Analysis
          </h3>
          <p style={{ fontSize: '12px', color: subText, margin: '4px 0 0' }}>
            Explore scenarios and run simulations
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: subText,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ×
        </button>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setActiveMode('scenarios')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: activeMode === 'scenarios' ? '#bc0000' : (isDark ? '#374151' : '#e5e7eb'),
            color: activeMode === 'scenarios' ? '#fff' : subText,
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Scenarios
        </button>
        <button
          onClick={() => setActiveMode('simulate')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: activeMode === 'simulate' ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
            color: activeMode === 'simulate' ? '#fff' : subText,
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Monte Carlo
        </button>
      </div>

      {/* Scenario tabs */}
      {activeMode === 'scenarios' && (
        <ScenarioTabs
          playersSent={playersSent}
          playersReceived={playersReceived}
          onRunScenario={handleRunScenario}
          loading={loading}
          sport={sport}
        />
      )}

      {/* Monte Carlo Simulation */}
      {activeMode === 'simulate' && (
        <SimulationChart
          tradeId={tradeId}
          originalGrade={originalGrade}
          show={true}
          onClose={() => setActiveMode('scenarios')}
        />
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#ef444420',
          color: '#ef4444',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              backgroundColor: isDark ? '#111827' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            }}
          >
            {/* Grade comparison */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>Original</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: gradeColor(result.original_grade) }}>
                  {result.original_grade}
                </div>
              </div>
              <div style={{ fontSize: '24px', color: subText }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>Adjusted</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: gradeColor(result.adjusted_grade) }}>
                  {result.adjusted_grade}
                </div>
              </div>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: result.grade_delta >= 0 ? '#22c55e20' : '#ef444420',
                color: result.grade_delta >= 0 ? '#22c55e' : '#ef4444',
                fontSize: '18px',
                fontWeight: 800,
              }}>
                {result.grade_delta >= 0 ? '+' : ''}{result.grade_delta}
              </div>
            </div>

            {/* Description */}
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 600,
              color: textColor,
              marginBottom: 12,
            }}>
              {result.description}
            </div>

            {/* Reasoning */}
            <div style={{
              fontSize: '13px',
              color: subText,
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              {result.reasoning}
            </div>

            {/* Breakdown changes */}
            {result.breakdown_changes && (
              <div style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}>
                {[
                  { label: 'Talent', value: result.breakdown_changes.talent_balance_delta },
                  { label: 'Contract', value: result.breakdown_changes.contract_value_delta },
                  { label: 'Fit', value: result.breakdown_changes.team_fit_delta },
                  { label: 'Future', value: result.breakdown_changes.future_assets_delta },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: item.value >= 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '10px', color: subText }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: subText, marginBottom: 8 }}>
            Recent Scenarios
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.slice(1).map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: isDark ? '#111827' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }}
              >
                <span style={{ fontSize: '12px', color: textColor }}>{h.description}</span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: h.grade_delta >= 0 ? '#22c55e' : '#ef4444',
                }}>
                  {h.grade_delta >= 0 ? '+' : ''}{h.grade_delta}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
```

