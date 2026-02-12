/**
 * Simulation Engine - Data Fetcher
 */

import { datalabAdmin } from '@/lib/supabase-datalab'
import { CHICAGO_TEAMS } from './constants'

export interface ScheduleGame {
  gameDate: string
  opponent: string
  opponentFullName: string
  isHome: boolean
  week?: number
}

export interface TradePlayer {
  name: string
  position: string
  age: number
  stats: Record<string, number | string | null>
}

export interface TradePick {
  round: number
  year: number
}

export interface TradeData {
  partnerTeamKey: string
  partnerTeamKey2?: string  // For 3-team trades
  isThreeTeam: boolean
  grade: number
  playersReceived: TradePlayer[]
  playersSent: TradePlayer[]
  picksReceived: TradePick[]
  picksSent: TradePick[]
}

// Team-specific table/column mappings
// Keys match the short form used by the UI ('bears', 'bulls', etc.)
const TEAM_CONFIG: Record<string, {
  gamesTable: string
  seasonsTable: string
  seasonCol: number
  opponentCol: string
  opponentNameCol: string
  homeCol: string
  dateCol: string
  weekCol?: string
  winsCol: string
  lossesCol: string
  otlCol?: string
}> = {
  'bears': {
    gamesTable: 'bears_games_master', seasonsTable: 'bears_season_record', seasonCol: 2025,
    opponentCol: 'opponent', opponentNameCol: 'opponent_full_name', homeCol: 'is_bears_home',
    dateCol: 'game_date', weekCol: 'week', winsCol: 'regular_season_wins', lossesCol: 'regular_season_losses',
  },
  'bulls': {
    gamesTable: 'bulls_games_master', seasonsTable: 'bulls_seasons', seasonCol: 2026,
    opponentCol: 'opponent', opponentNameCol: 'opponent_full_name', homeCol: 'is_bulls_home',
    dateCol: 'game_date', winsCol: 'wins', lossesCol: 'losses',
  },
  'blackhawks': {
    gamesTable: 'blackhawks_games_master', seasonsTable: 'blackhawks_seasons', seasonCol: 2026,
    opponentCol: 'opponent', opponentNameCol: 'opponent_full_name', homeCol: 'is_blackhawks_home',
    dateCol: 'game_date', winsCol: 'wins', lossesCol: 'losses', otlCol: 'otl',
  },
  'cubs': {
    gamesTable: 'cubs_games_master', seasonsTable: 'cubs_seasons', seasonCol: 2025,
    opponentCol: 'opponent', opponentNameCol: 'opponent_full_name', homeCol: 'is_cubs_home',
    dateCol: 'game_date', winsCol: 'wins', lossesCol: 'losses',
  },
  'whitesox': {
    gamesTable: 'whitesox_games_master', seasonsTable: 'whitesox_seasons', seasonCol: 2025,
    opponentCol: 'opponent', opponentNameCol: 'opponent_full_name', homeCol: 'is_whitesox_home',
    dateCol: 'game_date', winsCol: 'wins', lossesCol: 'losses',
  },
}

export async function fetchRealSchedule(teamKey: string, sport: string): Promise<ScheduleGame[]> {
  const cfg = TEAM_CONFIG[teamKey]
  if (!cfg) return generateSyntheticSchedule(sport)

  try {
    const { data: games } = await datalabAdmin
      .from(cfg.gamesTable)
      .select('*')
      .eq('season', cfg.seasonCol)
      .order(cfg.dateCol)

    if (!games || games.length === 0) return generateSyntheticSchedule(sport)

    return (games as any[]).map((g: any) => ({
      gameDate: g[cfg.dateCol] || '',
      opponent: (g[cfg.opponentCol] || '').toUpperCase(),
      opponentFullName: g[cfg.opponentNameCol] || g[cfg.opponentCol] || '',
      isHome: !!g[cfg.homeCol],
      week: cfg.weekCol ? g[cfg.weekCol] : undefined,
    }))
  } catch (err) {
    console.error(`[Sim] Failed to fetch schedule for ${teamKey}:`, err)
    return generateSyntheticSchedule(sport)
  }
}

export async function fetchRealRecord(teamKey: string): Promise<{ wins: number; losses: number; otLosses?: number }> {
  const cfg = TEAM_CONFIG[teamKey]
  if (!cfg) return { wins: 0, losses: 0 }

  try {
    const { data } = await datalabAdmin
      .from(cfg.seasonsTable)
      .select('*')
      .eq('season', cfg.seasonCol)
      .single()

    if (!data) return { wins: 0, losses: 0 }

    return {
      wins: (data as any)[cfg.winsCol] || 0,
      losses: (data as any)[cfg.lossesCol] || 0,
      otLosses: cfg.otlCol ? (data as any)[cfg.otlCol] : undefined,
    }
  } catch (err) {
    console.error(`[Sim] Failed to fetch record for ${teamKey}:`, err)
    return { wins: 0, losses: 0 }
  }
}

export async function fetchTradeData(sessionId: string): Promise<TradeData[]> {
  try {
    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'accepted')

    if (!trades || trades.length === 0) return []

    return (trades as any[]).map((t: any) => ({
      partnerTeamKey: t.partner_team_key || '',
      partnerTeamKey2: t.trade_partner_2 || undefined,  // For 3-team trades
      isThreeTeam: !!t.is_three_team,
      grade: t.grade || 50,
      playersReceived: parsePlayersJSON(t.players_received),
      playersSent: parsePlayersJSON(t.players_sent),
      picksReceived: parsePicksJSON(t.draft_picks_received),
      picksSent: parsePicksJSON(t.draft_picks_sent),
    }))
  } catch (err) {
    console.error('[Sim] Failed to fetch trades:', err)
    return []
  }
}

function parsePlayersJSON(json: any): TradePlayer[] {
  if (!json) return []
  const arr = Array.isArray(json) ? json : []
  return arr.map((p: any) => ({
    name: p.full_name || p.name || 'Unknown',
    position: p.position || 'Unknown',
    age: p.age || 27,
    stats: p.stats || {},
  }))
}

function parsePicksJSON(json: any): TradePick[] {
  if (!json) return []
  const arr = Array.isArray(json) ? json : []
  return arr.map((p: any) => ({
    round: p.round || 1,
    year: p.year || 2026,
  }))
}

export function winPctToPowerRating(winPct: number, sport: string): number {
  const base = 30
  const scale = sport === 'nfl' ? 60 : 65
  return Math.max(25, Math.min(95, base + winPct * scale))
}

import { getApproxWinPct } from './constants'

export function getOpponentPowerRating(oppAbbrev: string, sport: string, partnerDeltas: Record<string, number>): number {
  let wPct = getApproxWinPct(oppAbbrev, sport)
  const delta = partnerDeltas[oppAbbrev]
  if (delta) wPct += delta / 100
  wPct = Math.max(0.15, Math.min(0.85, wPct))
  return winPctToPowerRating(wPct, sport)
}

// Fallback synthetic schedule
function generateSyntheticSchedule(sport: string): ScheduleGame[] {
  const chicagoInfo = Object.values(CHICAGO_TEAMS).find(t => t.sport === sport)
  if (!chicagoInfo) return []

  const gamesCount = sport === 'nfl' ? 17 : sport === 'mlb' ? 162 : 82
  const games: ScheduleGame[] = []
  const opponents = ['OPP1', 'OPP2', 'OPP3', 'OPP4', 'OPP5']

  for (let i = 0; i < gamesCount; i++) {
    games.push({
      gameDate: '',
      opponent: opponents[i % opponents.length],
      opponentFullName: `Opponent ${(i % opponents.length) + 1}`,
      isHome: i % 2 === 0,
      week: sport === 'nfl' ? i + 1 : undefined,
    })
  }
  return games
}
