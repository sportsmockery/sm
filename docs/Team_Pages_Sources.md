# Team Pages Data Sources

> **Last Updated:** January 23, 2026

All team page data is sourced from **DataLab Supabase** (`datalabAdmin` client).

## Data Layer Files

Each team has a dedicated data layer file in `/src/lib/`:

| Team | Data File | Record Function |
|------|-----------|-----------------|
| Bears | `bearsData.ts` | `getBearsSeparatedRecord()` |
| Bulls | `bullsData.ts` | `getBullsRecord()` |
| Cubs | `cubsData.ts` | `getCubsRecord()` |
| White Sox | `whitesoxData.ts` | `getWhiteSoxRecord()` |
| Blackhawks | `blackhawksData.ts` | `getBlackhawksRecord()` |

## Record Interfaces

### NFL (Bears)
```typescript
interface BearsSeparatedRecord {
  regularSeason: { wins: number; losses: number; ties: number }
  postseason: { wins: number; losses: number }
  divisionRank: string | null
}
```

### NBA (Bulls)
```typescript
interface BullsRecord {
  wins: number
  losses: number
  streak: string | null
  divisionRank: string | null
}
```

### MLB (Cubs, White Sox)
```typescript
interface CubsRecord {
  wins: number
  losses: number
}

interface WhiteSoxRecord {
  wins: number
  losses: number
}
```

### NHL (Blackhawks)
```typescript
interface BlackhawksRecord {
  wins: number
  losses: number
  otLosses: number  // NHL-specific overtime losses
  streak: string | null
}
```

## Page Structure

Each team has the following pages under `/src/app/chicago-{team}/`:

| Page | Data Functions Used |
|------|---------------------|
| `schedule/page.tsx` | `get{Team}Schedule()`, `get{Team}Record()` |
| `scores/page.tsx` | `get{Team}RecentScores()`, `get{Team}Record()` |
| `stats/page.tsx` | `get{Team}Stats()`, `get{Team}Record()` |
| `roster/page.tsx` | `get{Team}RosterGrouped()`, `get{Team}Record()` |
| `players/page.tsx` | `get{Team}Players()`, `get{Team}Record()` |
| `players/[slug]/page.tsx` | `get{Team}PlayerProfile()` |

## DataLab Supabase Tables

| Team | Games Table | Players Table |
|------|-------------|---------------|
| Bears | `bears_games_master` | `bears_roster_master` |
| Bulls | `bulls_games_master` | `bulls_roster_master` |
| Cubs | `cubs_games_master` | `cubs_roster_master` |
| White Sox | `whitesox_games_master` | `whitesox_roster_master` |
| Blackhawks | `blackhawks_games_master` | `blackhawks_roster_master` |

## Important Notes

1. **Never use `fetchTeamRecord()` from `team-config.ts`** - Use the team-specific record functions instead
2. **All records are calculated from game data** - Wins/losses are counted from completed games in the schedule
3. **Season detection varies by league:**
   - NFL/NHL/NBA: Season year is the starting year (e.g., 2025-26 = 2025)
   - MLB: Season year is the calendar year
4. **Players pages show full grid** - Not a redirect to first player
