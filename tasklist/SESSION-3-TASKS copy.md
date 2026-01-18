# SESSION 3 - ESPN-STYLE DATA & TEAM/PLAYER PAGES
## SportsMockery.com Migration

**INSTRUCTIONS:** Complete each section in order. Mark tasks [x] as you complete them. When a section is done, immediately start the next section. Run the notification command after each section.

When you complete a section, run:
```
osascript -e 'display notification "Section complete!" with title "Session 3"' && afplay /System/Library/Sounds/Glass.aiff
```

---

## SECTION 1: Example Data Setup (10 tasks)
- [x] 1. Create src/data/exampleData.ts with all example data:
```typescript
// Teams
export const teams = {
  bears: { name: "Chicago Bears", slug: "bears", record: "10-4", division: "NFC North", divisionRank: "1st", primaryColor: "#0B162A", secondaryColor: "#C83200", sport: "NFL" },
  bulls: { name: "Chicago Bulls", slug: "bulls", record: "15-18", division: "Central", divisionRank: "4th", primaryColor: "#CE1141", secondaryColor: "#000000", sport: "NBA" },
  cubs: { name: "Chicago Cubs", slug: "cubs", record: "83-79", division: "NL Central", divisionRank: "2nd", primaryColor: "#0E3386", secondaryColor: "#CC3433", sport: "MLB" },
  whiteSox: { name: "Chicago White Sox", slug: "white-sox", record: "41-121", division: "AL Central", divisionRank: "5th", primaryColor: "#27251F", secondaryColor: "#C4CED4", sport: "MLB" },
  blackhawks: { name: "Chicago Blackhawks", slug: "blackhawks", record: "12-20-5", division: "Central", divisionRank: "7th", primaryColor: "#CF0A2C", secondaryColor: "#000000", sport: "NHL" }
}
```
- [x] 2. Add liveScores example data:
```typescript
export const liveScores = [
  { id: 1, sport: "NFL", away: { name: "Bears", score: 17, logo: "/teams/bears.png" }, home: { name: "Packers", score: 14, logo: "/teams/packers.png" }, status: "3rd Quarter", time: "5:42", channel: "FOX", aiPrediction: "Bears win 72%" },
  { id: 2, sport: "NBA", away: { name: "Bulls", score: 98, logo: "/teams/bulls.png" }, home: { name: "Bucks", score: 102, logo: "/teams/bucks.png" }, status: "4th Quarter", time: "2:15", channel: "ESPN", aiPrediction: "Bulls collapse 81%" },
  { id: 3, sport: "MLB", away: { name: "Cubs", score: 3, logo: "/teams/cubs.png" }, home: { name: "Cardinals", score: 1, logo: "/teams/cardinals.png" }, status: "Top 7th", channel: "Marquee", aiPrediction: "Cubs hold 68%" },
  { id: 4, sport: "NHL", away: { name: "Blackhawks", score: 2, logo: "/teams/blackhawks.png" }, home: { name: "Blues", score: 2, logo: "/teams/blues.png" }, status: "2nd Period", time: "8:30", channel: "NBCSCH", aiPrediction: "OT likely 54%" }
]
```
- [x] 3. Add headlines example data:
```typescript
export const headlines = [
  { id: 1, category: "BEARS", headline: "Caleb Williams Questionable for Sunday", subtext: "QB ankle injury clouds playoff hopes", spread: "CHI -3.5", time: "Sun 12:00 PM", channel: "CBS", aiMockery: "Classic Bears timing—finally good, now broken" },
  { id: 2, category: "CUBS", headline: "Cubs Eyeing $200M Free Agent Pitcher", subtext: "Sources say deal could close this week", aiMockery: "Ricketts opening wallet? Check for pod people" },
  { id: 3, category: "BULLS", headline: "LaVine Trade Rumors Heat Up", subtext: "Lakers, Heat showing interest", aiMockery: "Please, anyone, take him—we'll add a toaster" },
  { id: 4, category: "BLACKHAWKS", headline: "Bedard Scores Hat Trick in Win", subtext: "Hawks snap 5-game skid", aiMockery: "One man team does one man team things" },
  { id: 5, category: "WHITE SOX", headline: "Sox Set Unwanted MLB Record", subtext: "122 losses and counting", aiMockery: "At least they're elite at something" }
]
```
- [x] 4. Add bearsRoster example data:
```typescript
export const bearsRoster = [
  { number: 18, name: "Caleb Williams", position: "QB", age: 23, height: "6-1", weight: 215, college: "USC", experience: "Rookie", status: "Questionable" },
  { number: 1, name: "Keenan Allen", position: "WR", age: 32, height: "6-2", weight: 211, college: "California", experience: "12", status: "Active" },
  { number: 14, name: "DJ Moore", position: "WR", age: 27, height: "6-0", weight: 210, college: "Maryland", experience: "7", status: "Active" },
  { number: 30, name: "D'Andre Swift", position: "RB", age: 25, height: "5-9", weight: 212, college: "Georgia", experience: "5", status: "Active" },
  { number: 85, name: "Cole Kmet", position: "TE", age: 25, height: "6-6", weight: 262, college: "Notre Dame", experience: "5", status: "Active" },
  { number: 51, name: "Dick Butkus Jr", position: "LB", age: 24, height: "6-3", weight: 245, college: "Illinois", experience: "2", status: "Active" }
]
```
- [x] 5. Add bearsSchedule example data:
```typescript
export const bearsSchedule = [
  { week: 1, date: "Sep 8", opponent: "@ Titans", result: "W 24-17", record: "1-0" },
  { week: 2, date: "Sep 15", opponent: "vs Texans", result: "W 19-13", record: "2-0" },
  { week: 3, date: "Sep 22", opponent: "vs Colts", result: "W 21-16", record: "3-0" },
  { week: 15, date: "Dec 22", opponent: "vs Lions", time: "4:25 PM", channel: "FOX", spread: "DET -2.5" },
  { week: 16, date: "Dec 29", opponent: "@ Seahawks", time: "3:05 PM", channel: "CBS", spread: "CHI -1" },
  { week: 17, date: "Jan 5", opponent: "vs Packers", time: "12:00 PM", channel: "FOX", spread: "CHI -3.5" }
]
```
- [x] 6. Add bearsStandings example data:
```typescript
export const nfcNorthStandings = [
  { team: "Bears", w: 10, l: 4, t: 0, pct: ".714", pf: 343, pa: 298, streak: "W3", home: "6-1", away: "4-3", conf: "7-2", div: "4-1" },
  { team: "Lions", w: 9, l: 5, t: 0, pct: ".643", pf: 380, pa: 312, streak: "L1", home: "5-2", away: "4-3", conf: "6-3", div: "3-2" },
  { team: "Packers", w: 8, l: 6, t: 0, pct: ".571", pf: 298, pa: 285, streak: "W1", home: "5-2", away: "3-4", conf: "5-4", div: "2-3" },
  { team: "Vikings", w: 7, l: 7, t: 0, pct: ".500", pf: 276, pa: 290, streak: "L2", home: "4-3", away: "3-4", conf: "4-5", div: "1-4" }
]
```
- [x] 7. Add playerData example:
```typescript
export const calebWilliams = {
  id: 1,
  name: "Caleb Williams",
  team: "Chicago Bears",
  position: "QB",
  number: 18,
  height: "6-1",
  weight: 215,
  age: 23,
  birthdate: "Nov 18, 2001",
  college: "USC",
  draft: "2024 Round 1, Pick 1",
  experience: "Rookie",
  stats: {
    passing: { gp: 14, comp: 285, att: 432, pct: 66.0, yds: 3245, td: 22, int: 8, rating: 98.5 },
    rushing: { att: 45, yds: 285, avg: 6.3, td: 3 }
  },
  seasonSplits: [
    { split: "Home", comp: 145, att: 210, yds: 1680, td: 12, int: 3 },
    { split: "Away", comp: 140, att: 222, yds: 1565, td: 10, int: 5 }
  ],
  lastGames: [
    { week: 14, date: "Dec 15", opp: "MIN", result: "W 24-20", comp: 22, att: 31, yds: 285, td: 2, int: 0, rating: 112.5 },
    { week: 13, date: "Dec 8", opp: "@ SF", result: "L 17-21", comp: 19, att: 28, yds: 198, td: 1, int: 1, rating: 82.4 }
  ]
}
```
- [x] 8. Add depthChart example:
```typescript
export const bearsDepthChart = {
  offense: {
    QB: ["Caleb Williams", "Tyson Bagent"],
    RB: ["D'Andre Swift", "Khalil Herbert", "Roschon Johnson"],
    WR1: ["DJ Moore", "Tyler Scott"],
    WR2: ["Keenan Allen", "Darnell Mooney"],
    WR3: ["Rome Odunze", "Velus Jones Jr"],
    TE: ["Cole Kmet", "Gerald Everett"],
    LT: ["Braxton Jones", "Larry Borom"],
    LG: ["Teven Jenkins", "Nate Davis"],
    C: ["Coleman Shelton", "Doug Kramer"],
    RG: ["Nate Davis", "Matt Pryor"],
    RT: ["Darnell Wright", "Larry Borom"]
  },
  defense: {
    DE: ["Montez Sweat", "DeMarcus Walker"],
    DT: ["Gervon Dexter", "Andrew Billings"],
    OLB: ["Tremaine Edmunds", "T.J. Edwards"],
    MLB: ["Jack Sanborn", "Noah Sewell"],
    CB1: ["Jaylon Johnson", "Tyrique Stevenson"],
    CB2: ["Kyler Gordon", "Josh Blackwell"],
    S: ["Kevin Byard", "Jaquan Brisker"]
  }
}
```
- [x] 9. Add injuries example:
```typescript
export const bearsInjuries = [
  { name: "Caleb Williams", position: "QB", injury: "Ankle", status: "Questionable", updated: "Thu" },
  { name: "Tremaine Edmunds", position: "LB", injury: "Knee", status: "Out", updated: "Wed" },
  { name: "Kyler Gordon", position: "CB", injury: "Hamstring", status: "Doubtful", updated: "Thu" }
]
```
- [x] 10. Add teamStats example:
```typescript
export const bearsStats = {
  offense: {
    rank: 8,
    ppg: 24.5,
    ypg: 358.2,
    passingYpg: 242.1,
    rushingYpg: 116.1,
    thirdDownPct: 42.3,
    redzonePct: 58.7,
    turnovers: 12
  },
  defense: {
    rank: 12,
    ppgAllowed: 21.2,
    ypgAllowed: 322.5,
    passingYpgAllowed: 218.3,
    rushingYpgAllowed: 104.2,
    sacks: 38,
    interceptions: 14,
    forcedFumbles: 8
  },
  prophecy: "Offense clicking, defense sus in red zone—playoff run depends on Caleb staying healthy"
}
```

**Run notification command, then continue to Section 2**

---

## SECTION 2: Scores Components (15 tasks)
- [x] 1. Create src/components/scores/OracleScoresBar.tsx:
  - Persistent bar below header
  - Horizontal scroll on mobile
  - Shows live games from all sports
  - Red glow on live games
  - Collapsible to slim mode
  - Pull data from exampleData.liveScores
- [x] 2. Create src/components/scores/ScoreCard.tsx:
  - Individual game card
  - Team logos/names
  - Scores large
  - Status (quarter, period, inning)
  - Time remaining
  - TV channel badge
  - AI prediction badge with glow
- [x] 3. Create src/components/scores/ScoreCardLive.tsx:
  - Live game variant
  - Pulsing red border
  - "LIVE" badge
  - Auto-updates placeholder
- [x] 4. Create src/components/scores/ScoreCardFinal.tsx:
  - Final game variant
  - "FINAL" badge
  - Winner highlighted
- [x] 5. Create src/components/scores/ScoreCardUpcoming.tsx:
  - Future game variant
  - Date/time display
  - Spread/odds
  - TV channel
- [x] 6. Create src/components/scores/SportFilter.tsx:
  - Tabs: All, NFL, NBA, MLB, NHL
  - Filter scores by sport
  - Team color underline
- [x] 7. Create src/components/scores/ScoresGrid.tsx:
  - Grid of all scores
  - Grouped by sport
  - Live games first
- [x] 8. Create src/app/scores/page.tsx:
  - Full scores page
  - Sport tabs
  - Date selector
  - All games grid
- [x] 9. Create src/app/scores/[sport]/page.tsx:
  - Sport-specific scores
  - /scores/nfl, /scores/nba, etc.
- [x] 10. Create src/components/scores/GameDetail.tsx:
  - Expanded game view
  - Box score placeholder
  - Play-by-play placeholder
  - Team stats comparison
- [x] 11. Create src/components/scores/OddsDisplay.tsx:
  - Spread, moneyline, over/under
  - Styled odds format
- [x] 12. Create src/components/scores/TVChannel.tsx:
  - Channel badge component
  - Logo if available
- [x] 13. Create src/components/scores/GameTime.tsx:
  - Formats game time
  - "Today 7:00 PM" or "Sun 12:00 PM"
- [x] 14. Create src/components/scores/MockeryPrediction.tsx:
  - AI prediction display
  - Percentage with progress bar
  - Witty prediction text
- [x] 15. Create src/hooks/useScores.ts:
  - Hook to fetch/manage scores
  - Filter by sport
  - Returns loading, error, data

**Run notification command, then continue to Section 3**

---

## SECTION 3: Headlines & Ticker (10 tasks)
- [x] 1. Create src/components/headlines/ProphecyTicker.tsx:
  - Horizontal scrolling headlines
  - Glowing card edges
  - Text-dense, minimal images
  - Pull from exampleData.headlines
- [x] 2. Create src/components/headlines/HeadlineCard.tsx:
  - Category badge (team color)
  - Bold headline
  - Subtext
  - Spread/odds, time, channel
  - Hover reveals AI mockery with fade
- [x] 3. Create src/components/headlines/BreakingHeadline.tsx:
  - Red "BREAKING" badge pulsing
  - Urgent styling
  - Full width banner option
- [x] 4. Create src/components/headlines/HeadlineStack.tsx:
  - Vertical stack of headlines
  - ESPN-style list
  - Category headers
- [x] 5. Create src/components/headlines/TopStories.tsx:
  - "Top Stories" section
  - 5 headlines with numbers
  - Compact list style
- [x] 6. Create src/components/headlines/CategoryHeadlines.tsx:
  - Headlines filtered by team/category
  - "Bears Headlines" etc.
- [x] 7. Create src/components/headlines/HeadlineSkeleton.tsx:
  - Loading skeleton for headlines
- [x] 8. Create src/components/headlines/MockeryReveal.tsx:
  - AI mockery text reveal animation
  - Typewriter effect
  - Red accent
- [x] 9. Create src/components/headlines/UrgentBadge.tsx:
  - "URGENT" "BREAKING" "DEVELOPING" badges
  - Different colors per type
- [x] 10. Create src/hooks/useHeadlines.ts:
  - Hook to fetch/filter headlines
  - Category filter
  - Returns data with loading state

**Run notification command, then continue to Section 4**

---

## SECTION 4: Team Hub Pages (20 tasks)
- [x] 1. Create src/app/team/[slug]/page.tsx - Team hub main page
- [x] 2. Create src/components/team/TeamHero.tsx:
  - Full width team color gradient
  - Team logo large
  - Team name
  - Record, division rank
  - "AI Win Probability" stat
  - Next game preview
- [x] 3. Create src/components/team/TeamSubNav.tsx:
  - Sticky tabs navigation
  - News, Schedule, Roster, Stats, Depth Chart, Standings, Injuries
  - Team color underline on active
  - Scroll horizontally on mobile
- [x] 4. Create src/components/team/TeamNews.tsx:
  - Latest team news articles
  - Grid layout
  - From sm_posts by category
- [x] 5. Create src/components/team/TeamSchedule.tsx:
  - Full schedule table
  - Past games: result, score
  - Future games: time, channel, spread
  - Highlight next game
  - Uses bearsSchedule data
- [x] 6. Create src/components/team/TeamRoster.tsx:
  - Sortable roster table
  - Columns: #, Name, Pos, Age, Ht, Wt, College, Status
  - Click row to go to player page
  - Filter by position group
  - Uses bearsRoster data
- [x] 7. Create src/components/team/TeamStats.tsx:
  - Offense/Defense stat cards
  - Glowing accent on key stats
  - Rank badges
  - AI prophecy commentary
  - Uses bearsStats data
- [x] 8. Create src/components/team/DepthChart.tsx:
  - Visual depth chart
  - Position groups
  - Starters highlighted
  - Click player for popup/link
  - Uses bearsDepthChart data
- [x] 9. Create src/components/team/TeamStandings.tsx:
  - Division/conference standings
  - Current team highlighted
  - W-L, PCT, PF, PA, Streak columns
  - Uses nfcNorthStandings data
- [x] 10. Create src/components/team/TeamInjuries.tsx:
  - Injury report table
  - Player, Position, Injury, Status, Updated
  - Status color coding (Out=red, Questionable=yellow, etc.)
  - Uses bearsInjuries data
- [x] 11. Create src/app/team/[slug]/schedule/page.tsx - Full schedule page
- [x] 12. Create src/app/team/[slug]/roster/page.tsx - Full roster page
- [x] 13. Create src/app/team/[slug]/stats/page.tsx - Full stats page
- [x] 14. Create src/app/team/[slug]/depth-chart/page.tsx - Full depth chart page
- [x] 15. Create src/components/team/TeamLeaders.tsx:
  - Top performers grid
  - Passing, Rushing, Receiving leaders
  - Photo, name, stat
- [x] 16. Create src/components/team/TeamTransactions.tsx:
  - Recent transactions list
  - Signings, releases, trades
  - Date and details
- [x] 17. Create src/components/team/TeamSocial.tsx:
  - Team social feed
  - Twitter embeds placeholder
- [x] 18. Create src/components/team/FollowTeam.tsx:
  - Follow button for team
  - Bell icon for notifications
  - Saves to localStorage
- [x] 19. Create src/components/team/TeamComparison.tsx:
  - Compare two teams stats
  - Side by side bars
- [x] 20. Add generateMetadata to team pages

**Run notification command, then continue to Section 5**

---

## SECTION 5: Player Profile Pages (15 tasks)
- [x] 1. Create src/app/player/[id]/page.tsx - Player profile main page
- [x] 2. Create src/components/player/PlayerHero.tsx:
  - Player headshot
  - Name large
  - Team, position, number
  - Team color accent bar
  - Key stats row (passing yds, TDs, rating)
  - Uses calebWilliams data
- [x] 3. Create src/components/player/PlayerBio.tsx:
  - Height, weight, age
  - Birthdate, college
  - Draft info
  - Experience
- [x] 4. Create src/components/player/PlayerStats.tsx:
  - Career/season stats table
  - Multiple stat categories
  - Sortable columns
- [x] 5. Create src/components/player/PlayerSplits.tsx:
  - Home/Away splits
  - Vs division, vs conference
  - Day/Night games
- [x] 6. Create src/components/player/PlayerGameLog.tsx:
  - Recent games table
  - Date, opponent, result, key stats
  - Click for game detail
- [x] 7. Create src/components/player/PlayerChart.tsx:
  - Career arc line chart
  - Animated glowing line
  - Yards, TDs over seasons
  - Install recharts if not already
- [x] 8. Create src/components/player/PlayerNews.tsx:
  - Recent articles about player
  - Search sm_posts for player name
- [x] 9. Create src/components/player/PlayerMockery.tsx:
  - AI mockery commentary
  - Witty take on player
  - "SM Take on Williams: The kid is HIM. Finally, a Bears QB who doesn't make us drink."
- [x] 10. Create src/components/player/PlayerWhatIf.tsx:
  - "Neural Story Weaver" section
  - Interactive "What If" scenarios
  - Buttons: "Stays healthy all season?" "Gets traded?" "Wins MVP?"
  - Each shows AI prediction placeholder
- [x] 11. Create src/components/player/PlayerNFT.tsx:
  - "Oracle Collectible" card
  - Glowing border
  - Rarity badge
  - "Own this prophecy" CTA
  - Placeholder for future NFT feature
- [x] 12. Create src/components/player/PlayerComparison.tsx:
  - Compare to similar players
  - Side by side stats
- [x] 13. Create src/components/player/FollowPlayer.tsx:
  - Follow button
  - Get updates on player
- [x] 14. Create src/components/player/PlayerRelated.tsx:
  - Related players (same team, position)
  - Card grid
- [x] 15. Add generateMetadata to player page

**Run notification command - SESSION 3 COMPLETE**

---

## COMPLETION CHECKLIST
When all sections are done:
- [x] All 70 tasks completed
- [x] Run: `osascript -e 'display notification "SESSION 3 FULLY COMPLETE!" with title "Claude Code"' && afplay /System/Library/Sounds/Funk.aiff`
- [x] Report completion status
