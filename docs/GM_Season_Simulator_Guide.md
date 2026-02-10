# GM Season Simulator - Technical Guide

> **Last Updated:** February 10, 2026
> **Status:** Live on test.sportsmockery.com

---

## Overview

The GM Season Simulator is a Madden/2K/MLB The Show-style engine that simulates a full regular season and postseason for a Chicago team after the user executes trades in the GM Trade Simulator. It replaces a simple random number generator with a game-by-game simulation using real schedules, Elo-style win probability, player impact ratings, and momentum.

### What It Does

1. Fetches the team's **real schedule** (opponents, dates, home/away) from Datalab
2. Fetches the team's **real season record** to set a baseline power rating
3. Calculates **Player Impact Ratings** (PIR) for every player traded, factoring in stats, position, and age
4. Simulates **every regular season game** with realistic, sport-specific scores
5. Generates **full league standings** with all 30-32 teams
6. Simulates the **complete postseason** through the championship
7. Calculates a **GM Score** (0-100) based on improvement over the real previous season

### Supported Teams

| Team | Sport | Schedule Table | Season Table | Season Value |
|------|-------|----------------|--------------|--------------|
| Chicago Bears | NFL | `bears_games_master` | `bears_season_record` | 2025 |
| Chicago Bulls | NBA | `bulls_games_master` | `bulls_seasons` | 2026 |
| Chicago Blackhawks | NHL | `blackhawks_games_master` | `blackhawks_seasons` | 2026 |
| Chicago Cubs | MLB | `cubs_games_master` | `cubs_seasons` | 2025 |
| Chicago White Sox | MLB | `whitesox_games_master` | `whitesox_seasons` | 2025 |

---

## Architecture

```
User clicks "Simulate Season"
        │
        ▼
POST /api/gm/sim/season          ← Thin orchestrator (route.ts, 35 lines)
        │
        ▼
simulateSeason()                  ← Season Engine (season-engine.ts)
   ├── fetchRealSchedule()        ← Data Fetcher (data-fetcher.ts)
   ├── fetchRealRecord()          ← Data Fetcher
   ├── fetchTradeData()           ← Data Fetcher
   ├── calculateTradeImpact()     ← Power Ratings (power-ratings.ts)
   ├── simulateGame() × N         ← Game Engine (game-engine.ts)
   ├── generateStandings()        ← Season Engine
   ├── simulatePlayoffs()         ← Season Engine
   ├── calculateGMScore()         ← Season Engine
   └── generateSummary()          ← Season Engine
        │
        ▼
SimulationResult JSON             ← Includes games[], segments[], playerImpacts[]
        │
        ▼
SimulationResults.tsx             ← 5-tab modal: Overview, Games, Standings, Playoffs, Summary
```

### File Map

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/api/gm/sim/season/route.ts` | API endpoint - thin orchestrator | ~35 |
| `src/lib/sim/season-engine.ts` | Full season orchestration | ~418 |
| `src/lib/sim/game-engine.ts` | Single game simulation | ~162 |
| `src/lib/sim/power-ratings.ts` | Player impact calculations | ~221 |
| `src/lib/sim/data-fetcher.ts` | Datalab queries | ~208 |
| `src/lib/sim/constants.ts` | League configs, 124 teams, win% | ~258 |
| `src/types/gm.ts` | TypeScript interfaces | (extended) |
| `src/components/gm/SimulationResults.tsx` | Frontend display | ~833 |

---

## How Each Module Works

### 1. Data Fetcher (`data-fetcher.ts`)

Fetches three things from Datalab in parallel:

**Real Schedule:** Queries `{team}_games_master` for the current season, returning opponent abbreviations, dates, and home/away status. Falls back to a synthetic schedule if the query fails.

**Real Record:** Queries `{team}_seasons` (or `bears_season_record` for Bears) to get the authoritative win/loss/OTL record. This becomes the "baseline" for GM Score calculation.

**Trade Data:** Queries `gm_trades` for the user's session where `status = 'accepted'`. The JSONB columns `players_received`, `players_sent`, `draft_picks_received`, and `draft_picks_sent` contain full player stats.

**Opponent Power Ratings:** Each opponent's power rating is derived from a hardcoded approximate win percentage (stored in a `Map` in constants.ts). If an opponent was a trade partner, an inverse delta is applied - they get weaker if they gave up good players.

```
winPctToPowerRating(winPct, sport):
  rating = 30 + (winPct × scale)     // scale: NFL=60, others=65
  clamped to [25, 95]
```

### 2. Power Ratings (`power-ratings.ts`)

#### Player Impact Rating (PIR)

Each traded player's stats are converted to a 0-15 impact scale. The formula is sport-specific:

**NFL:**
```
rawPIR = (passYds/4500)×8 + (passTD/35)×4 + (rushYds/1200)×3
       + (recYds/1200)×3 + (sacks/12)×3 + (tackles/120)×2
PIR = min(15, rawPIR × positionMultiplier × ageFactor)
```

Position multipliers: QB=3.0, EDGE/DE=1.8, CB=1.4, WR/OT=1.3, DT=1.2, LB/S=1.0, RB=0.6, K=0.3, P=0.2

**NBA:**
```
rawPIR = ppg×0.35 + rpg×0.20 + apg×0.25 + spg×0.60 + bpg×0.50
PIR = min(15, rawPIR × positionMultiplier × ageFactor)
```

**NHL:**
```
Skaters: rawPIR = (points/gamesPlayed)×6 + max(0, plusMinus/20)×2
Goalies:  rawPIR = svPctBucket (3/5/8 based on .890/.910 thresholds)
PIR = min(15, rawPIR × positionMultiplier × ageFactor)
```

**MLB:**
```
Batters:  rawPIR = max(0, (avg−.220)×25) + (hr/40)×4 + (rbi/100)×2
Pitchers: rawPIR = max(0, (4.50−era)×1.5) + kPerIP×3 + (ip/200)×2
PIR = min(15, rawPIR × positionMultiplier × ageFactor)
```

#### Age Curves

All sports follow a similar pattern with sport-specific peak windows:

| Sport | Peak Ages | Decline Starts | Steep Decline |
|-------|-----------|----------------|---------------|
| NFL | 24-27 (1.0x) | 28-30 (0.95x) | 34+ (0.65x) |
| NBA/NHL | 22-27 (1.0x) | 28-30 (0.92x) | 34+ (0.65x) |
| MLB | 25-30 (1.0x) | 31-33 (0.92x) | 37+ (0.65x) |

Young players (under peak) get 0.85x. Unknown age gets 0.90x.

#### Trade Impact Calculation

```
For each accepted trade:
  pirGained = sum(PIR of all players received)
  pirLost   = sum(PIR of all players sent)
  pickDelta = sum(pickValues received) - sum(pickValues sent)
    Pick values: 1st round=1.5, 2nd=0.8, 3rd=0.4, 4th+=0.3

  playerDelta = pirGained - pirLost

totalDelta = (playerDelta + pickDelta) × 0.7   ← damping factor
powerRatingDelta = totalDelta × 1.2             ← each PIR point ≈ 1.2 rating points
Clamped to [-25, +25]
```

Trade partners receive the inverse delta (×0.7×1.2), weakened proportionally.

### 3. Game Engine (`game-engine.ts`)

#### Seeded PRNG

Uses a Linear Congruential Generator (LCG) for reproducible randomness:
```
seed = (seed × 1664525 + 1013904223) & 0xFFFFFFFF
rand = (seed >>> 0) / 0xFFFFFFFF
```

Seeded with `Date.now()` at simulation start, so each run produces different results.

#### Win Probability (Elo-style)

```
adjustedTeam = teamRating + (isHome ? homeAdvantage : -homeAdvantage) + momentum
exponent = (opponentRating - adjustedTeam) / 15
winProbability = 1 / (1 + 10^exponent)
```

Example outcomes for home team:
- Equal ratings: ~58% win chance
- +10 rating advantage: ~74%
- +20 rating advantage: ~88%

Home advantage values: NFL=3.0, NBA=3.5, NHL=2.5, MLB=2.0

#### Score Generation

Uses Box-Muller transform for normally distributed scores:

| Sport | Average | Variance | Min | Max | Notes |
|-------|---------|----------|-----|-----|-------|
| NFL | 22 | 8 | 3 | 45 | Nudged toward multiples of 3 and 7 |
| NBA | 110 | 12 | 80 | 140 | |
| NHL | 3 | 1.5 | 0 | 8 | |
| MLB | 4.5 | 2.5 | 0 | 15 | |

The winner's score is always > loser's score. Overtime is determined by sport-specific chance (NFL 8%, NBA 6%, NHL 12%, MLB 5%) with extra likelihood for close games.

NHL overtime losses produce an `OTL` result type (counts as a point in standings).

#### Momentum System

Rolling momentum from the last 5 games, range [-5, +5]:
- Each win: +0.5
- Each loss: -0.5
- Each OTL/tie: -0.2
- 5+ game win streak: bonus +1
- 5+ game losing streak: penalty -1

Momentum adds directly to the team's adjusted rating for the next game.

#### Game Highlights

~22% of games get a narrative highlight string. Categories:
- Overtime: "Overtime thriller!", "Dramatic overtime finish!"
- Blowout win: "Dominated from start to finish.", "Statement win."
- Close win: "Gutsy win in a tight game.", "Nail-biter goes our way."
- Close loss: "Tough loss in a hard-fought game.", "Heartbreaker."
- Rivalry: "Bragging rights on the line!"

Blowout thresholds: NFL 17+, NBA 20+, NHL 4+, MLB 7+

### 4. Season Engine (`season-engine.ts`)

#### Main Flow (`simulateSeason`)

```
1. Fetch real schedule, record, and trades in parallel
2. Calculate baseline power rating from real win%
3. Calculate trade impact (PIR delta for all trades)
4. modifiedPR = baselinePR + tradeImpact.powerRatingDelta
5. Find division rivals for highlight generation
6. Loop through each scheduled game:
   a. Get opponent power rating (with trade partner inverse delta)
   b. simulateGame(modifiedPR, oppRating, isHome, sport, momentum)
   c. Update running record and momentum
   d. Assign segment label (month name or week range)
   e. Push to games[]
7. Build season segments (aggregate stats per time period)
8. Generate full league standings (Chicago uses simulated record)
9. Simulate complete playoff bracket through championship
10. Calculate GM Score
11. Generate season summary narrative
12. Return full SimulationResult
```

#### Season Segments

Games are grouped into time segments:

| Sport | Segmentation | Examples |
|-------|-------------|----------|
| NFL | By week ranges | "Weeks 1-4", "Weeks 5-8", "Weeks 9-12", "Weeks 13-14", "Weeks 15-18" |
| NBA/NHL/MLB | By calendar month | "October", "November", "December", etc. |
| Fallback | By quarters | "Q1", "Q2", "Q3", "Q4" |

Each segment includes: wins, losses, OTL (NHL), win%, avg team score, avg opponent score.

#### Standings Generation

All teams in the league get a record:

- **Chicago team:** Uses the simulated win/loss/OTL from the game loop
- **Trade partners:** Their approximate win% is adjusted by the inverse trade delta
- **All other teams:** Use the hardcoded approximate win% with a small deterministic hash-based variance (±4%)

NHL standings sort by points (wins×2 + OTL). All others sort by win%.

For NHL, ~15% of losses are converted to OTL for non-Chicago teams.

Playoff seeds are assigned to top N teams per conference (NFL: 7, NBA/NHL: 8, MLB: 6).

#### Playoff Simulation

The engine simulates every playoff round through the championship:

- **NFL:** Single-elimination (seriesLength=1), 4 rounds (Wild Card → Super Bowl)
- **NBA:** Best-of-7, 4 rounds (First Round → NBA Finals)
- **NHL:** Best-of-7, 4 rounds (First Round → Stanley Cup Finals)
- **MLB:** Best-of-5, 4 rounds (Wild Card → World Series)

Higher seeds get home advantage. Seeds 1-2 get an extra +5 strength bonus.

Series win probability is based on each team's win total:
```
homeStrength = 50 + (homeWins × multiplier)   // NFL multiplier=3, others=1
awayStrength = 50 + (awayWins × multiplier)
p(homeWin) = homeStrength / (homeStrength + awayStrength)
```

Even if Chicago misses the playoffs, the full postseason bracket is simulated so the user sees who wins the championship.

### 5. GM Score

The GM Score (0-100) measures how well the user's trades impacted the team relative to their real season:

| Component | Max Points | Formula |
|-----------|-----------|---------|
| Trade Quality | 30 | `avgTradeGrade × 0.30` |
| Win Improvement | 30 | `(winsGained / expected) × 30` |
| Win Regression | -20 | `(winsLost / expected) × -20` |
| Playoff Achievement | 20 | Round-based: Rd1=5, Rd2=10, Conf=15, Finals=18, Won=20 |
| Championship | 15 | Won championship=15, else 0 |

"Expected" win improvement thresholds: NFL=5, NBA/NHL=15, MLB=20

**Grade scale:** A+ (90+), A (85+), A- (80+), B+ (75+), B (70+), B- (65+), C+ (60+), C (55+), C- (50+), D+ (45+), D (40+), F (<40)

---

## API

### Request

```
POST /api/gm/sim/season
Content-Type: application/json

{
  "sessionId": "uuid-of-gm-session",
  "sport": "nfl" | "nba" | "nhl" | "mlb",
  "teamKey": "chicago-bears" | "chicago-bulls" | "chicago-blackhawks" | "chicago-cubs" | "chicago-white-sox",
  "seasonYear": 2026  // optional, defaults to 2026
}
```

### Response

The response is a `SimulationResult` object. Key fields:

```typescript
{
  success: boolean
  baseline: { wins, losses, otLosses?, madePlayoffs }      // Real record
  modified: { wins, losses, otLosses?, madePlayoffs, playoffSeed? }  // Simulated
  gmScore: number                                            // 0-100
  scoreBreakdown: {
    tradeQualityScore, winImprovementScore,
    playoffBonusScore, championshipBonus, winImprovement
  }
  standings: { conference1, conference2, conference1Name, conference2Name }
  playoffs: { bracket: PlayoffMatchup[], userTeamResult }
  championship?: { winner, runnerUp, seriesScore, userTeamWon, userTeamInFinals }
  seasonSummary: { headline, narrative, tradeImpactSummary, keyMoments, affectedTeams }

  // Video game-style data
  games: SimulatedGame[]          // Every game with scores, records, highlights
  segments: SeasonSegment[]       // Monthly/weekly aggregate stats
  playerImpacts: PlayerSimImpact[] // Each traded player's power rating effect
  baselinePowerRating: number     // Team rating before trades
  modifiedPowerRating: number     // Team rating after trades
  previousSeasonRecord: { wins, losses, otLosses? }
}
```

### Game count by sport

| Sport | Regular Season Games | Playoff Rounds |
|-------|---------------------|----------------|
| NFL | 17 | 4 (single elimination) |
| NBA | 82 | 4 (best of 7) |
| NHL | 82 | 4 (best of 7) |
| MLB | 162 | 4 (best of 5) |

---

## Frontend Display

The `SimulationResults.tsx` component renders a 5-tab modal:

### Overview Tab
- **Before/After comparison:** Baseline record vs. simulated record with win delta badge
- **Power Rating comparison:** Baseline → Modified with delta
- **Player Impacts:** Each traded player listed with their PIR contribution (green=added, red=removed)
- **Championship banner:** If the user's team won the championship
- **GM Score:** Large score display with letter grade and breakdown (Trade Quality / Win Improvement / Playoff Achievement / Championship)
- **Actions:** "Simulate Again" and "Continue Trading" buttons

### Games Tab
(Conditionally shown only when `games[]` is populated)
- Game-by-game scrollable list
- Grouped by season segment (month or week range) with segment record
- Each game row: game #, date, opponent (with logo), home/away, score with W/L/OTL indicator, running record
- Highlight text in italic below notable games
- Color-coded: green left border for wins, red for losses, yellow for OTL

### Standings Tab
- Two-column layout (one per conference)
- All teams sorted by conference rank with W-L record and games back
- User's team highlighted with team color border
- Trade partners highlighted with red border
- Trade impact badges showing win delta
- Playoff teams get green rank numbers

### Playoffs Tab
- If team missed playoffs: sad face with record
- If team made playoffs: result card (Champions/Eliminated in Round X)
- Full bracket display organized by round
- Each matchup shows seeds, logos, abbreviations, and series score
- User's matchups highlighted with team color
- Championship result at the bottom with winner logo

### Summary Tab
- **Previous Season Comparison:** Last season record → Simulated record with delta
- **Headline and Narrative:** AI-generated summary based on outcome
- **Trade Impact card:** Net win change and average trade grade
- **Key Moments:** Numbered timeline (previous season, trades, final record, playoff result)
- **Trade Partner Outcomes:** How trade partners fared in the simulation

---

## Constants Reference

### Team Abbreviation Scheme

Teams that share abbreviations across sports use suffixed keys internally:

| City | NFL | NBA | NHL | MLB |
|------|-----|-----|-----|-----|
| Chicago | `CHI` | `CHI_NBA` | `CHI_NHL` | `CHC` / `CHW` |
| Los Angeles | `LA` / `LAC_NFL` | `LAL` / `LAC_NBA` | `LA_NHL` | `LAA` / `LAD` |
| Detroit | `DET` | `DET_NBA` | `DET_NHL` | `DET_MLB` |
| Minnesota | `MIN` | `MIN_NBA` | `MIN_NHL` | `MIN_MLB` |

The suffix is stripped for display (logos, UI) via `abbrev.replace(/_(?:NFL|NBA|NHL|MLB)$/, '')`.

### Score Ranges

| Sport | Average | Variance | Min | Max |
|-------|---------|----------|-----|-----|
| NFL | 22 | 8 | 3 | 45 |
| NBA | 110 | 12 | 80 | 140 |
| NHL | 3 | 1.5 | 0 | 8 |
| MLB | 4.5 | 2.5 | 0 | 15 |

### Home Advantage (Rating Points)

NFL: 3.0, NBA: 3.5, NHL: 2.5, MLB: 2.0

---

## Graceful Degradation

The system handles failures at multiple levels:

1. **Schedule fetch fails:** Falls back to a synthetic schedule of N games against rotating generic opponents
2. **Record fetch fails:** Defaults to 0-0 (baseline power rating uses 50% win%)
3. **Trade fetch fails:** Returns empty array (simulation runs with no trade impact)
4. **Unknown opponent:** Gets 0.500 win% and middle-tier power rating
5. **Unknown position:** Gets 1.0x position multiplier
6. **Missing player stats:** `statVal()` returns 0 for any missing/null stat keys
7. **Missing player age:** Gets 0.90x age factor

The frontend conditionally renders new sections:
- Games tab only appears if `games.length > 0`
- Power Rating section only appears if `baselinePowerRating` and `modifiedPowerRating` exist
- Player Impacts only appears if `playerImpacts.length > 0`
- Previous Season Comparison only appears if `previousSeasonRecord` exists
