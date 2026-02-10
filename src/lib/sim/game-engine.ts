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
