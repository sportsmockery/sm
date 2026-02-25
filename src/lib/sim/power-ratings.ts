/**
 * Simulation Engine - Power Ratings
 */

import type { PlayerSimImpact } from '@/types/gm'
import type { TradeData, TradePlayer, TradePick } from './data-fetcher'
import { winPctToPowerRating } from './data-fetcher'

const NFL_POS_MULT: Record<string, number> = {
  QB: 3.0, EDGE: 1.8, DE: 1.8, OLB: 1.4, CB: 1.4, WR: 1.3, OT: 1.3, T: 1.3,
  DT: 1.2, DL: 1.2, LB: 1.0, ILB: 1.0, S: 1.0, FS: 1.0, SS: 1.0,
  TE: 1.0, OG: 1.0, G: 1.0, C: 0.9, RB: 0.6, K: 0.3, P: 0.2,
}

const NBA_POS_MULT: Record<string, number> = {
  SF: 1.1, PF: 1.05, C: 1.05, PG: 1.0, SG: 1.0, G: 1.0, F: 1.05,
}

const NHL_POS_MULT: Record<string, number> = {
  G: 1.3, C: 1.2, D: 1.1, LW: 1.0, RW: 1.0, W: 1.0, F: 1.0,
}

const MLB_POS_MULT: Record<string, number> = {
  SP: 1.5, RP: 0.8, CP: 0.9, P: 1.2, SS: 1.2, CF: 1.1, C: 1.1,
  '2B': 1.05, '3B': 1.0, RF: 1.0, LF: 0.95, '1B': 0.85, DH: 0.7, OF: 1.0,
}

function getAgeFactor(age: number | undefined, sport: string): number {
  if (!age) return 0.9
  if (sport === 'nfl') {
    if (age >= 24 && age <= 27) return 1.0
    if (age >= 28 && age <= 30) return 0.95
    if (age >= 31 && age <= 33) return 0.80
    if (age >= 34) return 0.65
    return 0.85
  }
  if (sport === 'nba' || sport === 'nhl') {
    if (age >= 22 && age <= 27) return 1.0
    if (age >= 28 && age <= 30) return 0.92
    if (age >= 31 && age <= 33) return 0.80
    if (age >= 34) return 0.65
    return 0.85
  }
  if (age >= 25 && age <= 30) return 1.0
  if (age >= 31 && age <= 33) return 0.92
  if (age >= 34 && age <= 36) return 0.80
  if (age >= 37) return 0.65
  return 0.85
}

function statVal(stats: Record<string, number | string | null>, ...keys: string[]): number {
  for (const k of keys) {
    const v = stats[k]
    if (v != null && v !== '') return Number(v) || 0
  }
  return 0
}

function calculateNFLPIR(player: TradePlayer): number {
  const s = player.stats
  const posMult = NFL_POS_MULT[player.position.toUpperCase()] ?? 1.0
  const passYds = (statVal(s, 'passing_yards', 'passing_yds', 'pass_yds') / 4500) * 8
  const passTd = (statVal(s, 'passing_touchdowns', 'passing_td', 'pass_td') / 35) * 4
  const rushYds = (statVal(s, 'rushing_yards', 'rushing_yds', 'rush_yds') / 1200) * 3
  const recYds = (statVal(s, 'receiving_yards', 'receiving_yds', 'rec_yds') / 1200) * 3
  const sacks = (statVal(s, 'def_sacks', 'sacks') / 12) * 3
  const tackles = (statVal(s, 'def_tackles_total', 'tackles') / 120) * 2
  const raw = passYds + passTd + rushYds + recYds + sacks + tackles
  return Math.min(15, raw * posMult * getAgeFactor(player.age, 'nfl'))
}

function calculateNBAPIR(player: TradePlayer): number {
  const s = player.stats
  const posMult = NBA_POS_MULT[player.position.toUpperCase()] ?? 1.0
  const ppg = statVal(s, 'points', 'ppg')
  const rpg = statVal(s, 'total_rebounds', 'rebounds', 'rpg')
  const apg = statVal(s, 'assists', 'apg')
  const spg = statVal(s, 'steals', 'spg')
  const bpg = statVal(s, 'blocks', 'bpg')
  const raw = ppg * 0.35 + rpg * 0.20 + apg * 0.25 + spg * 0.60 + bpg * 0.50
  return Math.min(15, raw * posMult * getAgeFactor(player.age, 'nba'))
}

function calculateNHLPIR(player: TradePlayer): number {
  const s = player.stats
  const posMult = NHL_POS_MULT[player.position.toUpperCase()] ?? 1.0
  if (player.position.toUpperCase() === 'G') {
    const saves = statVal(s, 'saves')
    const ga = statVal(s, 'goals_against')
    const svPct = saves > 0 ? saves / (saves + ga) : 0
    return Math.min(15, (svPct > 0.91 ? 8 : svPct > 0.89 ? 5 : 3) * posMult * getAgeFactor(player.age, 'nhl'))
  }
  const goals = statVal(s, 'goals')
  const assists = statVal(s, 'assists')
  const points = statVal(s, 'points') || (goals + assists)
  const plusMinus = statVal(s, 'plus_minus')
  const gp = Math.max(statVal(s, 'games_played'), 1)
  const ppg = points / gp
  const raw = ppg * 6 + Math.max(0, plusMinus / 20) * 2
  return Math.min(15, raw * posMult * getAgeFactor(player.age, 'nhl'))
}

function calculateMLBPIR(player: TradePlayer): number {
  const s = player.stats
  const posMult = MLB_POS_MULT[player.position.toUpperCase()] ?? 1.0
  const isPitcher = ['SP', 'RP', 'CP', 'P'].includes(player.position.toUpperCase())
  if (isPitcher) {
    const era = statVal(s, 'era', 'earned_run_average') || 4.50
    const ip = statVal(s, 'innings_pitched', 'ip')
    const kPerIp = ip > 0 ? statVal(s, 'strikeouts_pitched', 'k') / ip : 0
    const raw = Math.max(0, (4.50 - era) * 1.5) + kPerIp * 3 + (ip / 200) * 2
    return Math.min(15, raw * posMult * getAgeFactor(player.age, 'mlb'))
  }
  const avg = statVal(s, 'batting_average', 'avg') || 0.250
  const hr = statVal(s, 'home_runs', 'hr')
  const rbi = statVal(s, 'rbi')
  const raw = Math.max(0, (avg - 0.220) * 25) + (hr / 40) * 4 + (rbi / 100) * 2
  return Math.min(15, raw * posMult * getAgeFactor(player.age, 'mlb'))
}

export function calculatePlayerPIR(player: TradePlayer, sport: string): number {
  // If this is a prospect with no real stats, use prospect_grade/trade_value for PIR
  if (player.is_prospect) {
    return calculateProspectPIR(player, sport)
  }

  // Check if player has any meaningful stats — if not, fall back to prospect-style rating
  const hasStats = Object.values(player.stats).some(v => v != null && v !== '' && v !== 0)
  if (!hasStats && player.trade_value) {
    return calculateProspectPIR(player, sport)
  }

  switch (sport) {
    case 'nfl': return calculateNFLPIR(player)
    case 'nba': return calculateNBAPIR(player)
    case 'nhl': return calculateNHLPIR(player)
    case 'mlb': return calculateMLBPIR(player)
    default: return 1.0
  }
}

/**
 * Calculate PIR for prospects based on prospect_grade and trade_value.
 * Prospects have no regular-season stats but carry future value.
 * Scale: prospect_grade 80+ → PIR ~6-8, grade 50 → PIR ~2-3, grade 30 → PIR ~1
 */
function calculateProspectPIR(player: TradePlayer, sport: string): number {
  const grade = player.prospect_grade || player.trade_value || 30
  // Normalize grade (0-100) to PIR (0-10 scale)
  // Top prospects (80+) → PIR 6-8, mid (50) → PIR 3, low (30) → PIR 1
  const basePIR = Math.max(0.5, (grade / 100) * 10)

  // Org rank bonus: top-5 prospects in an org get extra value
  const rankBonus = player.org_rank ? Math.max(0, (6 - Math.min(player.org_rank, 6)) * 0.3) : 0

  // Young age bonus for prospects (they're all young, but younger = more years of control)
  const ageFactor = player.age && player.age < 22 ? 1.1 : 1.0

  // Sport-specific ceiling adjustments
  const sportMult = sport === 'mlb' ? 0.85 : sport === 'nhl' ? 0.9 : 1.0 // MLB prospects have lower immediate impact

  return Math.min(10, (basePIR + rankBonus) * ageFactor * sportMult)
}

function getPickValue(pick: TradePick): number {
  switch (pick.round) {
    case 1: return 1.5
    case 2: return 0.8
    case 3: return 0.4
    default: return 0.3
  }
}

function getPlayerCategory(position: string, sport: string): string {
  if (sport === 'nfl') {
    const pos = position.toUpperCase()
    if (['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'G', 'T'].includes(pos)) return 'Offense'
    if (['K', 'P'].includes(pos)) return 'Special Teams'
    return 'Defense'
  }
  if (sport === 'mlb') {
    if (['SP', 'RP', 'CP', 'P'].includes(position.toUpperCase())) return 'Pitching'
    return 'Batting'
  }
  if (sport === 'nhl') {
    if (position.toUpperCase() === 'G') return 'Goaltending'
    if (position.toUpperCase() === 'D') return 'Defense'
    return 'Offense'
  }
  return 'Roster'
}

export interface TradeImpactResult {
  powerRatingDelta: number
  playerImpacts: PlayerSimImpact[]
  avgTradeGrade: number
  tradePartnerDeltas: Record<string, number>
}

export function calculateTradeImpact(trades: TradeData[], sport: string): TradeImpactResult {
  if (trades.length === 0) {
    return { powerRatingDelta: 0, playerImpacts: [], avgTradeGrade: 50, tradePartnerDeltas: {} }
  }

  let totalPlayerDelta = 0
  let totalPickDelta = 0
  const playerImpacts: PlayerSimImpact[] = []
  const tradePartnerDeltas: Record<string, number> = {}

  for (const trade of trades) {
    let pirGained = 0
    let pirLost = 0

    for (const player of trade.playersReceived) {
      const pir = calculatePlayerPIR(player, sport)
      pirGained += pir
      playerImpacts.push({
        playerName: player.name, position: player.position, direction: 'added',
        powerRatingDelta: +(pir * 1.2).toFixed(1), category: getPlayerCategory(player.position, sport),
      })
    }

    for (const player of trade.playersSent) {
      const pir = calculatePlayerPIR(player, sport)
      pirLost += pir
      playerImpacts.push({
        playerName: player.name, position: player.position, direction: 'removed',
        powerRatingDelta: +(-pir * 1.2).toFixed(1), category: getPlayerCategory(player.position, sport),
      })
    }

    const picksGained = trade.picksReceived.reduce((sum, p) => sum + getPickValue(p), 0)
    const picksLost = trade.picksSent.reduce((sum, p) => sum + getPickValue(p), 0)
    const playerDelta = pirGained - pirLost
    const pickDelta = picksGained - picksLost

    totalPlayerDelta += playerDelta
    totalPickDelta += pickDelta

    // Apply inverse delta to trade partner(s)
    // For 3-team trades, split the inverse impact between both partners
    const inverseDelta = -(playerDelta + pickDelta) * 0.7 * 1.2

    if (trade.isThreeTeam && trade.partnerTeamKey2) {
      // Split the inverse impact between both trade partners
      const splitDelta = inverseDelta / 2
      const partnerKey1 = trade.partnerTeamKey.toUpperCase()
      const partnerKey2 = trade.partnerTeamKey2.toUpperCase()
      tradePartnerDeltas[partnerKey1] = (tradePartnerDeltas[partnerKey1] || 0) + splitDelta
      tradePartnerDeltas[partnerKey2] = (tradePartnerDeltas[partnerKey2] || 0) + splitDelta
    } else {
      // Standard 2-team trade - all inverse impact goes to single partner
      const partnerKey = trade.partnerTeamKey.toUpperCase()
      tradePartnerDeltas[partnerKey] = (tradePartnerDeltas[partnerKey] || 0) + inverseDelta
    }
  }

  const rawDelta = (totalPlayerDelta + totalPickDelta) * 0.7
  const powerRatingDelta = Math.max(-25, Math.min(25, rawDelta * 1.2))
  const avgTradeGrade = trades.reduce((sum, t) => sum + t.grade, 0) / trades.length

  return { powerRatingDelta, playerImpacts, avgTradeGrade, tradePartnerDeltas }
}

export function teamPowerRating(winPct: number, sport: string): number {
  return winPctToPowerRating(winPct, sport)
}
