# Simulate Season — Complete Source Reference

> **Generated:** 2026-02-20
> **Purpose:** Comprehensive read-only reference of all files powering the GM Trade Simulator's "Simulate Season" feature.
> **Note:** All source files remain in place and unchanged. This is a consolidated copy for reading convenience.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Engine: `src/lib/sim/season-engine.ts`](#1-season-enginets)
3. [Game Engine: `src/lib/sim/game-engine.ts`](#2-game-enginets)
4. [Power Ratings: `src/lib/sim/power-ratings.ts`](#3-power-ratingsts)
5. [Data Fetcher: `src/lib/sim/data-fetcher.ts`](#4-data-fetcherts)
6. [Constants: `src/lib/sim/constants.ts`](#5-constantsts)
7. [API Route: `src/app/api/gm/sim/season/route.ts`](#6-api-route)
8. [Frontend: `src/components/gm/SimulationTrigger.tsx`](#7-simulationtriggertsx)
9. [Frontend: `src/components/gm/SimulationResults.tsx`](#8-simulationresultstsx)
10. [Types: `src/types/gm.ts` (simulation section)](#9-types-simulation-section)
11. [Page Integration: `src/app/gm/page.tsx` (relevant excerpts)](#10-page-integration)

---

## Architecture Overview

```
User clicks "Simulate Season"
        │
        ▼
  gm/page.tsx  ──POST──▶  /api/gm/sim/season/route.ts
                                    │
                                    ▼
                          season-engine.ts  (orchestrator)
                           ┌────────┼────────────┐
                           ▼        ▼            ▼
                    data-fetcher  power-ratings  game-engine
                    (Supabase)   (PIR calc)     (game sim)
                           │        │            │
                           ▼        ▼            ▼
                        constants.ts (league config, teams, win%)
                                    │
                                    ▼
                          SimulationResult JSON
                                    │
                    ┌───────────────┤
                    ▼               ▼
          SimulationResults   SimulationTrigger
          (results modal)     (CTA button)
```

---

## 1. season-engine.ts

**Path:** `src/lib/sim/season-engine.ts`
**Purpose:** Main orchestrator — fetches data, runs game-by-game simulation, generates standings, playoffs, championship, GM score, and summary narrative.

```typescript
/**
 * Simulation Engine - Season Orchestrator
 */

import type {
  SimulationResult,
  SimulatedGame,
  SeasonSegment,
  TeamStanding,
  PlayoffMatchup,
  ChampionshipResult,
  SeasonSummary,
} from '@/types/gm'
import { LEAGUE_CONFIG, CHICAGO_TEAMS, getTeamInfo, getApproxWinPct } from './constants'
import { fetchRealSchedule, fetchRealRecord, fetchTradeData, getOpponentPowerRating, winPctToPowerRating } from './data-fetcher'
import { calculateTradeImpact, teamPowerRating } from './power-ratings'
import { simulateGame, updateMomentum, setSeed } from './game-engine'

export interface SimulateSeasonInput {
  sessionId: string
  sport: string
  teamKey: string
  seasonYear: number
}

export async function simulateSeason(input: SimulateSeasonInput): Promise<SimulationResult> {
  const { sessionId, sport, teamKey, seasonYear } = input
  const config = LEAGUE_CONFIG[sport]
  const chicagoInfo = CHICAGO_TEAMS[teamKey]

  if (!config || !chicagoInfo) {
    return {
      success: false,
      baseline: { wins: 0, losses: 0, madePlayoffs: false },
      modified: { wins: 0, losses: 0, madePlayoffs: false },
      gmScore: 0,
      scoreBreakdown: { tradeQualityScore: 0, winImprovementScore: 0, playoffBonusScore: 0, championshipBonus: 0, winImprovement: 0 },
    }
  }

  setSeed(Date.now())

  // Fetch real data
  const [schedule, realRecord, trades] = await Promise.all([
    fetchRealSchedule(teamKey, sport),
    fetchRealRecord(teamKey),
    fetchTradeData(sessionId),
  ])

  // Power ratings
  const totalGames = realRecord.wins + realRecord.losses + (realRecord.otLosses || 0)
  const realWinPct = totalGames > 0 ? realRecord.wins / totalGames : 0.50
  const baselinePR = teamPowerRating(realWinPct, sport)
  const tradeImpact = calculateTradeImpact(trades, sport)
  const modifiedPR = Math.max(25, Math.min(95, baselinePR + tradeImpact.powerRatingDelta))

  // Division rivals
  let divisionRivals: string[] = []
  for (const [, teams] of Object.entries(config.divisions)) {
    if (teams.includes(chicagoInfo.abbrev)) {
      divisionRivals = teams.filter(t => t !== chicagoInfo.abbrev)
      break
    }
  }

  // Simulate every game
  const games: SimulatedGame[] = []
  let momentum = 0
  const recentResults: ('W' | 'L' | 'T' | 'OTL')[] = []
  let runW = 0, runL = 0, runOTL = 0
  const gameSchedule = schedule.slice(0, config.gamesPerSeason)

  for (let i = 0; i < gameSchedule.length; i++) {
    const sg = gameSchedule[i]
    const oppRating = getOpponentPowerRating(sg.opponent, sport, tradeImpact.tradePartnerDeltas)
    const gr = simulateGame({
      teamRating: modifiedPR, opponentRating: oppRating, isHome: sg.isHome,
      sport, momentum, opponentAbbrev: sg.opponent, opponentName: sg.opponentFullName,
      rivalOpponents: divisionRivals,
    })

    if (gr.result === 'W') runW++
    else if (gr.result === 'OTL') runOTL++
    else runL++

    recentResults.push(gr.result)
    momentum = updateMomentum(momentum, recentResults)

    const oppInfo = getTeamInfo(sg.opponent, sport)
    games.push({
      gameNumber: i + 1,
      week: sg.week,
      date: sg.gameDate,
      opponent: sg.opponent,
      opponentName: sg.opponentFullName || oppInfo.teamName,
      opponentLogoUrl: oppInfo.logoUrl,
      isHome: sg.isHome,
      teamScore: gr.teamScore,
      opponentScore: gr.opponentScore,
      result: gr.result,
      isOvertime: gr.isOvertime,
      runningRecord: { wins: runW, losses: runL, otLosses: sport === 'nhl' ? runOTL : undefined },
      teamPowerRating: modifiedPR,
      opponentPowerRating: oppRating,
      highlight: gr.highlight,
      segment: getSegmentLabel(sg.gameDate, sg.week, sport, i, config.gamesPerSeason),
    })
  }

  // Segments
  const segments = buildSegments(games, sport)

  // Standings
  const standings = generateStandings(chicagoInfo.abbrev, { wins: runW, losses: runL, otLosses: sport === 'nhl' ? runOTL : undefined },
    trades, config, sport, tradeImpact.tradePartnerDeltas)

  // Playoffs
  const { bracket, userTeamResult, championship } = simulatePlayoffs(standings, chicagoInfo.abbrev, config, sport)

  // GM Score
  const gmData = calculateGMScore(realRecord, { wins: runW, losses: runL, otLosses: sport === 'nhl' ? runOTL : undefined },
    tradeImpact.avgTradeGrade, userTeamResult, sport)

  // Summary
  const teamName = getTeamInfo(chicagoInfo.abbrev, sport).teamName
  const seasonSummary = generateSummary(teamName, realRecord, { wins: runW, losses: runL }, trades, userTeamResult, standings, config, seasonYear)

  return {
    success: true,
    baseline: { wins: realRecord.wins, losses: realRecord.losses, otLosses: realRecord.otLosses, madePlayoffs: realRecord.wins > config.gamesPerSeason * 0.52 },
    modified: { wins: runW, losses: runL, otLosses: sport === 'nhl' ? runOTL : undefined, madePlayoffs: userTeamResult.madePlayoffs, playoffSeed: userTeamResult.playoffSeed },
    gmScore: gmData.gmScore,
    scoreBreakdown: gmData.breakdown,
    standings: { conference1: standings.conf1, conference2: standings.conf2, conference1Name: config.conferences[0], conference2Name: config.conferences[1] },
    playoffs: { bracket, userTeamResult: { madePlayoffs: userTeamResult.madePlayoffs, eliminatedRound: userTeamResult.eliminatedRound, eliminatedBy: userTeamResult.eliminatedBy, wonChampionship: userTeamResult.wonChampionship } },
    championship,
    seasonSummary,
    games,
    segments,
    playerImpacts: tradeImpact.playerImpacts,
    baselinePowerRating: +baselinePR.toFixed(1),
    modifiedPowerRating: +modifiedPR.toFixed(1),
    previousSeasonRecord: { wins: realRecord.wins, losses: realRecord.losses, otLosses: realRecord.otLosses },
  }
}

// === Helpers ===

function getSegmentLabel(date: string, week: number | undefined, sport: string, idx: number, total: number): string {
  if (sport === 'nfl' && week) {
    if (week <= 4) return 'Weeks 1-4'
    if (week <= 8) return 'Weeks 5-8'
    if (week <= 12) return 'Weeks 9-12'
    if (week <= 14) return 'Weeks 13-14'
    return 'Weeks 15-18'
  }
  if (date) {
    try { return new Date(date).toLocaleString('en-US', { month: 'long' }) }
    catch { /* fall through */ }
  }
  const q = Math.floor(idx / (total / 4))
  return ['Q1', 'Q2', 'Q3', 'Q4'][Math.min(q, 3)]
}

function buildSegments(games: SimulatedGame[], sport: string): SeasonSegment[] {
  const map = new Map<string, { w: number; l: number; otl: number; ts: number[]; os: number[] }>()
  for (const g of games) {
    const s = map.get(g.segment) || { w: 0, l: 0, otl: 0, ts: [], os: [] }
    if (g.result === 'W') s.w++
    else if (g.result === 'OTL') s.otl++
    else s.l++
    s.ts.push(g.teamScore)
    s.os.push(g.opponentScore)
    map.set(g.segment, s)
  }
  const result: SeasonSegment[] = []
  for (const [label, d] of map) {
    const t = d.w + d.l + d.otl
    result.push({
      label, wins: d.w, losses: d.l,
      otLosses: sport === 'nhl' && d.otl > 0 ? d.otl : undefined,
      winPct: t > 0 ? d.w / t : 0,
      avgTeamScore: t > 0 ? +(d.ts.reduce((a, b) => a + b, 0) / t).toFixed(1) : 0,
      avgOppScore: t > 0 ? +(d.os.reduce((a, b) => a + b, 0) / t).toFixed(1) : 0,
    })
  }
  return result
}

interface StandingsResult { conf1: TeamStanding[]; conf2: TeamStanding[] }

function generateStandings(
  chicagoAbbrev: string,
  chicagoRecord: { wins: number; losses: number; otLosses?: number },
  trades: { partnerTeamKey: string; partnerTeamKey2?: string; isThreeTeam?: boolean }[],
  config: typeof LEAGUE_CONFIG[string],
  sport: string,
  partnerDeltas: Record<string, number>,
): StandingsResult {
  const allTeams: { abbrev: string; division: string; conference: string }[] = []
  for (const [div, teams] of Object.entries(config.divisions)) {
    const conf = getConf(div, config)
    for (const abbrev of teams) allTeams.push({ abbrev, division: div, conference: conf })
  }

  // Collect all trade partner keys (including second partner for 3-team trades)
  const partnerKeys = new Set(
    trades.flatMap(t => {
      const keys = [t.partnerTeamKey.toUpperCase()]
      if (t.isThreeTeam && t.partnerTeamKey2) {
        keys.push(t.partnerTeamKey2.toUpperCase())
      }
      return keys
    })
  )
  const records: TeamStanding[] = allTeams.map(team => {
    const isUser = team.abbrev === chicagoAbbrev
    const isPartner = partnerKeys.has(team.abbrev)
    let wins: number, losses: number, otLosses: number | undefined
    if (isUser) {
      wins = chicagoRecord.wins; losses = chicagoRecord.losses; otLosses = chicagoRecord.otLosses
    } else {
      let wPct = getApproxWinPct(team.abbrev, sport) + (hashRand(team.abbrev) - 0.5) * 0.08
      if (isPartner && partnerDeltas[team.abbrev]) wPct += partnerDeltas[team.abbrev] / 100
      wPct = Math.max(0.15, Math.min(0.85, wPct))
      wins = Math.round(config.gamesPerSeason * wPct)
      losses = config.gamesPerSeason - wins
      if (sport === 'nhl') { const o = Math.round(losses * 0.15); otLosses = o; losses -= o }
    }
    const info = getTeamInfo(team.abbrev, sport)
    const tot = wins + losses + (otLosses || 0)
    return {
      ...info, wins, losses, otLosses: sport === 'nhl' ? otLosses : undefined,
      winPct: tot > 0 ? wins / tot : 0, division: team.division, conference: team.conference,
      divisionRank: 0, conferenceRank: 0, playoffSeed: null, gamesBack: 0,
      isUserTeam: isUser, isTradePartner: isPartner,
      tradeImpact: isUser ? chicagoRecord.wins - Math.round(config.gamesPerSeason * getApproxWinPct(team.abbrev, sport))
        : isPartner ? Math.round((partnerDeltas[team.abbrev] || 0) / 2) : undefined,
    }
  })

  const conf1: TeamStanding[] = []
  const conf2: TeamStanding[] = []
  for (const conf of config.conferences) {
    const ct = records.filter(t => t.conference === conf).sort((a, b) => {
      if (sport === 'nhl') return (b.wins * 2 + (b.otLosses || 0)) - (a.wins * 2 + (a.otLosses || 0))
      return b.winPct - a.winPct
    })
    ct.forEach((t, i) => { t.conferenceRank = i + 1; if (i < config.playoffTeams) t.playoffSeed = i + 1 })
    const leader = ct[0]
    ct.forEach(t => {
      t.gamesBack = sport === 'nhl' ? ((leader.wins * 2 + (leader.otLosses || 0)) - (t.wins * 2 + (t.otLosses || 0))) / 2 : leader.wins - t.wins
    })
    const divGroups = new Map<string, TeamStanding[]>()
    for (const t of ct) { const d = divGroups.get(t.division) || []; d.push(t); divGroups.set(t.division, d) }
    for (const dt of divGroups.values()) dt.forEach((t, i) => { t.divisionRank = i + 1 })
    if (conf === config.conferences[0]) conf1.push(...ct)
    else conf2.push(...ct)
  }
  return { conf1, conf2 }
}

function getConf(div: string, config: typeof LEAGUE_CONFIG[string]): string {
  if (div.includes('AFC') || div.includes('AL ')) return config.conferences[0]
  if (div.includes('NFC') || div.includes('NL ')) return config.conferences[1]
  const eastDivs = ['Atlantic', 'Central', 'Southeast', 'Metropolitan']
  return eastDivs.includes(div) ? config.conferences[0] : config.conferences[1]
}

function hashRand(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h }
  return ((h & 0xFFFF) / 0xFFFF)
}

// Playoffs

interface PlayoffResult {
  bracket: PlayoffMatchup[]
  userTeamResult: { madePlayoffs: boolean; playoffSeed?: number; eliminatedRound?: number; eliminatedBy?: string; wonChampionship: boolean }
  championship?: ChampionshipResult
}

function simulatePlayoffs(standings: StandingsResult, chicagoAbbrev: string, config: typeof LEAGUE_CONFIG[string], sport: string): PlayoffResult {
  const bracket: PlayoffMatchup[] = []
  const all = [...standings.conf1, ...standings.conf2]
  const user = all.find(t => t.abbreviation === chicagoAbbrev || t.teamKey === chicagoAbbrev.toLowerCase().replace(/_(?:nfl|nba|nhl|mlb)$/i, ''))
  const madePlayoffs = user?.playoffSeed != null
  let eliminated = false, elimRound: number | undefined, elimBy: string | undefined, wonChamp = false

  const pt1 = standings.conf1.filter(t => t.playoffSeed).slice(0, config.playoffTeams)
  const pt2 = standings.conf2.filter(t => t.playoffSeed).slice(0, config.playoffTeams)
  let r1 = [...pt1], r2 = [...pt2]

  for (let round = 1; round <= config.playoffRounds.length; round++) {
    const rn = config.playoffRounds[round - 1]
    const isFinal = round === config.playoffRounds.length
    if (isFinal) {
      if (r1.length >= 1 && r2.length >= 1) {
        const h = r1[0], a = r2[0]
        const [hw, aw] = simSeries(h, a, config.seriesLength, sport)
        const w = hw > aw ? 'home' as const : 'away' as const
        const ui = h.isUserTeam || a.isUserTeam
        if (ui) {
          if ((h.isUserTeam && w === 'home') || (a.isUserTeam && w === 'away')) wonChamp = true
          else { eliminated = true; elimRound = round; elimBy = w === 'home' ? h.teamName : a.teamName }
        }
        bracket.push({ round, roundName: rn, homeTeam: { ...h, seed: h.playoffSeed!, wins: h.wins }, awayTeam: { ...a, seed: a.playoffSeed!, wins: a.wins }, seriesWins: [hw, aw], winner: w, isComplete: true, gamesPlayed: hw + aw, userTeamInvolved: ui })
      }
    } else {
      for (const [ct, ci] of [[r1, 0], [r2, 1]] as [TeamStanding[], number][]) {
        const next: TeamStanding[] = []
        const cn = config.conferences[ci]
        for (let i = 0; i < Math.floor(ct.length / 2); i++) {
          const h = ct[i], a = ct[ct.length - 1 - i]
          if (!h || !a) continue
          const hb = h.playoffSeed! <= 2 ? 5 : 0
          const [hw, aw] = simSeries({ ...h, wins: h.wins + hb } as TeamStanding, a, config.seriesLength, sport)
          const w = hw > aw ? 'home' as const : 'away' as const
          const ui = h.isUserTeam || a.isUserTeam
          if (ui && !eliminated) {
            if ((h.isUserTeam && w === 'away') || (a.isUserTeam && w === 'home')) { eliminated = true; elimRound = round; elimBy = w === 'home' ? h.teamName : a.teamName }
          }
          bracket.push({ round, roundName: `${rn} - ${cn}`, homeTeam: { ...h, seed: h.playoffSeed!, wins: h.wins }, awayTeam: { ...a, seed: a.playoffSeed!, wins: a.wins }, seriesWins: [hw, aw], winner: w, isComplete: true, gamesPlayed: hw + aw, userTeamInvolved: ui })
          next.push(w === 'home' ? h : a)
        }
        if (ci === 0) r1 = next; else r2 = next
      }
    }
  }

  let championship: ChampionshipResult | undefined
  const fm = bracket.find(m => m.round === config.playoffRounds.length)
  if (fm) {
    const wt = fm.winner === 'home' ? fm.homeTeam : fm.awayTeam
    const lt = fm.winner === 'home' ? fm.awayTeam : fm.homeTeam
    championship = {
      winner: { teamKey: wt.teamKey, teamName: wt.teamName, abbreviation: wt.abbreviation, logoUrl: wt.logoUrl, primaryColor: wt.primaryColor },
      runnerUp: { teamKey: lt.teamKey, teamName: lt.teamName, abbreviation: lt.abbreviation, logoUrl: lt.logoUrl, primaryColor: lt.primaryColor },
      seriesScore: `${Math.max(...fm.seriesWins)}-${Math.min(...fm.seriesWins)}`,
      userTeamWon: wonChamp, userTeamInFinals: fm.userTeamInvolved,
    }
  }

  return { bracket, userTeamResult: { madePlayoffs, playoffSeed: user?.playoffSeed ?? undefined, eliminatedRound: elimRound, eliminatedBy: elimBy, wonChampionship: wonChamp }, championship }
}

function simSeries(home: TeamStanding, away: TeamStanding, len: number, sport: string): [number, number] {
  const need = Math.ceil(len / 2)
  let w1 = 0, w2 = 0
  const hs = 50 + home.wins * (sport === 'nfl' ? 3 : 1)
  const as2 = 50 + away.wins * (sport === 'nfl' ? 3 : 1)
  while (w1 < need && w2 < need) { if (Math.random() < hs / (hs + as2)) w1++; else w2++ }
  return [w1, w2]
}

// GM Score

function calculateGMScore(
  prev: { wins: number; losses: number; otLosses?: number },
  sim: { wins: number; losses: number; otLosses?: number },
  avgGrade: number,
  playoff: { madePlayoffs: boolean; eliminatedRound?: number; wonChampionship: boolean },
  sport: string,
) {
  const expected = sport === 'nfl' ? 5 : sport === 'mlb' ? 20 : 15
  const winDiff = sim.wins - prev.wins
  const tq = Math.min(30, avgGrade * 0.30)
  const wi = winDiff >= 0 ? Math.min(30, (winDiff / expected) * 30) : Math.max(-20, (winDiff / expected) * 20)
  let pb = 0
  if (playoff.madePlayoffs) {
    if (playoff.wonChampionship) pb = 20
    else if (playoff.eliminatedRound) { const pts = [0, 5, 10, 15, 18]; pb = pts[Math.min(playoff.eliminatedRound, 4)] || 5 }
    else pb = 5
  }
  const cb = playoff.wonChampionship ? 15 : 0
  return { gmScore: Math.max(0, Math.min(100, tq + wi + pb + cb)), breakdown: { tradeQualityScore: +tq.toFixed(1), winImprovementScore: +wi.toFixed(1), playoffBonusScore: pb, championshipBonus: cb, winImprovement: winDiff } }
}

// Summary

function generateSummary(
  teamName: string,
  prev: { wins: number; losses: number },
  sim: { wins: number; losses: number },
  trades: { partnerTeamKey: string; grade: number }[],
  playoff: { madePlayoffs: boolean; eliminatedRound?: number; eliminatedBy?: string; wonChampionship: boolean },
  standings: StandingsResult,
  config: typeof LEAGUE_CONFIG[string],
  _seasonYear: number,
): SeasonSummary {
  const wd = sim.wins - prev.wins
  const ag = trades.length > 0 ? trades.reduce((s, t) => s + t.grade, 0) / trades.length : 50

  let headline: string, narrative: string
  if (playoff.wonChampionship) {
    headline = `${teamName} Win Championship After Masterful Trades!`
    narrative = `The ${teamName} rode strategic trades to a championship, going from ${prev.wins}-${prev.losses} to ${sim.wins}-${sim.losses}.`
  } else if (wd > 5) {
    headline = `${teamName} Surge After Blockbuster Trades`
    narrative = `The ${teamName} added ${wd} wins after ${trades.length} trade(s). ${playoff.madePlayoffs ? 'They secured a playoff berth.' : 'The trajectory is promising.'}`
  } else if (wd < -3) {
    headline = `${teamName} Struggle After Controversial Trades`
    narrative = `The ${teamName}'s trades backfired, resulting in ${Math.abs(wd)} fewer wins than last season.`
  } else {
    headline = `${teamName} Finish Season at ${sim.wins}-${sim.losses}`
    narrative = `The ${teamName} stayed the course relative to last season's ${prev.wins}-${prev.losses}. ${trades.length > 0 ? `${trades.length} trade(s) had modest impact.` : ''}`
  }

  const moments: string[] = [
    `Previous Season: ${prev.wins}-${prev.losses}`,
    trades.length > 0 ? `Trades: ${trades.length} (avg grade: ${ag.toFixed(0)})` : '',
    `Final Record: ${sim.wins}-${sim.losses} (${wd > 0 ? '+' : ''}${wd}W)`,
    playoff.madePlayoffs ? 'Made the playoffs!' : 'Missed the playoffs',
    playoff.wonChampionship ? `Won the ${config.playoffRounds[config.playoffRounds.length - 1]}!` : playoff.eliminatedRound ? `Eliminated in ${config.playoffRounds[(playoff.eliminatedRound || 1) - 1]} by ${playoff.eliminatedBy}` : '',
  ].filter(Boolean)

  const allS = [...standings.conf1, ...standings.conf2]
  const affected = trades.filter(t => t.partnerTeamKey).map(t => {
    const pk = t.partnerTeamKey.toUpperCase()
    const ps = allS.find(s => s.abbreviation === pk)
    return { teamName: ps?.teamName || pk, impact: ps ? `${ps.wins}-${ps.losses}, ${ps.playoffSeed ? `#${ps.playoffSeed} seed` : 'missed playoffs'}` : 'Unknown' }
  })

  return { headline, narrative, tradeImpactSummary: `Net change: ${wd > 0 ? '+' : ''}${wd} wins vs. last season. Avg trade grade: ${ag.toFixed(0)}.`, keyMoments: moments, affectedTeams: affected }
}
```

---

## 2. game-engine.ts

**Path:** `src/lib/sim/game-engine.ts`
**Purpose:** Individual game simulation — Elo-style win probability, score generation, overtime logic, momentum tracking, highlight text.

```typescript
/**
 * Simulation Engine - Game Engine
 */

import { SCORE_RANGES, HOME_ADVANTAGE } from './constants'

export interface GameInput {
  teamRating: number
  opponentRating: number
  isHome: boolean
  sport: string
  momentum: number
  opponentAbbrev: string
  opponentName: string
  rivalOpponents?: string[]
}

export interface GameResult {
  teamScore: number
  opponentScore: number
  result: 'W' | 'L' | 'T' | 'OTL'
  isOvertime: boolean
  highlight?: string
}

let _seed = Date.now()
export function setSeed(seed: number) { _seed = seed }

function rand(): number {
  _seed = (_seed * 1664525 + 1013904223) & 0xFFFFFFFF
  return (_seed >>> 0) / 0xFFFFFFFF
}

function calculateWinProbability(teamRating: number, opponentRating: number, isHome: boolean, sport: string, momentum: number): number {
  const homeAdv = HOME_ADVANTAGE[sport] || 3.0
  const adjusted = teamRating + (isHome ? homeAdv : -homeAdv) + momentum
  const exp = (opponentRating - adjusted) / 15
  return 1 / (1 + Math.pow(10, exp))
}

function generateScore(sport: string, ratingAdvantage: number): number {
  const range = SCORE_RANGES[sport]
  if (!range) return 0
  const shift = ratingAdvantage * 0.15
  const u1 = Math.max(0.0001, rand())
  const u2 = rand()
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  let score = range.avgTeam + shift + normal * range.variance

  if (sport === 'nfl') {
    score = Math.round(score)
    if (score > 0 && score % 7 !== 0 && score % 3 !== 0 && rand() < 0.4) {
      const d3 = score % 3
      const d7 = score % 7
      score = d3 < d7 ? score - d3 : score - d7
    }
  } else {
    score = Math.round(score)
  }
  return Math.max(range.minScore, Math.min(range.maxScore, score))
}

export function simulateGame(input: GameInput): GameResult {
  const { teamRating, opponentRating, isHome, sport, momentum, opponentAbbrev, rivalOpponents } = input
  const winProb = calculateWinProbability(teamRating, opponentRating, isHome, sport, momentum)
  const teamWins = rand() < winProb

  const ratingDiff = teamRating - opponentRating + (isHome ? (HOME_ADVANTAGE[sport] || 3) : -(HOME_ADVANTAGE[sport] || 3)) + momentum
  let teamScore = generateScore(sport, teamWins ? Math.abs(ratingDiff) * 0.5 : -Math.abs(ratingDiff) * 0.3)
  let oppScore = generateScore(sport, teamWins ? -Math.abs(ratingDiff) * 0.3 : Math.abs(ratingDiff) * 0.5)

  if (teamWins && teamScore <= oppScore) {
    teamScore = oppScore + (sport === 'nfl' ? (rand() < 0.5 ? 3 : 7) : sport === 'nba' ? Math.ceil(rand() * 8) + 1 : 1)
  } else if (!teamWins && oppScore <= teamScore) {
    oppScore = teamScore + (sport === 'nfl' ? (rand() < 0.5 ? 3 : 7) : sport === 'nba' ? Math.ceil(rand() * 8) + 1 : 1)
  }

  let isOvertime = false
  let result: 'W' | 'L' | 'T' | 'OTL' = teamWins ? 'W' : 'L'

  const scoreDiff = Math.abs(teamScore - oppScore)
  const otChance = sport === 'nfl' ? 0.08 : sport === 'nba' ? 0.06 : sport === 'nhl' ? 0.12 : 0.05
  if (rand() < otChance || (scoreDiff <= 3 && sport !== 'nba' && rand() < 0.25)) {
    isOvertime = true
    if (sport === 'nhl' && !teamWins) {
      result = 'OTL'
      const tied = Math.min(teamScore, oppScore)
      teamScore = tied
      oppScore = tied + 1
    } else if (sport === 'nfl') {
      if (teamWins) {
        const tied = oppScore
        teamScore = tied + (rand() < 0.5 ? 3 : 7)
      } else {
        const tied = teamScore
        oppScore = tied + (rand() < 0.5 ? 3 : 7)
      }
    }
  }

  const range = SCORE_RANGES[sport]
  if (range) {
    teamScore = Math.max(range.minScore, Math.min(range.maxScore, teamScore))
    oppScore = Math.max(range.minScore, Math.min(range.maxScore, oppScore))
  }

  if (result === 'W' && teamScore <= oppScore) teamScore = oppScore + 1
  if (result === 'L' && oppScore <= teamScore) oppScore = teamScore + 1
  if (result === 'OTL' && oppScore <= teamScore) oppScore = teamScore + 1

  const highlight = generateHighlight(result, isOvertime, teamScore, oppScore, sport, opponentAbbrev, rivalOpponents)
  return { teamScore, opponentScore: oppScore, result, isOvertime, highlight }
}

export function updateMomentum(_currentMomentum: number, recentResults: ('W' | 'L' | 'T' | 'OTL')[]): number {
  if (recentResults.length === 0) return 0
  const last5 = recentResults.slice(-5)
  let delta = 0
  for (const r of last5) {
    if (r === 'W') delta += 0.5
    else if (r === 'L') delta -= 0.5
    else delta -= 0.2
  }
  let count = 0
  for (let i = last5.length - 1; i >= 0; i--) {
    if (last5[i] === 'W') count++
    else break
  }
  if (count >= 5) delta += 1
  count = 0
  for (let i = last5.length - 1; i >= 0; i--) {
    if (last5[i] === 'L') count++
    else break
  }
  if (count >= 5) delta -= 1
  return Math.max(-5, Math.min(5, delta))
}

const HL_OT = ['Overtime thriller!', 'Needed extra time!', 'Dramatic overtime finish!']
const HL_BLOW = ['Dominated from start to finish.', 'A complete team effort.', 'Statement win.']
const HL_CLOSE = ['Gutsy win in a tight game.', 'Pulled it out at the end!', 'Nail-biter goes our way.']
const HL_LOSS = ['Tough loss in a hard-fought game.', 'Heartbreaker.', 'Came up just short.']
const HL_RIVAL = ['Bragging rights on the line!', 'Rivalry game delivers!']

function generateHighlight(
  result: string, isOvertime: boolean, teamScore: number, oppScore: number,
  sport: string, oppAbbrev: string, rivals?: string[],
): string | undefined {
  if (rand() > 0.22) return undefined
  const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)]
  if (isOvertime) return pick(HL_OT)
  if (rivals?.includes(oppAbbrev) && rand() < 0.5) return pick(HL_RIVAL)
  const diff = Math.abs(teamScore - oppScore)
  const blowout = (sport === 'nfl' && diff >= 17) || (sport === 'nba' && diff >= 20) ||
    (sport === 'nhl' && diff >= 4) || (sport === 'mlb' && diff >= 7)
  if (result === 'W' && blowout) return pick(HL_BLOW)
  const close = diff <= (sport === 'nba' ? 5 : sport === 'nfl' ? 7 : 2)
  if (result === 'W' && close) return pick(HL_CLOSE)
  if (result === 'L' && close) return pick(HL_LOSS)
  return undefined
}
```

---

## 3. power-ratings.ts

**Path:** `src/lib/sim/power-ratings.ts`
**Purpose:** Player Impact Rating (PIR) calculations per sport, trade impact aggregation, position multipliers, age depreciation factors.

```typescript
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
  switch (sport) {
    case 'nfl': return calculateNFLPIR(player)
    case 'nba': return calculateNBAPIR(player)
    case 'nhl': return calculateNHLPIR(player)
    case 'mlb': return calculateMLBPIR(player)
    default: return 1.0
  }
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
```

---

## 4. data-fetcher.ts

**Path:** `src/lib/sim/data-fetcher.ts`
**Purpose:** Fetches real schedule, season records, and trade data from Supabase DataLab. Includes fallback synthetic schedule generator.

```typescript
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
      partnerTeamKey2: t.partner_2 || undefined,  // For 3-team trades
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
```

---

## 5. constants.ts

**Path:** `src/lib/sim/constants.ts`
**Purpose:** League configurations (divisions, playoff format, games/season), all 124 team entries with colors, and approximate win percentages for the 2025-26 season.

```typescript
/**
 * Simulation Engine - Constants & League Configuration
 */

export const LEAGUE_CONFIG: Record<string, {
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
      'AFC West': ['KC', 'LV', 'LAC_NFL', 'DEN'],
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
      'Central': ['CHI_NBA', 'CLE', 'DET_NBA', 'IND_NBA', 'MIL'],
      'Southeast': ['ATL_NBA', 'CHA', 'MIA', 'ORL', 'WAS_NBA'],
      'Northwest': ['DEN_NBA', 'MIN_NBA', 'OKC', 'POR', 'UTA'],
      'Pacific': ['GSW', 'LAC_NBA', 'LAL', 'PHX', 'SAC'],
      'Southwest': ['DAL_NBA', 'HOU_NBA', 'MEM', 'NOP', 'SAS'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Conference Semifinals', 'Conference Finals', 'NBA Finals'],
  },
  nhl: {
    conferences: ['Eastern', 'Western'],
    divisions: {
      'Atlantic': ['BOS_NHL', 'BUF_NHL', 'DET_NHL', 'FLA_NHL', 'MTL', 'OTT', 'TB_NHL', 'TOR_NHL'],
      'Metropolitan': ['CAR', 'CBJ', 'NJ', 'NYI', 'NYR', 'PHI_NHL', 'PIT_NHL', 'WAS_NHL'],
      'Central': ['CHI_NHL', 'COL', 'DAL_NHL', 'MIN_NHL', 'NSH', 'STL_NHL', 'UTA_NHL', 'WPG'],
      'Pacific': ['ANA', 'CGY', 'EDM', 'LA_NHL', 'SJ', 'SEA_NHL', 'VAN', 'VGK'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Second Round', 'Conference Finals', 'Stanley Cup Finals'],
  },
  mlb: {
    conferences: ['American League', 'National League'],
    divisions: {
      'AL East': ['BAL_MLB', 'BOS_MLB', 'NYY', 'TB_MLB', 'TOR_MLB'],
      'AL Central': ['CHW', 'CLE_MLB', 'DET_MLB', 'KC_MLB', 'MIN_MLB'],
      'AL West': ['HOU_MLB', 'LAA', 'OAK', 'SEA_MLB', 'TEX'],
      'NL East': ['ATL_MLB', 'MIA_MLB', 'NYM', 'PHI_MLB', 'WAS_MLB'],
      'NL Central': ['CHC', 'CIN', 'MIL_MLB', 'PIT_MLB', 'STL_MLB'],
      'NL West': ['ARI_MLB', 'COL_MLB', 'LAD', 'SD', 'SF_MLB'],
    },
    playoffTeams: 6,
    gamesPerSeason: 162,
    seriesLength: 5,
    playoffRounds: ['Wild Card', 'Division Series', 'Championship Series', 'World Series'],
  },
}

// Team database using Map to avoid duplicate key issues across sports
// Key format: "sport:ABBREV" -> { teamName, abbrev (canonical for display), color }
const TEAM_DB = new Map<string, { teamName: string; abbrev: string; color: string }>()

// NFL Teams
const nflTeams: [string, string, string][] = [
  ['CHI', 'Chicago Bears', '#0B162A'], ['DET', 'Detroit Lions', '#0076B6'],
  ['GB', 'Green Bay Packers', '#203731'], ['MIN', 'Minnesota Vikings', '#4F2683'],
  ['KC', 'Kansas City Chiefs', '#E31837'], ['BUF', 'Buffalo Bills', '#00338D'],
  ['MIA', 'Miami Dolphins', '#008E97'], ['NE', 'New England Patriots', '#002244'],
  ['NYJ', 'New York Jets', '#125740'], ['BAL', 'Baltimore Ravens', '#241773'],
  ['CIN', 'Cincinnati Bengals', '#FB4F14'], ['CLE', 'Cleveland Browns', '#311D00'],
  ['PIT', 'Pittsburgh Steelers', '#FFB612'], ['HOU', 'Houston Texans', '#03202F'],
  ['IND', 'Indianapolis Colts', '#002C5F'], ['JAX', 'Jacksonville Jaguars', '#006778'],
  ['TEN', 'Tennessee Titans', '#4B92DB'], ['LAC_NFL', 'Los Angeles Chargers', '#0080C6'],
  ['LV', 'Las Vegas Raiders', '#A5ACAF'], ['DEN', 'Denver Broncos', '#FB4F14'],
  ['DAL', 'Dallas Cowboys', '#003594'], ['NYG', 'New York Giants', '#0B2265'],
  ['PHI', 'Philadelphia Eagles', '#004C54'], ['WAS', 'Washington Commanders', '#5A1414'],
  ['ATL', 'Atlanta Falcons', '#A71930'], ['CAR', 'Carolina Panthers', '#0085CA'],
  ['NO', 'New Orleans Saints', '#D3BC8D'], ['TB', 'Tampa Bay Buccaneers', '#D50A0A'],
  ['ARI', 'Arizona Cardinals', '#97233F'], ['LA', 'Los Angeles Rams', '#003594'],
  ['SF', 'San Francisco 49ers', '#AA0000'], ['SEA', 'Seattle Seahawks', '#002244'],
]
for (const [k, n, c] of nflTeams) TEAM_DB.set(`nfl:${k}`, { teamName: n, abbrev: k, color: c })

// NBA Teams
const nbaTeams: [string, string, string][] = [
  ['CHI_NBA', 'Chicago Bulls', '#CE1141'], ['CLE', 'Cleveland Cavaliers', '#6F263D'],
  ['DET_NBA', 'Detroit Pistons', '#C8102E'], ['IND_NBA', 'Indiana Pacers', '#002D62'],
  ['MIL', 'Milwaukee Bucks', '#00471B'], ['BOS', 'Boston Celtics', '#007A33'],
  ['BKN', 'Brooklyn Nets', '#000000'], ['NYK', 'New York Knicks', '#006BB6'],
  ['PHI', 'Philadelphia 76ers', '#006BB6'], ['TOR', 'Toronto Raptors', '#CE1141'],
  ['ATL_NBA', 'Atlanta Hawks', '#E03A3E'], ['CHA', 'Charlotte Hornets', '#1D1160'],
  ['MIA', 'Miami Heat', '#98002E'], ['ORL', 'Orlando Magic', '#0077C0'],
  ['WAS_NBA', 'Washington Wizards', '#002B5C'], ['DEN_NBA', 'Denver Nuggets', '#0E2240'],
  ['MIN_NBA', 'Minnesota Timberwolves', '#0C2340'], ['OKC', 'Oklahoma City Thunder', '#007AC1'],
  ['POR', 'Portland Trail Blazers', '#E03A3E'], ['UTA', 'Utah Jazz', '#002B5C'],
  ['GSW', 'Golden State Warriors', '#1D428A'], ['LAC_NBA', 'LA Clippers', '#C8102E'],
  ['LAL', 'Los Angeles Lakers', '#552583'], ['PHX', 'Phoenix Suns', '#1D1160'],
  ['SAC', 'Sacramento Kings', '#5A2D81'], ['DAL_NBA', 'Dallas Mavericks', '#00538C'],
  ['HOU_NBA', 'Houston Rockets', '#CE1141'], ['MEM', 'Memphis Grizzlies', '#5D76A9'],
  ['NOP', 'New Orleans Pelicans', '#0C2340'], ['SAS', 'San Antonio Spurs', '#C4CED4'],
]
for (const [k, n, c] of nbaTeams) TEAM_DB.set(`nba:${k}`, { teamName: n, abbrev: k, color: c })

// NHL Teams
const nhlTeams: [string, string, string][] = [
  ['CHI_NHL', 'Chicago Blackhawks', '#CF0A2C'], ['COL', 'Colorado Avalanche', '#6F263D'],
  ['DAL_NHL', 'Dallas Stars', '#006847'], ['MIN_NHL', 'Minnesota Wild', '#154734'],
  ['NSH', 'Nashville Predators', '#FFB81C'], ['STL_NHL', 'St. Louis Blues', '#002F87'],
  ['UTA_NHL', 'Utah Hockey Club', '#69B3E7'], ['WPG', 'Winnipeg Jets', '#041E42'],
  ['BOS_NHL', 'Boston Bruins', '#FFB81C'], ['BUF_NHL', 'Buffalo Sabres', '#002654'],
  ['DET_NHL', 'Detroit Red Wings', '#CE1126'], ['FLA_NHL', 'Florida Panthers', '#041E42'],
  ['MTL', 'Montreal Canadiens', '#AF1E2D'], ['OTT', 'Ottawa Senators', '#C52032'],
  ['TB_NHL', 'Tampa Bay Lightning', '#002868'], ['TOR_NHL', 'Toronto Maple Leafs', '#003E7E'],
  ['CAR', 'Carolina Hurricanes', '#CC0000'], ['CBJ', 'Columbus Blue Jackets', '#002654'],
  ['NJ', 'New Jersey Devils', '#CE1126'], ['NYI', 'New York Islanders', '#00539B'],
  ['NYR', 'New York Rangers', '#0038A8'], ['PHI_NHL', 'Philadelphia Flyers', '#F74902'],
  ['PIT_NHL', 'Pittsburgh Penguins', '#FCB514'], ['WAS_NHL', 'Washington Capitals', '#041E42'],
  ['ANA', 'Anaheim Ducks', '#F47A38'], ['CGY', 'Calgary Flames', '#D2001C'],
  ['EDM', 'Edmonton Oilers', '#041E42'], ['LA_NHL', 'Los Angeles Kings', '#111111'],
  ['SJ', 'San Jose Sharks', '#006D75'], ['SEA_NHL', 'Seattle Kraken', '#99D9D9'],
  ['VAN', 'Vancouver Canucks', '#00205B'], ['VGK', 'Vegas Golden Knights', '#B4975A'],
]
for (const [k, n, c] of nhlTeams) TEAM_DB.set(`nhl:${k}`, { teamName: n, abbrev: k, color: c })

// MLB Teams
const mlbTeams: [string, string, string][] = [
  ['CHC', 'Chicago Cubs', '#0E3386'], ['CHW', 'Chicago White Sox', '#27251F'],
  ['CIN', 'Cincinnati Reds', '#C6011F'], ['MIL_MLB', 'Milwaukee Brewers', '#12284B'],
  ['PIT_MLB', 'Pittsburgh Pirates', '#27251F'], ['STL_MLB', 'St. Louis Cardinals', '#C41E3A'],
  ['BAL_MLB', 'Baltimore Orioles', '#DF4601'], ['BOS_MLB', 'Boston Red Sox', '#BD3039'],
  ['NYY', 'New York Yankees', '#003087'], ['TB_MLB', 'Tampa Bay Rays', '#092C5C'],
  ['TOR_MLB', 'Toronto Blue Jays', '#134A8E'], ['CLE_MLB', 'Cleveland Guardians', '#00385D'],
  ['DET_MLB', 'Detroit Tigers', '#0C2340'], ['KC_MLB', 'Kansas City Royals', '#004687'],
  ['MIN_MLB', 'Minnesota Twins', '#002B5C'], ['HOU_MLB', 'Houston Astros', '#002D62'],
  ['LAA', 'Los Angeles Angels', '#BA0021'], ['OAK', 'Oakland Athletics', '#003831'],
  ['SEA_MLB', 'Seattle Mariners', '#0C2C56'], ['TEX', 'Texas Rangers', '#003278'],
  ['ATL_MLB', 'Atlanta Braves', '#CE1141'], ['MIA_MLB', 'Miami Marlins', '#00A3E0'],
  ['NYM', 'New York Mets', '#002D72'], ['PHI_MLB', 'Philadelphia Phillies', '#E81828'],
  ['WAS_MLB', 'Washington Nationals', '#AB0003'], ['ARI_MLB', 'Arizona Diamondbacks', '#A71930'],
  ['COL_MLB', 'Colorado Rockies', '#33006F'], ['LAD', 'Los Angeles Dodgers', '#005A9C'],
  ['SD', 'San Diego Padres', '#2F241D'], ['SF_MLB', 'San Francisco Giants', '#FD5A1E'],
]
for (const [k, n, c] of mlbTeams) TEAM_DB.set(`mlb:${k}`, { teamName: n, abbrev: k, color: c })

// Keys match the short form used by the UI ('bears', 'bulls', etc.)
export const CHICAGO_TEAMS: Record<string, { abbrev: string; sport: string }> = {
  'bears': { abbrev: 'CHI', sport: 'nfl' },
  'bulls': { abbrev: 'CHI_NBA', sport: 'nba' },
  'blackhawks': { abbrev: 'CHI_NHL', sport: 'nhl' },
  'cubs': { abbrev: 'CHC', sport: 'mlb' },
  'whitesox': { abbrev: 'CHW', sport: 'mlb' },
}

export function getTeamInfo(abbrev: string, sport: string): { teamKey: string; teamName: string; abbreviation: string; logoUrl: string; primaryColor: string } {
  const entry = TEAM_DB.get(`${sport}:${abbrev}`)
  const displayAbbrev = abbrev.replace(/_(?:NFL|NBA|NHL|MLB)$/, '')
  if (entry) {
    return {
      teamKey: displayAbbrev.toLowerCase(),
      teamName: entry.teamName,
      abbreviation: displayAbbrev,
      logoUrl: `https://a.espncdn.com/i/teamlogos/${sport}/500/${displayAbbrev.toLowerCase()}.png`,
      primaryColor: entry.color,
    }
  }
  return {
    teamKey: displayAbbrev.toLowerCase(),
    teamName: displayAbbrev,
    abbreviation: displayAbbrev,
    logoUrl: `https://a.espncdn.com/i/teamlogos/${sport}/500/${displayAbbrev.toLowerCase()}.png`,
    primaryColor: '#666666',
  }
}

export const SCORE_RANGES: Record<string, { avgTeam: number; variance: number; minScore: number; maxScore: number }> = {
  nfl: { avgTeam: 22, variance: 8, minScore: 3, maxScore: 45 },
  nba: { avgTeam: 110, variance: 12, minScore: 80, maxScore: 140 },
  nhl: { avgTeam: 3, variance: 1.5, minScore: 0, maxScore: 8 },
  mlb: { avgTeam: 4.5, variance: 2.5, minScore: 0, maxScore: 15 },
}

export const HOME_ADVANTAGE: Record<string, number> = {
  nfl: 3.0, nba: 3.5, nhl: 2.5, mlb: 2.0,
}

// Approximate win percentages for all teams (realistic 2025-26 estimates)
const WIN_PCT_DB = new Map<string, number>()
// NFL
const nflWinPcts: [string, number][] = [
  ['CHI', 0.647], ['DET', 0.706], ['GB', 0.647], ['MIN', 0.588],
  ['KC', 0.765], ['BUF', 0.706], ['BAL', 0.706], ['PHI', 0.647],
  ['SF', 0.588], ['DAL', 0.471], ['MIA', 0.529], ['CIN', 0.588],
  ['HOU', 0.588], ['PIT', 0.588], ['CLE', 0.353], ['LAC_NFL', 0.588],
  ['DEN', 0.588], ['LV', 0.471], ['NYJ', 0.353], ['NE', 0.294],
  ['IND', 0.471], ['JAX', 0.353], ['TEN', 0.353], ['ATL', 0.529],
  ['TB', 0.588], ['NO', 0.471], ['CAR', 0.294], ['WAS', 0.647],
  ['NYG', 0.235], ['ARI', 0.471], ['LA', 0.588], ['SEA', 0.588],
]
for (const [k, v] of nflWinPcts) WIN_PCT_DB.set(`nfl:${k}`, v)

// NBA
const nbaWinPcts: [string, number][] = [
  ['CHI_NBA', 0.450], ['CLE', 0.700], ['DET_NBA', 0.300], ['IND_NBA', 0.550],
  ['MIL', 0.600], ['BOS', 0.720], ['BKN', 0.350], ['NYK', 0.650],
  ['PHI', 0.550], ['TOR', 0.350], ['ATL_NBA', 0.500], ['CHA', 0.300],
  ['MIA', 0.550], ['ORL', 0.500], ['WAS_NBA', 0.250], ['DEN_NBA', 0.600],
  ['MIN_NBA', 0.600], ['OKC', 0.720], ['POR', 0.350], ['UTA', 0.400],
  ['GSW', 0.550], ['LAC_NBA', 0.500], ['LAL', 0.550], ['PHX', 0.550],
  ['SAC', 0.500], ['DAL_NBA', 0.550], ['HOU_NBA', 0.600], ['MEM', 0.580],
  ['NOP', 0.350], ['SAS', 0.350],
]
for (const [k, v] of nbaWinPcts) WIN_PCT_DB.set(`nba:${k}`, v)

// NHL
const nhlWinPcts: [string, number][] = [
  ['CHI_NHL', 0.400], ['COL', 0.600], ['DAL_NHL', 0.600], ['MIN_NHL', 0.600],
  ['NSH', 0.500], ['STL_NHL', 0.500], ['UTA_NHL', 0.450], ['WPG', 0.650],
  ['BOS_NHL', 0.550], ['BUF_NHL', 0.450], ['DET_NHL', 0.500], ['FLA_NHL', 0.650],
  ['MTL', 0.450], ['OTT', 0.500], ['TB_NHL', 0.550], ['TOR_NHL', 0.600],
  ['CAR', 0.600], ['CBJ', 0.400], ['NJ', 0.550], ['NYI', 0.450],
  ['NYR', 0.550], ['PHI_NHL', 0.450], ['PIT_NHL', 0.500], ['WAS_NHL', 0.600],
  ['ANA', 0.400], ['CGY', 0.450], ['EDM', 0.650], ['LA_NHL', 0.550],
  ['SJ', 0.350], ['SEA_NHL', 0.500], ['VAN', 0.550], ['VGK', 0.600],
]
for (const [k, v] of nhlWinPcts) WIN_PCT_DB.set(`nhl:${k}`, v)

// MLB
const mlbWinPcts: [string, number][] = [
  ['CHC', 0.568], ['CHW', 0.370], ['CIN', 0.500], ['MIL_MLB', 0.580],
  ['PIT_MLB', 0.480], ['STL_MLB', 0.500], ['BAL_MLB', 0.560], ['BOS_MLB', 0.530],
  ['NYY', 0.580], ['TB_MLB', 0.530], ['TOR_MLB', 0.480], ['CLE_MLB', 0.560],
  ['DET_MLB', 0.530], ['KC_MLB', 0.530], ['MIN_MLB', 0.520], ['HOU_MLB', 0.550],
  ['LAA', 0.470], ['OAK', 0.400], ['SEA_MLB', 0.530], ['TEX', 0.500],
  ['ATL_MLB', 0.560], ['MIA_MLB', 0.450], ['NYM', 0.560], ['PHI_MLB', 0.580],
  ['WAS_MLB', 0.450], ['ARI_MLB', 0.560], ['COL_MLB', 0.400], ['LAD', 0.620],
  ['SD', 0.560], ['SF_MLB', 0.500],
]
for (const [k, v] of mlbWinPcts) WIN_PCT_DB.set(`mlb:${k}`, v)

export function getApproxWinPct(abbrev: string, sport: string): number {
  return WIN_PCT_DB.get(`${sport}:${abbrev}`) ?? 0.500
}
```

---

## 6. API Route

**Path:** `src/app/api/gm/sim/season/route.ts`
**Purpose:** POST endpoint that validates input and calls `simulateSeason()`.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { simulateSeason } from '@/lib/sim/season-engine'

/**
 * POST /api/gm/sim/season
 * Full season simulation with game-by-game results, standings, playoffs, and championship
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

    const result = await simulateSeason({
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
    })

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

## 7. SimulationTrigger.tsx

**Path:** `src/components/gm/SimulationTrigger.tsx`
**Purpose:** CTA button that appears after 1+ accepted trades. Shows game count per sport and animated spinner while simulating.

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

  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'
  const cardBg = 'var(--sm-card)'

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
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--sm-text)' }}>
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

## 8. SimulationResults.tsx

**Path:** `src/components/gm/SimulationResults.tsx`
**Purpose:** Full-screen modal with 5 tabs showing simulation results: Overview (before/after comparison, power ratings, player impacts, GM score), Games (game-by-game log grouped by segment), Standings (conference standings with playoff seeds), Playoffs (bracket with series results), Summary (headline narrative, trade impact, key moments).

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

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'
  const cardBg = 'var(--sm-card)'
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

  // [COMPONENT JSX — 832 lines total]
  // Full overlay + modal with:
  //   - Header (team name, trade count, close button)
  //   - Tab bar (Overview, Games, Standings, Playoffs, Summary)
  //   - OVERVIEW TAB: Before/After record comparison, power rating delta, player impacts list,
  //     championship banner (if won), GM score with breakdown (trade quality /30, win improvement /30,
  //     playoff achievement /20, championship bonus /15), Simulate Again / Continue Trading buttons
  //   - GAMES TAB: Game-by-game log grouped by season segment, each game shows game number, date,
  //     opponent logo+name, home/away, score with W/L/OTL color coding, running record, highlights
  //   - STANDINGS TAB: Two-column conference standings, 12 teams per conference, shows rank, logo,
  //     abbreviation, W-L record, games back, highlights user team and trade partners
  //   - PLAYOFFS TAB: If missed playoffs shows sad emoji message; otherwise shows user team result
  //     (champion/eliminated), bracket by round with seed matchups and series wins, championship
  //     result with winner logo
  //   - SUMMARY TAB: Previous season vs simulated record comparison, headline + narrative text,
  //     trade impact summary, numbered key moments list, trade partner outcomes
  // See full source at: src/components/gm/SimulationResults.tsx
}
```

---

## 9. Types (Simulation Section)

**Path:** `src/types/gm.ts` (lines 250-436)
**Purpose:** All TypeScript interfaces for the simulation system.

```typescript
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

export interface PlayoffMatchup {
  round: number
  roundName: string
  homeTeam: {
    teamKey: string; teamName: string; abbreviation: string
    logoUrl: string; primaryColor: string; seed: number; wins: number
  }
  awayTeam: {
    teamKey: string; teamName: string; abbreviation: string
    logoUrl: string; primaryColor: string; seed: number; wins: number
  }
  seriesWins: [number, number]
  winner: 'home' | 'away' | null
  isComplete: boolean
  gamesPlayed: number
  userTeamInvolved: boolean
}

export interface ChampionshipResult {
  winner: { teamKey: string; teamName: string; abbreviation: string; logoUrl: string; primaryColor: string }
  runnerUp: { teamKey: string; teamName: string; abbreviation: string; logoUrl: string; primaryColor: string }
  seriesScore: string
  mvp?: string
  userTeamWon: boolean
  userTeamInFinals: boolean
}

export interface SeasonSummary {
  headline: string
  narrative: string
  tradeImpactSummary: string
  keyMoments: string[]
  affectedTeams: { teamName: string; impact: string }[]
}

export interface SimulationResult {
  success: boolean
  baseline: SeasonRecord
  modified: SeasonRecord
  gmScore: number
  scoreBreakdown: SimulationScoreBreakdown
  standings?: {
    conference1: TeamStanding[]
    conference2: TeamStanding[]
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
  games?: SimulatedGame[]
  segments?: SeasonSegment[]
  playerImpacts?: PlayerSimImpact[]
  baselinePowerRating?: number
  modifiedPowerRating?: number
  previousSeasonRecord?: { wins: number; losses: number; otLosses?: number; playoffRound?: number }
}

export interface SimulationRequest {
  sessionId: string
  sport: string
  teamKey: string
  seasonYear: number
}

// =====================
// Video Game Simulation Types (Feb 2026)
// =====================

export interface SimulatedGame {
  gameNumber: number
  week?: number
  date: string
  opponent: string
  opponentName: string
  opponentLogoUrl: string
  isHome: boolean
  teamScore: number
  opponentScore: number
  result: 'W' | 'L' | 'T' | 'OTL'
  isOvertime: boolean
  runningRecord: { wins: number; losses: number; otLosses?: number }
  teamPowerRating: number
  opponentPowerRating: number
  highlight?: string
  segment: string
}

export interface SeasonSegment {
  label: string
  wins: number
  losses: number
  otLosses?: number
  winPct: number
  avgTeamScore: number
  avgOppScore: number
}

export interface PlayerSimImpact {
  playerName: string
  position: string
  direction: 'added' | 'removed'
  powerRatingDelta: number
  category: string
}
```

---

## 10. Page Integration

**Path:** `src/app/gm/page.tsx` (relevant excerpts only)
**Purpose:** Wires the simulation trigger, API call, state management, and results modal into the main GM page.

### Imports (lines 18-23)

```typescript
import { SimulationTrigger } from '@/components/gm/SimulationTrigger'
import { SimulationResults } from '@/components/gm/SimulationResults'
import type { SimulationResult } from '@/types/gm'
```

### State (lines 186-190)

```typescript
// Season Simulation
const [isSimulating, setIsSimulating] = useState(false)
const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
const [showSimulationResults, setShowSimulationResults] = useState(false)
const [simulationError, setSimulationError] = useState<string | null>(null)
```

### Handler Functions (lines 1178-1220)

```typescript
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
```

### Desktop Trigger (line 1597-1606)

```tsx
{/* Season Simulation - inside center column, show for accepted trades */}
{activeSession && (activeSession.num_approved > 0 || (gradeResult && gradeResult.grade >= 70)) && (
  <SimulationTrigger
    tradeCount={Math.max(activeSession.num_approved, (gradeResult && gradeResult.grade >= 70) ? 1 : 0)}
    sport={sport}
    onSimulate={handleSimulateSeason}
    isSimulating={isSimulating}
    teamColor={teamColor}
  />
)}
```

### Mobile Trigger (lines 1864-1873)

```tsx
{/* Season Simulation - mobile, show for accepted trades */}
{activeSession && (activeSession.num_approved > 0 || (gradeResult && gradeResult.grade >= 70)) && (
  <SimulationTrigger
    tradeCount={Math.max(activeSession.num_approved, (gradeResult && gradeResult.grade >= 70) ? 1 : 0)}
    sport={sport}
    onSimulate={handleSimulateSeason}
    isSimulating={isSimulating}
    teamColor={teamColor}
  />
)}
```

### Results Modal (lines 2138-2150)

```tsx
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
```
