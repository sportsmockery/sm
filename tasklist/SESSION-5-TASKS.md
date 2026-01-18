# SESSION-5-TASKS.md - ESPN Team & Player Pages

**Goal:** Build ESPN-style team and player pages with schedules, rosters, stats, and standings.

**Run this notification when each section completes:**
```bash
osascript -e 'display notification "Section complete!" with title "Claude Code"' && afplay /System/Library/Sounds/Funk.aiff
```

---

## SECTION 1: Data Layer & API Integration (10 tasks)

### 1.1 Create ESPN/Sports Data Types
- [ ] Create `src/lib/types/sports.ts`:
```typescript
// Team types
export interface Team {
  id: string;
  name: string;
  shortName: string;      // "Bears", "Cubs"
  abbreviation: string;   // "CHI", "CHC"
  slug: string;           // "chicago-bears"
  sport: 'nfl' | 'mlb' | 'nba' | 'nhl';
  league: string;
  division: string;
  colors: { primary: string; secondary: string };
  logo: string;
  record?: { wins: number; losses: number; ties?: number; pct: string };
  standing?: { division: number; conference: number };
}

// Player types
export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  slug: string;
  number: string;
  position: string;
  height: string;
  weight: string;
  age: number;
  birthDate: string;
  college: string;
  experience: string;
  status: 'active' | 'injured' | 'ir' | 'pup';
  headshot: string;
  team: Team;
}

// Game/Schedule types
export interface Game {
  id: string;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'final' | 'postponed';
  venue: string;
  broadcast?: string;
  week?: number;        // NFL
  gameNumber?: number;  // MLB
}

// Stats types
export interface TeamStats {
  offense: Record<string, number | string>;
  defense: Record<string, number | string>;
  rankings: Record<string, number>;
}

export interface PlayerStats {
  season: string;
  games: number;
  stats: Record<string, number | string>;
}

// Standings
export interface StandingsEntry {
  team: Team;
  wins: number;
  losses: number;
  ties?: number;
  pct: string;
  gb: string;
  streak: string;
  last10?: string;
  homeRecord: string;
  awayRecord: string;
  divisionRecord: string;
  conferenceRecord?: string;
}
```

### 1.2 Create Chicago Teams Config
- [ ] Create `src/lib/teams.ts`:
```typescript
import { Team } from './types/sports';

export const CHICAGO_TEAMS: Record<string, Team> = {
  'chicago-bears': {
    id: 'chi-bears',
    name: 'Chicago Bears',
    shortName: 'Bears',
    abbreviation: 'CHI',
    slug: 'chicago-bears',
    sport: 'nfl',
    league: 'NFL',
    division: 'NFC North',
    colors: { primary: '#0B162A', secondary: '#C83200' },
    logo: '/logos/bears.svg',
  },
  'chicago-bulls': {
    id: 'chi-bulls',
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    abbreviation: 'CHI',
    slug: 'chicago-bulls',
    sport: 'nba',
    league: 'NBA',
    division: 'Central',
    colors: { primary: '#CE1141', secondary: '#000000' },
    logo: '/logos/bulls.svg',
  },
  'chicago-cubs': {
    id: 'chi-cubs',
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    abbreviation: 'CHC',
    slug: 'chicago-cubs',
    sport: 'mlb',
    league: 'MLB',
    division: 'NL Central',
    colors: { primary: '#0E3386', secondary: '#CC3433' },
    logo: '/logos/cubs.svg',
  },
  'chicago-white-sox': {
    id: 'chi-sox',
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    abbreviation: 'CWS',
    slug: 'chicago-white-sox',
    sport: 'mlb',
    league: 'MLB',
    division: 'AL Central',
    colors: { primary: '#27251F', secondary: '#C4CED4' },
    logo: '/logos/whitesox.svg',
  },
  'chicago-blackhawks': {
    id: 'chi-hawks',
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    abbreviation: 'CHI',
    slug: 'chicago-blackhawks',
    sport: 'nhl',
    league: 'NHL',
    division: 'Central',
    colors: { primary: '#CF0A2C', secondary: '#000000' },
    logo: '/logos/blackhawks.svg',
  },
};

export function getTeamBySlug(slug: string): Team | undefined {
  return CHICAGO_TEAMS[slug];
}

export function getTeamsBySport(sport: string): Team[] {
  return Object.values(CHICAGO_TEAMS).filter(t => t.sport === sport);
}
```

### 1.3 Create Sports Data API Client
- [ ] Create `src/lib/sportsApi.ts`:
```typescript
// API client for fetching live sports data
// Can connect to ESPN API, SportsData.io, or your Data Lab

import { Team, Player, Game, StandingsEntry, TeamStats, PlayerStats } from './types/sports';
import { CHICAGO_TEAMS } from './teams';

const DATA_LAB_URL = process.env.NEXT_PUBLIC_DATALAB_URL || 'https://datalab.sportsmockery.com';

// Fetch team schedule
export async function getTeamSchedule(teamSlug: string, season?: string): Promise<Game[]> {
  // TODO: Connect to real API
  // For now, return mock data
  return getMockSchedule(teamSlug);
}

// Fetch team roster
export async function getTeamRoster(teamSlug: string): Promise<Player[]> {
  return getMockRoster(teamSlug);
}

// Fetch team stats
export async function getTeamStats(teamSlug: string, season?: string): Promise<TeamStats> {
  return getMockTeamStats(teamSlug);
}

// Fetch division/conference standings
export async function getStandings(teamSlug: string): Promise<StandingsEntry[]> {
  return getMockStandings(teamSlug);
}

// Fetch player profile
export async function getPlayer(playerId: string): Promise<Player | null> {
  return getMockPlayer(playerId);
}

// Fetch player stats
export async function getPlayerStats(playerId: string): Promise<PlayerStats[]> {
  return getMockPlayerStats(playerId);
}

// Mock data functions (replace with real API calls)
function getMockSchedule(teamSlug: string): Game[] {
  // Return sample schedule based on sport
  const team = CHICAGO_TEAMS[teamSlug];
  if (!team) return [];
  
  // Generate mock games...
  return [];
}

function getMockRoster(teamSlug: string): Player[] {
  return [];
}

function getMockTeamStats(teamSlug: string): TeamStats {
  return { offense: {}, defense: {}, rankings: {} };
}

function getMockStandings(teamSlug: string): StandingsEntry[] {
  return [];
}

function getMockPlayer(playerId: string): Player | null {
  return null;
}

function getMockPlayerStats(playerId: string): PlayerStats[] {
  return [];
}
```

### 1.4 Create Mock Data for Development
- [ ] Create `src/data/mockSportsData.ts` with realistic sample data for:
  - Bears 2025 schedule (17 games)
  - Bears roster (~53 players)
  - NFC North standings
  - Sample player profiles (Caleb Williams, DJ Moore, etc.)

**Run notification, continue to Section 2**

---

## SECTION 2: Team Page Components (15 tasks)

### 2.1 Team Header Component
- [ ] Create `src/components/teams/TeamHeader.tsx`:
```tsx
// Large team banner with:
// - Team logo (large)
// - Team name
// - Record (e.g., "10-7")
// - Standing (e.g., "2nd in NFC North")
// - Team colors as background gradient
// - Next game preview
```

### 2.2 Team Navigation Component
- [ ] Create `src/components/teams/TeamNav.tsx`:
```tsx
// Horizontal tab navigation:
// - Overview (default)
// - Schedule
// - Roster
// - Stats
// - Standings
// - News (links to /chicago-bears)
// Active state styling with team color underline
```

### 2.3 Team Layout Component
- [ ] Create `src/components/teams/TeamLayout.tsx`:
```tsx
// Shared layout for all team subpages
// - TeamHeader at top
// - TeamNav below header
// - Content area
// - Sidebar with upcoming games, news
```

### 2.4 Schedule Table Component
- [ ] Create `src/components/teams/ScheduleTable.tsx`:
```tsx
// NFL-style schedule display:
// - Week number
// - Date & time
// - Opponent (with logo)
// - Home/Away indicator
// - Result (W/L) or "vs"/"@" for upcoming
// - Score if completed
// - TV broadcast
// Color-coded: green for wins, red for losses
// Current week highlighted
```

### 2.5 Roster Table Component
- [ ] Create `src/components/teams/RosterTable.tsx`:
```tsx
// Sortable roster grid:
// - Player headshot thumbnail
// - Number
// - Name (link to player page)
// - Position
// - Height/Weight
// - Age
// - Experience
// - College
// Filter by position group (Offense/Defense/Special Teams)
// Or by specific position (QB, RB, WR, etc.)
```

### 2.6 Player Card Component (for roster grid view)
- [ ] Create `src/components/teams/PlayerCard.tsx`:
```tsx
// Card-style player display for grid view:
// - Headshot
// - Number overlay
// - Name
// - Position
// Hover: show quick stats
// Click: go to player page
```

### 2.7 Standings Table Component
- [ ] Create `src/components/teams/StandingsTable.tsx`:
```tsx
// Division standings table:
// - Team logo + name
// - W-L-T
// - PCT
// - GB (games behind)
// - Home record
// - Away record
// - Division record
// - Streak
// Current team highlighted
// Conference standings toggle
```

### 2.8 Team Stats Display Component
- [ ] Create `src/components/teams/TeamStatsDisplay.tsx`:
```tsx
// Stats overview with:
// - Offensive stats card
// - Defensive stats card
// - League rankings
// - Season comparison chart
// Sport-specific stats (NFL vs MLB vs NBA vs NHL)
```

### 2.9 Upcoming Games Widget
- [ ] Create `src/components/teams/UpcomingGamesWidget.tsx`:
```tsx
// Sidebar widget showing next 3-5 games:
// - Date
// - Opponent logo + name
// - Time
// - Venue
// - TV
```

### 2.10 Recent Results Widget
- [ ] Create `src/components/teams/RecentResultsWidget.tsx`:
```tsx
// Last 5 games with W/L indicators:
// - Visual streak display (●●●○●)
// - Scores
// - Links to recaps
```

### 2.11 Team News Widget
- [ ] Create `src/components/teams/TeamNewsWidget.tsx`:
```tsx
// Latest 5 articles for this team
// Pull from existing article system
// Compact list style
```

### 2.12 Season Selector Component
- [ ] Create `src/components/teams/SeasonSelector.tsx`:
```tsx
// Dropdown to switch between seasons
// e.g., "2025-26", "2024-25", "2023-24"
// Updates schedule, stats, roster
```

### 2.13 Game Detail Modal/Expandable
- [ ] Create `src/components/teams/GameDetail.tsx`:
```tsx
// Expanded game view:
// - Full box score
// - Key stats
// - Link to recap article
// - Highlights (if available)
```

### 2.14 Stats Comparison Component
- [ ] Create `src/components/teams/StatsComparison.tsx`:
```tsx
// Compare team stats vs league average
// Or vs specific opponent
// Visual bar charts
```

### 2.15 Injury Report Component
- [ ] Create `src/components/teams/InjuryReport.tsx`:
```tsx
// Current team injuries:
// - Player name
// - Position
// - Injury type
// - Status (Out, Doubtful, Questionable, Probable)
// - Updated date
```

**Run notification, continue to Section 3**

---

## SECTION 3: Team Pages (10 tasks)

### 3.1 Create Team Overview Page
- [ ] Create `src/app/teams/[team]/page.tsx`:
```tsx
// Team hub page with:
// - TeamHeader
// - TeamNav
// - Quick stats summary
// - Next game spotlight
// - Recent results
// - Latest news (3-5 articles)
// - Standings snapshot
// Metadata: "Chicago Bears - Schedule, Roster, Stats | Sports Mockery"
```

### 3.2 Create Team Schedule Page
- [ ] Create `src/app/teams/[team]/schedule/page.tsx`:
```tsx
// Full season schedule
// - SeasonSelector
// - ScheduleTable (full 17/82/162 games)
// - Filter: All / Home / Away / Division
// - Download calendar option
```

### 3.3 Create Team Roster Page
- [ ] Create `src/app/teams/[team]/roster/page.tsx`:
```tsx
// Full team roster
// - Toggle: Table view / Card grid view
// - Filter by position
// - Search by name
// - Sort options
// - Depth chart view (optional)
```

### 3.4 Create Team Stats Page
- [ ] Create `src/app/teams/[team]/stats/page.tsx`:
```tsx
// Comprehensive team statistics
// - SeasonSelector
// - Offense/Defense tabs
// - Stat leaders (top 5 per category)
// - League rankings
// - Charts/visualizations
```

### 3.5 Create Team Standings Page
- [ ] Create `src/app/teams/[team]/standings/page.tsx`:
```tsx
// Division and conference standings
// - Division standings (default)
// - Conference standings
// - League standings
// - Wild card race (if applicable)
// - Playoff picture
```

### 3.6 Create Team Layout
- [ ] Create `src/app/teams/[team]/layout.tsx`:
```tsx
// Shared layout wrapping all team subpages
// - Validates team slug
// - Fetches team data
// - Renders TeamHeader + TeamNav
// - Provides team context to children
```

### 3.7 Add generateMetadata for Team Pages
- [ ] Add proper SEO metadata to all team pages:
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const team = getTeamBySlug(params.team);
  return {
    title: `${team.name} Schedule, Roster & Stats | Sports Mockery`,
    description: `Latest ${team.name} news, schedule, roster, stats and standings.`,
    openGraph: {
      images: [team.logo],
    },
  };
}
```

### 3.8 Add generateStaticParams for Team Pages
- [ ] Pre-generate static pages for all 5 Chicago teams:
```tsx
export async function generateStaticParams() {
  return [
    { team: 'chicago-bears' },
    { team: 'chicago-bulls' },
    { team: 'chicago-cubs' },
    { team: 'chicago-white-sox' },
    { team: 'chicago-blackhawks' },
  ];
}
```

### 3.9 Create Teams Index Page
- [ ] Create `src/app/teams/page.tsx`:
```tsx
// List all 5 Chicago teams
// - Team cards with logos
// - Current records
// - Quick links to schedule/roster/stats
```

### 3.10 Add Team Page Links to Navigation
- [ ] Update Header/Navigation to include team pages:
```tsx
// In team dropdown or mega menu:
// Bears → /teams/chicago-bears
//   └─ Schedule, Roster, Stats
// Bulls → /teams/chicago-bulls
// etc.
```

**Run notification, continue to Section 4**

---

## SECTION 4: Player Page Components (10 tasks)

### 4.1 Player Header Component
- [ ] Create `src/components/players/PlayerHeader.tsx`:
```tsx
// Large player banner:
// - Headshot (large)
// - Name
// - Number + Position
// - Team logo + name
// - Key stats (3-4 highlights)
// - Status badge (Active, IR, etc.)
// Team color accents
```

### 4.2 Player Bio Component
- [ ] Create `src/components/players/PlayerBio.tsx`:
```tsx
// Player information:
// - Height, Weight, Age
// - Born (date, location)
// - College
// - Draft info (round, pick, year)
// - Experience
// - Contract info (if available)
```

### 4.3 Player Stats Table Component
- [ ] Create `src/components/players/PlayerStatsTable.tsx`:
```tsx
// Career statistics table:
// - Season-by-season breakdown
// - Team
// - Games played
// - Sport-specific stats
// - Career totals row
// Sortable columns
```

### 4.4 Player Game Log Component
- [ ] Create `src/components/players/PlayerGameLog.tsx`:
```tsx
// Recent game performance:
// - Date
// - Opponent
// - Result
// - Individual stats for that game
// Expandable rows for details
```

### 4.5 Player Splits Component
- [ ] Create `src/components/players/PlayerSplits.tsx`:
```tsx
// Performance splits:
// - Home vs Away
// - vs Division
// - By month
// - Day vs Night (MLB)
// - vs Left/Right (MLB)
```

### 4.6 Player News Component
- [ ] Create `src/components/players/PlayerNews.tsx`:
```tsx
// Recent articles mentioning this player
// Search by player name in articles
// Display as compact list
```

### 4.7 Player Comparison Widget
- [ ] Create `src/components/players/PlayerComparison.tsx`:
```tsx
// Compare to other players:
// - Select another player
// - Side-by-side stats
// - Visual comparison chart
```

### 4.8 Player Social/Links Component
- [ ] Create `src/components/players/PlayerSocial.tsx`:
```tsx
// External links:
// - Twitter/X
// - Instagram
// - Official team page
// - Wikipedia
```

### 4.9 Similar Players Widget
- [ ] Create `src/components/players/SimilarPlayers.tsx`:
```tsx
// "You might also like" section
// Players at same position
// Or comparable stats
```

### 4.10 Player Card (Compact) Component
- [ ] Create `src/components/players/PlayerCardCompact.tsx`:
```tsx
// Smaller card for listings:
// - Small headshot
// - Name
// - Position
// - Team
// Used in search results, similar players, etc.
```

**Run notification, continue to Section 5**

---

## SECTION 5: Player Pages (10 tasks)

### 5.1 Create Player Profile Page
- [ ] Create `src/app/players/[playerId]/page.tsx`:
```tsx
// Main player page:
// - PlayerHeader
// - PlayerBio
// - Season stats summary
// - Recent game log (last 5)
// - News mentioning player
// - Similar players
```

### 5.2 Create Player Stats Page
- [ ] Create `src/app/players/[playerId]/stats/page.tsx`:
```tsx
// Detailed stats page:
// - Full career stats table
// - Season selector
// - Splits
// - Charts/visualizations
// - League rankings
```

### 5.3 Create Player Game Log Page
- [ ] Create `src/app/players/[playerId]/game-log/page.tsx`:
```tsx
// Full game log:
// - All games this season
// - Previous seasons selectable
// - Sortable/filterable
```

### 5.4 Create Player Layout
- [ ] Create `src/app/players/[playerId]/layout.tsx`:
```tsx
// Shared layout for player pages
// - PlayerHeader
// - Player navigation (Overview, Stats, Game Log)
// - Team context
```

### 5.5 Create Player Navigation
- [ ] Create `src/components/players/PlayerNav.tsx`:
```tsx
// Tab navigation:
// - Overview
// - Stats
// - Game Log
// - News
```

### 5.6 Add generateMetadata for Player Pages
- [ ] Add SEO metadata:
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const player = await getPlayer(params.playerId);
  return {
    title: `${player.name} Stats & News | ${player.team.shortName} | Sports Mockery`,
    description: `${player.name} statistics, game log, and latest news. ${player.position} for the ${player.team.name}.`,
  };
}
```

### 5.7 Create Players Search/Index Page
- [ ] Create `src/app/players/page.tsx`:
```tsx
// Player search page:
// - Search by name
// - Filter by team
// - Filter by position
// - Popular players section
```

### 5.8 Add Player Search Component
- [ ] Create `src/components/players/PlayerSearch.tsx`:
```tsx
// Autocomplete search:
// - Type to search
// - Show results dropdown
// - Player photos in results
// - Click to navigate
```

### 5.9 Link Players from Roster Page
- [ ] Update RosterTable to link player names to their pages:
```tsx
// Each player name links to /players/[playerId]
```

### 5.10 Link Players from Articles
- [ ] Create player mention detection (future enhancement):
```tsx
// Automatically link player names in articles
// Or add "Players mentioned" section to articles
```

**Run notification, continue to Section 6**

---

## SECTION 6: Polish & Integration (10 tasks)

### 6.1 Add Loading States
- [ ] Create loading.tsx for team pages
- [ ] Create loading.tsx for player pages
- [ ] Add skeleton components for data loading

### 6.2 Add Error States
- [ ] Create error.tsx for team pages
- [ ] Create not-found.tsx for invalid team slugs
- [ ] Create not-found.tsx for invalid player IDs

### 6.3 Add Team Logos
- [ ] Add SVG logos to `public/logos/`:
  - bears.svg
  - bulls.svg
  - cubs.svg
  - whitesox.svg
  - blackhawks.svg

### 6.4 Add Sport-Specific Stat Configs
- [ ] Create `src/lib/statConfigs.ts`:
```typescript
// Define which stats to show per sport
// NFL: passing yards, rushing yards, touchdowns, etc.
// MLB: batting avg, home runs, RBI, ERA, etc.
// NBA: points, rebounds, assists, etc.
// NHL: goals, assists, points, plus/minus, etc.
```

### 6.5 Add Team Color Theming
- [ ] Create dynamic team color CSS variables
- [ ] Apply team colors to headers, accents, links
- [ ] Ensure contrast/accessibility

### 6.6 Add Share Functionality
- [ ] Add share buttons to player pages
- [ ] Add share buttons to team pages

### 6.7 Add Print Styles
- [ ] Create print stylesheet for schedule
- [ ] Create print stylesheet for roster

### 6.8 Performance Optimization
- [ ] Add ISR (Incremental Static Regeneration) to team pages
- [ ] Cache API responses
- [ ] Optimize images

### 6.9 Mobile Responsiveness
- [ ] Test all team pages on mobile
- [ ] Test all player pages on mobile
- [ ] Fix any layout issues

### 6.10 Add Analytics Tracking
- [ ] Track team page views
- [ ] Track player page views
- [ ] Track feature usage (which tabs, etc.)

**Run notification - SESSION 5 COMPLETE!**

---

## 📋 COMPLETION CHECKLIST

When all sections are done:

- [ ] All 65 tasks completed
- [ ] Can navigate to /teams/chicago-bears
- [ ] Can view Bears schedule at /teams/chicago-bears/schedule
- [ ] Can view Bears roster at /teams/chicago-bears/roster
- [ ] Can view Bears stats at /teams/chicago-bears/stats
- [ ] Can view NFC North standings at /teams/chicago-bears/standings
- [ ] Can click player from roster to see player page
- [ ] All 5 Chicago teams work
- [ ] Mobile responsive
- [ ] Fast loading

```bash
osascript -e 'display notification "SESSION 5 COMPLETE! ESPN pages ready!" with title "Claude Code"' && afplay /System/Library/Sounds/Funk.aiff
```

---

## 🔗 URL Structure

After completion:

```
/teams                          → All Chicago teams
/teams/chicago-bears            → Bears overview
/teams/chicago-bears/schedule   → Bears schedule
/teams/chicago-bears/roster     → Bears roster
/teams/chicago-bears/stats      → Bears stats
/teams/chicago-bears/standings  → NFC North standings

/players                        → Player search
/players/caleb-williams         → Caleb Williams profile
/players/caleb-williams/stats   → Full career stats
/players/caleb-williams/game-log → Game-by-game log
```

---

## 📊 Data Sources (For Later)

When ready to connect real data:

1. **ESPN API** (unofficial) - Free, good for scores/schedules
2. **SportsData.io** - You have this plugin, ~$50/month
3. **SM Data Lab** - Your own database at datalab.sportsmockery.com
4. **Sports Reference** - Scraping for historical stats

For now, mock data is fine to build the UI.
