# GM Trade Simulator - Complete Source Code

## Table of Contents

### Pages
- src/app/gm/page.tsx
- src/app/gm/layout.tsx
- src/app/gm/analytics/page.tsx
- src/app/gm/share/[code]/page.tsx
### API Routes
- src/app/api/gm/grade/route.ts
- src/app/api/gm/roster/route.ts
- src/app/api/gm/teams/route.ts
- src/app/api/gm/trades/route.ts
- src/app/api/gm/cap/route.ts
- src/app/api/gm/fit/route.ts
- src/app/api/gm/validate/route.ts
- src/app/api/gm/sessions/route.ts
- src/app/api/gm/preferences/route.ts
- src/app/api/gm/leaderboard/route.ts
- src/app/api/gm/user-position/route.ts
- src/app/api/gm/user-score/route.ts
- src/app/api/gm/analytics/route.ts
- src/app/api/gm/audit/route.ts
- src/app/api/gm/share/[code]/route.ts
- src/app/api/gm/scenarios/route.ts
- src/app/api/gm/simulate/route.ts
- src/app/api/gm/sim/season/route.ts
- src/app/api/gm/export/route.ts
- src/app/api/gm/prospects/route.ts
- src/app/api/gm/log-error/route.ts
### API Routes (Draft)
- src/app/api/gm/draft/start/route.ts
- src/app/api/gm/draft/pick/route.ts
- src/app/api/gm/draft/grade/route.ts
- src/app/api/gm/draft/prospects/route.ts
- src/app/api/gm/draft/auto/route.ts
- src/app/api/gm/draft/history/route.ts
- src/app/api/gm/draft/eligibility/route.ts
- src/app/api/gm/draft/share/[mockId]/route.ts
### API Routes (v2)
- src/app/api/v2/gm/grade/route.ts
- src/app/api/v2/gm/audit/route.ts
- src/app/api/v2/gm/validate-salary/route.ts
### Components
- src/components/gm/AgingCurveWidget.tsx
- src/components/gm/AnalyticsDashboard.tsx
- src/components/gm/AssetRow.tsx
- src/components/gm/AuditButton.tsx
- src/components/gm/AuditReportCard.tsx
- src/components/gm/DataFreshnessIndicator.tsx
- src/components/gm/DestinationPicker.tsx
- src/components/gm/DraftPickList.tsx
- src/components/gm/DraftPickSelector.tsx
- src/components/gm/DraftPickValueWidget.tsx
- src/components/gm/ExportModal.tsx
- src/components/gm/FuturePickDiscountWidget.tsx
- src/components/gm/GradeProgressButton.tsx
- src/components/gm/GradeReveal.tsx
- src/components/gm/HistoricalContextPanel.tsx
- src/components/gm/LeaderboardPanel.tsx
- src/components/gm/OpponentRosterPanel.tsx
- src/components/gm/OpponentTeamPicker.tsx
- src/components/gm/PlayerCard.tsx
- src/components/gm/PlayerTrendBadge.tsx
- src/components/gm/PreferencesModal.tsx
- src/components/gm/ProspectCard.tsx
- src/components/gm/RosterPanel.tsx
- src/components/gm/ScenarioTabs.tsx
- src/components/gm/SessionManager.tsx
- src/components/gm/SimulationChart.tsx
- src/components/gm/SimulationResults.tsx
- src/components/gm/SimulationTrigger.tsx
- src/components/gm/StatComparison.tsx
- src/components/gm/TeamFitOverlay.tsx
- src/components/gm/TeamFitRadar.tsx
- src/components/gm/TeamSelector.tsx
- src/components/gm/ThreeTeamTradeBoard.tsx
- src/components/gm/TradeBoard.tsx
- src/components/gm/TradeHistory.tsx
- src/components/gm/TradeModePicker.tsx
- src/components/gm/ValidationIndicator.tsx
- src/components/gm/VeteranTradeValueWidget.tsx
- src/components/gm/WarRoomHeader.tsx
- src/components/gm/WhatIfPanel.tsx
### Libs & Types
- src/lib/gm-auth.ts
- src/lib/gm-constants.ts
- src/types/gm.ts
- src/types/gm-audit.ts

---

## Pages

### src/app/gm/page.tsx

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
  // This useEffect ensures the migration happens AFTER state updates are committed
  useEffect(() => {
    if (tradeMode !== '3-team' || !opponentTeam || !selectedTeam) return

    // Check if we have 2-team selections but empty flows
    const has2TeamSelections = selectedPlayerIds.size > 0 || draftPicksSent.length > 0 ||
                               selectedOpponentIds.size > 0 || draftPicksReceived.length > 0
    const hasExistingFlows = tradeFlows.length > 0

    // Only migrate if we have 2-team selections but no flows yet
    if (has2TeamSelections && !hasExistingFlows) {
      const newFlows: TradeFlow[] = []

      // Chicago players going to opponent
      const chicagoPlayers = roster.filter(p => selectedPlayerIds.has(p.player_id))
      if (chicagoPlayers.length > 0 || draftPicksSent.length > 0) {
        newFlows.push({
          from: selectedTeam,
          to: opponentTeam.team_key,
          players: chicagoPlayers,
          picks: [...draftPicksSent], // Clone to avoid reference issues
        })
      }

      // Opponent players going to Chicago
      const opponentPlayers = opponentRoster.filter(p => selectedOpponentIds.has(p.player_id))
      if (opponentPlayers.length > 0 || draftPicksReceived.length > 0) {
        newFlows.push({
          from: opponentTeam.team_key,
          to: selectedTeam,
          players: opponentPlayers,
          picks: [...draftPicksReceived], // Clone to avoid reference issues
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

  // Fetch analytics for accurate GM score (total across all trades, not just first page)
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
      // Removing - just remove from selection and flows
      setSelectedPlayerIds(prev => {
        const next = new Set(prev)
        next.delete(playerId)
        return next
      })
      // Remove from any trade flows
      if (tradeMode === '3-team') {
        setTradeFlows(prev => prev.map(f =>
          f.from === selectedTeam
            ? { ...f, players: f.players.filter((p: any) => p.player_id !== playerId) }
            : f
        ).filter(f => f.players.length > 0 || f.picks.length > 0))
      }
    } else {
      // Adding
      if (tradeMode === '3-team' && opponentTeam && thirdTeam) {
        // Show destination picker
        const player = roster.find(p => p.player_id === playerId)
        if (player) {
          setPendingPlayer({ player, fromTeamKey: selectedTeam })
          setShowDestinationPicker(true)
        }
      } else {
        // 2-team mode - just add to selection
        setSelectedPlayerIds(prev => new Set([...prev, playerId]))
      }
    }
  }

  function toggleOpponentPlayer(playerId: string, playerData?: PlayerData) {
    const isSelected = selectedOpponentIds.has(playerId)

    if (isSelected) {
      // Removing
      setSelectedOpponentIds(prev => {
        const next = new Set(prev)
        next.delete(playerId)
        return next
      })
      setReceivedPlayers(rp => rp.filter(p => !('player_id' in p) || p.player_id !== playerId))
      // Remove from any trade flows
      if (tradeMode === '3-team') {
        setTradeFlows(prev => prev.map(f =>
          f.from === opponentTeam?.team_key
            ? { ...f, players: f.players.filter((p: any) => p.player_id !== playerId) }
            : f
        ).filter(f => f.players.length > 0 || f.picks.length > 0))
      }
    } else {
      // Adding - use passed player data directly, fall back to roster lookup
      const player = playerData || opponentRoster.find(p => p.player_id === playerId)
      if (tradeMode === '3-team' && thirdTeam && opponentTeam) {
        // Show destination picker - player can go to Chicago or Team 3
        if (player) {
          setPendingPlayer({ player, fromTeamKey: opponentTeam.team_key })
          setShowDestinationPicker(true)
        }
      } else {
        // 2-team mode - player goes to Chicago
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
      // Removing
      setSelectedThirdTeamIds(prev => {
        const next = new Set(prev)
        next.delete(playerId)
        return next
      })
      // Remove from any trade flows
      setTradeFlows(prev => prev.map(f =>
        f.from === thirdTeam?.team_key
          ? { ...f, players: f.players.filter((p: any) => p.player_id !== playerId) }
          : f
      ).filter(f => f.players.length > 0 || f.picks.length > 0))
    } else {
      // Adding - show destination picker (can go to Chicago or Team 2)
      // Use the passed player data directly, fall back to roster lookup
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

  // Handle player selection with destination (for 3-team trades)
  function handlePlayerWithDestination(player: PlayerData, fromTeamKey: string) {
    if (tradeMode === '2-team') {
      // In 2-team mode, directly add to appropriate list
      if (fromTeamKey === selectedTeam) {
        togglePlayer(player.player_id)
      } else {
        toggleOpponentPlayer(player.player_id)
      }
    } else {
      // In 3-team mode, show destination picker
      setPendingPlayer({ player, fromTeamKey })
      setShowDestinationPicker(true)
    }
  }

  // Complete the destination selection
  function handleDestinationSelect(toTeamKey: string) {
    if (pendingPlayer) {
      const { player, fromTeamKey } = pendingPlayer

      // Add to trade flows
      setTradeFlows(prev => {
        const existingFlow = prev.find(f => f.from === fromTeamKey && f.to === toTeamKey)
        if (existingFlow) {
          // Add player to existing flow
          return prev.map(f =>
            f.from === fromTeamKey && f.to === toTeamKey
              ? { ...f, players: [...f.players, player as any] }
              : f
          )
        } else {
          // Create new flow
          return [...prev, { from: fromTeamKey, to: toTeamKey, players: [player as any], picks: [] }]
        }
      })

      // Also track in the original selection sets for backward compatibility
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

      // Add to trade flows
      setTradeFlows(prev => {
        const existingFlow = prev.find(f => f.from === fromTeamKey && f.to === toTeamKey)
        if (existingFlow) {
          // Add pick to existing flow
          return prev.map(f =>
            f.from === fromTeamKey && f.to === toTeamKey
              ? { ...f, picks: [...f.picks, pick] }
              : f
          )
        } else {
          // Create new flow
          return [...prev, { from: fromTeamKey, to: toTeamKey, players: [], picks: [pick] }]
        }
      })

      // Also track in the original selection sets for backward compatibility
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

  // Handle adding a draft pick - shows destination picker in 3-team mode
  function handleAddDraftPick(pick: DraftPick, fromTeamKey: string, target: 'sent' | 'received' | 'team3') {
    console.log('[handleAddDraftPick] called with:', { pick, fromTeamKey, target, tradeMode, hasOpponent: !!opponentTeam, hasThirdTeam: !!thirdTeam })
    if (tradeMode === '3-team' && opponentTeam && thirdTeam) {
      // Show destination picker
      console.log('[handleAddDraftPick] 3-team mode - showing destination picker')
      setPendingPick({ pick, fromTeamKey })
      setShowDestinationPicker(true)
    } else {
      // 2-team mode - add directly based on explicit target
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

  // Get teams for destination picker based on current trade
  function getTeamsForPicker() {
    const teams: { key: string; name: string; logo: string | null; color: string }[] = []

    // Chicago team
    const chicagoConfig = TEAMS.find(t => t.key === selectedTeam)
    if (chicagoConfig) {
      teams.push({
        key: selectedTeam,
        name: chicagoConfig.label,
        logo: chicagoConfig.logo,
        color: chicagoConfig.color,
      })
    }

    // Team 2 (opponent)
    if (opponentTeam) {
      teams.push({
        key: opponentTeam.team_key,
        name: opponentTeam.team_name,
        logo: opponentTeam.logo_url,
        color: opponentTeam.primary_color,
      })
    }

    // Team 3 (third team)
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

  // Get flows for display in TradeBoard
  function getFlowsForTeam(teamKey: string, direction: 'sending' | 'receiving') {
    if (direction === 'sending') {
      return tradeFlows.filter(f => f.from === teamKey)
    }
    return tradeFlows.filter(f => f.to === teamKey)
  }

  // Remove an asset from a specific flow (for 3-team trades)
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

    // Also remove from selection sets
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

  // For 3-team trades, check if there are assets in the flows
  const threeTeamHasAssets = tradeFlows.some(f => f.players.length > 0 || f.picks.length > 0)
  const canGrade3Team = tradeMode === '3-team' && opponentTeam !== null && thirdTeam !== null && threeTeamHasAssets

  const canGrade = tradeMode === '2-team'
    ? (hasSomethingToSend && opponentTeam !== null && hasSomethingToReceive)
    : canGrade3Team

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

        // Team keys for mapping flows
        const chicagoKey = selectedTeam
        const partner1Key = opponentTeam!.team_key
        const partner2Key = thirdTeam.team_key

        // Helper to format asset as string for three_team_details
        const formatAsset = (player?: { full_name: string }, pick?: DraftPick, prospect?: MLBProspect): string => {
          if (player) return player.full_name
          if (prospect) return `${prospect.name} (PROSPECT)`
          if (pick) return `${pick.year} R${pick.round}${pick.pickNumber ? ` #${pick.pickNumber}` : ''}`
          return ''
        }

        // Initialize three_team_details arrays
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

        // Map flows to three_team_details
        for (const flow of tradeFlows) {
          const assets: string[] = []

          // Collect all assets in this flow
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

          // Determine which array to populate based on from/to
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
        // 2-Team Trade format (original)
        // Build players_sent: regular players + prospects with flags
        const playersSentArray = [
          // Regular players
          ...selectedPlayers.map(p => ({
            name: p.full_name, position: p.position, stat_line: p.stat_line,
            age: p.age, jersey_number: p.jersey_number, headshot_url: p.headshot_url,
            college: p.college, weight_lbs: p.weight_lbs, years_exp: p.years_exp,
            draft_info: p.draft_info, espn_id: p.espn_id, stats: p.stats,
            cap_hit: p.cap_hit, contract_years: p.contract_years,
          })),
          // Prospects with required flags (per Datalab API spec)
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

        // Build players_received: regular players + opponent prospects with flags
        const playersReceivedArray = [
          // Regular players
          ...receivedPlayers.map(p => {
            if ('player_id' in p) {
              return {
                name: p.full_name, position: p.position, stat_line: p.stat_line,
                age: p.age, jersey_number: p.jersey_number, headshot_url: p.headshot_url,
                college: p.college, weight_lbs: p.weight_lbs, years_exp: p.years_exp,
                draft_info: p.draft_info, espn_id: p.espn_id, stats: p.stats,
                cap_hit: p.cap_hit, contract_years: p.contract_years,
                // MLB salary retention
                salary_retention_pct: sport === 'mlb' ? (salaryRetentions[p.player_id] || 0) : undefined,
              }
            }
            return p
          }),
          // Opponent prospects with required flags (per Datalab API spec)
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
          // MLB salary retention & cash considerations
          salary_retentions: sport === 'mlb' ? salaryRetentions : undefined,
          cash_sent: sport === 'mlb' ? cashSent : undefined,
          cash_received: sport === 'mlb' ? cashReceived : undefined,
        }
      }

      console.log('[gradeTrade] Sending request:', requestBody)

      // Try v2 API first (has historical comparisons & suggested trades)
      let res = await fetch('/api/v2/gm/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      console.log('[gradeTrade] v2 Response status:', res.status)

      // Fallback to v1 if v2 fails
      if (!res.ok) {
        const v2Data = await res.json().catch(() => ({}))
        // Fall back on: fallback_to_legacy flag, 503, 401 (unauthorized), or any 4xx/5xx
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
    // Reset MLB salary retention & cash
    setSalaryRetentions({})
    setCashSent(0)
    setCashReceived(0)
    // Reset 3-team trade state
    setTradeFlows([])
    setSelectedThirdTeamIds(new Set())
    setDraftPicksTeam3Sent([])
    setDraftPicksTeam3Received([])
    setSelectedThirdTeamProspectIds(new Set())
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
                      setTradeFlows([])
                    }
                    // Note: Migration to 3-team mode is handled by useEffect
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
                  onAddDraftPick={pk => handleAddDraftPick(pk, selectedTeam, 'sent')}
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
                {tradeMode === '3-team' && opponentTeam && thirdTeam ? (
                  <ThreeTeamTradeBoard
                    team1={{
                      key: selectedTeam,
                      name: teamLabel,
                      logo: currentTeamConfig?.logo || null,
                      color: teamColor,
                    }}
                    team2={{
                      key: opponentTeam.team_key,
                      name: opponentTeam.team_name,
                      logo: opponentTeam.logo_url,
                      color: opponentTeam.primary_color,
                    }}
                    team3={{
                      key: thirdTeam.team_key,
                      name: thirdTeam.team_name,
                      logo: thirdTeam.logo_url,
                      color: thirdTeam.primary_color,
                    }}
                    flows={tradeFlows}
                    onRemoveFromFlow={handleRemoveFromFlow}
                    canGrade={canGrade}
                    grading={grading}
                    onGrade={gradeTrade}
                    validation={validation}
                    gradeResult={gradeResult}
                    onNewTrade={resetTrade}
                    onEditTrade={editTrade}
                  />
                ) : (
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
                    salaryRetentions={salaryRetentions}
                    onSalaryRetentionChange={handleSalaryRetentionChange}
                    cashSent={cashSent}
                    cashReceived={cashReceived}
                    onCashSentChange={setCashSent}
                    onCashReceivedChange={setCashReceived}
                  />
                )}

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

              {/* RIGHT: Opponent Roster(s) */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxHeight: 'calc(100vh - 160px)',
                position: 'sticky',
                top: 140,
                overflow: 'auto',
              }}>
                {/* Team 2: Opponent */}
                <div style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: tradeMode === '3-team' ? 280 : 500,
                  maxHeight: tradeMode === '3-team' ? 'calc(50vh - 100px)' : 'none',
                  overflow: 'auto',
                }}>
                  {/* Opponent header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${borderColor}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#fff',
                        backgroundColor: '#3b82f6', padding: '2px 6px', borderRadius: 4,
                      }}>
                        TEAM 2
                      </span>
                      {opponentTeam ? (
                        <>
                          <img src={opponentTeam.logo_url} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontWeight: 700, fontSize: 13, color: opponentTeam.primary_color }}>{opponentTeam.team_name}</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: subText }}>Select opponent</span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowOpponentPicker(true)}
                      style={{
                        padding: '5px 10px', borderRadius: 6,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: 'transparent',
                        color: subText, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {opponentTeam ? 'Change' : 'Select'}
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
                      onAddDraftPick={pk => handleAddDraftPick(pk, opponentTeam?.team_key || '', 'received')}
                      onRemoveDraftPick={i => setDraftPicksReceived(prev => prev.filter((_, idx) => idx !== i))}
                      selectedProspectIds={selectedOpponentProspectIds}
                      onToggleProspect={toggleOpponentProspect}
                      onProspectsLoaded={setOpponentProspects}
                    />
                  ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: subText, padding: 20 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Select a Trade Partner</div>
                      <div style={{ fontSize: 11, textAlign: 'center' }}>Click "Select" above</div>
                    </div>
                  )}
                </div>

                {/* Team 3: Third Team (only in 3-team mode) */}
                {tradeMode === '3-team' && (
                  <div style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 280,
                    maxHeight: 'calc(50vh - 100px)',
                    overflow: 'auto',
                  }}>
                    {/* Third team header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${borderColor}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: '#fff',
                          backgroundColor: '#8b5cf6', padding: '2px 6px', borderRadius: 4,
                        }}>
                          TEAM 3
                        </span>
                        {thirdTeam ? (
                          <>
                            <img src={thirdTeam.logo_url} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            <span style={{ fontWeight: 700, fontSize: 13, color: thirdTeam.primary_color }}>{thirdTeam.team_name}</span>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: subText }}>Select third team</span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowThirdTeamPicker(true)}
                        style={{
                          padding: '5px 10px', borderRadius: 6,
                          border: `1px solid ${borderColor}`,
                          backgroundColor: 'transparent',
                          color: subText, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {thirdTeam ? 'Change' : 'Select'}
                      </button>
                    </div>

                    {thirdTeam ? (
                      <OpponentRosterPanel
                        teamKey={thirdTeam.team_key}
                        sport={thirdTeam.sport}
                        teamColor={thirdTeam.primary_color || '#666'}
                        teamName={thirdTeam.team_name}
                        selectedIds={selectedThirdTeamIds}
                        onToggle={toggleThirdTeamPlayer}
                        roster={thirdTeamRoster}
                        setRoster={setThirdTeamRoster}
                        loading={thirdTeamLoading}
                        setLoading={setThirdTeamLoading}
                        onAddCustomPlayer={() => {}}
                        onViewFit={handleViewFit}
                        draftPicks={draftPicksTeam3Received}
                        onAddDraftPick={pk => handleAddDraftPick(pk, thirdTeam?.team_key || '', 'team3')}
                        onRemoveDraftPick={i => setDraftPicksTeam3Received(prev => prev.filter((_, idx) => idx !== i))}
                        selectedProspectIds={selectedThirdTeamProspectIds}
                        onToggleProspect={toggleThirdTeamProspect}
                        onProspectsLoaded={setThirdTeamProspects}
                      />
                    ) : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: subText, padding: 20 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Add Third Team</div>
                        <div style={{ fontSize: 11, textAlign: 'center' }}>Click "Select" to add a third team</div>
                      </div>
                    )}
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
                {tradeMode === '3-team' && opponentTeam && thirdTeam ? (
                  <ThreeTeamTradeBoard
                    team1={{
                      key: selectedTeam,
                      name: teamLabel,
                      logo: currentTeamConfig?.logo || null,
                      color: teamColor,
                    }}
                    team2={{
                      key: opponentTeam.team_key,
                      name: opponentTeam.team_name,
                      logo: opponentTeam.logo_url,
                      color: opponentTeam.primary_color,
                    }}
                    team3={{
                      key: thirdTeam.team_key,
                      name: thirdTeam.team_name,
                      logo: thirdTeam.logo_url,
                      color: thirdTeam.primary_color,
                    }}
                    flows={tradeFlows}
                    onRemoveFromFlow={handleRemoveFromFlow}
                    canGrade={canGrade}
                    grading={grading}
                    onGrade={gradeTrade}
                    validation={validation}
                    gradeResult={gradeResult}
                    onNewTrade={resetTrade}
                    onEditTrade={editTrade}
                    mobile
                  />
                ) : (
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
                    salaryRetentions={salaryRetentions}
                    onSalaryRetentionChange={handleSalaryRetentionChange}
                    cashSent={cashSent}
                    cashReceived={cashReceived}
                    onCashSentChange={setCashSent}
                    onCashReceivedChange={setCashReceived}
                  />
                )}

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
                          onAddDraftPick={pk => handleAddDraftPick(pk, selectedTeam, 'sent')}
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
                          onAddDraftPick={pk => handleAddDraftPick(pk, opponentTeam?.team_key || '', 'received')}
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

      {/* Third Team Picker (3-team trades) */}
      <OpponentTeamPicker
        open={showThirdTeamPicker}
        onClose={() => setShowThirdTeamPicker(false)}
        onSelect={handleThirdTeamSelect}
        sport={sport}
        chicagoTeam={selectedTeam}
        excludeTeam={opponentTeam?.team_key}
      />

      {/* Destination Picker for Players (3-team trades) */}
      {pendingPlayer && (
        <DestinationPicker
          open={showDestinationPicker}
          onClose={() => {
            setShowDestinationPicker(false)
            setPendingPlayer(null)
          }}
          onSelect={handleDestinationSelect}
          fromTeam={{
            key: pendingPlayer.fromTeamKey,
            name: pendingPlayer.fromTeamKey === selectedTeam
              ? (TEAMS.find(t => t.key === selectedTeam)?.label || selectedTeam)
              : pendingPlayer.fromTeamKey === opponentTeam?.team_key
                ? opponentTeam?.team_name || ''
                : thirdTeam?.team_name || '',
            logo: pendingPlayer.fromTeamKey === selectedTeam
              ? TEAMS.find(t => t.key === selectedTeam)?.logo || null
              : pendingPlayer.fromTeamKey === opponentTeam?.team_key
                ? opponentTeam?.logo_url || null
                : thirdTeam?.logo_url || null,
            color: pendingPlayer.fromTeamKey === selectedTeam
              ? TEAMS.find(t => t.key === selectedTeam)?.color || '#666'
              : pendingPlayer.fromTeamKey === opponentTeam?.team_key
                ? opponentTeam?.primary_color || '#666'
                : thirdTeam?.primary_color || '#666',
          }}
          teams={getTeamsForPicker()}
          playerName={pendingPlayer.player.full_name}
          assetType="player"
        />
      )}

      {/* Destination Picker for Draft Picks (3-team trades) */}
      {pendingPick && (
        <DestinationPicker
          open={showDestinationPicker}
          onClose={() => {
            setShowDestinationPicker(false)
            setPendingPick(null)
          }}
          onSelect={handleDestinationSelect}
          fromTeam={{
            key: pendingPick.fromTeamKey,
            name: pendingPick.fromTeamKey === selectedTeam
              ? (TEAMS.find(t => t.key === selectedTeam)?.label || selectedTeam)
              : pendingPick.fromTeamKey === opponentTeam?.team_key
                ? opponentTeam?.team_name || ''
                : thirdTeam?.team_name || '',
            logo: pendingPick.fromTeamKey === selectedTeam
              ? TEAMS.find(t => t.key === selectedTeam)?.logo || null
              : pendingPick.fromTeamKey === opponentTeam?.team_key
                ? opponentTeam?.logo_url || null
                : thirdTeam?.logo_url || null,
            color: pendingPick.fromTeamKey === selectedTeam
              ? TEAMS.find(t => t.key === selectedTeam)?.color || '#666'
              : pendingPick.fromTeamKey === opponentTeam?.team_key
                ? opponentTeam?.primary_color || '#666'
                : thirdTeam?.primary_color || '#666',
          }}
          teams={getTeamsForPicker()}
          playerName={`${pendingPick.pick.year} Round ${pendingPick.pick.round} Pick`}
          assetType="pick"
        />
      )}


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

```

---

### src/app/gm/layout.tsx

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

---

### src/app/gm/analytics/page.tsx

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

---

### src/app/gm/share/[code]/page.tsx

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

## API Routes

### src/app/api/gm/grade/route.ts

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
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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
  try {
    // Try to fetch from gm_data_freshness table if it exists
    const { data: freshness } = await datalabAdmin
      .from('gm_data_freshness')
      .select('*')
      .eq('team_key', teamKey)
      .eq('sport', sport)
      .single()

    if (freshness) {
      return {
        roster_updated_at: freshness.roster_updated_at,
        stats_updated_at: freshness.stats_updated_at,
        contracts_updated_at: freshness.contracts_updated_at || freshness.stats_updated_at,
        age_hours: freshness.age_hours || 0,
        is_stale: freshness.is_stale || false,
        warning: freshness.warning || undefined,
      }
    }

    // Fallback: calculate from team-specific tables
    const now = new Date()
    const playerTable = `${teamKey}_players`

    // Get most recent player update
    const { data: recentPlayer } = await datalabAdmin
      .from(playerTable)
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    const rosterUpdatedAt = recentPlayer?.updated_at || now.toISOString()
    const ageHours = (now.getTime() - new Date(rosterUpdatedAt).getTime()) / (1000 * 60 * 60)
    const isStale = ageHours > 24

    return {
      roster_updated_at: rosterUpdatedAt,
      stats_updated_at: rosterUpdatedAt,
      contracts_updated_at: rosterUpdatedAt,
      age_hours: Math.round(ageHours * 10) / 10,
      is_stale: isStale,
      warning: isStale ? 'Data may be outdated. Roster information could be up to 24+ hours old.' : undefined,
    }
  } catch (e) {
    console.error('Failed to fetch data freshness:', e)
    return null
  }
}

const MODEL_NAME = 'claude-sonnet-4-20250514'

const GM_SYSTEM_PROMPT = `You are "GM", a brutally honest sports trade evaluator and general manager for SM Data Lab, a Chicago sports analytics platform. You grade proposed trades on a scale of 0-100.

## Grading Criteria (weighted)
1. **Realism (30%)**: Would the other GM actually accept? This is the MOST IMPORTANT factor. If the other team would laugh and hang up, the grade CANNOT exceed 25 regardless of how good it looks for Chicago. A trade that is unrealistic is a BAD trade — it wastes time and shows poor evaluation skills.
2. **Value Balance (25%)**: Comparable talent, production, and contract value on both sides. Lopsided trades in EITHER direction score low.
3. **Team Needs (15%)**: Does this fill a real gap for the Chicago team? Trading from depth = good. Acquiring at a stacked position = bad.
4. **Player Caliber (10%)**: Stats, awards, trajectory, usage, advanced metrics.
5. **Contract/Cap (15%)**: Salary cap implications. NFL ~$301.2M, NBA ~$154.6M (luxury tax ~$171.3M, 1st apron ~$178.1M, 2nd apron ~$188.9M), NHL ~$95.5M, MLB has no cap but CBT at ~$244M. Include specific dollar amounts in cap_analysis.
6. **Age/Future (5%)**: Under 27 = ascending value. Over 32 = declining. Rookie deals = premium.

## CRITICAL: Realism Gate
Before grading, ask: "Would the other GM accept this trade?" If the answer is clearly NO because the package is vastly insufficient, the grade MUST be capped:
- Other team would NEVER accept (massive value gap): Grade 0-20
- Other team would probably decline (notable value gap): Grade 15-35
- Plausible but unlikely: Grade 25-50
- Reasonable — both sides can justify it: Grade 40-75
- Both sides clearly benefit: Grade 60-85
- Franchise-altering, realistic blockbuster: Grade 80-95

Do NOT give a high grade just because acquiring the player would be great for Chicago. The trade must be REALISTIC. Getting Mike Trout for a backup catcher would be amazing for Chicago but deserves a grade of 5, not 80.

## Grading Scale
- 90-100: Elite, franchise-altering (extremely rare — maybe 1 in 50 trades)
- 70-89: Good, accepted but flagged "dangerous" if 70-90 (risky upside)
- 50-69: Decent but flawed, or mediocre value — REJECTED
- 30-49: Bad — giving up too much OR not enough to get the deal done
- 15-29: Very bad — unrealistic or clearly one-sided
- 0-14: Catastrophic — untouchable player traded, absurd proposal, or laughable value gap
Most trades should land between 25-65. Grades 70+ require BOTH sides to plausibly agree AND the Chicago team to meaningfully improve.

## Sport-Specific Rules

### NFL (Bears)
- Position value: QB > Edge > LT > CB > WR > IDL > LB > RB (RBs are nearly worthless in trade value)
- Trading a 1st for an RB = grade 15-30. Trading franchise QB = grade 0-10.
- Bears are CONTENDING (12-7 in 2025) with championship window OPEN. Caleb Williams is UNTOUCHABLE (grade 0 if sent).
- 2026 moves: Joe Thuney (4th), Jonah Jackson (6th) - OL upgraded. TOP NEED: EDGE pass rush.
- DJ Moore is a TRADE CANDIDATE ($28M cap hit, only 682 yards in 2025).
- Division trades (Packers/Vikings/Lions) cost a 5-10 point penalty.
- Draft pick value: 1st overall ~3000, late 1st ~800-1200, 2nd ~400-700, 3rd+ minimal.

### NBA (Bulls)
- Position value: Two-way wing > Lead creator > Stretch big > 3&D > Traditional center
- Salary matching is MANDATORY for over-the-cap teams (125% + $100K rule).
- Rookie-scale deals are the most valuable contracts. Supermax = hardest to trade.
- Bulls are in FULL REBUILD after 7+ trades at Feb 2026 deadline. Traded Vucevic, Coby White, Dosunmu, Lonzo Ball.
- New young core: Jaden Ivey, Anfernee Simons, Rob Dillingham, Isaac Okoro, Collin Sexton.
- Have 7 1st-round picks over 6 drafts + 14+ 2nd-rounders. Grade as REBUILD team: young players + picks = GOOD, expensive vets = BAD.
- Can't trade consecutive future 1sts (Stepien Rule). No-trade clauses exist.
- 2nd apron teams have severe aggregation restrictions.

### NHL (Blackhawks)
- Position value: #1 Center > Top-pair D > Elite winger > Starting goalie > depth
- Retained salary (up to 50%) is a major trade mechanic. **Blackhawks may have 0 retention slots available** (Jones, Rantanen, McCabe deals used them). If trade requires retention and no slots: grade 0 with explanation.
- Blackhawks are REBUILDING around Connor Bedard. Bedard is UNTOUCHABLE (grade 0 if sent).
- Likely SELLERS at March 6 deadline. Pending UFAs to trade: Connor Murphy, Ilya Mikheyev, Jason Dickinson, Matt Grzelcyk, Nick Foligno.
- 2026 dual deadline: Feb 4 freeze + March 6 deadline. NTC/NMC checking required.
- Selling veterans for picks/prospects = good. Acquiring expensive vets = bad.
- Rental trades at deadline are common — UFAs have less value than controlled players.

### MLB (Cubs & White Sox)
- Position value: Ace SP > SS/CF/C > Elite hitter > Setup/Closer > Corner positions > DH
- Prospect packages are the PRIMARY trade currency. MLB prospects matter more than any other sport.
- Years of team control dramatically affect value — 3 years of control >> rental.
- Service time impact on value: pre-arb years = most valuable. Option years must be factored.
- Qualifying offer opportunity cost: QO-attached free agents require draft pick compensation.
- Cubs (92-70) are CONTENDING — aggressive buyer. TOP NEEDS: SP (rotation depth), RP. Trading top prospects for proven talent = acceptable.
- White Sox (60-102) are in HISTORIC REBUILD — selling everything. Luis Robert Jr. is #1 trade chip ($20M option 2027). Any return of future assets is acceptable.
- **Salary Retention**: Sending team can retain 0-50% of a player's salary. Factor this into contract value — a $30M player with 50% retained is effectively a $15M acquisition. Retention makes expensive players more tradeable and increases realistic value.
- **Cash Considerations**: CBA limits direct cash to $100,000 max. Minor value in modern trades, typically a sweetener.
- When retention is included, note the NET salary impact for Chicago in cap_analysis.

## Untouchable Players
- Bears: Caleb Williams (franchise QB on rookie deal) → grade 0 if traded
- Blackhawks: Connor Bedard (generational talent, rebuild centerpiece) → grade 0 if traded
- White Sox: Nobody (everyone is tradeable in a rebuild)

## Edge Cases
- Unknown player names: Still grade based on position and trade structure. Note unfamiliarity in reasoning.
- Absurd trades (mascots, wrong sport): Grade 0 with humor.
- Draft-pick-only trades: Grade on value chart equivalence.

## Response Format
You MUST respond with valid JSON only, no other text:
{
  "grade": <number 0-100>,
  "reasoning": "<2-4 sentence explanation>",
  "trade_summary": "<One-line summary of the trade>",
  "improvement_score": <number -10 to 10, how much this improves the Chicago team>,
  "breakdown": {
    "talent_balance": <0.0-1.0>,
    "contract_value": <0.0-1.0>,
    "team_fit": <0.0-1.0>,
    "future_assets": <0.0-1.0>
  },
  "cap_analysis": "<1-2 sentences about salary cap impact with specific dollar amounts when available>",
  "historical_context": {
    "similar_trades": [
      {
        "date": "<month year>",
        "description": "<brief trade description>",
        "teams": ["<team1>", "<team2>"],
        "outcome": "<worked | failed | neutral>",
        "similarity_score": <0-100>,
        "key_difference": "<what makes it different from this trade>"
      }
    ],
    "success_rate": <0-100, % of similar trades that worked>,
    "key_patterns": ["<pattern 1>", "<pattern 2>"],
    "why_this_fails_historically": "<only for rejected trades, explain historical failure pattern>",
    "what_works_instead": "<only for rejected trades, suggest what historically works>"
  },
  "suggested_trade": <only if grade < 70, suggest improvements> {
    "description": "<what to change>",
    "chicago_sends": [{"type": "player|pick", "name": "<name>", "position": "<pos>", "year": <year>, "round": <round>}],
    "chicago_receives": [{"type": "player|pick", "name": "<name>", "position": "<pos>", "year": <year>, "round": <round>}],
    "why_this_works": "<reasoning>",
    "likelihood": "<very likely | likely | possible | unlikely>",
    "estimated_grade_improvement": <number 5-30>
  }
}

IMPORTANT: Always include historical_context with 2-3 similar real trades from history. For rejected trades (grade < 70), also include suggested_trade with specific improvements.

Reasoning should: name specific players, mention team phase (rebuild/contend), note cap/salary if relevant, reference comparable real trades when possible, and always frame from Chicago's perspective. Be a seasoned GM, not a robot.

Do not wrap in markdown code blocks. Just raw JSON.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Auth is optional - guests can grade trades but won't have history saved
    const user = await getGMAuthUser(request)
    const userId = user?.id || 'guest'
    const isGuest = !user
    const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'

    // Rate limiting: max 10 trades per minute (only for logged-in users)
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
    const {
      chicago_team, trade_partner, players_sent, players_received,
      draft_picks_sent, draft_picks_received, session_id, partner_team_key,
      // MLB salary retention & cash considerations
      salary_retentions, cash_sent, cash_received,
      // 3-team trade fields
      trade_partner_1, trade_partner_2, players: threeTeamPlayers, draft_picks: threeTeamPicks,
    } = body

    if (!chicago_team || !TEAM_SPORT_MAP[chicago_team]) {
      return NextResponse.json({ error: 'Invalid chicago_team' }, { status: 400 })
    }

    // Detect if this is a 3-team trade
    const isThreeTeamTrade = !!(trade_partner_1 && trade_partner_2)

    if (!isThreeTeamTrade) {
      // 2-team trade validation
      if (!trade_partner || typeof trade_partner !== 'string') {
        return NextResponse.json({ error: 'trade_partner required' }, { status: 400 })
      }
      // Validate that at least one asset is being sent and received (players OR draft picks)
      const hasSentAssets = (Array.isArray(players_sent) && players_sent.length > 0) ||
                            (Array.isArray(draft_picks_sent) && draft_picks_sent.length > 0)
      const hasReceivedAssets = (Array.isArray(players_received) && players_received.length > 0) ||
                                (Array.isArray(draft_picks_received) && draft_picks_received.length > 0)

      if (!hasSentAssets) {
        return NextResponse.json({ error: 'Must send at least one player or draft pick' }, { status: 400 })
      }
      if (!hasReceivedAssets) {
        return NextResponse.json({ error: 'Must receive at least one player or draft pick' }, { status: 400 })
      }
    } else {
      // 3-team trade validation
      const hasAssets = (Array.isArray(threeTeamPlayers) && threeTeamPlayers.length > 0) ||
                        (Array.isArray(threeTeamPicks) && threeTeamPicks.length > 0)
      if (!hasAssets) {
        return NextResponse.json({ error: 'Must include at least one player or draft pick in 3-team trade' }, { status: 400 })
      }
    }

    const sport = TEAM_SPORT_MAP[chicago_team]
    const teamDisplayNames: Record<string, string> = {
      bears: 'Chicago Bears', bulls: 'Chicago Bulls', blackhawks: 'Chicago Blackhawks',
      cubs: 'Chicago Cubs', whitesox: 'Chicago White Sox',
    }

    // Handle 3-team trades separately
    if (isThreeTeamTrade) {
      const safeThreeTeamPlayers = Array.isArray(threeTeamPlayers) ? threeTeamPlayers : []
      const safeThreeTeamPicks = Array.isArray(threeTeamPicks) ? threeTeamPicks : []

      // Group assets by team for display
      const teamAssets: Record<string, { sends: string[], receives: string[] }> = {}
      const allTeamKeys = [chicago_team, trade_partner_1, trade_partner_2]

      for (const key of allTeamKeys) {
        teamAssets[key] = { sends: [], receives: [] }
      }

      // Process players
      for (const p of safeThreeTeamPlayers) {
        const playerDesc = `${p.player_name} (${p.position || 'N/A'})`
        if (p.from_team && teamAssets[p.from_team]) {
          teamAssets[p.from_team].sends.push(playerDesc)
        }
        if (p.to_team && teamAssets[p.to_team]) {
          teamAssets[p.to_team].receives.push(playerDesc)
        }
      }

      // Process draft picks
      for (const pk of safeThreeTeamPicks) {
        const pickDesc = `${pk.year} Round ${pk.round} pick`
        if (pk.from_team && teamAssets[pk.from_team]) {
          teamAssets[pk.from_team].sends.push(pickDesc)
        }
        if (pk.to_team && teamAssets[pk.to_team]) {
          teamAssets[pk.to_team].receives.push(pickDesc)
        }
      }

      // Build trade description for AI
      const chicagoName = teamDisplayNames[chicago_team]
      let tradeDesc = `3-TEAM TRADE\nSport: ${sport.toUpperCase()}\n\n`

      for (const [teamKey, assets] of Object.entries(teamAssets)) {
        const teamName = teamKey === chicago_team ? chicagoName : teamKey
        tradeDesc += `${teamName}:\n`
        tradeDesc += `  SENDS: ${assets.sends.length > 0 ? assets.sends.join(', ') : 'Nothing'}\n`
        tradeDesc += `  RECEIVES: ${assets.receives.length > 0 ? assets.receives.join(', ') : 'Nothing'}\n\n`
      }

      tradeDesc += `Grade this trade from the perspective of the ${chicagoName}.`

      // Call AI for grading (no deterministic grade for 3-team trades)
      const response = await getAnthropic().messages.create({
        model: MODEL_NAME,
        max_tokens: 1500,
        temperature: 0,
        system: GM_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: tradeDesc }],
      })

      const responseTimeMs = Date.now() - startTime
      const textContent = response.content.find(c => c.type === 'text')
      const rawText = textContent?.type === 'text' ? textContent.text : ''

      let grade: number
      let reasoning: string
      let tradeSummary = ''
      let improvementScore = 0
      let breakdown = { talent_balance: 0.5, contract_value: 0.5, team_fit: 0.5, future_assets: 0.5 }
      let capAnalysis = ''
      let threeTeamHistoricalContext: any = null
      let threeTeamSuggestedTrade: any = null

      try {
        const parsed = JSON.parse(rawText)
        grade = Math.max(0, Math.min(100, Math.round(parsed.grade)))
        reasoning = parsed.reasoning || 'No reasoning provided.'
        tradeSummary = parsed.trade_summary || ''
        improvementScore = typeof parsed.improvement_score === 'number' ? Math.max(-10, Math.min(10, parsed.improvement_score)) : 0
        capAnalysis = parsed.cap_analysis || ''
        if (parsed.breakdown) {
          breakdown = {
            talent_balance: Math.max(0, Math.min(1, parsed.breakdown.talent_balance ?? 0.5)),
            contract_value: Math.max(0, Math.min(1, parsed.breakdown.contract_value ?? 0.5)),
            team_fit: Math.max(0, Math.min(1, parsed.breakdown.team_fit ?? 0.5)),
            future_assets: Math.max(0, Math.min(1, parsed.breakdown.future_assets ?? 0.5)),
          }
        }

        // Parse historical context for 3-team trades
        if (parsed.historical_context) {
          threeTeamHistoricalContext = {
            similar_trades: Array.isArray(parsed.historical_context.similar_trades)
              ? parsed.historical_context.similar_trades.slice(0, 3)
              : [],
            success_rate: typeof parsed.historical_context.success_rate === 'number'
              ? Math.max(0, Math.min(100, parsed.historical_context.success_rate))
              : 50,
            key_patterns: Array.isArray(parsed.historical_context.key_patterns)
              ? parsed.historical_context.key_patterns.slice(0, 5)
              : [],
            why_this_fails_historically: parsed.historical_context.why_this_fails_historically || null,
            what_works_instead: parsed.historical_context.what_works_instead || null,
          }
        }

        // Parse suggested trade for rejected 3-team trades
        if (parsed.suggested_trade && grade < 70) {
          threeTeamSuggestedTrade = {
            description: parsed.suggested_trade.description || '',
            chicago_sends: Array.isArray(parsed.suggested_trade.chicago_sends)
              ? parsed.suggested_trade.chicago_sends
              : [],
            chicago_receives: Array.isArray(parsed.suggested_trade.chicago_receives)
              ? parsed.suggested_trade.chicago_receives
              : [],
            why_this_works: parsed.suggested_trade.why_this_works || '',
            likelihood: parsed.suggested_trade.likelihood || 'possible',
            estimated_grade_improvement: typeof parsed.suggested_trade.estimated_grade_improvement === 'number'
              ? Math.max(0, Math.min(50, parsed.suggested_trade.estimated_grade_improvement))
              : 15,
          }
        }
      } catch {
        const gradeMatch = rawText.match(/(\d{1,3})/)
        grade = gradeMatch ? Math.max(0, Math.min(100, parseInt(gradeMatch[1]))) : 50
        reasoning = rawText || 'AI response could not be parsed.'
      }

      const status = grade >= 70 ? 'accepted' : 'rejected'
      const is_dangerous = grade >= 70 && grade <= 90
      const userEmail = user?.email || 'guest'
      const sharedCode = randomBytes(6).toString('hex')

      // Get team logos
      let partner1Logo: string | null = null
      let partner2Logo: string | null = null
      let chicagoTeamLogo: string | null = null

      const { data: p1 } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', trade_partner_1)
        .eq('sport', sport)
        .single()
      partner1Logo = p1?.logo_url || null

      const { data: p2 } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', trade_partner_2)
        .eq('sport', sport)
        .single()
      partner2Logo = p2?.logo_url || null

      const { data: ct } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', chicago_team)
        .eq('sport', sport)
        .single()
      chicagoTeamLogo = ct?.logo_url || null

      // Save 3-team trade to database
      const { data: trade, error: tradeError } = await datalabAdmin.from('gm_trades').insert({
        user_id: userId,
        user_email: userEmail,
        chicago_team,
        sport,
        trade_partner: `${trade_partner_1} / ${trade_partner_2}`, // Combined for display
        players_sent: safeThreeTeamPlayers.filter(p => p.from_team === chicago_team),
        players_received: safeThreeTeamPlayers.filter(p => p.to_team === chicago_team),
        grade,
        grade_reasoning: reasoning,
        status,
        is_dangerous,
        session_id: session_id || null,
        improvement_score: improvementScore,
        trade_summary: tradeSummary,
        ai_version: `gm_3team_${API_VERSION}_${MODEL_NAME}`,
        shared_code: sharedCode,
        partner_team_key: trade_partner_1,
        partner_team_logo: partner1Logo,
        chicago_team_logo: chicagoTeamLogo,
        draft_picks_sent: safeThreeTeamPicks.filter(pk => pk.from_team === chicago_team),
        draft_picks_received: safeThreeTeamPicks.filter(pk => pk.to_team === chicago_team),
        talent_balance: breakdown.talent_balance,
        contract_value: breakdown.contract_value,
        team_fit: breakdown.team_fit,
        future_assets: breakdown.future_assets,
        cap_analysis: capAnalysis,
        is_three_team: true,
        trade_partner_2: trade_partner_2,
        trade_partner_2_logo: partner2Logo,
        three_team_players: safeThreeTeamPlayers,
        three_team_picks: safeThreeTeamPicks,
      }).select().single()

      if (tradeError) {
        console.error('Failed to insert 3-team trade:', tradeError)
      }

      // Update session counters if applicable
      if (session_id && trade) {
        if (status === 'accepted') {
          await datalabAdmin.rpc('increment_session_approved', { sid: session_id })
        } else {
          await datalabAdmin.rpc('increment_session_rejected', { sid: session_id })
        }
      }

      // Log to audit
      try {
        await datalabAdmin.from('gm_audit_logs').insert({
          user_id: userId,
          user_email: userEmail,
          chicago_team,
          request_payload: { trade_partner_1, trade_partner_2, players: safeThreeTeamPlayers, draft_picks: safeThreeTeamPicks },
          response_payload: { grade, reasoning, breakdown },
          response_time_ms: responseTimeMs,
          ai_model: MODEL_NAME,
        })
      } catch (auditErr) {
        console.error('Audit log failed:', auditErr)
      }

      // Fetch data freshness for 3-team trade
      const threeTeamDataFreshness = await getDataFreshness(chicago_team, sport)

      return NextResponse.json({
        grade,
        reasoning,
        status,
        is_dangerous,
        trade_id: trade?.id || null,
        shared_code: sharedCode,
        improvement_score: improvementScore,
        trade_summary: tradeSummary,
        breakdown,
        cap_analysis: capAnalysis,
        is_three_team: true,
        // New Feb 2026 fields
        historical_context: threeTeamHistoricalContext,
        enhanced_suggested_trade: threeTeamSuggestedTrade,
        data_freshness: threeTeamDataFreshness,
      })
    }

    // ========== 2-TEAM TRADE LOGIC (original) ==========

    // Ensure arrays are initialized (empty arrays, not undefined)
    const safePlayers_sent = Array.isArray(players_sent) ? players_sent : []
    const safePlayers_received = Array.isArray(players_received) ? players_received : []
    const safeDraft_picks_sent = Array.isArray(draft_picks_sent) ? draft_picks_sent : []
    const safeDraft_picks_received = Array.isArray(draft_picks_received) ? draft_picks_received : []

    // Call Edge Function for deterministic grade FIRST
    let deterministicResult: { grade: number; breakdown: any; debug?: any } | null = null
    try {
      deterministicResult = await getDeterministicGrade({
        chicago_team,
        sport,
        players_sent: safePlayers_sent,
        players_received: safePlayers_received,
        draft_picks_sent: safeDraft_picks_sent,
        draft_picks_received: safeDraft_picks_received,
      })
      console.log('Deterministic grade result:', deterministicResult)
    } catch (e) {
      console.error('Failed to get deterministic grade:', e)
    }

    // Fetch salary cap data for both teams
    const capTable = `gm_${sport}_salary_cap`
    let chicagoCapData: any = null
    let partnerCapData: any = null
    try {
      const { data: cc } = await datalabAdmin
        .from(capTable)
        .select('total_cap, cap_used, cap_available, dead_money')
        .eq('team_key', chicago_team)
        .order('season', { ascending: false })
        .limit(1)
        .single()
      chicagoCapData = cc
    } catch {}
    if (partner_team_key) {
      try {
        const { data: pc } = await datalabAdmin
          .from(capTable)
          .select('total_cap, cap_used, cap_available, dead_money')
          .eq('team_key', partner_team_key)
          .order('season', { ascending: false })
          .limit(1)
          .single()
        partnerCapData = pc
      } catch {}
    }

    const formatMoney = (v: number) => `$${(v / 1_000_000).toFixed(1)}M`

    // Look up player value tiers for both sides
    const allPlayerNames = [
      ...safePlayers_sent.map((p: any) => p.name || p.full_name),
      ...safePlayers_received.map((p: any) => p.name || p.full_name),
    ].filter(Boolean)

    let tierMap: Record<string, { tier: number, tier_label: string, trade_value_score: number, is_untouchable: boolean }> = {}
    try {
      const { data: tiers } = await datalabAdmin
        .from('gm_player_value_tiers')
        .select('player_name, tier, tier_label, trade_value_score, is_untouchable')
        .in('player_name', allPlayerNames)
        .eq('league', sport)
      if (tiers) {
        for (const t of tiers) {
          tierMap[t.player_name] = { tier: t.tier, tier_label: t.tier_label, trade_value_score: t.trade_value_score, is_untouchable: t.is_untouchable }
        }
      }
    } catch {
      // Table may not exist yet — continue without tiers
    }

    // Look up few-shot grading examples
    let examplesBlock = ''
    try {
      const { data: examples } = await datalabAdmin
        .from('gm_grading_examples')
        .select('trade_description, correct_grade, reasoning, category')
        .eq('sport', sport)
        .limit(5)
      if (examples && examples.length > 0) {
        examplesBlock = `\n\nReference Grades (use as calibration):\n${examples.map(
          (ex: any) => `- ${ex.category}: "${ex.trade_description}" → Grade ${ex.correct_grade} (${ex.reasoning})`
        ).join('\n')}`
      }
    } catch {
      // Table may not exist yet — continue without examples
    }

    const sentDesc = safePlayers_sent.map((p: any) => {
      const playerName = p.name || p.full_name || 'Unknown'
      let desc = `${playerName} (${p.position})`
      if (p.stat_line) desc += ` [${p.stat_line}]`
      if (p.age) desc += ` Age ${p.age}`
      if (p.cap_hit) desc += `, ${formatMoney(p.cap_hit)} cap hit`
      if (p.contract_years) desc += `, ${p.contract_years}yr remaining`
      const tier = tierMap[playerName]
      if (tier) desc += ` [Tier ${tier.tier}: ${tier.tier_label}, value ${tier.trade_value_score}${tier.is_untouchable ? ', UNTOUCHABLE' : ''}]`
      return desc
    }).join(', ')

    const recvDesc = safePlayers_received.map((p: any) => {
      let desc = `${p.name || p.full_name} (${p.position})`
      if (p.stat_line) desc += ` [${p.stat_line}]`
      if (p.age) desc += ` Age ${p.age}`
      if (p.cap_hit) desc += `, ${formatMoney(p.cap_hit)} cap hit`
      if (p.contract_years) desc += `, ${p.contract_years}yr remaining`
      const tier = tierMap[p.name || p.full_name]
      if (tier) desc += ` [Tier ${tier.tier}: ${tier.tier_label}, value ${tier.trade_value_score}${tier.is_untouchable ? ', UNTOUCHABLE' : ''}]`
      return desc
    }).join(', ')

    let picksSentDesc = ''
    if (safeDraft_picks_sent.length > 0) {
      picksSentDesc = `\nDraft picks sent: ${safeDraft_picks_sent.map((p: any) => `${p.year} Round ${p.round}${p.condition ? ` (${p.condition})` : ''}`).join(', ')}`
    }
    let picksRecvDesc = ''
    if (safeDraft_picks_received.length > 0) {
      picksRecvDesc = `\nDraft picks received: ${safeDraft_picks_received.map((p: any) => `${p.year} Round ${p.round}${p.condition ? ` (${p.condition})` : ''}`).join(', ')}`
    }

    let capContext = ''
    if (chicagoCapData) {
      capContext += `\nSalary Cap Context:\n${teamDisplayNames[chicago_team]}: ${formatMoney(chicagoCapData.cap_used)} used / ${formatMoney(chicagoCapData.cap_available)} available of ${formatMoney(chicagoCapData.total_cap)} ceiling`
      if (chicagoCapData.dead_money) capContext += ` (${formatMoney(chicagoCapData.dead_money)} dead money)`
    }
    if (partnerCapData) {
      capContext += `\n${trade_partner}: ${formatMoney(partnerCapData.cap_used)} used / ${formatMoney(partnerCapData.cap_available)} available of ${formatMoney(partnerCapData.total_cap)} ceiling`
      if (partnerCapData.dead_money) capContext += ` (${formatMoney(partnerCapData.dead_money)} dead money)`
    }

    // MLB Salary Retention & Cash Considerations context
    let mlbFinancialContext = ''
    if (sport === 'mlb') {
      // Salary retention details
      if (salary_retentions && typeof salary_retentions === 'object' && Object.keys(salary_retentions).length > 0) {
        const retentionDetails: string[] = []
        for (const [playerId, pct] of Object.entries(salary_retentions)) {
          const numPct = Number(pct)
          if (numPct > 0) {
            // Find the player in received list
            const player = safePlayers_received.find((p: any) =>
              p.espn_id === playerId || p.player_id === playerId || (p.name || p.full_name) === playerId
            )
            if (player?.cap_hit) {
              const retainedAmount = (player.cap_hit * numPct) / 100
              const netSalary = player.cap_hit - retainedAmount
              retentionDetails.push(
                `${player.name || player.full_name}: ${numPct}% retained by sending team (${formatMoney(retainedAmount)} retained, net ${formatMoney(netSalary)} for Chicago)`
              )
            }
          }
        }
        if (retentionDetails.length > 0) {
          mlbFinancialContext += `\n\nSalary Retention:\n${retentionDetails.join('\n')}`
        }
      }

      // Cash considerations
      if (cash_sent && Number(cash_sent) > 0) {
        mlbFinancialContext += `\nCash sent by Chicago: $${Number(cash_sent).toLocaleString()}`
      }
      if (cash_received && Number(cash_received) > 0) {
        mlbFinancialContext += `\nCash received by Chicago: $${Number(cash_received).toLocaleString()}`
      }
    }

    // Calculate value gap if tiers are available
    let valueContext = ''
    const hasTiers = Object.keys(tierMap).length > 0
    if (hasTiers) {
      const sentValue = safePlayers_sent.reduce((sum: number, p: any) => {
        const tier = tierMap[p.name || p.full_name]
        return sum + (tier?.trade_value_score || 0)
      }, 0)
      // Rough draft pick values
      const pickValue = (picks: any[]) => picks.reduce((sum: number, p: any) => {
        if (p.round === 1) return sum + 35
        if (p.round === 2) return sum + 18
        if (p.round === 3) return sum + 10
        return sum + 5
      }, 0)
      const sentTotal = sentValue + pickValue(safeDraft_picks_sent)

      const recvValue = safePlayers_received.reduce((sum: number, p: any) => {
        const tier = tierMap[p.name || p.full_name]
        return sum + (tier?.trade_value_score || 0)
      }, 0)
      const recvTotal = recvValue + pickValue(safeDraft_picks_received)

      const gap = recvTotal - sentTotal
      valueContext = `\n\nPlayer Value Analysis (objective tier data):
SENDING total value: ~${sentTotal}
RECEIVING total value: ~${recvTotal}
VALUE GAP: ${gap > 0 ? `Chicago receiving ${gap} points MORE (other team unlikely to accept if gap > 20)` : gap < 0 ? `Chicago sending ${Math.abs(gap)} points MORE (overpay)` : 'Even trade'}`

      // Add realism warning for large gaps
      if (gap > 30) {
        valueContext += `\n⚠ REALISM WARNING: The value gap is ${gap} points. The other team would almost certainly reject this trade. Grade should reflect this — cap at 20-25 max.`
      } else if (gap > 15) {
        valueContext += `\n⚠ CAUTION: Notable value gap of ${gap} points favoring Chicago. Other team would likely decline without sweeteners. Cap grade at 40-50.`
      }
    }

    // Build different prompts based on whether we have a deterministic grade
    let tradeDescription: string
    let systemPrompt: string

    if (deterministicResult) {
      // Deterministic mode: AI explains the pre-calculated grade (CANNOT override)
      tradeDescription = `
Sport: ${sport.toUpperCase()}
${teamDisplayNames[chicago_team]} send: ${sentDesc}${picksSentDesc}
${trade_partner} send: ${recvDesc}${picksRecvDesc}${capContext}${mlbFinancialContext}

## PRE-CALCULATED GRADE: ${deterministicResult.grade}

This grade was calculated using objective player value data:
- Sent value: ${deterministicResult.debug?.sent_value || 'N/A'}
- Received value: ${deterministicResult.debug?.received_value || 'N/A'}
- Value difference: ${deterministicResult.debug?.value_difference || 'N/A'}
- Team phase: ${deterministicResult.debug?.team_phase || 'N/A'}

Your task: Write a 2-4 sentence explanation for WHY this trade deserves a grade of ${deterministicResult.grade}. Do NOT suggest a different grade. The grade is final.`

      systemPrompt = `You are "GM", a sports trade analyst for SM Data Lab. A trade has already been graded ${deterministicResult.grade}/100 using objective player value metrics. Your job is ONLY to explain WHY this grade makes sense.

CRITICAL: You MUST use the grade ${deterministicResult.grade} in your response. Do NOT suggest a different grade.

Respond with valid JSON only:
{
  "grade": ${deterministicResult.grade},
  "reasoning": "<2-4 sentence explanation of why the grade is ${deterministicResult.grade}>",
  "trade_summary": "<One-line summary of the trade>",
  "improvement_score": <number -10 to 10>,
  "breakdown": {
    "talent_balance": ${deterministicResult.breakdown?.talent_balance ?? 0.5},
    "contract_value": ${deterministicResult.breakdown?.contract_value ?? 0.5},
    "team_fit": ${deterministicResult.breakdown?.team_fit ?? 0.5},
    "future_assets": ${deterministicResult.breakdown?.future_assets ?? 0.5}
  },
  "cap_analysis": "<1-2 sentences about salary cap impact>"
}

Do not wrap in markdown code blocks. Just raw JSON.`
    } else {
      // Fallback: Full AI grading (original behavior)
      tradeDescription = `
Sport: ${sport.toUpperCase()}
${teamDisplayNames[chicago_team]} send: ${sentDesc}${picksSentDesc}
${trade_partner} send: ${recvDesc}${picksRecvDesc}${capContext}${mlbFinancialContext}${valueContext}${examplesBlock}

Grade this trade from the perspective of the ${teamDisplayNames[chicago_team]}.`
      systemPrompt = GM_SYSTEM_PROMPT
    }

    const requestPayload = { model: MODEL_NAME, system: deterministicResult ? 'DETERMINISTIC_EXPLAIN_PROMPT' : 'GM_SYSTEM_PROMPT', tradeDescription, deterministicGrade: deterministicResult?.grade }

    const response = await getAnthropic().messages.create({
      model: MODEL_NAME,
      max_tokens: 1500,
      temperature: 0, // Deterministic output
      system: systemPrompt,
      messages: [{ role: 'user', content: tradeDescription }],
    })

    const responseTimeMs = Date.now() - startTime
    const textContent = response.content.find(c => c.type === 'text')
    const rawText = textContent?.type === 'text' ? textContent.text : ''

    let grade: number
    let reasoning: string
    let tradeSummary = ''
    let improvementScore = 0
    let breakdown = { talent_balance: 0.5, contract_value: 0.5, team_fit: 0.5, future_assets: 0.5 }
    let capAnalysis = ''
    let historicalContext: any = null
    let suggestedTrade: any = null

    try {
      const parsed = JSON.parse(rawText)
      // CRITICAL: If we have a deterministic grade, ALWAYS use it (AI cannot override)
      if (deterministicResult) {
        grade = deterministicResult.grade
        // Use deterministic breakdown if AI didn't provide one or tried to change it
        breakdown = {
          talent_balance: deterministicResult.breakdown?.talent_balance ?? 0.5,
          contract_value: deterministicResult.breakdown?.contract_value ?? 0.5,
          team_fit: deterministicResult.breakdown?.team_fit ?? 0.5,
          future_assets: deterministicResult.breakdown?.future_assets ?? 0.5,
        }
      } else {
        grade = Math.max(0, Math.min(100, Math.round(parsed.grade)))
        if (parsed.breakdown) {
          breakdown = {
            talent_balance: Math.max(0, Math.min(1, parsed.breakdown.talent_balance ?? 0.5)),
            contract_value: Math.max(0, Math.min(1, parsed.breakdown.contract_value ?? 0.5)),
            team_fit: Math.max(0, Math.min(1, parsed.breakdown.team_fit ?? 0.5)),
            future_assets: Math.max(0, Math.min(1, parsed.breakdown.future_assets ?? 0.5)),
          }
        }
      }
      reasoning = parsed.reasoning || 'No reasoning provided.'
      tradeSummary = parsed.trade_summary || ''
      improvementScore = typeof parsed.improvement_score === 'number' ? Math.max(-10, Math.min(10, parsed.improvement_score)) : 0
      capAnalysis = parsed.cap_analysis || ''

      // Parse historical context from AI response
      if (parsed.historical_context) {
        historicalContext = {
          similar_trades: Array.isArray(parsed.historical_context.similar_trades)
            ? parsed.historical_context.similar_trades.slice(0, 3)
            : [],
          success_rate: typeof parsed.historical_context.success_rate === 'number'
            ? Math.max(0, Math.min(100, parsed.historical_context.success_rate))
            : 50,
          key_patterns: Array.isArray(parsed.historical_context.key_patterns)
            ? parsed.historical_context.key_patterns.slice(0, 5)
            : [],
          why_this_fails_historically: parsed.historical_context.why_this_fails_historically || null,
          what_works_instead: parsed.historical_context.what_works_instead || null,
        }
      }

      // Parse suggested trade for rejected trades
      if (parsed.suggested_trade && grade < 70) {
        suggestedTrade = {
          description: parsed.suggested_trade.description || '',
          chicago_sends: Array.isArray(parsed.suggested_trade.chicago_sends)
            ? parsed.suggested_trade.chicago_sends
            : [],
          chicago_receives: Array.isArray(parsed.suggested_trade.chicago_receives)
            ? parsed.suggested_trade.chicago_receives
            : [],
          why_this_works: parsed.suggested_trade.why_this_works || '',
          likelihood: parsed.suggested_trade.likelihood || 'possible',
          estimated_grade_improvement: typeof parsed.suggested_trade.estimated_grade_improvement === 'number'
            ? Math.max(0, Math.min(50, parsed.suggested_trade.estimated_grade_improvement))
            : 15,
        }
      }
    } catch {
      // CRITICAL: Still use deterministic grade on parse failure
      if (deterministicResult) {
        grade = deterministicResult.grade
        breakdown = {
          talent_balance: deterministicResult.breakdown?.talent_balance ?? 0.5,
          contract_value: deterministicResult.breakdown?.contract_value ?? 0.5,
          team_fit: deterministicResult.breakdown?.team_fit ?? 0.5,
          future_assets: deterministicResult.breakdown?.future_assets ?? 0.5,
        }
        reasoning = `Trade graded ${grade}/100 based on objective player value analysis.`
      } else {
        const gradeMatch = rawText.match(/(\d{1,3})/)
        grade = gradeMatch ? Math.max(0, Math.min(100, parseInt(gradeMatch[1]))) : 50
        reasoning = rawText || 'AI response could not be parsed.'
      }
    }

    const status = grade >= 70 ? 'accepted' : 'rejected'
    const is_dangerous = grade >= 70 && grade <= 90
    const userEmail = user?.email || 'guest'
    const sharedCode = randomBytes(6).toString('hex')

    let partnerTeamLogo: string | null = null
    let chicagoTeamLogo: string | null = null
    if (partner_team_key) {
      const { data: pt } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', partner_team_key)
        .eq('sport', sport)
        .single()
      partnerTeamLogo = pt?.logo_url || null
    }
    const { data: ct } = await datalabAdmin
      .from('gm_league_teams')
      .select('logo_url')
      .eq('team_key', chicago_team)
      .eq('sport', sport)
      .single()
    chicagoTeamLogo = ct?.logo_url || null

    const { data: trade, error: tradeError } = await datalabAdmin.from('gm_trades').insert({
      user_id: userId,
      user_email: userEmail,
      chicago_team,
      sport,
      trade_partner,
      players_sent: safePlayers_sent,
      players_received: safePlayers_received,
      grade,
      grade_reasoning: reasoning,
      status,
      is_dangerous,
      session_id: session_id || null,
      improvement_score: improvementScore,
      trade_summary: tradeSummary,
      ai_version: deterministicResult ? `gm_deterministic_${API_VERSION}_${MODEL_NAME}` : `gm_${API_VERSION}_${MODEL_NAME}`,
      shared_code: sharedCode,
      partner_team_key: partner_team_key || null,
      partner_team_logo: partnerTeamLogo,
      chicago_team_logo: chicagoTeamLogo,
      draft_picks_sent: safeDraft_picks_sent,
      draft_picks_received: safeDraft_picks_received,
      talent_balance: breakdown.talent_balance,
      contract_value: breakdown.contract_value,
      team_fit: breakdown.team_fit,
      future_assets: breakdown.future_assets,
    }).select().single()

    if (tradeError) throw tradeError

    const tradeItems: any[] = []
    for (const p of safePlayers_sent) {
      tradeItems.push({
        trade_id: trade.id,
        side: 'sent',
        asset_type: 'player',
        player_name: p.name,
        position: p.position,
        jersey_number: p.jersey_number || null,
        headshot_url: p.headshot_url || null,
        age: p.age || null,
        college: p.college || null,
        weight_lbs: p.weight_lbs || null,
        years_exp: p.years_exp || null,
        draft_info: p.draft_info || null,
        stat_line: p.stats || null,
        team_key: chicago_team,
        is_chicago_player: true,
        espn_player_id: p.espn_id || null,
      })
    }
    for (const p of safePlayers_received) {
      tradeItems.push({
        trade_id: trade.id,
        side: 'received',
        asset_type: 'player',
        player_name: p.name,
        position: p.position,
        team_key: partner_team_key || trade_partner,
        is_chicago_player: false,
      })
    }
    if (safeDraft_picks_sent.length > 0) {
      for (const pk of safeDraft_picks_sent) {
        tradeItems.push({
          trade_id: trade.id, side: 'sent', asset_type: 'pick',
          pick_year: pk.year, pick_round: pk.round, pick_condition: pk.condition || null,
          team_key: chicago_team, is_chicago_player: true,
        })
      }
    }
    if (safeDraft_picks_received.length > 0) {
      for (const pk of safeDraft_picks_received) {
        tradeItems.push({
          trade_id: trade.id, side: 'received', asset_type: 'pick',
          pick_year: pk.year, pick_round: pk.round, pick_condition: pk.condition || null,
          team_key: partner_team_key || trade_partner, is_chicago_player: false,
        })
      }
    }
    if (tradeItems.length > 0) {
      await datalabAdmin.from('gm_trade_items').insert(tradeItems)
    }

    await datalabAdmin.from('gm_audit_logs').insert({
      user_id: userId,
      trade_id: trade.id,
      request_payload: requestPayload,
      response_payload: { rawText, grade, reasoning, tradeSummary, improvementScore, breakdown, capAnalysis },
      model_name: MODEL_NAME,
      response_time_ms: responseTimeMs,
    })

    // Only update leaderboard for logged-in users
    if (!isGuest) {
    const { data: existing } = await datalabAdmin.from('gm_leaderboard').select('*').eq('user_id', userId).single()

    if (existing) {
      const newAccepted = (existing.accepted_count || 0) + (status === 'accepted' ? 1 : 0)
      const newRejected = (existing.rejected_count || 0) + (status === 'rejected' ? 1 : 0)
      const newDangerous = (existing.dangerous_count || 0) + (is_dangerous ? 1 : 0)
      const newTotalScore = status === 'accepted' ? (existing.total_score || 0) + grade : (existing.total_score || 0)
      const newTradesCount = (existing.trades_count || 0) + (status === 'accepted' ? 1 : 0)
      const newImprovement = (existing.total_improvement || 0) + (status === 'accepted' ? improvementScore : 0)
      const newBest = Math.max(existing.best_grade || 0, grade)
      const newWorst = Math.min(existing.worst_grade ?? 100, grade)
      const newAvg = newTradesCount > 0 ? Math.round((newTotalScore / newTradesCount) * 100) / 100 : 0

      let streak = existing.streak || 0
      if (status === 'accepted') streak += 1
      else streak = 0

      await datalabAdmin.from('gm_leaderboard').update({
        display_name: displayName,
        total_score: newTotalScore,
        trades_count: newTradesCount,
        avg_grade: newAvg,
        best_trade_id: grade > (existing.best_grade || 0) ? trade.id : existing.best_trade_id,
        total_improvement: newImprovement,
        best_grade: newBest,
        worst_grade: newWorst,
        accepted_count: newAccepted,
        rejected_count: newRejected,
        dangerous_count: newDangerous,
        favorite_team: chicago_team,
        streak,
        active_session_id: session_id || existing.active_session_id,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    } else {
      await datalabAdmin.from('gm_leaderboard').insert({
        user_id: userId,
        user_email: userEmail,
        display_name: displayName,
        total_score: status === 'accepted' ? grade : 0,
        trades_count: status === 'accepted' ? 1 : 0,
        avg_grade: status === 'accepted' ? grade : 0,
        best_trade_id: trade.id,
        total_improvement: status === 'accepted' ? improvementScore : 0,
        best_grade: grade,
        worst_grade: grade,
        accepted_count: status === 'accepted' ? 1 : 0,
        rejected_count: status === 'rejected' ? 1 : 0,
        dangerous_count: is_dangerous ? 1 : 0,
        favorite_team: chicago_team,
        streak: status === 'accepted' ? 1 : 0,
        active_session_id: session_id || null,
        updated_at: new Date().toISOString(),
      })
    }
    } // end if (!isGuest) for leaderboard

    if (session_id) {
      const { data: sess } = await datalabAdmin.from('gm_sessions').select('*').eq('id', session_id).single()
      if (sess) {
        await datalabAdmin.from('gm_sessions').update({
          num_trades: (sess.num_trades || 0) + 1,
          num_approved: (sess.num_approved || 0) + (status === 'accepted' ? 1 : 0),
          num_dangerous: (sess.num_dangerous || 0) + (is_dangerous ? 1 : 0),
          num_failed: (sess.num_failed || 0) + (status === 'rejected' ? 1 : 0),
          total_improvement: +(((sess.total_improvement || 0) + (status === 'accepted' ? improvementScore : 0)).toFixed(2)),
          updated_at: new Date().toISOString(),
        }).eq('id', session_id)
      }
    }

    // Fetch data freshness
    const dataFreshness = await getDataFreshness(chicago_team, sport)

    return NextResponse.json({
      grade,
      reasoning,
      status,
      is_dangerous,
      trade_id: trade.id,
      shared_code: sharedCode,
      trade_summary: tradeSummary,
      improvement_score: improvementScore,
      breakdown,
      cap_analysis: capAnalysis,
      // New Feb 2026 fields
      historical_context: historicalContext,
      enhanced_suggested_trade: suggestedTrade,
      data_freshness: dataFreshness,
    })

  } catch (error) {
    console.error('GM grade error:', error)

    try {
      const user = await getGMAuthUser(request)
      await datalabAdmin.from('gm_errors').insert({
        user_id: user?.id,
        error_type: 'ai',
        error_message: String(error),
        request_payload: null,
      })
    } catch {}

    return NextResponse.json({ error: 'Failed to grade trade' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/roster/route.ts

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
  gmRosterTeamKey: string // Team key in gm_*_rosters tables
}> = {
  // NOTE: gmRosterTeamKey must match the team_key values in gm_*_rosters tables
  // These are lowercase full team names (bears, bulls, etc.) NOT abbreviations
  bears: { table: 'bears_players', activeCol: 'is_active', sport: 'nfl', nameCol: 'name', statsTable: 'bears_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025, gmRosterTeamKey: 'bears' },
  bulls: { table: 'bulls_players', activeCol: 'is_current_bulls', sport: 'nba', nameCol: 'display_name', statsTable: 'bulls_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2026, gmRosterTeamKey: 'bulls' },
  blackhawks: { table: 'blackhawks_players', activeCol: 'is_active', sport: 'nhl', nameCol: 'name', statsTable: 'blackhawks_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2026, gmRosterTeamKey: 'blackhawks' },
  cubs: { table: 'cubs_players', activeCol: 'is_active', sport: 'mlb', nameCol: 'name', statsTable: 'cubs_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025, gmRosterTeamKey: 'cubs' },
  whitesox: { table: 'whitesox_players', activeCol: 'is_active', sport: 'mlb', nameCol: 'name', statsTable: 'whitesox_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025, gmRosterTeamKey: 'whitesox' },
}

type TrendDirection = 'hot' | 'rising' | 'stable' | 'declining' | 'cold'

interface PlayerData {
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
  stats: Record<string, number | string | null>
  // Contract fields
  base_salary?: number | null
  cap_hit?: number | null
  contract_years?: number | null
  contract_expires_year?: number | null
  contract_signed_year?: number | null
  is_rookie_deal?: boolean | null
  status?: string
  // V2 Enhanced fields
  trend?: TrendDirection | null
  performance_vs_projection?: number | null
  market_sentiment?: 'buy' | 'hold' | 'sell' | null
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

  let players: PlayerData[] = (rawPlayers || []).map((p: any) => {
    const draftInfo = p.draft_year && p.draft_round
      ? `${p.draft_year} R${p.draft_round}${p.draft_pick ? ` P${p.draft_pick}` : ''}`
      : null

    return {
      player_id: p.espn_player_id?.toString() || p.full_name,
      full_name: p.full_name || 'Unknown',
      position: p.position || 'Unknown',
      jersey_number: p.jersey_number,
      headshot_url: p.headshot_url,
      age: p.age,
      weight_lbs: p.weight_lbs,
      college: p.college,
      years_exp: p.years_exp,
      draft_info: draftInfo,
      espn_id: p.espn_player_id?.toString() || null,
      stat_line: '',
      stats: {},
      status: p.status || 'Active',
      base_salary: p.base_salary,
      cap_hit: p.cap_hit,
      contract_years: p.contract_years_remaining,
      contract_expires_year: p.contract_expires_year,
      contract_signed_year: p.contract_signed_year,
      is_rookie_deal: p.is_rookie_deal,
      // V2 fields - populated from Data Lab when available
      trend: (p as any).trend || null,
      performance_vs_projection: (p as any).performance_vs_projection || null,
      market_sentiment: (p as any).market_sentiment || null,
    }
  })

  if (search) {
    players = players.filter(p => p.full_name.toLowerCase().includes(search))
  }
  if (posFilter && posFilter !== 'ALL') {
    players = players.filter(p => p.position === posFilter)
  }

  return players
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Please sign in to use the GM Trade Simulator', code: 'AUTH_REQUIRED' }, { status: 401 })

    const search = request.nextUrl.searchParams.get('search')?.toLowerCase()
    const posFilter = request.nextUrl.searchParams.get('position')

    // Opponent roster path: team_key + sport params
    const teamKey = request.nextUrl.searchParams.get('team_key')
    const sportParam = request.nextUrl.searchParams.get('sport')
    if (teamKey && sportParam) {
      const players = await fetchOpponentRoster(teamKey, sportParam, search || undefined, posFilter || undefined)
      return NextResponse.json({ players, sport: sportParam })
    }

    // Chicago roster path: team param
    // Use GM roster tables for consistent data (including age, contract info)
    const team = request.nextUrl.searchParams.get('team')
    if (!team || !TEAM_CONFIG[team]) {
      return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
    }

    const config = TEAM_CONFIG[team]

    // Use GM roster tables for Chicago teams - they have complete data including age
    const players = await fetchOpponentRoster(
      config.gmRosterTeamKey,
      config.sport,
      search || undefined,
      posFilter || undefined
    )

    // Check if roster data exists for this team
    if (players.length === 0) {
      console.warn(`[GM Roster] No players found for ${team} (team_key: ${config.gmRosterTeamKey})`)
      return NextResponse.json({
        players: [],
        sport: config.sport,
        warning: `Roster data for ${team.charAt(0).toUpperCase() + team.slice(1)} is being updated. Please check back soon.`,
        code: 'ROSTER_UNAVAILABLE'
      })
    }

    // Fetch stats and build stat lines for Chicago players
    const statsMap = await fetchSeasonStats(team, config)
    const playersWithStats = players.map(p => {
      const playerStats = statsMap.get(p.espn_id || p.player_id) || {}
      const statLine = buildStatLine(config.sport, playerStats, p.position)
      return {
        ...p,
        stat_line: statLine || p.stat_line,
        stats: { ...p.stats, ...playerStats },
      }
    })

    return NextResponse.json({ players: playersWithStats, sport: config.sport })
  } catch (error) {
    console.error('GM roster error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/roster' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 })
  }
}

async function fetchSeasonStats(
  team: string,
  config: typeof TEAM_CONFIG[string]
): Promise<Map<string, Record<string, any>>> {
  const map = new Map<string, Record<string, any>>()

  try {
    if (config.sport === 'nfl') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, passing_yards, passing_touchdowns, passing_interceptions, rushing_yards, rushing_touchdowns, rushing_carries, receiving_yards, receiving_touchdowns, receiving_receptions, defensive_total_tackles, defensive_sacks')
        .eq('season', config.seasonValue)
        .eq('is_opponent', false)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, pass_yds: 0, pass_td: 0, pass_int: 0, rush_yds: 0, rush_td: 0, rush_car: 0, rec_yds: 0, rec_td: 0, rec: 0, tackles: 0, sacks: 0 })
          const a = agg.get(pid)!
          a.games++
          a.pass_yds += s.passing_yards || 0
          a.pass_td += s.passing_touchdowns || 0
          a.pass_int += s.passing_interceptions || 0
          a.rush_yds += s.rushing_yards || 0
          a.rush_td += s.rushing_touchdowns || 0
          a.rush_car += s.rushing_carries || 0
          a.rec_yds += s.receiving_yards || 0
          a.rec_td += s.receiving_touchdowns || 0
          a.rec += s.receiving_receptions || 0
          a.tackles += s.defensive_total_tackles || 0
          a.sacks += s.defensive_sacks || 0
        }
        agg.forEach((v, k) => map.set(k, v))
      }
    } else if (config.sport === 'nba') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, points, total_rebounds, assists, steals, blocks, field_goal_pct, three_point_pct')
        .eq('season', config.seasonValue)
        .eq('is_opponent', false)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, fg_pct_sum: 0, tp_pct_sum: 0 })
          const a = agg.get(pid)!
          a.games++
          a.pts += s.points || 0
          a.reb += s.total_rebounds || 0
          a.ast += s.assists || 0
          a.stl += s.steals || 0
          a.blk += s.blocks || 0
          a.fg_pct_sum += s.field_goal_pct || 0
          a.tp_pct_sum += s.three_point_pct || 0
        }
        agg.forEach((v, k) => {
          if (v.games > 0) {
            map.set(k, {
              games: v.games,
              ppg: +(v.pts / v.games).toFixed(1),
              rpg: +(v.reb / v.games).toFixed(1),
              apg: +(v.ast / v.games).toFixed(1),
              spg: +(v.stl / v.games).toFixed(1),
              bpg: +(v.blk / v.games).toFixed(1),
              fg_pct: +(v.fg_pct_sum / v.games).toFixed(1),
              tp_pct: +(v.tp_pct_sum / v.games).toFixed(1),
            })
          }
        })
      }
    } else if (config.sport === 'nhl') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, goals, assists, points, plus_minus, shots_on_goal')
        .eq('season', config.seasonValue)
        .eq('is_opponent', false)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, goals: 0, assists: 0, points: 0, pm: 0, shots: 0 })
          const a = agg.get(pid)!
          a.games++
          a.goals += s.goals || 0
          a.assists += s.assists || 0
          a.points += s.points || 0
          a.pm += s.plus_minus || 0
          a.shots += s.shots_on_goal || 0
        }
        agg.forEach((v, k) => map.set(k, v))
      }
    } else if (config.sport === 'mlb') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, at_bats, hits, home_runs, rbi, runs, stolen_bases, walks, strikeouts, innings_pitched, earned_runs, strikeouts_pitched, win, loss, save')
        .eq('season', config.seasonValue)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, ab: 0, h: 0, hr: 0, rbi: 0, r: 0, sb: 0, bb: 0, k: 0, ip: 0, er: 0, kp: 0, w: 0, l: 0, sv: 0 })
          const a = agg.get(pid)!
          a.games++
          a.ab += s.at_bats || 0
          a.h += s.hits || 0
          a.hr += s.home_runs || 0
          a.rbi += s.rbi || 0
          a.r += s.runs || 0
          a.sb += s.stolen_bases || 0
          a.bb += s.walks || 0
          a.k += s.strikeouts || 0
          a.ip += s.innings_pitched || 0
          a.er += s.earned_runs || 0
          a.kp += s.strikeouts_pitched || 0
          a.w += s.win ? 1 : 0
          a.l += s.loss ? 1 : 0
          a.sv += s.save ? 1 : 0
        }
        agg.forEach((v, k) => {
          const avg = v.ab > 0 ? (v.h / v.ab) : 0
          const era = v.ip > 0 ? (v.er / v.ip * 9) : 0
          map.set(k, { ...v, avg: +avg.toFixed(3), era: +era.toFixed(2) })
        })
      }
    }
  } catch (e) {
    console.error('Stats fetch error:', e)
  }

  return map
}

function buildStatLine(sport: string, stats: Record<string, any>, position: string): string {
  if (!stats || !stats.games) return ''

  if (sport === 'nfl') {
    if (stats.pass_yds > 100) return `${stats.pass_yds.toLocaleString()} YDS / ${stats.pass_td} TD / ${stats.pass_int} INT`
    if (stats.rush_car > 10) return `${stats.rush_yds} YDS / ${stats.rush_td} TD`
    if (stats.rec > 5) return `${stats.rec} REC / ${stats.rec_yds} YDS / ${stats.rec_td} TD`
    if (stats.tackles > 5) return `${stats.tackles} TKL / ${stats.sacks} SCK`
    return `${stats.games} GP`
  }
  if (sport === 'nba') {
    return `${stats.ppg} PPG / ${stats.rpg} RPG / ${stats.apg} APG`
  }
  if (sport === 'nhl') {
    return `${stats.goals}G / ${stats.assists}A / ${stats.points}P`
  }
  if (sport === 'mlb') {
    if (stats.ip > 10) return `${stats.w}-${stats.l} / ${stats.era} ERA / ${stats.kp} K`
    if (stats.ab > 10) return `.${stats.avg.toString().replace('0.', '')} / ${stats.hr} HR / ${stats.rbi} RBI`
    return `${stats.games} GP`
  }
  return ''
}

```

---

### src/app/api/gm/teams/route.ts

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
      .limit(150) // Ensure we get all teams (max ~32 per sport)

    if (sport) {
      query = query.eq('sport', sport)
    }

    // Exclude the Chicago team from opponent list
    if (excludeTeam) {
      query = query.neq('team_key', excludeTeam)
    }

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
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/teams' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/trades/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Sign in to view your trade history and track your best deals', code: 'AUTH_REQUIRED' }, { status: 401 })

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

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

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
    console.error('GM trades error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/trades GET' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    // Guests can't delete trades (they don't have any)
    if (!user) return NextResponse.json({ error: 'Please sign in to manage your trades', code: 'AUTH_REQUIRED' }, { status: 401 })

    await datalabAdmin
      .from('gm_sessions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    await datalabAdmin.from('gm_trades').delete().eq('user_id', user.id)
    await datalabAdmin.from('gm_leaderboard').delete().eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GM trades delete error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/trades DELETE' }) } catch {}
    return NextResponse.json({ error: 'Failed to clear trades' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/cap/route.ts

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
    if (!user) return NextResponse.json({ error: 'Please sign in to use the GM Trade Simulator', code: 'AUTH_REQUIRED' }, { status: 401 })

    const teamKey = request.nextUrl.searchParams.get('team_key')
    const sport = request.nextUrl.searchParams.get('sport')

    if (!teamKey || !sport || !SPORT_CAP_TABLE[sport]) {
      return NextResponse.json({ error: 'team_key and valid sport required' }, { status: 400 })
    }

    const table = SPORT_CAP_TABLE[sport]

    const { data, error } = await datalabAdmin
      .from(table)
      .select('total_cap, cap_used, cap_available, dead_money')
      .eq('team_key', teamKey)
      .order('season', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // Table may not exist yet — return null gracefully
      return NextResponse.json({ cap: null })
    }

    return NextResponse.json({ cap: data })
  } catch (error) {
    console.error('GM cap error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/cap' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch cap data' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/fit/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export interface TeamFitResult {
  player_name: string
  player_espn_id?: string
  target_team: string
  overall_fit: number // 0-100
  breakdown: {
    positional_need: number // 0-100: How much does the team need this position?
    age_fit: number // 0-100: Does player's age fit team's window?
    cap_fit: number // 0-100: Can the team afford this player?
    scheme_fit: number // 0-100: Does player fit team's system?
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
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const playerEspnId = request.nextUrl.searchParams.get('player_espn_id')
    const playerName = request.nextUrl.searchParams.get('player_name')
    const targetTeam = request.nextUrl.searchParams.get('target_team')
    const sport = request.nextUrl.searchParams.get('sport')

    if (!targetTeam || !sport) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (!playerEspnId && !playerName) {
      return NextResponse.json({ error: 'Must provide player_espn_id or player_name' }, { status: 400 })
    }

    // Call Data Lab for comprehensive fit analysis
    const params = new URLSearchParams({
      target_team: targetTeam,
      sport,
    })
    if (playerEspnId) params.append('player_espn_id', playerEspnId)
    if (playerName) params.append('player_name', playerName)

    const res = await fetch(`${DATALAB_URL}/api/gm/fit?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
        'X-User-Id': user.id,
      },
    })

    if (!res.ok) {
      // Return a fallback fit analysis if Data Lab is unavailable
      console.error('Data Lab fit error:', res.status)
      return NextResponse.json({
        player_name: playerName || 'Player',
        player_espn_id: playerEspnId,
        target_team: targetTeam,
        overall_fit: 70,
        breakdown: {
          positional_need: 70,
          age_fit: 70,
          cap_fit: 70,
          scheme_fit: 70,
        },
        insights: {
          positional_need: 'Analysis unavailable',
          age_fit: 'Analysis unavailable',
          cap_fit: 'Analysis unavailable',
          scheme_fit: 'Analysis unavailable',
        },
        recommendation: 'Full analysis requires Data Lab connection.',
      } as TeamFitResult)
    }

    const datalabResult = await res.json()
    return NextResponse.json(datalabResult)
  } catch (error) {
    console.error('GM fit error:', error)
    return NextResponse.json({ error: 'Failed to analyze team fit' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/validate/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

async function getSessionWithToken() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

interface ValidateRequest {
  chicago_team: string
  partner_team_key: string
  players_sent: Array<{
    name: string
    position: string
    espn_id?: string | null
    cap_hit?: number | null
    age?: number | null
  }>
  players_received: Array<{
    name: string
    position: string
    espn_id?: string | null
    cap_hit?: number | null
    age?: number | null
  }>
  draft_picks_sent?: Array<{ year: number; round: number; condition?: string }>
  draft_picks_received?: Array<{ year: number; round: number; condition?: string }>
}

export interface ValidationResult {
  status: 'valid' | 'warning' | 'invalid'
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    code: string
    message: string
    player_name?: string
  }>
  cap_impact?: {
    chicago_delta: number
    partner_delta: number
    chicago_over_cap: boolean
    partner_over_cap: boolean
  }
  roster_impact?: {
    chicago_roster_size_after: number
    partner_roster_size_after: number
    position_conflicts: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithToken()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: ValidateRequest = await request.json()

    // Basic client-side validation first
    const quickIssues: ValidationResult['issues'] = []

    // Check for empty trade
    if (body.players_sent.length === 0 && (!body.draft_picks_sent || body.draft_picks_sent.length === 0)) {
      quickIssues.push({
        severity: 'error',
        code: 'EMPTY_SENT',
        message: 'You must send at least one player or draft pick',
      })
    }

    if (body.players_received.length === 0 && (!body.draft_picks_received || body.draft_picks_received.length === 0)) {
      quickIssues.push({
        severity: 'error',
        code: 'EMPTY_RECEIVED',
        message: 'You must receive at least one player or draft pick',
      })
    }

    // Check for untouchable players (Chicago)
    const untouchablePlayers = ['Caleb Williams', 'Connor Bedard']
    for (const player of body.players_sent) {
      if (untouchablePlayers.some(u => player.name.toLowerCase().includes(u.toLowerCase()))) {
        quickIssues.push({
          severity: 'error',
          code: 'UNTOUCHABLE_PLAYER',
          message: `${player.name} is untouchable and cannot be traded`,
          player_name: player.name,
        })
      }
    }

    // If quick validation fails, return immediately
    if (quickIssues.some(i => i.severity === 'error')) {
      return NextResponse.json({
        status: 'invalid',
        issues: quickIssues,
      } as ValidationResult)
    }

    // Call Data Lab for comprehensive validation
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const res = await fetch(`${DATALAB_URL}/api/gm/validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      // If Data Lab validation fails, return client-side validation only
      console.error('Data Lab validation error:', res.status)
      return NextResponse.json({
        status: quickIssues.length > 0 ? 'warning' : 'valid',
        issues: quickIssues,
      } as ValidationResult)
    }

    const datalabResult = await res.json()
    return NextResponse.json(datalabResult)
  } catch (error) {
    console.error('GM validate error:', error)
    // Return permissive response on error to not block users
    return NextResponse.json({
      status: 'valid',
      issues: [],
    } as ValidationResult)
  }
}

```

---

### src/app/api/gm/sessions/route.ts

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
    if (!user) return NextResponse.json({ error: 'Sign in to save your trade sessions and track your GM career', code: 'AUTH_REQUIRED' }, { status: 401 })

    const { data: sessions, error } = await datalabAdmin
      .from('gm_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('GM sessions error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/sessions GET' }) } catch {}
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
          chicago_team,
          sport: TEAM_SPORT_MAP[chicago_team],
          is_active: true,
          num_trades: 0,
          num_approved: 0,
          num_dangerous: 0,
          num_failed: 0,
          total_improvement: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    }

    await datalabAdmin
      .from('gm_sessions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('chicago_team', chicago_team)
      .eq('is_active', true)

    const { data: session, error } = await datalabAdmin
      .from('gm_sessions')
      .insert({
        user_id: user.id,
        user_email: user.email || 'unknown',
        chicago_team,
        sport: TEAM_SPORT_MAP[chicago_team],
        session_name: session_name || `${chicago_team.charAt(0).toUpperCase() + chicago_team.slice(1)} Trade Session`,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    await datalabAdmin
      .from('gm_leaderboard')
      .update({ active_session_id: session.id })
      .eq('user_id', user.id)

    return NextResponse.json({ session })
  } catch (error) {
    console.error('GM session create error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/sessions POST' }) } catch {}
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/preferences/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

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

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Try Data Lab first
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/preferences?user_id=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local storage
    }

    // Fallback to local database
    const { data: prefs } = await datalabAdmin
      .from('gm_user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefs) {
      return NextResponse.json({
        preferences: {
          risk_tolerance: prefs.risk_tolerance || DEFAULT_PREFERENCES.risk_tolerance,
          favorite_team: prefs.favorite_team || DEFAULT_PREFERENCES.favorite_team,
          team_phase: prefs.team_phase || DEFAULT_PREFERENCES.team_phase,
          preferred_trade_style: prefs.preferred_trade_style || DEFAULT_PREFERENCES.preferred_trade_style,
          cap_flexibility_priority: prefs.cap_flexibility_priority || DEFAULT_PREFERENCES.cap_flexibility_priority,
          age_preference: prefs.age_preference || DEFAULT_PREFERENCES.age_preference,
        } as GMPreferences,
      })
    }

    return NextResponse.json({ preferences: DEFAULT_PREFERENCES })
  } catch (error) {
    console.error('GM preferences GET error:', error)
    return NextResponse.json({ preferences: DEFAULT_PREFERENCES })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const preferences: Partial<GMPreferences> = body.preferences || {}

    // Validate preferences
    const validRiskTolerance = ['conservative', 'moderate', 'aggressive']
    const validTeamPhase = ['rebuilding', 'contending', 'win_now', 'auto']
    const validTradeStyle = ['balanced', 'star_hunting', 'depth_building', 'draft_focused']
    const validCapPriority = ['low', 'medium', 'high']
    const validAgePref = ['young', 'prime', 'veteran', 'any']

    if (preferences.risk_tolerance && !validRiskTolerance.includes(preferences.risk_tolerance)) {
      return NextResponse.json({ error: 'Invalid risk_tolerance' }, { status: 400 })
    }
    if (preferences.team_phase && !validTeamPhase.includes(preferences.team_phase)) {
      return NextResponse.json({ error: 'Invalid team_phase' }, { status: 400 })
    }
    if (preferences.preferred_trade_style && !validTradeStyle.includes(preferences.preferred_trade_style)) {
      return NextResponse.json({ error: 'Invalid preferred_trade_style' }, { status: 400 })
    }
    if (preferences.cap_flexibility_priority && !validCapPriority.includes(preferences.cap_flexibility_priority)) {
      return NextResponse.json({ error: 'Invalid cap_flexibility_priority' }, { status: 400 })
    }
    if (preferences.age_preference && !validAgePref.includes(preferences.age_preference)) {
      return NextResponse.json({ error: 'Invalid age_preference' }, { status: 400 })
    }

    // Try Data Lab first
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
        body: JSON.stringify({ user_id: user.id, preferences }),
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local storage
    }

    // Fallback to local database upsert
    const { error } = await datalabAdmin
      .from('gm_user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('GM preferences upsert error:', error)
      // Even if save fails, return success to not block the user
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error('GM preferences POST error:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/leaderboard/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport to team
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
      return NextResponse.json({
        error: 'Sign in to view the GM leaderboard and compete with other fans',
        code: 'AUTH_REQUIRED',
      }, { status: 401 })
    }

    const team = request.nextUrl.searchParams.get('team')
    const sport = request.nextUrl.searchParams.get('sport')
    const limitParam = request.nextUrl.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    // Determine team filter from sport or direct team param
    let teamFilter = team
    if (sport && SPORT_TO_TEAM[sport]) {
      teamFilter = SPORT_TO_TEAM[sport]
    }

    let query = datalabAdmin
      .from('gm_leaderboard')
      .select('*, users:user_id(username, email)')
      .order('total_improvement', { ascending: false })
      .limit(limit)

    if (teamFilter) {
      query = query.eq('favorite_team', teamFilter)
    }

    const { data: leaderboard, error } = await query
    if (error) throw error

    // Get total count for the sport
    let countQuery = datalabAdmin
      .from('gm_leaderboard')
      .select('id', { count: 'exact', head: true })

    if (teamFilter) {
      countQuery = countQuery.eq('favorite_team', teamFilter)
    }

    const { count: totalParticipants } = await countQuery

    // Add rank to each entry
    const rankedLeaderboard = leaderboard?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      score: entry.total_improvement || 0,
      activities_count: (entry.total_trades || 0) + (entry.total_drafts || 0) + (entry.total_sims || 0),
      trades_count: entry.total_trades || 0,
      drafts_count: entry.total_drafts || 0,
      sims_count: entry.total_sims || 0,
    })) || []

    // Get current month info
    const now = new Date()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']

    // Calculate days remaining in month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = lastDay - now.getDate()

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      total_participants: totalParticipants || 0,
      sport: sport || (teamFilter ? Object.keys(SPORT_TO_TEAM).find(s => SPORT_TO_TEAM[s] === teamFilter) : 'ALL'),
      month: now.getMonth() + 1,
      month_name: monthNames[now.getMonth()],
      year: now.getFullYear(),
      days_remaining: daysRemaining,
      status: 'active',
    })
  } catch (error) {
    console.error('GM leaderboard error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/leaderboard',
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/user-position/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

/**
 * GET /api/gm/user-position
 *
 * Get the current user's position in the leaderboard for a specific sport.
 * Returns their rank, score, and activities even if not in top 20.
 * This is PRIVATE data - only the user themselves can see it.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({
        error: 'Sign in to view your leaderboard position',
        code: 'AUTH_REQUIRED',
      }, { status: 401 })
    }

    const sport = request.nextUrl.searchParams.get('sport') || 'NFL'

    // Get current month/year
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Map sport to team for GM leaderboard (use existing gm_leaderboard table)
    const sportToTeam: Record<string, string> = {
      'NFL': 'bears',
      'NBA': 'bulls',
      'MLB': 'cubs',
      'NHL': 'blackhawks',
    }
    const favoriteTeam = sportToTeam[sport] || 'bears'

    // First, get ALL entries for the sport to calculate rank
    const { data: allEntries, error: allError } = await datalabAdmin
      .from('gm_leaderboard')
      .select('user_id, total_improvement, total_trades, total_drafts, total_sims')
      .eq('favorite_team', favoriteTeam)
      .order('total_improvement', { ascending: false })

    if (allError) throw allError

    // Find user's position
    const userIndex = allEntries?.findIndex(e => e.user_id === user.id) ?? -1

    if (userIndex === -1) {
      // User has no entries for this sport
      return NextResponse.json({
        user_id: user.id,
        sport,
        competing: false,
        message: `You haven't made any ${sport} trades or drafts yet.`,
      })
    }

    const userEntry = allEntries[userIndex]
    const totalParticipants = allEntries.length

    // Get user's detailed stats from gm_trades
    const { data: userTrades, error: tradesError } = await datalabAdmin
      .from('gm_trades')
      .select('grade, is_accepted, created_at')
      .eq('user_id', user.id)
      .eq('sport', sport)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastActivityAt = userTrades?.[0]?.created_at || null

    // Calculate percentile
    const percentile = Math.round(100 - ((userIndex + 1) / totalParticipants) * 100)

    // Get what score is needed for top 20
    const top20Cutoff = allEntries.length >= 20 ? allEntries[19].total_improvement : 0

    return NextResponse.json({
      user_id: user.id,
      sport,
      competing: true,
      rank: userIndex + 1,
      score: userEntry.total_improvement || 0,
      activities_count: (userEntry.total_trades || 0) + (userEntry.total_drafts || 0) + (userEntry.total_sims || 0),
      trades_count: userEntry.total_trades || 0,
      drafts_count: userEntry.total_drafts || 0,
      sims_count: userEntry.total_sims || 0,
      total_participants: totalParticipants,
      percentile,
      last_activity_at: lastActivityAt,
      top20_cutoff: top20Cutoff,
      points_to_top20: userIndex >= 20 ? Math.max(0, top20Cutoff - (userEntry.total_improvement || 0)) : 0,
    })
  } catch (error) {
    console.error('User position error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/user-position',
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch position' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/user-score/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

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
  feedback_json: any
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

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's combined score
    const { data: userScore } = await datalabAdmin
      .from('gm_user_scores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user's recent mock drafts (using the view if available, fallback to base table)
    let mockDrafts: MockDraft[] = []

    // Try gm_mock_drafts view first (has new scoring columns)
    const { data: viewMocks, error: viewError } = await datalabAdmin
      .from('gm_mock_drafts')
      .select(`
        id, chicago_team, sport, draft_year, completed, completed_at,
        mock_score, value_score, need_fit_score, upside_risk_score,
        mock_grade_letter, is_best_of_three, feedback_json, created_at
      `)
      .eq('user_id', user.id)
      .eq('is_reset', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!viewError && viewMocks) {
      mockDrafts = viewMocks
    } else {
      // Fallback to draft_mocks base table
      const { data: baseMocks } = await datalabAdmin
        .from('draft_mocks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_reset', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (baseMocks) {
        mockDrafts = baseMocks.map(m => ({
          id: m.id,
          chicago_team: m.chicago_team,
          sport: m.league?.toLowerCase() || m.sport || 'nfl',
          draft_year: m.draft_year,
          completed: m.completed,
          completed_at: m.completed_at,
          mock_score: m.mock_score,
          value_score: m.value_score,
          need_fit_score: m.need_fit_score,
          upside_risk_score: m.upside_risk_score,
          mock_grade_letter: m.mock_grade_letter,
          is_best_of_three: m.is_best_of_three || false,
          feedback_json: m.feedback_json,
          created_at: m.created_at,
        }))
      }
    }

    // Get trade analytics for comparison
    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('grade, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const tradeStats = {
      total: trades?.length || 0,
      accepted: trades?.filter(t => t.status === 'accepted').length || 0,
      average_grade: trades && trades.length > 0
        ? Math.round((trades.reduce((a, t) => a + t.grade, 0) / trades.length) * 10) / 10
        : 0,
    }

    return NextResponse.json({
      user_score: userScore || {
        user_id: user.id,
        combined_gm_score: null,
        best_trade_score: tradeStats.average_grade || null,
        best_mock_draft_score: null,
        best_mock_draft_id: null,
        trade_count: tradeStats.total,
        mock_count: mockDrafts.filter(m => m.completed).length,
        trade_weight: 0.60,
        mock_weight: 0.40,
      },
      mock_drafts: mockDrafts,
      trade_stats: tradeStats,
    })
  } catch (error) {
    console.error('User score error:', error)
    return NextResponse.json({ error: 'Failed to fetch user score' }, { status: 500 })
  }
}

// Set best mock draft for combined scoring
export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id } = body

    if (!mock_id) {
      return NextResponse.json({ error: 'mock_id is required' }, { status: 400 })
    }

    // Verify the mock belongs to the user
    const { data: mock } = await datalabAdmin
      .from('draft_mocks')
      .select('id, user_id')
      .eq('id', mock_id)
      .single()

    if (!mock || mock.user_id !== user.id) {
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Clear any existing best_of_three for this user
    await datalabAdmin
      .from('draft_mocks')
      .update({ is_best_of_three: false })
      .eq('user_id', user.id)
      .eq('is_best_of_three', true)

    // Set the selected mock as best
    await datalabAdmin
      .from('draft_mocks')
      .update({ is_best_of_three: true })
      .eq('id', mock_id)

    // Recalculate combined score
    await updateCombinedUserScore(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set best mock error:', error)
    return NextResponse.json({ error: 'Failed to set best mock' }, { status: 500 })
  }
}

// Helper function to update combined score
async function updateCombinedUserScore(userId: string) {
  // Get trade score from gm_leaderboard
  const { data: leaderboard } = await datalabAdmin
    .from('gm_leaderboard')
    .select('avg_grade, trades_count')
    .eq('user_id', userId)
    .single()

  const tradeScore = leaderboard?.avg_grade || null
  const tradeCount = leaderboard?.trades_count || 0

  // Get best mock score
  let bestMock: { id: string; mock_score: number } | null = null

  const { data: bestOfThreeMock } = await datalabAdmin
    .from('draft_mocks')
    .select('id, mock_score')
    .eq('user_id', userId)
    .eq('is_reset', false)
    .eq('is_best_of_three', true)
    .single()

  if (bestOfThreeMock) {
    bestMock = bestOfThreeMock
  } else {
    const { data: highestMock } = await datalabAdmin
      .from('draft_mocks')
      .select('id, mock_score')
      .eq('user_id', userId)
      .eq('is_reset', false)
      .eq('completed', true)
      .not('mock_score', 'is', null)
      .order('mock_score', { ascending: false })
      .limit(1)
      .single()
    bestMock = highestMock
  }

  const mockScore = bestMock?.mock_score || null

  // Count completed mocks
  const { count: mockCount } = await datalabAdmin
    .from('draft_mocks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_reset', false)
    .eq('completed', true)

  // Calculate combined score
  let combinedScore: number | null = null
  if (tradeScore !== null && mockScore !== null) {
    combinedScore = (tradeScore * 0.60) + (mockScore * 0.40)
  } else if (tradeScore !== null) {
    combinedScore = tradeScore
  } else if (mockScore !== null) {
    combinedScore = mockScore
  }

  // Upsert gm_user_scores
  await datalabAdmin
    .from('gm_user_scores')
    .upsert({
      user_id: userId,
      best_trade_score: tradeScore,
      trade_count: tradeCount,
      best_mock_draft_id: bestMock?.id || null,
      best_mock_draft_score: mockScore,
      mock_count: mockCount || 0,
      combined_gm_score: combinedScore ? Math.round(combinedScore * 10) / 10 : null,
      trade_weight: 0.60,
      mock_weight: 0.40,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
}

```

---

### src/app/api/gm/analytics/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

interface AnalyticsResult {
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  dangerous_trades: number
  average_grade: number
  highest_grade: number
  lowest_grade: number
  total_gm_score: number
  grade_distribution: Array<{
    bucket: string // "0-10", "10-20", etc.
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

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Try Data Lab first
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/analytics?user_id=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local analytics
    }

    // Local analytics from database
    const { data: trades, error } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        total_trades: 0,
        accepted_trades: 0,
        rejected_trades: 0,
        dangerous_trades: 0,
        average_grade: 0,
        highest_grade: 0,
        lowest_grade: 0,
        total_gm_score: 0,
        grade_distribution: [],
        trading_partners: [],
        position_analysis: [],
        activity_timeline: [],
        chicago_teams: [],
      } as AnalyticsResult)
    }

    // Calculate analytics
    const accepted = trades.filter(t => t.status === 'accepted')
    const rejected = trades.filter(t => t.status === 'rejected')
    const dangerous = trades.filter(t => t.is_dangerous)

    const grades = trades.map(t => t.grade)
    const avgGrade = grades.reduce((a, b) => a + b, 0) / grades.length

    // Grade distribution
    const buckets = Array(10).fill(0)
    trades.forEach(t => {
      const idx = Math.min(9, Math.floor(t.grade / 10))
      buckets[idx]++
    })
    const gradeDistribution = buckets.map((count, i) => ({
      bucket: `${i * 10}-${(i + 1) * 10}`,
      count,
      percentage: Math.round((count / trades.length) * 100),
    }))

    // Trading partners
    const partnerMap = new Map<string, { count: number; totalGrade: number; key: string }>()
    trades.forEach(t => {
      const existing = partnerMap.get(t.trade_partner) || { count: 0, totalGrade: 0, key: t.partner_team_key || '' }
      partnerMap.set(t.trade_partner, {
        count: existing.count + 1,
        totalGrade: existing.totalGrade + t.grade,
        key: existing.key || t.partner_team_key || '',
      })
    })
    const tradingPartners = Array.from(partnerMap.entries())
      .map(([name, data]) => ({
        team_name: name,
        team_key: data.key,
        trade_count: data.count,
        avg_grade: Math.round(data.totalGrade / data.count),
      }))
      .sort((a, b) => b.trade_count - a.trade_count)
      .slice(0, 10)

    // Position analysis
    const positionMap = new Map<string, { sent: number; received: number; value: number }>()
    trades.forEach(t => {
      (t.players_sent || []).forEach((p: any) => {
        const existing = positionMap.get(p.position) || { sent: 0, received: 0, value: 0 }
        positionMap.set(p.position, { ...existing, sent: existing.sent + 1 })
      })
      ;(t.players_received || []).forEach((p: any) => {
        const existing = positionMap.get(p.position) || { sent: 0, received: 0, value: 0 }
        positionMap.set(p.position, { ...existing, received: existing.received + 1 })
      })
    })
    const positionAnalysis = Array.from(positionMap.entries())
      .map(([position, data]) => ({
        position,
        sent_count: data.sent,
        received_count: data.received,
        net_value: data.received - data.sent,
      }))
      .sort((a, b) => b.sent_count + b.received_count - (a.sent_count + a.received_count))

    // Activity timeline (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentTrades = trades.filter(t => new Date(t.created_at) >= thirtyDaysAgo)
    const dateMap = new Map<string, { count: number; totalGrade: number }>()
    recentTrades.forEach(t => {
      const date = new Date(t.created_at).toISOString().split('T')[0]
      const existing = dateMap.get(date) || { count: 0, totalGrade: 0 }
      dateMap.set(date, { count: existing.count + 1, totalGrade: existing.totalGrade + t.grade })
    })
    const activityTimeline = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        trade_count: data.count,
        avg_grade: Math.round(data.totalGrade / data.count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Chicago teams
    const chicagoMap = new Map<string, { count: number; totalGrade: number; accepted: number }>()
    trades.forEach(t => {
      const existing = chicagoMap.get(t.chicago_team) || { count: 0, totalGrade: 0, accepted: 0 }
      chicagoMap.set(t.chicago_team, {
        count: existing.count + 1,
        totalGrade: existing.totalGrade + t.grade,
        accepted: existing.accepted + (t.status === 'accepted' ? 1 : 0),
      })
    })
    const chicagoTeams = Array.from(chicagoMap.entries())
      .map(([team, data]) => ({
        team,
        trade_count: data.count,
        avg_grade: Math.round(data.totalGrade / data.count),
        accepted_rate: Math.round((data.accepted / data.count) * 100),
      }))
      .sort((a, b) => b.trade_count - a.trade_count)

    const result: AnalyticsResult = {
      total_trades: trades.length,
      accepted_trades: accepted.length,
      rejected_trades: rejected.length,
      dangerous_trades: dangerous.length,
      average_grade: Math.round(avgGrade * 10) / 10,
      highest_grade: Math.max(...grades),
      lowest_grade: Math.min(...grades),
      total_gm_score: accepted.reduce((sum, t) => sum + t.grade, 0),
      grade_distribution: gradeDistribution,
      trading_partners: tradingPartners,
      position_analysis: positionAnalysis,
      activity_timeline: activityTimeline,
      chicago_teams: chicagoTeams,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('GM analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/audit/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const MODEL_NAME = 'claude-sonnet-4-20250514'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const AUDITOR_SYSTEM_PROMPT = `You are GM Auditor, an expert sports trade analyst who validates trade grades.

CRITICAL: You will be provided with VERIFIED_PLAYER_DATA from our database. This data is authoritative and current.
DO NOT use your training data to contradict the verified database information about:
- Player teams (use verified_team from database)
- Contract values (use verified salary/cap_hit from database)
- Contract years (use verified contract info from database)

Your job is to:
1. Review the GM's methodology (did they properly value players, contracts, draft picks?)
2. Check if the grade justification makes sense given the trade assets
3. Verify the trade logic is sound (not contradict verified player data)

Return your audit as valid JSON with this structure:
{
  "audit_grade": "A" | "B" | "C" | "D" | "F",
  "audit_score": 0-100,
  "confidence": 0-100,
  "validation_summary": {
    "fields_validated": number,
    "fields_confirmed": number,
    "fields_conflicting": number,
    "fields_unverified": number
  },
  "discrepancies": [
    {
      "field": "methodology",
      "gm_value": "value used",
      "actual_value": "correct value",
      "severity": "minor" | "moderate" | "major",
      "sources_checked": ["Database", "Trade Logic"]
    }
  ],
  "overall_assessment": "Brief 1-2 sentence summary of audit findings",
  "recommendations": {
    "for_user": ["Things the user should know about this trade grade"]
  }
}

Grade the audit based on:
- A (90-100): GM grade is highly accurate, methodology sound, no major issues
- B (80-89): GM grade is good, minor issues or missing context
- C (70-79): GM grade has some problems, methodology questionable
- D (60-69): GM grade has significant issues, likely incorrect
- F (<60): GM grade is fundamentally flawed

IMPORTANT: Trust the VERIFIED_PLAYER_DATA provided. Do not claim players are on different teams than what the database shows.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to audit trades', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { trade_id } = body

    if (!trade_id) {
      return NextResponse.json({ error: 'trade_id is required' }, { status: 400 })
    }

    // Check if audit already exists (cached)
    const { data: existingAudit } = await datalabAdmin
      .from('gm_audits')
      .select('*')
      .eq('trade_id', trade_id)
      .single()

    if (existingAudit) {
      // Return cached audit with proper field mapping
      return NextResponse.json({
        audit_id: existingAudit.id,
        audit_grade: existingAudit.audit_grade,
        audit_score: existingAudit.audit_score,
        confidence: existingAudit.confidence,
        validation_summary: {
          fields_validated: existingAudit.fields_validated || 0,
          fields_confirmed: existingAudit.fields_confirmed || 0,
          fields_conflicting: existingAudit.fields_conflicting || 0,
          fields_unverified: existingAudit.fields_unverified || 0,
        },
        discrepancies: existingAudit.discrepancies || [],
        recommendations: existingAudit.recommendations || { for_user: [] },
        overall_assessment: existingAudit.overall_assessment || '',
        cached: true,
      })
    }

    // Fetch the trade to audit - try by shared_code first (most common), then by id
    let tradeData: any = null

    // Try by shared_code first (what the frontend passes)
    const { data: tradeByCode } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .eq('shared_code', trade_id)
      .single()

    if (tradeByCode) {
      tradeData = tradeByCode
    } else {
      // Try by UUID id
      const { data: tradeById } = await datalabAdmin
        .from('gm_trades')
        .select('*')
        .eq('id', trade_id)
        .single()

      if (tradeById) {
        tradeData = tradeById
      }
    }

    if (!tradeData) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Fetch trade items for detailed player/pick data
    const { data: tradeItems } = await datalabAdmin
      .from('gm_trade_items')
      .select('*')
      .eq('trade_id', tradeData.id)

    // Fetch verified player data from roster tables
    const sport = tradeData.sport?.toLowerCase() || 'nfl'
    const rosterTable = `gm_${sport}_rosters`

    // Get all player names from the trade
    const allPlayerNames: string[] = []
    if (tradeData.players_sent) {
      const sent = Array.isArray(tradeData.players_sent) ? tradeData.players_sent : []
      sent.forEach((p: any) => p?.name && allPlayerNames.push(p.name))
    }
    if (tradeData.players_received) {
      const received = Array.isArray(tradeData.players_received) ? tradeData.players_received : []
      received.forEach((p: any) => p?.name && allPlayerNames.push(p.name))
    }

    // Fetch verified player data from database
    let verifiedPlayerData: any[] = []
    if (allPlayerNames.length > 0) {
      const { data: rosterData } = await datalabAdmin
        .from(rosterTable)
        .select('player_name, team_name, team_key, position, age, salary, cap_hit, contract_years, contract_value')
        .in('player_name', allPlayerNames)

      verifiedPlayerData = rosterData || []
    }

    // Build the audit request message
    const auditRequest = {
      trade_id: tradeData.id,
      sport: tradeData.sport,
      chicago_team: tradeData.chicago_team,
      trade_partner: tradeData.trade_partner,
      players_sent: tradeData.players_sent,
      players_received: tradeData.players_received,
      draft_picks_sent: tradeData.draft_picks_sent || [],
      draft_picks_received: tradeData.draft_picks_received || [],
      gm_grade: tradeData.grade,
      gm_reasoning: tradeData.grade_reasoning,
      gm_cap_analysis: tradeData.cap_analysis || '',
      gm_breakdown: {
        talent_balance: tradeData.talent_balance,
        contract_value: tradeData.contract_value,
        team_fit: tradeData.team_fit,
        future_assets: tradeData.future_assets
      },
      trade_summary: tradeData.trade_summary,
      trade_items: tradeItems || []
    }

    const userMessage = `Please audit the following trade grade:

TRADE DATA:
\`\`\`json
${JSON.stringify(auditRequest, null, 2)}
\`\`\`

VERIFIED_PLAYER_DATA (from our database - this is authoritative and current):
\`\`\`json
${JSON.stringify(verifiedPlayerData, null, 2)}
\`\`\`

Review the GM's methodology and grade justification. Use the VERIFIED_PLAYER_DATA as the source of truth for player teams, contracts, and salaries. Return your audit as valid JSON only, no other text.`

    // Call Claude for audit
    const response = await getAnthropic().messages.create({
      model: MODEL_NAME,
      max_tokens: 2048,
      temperature: 0,
      system: AUDITOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseTimeMs = Date.now() - startTime
    const textContent = response.content.find(c => c.type === 'text')
    const rawText = textContent?.type === 'text' ? textContent.text : ''

    // Parse audit response
    let auditResult: any
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        auditResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('[GM Audit] Failed to parse response:', parseError, rawText)
      // Return a default error audit
      auditResult = {
        audit_grade: 'C',
        audit_score: 70,
        confidence: 50,
        validation_summary: {
          fields_validated: 0,
          fields_confirmed: 0,
          fields_conflicting: 0,
          fields_unverified: 0
        },
        discrepancies: [],
        overall_assessment: 'Audit completed with limited validation. Please try again.',
        recommendations: { for_user: ['The audit could not fully validate this trade grade.'] }
      }
    }

    // Save audit to database
    const auditRecord = {
      trade_id: tradeData.id,
      audit_grade: auditResult.audit_grade || 'C',
      audit_score: auditResult.audit_score || 70,
      confidence: auditResult.confidence || 50,
      fields_validated: auditResult.validation_summary?.fields_validated || 0,
      fields_confirmed: auditResult.validation_summary?.fields_confirmed || 0,
      fields_conflicting: auditResult.validation_summary?.fields_conflicting || 0,
      fields_unverified: auditResult.validation_summary?.fields_unverified || 0,
      discrepancies: auditResult.discrepancies || [],
      recommendations: auditResult.recommendations || {},
      overall_assessment: auditResult.overall_assessment || '',
      sport: tradeData.sport,
      chicago_team: tradeData.chicago_team,
      gm_grade: tradeData.grade,
      auditor_model: MODEL_NAME,
      response_time_ms: responseTimeMs
    }

    const { data: savedAudit, error: saveError } = await datalabAdmin
      .from('gm_audits')
      .insert(auditRecord)
      .select()
      .single()

    if (saveError) {
      console.error('[GM Audit] Failed to save audit:', saveError)
      // Still return the audit result even if save fails
    }

    return NextResponse.json({
      audit_id: savedAudit?.id || null,
      audit_grade: auditResult.audit_grade,
      audit_score: auditResult.audit_score,
      confidence: auditResult.confidence,
      validation_summary: auditResult.validation_summary,
      discrepancies: auditResult.discrepancies || [],
      overall_assessment: auditResult.overall_assessment,
      recommendations: auditResult.recommendations || { for_user: [] },
      response_time_ms: responseTimeMs,
      gm_grade: tradeData.grade,
      trade_summary: tradeData.trade_summary
    })

  } catch (error) {
    console.error('[GM Audit] Error:', error)

    // Log error
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'audit_error',
        error_message: String(error),
        route: '/api/gm/audit',
      })
    } catch (logError) {
      console.error('[GM Audit] Failed to log error:', logError)
    }

    return NextResponse.json(
      { error: 'Failed to audit trade' },
      { status: 500 }
    )
  }
}

```

---

### src/app/api/gm/share/[code]/route.ts

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
    console.error('GM share error:', error)
    return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/scenarios/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export type ScenarioType =
  | 'player_improvement'
  | 'player_decline'
  | 'injury_impact'
  | 'add_pick'
  | 'remove_player'
  | 'age_progression'

export interface ScenarioRequest {
  trade_id: string
  original_grade: number
  scenario_type: ScenarioType
  parameters: {
    // player_improvement / player_decline
    improvement_pct?: number // -50 to +50
    player_name?: string

    // injury_impact
    injured_player?: string
    injury_severity?: 'minor' | 'major' | 'season_ending'

    // add_pick
    pick_year?: number
    pick_round?: number
    pick_side?: 'sent' | 'received'

    // remove_player
    removed_player?: string
    removed_side?: 'sent' | 'received'

    // age_progression
    years_forward?: number // 1, 2, or 3
  }
}

export interface ScenarioResult {
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
  probability?: number // For injury scenarios
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: ScenarioRequest = await request.json()

    if (!body.trade_id || !body.scenario_type || body.original_grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate scenario type
    const validTypes: ScenarioType[] = [
      'player_improvement',
      'player_decline',
      'injury_impact',
      'add_pick',
      'remove_player',
      'age_progression',
    ]
    if (!validTypes.includes(body.scenario_type)) {
      return NextResponse.json({ error: 'Invalid scenario type' }, { status: 400 })
    }

    // Call Data Lab for scenario analysis
    const res = await fetch(`${DATALAB_URL}/api/gm/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
        'X-User-Id': user.id,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      // Return a simulated scenario result if Data Lab is unavailable
      console.error('Data Lab scenarios error:', res.status)
      const simulated = simulateScenario(body)
      return NextResponse.json(simulated)
    }

    const datalabResult = await res.json()
    return NextResponse.json(datalabResult)
  } catch (error) {
    console.error('GM scenarios error:', error)
    return NextResponse.json({ error: 'Failed to analyze scenario' }, { status: 500 })
  }
}

// Fallback simulation when Data Lab is unavailable
function simulateScenario(req: ScenarioRequest): ScenarioResult {
  const { scenario_type, original_grade, parameters } = req
  let delta = 0
  let description = ''
  let reasoning = ''

  switch (scenario_type) {
    case 'player_improvement':
      const improvePct = parameters.improvement_pct || 10
      delta = Math.round(improvePct / 3)
      description = `${parameters.player_name || 'Player'} improves by ${improvePct}%`
      reasoning = `If ${parameters.player_name || 'the player'} improves performance by ${improvePct}%, the trade value increases. This scenario assumes development matching the projected improvement.`
      break

    case 'player_decline':
      const declinePct = parameters.improvement_pct || -10
      delta = Math.round(declinePct / 3)
      description = `${parameters.player_name || 'Player'} declines by ${Math.abs(declinePct)}%`
      reasoning = `Performance decline of ${Math.abs(declinePct)}% would negatively impact the trade value. Consider the player's injury history and age when evaluating this risk.`
      break

    case 'injury_impact':
      const severityImpact = {
        minor: -3,
        major: -8,
        season_ending: -15,
      }
      delta = severityImpact[parameters.injury_severity || 'minor']
      description = `${parameters.injured_player || 'Player'} suffers ${parameters.injury_severity || 'minor'} injury`
      reasoning = `A ${parameters.injury_severity || 'minor'} injury would significantly impact the trade value. Factor in the team's depth at this position when evaluating risk.`
      break

    case 'add_pick':
      const roundValue = [0, 12, 8, 5, 3, 2, 1, 1]
      const pickValue = roundValue[parameters.pick_round || 1] || 1
      delta = parameters.pick_side === 'received' ? pickValue : -pickValue
      description = `Add ${parameters.pick_year || 2026} Round ${parameters.pick_round || 1} pick to ${parameters.pick_side === 'received' ? 'receiving' : 'sending'} side`
      reasoning = `Adding a ${parameters.pick_year || 2026} Round ${parameters.pick_round || 1} pick ${parameters.pick_side === 'received' ? 'improves' : 'decreases'} the trade value by ${Math.abs(delta)} points.`
      break

    case 'remove_player':
      delta = parameters.removed_side === 'sent' ? 5 : -5
      description = `Remove ${parameters.removed_player || 'player'} from ${parameters.removed_side === 'sent' ? 'sending' : 'receiving'} side`
      reasoning = `Removing ${parameters.removed_player || 'the player'} from the ${parameters.removed_side === 'sent' ? 'sending' : 'receiving'} side ${parameters.removed_side === 'sent' ? 'improves' : 'decreases'} the trade balance.`
      break

    case 'age_progression':
      const yearsForward = parameters.years_forward || 1
      delta = -yearsForward * 2
      description = `Project trade ${yearsForward} year${yearsForward > 1 ? 's' : ''} forward`
      reasoning = `After ${yearsForward} year${yearsForward > 1 ? 's' : ''}, player aging and contract situations change the trade's long-term value. Younger players and draft picks gain relative value.`
      break
  }

  const adjustedGrade = Math.max(0, Math.min(100, original_grade + delta))

  return {
    scenario_type,
    description,
    original_grade,
    adjusted_grade: adjustedGrade,
    grade_delta: delta,
    reasoning,
    breakdown_changes: {
      talent_balance_delta: delta * 0.3,
      contract_value_delta: delta * 0.2,
      team_fit_delta: delta * 0.25,
      future_assets_delta: delta * 0.25,
    },
  }
}

```

---

### src/app/api/gm/simulate/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

interface SimulationRequest {
  trade_id: string
  original_grade: number
  num_simulations?: number // default 1000
  player_volatility?: 'low' | 'medium' | 'high' // How much player performance varies
  injury_factor?: boolean // Include injury risk
  development_factor?: boolean // Include player development curves
}

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
    grade_bucket: number // 0-10, 10-20, etc.
    count: number
    percentage: number
  }>
  risk_analysis: {
    downside_risk: number // % chance of grade below 50
    upside_potential: number // % chance of grade above 80
    variance_band: [number, number] // 90% confidence interval
  }
  key_factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    magnitude: number
    description: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: SimulationRequest = await request.json()

    if (!body.trade_id || body.original_grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const numSimulations = body.num_simulations || 1000

    // Try Data Lab first for proper Monte Carlo
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local simulation
    }

    // Local Monte Carlo simulation
    const result = runLocalSimulation(body.original_grade, numSimulations, {
      volatility: body.player_volatility || 'medium',
      includeInjury: body.injury_factor ?? true,
      includeDevelopment: body.development_factor ?? true,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GM simulate error:', error)
    return NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 })
  }
}

function runLocalSimulation(
  originalGrade: number,
  numSimulations: number,
  options: { volatility: string; includeInjury: boolean; includeDevelopment: boolean }
): SimulationResult {
  // Volatility affects the standard deviation
  const volatilityMap = { low: 5, medium: 10, high: 18 }
  const baseStdDev = volatilityMap[options.volatility as keyof typeof volatilityMap] || 10

  // Run simulations
  const results: number[] = []
  const buckets: number[] = Array(10).fill(0)

  for (let i = 0; i < numSimulations; i++) {
    let simGrade = originalGrade

    // Base random variance (normal distribution approximation using Box-Muller)
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    simGrade += z * baseStdDev

    // Injury factor - can significantly lower grade
    if (options.includeInjury && Math.random() < 0.15) { // 15% injury chance
      const severityDrop = -Math.random() * 20 // Up to -20 points
      simGrade += severityDrop
    }

    // Development factor - slight positive bias for younger player trades
    if (options.includeDevelopment) {
      const devBonus = (Math.random() - 0.4) * 8 // Slight positive skew
      simGrade += devBonus
    }

    // Clamp to 0-100
    simGrade = Math.max(0, Math.min(100, Math.round(simGrade)))
    results.push(simGrade)

    // Add to bucket
    const bucketIdx = Math.min(9, Math.floor(simGrade / 10))
    buckets[bucketIdx]++
  }

  // Sort for percentile calculations
  results.sort((a, b) => a - b)

  // Calculate statistics
  const mean = results.reduce((a, b) => a + b, 0) / numSimulations
  const median = results[Math.floor(numSimulations / 2)]
  const variance = results.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numSimulations
  const stdDev = Math.sqrt(variance)

  // Percentiles
  const percentile = (p: number) => results[Math.floor((p / 100) * numSimulations)]

  // Distribution
  const distribution = buckets.map((count, i) => ({
    grade_bucket: i * 10,
    count,
    percentage: Math.round((count / numSimulations) * 100),
  }))

  // Risk analysis
  const belowFifty = results.filter(g => g < 50).length
  const aboveEighty = results.filter(g => g >= 80).length

  // Key factors
  const keyFactors = [
    {
      factor: 'Player Volatility',
      impact: options.volatility === 'high' ? 'negative' : 'neutral' as 'positive' | 'negative' | 'neutral',
      magnitude: options.volatility === 'high' ? 0.7 : options.volatility === 'medium' ? 0.4 : 0.2,
      description: `${options.volatility.charAt(0).toUpperCase() + options.volatility.slice(1)} player performance variance increases outcome uncertainty.`,
    },
    {
      factor: 'Injury Risk',
      impact: 'negative' as const,
      magnitude: options.includeInjury ? 0.5 : 0,
      description: options.includeInjury ? 'Injury scenarios can significantly impact trade value.' : 'Injury risk not factored.',
    },
    {
      factor: 'Development Potential',
      impact: 'positive' as const,
      magnitude: options.includeDevelopment ? 0.3 : 0,
      description: options.includeDevelopment ? 'Player development curve may improve long-term value.' : 'Development not factored.',
    },
  ]

  return {
    num_simulations: numSimulations,
    original_grade: originalGrade,
    mean_grade: Math.round(mean * 10) / 10,
    median_grade: median,
    std_deviation: Math.round(stdDev * 10) / 10,
    percentiles: {
      p5: percentile(5),
      p10: percentile(10),
      p25: percentile(25),
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
      p95: percentile(95),
    },
    distribution,
    risk_analysis: {
      downside_risk: Math.round((belowFifty / numSimulations) * 100),
      upside_potential: Math.round((aboveEighty / numSimulations) * 100),
      variance_band: [percentile(5), percentile(95)],
    },
    key_factors: keyFactors,
  }
}

```

---

### src/app/api/gm/sim/season/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import type {
  SimulationResult,
  TeamStanding,
  PlayoffMatchup,
  ChampionshipResult,
  SeasonSummary,
} from '@/types/gm'

// League configurations
const LEAGUE_CONFIG: Record<string, {
  conferences: [string, string]
  divisions: Record<string, string[]>
  playoffTeams: number
  gamesPerSeason: number
  seriesLength: number
  playoffRounds: string[]
}> = {
  nfl: {
    conferences: ['AFC', 'NFC'],
    divisions: {
      'AFC North': ['BAL', 'CIN', 'CLE', 'PIT'],
      'AFC South': ['HOU', 'IND', 'JAX', 'TEN'],
      'AFC East': ['BUF', 'MIA', 'NE', 'NYJ'],
      'AFC West': ['KC', 'LV', 'LAC', 'DEN'],
      'NFC North': ['CHI', 'DET', 'GB', 'MIN'],
      'NFC South': ['ATL', 'CAR', 'NO', 'TB'],
      'NFC East': ['DAL', 'NYG', 'PHI', 'WAS'],
      'NFC West': ['ARI', 'LA', 'SF', 'SEA'],
    },
    playoffTeams: 7,
    gamesPerSeason: 17,
    seriesLength: 1,
    playoffRounds: ['Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl'],
  },
  nba: {
    conferences: ['Eastern', 'Western'],
    divisions: {
      'Atlantic': ['BOS', 'BKN', 'NYK', 'PHI', 'TOR'],
      'Central': ['CHI', 'CLE', 'DET', 'IND', 'MIL'],
      'Southeast': ['ATL', 'CHA', 'MIA', 'ORL', 'WAS'],
      'Northwest': ['DEN', 'MIN', 'OKC', 'POR', 'UTA'],
      'Pacific': ['GSW', 'LAC', 'LAL', 'PHX', 'SAC'],
      'Southwest': ['DAL', 'HOU', 'MEM', 'NOP', 'SAS'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Conference Semifinals', 'Conference Finals', 'NBA Finals'],
  },
  nhl: {
    conferences: ['Eastern', 'Western'],
    divisions: {
      'Atlantic': ['BOS', 'BUF', 'DET', 'FLA', 'MTL', 'OTT', 'TB', 'TOR'],
      'Metropolitan': ['CAR', 'CBJ', 'NJ', 'NYI', 'NYR', 'PHI', 'PIT', 'WAS'],
      'Central': ['ARI', 'CHI', 'COL', 'DAL', 'MIN', 'NSH', 'STL', 'WPG'],
      'Pacific': ['ANA', 'CGY', 'EDM', 'LA', 'SJ', 'SEA', 'VAN', 'VGK'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Second Round', 'Conference Finals', 'Stanley Cup Finals'],
  },
  mlb: {
    conferences: ['American League', 'National League'],
    divisions: {
      'AL East': ['BAL', 'BOS', 'NYY', 'TB', 'TOR'],
      'AL Central': ['CHW', 'CLE', 'DET', 'KC', 'MIN'],
      'AL West': ['HOU', 'LAA', 'OAK', 'SEA', 'TEX'],
      'NL East': ['ATL', 'MIA', 'NYM', 'PHI', 'WAS'],
      'NL Central': ['CHC', 'CIN', 'MIL', 'PIT', 'STL'],
      'NL West': ['ARI', 'COL', 'LAD', 'SD', 'SF'],
    },
    playoffTeams: 6,
    gamesPerSeason: 162,
    seriesLength: 5, // varies but simplify
    playoffRounds: ['Wild Card', 'Division Series', 'Championship Series', 'World Series'],
  },
}

// Team display info
const TEAM_INFO: Record<string, { name: string; city: string; color: string }> = {
  // NFL
  'CHI': { name: 'Bears', city: 'Chicago', color: '#0B162A' },
  'DET': { name: 'Lions', city: 'Detroit', color: '#0076B6' },
  'GB': { name: 'Packers', city: 'Green Bay', color: '#203731' },
  'MIN': { name: 'Vikings', city: 'Minnesota', color: '#4F2683' },
  'KC': { name: 'Chiefs', city: 'Kansas City', color: '#E31837' },
  'BUF': { name: 'Bills', city: 'Buffalo', color: '#00338D' },
  'SF': { name: '49ers', city: 'San Francisco', color: '#AA0000' },
  'PHI': { name: 'Eagles', city: 'Philadelphia', color: '#004C54' },
  'DAL': { name: 'Cowboys', city: 'Dallas', color: '#003594' },
  'BAL': { name: 'Ravens', city: 'Baltimore', color: '#241773' },
  // NBA
  'BOS': { name: 'Celtics', city: 'Boston', color: '#007A33' },
  'MIL': { name: 'Bucks', city: 'Milwaukee', color: '#00471B' },
  'CLE': { name: 'Cavaliers', city: 'Cleveland', color: '#6F263D' },
  'NYK': { name: 'Knicks', city: 'New York', color: '#006BB6' },
  'DEN': { name: 'Nuggets', city: 'Denver', color: '#0E2240' },
  'OKC': { name: 'Thunder', city: 'Oklahoma City', color: '#007AC1' },
  'LAL': { name: 'Lakers', city: 'Los Angeles', color: '#552583' },
  // NHL
  'COL': { name: 'Avalanche', city: 'Colorado', color: '#6F263D' },
  'FLA': { name: 'Panthers', city: 'Florida', color: '#041E42' },
  'EDM': { name: 'Oilers', city: 'Edmonton', color: '#041E42' },
  'VGK': { name: 'Golden Knights', city: 'Vegas', color: '#B4975A' },
  // MLB
  'CHC': { name: 'Cubs', city: 'Chicago', color: '#0E3386' },
  'CHW': { name: 'White Sox', city: 'Chicago', color: '#27251F' },
  'NYY': { name: 'Yankees', city: 'New York', color: '#003087' },
  'LAD': { name: 'Dodgers', city: 'Los Angeles', color: '#005A9C' },
  'ATL': { name: 'Braves', city: 'Atlanta', color: '#CE1141' },
  'HOU': { name: 'Astros', city: 'Houston', color: '#002D62' },
}

// Chicago team mappings
const CHICAGO_TEAMS: Record<string, { abbrev: string; conference: string; division: string }> = {
  'chicago-bears': { abbrev: 'CHI', conference: 'NFC', division: 'NFC North' },
  'chicago-bulls': { abbrev: 'CHI', conference: 'Eastern', division: 'Central' },
  'chicago-blackhawks': { abbrev: 'CHI', conference: 'Western', division: 'Central' },
  'chicago-cubs': { abbrev: 'CHC', conference: 'National League', division: 'NL Central' },
  'chicago-white-sox': { abbrev: 'CHW', conference: 'American League', division: 'AL Central' },
}

function getTeamInfo(abbrev: string, sport: string) {
  const info = TEAM_INFO[abbrev] || { name: abbrev, city: '', color: '#666666' }
  return {
    teamKey: abbrev.toLowerCase(),
    teamName: info.city ? `${info.city} ${info.name}` : info.name,
    abbreviation: abbrev,
    logoUrl: `https://a.espncdn.com/i/teamlogos/${sport}/500/${abbrev.toLowerCase()}.png`,
    primaryColor: info.color,
  }
}

// Generate random season record with variance
function generateRecord(baseWins: number, variance: number, gamesPerSeason: number): { wins: number; losses: number } {
  const wins = Math.max(0, Math.min(gamesPerSeason, Math.round(baseWins + (Math.random() - 0.5) * variance * 2)))
  return { wins, losses: gamesPerSeason - wins }
}

// Simulate playoff series
function simulateSeries(team1Strength: number, team2Strength: number, seriesLength: number): [number, number] {
  const winsNeeded = Math.ceil(seriesLength / 2)
  let wins1 = 0, wins2 = 0

  while (wins1 < winsNeeded && wins2 < winsNeeded) {
    const team1Prob = team1Strength / (team1Strength + team2Strength)
    if (Math.random() < team1Prob) wins1++
    else wins2++
  }

  return [wins1, wins2]
}

/**
 * POST /api/gm/sim/season
 * Generate full season simulation with standings, playoffs, and championship
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, sport, teamKey, seasonYear } = body

    if (!sessionId || !sport || !teamKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, sport, teamKey' },
        { status: 400 }
      )
    }

    // Get session trades to calculate impact
    const { data: session } = await datalabAdmin
      .from('gm_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .eq('session_id', sessionId)

    const acceptedTrades = (trades || []).filter(t => t.status === 'accepted')
    const totalImprovement = acceptedTrades.reduce((sum, t) => sum + (t.improvement_score || 0), 0)
    const avgGrade = acceptedTrades.length > 0
      ? acceptedTrades.reduce((sum, t) => sum + t.grade, 0) / acceptedTrades.length
      : 50

    const config = LEAGUE_CONFIG[sport]
    if (!config) {
      return NextResponse.json({ success: false, error: 'Invalid sport' }, { status: 400 })
    }

    const chicagoInfo = CHICAGO_TEAMS[teamKey]
    if (!chicagoInfo) {
      return NextResponse.json({ success: false, error: 'Invalid team' }, { status: 400 })
    }

    // Generate baseline and modified records
    const baselineWinPct = sport === 'nfl' ? 0.5 : sport === 'mlb' ? 0.5 : 0.45
    const baselineWins = Math.round(config.gamesPerSeason * baselineWinPct)

    // Trade impact: each improvement point = ~0.5-1 wins
    const winBoost = Math.round(totalImprovement * 0.75)
    const modifiedWins = Math.max(0, Math.min(config.gamesPerSeason, baselineWins + winBoost))

    const baseline = {
      wins: baselineWins,
      losses: config.gamesPerSeason - baselineWins,
      madePlayoffs: baselineWins > config.gamesPerSeason * 0.55,
      playoffSeed: baselineWins > config.gamesPerSeason * 0.55 ? Math.ceil(Math.random() * 4) + 3 : undefined,
    }

    const modified = {
      wins: modifiedWins,
      losses: config.gamesPerSeason - modifiedWins,
      madePlayoffs: modifiedWins > config.gamesPerSeason * 0.52,
      playoffSeed: modifiedWins > config.gamesPerSeason * 0.52 ? Math.max(1, 8 - Math.floor(winBoost / 2)) : undefined,
    }

    // Generate full standings
    const standings: { conference1: TeamStanding[]; conference2: TeamStanding[]; conference1Name: string; conference2Name: string } = {
      conference1: [],
      conference2: [],
      conference1Name: config.conferences[0],
      conference2Name: config.conferences[1],
    }

    // Get all teams by conference
    const allTeams: { abbrev: string; division: string; conference: string }[] = []
    for (const [div, teams] of Object.entries(config.divisions)) {
      const conf = div.includes('NFC') || div.includes('Eastern') || div.includes('National') || div.includes('NL')
        ? config.conferences[1]
        : config.conferences[0]
      for (const abbrev of teams) {
        allTeams.push({ abbrev, division: div, conference: conf })
      }
    }

    // Generate records for all teams
    const teamRecords = allTeams.map(team => {
      const isChicago = team.abbrev === chicagoInfo.abbrev
      const isTradePartner = acceptedTrades.some(t =>
        t.partner_team_key?.toUpperCase() === team.abbrev
      )

      let wins: number, losses: number

      if (isChicago) {
        wins = modifiedWins
        losses = config.gamesPerSeason - wins
      } else if (isTradePartner) {
        // Trade partners may be negatively impacted
        const partnerImpact = -Math.round(totalImprovement * 0.3)
        const partnerBase = Math.round(config.gamesPerSeason * (0.45 + Math.random() * 0.15))
        wins = Math.max(10, partnerBase + partnerImpact)
        losses = config.gamesPerSeason - wins
      } else {
        // Random other teams
        const strength = 0.35 + Math.random() * 0.35
        wins = Math.round(config.gamesPerSeason * strength)
        losses = config.gamesPerSeason - wins
      }

      const info = getTeamInfo(team.abbrev, sport)
      return {
        ...info,
        wins,
        losses,
        winPct: wins / config.gamesPerSeason,
        division: team.division,
        conference: team.conference,
        divisionRank: 0,
        conferenceRank: 0,
        playoffSeed: null as number | null,
        gamesBack: 0,
        isUserTeam: isChicago,
        isTradePartner,
        tradeImpact: isChicago ? winBoost : isTradePartner ? -Math.round(totalImprovement * 0.3) : undefined,
      }
    })

    // Sort by conference and assign ranks
    for (const conf of config.conferences) {
      const confTeams = teamRecords
        .filter(t => t.conference === conf)
        .sort((a, b) => b.winPct - a.winPct)

      confTeams.forEach((team, idx) => {
        team.conferenceRank = idx + 1
        if (idx < config.playoffTeams) {
          team.playoffSeed = idx + 1
        }
      })

      // Calculate games back
      const leader = confTeams[0]
      confTeams.forEach(team => {
        team.gamesBack = (leader.wins - team.wins) / 2
      })

      if (conf === config.conferences[0]) {
        standings.conference1 = confTeams
      } else {
        standings.conference2 = confTeams
      }
    }

    // Generate playoffs
    const playoffTeams1 = standings.conference1.filter(t => t.playoffSeed).slice(0, config.playoffTeams)
    const playoffTeams2 = standings.conference2.filter(t => t.playoffSeed).slice(0, config.playoffTeams)

    const bracket: PlayoffMatchup[] = []
    let currentRound1 = [...playoffTeams1]
    let currentRound2 = [...playoffTeams2]

    let userTeamEliminated = false
    let userEliminatedRound: number | undefined
    let userEliminatedBy: string | undefined
    let userWonChampionship = false

    // Simulate each round
    for (let round = 1; round <= config.playoffRounds.length; round++) {
      const roundName = config.playoffRounds[round - 1]
      const isFinals = round === config.playoffRounds.length

      if (isFinals) {
        // Championship round - conference winners face off
        if (currentRound1.length === 1 && currentRound2.length === 1) {
          const home = currentRound1[0]
          const away = currentRound2[0]
          const homeStrength = 50 + home.wins
          const awayStrength = 50 + away.wins
          const [homeWins, awayWins] = simulateSeries(homeStrength, awayStrength, config.seriesLength)
          const winner = homeWins > awayWins ? 'home' : 'away'

          const userInvolved = home.isUserTeam || away.isUserTeam
          if (userInvolved) {
            if ((home.isUserTeam && winner === 'home') || (away.isUserTeam && winner === 'away')) {
              userWonChampionship = true
            } else {
              userTeamEliminated = true
              userEliminatedRound = round
              userEliminatedBy = winner === 'home' ? home.teamName : away.teamName
            }
          }

          bracket.push({
            round,
            roundName,
            homeTeam: { ...home, seed: home.playoffSeed!, wins: home.wins },
            awayTeam: { ...away, seed: away.playoffSeed!, wins: away.wins },
            seriesWins: [homeWins, awayWins],
            winner,
            isComplete: true,
            gamesPlayed: homeWins + awayWins,
            userTeamInvolved: userInvolved,
          })
        }
      } else {
        // Conference rounds
        for (const [confTeams, confName] of [[currentRound1, config.conferences[0]], [currentRound2, config.conferences[1]]] as const) {
          const nextRound: TeamStanding[] = []

          for (let i = 0; i < confTeams.length / 2; i++) {
            const home = confTeams[i]
            const away = confTeams[confTeams.length - 1 - i]
            if (!home || !away) continue

            const homeStrength = 50 + home.wins + (home.playoffSeed! <= 2 ? 5 : 0)
            const awayStrength = 50 + away.wins
            const [homeWins, awayWins] = simulateSeries(homeStrength, awayStrength, config.seriesLength)
            const winner = homeWins > awayWins ? 'home' : 'away'

            const userInvolved = home.isUserTeam || away.isUserTeam
            if (userInvolved && !userTeamEliminated) {
              if ((home.isUserTeam && winner === 'away') || (away.isUserTeam && winner === 'home')) {
                userTeamEliminated = true
                userEliminatedRound = round
                userEliminatedBy = winner === 'home' ? home.teamName : away.teamName
              }
            }

            bracket.push({
              round,
              roundName: `${roundName} - ${confName}`,
              homeTeam: { ...home, seed: home.playoffSeed!, wins: home.wins },
              awayTeam: { ...away, seed: away.playoffSeed!, wins: away.wins },
              seriesWins: [homeWins, awayWins],
              winner,
              isComplete: true,
              gamesPlayed: homeWins + awayWins,
              userTeamInvolved: userInvolved,
            })

            nextRound.push(winner === 'home' ? home : away)
          }

          if (confName === config.conferences[0]) {
            currentRound1 = nextRound
          } else {
            currentRound2 = nextRound
          }
        }
      }
    }

    // Championship result
    const finalsMatch = bracket.find(m => m.round === config.playoffRounds.length)
    let championship: ChampionshipResult | undefined

    if (finalsMatch) {
      const winnerTeam = finalsMatch.winner === 'home' ? finalsMatch.homeTeam : finalsMatch.awayTeam
      const loserTeam = finalsMatch.winner === 'home' ? finalsMatch.awayTeam : finalsMatch.homeTeam

      championship = {
        winner: {
          teamKey: winnerTeam.teamKey,
          teamName: winnerTeam.teamName,
          abbreviation: winnerTeam.abbreviation,
          logoUrl: winnerTeam.logoUrl,
          primaryColor: winnerTeam.primaryColor,
        },
        runnerUp: {
          teamKey: loserTeam.teamKey,
          teamName: loserTeam.teamName,
          abbreviation: loserTeam.abbreviation,
          logoUrl: loserTeam.logoUrl,
          primaryColor: loserTeam.primaryColor,
        },
        seriesScore: config.seriesLength === 1
          ? `${Math.max(...finalsMatch.seriesWins)}-${Math.min(...finalsMatch.seriesWins)}`
          : `${Math.max(...finalsMatch.seriesWins)}-${Math.min(...finalsMatch.seriesWins)}`,
        userTeamWon: userWonChampionship,
        userTeamInFinals: finalsMatch.userTeamInvolved,
      }
    }

    // Generate season summary
    const chicagoTeamName = getTeamInfo(chicagoInfo.abbrev, sport).teamName
    const winChange = modifiedWins - baselineWins
    const madePlayoffsChange = modified.madePlayoffs && !baseline.madePlayoffs
    const missedPlayoffsChange = !modified.madePlayoffs && baseline.madePlayoffs

    let headline: string
    let narrative: string

    if (userWonChampionship) {
      headline = `${chicagoTeamName} Win Championship After Masterful Trades!`
      narrative = `In a stunning turn of events, the ${chicagoTeamName} rode their strategic mid-season trades all the way to a championship. The ${acceptedTrades.length} trade(s) made during the season added ${winChange > 0 ? winChange : 0} wins to their total, transforming them from a ${baselineWins}-win team to ${modifiedWins}-win champions.`
    } else if (winChange > 3) {
      headline = `${chicagoTeamName} Surge After Blockbuster Trades`
      narrative = `The ${chicagoTeamName} made significant improvements this season, adding ${winChange} wins after executing ${acceptedTrades.length} strategic trade(s). ${madePlayoffsChange ? 'Most importantly, these moves helped the team secure a playoff berth.' : 'The team showed marked improvement across all phases.'}`
    } else if (winChange < -2) {
      headline = `${chicagoTeamName} Struggle After Controversial Trades`
      narrative = `The ${chicagoTeamName}'s trades did not pan out as expected, resulting in ${Math.abs(winChange)} fewer wins than projected. ${missedPlayoffsChange ? 'The team ultimately missed the playoffs.' : 'Management will need to reassess their strategy.'}`
    } else {
      headline = `${chicagoTeamName} Finish Season at ${modifiedWins}-${modified.losses}`
      narrative = `The ${chicagoTeamName} completed the ${seasonYear} season with a record of ${modifiedWins}-${modified.losses}. ${acceptedTrades.length > 0 ? `The ${acceptedTrades.length} trade(s) made had a modest impact on the team's performance.` : 'The team maintained their trajectory throughout the year.'}`
    }

    // Affected teams summary
    const affectedTeams = acceptedTrades
      .filter(t => t.partner_team_key)
      .map(t => {
        const partnerAbbrev = t.partner_team_key?.toUpperCase()
        const partnerStanding = [...standings.conference1, ...standings.conference2]
          .find(s => s.abbreviation === partnerAbbrev)
        return {
          teamName: t.trade_partner || partnerAbbrev,
          impact: partnerStanding
            ? `Finished ${partnerStanding.wins}-${partnerStanding.losses}, ${partnerStanding.playoffSeed ? `#${partnerStanding.playoffSeed} seed` : 'missed playoffs'}`
            : 'Impact unclear',
        }
      })

    const seasonSummary: SeasonSummary = {
      headline,
      narrative,
      tradeImpactSummary: `Your trades resulted in a net change of ${winChange > 0 ? '+' : ''}${winChange} wins. Average trade grade: ${avgGrade.toFixed(0)}.`,
      keyMoments: [
        `Season Start: ${chicagoTeamName} projected for ${baselineWins} wins`,
        acceptedTrades.length > 0 ? `Trade Deadline: Executed ${acceptedTrades.length} trade(s)` : '',
        modified.madePlayoffs ? `Playoffs: Secured #${modified.playoffSeed} seed` : 'Season End: Missed playoffs',
        userWonChampionship ? `Championship: ${chicagoTeamName} win it all!` : userEliminatedRound ? `Playoffs: Eliminated in ${config.playoffRounds[userEliminatedRound - 1]}` : '',
      ].filter(Boolean),
      affectedTeams,
    }

    // Calculate GM Score
    const tradeQualityScore = Math.min(60, avgGrade * 0.6)
    const winImprovementScore = Math.min(25, Math.max(0, winChange * 5))
    const playoffBonus = modified.madePlayoffs ? (modified.playoffSeed && modified.playoffSeed <= 4 ? 10 : 5) : 0
    const championshipBonus = userWonChampionship ? 15 : championship?.userTeamInFinals ? 5 : 0

    const gmScore = tradeQualityScore + winImprovementScore + playoffBonus + championshipBonus

    const result: SimulationResult = {
      success: true,
      baseline,
      modified,
      gmScore,
      scoreBreakdown: {
        tradeQualityScore,
        winImprovementScore,
        playoffBonusScore: playoffBonus,
        championshipBonus,
        winImprovement: winChange,
      },
      standings,
      playoffs: {
        bracket,
        userTeamResult: {
          madePlayoffs: modified.madePlayoffs,
          eliminatedRound: userEliminatedRound,
          eliminatedBy: userEliminatedBy,
          wonChampionship: userWonChampionship,
        },
      },
      championship,
      seasonSummary,
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[Simulation API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

```

---

### src/app/api/gm/export/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export type ExportFormat = 'json' | 'csv' | 'pdf'

interface ExportRequest {
  trade_ids: string[]
  format: ExportFormat
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: ExportRequest = await request.json()

    if (!body.trade_ids || body.trade_ids.length === 0) {
      return NextResponse.json({ error: 'No trades specified' }, { status: 400 })
    }

    if (!body.format || !['json', 'csv', 'pdf'].includes(body.format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    // Try Data Lab for PDF export
    if (body.format === 'pdf') {
      try {
        const res = await fetch(`${DATALAB_URL}/api/gm/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Source': 'sportsmockery.com',
            'X-User-Id': user.id,
          },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data)
        }
      } catch {
        // Fall through to local implementation
      }
    }

    // Fetch trades from database
    const { data: trades, error } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .in('id', body.trade_ids)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!trades || trades.length === 0) {
      return NextResponse.json({ error: 'No trades found' }, { status: 404 })
    }

    // Format based on request
    switch (body.format) {
      case 'json':
        return NextResponse.json({
          export_type: 'json',
          generated_at: new Date().toISOString(),
          trade_count: trades.length,
          data: trades.map(t => ({
            id: t.id,
            chicago_team: t.chicago_team,
            trade_partner: t.trade_partner,
            players_sent: t.players_sent,
            players_received: t.players_received,
            draft_picks_sent: t.draft_picks_sent,
            draft_picks_received: t.draft_picks_received,
            grade: t.grade,
            status: t.status,
            is_dangerous: t.is_dangerous,
            grade_reasoning: t.grade_reasoning,
            trade_summary: t.trade_summary,
            improvement_score: t.improvement_score,
            breakdown: {
              talent_balance: t.talent_balance,
              contract_value: t.contract_value,
              team_fit: t.team_fit,
              future_assets: t.future_assets,
            },
            created_at: t.created_at,
          })),
        })

      case 'csv':
        const headers = [
          'Trade ID',
          'Date',
          'Chicago Team',
          'Trade Partner',
          'Players Sent',
          'Players Received',
          'Grade',
          'Status',
          'Dangerous',
          'Talent Balance',
          'Contract Value',
          'Team Fit',
          'Future Assets',
          'Reasoning',
        ]

        const rows = trades.map(t => [
          t.id,
          new Date(t.created_at).toISOString().split('T')[0],
          t.chicago_team,
          t.trade_partner,
          (t.players_sent || []).map((p: any) => p.name).join('; '),
          (t.players_received || []).map((p: any) => p.name).join('; '),
          t.grade,
          t.status,
          t.is_dangerous ? 'Yes' : 'No',
          t.talent_balance ? Math.round(t.talent_balance * 100) : '',
          t.contract_value ? Math.round(t.contract_value * 100) : '',
          t.team_fit ? Math.round(t.team_fit * 100) : '',
          t.future_assets ? Math.round(t.future_assets * 100) : '',
          `"${(t.grade_reasoning || '').replace(/"/g, '""')}"`,
        ])

        const csvContent = [
          headers.join(','),
          ...rows.map(r => r.join(',')),
        ].join('\n')

        return NextResponse.json({
          export_type: 'csv',
          generated_at: new Date().toISOString(),
          trade_count: trades.length,
          content: csvContent,
          filename: `gm-trades-export-${new Date().toISOString().split('T')[0]}.csv`,
        })

      case 'pdf':
        // Generate a simple HTML representation that can be printed to PDF
        const htmlContent = generatePDFHTML(trades)
        return NextResponse.json({
          export_type: 'pdf',
          generated_at: new Date().toISOString(),
          trade_count: trades.length,
          html_content: htmlContent,
          filename: `gm-trades-export-${new Date().toISOString().split('T')[0]}.pdf`,
        })

      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('GM export error:', error)
    return NextResponse.json({ error: 'Failed to export trades' }, { status: 500 })
  }
}

function generatePDFHTML(trades: any[]): string {
  const tradeCards = trades.map(t => {
    const gradeColor = t.grade >= 75 ? '#22c55e' : t.grade >= 50 ? '#eab308' : '#ef4444'
    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 18px; font-weight: 700;">${t.chicago_team} ↔ ${t.trade_partner}</div>
            <div style="font-size: 12px; color: #6b7280;">${new Date(t.created_at).toLocaleDateString()}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: 900; color: ${gradeColor};">${t.grade}</div>
            <div style="font-size: 11px; padding: 2px 12px; border-radius: 12px; background-color: ${t.status === 'accepted' ? '#22c55e20' : '#ef444420'}; color: ${t.status === 'accepted' ? '#22c55e' : '#ef4444'}; font-weight: 700; text-transform: uppercase;">
              ${t.status}
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase;">Sent</div>
            <ul style="margin: 0; padding-left: 16px;">
              ${(t.players_sent || []).map((p: any) => `<li>${p.name} (${p.position})</li>`).join('')}
            </ul>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase;">Received</div>
            <ul style="margin: 0; padding-left: 16px;">
              ${(t.players_received || []).map((p: any) => `<li>${p.name} (${p.position})</li>`).join('')}
            </ul>
          </div>
        </div>
        <div style="font-size: 13px; color: #374151; line-height: 1.6; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
          ${t.grade_reasoning || ''}
        </div>
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>GM Trade Export</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
      </style>
    </head>
    <body>
      <h1>GM Trade History</h1>
      <div class="subtitle">Exported on ${new Date().toLocaleDateString()} • ${trades.length} trade${trades.length !== 1 ? 's' : ''}</div>
      ${tradeCards}
    </body>
    </html>
  `
}

```

---

### src/app/api/gm/prospects/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const DATALAB_BASE_URL = 'https://datalab.sportsmockery.com'

// Map team keys (from gm_league_teams) to prospect table abbreviations (gm_mlb_prospects)
const TEAM_KEY_TO_ABBREV: Record<string, string> = {
  // Chicago teams (primary)
  'cubs': 'chc',
  'whitesox': 'chw',
  'chicago-cubs': 'chc',
  'chicago-white-sox': 'chw',
  'white-sox': 'chw',
  // AL East
  'orioles': 'bal',
  'redsox': 'bos',
  'yankees': 'nyy',
  'rays': 'tb',
  'bluejays': 'tor',
  // AL Central
  'guardians': 'cle',
  'tigers': 'det',
  'royals': 'kc',
  'twins': 'min',
  // AL West
  'astros': 'hou',
  'angels': 'laa',
  'athletics': 'oak',
  'mariners': 'sea',
  'rangers': 'tex',
  // NL Central
  'reds': 'cin',
  'brewers': 'mil',
  'pirates': 'pit',
  'cardinals': 'stl',
  // NL East
  'braves': 'atl',
  'marlins': 'mia',
  'mets': 'nym',
  'phillies': 'phi',
  'nationals': 'wsh',
  // NL West
  'diamondbacks': 'ari',
  'rockies': 'col',
  'dodgers': 'lad',
  'padres': 'sd',
  'giants': 'sf',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  let teamKey = searchParams.get('team_key') || searchParams.get('team')
  const sport = searchParams.get('sport')?.toLowerCase()
  const limit = parseInt(searchParams.get('limit') || '30', 10)
  const minGrade = searchParams.get('min_grade')

  // Only MLB teams have prospects in this context
  if (sport && sport !== 'mlb') {
    return NextResponse.json({ prospects: [], message: 'Prospects only available for MLB teams' })
  }

  if (!teamKey) {
    return NextResponse.json({ error: 'team_key is required' }, { status: 400 })
  }

  // Normalize team key to Datalab format
  const normalizedKey = teamKey.toLowerCase()
  const datalabKey = TEAM_KEY_TO_ABBREV[normalizedKey] || normalizedKey

  try {
    // Query directly from Datalab Supabase (gm_mlb_prospects table)
    // Fields: name, position, team_key, team_name, org_rank, age,
    //         prospect_grade, prospect_grade_numeric, trade_value, source
    let query = datalabAdmin
      .from('gm_mlb_prospects')
      .select('*')
      .eq('team_key', datalabKey)
      .order('org_rank', { ascending: true })
      .limit(limit)

    if (minGrade) {
      // Filter by minimum grade (A+, A, A-, B+, etc.)
      query = query.gte('prospect_grade', minGrade)
    }

    const { data: prospects, error } = await query

    if (error) {
      console.error('[prospects API] Supabase error:', error)
      return NextResponse.json({ prospects: [], error: 'Failed to fetch prospects' })
    }

    return NextResponse.json({
      success: true,
      team: datalabKey,
      sport: 'mlb',
      prospects: prospects || [],
      count: prospects?.length || 0,
    })
  } catch (error) {
    console.error('[prospects API] Error:', error)
    return NextResponse.json({ prospects: [], error: 'Failed to fetch prospects' })
  }
}

```

---

### src/app/api/gm/log-error/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'


// GET: Fetch errors for admin page
export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const errorType = request.nextUrl.searchParams.get('error_type')
    const source = request.nextUrl.searchParams.get('source')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '200'), 500)

    let query = datalabAdmin
      .from('gm_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (errorType) query = query.eq('error_type', errorType)
    if (source) query = query.eq('source', source)

    const { data: errors, error } = await query
    if (error) throw error

    return NextResponse.json({ errors: errors || [] })
  } catch (error) {
    console.error('GM log-error GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 })
  }
}

// POST: Log a new error (from frontend or backend)
export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null
    try {
      const user = await getGMAuthUser(request)
      userId = user?.id || null
    } catch {}

    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      body = { error_message: 'Invalid JSON body' }
    }

    const { error } = await datalabAdmin.from('gm_errors').insert({
      user_id: userId,
      source: String(body.source || 'frontend').slice(0, 50),
      error_type: String(body.error_type || 'unknown').slice(0, 50),
      error_message: String(body.error_message || 'Unknown error').slice(0, 2000),
      request_payload: body.request_payload || null,
    })

    if (error) {
      console.error('GM log-error insert failed:', error.message, error.code)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GM log-error POST error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

```

---

## API Routes (Draft)

### src/app/api/gm/draft/start/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Chicago team keys by sport
const CHICAGO_TEAMS: Record<string, { key: string; name: string; sport: string }> = {
  bears: { key: 'chi', name: 'Chicago Bears', sport: 'nfl' },
  bulls: { key: 'chi', name: 'Chicago Bulls', sport: 'nba' },
  blackhawks: { key: 'chi', name: 'Chicago Blackhawks', sport: 'nhl' },
  cubs: { key: 'chc', name: 'Chicago Cubs', sport: 'mlb' },
  whitesox: { key: 'chw', name: 'Chicago White Sox', sport: 'mlb' },
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { chicago_team, draft_year } = body

    if (!chicago_team || !CHICAGO_TEAMS[chicago_team]) {
      return NextResponse.json({ error: 'Invalid Chicago team' }, { status: 400 })
    }

    const teamInfo = CHICAGO_TEAMS[chicago_team]
    let year = draft_year || 2026

    // Get draft order from Supabase view
    let { data: draftOrder, error: orderError } = await datalabAdmin
      .from('gm_draft_order')
      .select('*')
      .eq('sport', teamInfo.sport)
      .eq('draft_year', year)
      .order('pick_number')

    if (orderError) {
      console.error('Draft order error:', orderError)
      throw new Error(`Failed to fetch draft order: ${orderError.message}`)
    }

    // If no data for requested year, check what years are available
    if (!draftOrder || draftOrder.length === 0) {
      const { data: availableYears, error: yearsError } = await datalabAdmin
        .from('gm_draft_order')
        .select('draft_year')
        .eq('sport', teamInfo.sport)
        .order('draft_year', { ascending: false })
        .limit(10)

      if (yearsError) {
        console.error('Available years query error:', yearsError)
      }

      // Get unique years
      const uniqueYears = [...new Set((availableYears || []).map((r: any) => r.draft_year))].sort((a, b) => b - a)

      if (uniqueYears.length === 0) {
        return NextResponse.json({
          error: `No draft order data available for ${teamInfo.sport.toUpperCase()}. Please contact support.`,
          code: 'NO_DRAFT_ORDER',
        }, { status: 400 })
      }

      // Use the most recent available year
      const fallbackYear = uniqueYears[0]
      console.log(`No draft order for ${teamInfo.sport} ${year}, falling back to ${fallbackYear}. Available years: ${uniqueYears.join(', ')}`)

      const { data: fallbackOrder, error: fallbackError } = await datalabAdmin
        .from('gm_draft_order')
        .select('*')
        .eq('sport', teamInfo.sport)
        .eq('draft_year', fallbackYear)
        .order('pick_number')

      if (fallbackError || !fallbackOrder || fallbackOrder.length === 0) {
        return NextResponse.json({
          error: `No draft order available for ${teamInfo.sport.toUpperCase()}. Available years: ${uniqueYears.join(', ')}`,
          code: 'NO_DRAFT_ORDER',
        }, { status: 400 })
      }

      draftOrder = fallbackOrder
      year = fallbackYear
    }

    // 1. Create mock draft session using RPC
    const { data: mockId, error: mockError } = await datalabAdmin.rpc('create_mock_draft', {
      p_user_id: user.id,
      p_user_email: user.email,
      p_chicago_team: chicago_team,
      p_sport: teamInfo.sport,
      p_draft_year: year,
      p_total_picks: draftOrder.length,
      p_mode: 'user_only',
    })

    if (mockError) {
      console.error('Create mock draft RPC error:', mockError)
      // Check if it's an eligibility error from Datalab
      const errorMsg = mockError.message || String(mockError)
      if (errorMsg.includes('Mock draft not available') || errorMsg.includes('Season in progress') || errorMsg.includes('not eligible')) {
        return NextResponse.json({
          error: errorMsg,
          code: 'NOT_ELIGIBLE',
        }, { status: 400 })
      }
      throw new Error(`Failed to create mock draft: ${errorMsg}`)
    }

    if (!mockId) {
      throw new Error('Failed to create mock draft: No ID returned')
    }

    // 2. Create all picks using RPC
    const chicagoTeamKey = teamInfo.key
    const picks = draftOrder.map((p: any) => ({
      mock_draft_id: mockId,
      sport: teamInfo.sport,
      draft_year: year,
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color || null,
      is_user_pick: p.team_key === chicagoTeamKey,
      is_chicago_team: p.team_key === chicagoTeamKey,
    }))

    const { error: picksError } = await datalabAdmin.rpc('create_mock_draft_picks', {
      p_picks: picks,
    })

    if (picksError) {
      console.error('Create picks RPC error:', picksError)
      throw new Error(`Failed to create draft picks: ${picksError.message}`)
    }

    // Get the user's pick numbers
    const userPicks = picks
      .filter((p: any) => p.is_user_pick)
      .map((p: any) => p.pick_number)

    // Build response with picks
    const picksWithCurrent = picks.map((p: any, index: number) => ({
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color,
      is_user_pick: p.is_user_pick,
      is_current: index === 0,
      selected_prospect: null,
    }))

    return NextResponse.json({
      draft: {
        id: mockId,
        chicago_team,
        sport: teamInfo.sport,
        draft_year: year,
        status: 'in_progress',
        current_pick: 1,
        total_picks: draftOrder.length,
        picks: picksWithCurrent,
        user_picks: userPicks,
        created_at: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Draft start error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/start'
      })
    } catch {}
    return NextResponse.json({ error: String(error) || 'Failed to start draft' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/draft/pick/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id, prospect_id, pick_number, prospect_name, position, pick_grade } = body

    if (!mock_id || !prospect_id) {
      return NextResponse.json({ error: 'mock_id and prospect_id are required' }, { status: 400 })
    }

    // Get the mock draft to verify ownership and get current state
    const { data: mockDraftData, error: mockError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (mockError) {
      console.error('get_mock_draft RPC error:', mockError)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // RPC can return array or single object depending on function definition
    const mockDraft = Array.isArray(mockDraftData) ? mockDraftData[0] : mockDraftData

    if (!mockDraft) {
      console.error('Mock draft not found for id:', mock_id)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      console.error('Ownership mismatch:', { stored: mockDraft.user_id, current: user.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const actualPickNumber = pick_number || mockDraft.current_pick

    // Use prospect details directly from request - no need to join to draft_prospects table
    // The draft_picks table has denormalized data: prospect_name, position, prospect_id
    const prospectName = prospect_name || 'Unknown'
    const prospectPosition = position || 'Unknown'

    // Update the pick using RPC
    const { error: updateError } = await datalabAdmin.rpc('update_mock_draft_pick', {
      p_mock_id: mock_id,
      p_pick_number: actualPickNumber,
      p_prospect_id: prospect_id,
      p_prospect_name: prospectName || 'Unknown',
      p_position: prospectPosition || 'Unknown',
      p_pick_grade: pick_grade || null,
    })

    if (updateError) {
      console.error('Update pick RPC error:', updateError)
      throw new Error(`Failed to update pick: ${updateError.message}`)
    }

    // Advance to next pick
    const { data: newPick, error: advanceError } = await datalabAdmin.rpc('advance_mock_draft_pick', {
      p_mock_id: mock_id,
    })

    if (advanceError) {
      console.error('Advance pick RPC error:', advanceError)
      // Non-fatal - pick was saved, just couldn't advance
    }

    // Get updated draft state
    const { data: updatedDraft } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    const isComplete = updatedDraft?.current_pick > updatedDraft?.total_picks || updatedDraft?.status === 'completed'

    // Build response
    const picks = (updatedDraft?.picks || []).map((p: any) => ({
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color,
      is_user_pick: p.is_user_pick,
      is_current: p.pick_number === updatedDraft?.current_pick,
      selected_prospect: p.prospect_id ? {
        id: p.prospect_id,
        name: p.prospect_name,
        position: p.position,
      } : null,
    }))

    return NextResponse.json({
      draft: {
        id: mock_id,
        chicago_team: updatedDraft?.chicago_team,
        sport: updatedDraft?.sport,
        draft_year: updatedDraft?.draft_year,
        status: isComplete ? 'completed' : 'in_progress',
        current_pick: updatedDraft?.current_pick || actualPickNumber + 1,
        total_picks: updatedDraft?.total_picks,
        picks,
        user_picks: picks.filter((p: any) => p.is_user_pick).map((p: any) => p.pick_number),
      },
    })

  } catch (error) {
    console.error('Draft pick error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/pick'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to submit pick' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/draft/grade/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const MODEL_NAME = 'claude-sonnet-4-20250514'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const GRADE_SYSTEM_PROMPT = `You are an expert draft analyst grading a user's mock draft performance. Evaluate their picks based on:

1. Value - Did they reach for players or get good value?
2. Team Fit - Do the picks address team needs?
3. Best Player Available - Did they balance BPA vs need?
4. Position Value - Did they prioritize premium positions?

Grade on a 0-100 scale where:
- 90-100: Elite draft, franchise-changing picks
- 80-89: Excellent, multiple high-value picks
- 70-79: Good, solid picks with minor reaches
- 60-69: Average, some good picks but also some questionable ones
- 50-59: Below average, multiple reaches or bad fits
- Below 50: Poor draft

Respond with ONLY valid JSON:
{
  "overall_grade": <number 0-100>,
  "letter_grade": "<A+, A, A-, B+, B, B-, C+, C, C-, D, F>",
  "analysis": "<2-3 sentence overall analysis>",
  "pick_grades": [
    {
      "pick_number": <number>,
      "prospect_name": "<name>",
      "grade": <number 0-100>,
      "analysis": "<1 sentence>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
}

Do not wrap in markdown code blocks. Just raw JSON.`

// Update combined user score (trade + mock draft)
async function updateCombinedUserScore(userId: string) {
  // Get trade score from gm_leaderboard
  const { data: leaderboard } = await datalabAdmin
    .from('gm_leaderboard')
    .select('avg_grade, trades_count, best_trade_id')
    .eq('user_id', userId)
    .single()

  const tradeScore = leaderboard?.avg_grade || null
  const tradeCount = leaderboard?.trades_count || 0

  // Get best mock score (is_best_of_three=true, or highest)
  let bestMock: { id: string; mock_score: number } | null = null

  const { data: bestOfThreeMock } = await datalabAdmin
    .from('draft_mocks')
    .select('id, mock_score')
    .eq('user_id', userId)
    .eq('is_reset', false)
    .eq('is_best_of_three', true)
    .single()

  if (bestOfThreeMock) {
    bestMock = bestOfThreeMock
  } else {
    const { data: highestMock } = await datalabAdmin
      .from('draft_mocks')
      .select('id, mock_score')
      .eq('user_id', userId)
      .eq('is_reset', false)
      .eq('completed', true)
      .not('mock_score', 'is', null)
      .order('mock_score', { ascending: false })
      .limit(1)
      .single()
    bestMock = highestMock
  }

  const mockScore = bestMock?.mock_score || null

  // Count completed mocks
  const { count: mockCount } = await datalabAdmin
    .from('draft_mocks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_reset', false)
    .eq('completed', true)

  // Calculate combined score (60% trade, 40% mock)
  let combinedScore: number | null = null
  if (tradeScore !== null && mockScore !== null) {
    combinedScore = (tradeScore * 0.60) + (mockScore * 0.40)
  } else if (tradeScore !== null) {
    combinedScore = tradeScore
  } else if (mockScore !== null) {
    combinedScore = mockScore
  }

  // Upsert gm_user_scores
  await datalabAdmin
    .from('gm_user_scores')
    .upsert({
      user_id: userId,
      best_trade_score: tradeScore,
      trade_count: tradeCount,
      best_mock_draft_id: bestMock?.id || null,
      best_mock_draft_score: mockScore,
      mock_count: mockCount || 0,
      combined_gm_score: combinedScore ? Math.round(combinedScore * 10) / 10 : null,
      trade_weight: 0.60,
      mock_weight: 0.40,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id } = body

    if (!mock_id) {
      return NextResponse.json({ error: 'mock_id is required' }, { status: 400 })
    }

    // Get the mock draft using RPC
    const { data: mockDraftData, error: mockError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (mockError) {
      console.error('get_mock_draft RPC error:', mockError)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // RPC can return array or single object depending on function definition
    const mockDraft = Array.isArray(mockDraftData) ? mockDraftData[0] : mockDraftData

    if (!mockDraft) {
      console.error('Mock draft not found for id:', mock_id)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      console.error('Ownership mismatch:', { stored: mockDraft.user_id, current: user.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get user's picks
    const userPicks = (mockDraft.picks || []).filter((p: any) => p.is_user_pick && p.prospect_id)

    if (userPicks.length === 0) {
      return NextResponse.json({ error: 'No picks to grade' }, { status: 400 })
    }

    // Build grading prompt
    const picksDescription = userPicks.map((p: any) => {
      return `Pick #${p.pick_number} (Round ${p.round}): ${p.prospect_name} (${p.position})`
    }).join('\n')

    const teamDisplayNames: Record<string, string> = {
      bears: 'Chicago Bears', bulls: 'Chicago Bulls', blackhawks: 'Chicago Blackhawks',
      cubs: 'Chicago Cubs', whitesox: 'Chicago White Sox',
    }

    const prompt = `
Mock Draft: ${mockDraft.sport.toUpperCase()} ${mockDraft.draft_year}
Team: ${teamDisplayNames[mockDraft.chicago_team] || mockDraft.chicago_team}

User's Picks:
${picksDescription}

Grade this mock draft performance.`

    const response = await getAnthropic().messages.create({
      model: MODEL_NAME,
      max_tokens: 1024,
      system: GRADE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find(c => c.type === 'text')
    const rawText = textContent?.type === 'text' ? textContent.text : ''

    let gradeResult: any = {
      overall_grade: 70,
      letter_grade: 'C+',
      analysis: 'Draft analysis unavailable.',
      pick_grades: [],
      strengths: [],
      weaknesses: [],
    }

    try {
      gradeResult = JSON.parse(rawText)
    } catch {
      const gradeMatch = rawText.match(/(\d{1,3})/)
      if (gradeMatch) {
        gradeResult.overall_grade = Math.min(100, parseInt(gradeMatch[1]))
      }
      gradeResult.analysis = rawText.slice(0, 500)
    }

    // Complete the mock draft using RPC
    const { error: completeError } = await datalabAdmin.rpc('complete_mock_draft', {
      p_mock_id: mock_id,
      p_overall_grade: gradeResult.overall_grade,
      p_chicago_grade: gradeResult.overall_grade, // Use same grade for chicago grade
      p_realism_score: null,
    })

    if (completeError) {
      console.error('Complete mock draft RPC error:', completeError)
      // Non-fatal - grade was calculated, just couldn't save status
    }

    // Update individual pick grades using RPC (if we have them)
    if (gradeResult.pick_grades && Array.isArray(gradeResult.pick_grades)) {
      for (const pg of gradeResult.pick_grades) {
        try {
          await datalabAdmin.rpc('update_mock_draft_pick', {
            p_mock_id: mock_id,
            p_pick_number: pg.pick_number,
            p_prospect_id: null, // Don't update prospect
            p_prospect_name: null,
            p_position: null,
            p_pick_grade: pg.grade,
            p_commentary: pg.analysis,
          })
        } catch {}
      }
    }

    // Trigger mock score computation via Datalab API
    try {
      await fetch('https://datalab.sportsmockery.com/api/gm/mock-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock_id }),
      })
    } catch (scoreError) {
      console.error('Mock score computation error:', scoreError)
      // Non-fatal - AI grade was calculated, scoring computation can be retried
    }

    // Update combined user score
    try {
      await updateCombinedUserScore(user.id)
    } catch (combinedError) {
      console.error('Combined score update error:', combinedError)
    }

    return NextResponse.json({
      grade: {
        overall_grade: gradeResult.overall_grade,
        letter_grade: gradeResult.letter_grade,
        analysis: gradeResult.analysis,
        pick_grades: gradeResult.pick_grades || [],
        strengths: gradeResult.strengths || [],
        weaknesses: gradeResult.weaknesses || [],
      },
    })

  } catch (error) {
    console.error('Draft grade error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/grade'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to grade draft' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/draft/prospects/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport param to league column value
const SPORT_TO_LEAGUE: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const sport = request.nextUrl.searchParams.get('sport')
    const year = request.nextUrl.searchParams.get('year') || '2026'
    const search = request.nextUrl.searchParams.get('search')
    const position = request.nextUrl.searchParams.get('position')

    if (!sport) {
      return NextResponse.json({ error: 'sport is required' }, { status: 400 })
    }

    const league = SPORT_TO_LEAGUE[sport.toLowerCase()]
    if (!league) {
      return NextResponse.json({ error: 'Invalid sport' }, { status: 400 })
    }

    // Build query - use draft_prospects table with league column
    let query = datalabAdmin
      .from('draft_prospects')
      .select('*')
      .eq('league', league)
      .eq('draft_year', parseInt(year))

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (position) {
      query = query.eq('position', position)
    }

    // Order by big_board_rank
    query = query.order('big_board_rank', { ascending: true, nullsFirst: false })

    const { data: prospects, error } = await query.limit(200)

    if (error) {
      console.error('Prospects fetch error:', error)
      throw new Error(`Failed to fetch prospects: ${error.message}`)
    }

    // Map to expected format - use Datalab column names
    const mappedProspects = (prospects || []).map((p: any) => ({
      id: p.id?.toString() || p.name, // Use id or name as fallback
      name: p.name,
      position: p.position,
      school: p.school_team, // Datalab uses school_team
      height: p.height,
      weight: p.weight,
      age: p.age,
      headshot_url: p.headshot_url,
      projected_round: p.projected_tier, // Use tier as projected round
      projected_pick: p.big_board_rank, // Use big_board_rank
      grade: p.projected_value, // Use projected_value as grade (0-100)
      tier: p.projected_tier,
      strengths: p.strengths || [],
      weaknesses: p.weaknesses || [],
      comparison: p.comp_player, // Datalab uses comp_player
      summary: p.scouting_summary, // Datalab uses scouting_summary
    }))

    return NextResponse.json({ prospects: mappedProspects })

  } catch (error) {
    console.error('Draft prospects error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/prospects'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/draft/auto/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport to league format for Datalab
const SPORT_TO_LEAGUE: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
}

export async function POST(request: NextRequest) {
  const debugLog: string[] = []
  const log = (msg: string) => {
    console.log(`[AutoAdvance] ${msg}`)
    debugLog.push(msg)
  }

  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id } = body

    if (!mock_id) {
      return NextResponse.json({ error: 'mock_id is required' }, { status: 400 })
    }

    log(`Starting auto-advance for mock_id: ${mock_id}`)

    // Get the mock draft using RPC
    const { data: mockDraftData, error: mockError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (mockError) {
      log(`get_mock_draft RPC error: ${JSON.stringify(mockError)}`)
      return NextResponse.json({ error: 'Mock draft not found', debug: debugLog }, { status: 404 })
    }

    // RPC can return array or single object depending on function definition
    const mockDraft = Array.isArray(mockDraftData) ? mockDraftData[0] : mockDraftData

    if (!mockDraft) {
      log(`Mock draft not found for id: ${mock_id}, data was: ${JSON.stringify(mockDraftData)}`)
      return NextResponse.json({ error: 'Mock draft not found', debug: debugLog }, { status: 404 })
    }

    log(`Mock draft found: sport=${mockDraft.sport}, year=${mockDraft.draft_year}, current_pick=${mockDraft.current_pick}`)

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      log(`Ownership mismatch: stored=${mockDraft.user_id}, current=${user.id}`)
      return NextResponse.json({ error: 'Unauthorized', debug: debugLog }, { status: 403 })
    }

    const allPicks = mockDraft.picks || []
    let currentPick = mockDraft.current_pick

    log(`Total picks in draft: ${allPicks.length}, current_pick: ${currentPick}`)

    // Find next user pick
    const userPickNumbers = allPicks.filter((p: any) => p.is_user_pick).map((p: any) => p.pick_number)
    const nextUserPick = userPickNumbers.find((pn: number) => pn >= currentPick) || mockDraft.total_picks + 1

    log(`User pick numbers: ${userPickNumbers.join(', ')}, nextUserPick: ${nextUserPick}`)

    // Check if we're already at a user pick
    const currentPickData = allPicks.find((p: any) => p.pick_number === currentPick)
    if (currentPickData?.is_user_pick) {
      log(`Already at user pick ${currentPick}, nothing to advance`)
      // Return current state - no advancing needed
      const picks = allPicks.map((p: any) => ({
        pick_number: p.pick_number,
        round: p.round,
        team_key: p.team_key,
        team_name: p.team_name,
        team_logo: p.team_logo,
        team_color: p.team_color,
        is_user_pick: p.is_user_pick,
        is_current: p.pick_number === currentPick,
        selected_prospect: p.prospect_id ? {
          id: p.prospect_id,
          name: p.prospect_name,
          position: p.position,
        } : null,
      }))

      return NextResponse.json({
        draft: {
          id: mock_id,
          chicago_team: mockDraft.chicago_team,
          sport: mockDraft.sport,
          draft_year: mockDraft.draft_year,
          status: 'in_progress',
          current_pick: currentPick,
          total_picks: mockDraft.total_picks,
          picks,
          user_picks: userPickNumbers,
        },
        debug: debugLog,
      })
    }

    // Get available prospects (not yet picked)
    const pickedProspectIds = allPicks
      .filter((p: any) => p.prospect_id)
      .map((p: any) => String(p.prospect_id))

    log(`Already picked prospect IDs: ${pickedProspectIds.length} picks made`)

    // Use draft_prospects table with league column (uppercase: NFL, NBA, etc.)
    const league = SPORT_TO_LEAGUE[mockDraft.sport?.toLowerCase()] || mockDraft.sport?.toUpperCase()

    log(`Fetching prospects for league=${league}, year=${mockDraft.draft_year}`)

    const { data: availableProspects, error: prospectError } = await datalabAdmin
      .from('draft_prospects')
      .select('*')
      .eq('league', league)
      .eq('draft_year', mockDraft.draft_year)
      .order('big_board_rank', { ascending: true })
      .limit(150)

    if (prospectError) {
      log(`Prospects fetch error: ${JSON.stringify(prospectError)}`)
      return NextResponse.json({
        error: `Failed to fetch prospects: ${prospectError.message}`,
        debug: debugLog
      }, { status: 500 })
    }

    log(`Fetched ${availableProspects?.length || 0} prospects from database`)

    if (!availableProspects || availableProspects.length === 0) {
      log(`No prospects found for ${league} ${mockDraft.draft_year}`)
      return NextResponse.json({
        error: `No prospects available for ${league} ${mockDraft.draft_year}. Database may not have prospect data.`,
        debug: debugLog
      }, { status: 400 })
    }

    // Log first few prospects for debugging
    log(`First 3 prospects: ${availableProspects.slice(0, 3).map((p: any) => `${p.name} (${p.position})`).join(', ')}`)

    // Map to consistent format and filter out picked prospects
    const mappedProspects = availableProspects.map((p: any) => ({
      ...p,
      prospect_id: String(p.id || p.name), // Use id as prospect_id, ensure it's a string
      school: p.school_team,
      grade: p.projected_value,
      rank: p.big_board_rank,
    }))

    const filteredProspects = mappedProspects.filter(
      (p: any) => !pickedProspectIds.includes(p.prospect_id)
    )

    log(`After filtering picked: ${filteredProspects.length} prospects available`)

    if (filteredProspects.length === 0) {
      return NextResponse.json({
        error: 'No prospects available - all have been picked',
        debug: debugLog
      }, { status: 400 })
    }

    // Simulate picks until we reach the user's pick or end of draft
    const maxIterations = Math.min(nextUserPick - currentPick, 50)
    let iterations = 0
    let picksAdvanced = 0

    log(`Starting simulation loop: maxIterations=${maxIterations}, from pick ${currentPick} to ${nextUserPick}`)

    while (currentPick < nextUserPick && currentPick <= mockDraft.total_picks && iterations < maxIterations) {
      const pickData = allPicks.find((p: any) => p.pick_number === currentPick)

      if (!pickData) {
        log(`ERROR: No pick data found for pick ${currentPick}`)
        break
      }

      if (pickData.is_user_pick) {
        log(`Reached user pick at ${currentPick}, stopping`)
        break
      }

      log(`Processing pick ${currentPick}: ${pickData.team_name}`)

      // Get top available prospects (that haven't been picked yet in this session)
      const topProspects = filteredProspects
        .filter((p: any) => !pickedProspectIds.includes(p.prospect_id))
        .slice(0, 10)

      if (topProspects.length === 0) {
        log(`No more prospects available at pick ${currentPick}`)
        break
      }

      // Use BPA (Best Player Available) - AI picks disabled for speed
      // AI calls were causing timeouts (24 picks * 5-10 sec each = 2-4 min)
      const selectedProspect = topProspects[0]
      log(`BPA pick ${currentPick}: ${selectedProspect.name} (${selectedProspect.position})`)

      // Update the pick using RPC
      const { error: updateError } = await datalabAdmin.rpc('update_mock_draft_pick', {
        p_mock_id: mock_id,
        p_pick_number: currentPick,
        p_prospect_id: selectedProspect.prospect_id,
        p_prospect_name: selectedProspect.name,
        p_position: selectedProspect.position,
      })

      if (updateError) {
        log(`ERROR updating pick ${currentPick}: ${JSON.stringify(updateError)}`)
        // Continue anyway to try to advance
      } else {
        log(`Updated pick ${currentPick} with ${selectedProspect.name}`)
      }

      // Track picked prospect
      pickedProspectIds.push(selectedProspect.prospect_id)

      // Advance pick
      const { error: advanceError } = await datalabAdmin.rpc('advance_mock_draft_pick', {
        p_mock_id: mock_id,
      })

      if (advanceError) {
        log(`ERROR advancing from pick ${currentPick}: ${JSON.stringify(advanceError)}`)
      } else {
        log(`Advanced from pick ${currentPick} to ${currentPick + 1}`)
      }

      currentPick++
      iterations++
      picksAdvanced++
    }

    log(`Simulation complete: advanced ${picksAdvanced} picks, now at pick ${currentPick}`)

    // Get updated draft state
    const { data: updatedDraftData, error: updateFetchError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (updateFetchError) {
      log(`ERROR fetching updated draft: ${JSON.stringify(updateFetchError)}`)
    }

    // Handle array response
    const updatedDraft = Array.isArray(updatedDraftData) ? updatedDraftData[0] : updatedDraftData

    if (!updatedDraft) {
      log(`ERROR: Could not fetch updated draft state`)
      // Return what we have
      return NextResponse.json({
        error: 'Draft advanced but failed to fetch updated state',
        debug: debugLog,
      }, { status: 500 })
    }

    const isComplete = updatedDraft.current_pick > updatedDraft.total_picks || updatedDraft.status === 'completed'

    log(`Final state: current_pick=${updatedDraft.current_pick}, total_picks=${updatedDraft.total_picks}, isComplete=${isComplete}`)

    // Build response
    const picks = (updatedDraft.picks || []).map((p: any) => ({
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color,
      is_user_pick: p.is_user_pick,
      is_current: p.pick_number === updatedDraft.current_pick,
      selected_prospect: p.prospect_id ? {
        id: p.prospect_id,
        name: p.prospect_name,
        position: p.position,
      } : null,
    }))

    return NextResponse.json({
      draft: {
        id: mock_id,
        chicago_team: updatedDraft.chicago_team,
        sport: updatedDraft.sport,
        draft_year: updatedDraft.draft_year,
        status: isComplete ? 'completed' : 'in_progress',
        current_pick: updatedDraft.current_pick,
        total_picks: updatedDraft.total_picks,
        picks,
        user_picks: userPickNumbers,
      },
      picksAdvanced,
      debug: debugLog,
    })

  } catch (error) {
    console.error('Draft auto error:', error)
    debugLog.push(`EXCEPTION: ${String(error)}`)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/auto',
        metadata: { debug: debugLog },
      })
    } catch {}
    return NextResponse.json({
      error: 'Failed to auto-advance draft',
      message: String(error),
      debug: debugLog
    }, { status: 500 })
  }
}

```

---

### src/app/api/gm/draft/history/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ drafts: [], total: 0 })
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Get user's draft history from Supabase
    const { data: drafts, error, count } = await datalabAdmin
      .from('gm_mock_drafts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Draft history error:', error)
      return NextResponse.json({ drafts: [], total: 0, page, limit })
    }

    // Get pick counts for each draft
    const draftIds = (drafts || []).map((d: any) => d.id)
    let pickCountsMap: Record<string, number> = {}

    if (draftIds.length > 0) {
      const { data: pickCounts } = await datalabAdmin
        .from('gm_mock_draft_picks')
        .select('mock_draft_id')
        .in('mock_draft_id', draftIds)
        .not('prospect_id', 'is', null)

      if (pickCounts) {
        for (const pc of pickCounts) {
          pickCountsMap[pc.mock_draft_id] = (pickCountsMap[pc.mock_draft_id] || 0) + 1
        }
      }
    }

    // Map to expected format
    const mappedDrafts = (drafts || []).map((d: any) => ({
      id: d.id,
      chicago_team: d.chicago_team,
      sport: d.sport,
      draft_year: d.draft_year,
      status: d.status,
      grade: d.overall_grade,
      letter_grade: d.letter_grade,
      created_at: d.created_at,
      picks_made: pickCountsMap[d.id] || 0,
    }))

    return NextResponse.json({
      drafts: mappedDrafts,
      total: count || 0,
      page,
      limit,
    })

  } catch (error) {
    console.error('Draft history error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/history'
      })
    } catch {}
    return NextResponse.json({ drafts: [], total: 0 })
  }
}

```

---

### src/app/api/gm/draft/eligibility/route.ts

```ts
import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport field to league for prospect check
const SPORT_TO_LEAGUE: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
}

export async function GET() {
  try {
    // Fetch eligibility from gm_draft_eligibility table
    const { data: teams, error } = await datalabAdmin
      .from('gm_draft_eligibility')
      .select('*')
      .in('team_key', ['chi', 'chc', 'chw'])
      .eq('draft_year', 2026)

    if (error) {
      console.error('Eligibility fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
    }

    // Also check if prospects actually exist for each sport
    // This ensures eligibility is based on actual data availability
    const prospectCounts: Record<string, number> = {}
    for (const league of ['NFL', 'NBA', 'NHL', 'MLB']) {
      const { count } = await datalabAdmin
        .from('draft_prospects')
        .select('*', { count: 'exact', head: true })
        .eq('league', league)
        .eq('draft_year', 2026)
      prospectCounts[league] = count || 0
    }

    // Enhance eligibility based on prospect availability AND window status
    const enhancedTeams = (teams || []).map((team: Record<string, unknown>) => {
      // Use sport field (lowercase) to look up league
      const sport = (team.sport as string || '').toLowerCase()
      const league = SPORT_TO_LEAGUE[sport]
      const hasProspects = league ? prospectCounts[league] > 0 : false

      // Check window status - only 'open' allows drafting
      const windowStatus = team.mock_draft_window_status as string
      const windowOpen = windowStatus === 'open'

      // Team is only eligible if:
      // 1. Prospects exist for this sport AND
      // 2. Draft window is open (not closed/completed/not_yet_open)
      const isEligible = hasProspects && windowOpen

      return {
        ...team,
        eligible: isEligible,
        prospect_count: league ? prospectCounts[league] : 0,
        data_available: hasProspects,
      }
    })

    return NextResponse.json({ teams: enhancedTeams })
  } catch (error) {
    console.error('Eligibility error:', error)
    return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
  }
}

```

---

### src/app/api/gm/draft/share/[mockId]/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mockId: string }> }
) {
  try {
    const { mockId } = await params

    if (!mockId) {
      return NextResponse.json({ error: 'Mock draft ID required' }, { status: 400 })
    }

    // Fetch the mock draft with its grade data
    const { data: draft, error: draftError } = await datalabAdmin
      .from('gm_mock_drafts')
      .select(`
        id,
        chicago_team,
        sport,
        draft_year,
        status,
        mock_score,
        mock_grade_letter,
        feedback_json,
        created_at
      `)
      .eq('id', mockId)
      .single()

    if (draftError || !draft) {
      console.error('[MockDraftShare] Error fetching draft:', draftError)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Fetch the picks for this draft
    const { data: picks, error: picksError } = await datalabAdmin
      .from('gm_mock_draft_picks')
      .select(`
        pick_number,
        team_key,
        team_name,
        is_user_pick,
        prospect_name,
        prospect_position,
        prospect_school
      `)
      .eq('mock_id', mockId)
      .order('pick_number', { ascending: true })

    if (picksError) {
      console.error('[MockDraftShare] Error fetching picks:', picksError)
    }

    // Parse the feedback_json to get grade details
    let analysis = ''
    let pickGrades: Array<{ pick_number: number; prospect_name: string; grade: number; analysis: string }> = []
    let strengths: string[] = []
    let weaknesses: string[] = []

    if (draft.feedback_json) {
      try {
        const feedback = typeof draft.feedback_json === 'string'
          ? JSON.parse(draft.feedback_json)
          : draft.feedback_json

        analysis = feedback.analysis || feedback.overall_analysis || ''
        pickGrades = feedback.pick_grades || []
        strengths = feedback.strengths || []
        weaknesses = feedback.weaknesses || feedback.areas_to_improve || []
      } catch (e) {
        console.error('[MockDraftShare] Error parsing feedback:', e)
      }
    }

    // Format picks with prospect info
    const formattedPicks = (picks || []).map(pick => ({
      pick_number: pick.pick_number,
      team_name: pick.team_name,
      is_user_pick: pick.is_user_pick,
      selected_prospect: pick.prospect_name ? {
        name: pick.prospect_name,
        position: pick.prospect_position || '',
        school: pick.prospect_school || '',
      } : undefined,
    }))

    return NextResponse.json({
      draft: {
        id: draft.id,
        chicago_team: draft.chicago_team,
        sport: draft.sport,
        draft_year: draft.draft_year,
        status: draft.status,
        overall_grade: draft.mock_score,
        letter_grade: draft.mock_grade_letter,
        analysis,
        pick_grades: pickGrades,
        strengths,
        weaknesses,
        picks: formattedPicks,
        created_at: draft.created_at,
      },
    })
  } catch (error) {
    console.error('[MockDraftShare] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

```

---

## API Routes (v2)

### src/app/api/v2/gm/grade/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * POST /api/v2/gm/grade
 * V2 GM Trade Grading with deterministic validation
 * Feature flag: gm_deterministic_validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore - this happens in read-only contexts
              }
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Call Datalab v2 endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${DATALAB_API}/api/v2/gm/grade`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    // Pass through the response (including 503 with fallback_to_legacy)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v2/gm/grade] Error:', error)
    return NextResponse.json(
      { error: 'Failed to grade trade', fallback_to_legacy: true },
      { status: 503 }
    )
  }
}

```

---

### src/app/api/v2/gm/audit/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * POST /api/v2/gm/audit
 * V2 GM Trade Audit with symbolic verification
 * Feature flag: gm_auditor_symbolic_verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore - this happens in read-only contexts
              }
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Call Datalab v2 endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${DATALAB_API}/api/v2/gm/audit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    // Pass through the response (including 503 with fallback_to_legacy)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v2/gm/audit] Error:', error)
    return NextResponse.json(
      { error: 'Failed to audit trade', fallback_to_legacy: true },
      { status: 503 }
    )
  }
}

/**
 * GET /api/v2/gm/audit
 * Auto-audit recent trades
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = searchParams.get('hours') || '24'
    const limit = searchParams.get('limit') || '10'

    // Get user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore - this happens in read-only contexts
              }
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Call Datalab v2 endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(
      `${DATALAB_API}/api/v2/gm/audit?hours=${hours}&limit=${limit}`,
      { headers }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v2/gm/audit GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-audit trades', fallback_to_legacy: true },
      { status: 503 }
    )
  }
}

```

---

### src/app/api/v2/gm/validate-salary/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * POST /api/v2/gm/validate-salary
 * Deterministic salary cap validation before AI grading
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore - this happens in read-only contexts
              }
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Call Datalab v2 endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${DATALAB_API}/api/v2/gm/validate-salary`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v2/gm/validate-salary] Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate salary', valid: true, errors: [], warnings: [] },
      { status: 500 }
    )
  }
}

```

---

## Components

### src/components/gm/AgingCurveWidget.tsx

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

---

### src/components/gm/AnalyticsDashboard.tsx

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

---

### src/components/gm/AssetRow.tsx

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

---

### src/components/gm/AuditButton.tsx

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

---

### src/components/gm/AuditReportCard.tsx

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

---

### src/components/gm/DataFreshnessIndicator.tsx

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

---

### src/components/gm/DestinationPicker.tsx

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

---

### src/components/gm/DraftPickList.tsx

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

---

### src/components/gm/DraftPickSelector.tsx

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

---

### src/components/gm/DraftPickValueWidget.tsx

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

---

### src/components/gm/ExportModal.tsx

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

---

### src/components/gm/FuturePickDiscountWidget.tsx

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

---

### src/components/gm/GradeProgressButton.tsx

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

---

### src/components/gm/GradeReveal.tsx

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

---

### src/components/gm/HistoricalContextPanel.tsx

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

---

### src/components/gm/LeaderboardPanel.tsx

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

---

### src/components/gm/OpponentRosterPanel.tsx

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

---

### src/components/gm/OpponentTeamPicker.tsx

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

---

### src/components/gm/PlayerCard.tsx

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

---

### src/components/gm/PlayerTrendBadge.tsx

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

---

### src/components/gm/PreferencesModal.tsx

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

---

### src/components/gm/ProspectCard.tsx

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

---

### src/components/gm/RosterPanel.tsx

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

---

### src/components/gm/ScenarioTabs.tsx

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

---

### src/components/gm/SessionManager.tsx

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

---

### src/components/gm/SimulationChart.tsx

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

---

### src/components/gm/SimulationResults.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { SimulationResult, TeamStanding, PlayoffMatchup } from '@/types/gm'

interface SimulationResultsProps {
  result: SimulationResult
  tradeCount: number
  teamName: string
  teamColor: string
  onSimulateAgain: () => void
  onClose: () => void
}

type Tab = 'overview' | 'standings' | 'playoffs' | 'summary'

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

  const { baseline, modified, gmScore, scoreBreakdown, standings, playoffs, championship, seasonSummary } = result
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
                      { label: `Trade quality (${tradeCount} trade${tradeCount !== 1 ? 's' : ''})`, value: scoreBreakdown.tradeQualityScore, max: 60 },
                      { label: `Win improvement (${winImprovement > 0 ? '+' : ''}${scoreBreakdown.winImprovement} wins)`, value: scoreBreakdown.winImprovementScore, max: 25 },
                      { label: 'Playoff achievement', value: scoreBreakdown.playoffBonusScore, max: 15 },
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
                        {conf.teams.slice(0, 12).map((team, idx) => (
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
                      {Array.from(new Set(playoffs.bracket.map(m => m.round))).map(round => {
                        const roundMatches = playoffs.bracket.filter(m => m.round === round)
                        const roundName = roundMatches[0]?.roundName.split(' - ')[0] || `Round ${round}`
                        return (
                          <div key={round}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                              {roundName}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                              {roundMatches.map((match, idx) => (
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
                    {seasonSummary.keyMoments.map((moment, idx) => (
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
                      {seasonSummary.affectedTeams.map((team, idx) => (
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

---

### src/components/gm/SimulationTrigger.tsx

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

---

### src/components/gm/StatComparison.tsx

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

---

### src/components/gm/TeamFitOverlay.tsx

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

---

### src/components/gm/TeamFitRadar.tsx

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

---

### src/components/gm/TeamSelector.tsx

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

---

### src/components/gm/ThreeTeamTradeBoard.tsx

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

---

### src/components/gm/TradeBoard.tsx

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

---

### src/components/gm/TradeHistory.tsx

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

---

### src/components/gm/TradeModePicker.tsx

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

---

### src/components/gm/ValidationIndicator.tsx

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

---

### src/components/gm/VeteranTradeValueWidget.tsx

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

---

### src/components/gm/WarRoomHeader.tsx

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

---

### src/components/gm/WhatIfPanel.tsx

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

---

## Libs & Types

### src/lib/gm-auth.ts

```ts
/**
 * Shared GM auth helper that supports both cookie-based (web) and Bearer token (mobile) auth
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getGMAuthUser(request?: NextRequest) {
  // First try Bearer token auth (mobile app)
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) return user
    }
  }

  // Fall back to cookie-based auth (web)
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options) }) } catch {}
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

```

---

### src/lib/gm-constants.ts

```ts
/**
 * GM Trade Simulator Constants (February 2026)
 *
 * Updated cap thresholds and team phases for all sports.
 * These values should match the backend system prompt in /api/gm/grade/route.ts
 */

// CBA Salary Cap Thresholds for 2026
export const CBA_2026 = {
  nfl: {
    cap: 301_200_000,           // $301.2M
    floor: 271_080_000,         // 90% of cap
  },
  nba: {
    cap: 154_647_000,           // $154.6M
    firstApron: 178_100_000,    // $178.1M - hard cap if triggered
    secondApron: 188_900_000,   // $188.9M - severe restrictions
    luxuryTax: 171_300_000,     // $171.3M
  },
  nhl: {
    cap: 95_500_000,            // $95.5M
    floor: 65_000_000,          // $65M
  },
  mlb: {
    cbt: 244_000_000,           // $244M luxury tax threshold
  },
} as const

// Team phases for February 2026
export const TEAM_PHASES_2026 = {
  bears: 'contending',      // 12-7 in 2025, aggressive offseason (Thuney, Jackson)
  bulls: 'rebuilding',      // FULL REBUILD after 7+ deadline trades
  blackhawks: 'rebuilding', // 21-24-9, selling UFAs at deadline
  cubs: 'contending',       // 92-70, aggressive buyer
  whitesox: 'rebuilding',   // 60-102, historic rebuild
} as const

export type TeamPhase = typeof TEAM_PHASES_2026[keyof typeof TEAM_PHASES_2026]

// Grade interpretation for UI
export const GRADE_INTERPRETATION = {
  elite: { min: 90, max: 100, label: 'ELITE', message: 'Franchise-altering steal!', color: '#10b981' },
  excellent: { min: 85, max: 89, label: 'EXCELLENT', message: 'Outstanding trade for Chicago', color: '#22c55e' },
  accepted: { min: 70, max: 84, label: 'ACCEPTED', message: 'Trade approved - good value', color: '#22c55e' },
  close: { min: 65, max: 69, label: 'CLOSE', message: 'Almost there - minor adjustment needed', color: '#eab308' },
  rejected: { min: 55, max: 64, label: 'REJECTED', message: 'Trade rejected - value concerns', color: '#f97316' },
  bad: { min: 40, max: 54, label: 'BAD', message: 'Significant overpay', color: '#ef4444' },
  terrible: { min: 20, max: 39, label: 'TERRIBLE', message: 'Do not make this trade', color: '#dc2626' },
  illegal: { min: 0, max: 19, label: 'ILLEGAL', message: 'Trading untouchable player or illegal trade', color: '#7f1d1d' },
} as const

export function getGradeInterpretation(grade: number) {
  if (grade >= 90) return GRADE_INTERPRETATION.elite
  if (grade >= 85) return GRADE_INTERPRETATION.excellent
  if (grade >= 70) return GRADE_INTERPRETATION.accepted
  if (grade >= 65) return GRADE_INTERPRETATION.close
  if (grade >= 55) return GRADE_INTERPRETATION.rejected
  if (grade >= 40) return GRADE_INTERPRETATION.bad
  if (grade >= 20) return GRADE_INTERPRETATION.terrible
  return GRADE_INTERPRETATION.illegal
}

// Historical trade calibration anchors (for reference/display)
export const HISTORICAL_TRADE_ANCHORS = {
  nfl: {
    elite_cb: 'Sauce Gardner: 2 1sts + player',
    elite_dt: 'Quinnen Williams: 1st + 2nd + player',
    injured_vet: 'Jaire Alexander: 6th only',
  },
  nba: {
    star_swap: 'Harden → Cavs: Garland + Hunter',
    young_talent_swap: 'Kuminga → Hawks: Porzingis',
    bulls_rebuild: 'Bulls made 7+ trades in full rebuild pivot',
  },
  nhl: {
    winger_rental_ceiling: 'Panarin → Kings: prospect + 2 conditional picks',
    retained_star: 'Seth Jones → Panthers: Knight + conditional 1st (with $2.5M retention)',
  },
  mlb: {
    elite_closer: 'Mason Miller + Sears: Leo De Vries (#5 prospect) + 3 more',
    mid_tier_sp_rental: 'Adrian Houser: Curtis Mead + 2 pitching prospects',
  },
} as const

// Position needs by team (February 2026)
export const TEAM_NEEDS_2026 = {
  bears: {
    top: ['EDGE', 'DE', 'OLB'],
    needs: ['DT', 'IOL'],
    strengths: ['WR', 'QB', 'CB', 'OT', 'OG'],
    notes: 'DJ Moore is trade candidate ($28M, declining production)',
  },
  bulls: {
    top: [],
    needs: [],
    strengths: [],
    notes: 'Full rebuild - acquire young players + draft picks. New core: Ivey, Simons, Dillingham, Okoro, Sexton',
  },
  blackhawks: {
    top: ['D', 'G'],
    needs: [],
    strengths: ['C'],
    notes: 'Selling UFAs. May have 0 retention slots available.',
  },
  cubs: {
    top: ['SP', 'RP'],
    needs: [],
    strengths: ['Lineup depth', 'Prospect pool'],
    notes: 'Aggressive buyer',
  },
  whitesox: {
    top: ['Everything'],
    needs: [],
    strengths: [],
    notes: 'Historic rebuild. Luis Robert Jr. is #1 trade chip.',
  },
} as const

// Format cap number for display
export function formatCap(value: number): string {
  return `$${(value / 1_000_000).toFixed(1)}M`
}

// Get cap for a sport
export function getCapForSport(sport: 'nfl' | 'nba' | 'nhl' | 'mlb'): number {
  switch (sport) {
    case 'nfl': return CBA_2026.nfl.cap
    case 'nba': return CBA_2026.nba.cap
    case 'nhl': return CBA_2026.nhl.cap
    case 'mlb': return CBA_2026.mlb.cbt
  }
}

```

---

### src/types/gm.ts

```ts
/**
 * GM Trade Simulator - Centralized Type Definitions
 */

// Asset types for unified handling
export type AssetType = 'PLAYER' | 'DRAFT_PICK' | 'PROSPECT'

// Draft pick with extended metadata
export interface DraftPick {
  year: number
  round: number
  condition?: string
  pickNumber?: number     // If known (e.g., "Pick 12")
  originalTeam?: string   // "Own" or team abbreviation
}

// MLB farm system prospect (matches Datalab gm_mlb_prospects table)
export interface MLBProspect {
  // Core fields from gm_mlb_prospects table
  id?: string                 // UUID
  prospect_id?: string        // Alias for id
  name: string
  position: string
  team_key: string            // 'chw', 'chc', etc.
  team_name?: string          // 'Chicago White Sox'
  org_rank: number            // Organization ranking (1-30)
  age?: number
  prospect_grade: string      // Letter grade: A+, A, A-, B+, B, B-, C+, C
  prospect_grade_numeric?: number  // Numeric grade: 80, 75, 70, 65, 60, 55, 50, 45
  trade_value: number         // Trade value (1-100)
  source?: string             // 'Prospects1500'

  // Optional extended fields (may be added later)
  current_level?: string      // 'R' | 'A' | 'A+' | 'AA' | 'AAA'
  eta?: string                // "Late 2025", "2026", etc.
  scouting_summary?: string
  headshot_url?: string

  // Valuation fields (if available)
  prospect_fv_bucket?: number
  prospect_tier?: 'elite' | 'plus' | 'average' | 'organizational'
  risk_level?: 'low' | 'medium' | 'high'
  position_group?: 'pitcher' | 'catcher' | 'up_the_middle' | 'corner'
  prospect_surplus_value_millions?: number

  // Backwards compatibility aliases
  team_rank?: number          // Alias for org_rank
  rank?: number               // Alias for org_rank
  level?: string              // Alias for current_level
}

// MLB salary retention tracking (0-50% per CBA rules)
export interface SalaryRetention {
  player_id: string
  retention_pct: number  // 0-50
}

// MLB cash considerations for trades
export interface MLBCashConsiderations {
  cash_sent: number       // Max $100,000 per CBA
  cash_received: number   // Max $100,000 per CBA
}

// Player data (mirrors PlayerData from PlayerCard.tsx)
export interface GMPlayerData {
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
  stats: Record<string, number | string | null>
  status?: string
  base_salary?: number | null
  cap_hit?: number | null
  contract_years?: number | null
  contract_expires_year?: number | null
  contract_signed_year?: number | null
  is_rookie_deal?: boolean | null
  trend?: 'hot' | 'rising' | 'stable' | 'declining' | 'cold' | null
  performance_vs_projection?: number | null
  market_sentiment?: 'buy' | 'hold' | 'sell' | null
}

// Trade mode for 2-team vs 3-team trades
export type TradeMode = '2-team' | '3-team'

// Asset with destination (for 3-team trades)
export interface TradeAsset {
  type: 'player' | 'pick' | 'prospect'
  playerId?: string
  player?: GMPlayerData
  pick?: DraftPick
  prospect?: MLBProspect
  fromTeam: string  // team key
  toTeam: string    // team key
}

// Trade flow between two specific teams
export interface TradeFlow {
  from: string
  to: string
  players: GMPlayerData[]
  picks: DraftPick[]
  prospects?: MLBProspect[]
}

// Complete 3-team trade structure
export interface ThreeTeamTrade {
  team1: string // Chicago team key
  team2: string // First opponent key
  team3: string // Second opponent key
  flows: TradeFlow[]
}

// Helper to get flows for a specific direction
export function getFlowBetween(trade: ThreeTeamTrade, from: string, to: string): TradeFlow | undefined {
  return trade.flows.find(f => f.from === from && f.to === to)
}

// Helper to get all assets a team is sending
export function getTeamSending(trade: ThreeTeamTrade, teamKey: string): TradeFlow[] {
  return trade.flows.filter(f => f.from === teamKey)
}

// Helper to get all assets a team is receiving
export function getTeamReceiving(trade: ThreeTeamTrade, teamKey: string): TradeFlow[] {
  return trade.flows.filter(f => f.to === teamKey)
}

// Opponent team metadata
export interface OpponentTeam {
  team_key: string
  team_name: string
  abbreviation: string
  logo_url: string
  primary_color: string
  secondary_color?: string
  sport: string
  conference?: string
  division?: string
}

// Asset row configuration for unified rendering
export interface AssetRowConfig {
  type: AssetType
  accentColor: string     // Left border color
  icon: 'player' | 'pick' | 'prospect'
  primaryText: string
  secondaryText: string
  rightText?: string
  rightBadge?: string
  tooltip?: string
}

// Accent colors for each asset type
export const ASSET_ACCENT_COLORS = {
  PLAYER: null,           // Uses team color
  DRAFT_PICK: '#8b5cf6',  // Purple
  PROSPECT: '#22c55e',    // Green
} as const

// Format a draft pick for display
export function formatDraftPick(pick: DraftPick): { primary: string; secondary: string } {
  const pickNum = pick.pickNumber ? ` Pick ${pick.pickNumber}` : ''
  const primary = `${pick.year} Round ${pick.round}${pickNum}`
  const secondary = pick.originalTeam && pick.originalTeam !== 'Own'
    ? `Original: ${pick.originalTeam}`
    : pick.condition || ''
  return { primary, secondary }
}

// Format salary for display
export function formatSalary(amount: number | null | undefined): string {
  if (!amount) return ''
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

// Format prospect for display
export function formatProspect(prospect: MLBProspect): { primary: string; secondary: string } {
  const rank = prospect.team_rank || prospect.rank
  const rankPrefix = rank ? `#${rank} ` : ''
  const primary = `${rankPrefix}${prospect.name}`
  const level = prospect.current_level || prospect.level || ''
  const secondary = `${level} - ${prospect.position} - Age ${prospect.age}`
  return { primary, secondary }
}

// =====================
// Season Simulation Types
// =====================

export interface SeasonRecord {
  wins: number
  losses: number
  otLosses?: number // NHL only
  madePlayoffs: boolean
  playoffSeed?: number
  divisionRank?: number
  conferenceRank?: number
}

export interface SimulationScoreBreakdown {
  tradeQualityScore: number
  winImprovementScore: number
  playoffBonusScore: number
  championshipBonus: number
  winImprovement: number
}

// Team standing in league standings
export interface TeamStanding {
  teamKey: string
  teamName: string
  abbreviation: string
  logoUrl: string
  primaryColor: string
  wins: number
  losses: number
  otLosses?: number // NHL
  winPct: number
  division: string
  conference: string
  divisionRank: number
  conferenceRank: number
  playoffSeed: number | null
  gamesBack: number
  isUserTeam: boolean
  isTradePartner: boolean
  tradeImpact?: number // +/- wins from trade
}

// Playoff matchup
export interface PlayoffMatchup {
  round: number // 1 = Wild Card/First Round, 2 = Divisional/Semis, 3 = Conference/Finals, 4 = Championship
  roundName: string
  homeTeam: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
    seed: number
    wins: number
  }
  awayTeam: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
    seed: number
    wins: number
  }
  seriesWins: [number, number] // [home, away]
  winner: 'home' | 'away' | null
  isComplete: boolean
  gamesPlayed: number
  userTeamInvolved: boolean
}

// Championship result
export interface ChampionshipResult {
  winner: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
  }
  runnerUp: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
  }
  seriesScore: string // "4-2", "4-3", etc.
  mvp?: string
  userTeamWon: boolean
  userTeamInFinals: boolean
}

// Season summary narrative
export interface SeasonSummary {
  headline: string // "Bears Make Playoff Push After Strategic Trade"
  narrative: string // Full paragraph explaining the season
  tradeImpactSummary: string // How the trade affected the team
  keyMoments: string[] // "Week 12: Clinched playoff berth", etc.
  affectedTeams: {
    teamName: string
    impact: string // "Lost their starting QB, dropped from 10-7 to 7-10"
  }[]
}

export interface SimulationResult {
  success: boolean
  baseline: SeasonRecord
  modified: SeasonRecord
  gmScore: number
  scoreBreakdown: SimulationScoreBreakdown
  // Extended data for full simulation
  standings?: {
    conference1: TeamStanding[] // AFC/Eastern/etc.
    conference2: TeamStanding[] // NFC/Western/etc.
    conference1Name: string
    conference2Name: string
  }
  playoffs?: {
    bracket: PlayoffMatchup[]
    userTeamResult?: {
      madePlayoffs: boolean
      eliminatedRound?: number
      eliminatedBy?: string
      wonChampionship: boolean
    }
  }
  championship?: ChampionshipResult
  seasonSummary?: SeasonSummary
}

export interface SimulationRequest {
  sessionId: string
  sport: string
  teamKey: string
  seasonYear: number
}

// =====================
// Enhanced Historical Context Types (Feb 2026)
// =====================

// Similar historical trade with detailed comparison data
export interface SimilarTrade {
  trade_id?: string              // If from our database
  date: string                   // When it happened
  description: string            // "Bears traded Jay Cutler for 2 1sts + Kyle Orton"
  teams: string[]                // ["CHI_Bears", "DEN_Broncos"]
  outcome: 'worked' | 'failed' | 'neutral'
  grade_given?: number           // If from our system
  similarity_score: number       // 0-100, how similar to user's trade
  key_difference?: string        // What makes it different
}

// Historical precedent for suggested trades
export interface HistoricalPrecedent {
  example_trades: string[]       // "Similar to Khalil Mack trade (2018): Bears sent 2 1sts for star EDGE"
  success_rate_for_structure: number  // "68% of trades with this structure accepted by both teams"
  realistic_because: string      // Why this has historical backing
}

// Trade item for suggested trade structure
export interface TradeItem {
  type: 'player' | 'pick' | 'prospect' | 'cash'
  name?: string
  position?: string
  year?: number
  round?: number
  amount?: number
}

// Value balance for suggested trades
export interface ValueBalance {
  chicago_value: number
  partner_value: number
  difference: number
  fair_value_range: [number, number]
}

// Enhanced historical context section
export interface HistoricalContext {
  similar_trades: SimilarTrade[]  // 2-3 most relevant historical trades
  success_rate: number            // % of similar trades that worked (0-100)
  key_patterns: string[]          // Bullet points of patterns from history
  why_this_fails_historically?: string   // Only if rejected
  what_works_instead?: string            // Only if rejected
}

// Enhanced suggested trade with full structure
export interface EnhancedSuggestedTrade {
  description: string
  chicago_sends: TradeItem[]
  chicago_receives: TradeItem[]
  value_balance: ValueBalance
  cap_salary_notes: string
  why_this_works: string
  likelihood: string
  historical_precedent: HistoricalPrecedent
  // Backwards compatible fields from original SuggestedTrade
  type?: 'add_picks' | 'add_players' | 'remove_players' | 'restructure' | 'three_team'
  summary?: string
  reasoning?: string
  specific_suggestions?: string[]
  estimated_grade_improvement?: number
}

// Legacy historical trade reference (for backwards compatibility)
export interface LegacyHistoricalTradeRef {
  trade: string
  haul: string
  year: number
  outcome: string
}

// Legacy suggested trade (for backwards compatibility)
export interface LegacySuggestedTrade {
  type: 'add_picks' | 'add_players' | 'remove_players' | 'restructure' | 'three_team'
  summary: string
  reasoning: string
  specific_suggestions: string[]
  historical_precedent?: string
  estimated_grade_improvement: number
}

// Type guard to check if historical context is the new enhanced format
export function isEnhancedHistoricalContext(
  ctx: HistoricalContext | LegacyHistoricalTradeRef[] | undefined
): ctx is HistoricalContext {
  if (!ctx) return false
  if (Array.isArray(ctx)) return false
  return 'similar_trades' in ctx && 'success_rate' in ctx
}

// Type guard to check if suggested trade is the new enhanced format
export function isEnhancedSuggestedTrade(
  trade: EnhancedSuggestedTrade | LegacySuggestedTrade | null | undefined
): trade is EnhancedSuggestedTrade {
  if (!trade) return false
  return 'chicago_sends' in trade && 'value_balance' in trade
}

// =====================
// Data Freshness Types (Feb 2026)
// =====================

export interface DataFreshness {
  roster_updated_at: string        // ISO timestamp of last roster sync
  stats_updated_at: string         // ISO timestamp of last stats sync
  contracts_updated_at: string     // ISO timestamp of last contract data sync
  age_hours: number                // Hours since oldest data was updated
  is_stale: boolean                // True if any data is older than threshold (24h)
  warning?: string                 // Optional warning message if data is stale
}

// Validity indicator for pre-submission validation
export interface ValidityIndicator {
  is_valid: boolean
  issues: ValidationIssue[]
  cap_room_available: boolean
  roster_spots_available: boolean
  trade_deadline_status: 'open' | 'closed' | 'approaching'
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  player_name?: string
  resolution?: string
}

```

---

### src/types/gm-audit.ts

```ts
export interface AuditResult {
  audit_id: string
  audit_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  audit_score: number
  confidence: number

  validation_summary: {
    fields_validated: number
    fields_confirmed: number
    fields_conflicting: number
    fields_unverified: number
  }

  discrepancies: Discrepancy[]

  methodology_review?: {
    score: number
    position_values_correct: boolean
    age_curves_applied: boolean
    cap_calculation_accurate: boolean
    team_context_considered: boolean
    historical_precedent_valid: boolean
    issues: string[]
  }

  grade_justification?: {
    score: number
    grade_matches_reasoning: boolean
    breakdown_consistent: boolean
    no_contradictions: boolean
    realism_considered: boolean
    issues: string[]
  }

  overall_assessment: string

  recommendations: {
    for_user: string[]
    for_gm_model?: string[]
    for_supabase?: string[]
  }

  sources_consulted?: Array<{
    source: string
    url?: string
    data_retrieved: string
  }>

  response_time_ms?: number
  gm_grade?: number
  trade_summary?: string
  cached?: boolean
}

export interface Discrepancy {
  field: string
  gm_value: string | number
  actual_value: string | number
  sources_checked: string[]
  severity: 'minor' | 'moderate' | 'major'
  impact?: string
}

```

---

