# Season Simulator - Master Document & DataLab Implementation Guide

> **Purpose:** Migrate season simulation from algorithmic approach to AI-powered analysis on DataLab
> **Target Model:** GM Model (Claude Sonnet 4) on datalab.sportsmockery.com
> **Current Location:** test.sportsmockery.com `/src/lib/sim/`

---

## Executive Summary

### Current Problems with Algorithmic Approach

1. **Oversimplified Trade Impact**: Trades are reduced to a single "power rating delta" based on basic stat formulas. A QB trade is worth 3x a RB trade regardless of context.

2. **No Contextual Reasoning**: The simulator doesn't understand:
   - Positional needs (trading for a CB when you already have elite corners)
   - Scheme fit (acquiring a power RB in a spread offense)
   - Roster construction (adding a 5th receiver when you need O-line)
   - Salary implications and cap flexibility
   - Team chemistry and locker room dynamics

3. **Random Game Simulation**: Games are simulated with basic probability math - there's no understanding of matchups, strength of schedule, or realistic game flow.

4. **Generic Summaries**: The narrative output is template-based, not analytical.

### Proposed Solution

Use the **GM AI model** (Claude Sonnet 4) to:
1. Analyze each trade's actual impact on team construction
2. Consider positional depth, scheme fit, and roster balance
3. Generate realistic season projections with reasoning
4. Provide analytical narratives explaining WHY the team improved or declined

---

## Current Implementation (For Reference)

### File Structure

```
/src/lib/sim/
├── season-engine.ts    # Main orchestrator
├── game-engine.ts      # Individual game simulation
├── power-ratings.ts    # Trade impact calculation
├── data-fetcher.ts     # Database queries
└── constants.ts        # League config & team data
```

### Current Flow

```
1. User clicks "Simulate Season"
2. Frontend calls POST /api/gm/sim/season
3. Backend fetches:
   - Real schedule from {team}_games_master
   - Current record from {team}_seasons
   - All accepted trades from gm_trades
4. Calculates "power rating" delta from trades
5. Simulates each game with probability math
6. Generates standings, playoffs, GM score
7. Returns results with template-based narrative
```

---

## Complete Current Code

### 1. Season Engine (`season-engine.ts`)

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

// Helper functions for segments, standings, playoffs, GM score, and summary generation
// (See full file for implementation details)
```

### 2. Game Engine (`game-engine.ts`)

```typescript
/**
 * Simulation Engine - Game Engine
 *
 * PROBLEM: Uses basic probability math, no understanding of matchups
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

export function simulateGame(input: GameInput): GameResult {
  const { teamRating, opponentRating, isHome, sport, momentum } = input
  const winProb = calculateWinProbability(teamRating, opponentRating, isHome, sport, momentum)
  const teamWins = rand() < winProb
  // ... score generation and overtime logic
}
```

### 3. Power Ratings (`power-ratings.ts`)

```typescript
/**
 * PROBLEM: Oversimplified position multipliers
 * A QB is always 3x more valuable than RB regardless of roster context
 */

const NFL_POS_MULT: Record<string, number> = {
  QB: 3.0, EDGE: 1.8, DE: 1.8, OLB: 1.4, CB: 1.4, WR: 1.3, OT: 1.3,
  DT: 1.2, LB: 1.0, S: 1.0, TE: 1.0, OG: 1.0, C: 0.9, RB: 0.6, K: 0.3, P: 0.2,
}

// Player Impact Rating based on stats
function calculateNFLPIR(player: TradePlayer): number {
  const s = player.stats
  const posMult = NFL_POS_MULT[player.position.toUpperCase()] ?? 1.0
  const passYds = (statVal(s, 'passing_yards') / 4500) * 8
  const passTd = (statVal(s, 'passing_touchdowns') / 35) * 4
  // ... more stat calculations
  return Math.min(15, raw * posMult * getAgeFactor(player.age, 'nfl'))
}

// Trade impact sums up all player/pick values
export function calculateTradeImpact(trades: TradeData[], sport: string): TradeImpactResult {
  // Sums PIR of players gained/lost + pick values
  // Returns single powerRatingDelta number
}
```

### 4. Data Fetcher (`data-fetcher.ts`)

```typescript
/**
 * Fetches real data from DataLab Supabase
 */

export async function fetchRealSchedule(teamKey: string, sport: string): Promise<ScheduleGame[]>
export async function fetchRealRecord(teamKey: string): Promise<{ wins: number; losses: number; otLosses?: number }>
export async function fetchTradeData(sessionId: string): Promise<TradeData[]>
```

### 5. Constants (`constants.ts`)

```typescript
/**
 * League configuration, team data, approximate win percentages
 */

export const LEAGUE_CONFIG = {
  nfl: {
    conferences: ['AFC', 'NFC'],
    divisions: { 'NFC North': ['CHI', 'DET', 'GB', 'MIN'], ... },
    playoffTeams: 7,
    gamesPerSeason: 17,
    playoffRounds: ['Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl'],
  },
  // ... nba, nhl, mlb
}

export const CHICAGO_TEAMS = {
  'bears': { abbrev: 'CHI', sport: 'nfl' },
  'bulls': { abbrev: 'CHI_NBA', sport: 'nba' },
  'blackhawks': { abbrev: 'CHI_NHL', sport: 'nhl' },
  'cubs': { abbrev: 'CHC', sport: 'mlb' },
  'whitesox': { abbrev: 'CHW', sport: 'mlb' },
}
```

---

## DataLab Implementation Instructions

### New API Endpoint

Create: `POST /api/gm/simulate-season`

### Request Format

```json
{
  "sessionId": "uuid",
  "sport": "nfl",
  "teamKey": "bears",
  "seasonYear": 2026,
  "trades": [
    {
      "id": "trade-uuid",
      "grade": 78,
      "partnerTeamKey": "GB",
      "playersReceived": [
        {
          "name": "Jordan Love",
          "position": "QB",
          "age": 26,
          "stats": { "passing_yards": 4200, "passing_touchdowns": 32, ... }
        }
      ],
      "playersSent": [
        {
          "name": "DJ Moore",
          "position": "WR",
          "age": 27,
          "stats": { "receiving_yards": 1200, ... }
        }
      ],
      "picksReceived": [{ "round": 2, "year": 2026 }],
      "picksSent": [{ "round": 1, "year": 2026 }]
    }
  ],
  "currentRoster": {
    // Full roster with positions, stats, depth chart
  },
  "teamRecord": { "wins": 11, "losses": 6 },
  "schedule": [
    { "week": 1, "opponent": "DET", "isHome": true },
    // ... all 17 games
  ]
}
```

### AI System Prompt for GM Model

```
You are an expert NFL/NBA/NHL/MLB General Manager analyst. Your task is to analyze a user's trades and simulate how they would impact the upcoming season.

## Your Analysis Must Consider:

### 1. Trade Impact Analysis
For each trade, evaluate:
- **Positional Need**: Did the team need this position? (e.g., trading for WR3 when you have two elite receivers = low value)
- **Scheme Fit**: Does the player fit the team's offensive/defensive scheme?
- **Age Curve**: Is the player entering their prime, peak, or decline?
- **Depth Chart Impact**: Does this create a hole elsewhere? Improve depth? Create redundancy?
- **Salary Implications**: Cap flexibility gained/lost (if provided)
- **Intangibles**: Leadership, locker room presence, playoff experience

### 2. Cumulative Roster Assessment
After all trades:
- What positions improved?
- What positions weakened?
- Is the roster more balanced or lopsided?
- How does this affect offensive/defensive identity?

### 3. Season Projection
Based on the modified roster:
- Project a realistic win-loss record with reasoning
- Identify which games become more/less winnable
- Consider strength of schedule
- Factor in division games impact

### 4. Analytical Narrative
Provide detailed reasoning, not templates. Explain:
- WHY the team improved/declined
- WHICH specific matchups changed
- WHAT the team's identity becomes
- Whether playoff contention is realistic

## Response Format

Return JSON with:
{
  "projectedRecord": { "wins": number, "losses": number },
  "recordChange": number, // +/- wins vs previous season
  "playoffProbability": number, // 0-100
  "projectedSeed": number | null,
  "gmScore": number, // 0-100

  "tradeAnalysis": [
    {
      "tradeId": "uuid",
      "netImpact": "positive" | "negative" | "neutral",
      "winsAdded": number, // can be negative
      "reasoning": "string - 2-3 sentences explaining the trade's impact"
    }
  ],

  "rosterAssessment": {
    "strengthsGained": ["string"],
    "weaknessesCreated": ["string"],
    "overallChange": "improved" | "declined" | "lateral",
    "identityShift": "string - how team's playing style changes"
  },

  "seasonNarrative": {
    "headline": "string - punchy summary",
    "analysis": "string - 3-4 paragraphs of detailed analysis",
    "keyMatchups": [
      {
        "opponent": "DET",
        "impact": "This trade makes the Week 1 matchup more winnable because..."
      }
    ],
    "playoffOutlook": "string - realistic playoff expectations"
  },

  "keyPlayerImpacts": [
    {
      "playerName": "string",
      "direction": "added" | "removed",
      "impact": "string - specific impact on team"
    }
  ]
}
```

### Example AI Response

```json
{
  "projectedRecord": { "wins": 12, "losses": 5 },
  "recordChange": 1,
  "playoffProbability": 85,
  "projectedSeed": 3,
  "gmScore": 72,

  "tradeAnalysis": [
    {
      "tradeId": "abc-123",
      "netImpact": "positive",
      "winsAdded": 1.5,
      "reasoning": "Acquiring Maxx Crosby addresses the Bears' biggest need - consistent edge pressure. While giving up a 1st round pick is significant, Crosby is a proven elite pass rusher in his prime. The Bears defense transitions from good to elite with this addition, and the NFC North suddenly looks more winnable."
    }
  ],

  "rosterAssessment": {
    "strengthsGained": ["Elite edge rush", "Run defense improvement", "Veteran leadership"],
    "weaknessesCreated": ["Reduced draft capital for future", "Slightly thinner receiver depth"],
    "overallChange": "improved",
    "identityShift": "The Bears shift from a balanced team to a defense-first identity with Crosby anchoring a now-dominant front seven."
  },

  "seasonNarrative": {
    "headline": "Bears Transform Into Defensive Powerhouse After Crosby Trade",
    "analysis": "The acquisition of Maxx Crosby fundamentally changes what the Bears can be in 2026. Last season's 11-6 record came despite inconsistent pass rush - the defense ranked 14th in sacks despite elite secondary play. Crosby immediately vaults that unit into the top 5.\n\nCaleb Williams benefits indirectly. With a defense that can generate pressure without blitzing, opponents can't stack the box or send exotic pressures as freely. The offense should see more favorable game scripts with leads to protect.\n\nThe cost is real - a 2026 first-rounder in a deep draft class. But the Bears are in 'win now' mode with Williams on a rookie deal, and Crosby delivers immediate impact that a rookie might not provide for 2-3 years.\n\nThis trade makes the Bears a legitimate Super Bowl contender rather than a playoff team hoping for a run.",
    "keyMatchups": [
      {
        "opponent": "DET",
        "impact": "Detroit's offensive line, while talented, struggled against elite edge rushers last season. Crosby gives the Bears a schematic advantage they lacked in both matchups last year."
      },
      {
        "opponent": "GB",
        "impact": "Jordan Love's quick release mitigates some pass rush impact, but Crosby's presence allows the secondary to play tighter coverage."
      }
    ],
    "playoffOutlook": "The Bears project as a 3-4 seed with home playoff game potential. The improved defense raises their floor - even in bad offensive games, this defense can keep them competitive. A first-round bye is possible if Detroit falters."
  }
}
```

---

## Integration on test.sportsmockery.com

Once DataLab implements the AI endpoint:

### 1. Update API Route

```typescript
// /src/app/api/gm/sim/season/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { sessionId, sport, teamKey, seasonYear } = body

  // Fetch data needed for AI
  const [schedule, record, trades, roster] = await Promise.all([
    fetchRealSchedule(teamKey, sport),
    fetchRealRecord(teamKey),
    fetchTradeData(sessionId),
    fetchRoster(teamKey, sport), // New function
  ])

  // Call DataLab AI endpoint
  const response = await fetch('https://datalab.sportsmockery.com/api/gm/simulate-season', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      sport,
      teamKey,
      seasonYear,
      trades,
      currentRoster: roster,
      teamRecord: record,
      schedule,
    }),
  })

  const aiResult = await response.json()

  // Transform AI response to match current frontend expectations
  return NextResponse.json({
    success: true,
    baseline: { wins: record.wins, losses: record.losses, ... },
    modified: { wins: aiResult.projectedRecord.wins, ... },
    gmScore: aiResult.gmScore,
    seasonSummary: {
      headline: aiResult.seasonNarrative.headline,
      narrative: aiResult.seasonNarrative.analysis,
      ...
    },
    // Map other fields
  })
}
```

### 2. Frontend Updates (Optional)

The current frontend can display the enhanced narrative in the existing `seasonSummary` fields. The richer analysis will naturally display better.

For the enhanced `keyMatchups` and `rosterAssessment` data, consider adding new UI sections to the simulation results modal.

---

## Testing Checklist

After DataLab implementation:

1. [ ] Test with Bears NFL trade (most common)
2. [ ] Test with Bulls NBA trade
3. [ ] Test with Blackhawks NHL trade
4. [ ] Test with Cubs/White Sox MLB trades
5. [ ] Test multi-trade session (3+ trades)
6. [ ] Test edge case: terrible trade (grade < 30)
7. [ ] Test edge case: elite trade (grade > 90)
8. [ ] Verify response times < 10 seconds
9. [ ] Verify narrative quality and accuracy
10. [ ] Confirm GM score feels accurate

---

## Questions for DataLab

1. Should the AI have access to real-time injury data?
2. Do we want to factor in FA signings (if tracked)?
3. Should strength of schedule be pre-calculated or AI-determined?
4. What's the max acceptable response time? (Current is ~2s, AI may be 5-10s)
5. Should we cache AI responses for identical trade sets?

---

## Contact

- **SM Frontend**: test.sportsmockery.com
- **DataLab API**: datalab.sportsmockery.com
- **GM Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
