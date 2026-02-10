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
  trades: { partnerTeamKey: string }[],
  config: typeof LEAGUE_CONFIG[string],
  sport: string,
  partnerDeltas: Record<string, number>,
): StandingsResult {
  const allTeams: { abbrev: string; division: string; conference: string }[] = []
  for (const [div, teams] of Object.entries(config.divisions)) {
    const conf = getConf(div, config)
    for (const abbrev of teams) allTeams.push({ abbrev, division: div, conference: conf })
  }

  const partnerKeys = new Set(trades.map(t => t.partnerTeamKey.toUpperCase()))
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
