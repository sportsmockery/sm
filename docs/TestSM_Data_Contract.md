# test.sportsmockery.com Data Contract
> **Last Updated:** 2026-02-02
> **Authority:** SM Data Lab (datalab.sportsmockery.com)
> **Status:** MANDATORY - Do not deviate from this specification

---

## CRITICAL RULES

1. **SM Data Lab is the SINGLE SOURCE OF TRUTH** for all sports data
2. **test.sportsmockery.com READS ONLY** - never write to these tables
3. **All data sync is handled by SM Data Lab crons** - do not create competing sync jobs
4. **Do not calculate records yourself** - use the pre-calculated values in seasons tables
5. **Do not modify query patterns** without consulting SM Data Lab first

---

## Supabase Connection

```
Project ID: siwoqfzzcxmngnseyzpv
URL: https://siwoqfzzcxmngnseyzpv.supabase.co
```

Use the same Supabase project - SM Data Lab writes, test.sportsmockery.com reads.

---

## PART 1: TEAM PAGES

### Season Year Convention (CRITICAL)

| Sport | Convention | Current Season Value | Example |
|-------|------------|---------------------|---------|
| **NFL** | Starting year | `2025` | Sep 2025 - Feb 2026 = season 2025 |
| **NBA** | Ending year | `2026` | Oct 2025 - Jun 2026 = season 2026 |
| **NHL** | Ending year | `2026` | Oct 2025 - Jun 2026 = season 2026 |
| **MLB** | Calendar year | `2025` | Apr-Oct 2025 = season 2025 (offseason now) |

**DO NOT** calculate seasons yourself. Use these values.

---

### Current Verified Data (2026-02-02)

| Team | Season | Record | Games | Active Roster | Status |
|------|--------|--------|-------|---------------|--------|
| Bears | 2025 | 11-6 (reg) + 1-1 (playoff) | 19 | 81 | Eliminated |
| Bulls | 2026 | 24-26 | 50 | 17 | In Progress |
| Blackhawks | 2026 | 21-25-9 (51 pts) | 55 | 20 | In Progress |
| Cubs | 2025 | 92-70 | 162 | 40 | Offseason |
| White Sox | 2025 | 60-102 | 162 | 40 | Offseason |

---

### Team Records - EXACT QUERIES

#### Bears Record
```sql
SELECT season, regular_season_wins, regular_season_losses,
       postseason_wins, postseason_losses
FROM bears_season_record
WHERE season = 2025;
```
**DO NOT** query `bears_seasons` (doesn't exist) or calculate from games.

#### Bulls Record
```sql
SELECT season, wins, losses, games_played
FROM bulls_seasons
WHERE season = 2026;
```
**WARNING:** The `bulls_games_master` table contains future games with 0-0 scores. If you must query games directly, ALWAYS filter:
```sql
WHERE bulls_score > 0 OR opponent_score > 0
```

#### Blackhawks Record
```sql
SELECT season, wins, losses, otl, points, games_played
FROM blackhawks_seasons
WHERE season = 2026;
```
**Format:** W-L-OTL (e.g., 21-25-9)
**Points:** (wins × 2) + otl

#### Cubs Record
```sql
SELECT season, wins, losses
FROM cubs_seasons
WHERE season = 2025;
```

#### White Sox Record
```sql
SELECT season, wins, losses
FROM whitesox_seasons
WHERE season = 2025;
```

---

### Rosters - EXACT QUERIES

| Team | Table | Filter Column | Query |
|------|-------|---------------|-------|
| Bears | `bears_players` | `is_active = true` | `SELECT * FROM bears_players WHERE is_active = true` |
| Bulls | `bulls_players` | `is_current_bulls = true` | `SELECT * FROM bulls_players WHERE is_current_bulls = true` |
| Blackhawks | `blackhawks_players` | `is_active = true` | `SELECT * FROM blackhawks_players WHERE is_active = true` |
| Cubs | `cubs_players` | `is_active = true` | `SELECT * FROM cubs_players WHERE is_active = true` |
| White Sox | `whitesox_players` | `is_active = true` | `SELECT * FROM whitesox_players WHERE is_active = true` |

**DO NOT** use other filter columns. These are the authoritative active roster flags.

---

### Schedules/Games - EXACT QUERIES

| Team | Table | Key Columns |
|------|-------|-------------|
| Bears | `bears_games_master` | `game_id`, `game_date`, `opponent`, `bears_score`, `opponent_score`, `bears_win` |
| Bulls | `bulls_games_master` | `game_id`, `game_date`, `opponent`, `bulls_score`, `opponent_score`, `bulls_win` |
| Blackhawks | `blackhawks_games_master` | `game_id`, `game_date`, `opponent`, `blackhawks_score`, `opponent_score`, `blackhawks_win`, `is_overtime` |
| Cubs | `cubs_games_master` | `game_id`, `game_date`, `opponent`, `cubs_score`, `opponent_score`, `cubs_win` |
| White Sox | `whitesox_games_master` | `game_id`, `game_date`, `opponent`, `whitesox_score`, `opponent_score`, `whitesox_win` |

**Completed games:** `WHERE {team}_score > 0 OR opponent_score > 0`
**Upcoming games:** `WHERE {team}_score = 0 AND opponent_score = 0 AND game_date >= CURRENT_DATE`

---

### Player Stats - EXACT QUERIES

**CRITICAL JOIN PATTERN:** Player stats tables use ESPN IDs in the `player_id` column. Join on `espn_id`:

```sql
-- CORRECT
SELECT p.name, s.*
FROM {team}_players p
JOIN {team}_player_game_stats s ON p.espn_id = s.player_id
WHERE p.is_active = true;

-- WRONG (will return no data)
SELECT p.name, s.*
FROM {team}_players p
JOIN {team}_player_game_stats s ON p.player_id = s.player_id;
```

| Team | Players Table | Stats Table | Join Column |
|------|---------------|-------------|-------------|
| Bears | `bears_players` | `bears_player_game_stats` | `espn_id = player_id` |
| Bulls | `bulls_players` | `bulls_player_game_stats` | `espn_id = player_id` |
| Blackhawks | `blackhawks_players` | `blackhawks_player_game_stats` | `espn_id = player_id` |
| Cubs | `cubs_players` | `cubs_player_game_stats` | `espn_id = player_id` |
| White Sox | `whitesox_players` | `whitesox_player_game_stats` | `espn_id = player_id` |

---

### Team Season Stats

For Stats pages, use the pre-aggregated team stats tables:

| Team | Table | Key Stats |
|------|-------|-----------|
| Bears | `bears_team_season_stats` | PPG, total_points, passing_yards, rushing_yards |
| Bulls | `bulls_team_season_stats` | PPG, opp_PPG, fg_pct, three_pt_pct, rebounds, assists |
| Blackhawks | `blackhawks_team_season_stats` | goals_for, goals_against, pp_pct, pk_pct, shots |
| Cubs | `cubs_team_season_stats` | runs, batting_avg, obp, slg, era, whip |
| White Sox | `whitesox_team_season_stats` | runs, batting_avg, obp, slg, era, whip |

```sql
SELECT * FROM {team}_team_season_stats WHERE season = {current_season};
```

---

## PART 2: LIVE GAMES (10-SECOND UPDATES)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LIVE GAME DATA FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ESPN API ──(10 sec)──> SM Data Lab API ──(10 sec)──> test.sportsmockery.com
│                              │                               │
│                              ▼                               │
│                     Supabase Live Tables                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**CRITICAL:** The `/api/live` endpoint fetches FRESH data from ESPN every 10 seconds.
test.sportsmockery.com should poll this endpoint every 10 seconds during live games.

### RECOMMENDED: Use the Live API (10-second fresh data)

```
GET https://datalab.sportsmockery.com/api/live
GET https://datalab.sportsmockery.com/api/live/{gameId}
```

**Response includes:**
- All times in **Central Time** (Chicago timezone)
- `data_refreshed`: true if ESPN was just queried
- `cache_age_ms`: how old the cached data is
- `next_refresh_in_ms`: when the cache will refresh

### Your Cron Job for Live Games

```javascript
// test.sportsmockery.com should have this cron pattern:

const LIVE_POLL_INTERVAL = 10_000;    // 10 seconds during live games
const IDLE_POLL_INTERVAL = 60_000;    // 60 seconds when no live games

async function pollLiveGames() {
  const response = await fetch('https://datalab.sportsmockery.com/api/live');
  const data = await response.json();

  // Update your UI with the live data
  updateLiveScores(data.games);

  // Schedule next poll based on whether games are active
  const hasActiveGames = data.games.some(g => g.status === 'in_progress');
  const nextPoll = hasActiveGames ? LIVE_POLL_INTERVAL : IDLE_POLL_INTERVAL;

  setTimeout(pollLiveGames, nextPoll);
}

// Start polling
pollLiveGames();
```

### Live API Response Format

```json
{
  "success": true,
  "timestamp": "2026-02-02T14:30:00.000Z",
  "timestamp_central": "02/02/2026, 08:30:00",
  "games_count": 1,
  "games": [
    {
      "game_id": "401234567",
      "team_id": "bulls",
      "team_name": "Chicago Bulls",
      "sport": "nba",
      "status": "in_progress",
      "home_team": "CHI",
      "home_score": 52,
      "away_team": "MIL",
      "away_score": 48,
      "period": "3rd Quarter",
      "clock": "8:42",
      "game_date": "2026-02-02T19:00:00.000Z",
      "game_time_central": "02/02/2026, 13:00:00",
      "venue": "United Center",
      "last_updated": "2026-02-02T14:29:55.000Z",
      "last_updated_central": "02/02/2026, 08:29:55"
    }
  ],
  "data_refreshed": true,
  "cache_age_ms": 0,
  "duration_ms": 245,
  "poll_interval_recommended_ms": 10000,
  "next_refresh_in_ms": 10000
}
```

### Optional: Direct Supabase Queries

If you prefer direct database access (not recommended for live games):

```sql
-- Check for active games
SELECT game_id, team_id, sport, status
FROM live_games_registry
WHERE status = 'active'
  AND archived_at IS NULL;
```

### Live Game Tables (Read Only)

| Team | Live Games Table | Live Player Stats |
|------|------------------|-------------------|
| Bears | `bears_games_live` | `bears_player_stats_live` |
| Bulls | `bulls_games_live` | `bulls_player_stats_live` |
| Blackhawks | `blackhawks_games_live` | `blackhawks_player_stats_live` |
| Cubs | `cubs_games_live` | `cubs_player_stats_live` |
| White Sox | `whitesox_games_live` | `whitesox_player_stats_live` |

### Game Detail API (with player stats)

```
GET https://datalab.sportsmockery.com/api/live/{gameId}
```

Returns full game data plus all player stats for that game.

---

## PART 3: TRADE SIMULATOR (GM)

### Tables

| Table | Purpose | Access |
|-------|---------|--------|
| `gm_trades` | All submitted trades with grades | Read |
| `gm_trade_items` | Players/picks in each trade | Read |
| `gm_leaderboard` | User rankings | Read |
| `gm_sessions` | Trade scenario sessions | Read/Write |
| `gm_league_teams` | 124 NFL/NBA/NHL/MLB teams | Read |
| `gm_errors` | Error logging | Write |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/gm/grade` | POST | Submit trade for AI grading |
| `/api/gm/roster` | GET | Get team roster with stats |
| `/api/gm/teams` | GET | Get all 124 league teams |
| `/api/gm/trades` | GET | Get trade history |
| `/api/gm/leaderboard` | GET | Get rankings |
| `/api/gm/sessions` | GET/POST | Manage sessions |
| `/api/gm/share/{code}` | GET | Get shared trade |
| `/api/gm/errors` | POST | Report errors |

### Roster Query for Trade Simulator
```sql
-- Get Bulls roster for trade simulator
SELECT
  p.espn_id,
  p.name,
  p.position,
  p.jersey_number,
  p.headshot_url,
  p.age,
  p.height,
  p.weight,
  p.college,
  p.draft_info,
  p.years_exp,
  p.contract_years,
  p.cap_hit,
  p.is_rookie_deal
FROM bulls_players p
WHERE p.is_current_bulls = true
ORDER BY p.jersey_number;
```

### Error Reporting
```sql
INSERT INTO gm_errors (source, error_type, error_message, user_query, response_status)
VALUES ('frontend', 'ai', 'Error message here', 'trade details', 500);
```

---

## PART 4: SCOUT AI (Ask AI)

### API Endpoint
```
POST https://datalab.sportsmockery.com/api/query
Content-Type: application/json

{
  "query": "How many touchdowns did Caleb Williams have?",
  "sessionId": "optional-session-id-for-followups"
}
```

### Error Logging
```sql
INSERT INTO scout_errors (source, error_type, error_message, user_query, response_status, response_time_ms)
VALUES ('frontend', 'timeout', 'Request timed out', 'user question here', 408, 30000);
```

### Session Management
Sessions are managed by SM Data Lab. Pass `sessionId` for follow-up questions to maintain context.

---

## PART 5: MOCK DRAFT

### Tables

| Table | Purpose |
|-------|---------|
| `mock_draft_prospects` | Draft-eligible players |
| `mock_draft_picks` | Pick order and selections |
| `mock_draft_user_boards` | User's custom rankings |
| `mock_draft_trades` | Draft day trade scenarios |

### Current Draft Year
```sql
SELECT * FROM mock_draft_prospects WHERE draft_year = 2026;
```

---

## PART 6: DATA SYNC SCHEDULE

**SM Data Lab handles ALL data syncing. Do not create competing cron jobs.**

| Cron Job | Schedule | What It Updates |
|----------|----------|-----------------|
| sync-bears | Hourly | games, players, season record |
| sync-bulls | Hourly | games, players, season stats |
| sync-blackhawks | Hourly | games, players, season stats |
| sync-cubs | Hourly | games, players, season stats |
| sync-whitesox | Hourly | games, players, season stats |
| live-games | Every minute | Live scores during games |
| archive-games | Every minute | Move completed games to master |

### Your Cron Jobs (test.sportsmockery.com)

You should ONLY have crons for:
1. **Cache invalidation** - Clear your frontend cache after SM Data Lab updates
2. **Polling live games** - Check `live_games_registry` and adjust poll frequency
3. **Error reporting** - Send errors to `gm_errors` or `scout_errors`

**DO NOT** create crons that:
- Fetch from ESPN/NHL/MLB APIs directly
- Calculate team records
- Modify player rosters
- Update game scores

---

## PART 7: WHAT NOT TO DO

### NEVER Do These

| Action | Why It's Wrong |
|--------|---------------|
| Calculate records from games | Use pre-calculated values in `*_seasons` tables |
| Filter Bulls by `is_active` | Use `is_current_bulls` instead |
| Join stats on `player_id` | Use `espn_id = player_id` |
| Query `bears_seasons` | Table doesn't exist, use `bears_season_record` |
| Fetch from ESPN directly | SM Data Lab handles all external API calls |
| Store your own copy of data | Query Supabase directly |
| Create new tables | All schema changes go through SM Data Lab |
| Write to `*_games_master` tables | Read only |
| Write to `*_players` tables | Read only |
| Write to `*_seasons` tables | Read only |

---

## PART 8: TROUBLESHOOTING

### Wrong Record Showing?

1. Check you're using correct season value (see convention table above)
2. Check you're querying the correct table (e.g., `bears_season_record` not `bears_seasons`)
3. Report to SM Data Lab if data appears incorrect

### No Players Showing?

1. Check filter column (Bulls uses `is_current_bulls`, others use `is_active`)
2. Verify season value if filtering by season

### Player Stats Empty?

1. Check join pattern - use `espn_id = player_id`
2. Verify game_id format matches between tables

### Live Scores Not Updating?

1. Check `live_games_registry` for active games
2. Ensure polling at 10-second intervals during live games
3. Check `live_games_registry.status = 'active'`

---

## PART 9: CONTACT & ESCALATION

**Data Issues:** Report via `gm_errors` or `scout_errors` tables

**Schema Changes:** Must be approved by SM Data Lab before implementation

**New Feature Requests:** Coordinate with SM Data Lab for new tables/columns

---

## APPENDIX: Quick Reference

### Current Season Values (as of 2026-02-02)
```javascript
const CURRENT_SEASONS = {
  bears: 2025,      // NFL uses starting year
  bulls: 2026,      // NBA uses ending year
  blackhawks: 2026, // NHL uses ending year
  cubs: 2025,       // MLB (offseason)
  whitesox: 2025    // MLB (offseason)
};
```

### Roster Filter Columns
```javascript
const ROSTER_FILTERS = {
  bears: 'is_active',
  bulls: 'is_current_bulls',  // DIFFERENT!
  blackhawks: 'is_active',
  cubs: 'is_active',
  whitesox: 'is_active'
};
```

### Tables Quick Reference
```javascript
const TABLES = {
  bears: {
    games: 'bears_games_master',
    players: 'bears_players',
    stats: 'bears_player_game_stats',
    season: 'bears_season_record',  // NOT bears_seasons!
    live: 'bears_games_live'
  },
  bulls: {
    games: 'bulls_games_master',
    players: 'bulls_players',
    stats: 'bulls_player_game_stats',
    season: 'bulls_seasons',
    live: 'bulls_games_live'
  },
  blackhawks: {
    games: 'blackhawks_games_master',
    players: 'blackhawks_players',
    stats: 'blackhawks_player_game_stats',
    season: 'blackhawks_seasons',
    live: 'blackhawks_games_live'
  },
  cubs: {
    games: 'cubs_games_master',
    players: 'cubs_players',
    stats: 'cubs_player_game_stats',
    season: 'cubs_seasons',
    live: 'cubs_games_live'
  },
  whitesox: {
    games: 'whitesox_games_master',
    players: 'whitesox_players',
    stats: 'whitesox_player_game_stats',
    season: 'whitesox_seasons',
    live: 'whitesox_games_live'
  }
};
```

---

*This document is the authoritative source for test.sportsmockery.com data integration. Do not deviate without explicit approval from SM Data Lab.*
