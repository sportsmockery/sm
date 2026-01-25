# Team Pages Data Query Specification

> **Last Updated:** 2026-01-25
> **Purpose:** Definitive reference for SportsMockery team page data requirements
> **Audience:** Datalab maintainers, SM developers, Claude Code
> **Authoritative Datalab Doc:** `/sm-data-lab/docs/SportsMockery_Integration_Guide.md`

---

## Overview

SportsMockery displays team hub pages for 5 Chicago teams, each pulling data from Datalab Supabase tables. This document specifies exactly what data is needed, how it's queried, and protocols to prevent data mismatches.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SPORTSMOCKERY FRONTEND                          │
│  src/app/chicago-{team}/...                                             │
│                    ↓                                                    │
│  src/lib/{team}Data.ts (Data Layer)                                     │
│                    ↓                                                    │
│  src/lib/supabase-datalab.ts (Connection)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATALAB (Supabase)                              │
│  {team}_players, {team}_games_master, {team}_player_game_stats, etc.   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Team-Specific Requirements

### 1. CHICAGO BEARS (NFL)

**Data Layer:** `src/lib/bearsData.ts`

#### Tables Required

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `bears_players` | Roster data | `id`, `player_id`, `name`, `position`, `jersey_number`, `is_active`, `headshot_url` |
| `bears_games_master` | Schedule/scores | `id`, `game_date`, `opponent`, `bears_score`, `opponent_score`, `bears_win`, `week`, `season`, `game_type`, `broadcast` |
| `bears_player_game_stats` | Player stats | `player_id`, `bears_game_id`, `season`, `passing_*`, `rushing_*`, `receiving_*`, `def_*` |
| `bears_season_record` | Season record | `regular_season_wins`, `regular_season_losses`, `postseason_wins`, `postseason_losses`, `division_rank` |
| `bears_team_season_stats` | Team stats | `season`, `total_points`, `points_per_game` |

#### Roster Filter Query
```sql
SELECT * FROM bears_players
WHERE is_active = true
ORDER BY position_group, name;
```
**Expected:** 53+ players (active NFL roster)

#### Record Query Logic
- Regular season: Count games where `game_type = 'regular'` AND `status = 'final'`
- Postseason: Count games where `game_type = 'postseason'` AND `status = 'final'`
- Combined record: `regular_wins + postseason_wins` - `regular_losses + postseason_losses`

#### Season Determination
- NFL season stored as starting year (e.g., 2025 for 2025-26 season)
- Before September: Use `year - 1`
- September or later: Use `year`

---

### 2. CHICAGO BULLS (NBA)

**Data Layer:** `src/lib/bullsData.ts`

#### Tables Required

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `bulls_players` | Roster data | `id`, `player_id`, `name`, `position`, `jersey_number`, `is_current_bulls`, `headshot_url` |
| `bulls_games_master` | Schedule/scores | `id`, `game_date`, `opponent`, `bulls_score`, `opponent_score`, `bulls_win`, `season`, `game_type`, `broadcast` |
| `bulls_player_game_stats` | Player stats | `player_id`, `game_id`, `season`, `points`, `total_rebounds`, `assists`, `steals`, `blocks` |
| `bulls_team_season_stats` | Team stats | `season`, `rebounds_per_game`, `assists_per_game`, `fg_pct` |

#### Roster Filter Query
```sql
SELECT * FROM bulls_players
WHERE is_current_bulls = true
ORDER BY position, name;
```
**Expected:** 15-17 players (NBA roster limit is 15 active + 2 two-way)

#### Record Query Logic
- Count games where `(bulls_score > 0 OR opponent_score > 0)` for completed games
- Wins: `bulls_win = true`
- Losses: `bulls_win = false`

#### Season Determination
- NBA season stored as starting year (e.g., 2025 for 2025-26 season)
- Before October: Use `year - 1`
- October or later: Use `year`

#### Full Season Verification
- Regular season: 82 games
- Record at end of 2025 season should be wins + losses = 82

---

### 3. CHICAGO CUBS (MLB)

**Data Layer:** `src/lib/cubsData.ts`

#### Tables Required

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `cubs_players` | Roster data | `id`, `player_id`, `name`, `position`, `jersey_number`, `is_active`, `data_status`, `bats`, `throws`, `headshot_url` |
| `cubs_games_master` | Schedule/scores | `id`, `game_date`, `opponent`, `cubs_score`, `opponent_score`, `cubs_win`, `season`, `game_type`, `broadcast`, `innings` |
| `cubs_player_game_stats` | Player stats | `player_id`, `game_id`, `season`, batting and pitching stats |
| `cubs_team_season_stats` | Team stats | `season`, `team_avg`, `team_era`, `team_ops` |

#### Roster Filter Query
```sql
SELECT * FROM cubs_players
WHERE is_active = true
  AND data_status != 'needs_roster_review'
ORDER BY position, name;
```
**Expected:** 26-40 players (MLB active roster 26, 40-man roster)

#### Schedule Filter
- Filter out spring training: `game_date >= '{season}-03-18'`
- MLB regular season starts late March

#### Season Determination
- MLB season stored as the actual year
- Before April: Use `year - 1`
- April or later: Use `year`

---

### 4. CHICAGO WHITE SOX (MLB)

**Data Layer:** `src/lib/whitesoxData.ts`

#### Tables Required

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `whitesox_players` | Roster data | Same as Cubs |
| `whitesox_games_master` | Schedule/scores | `whitesox_score`, `opponent_score`, `whitesox_win`, etc. |
| `whitesox_player_game_stats` | Player stats | Same structure as Cubs |
| `whitesox_team_season_stats` | Team stats | Same structure as Cubs |

#### Roster Filter Query
```sql
SELECT * FROM whitesox_players
WHERE is_active = true
  AND data_status != 'needs_roster_review'
ORDER BY position, name;
```
**Expected:** 26-40 players

---

### 5. CHICAGO BLACKHAWKS (NHL)

**Data Layer:** `src/lib/blackhawksData.ts`

#### Tables Required

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `blackhawks_players` | Roster data | `id`, `player_id`, `name`, `position`, `jersey_number`, `is_active`, `birth_country`, `headshot_url` |
| `blackhawks_games_master` | Schedule/scores | `id`, `game_date`, `opponent`, `blackhawks_score`, `opponent_score`, `blackhawks_win`, `season`, `season_start_year`, `is_overtime`, `is_shootout`, `broadcast` |
| `blackhawks_schedule_all` | Schedule view | Alternative canonical view for schedule |
| `blackhawks_player_game_stats` | Player stats | `player_id`, `game_id`, `season`, `goals`, `assists`, `points`, `plus_minus`, `saves`, `goals_against` |
| `blackhawks_team_season_stats` | Team stats | `season`, `pp_pct`, `pk_pct` |

#### Roster Filter Query
```sql
SELECT * FROM blackhawks_players
WHERE is_active = true
ORDER BY position, name;
```
**Expected:** 20-23 players (NHL active roster)

#### Record Query Logic (NHL has OT losses)
- Wins: `blackhawks_win = true`
- Regulation Losses: `blackhawks_win = false AND is_overtime = false AND is_shootout = false`
- OT Losses: `blackhawks_win = false AND (is_overtime = true OR is_shootout = true)`
- Points: `wins * 2 + otLosses`

#### Season Determination
- NHL season stored as `season_start_year` (e.g., 2025 for 2025-26 season)
- Before October: Use `year - 1`
- October or later: Use `year`

#### Full Season Verification
- Regular season: 82 games
- Record at end of season: wins + losses + otLosses = 82

---

## Critical Data Requirements

### For All Teams

#### Players Table Must Have:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | integer | Yes | Internal ID, used for stats joins |
| `player_id` | string | Yes | External ID (ESPN) |
| `name` or `full_name` | string | Yes | Display name |
| `position` | string | Yes | Position code |
| `jersey_number` | integer | No | For sorting and display |
| `is_active` | boolean | Yes | **CRITICAL:** Filter for current roster |
| `headshot_url` | string | No | Player photo |

#### Games Master Table Must Have:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | integer | Yes | Game ID |
| `game_date` | date | Yes | ISO format (YYYY-MM-DD) |
| `season` | integer | Yes | Season year |
| `opponent` | string | Yes | Opponent team abbreviation |
| `{team}_score` | integer | Yes | Team's score (null if not played) |
| `opponent_score` | integer | Yes | Opponent score (null if not played) |
| `{team}_win` | boolean | Yes | Win flag (null if not played) |
| `game_type` | string | Yes | 'regular', 'postseason', 'preseason' |
| `broadcast` | string | No | TV network |

---

## Season-Specific Expected Values

### 2025-26 Season Verification Targets

| Team | Expected Record | Expected Roster Size | Games Played |
|------|-----------------|----------------------|--------------|
| Bears | Varies by week (NFL: 17 reg + playoffs) | 53+ active | Up to 20 |
| Bulls | Varies (NBA: 82 game season) | 15-17 | Up to 82 |
| Cubs | Varies (MLB: 162 game season) | 26-40 active | Up to 162 |
| White Sox | Varies (MLB: 162 game season) | 26-40 active | Up to 162 |
| Blackhawks | Varies (NHL: 82 game season) | 20-23 | Up to 82 |

---

## Error Prevention Protocol

### DATALAB Responsibilities

1. **Data Validation on Ingest**
   - Verify `is_active` flag is set correctly
   - Validate season year matches expected value
   - Check score columns are populated for completed games
   - Ensure `game_type` is properly categorized

2. **Data Freshness**
   - Games: Update within 1 hour of completion
   - Rosters: Update within 24 hours of transactions
   - Stats: Update with game results

3. **Schema Consistency**
   - Use consistent column naming across all team tables
   - Document any schema changes before deployment
   - Never rename columns without coordinating with SM

4. **Verification Queries**
   Run these after each data update:

   ```sql
   -- Verify roster count for each team
   SELECT COUNT(*) as active_players
   FROM {team}_players
   WHERE is_active = true;

   -- Verify completed games count
   SELECT COUNT(*) as completed_games
   FROM {team}_games_master
   WHERE {team}_score IS NOT NULL
     AND season = {current_season};

   -- Verify win/loss calculation
   SELECT
     COUNT(*) FILTER (WHERE {team}_win = true) as wins,
     COUNT(*) FILTER (WHERE {team}_win = false) as losses
   FROM {team}_games_master
   WHERE {team}_score IS NOT NULL
     AND season = {current_season};
   ```

### SPORTSMOCKERY Responsibilities

1. **Defensive Coding**
   - Always use `select('*')` when column list may change
   - Handle null scores gracefully (game not yet played)
   - Fall back to previous season if current season is empty

2. **Season Calculation**
   - Use sport-specific logic for determining current season
   - Account for off-season periods

3. **Logging**
   - Log record calculations during builds for verification
   - Include data source in error messages

4. **No Hardcoded Values**
   - Never hardcode records, roster sizes, or stats
   - Always query from Datalab

---

## Troubleshooting Checklist

### Record Shows 0-0

1. Check `{team}_games_master` has games for current season
2. Verify score columns are populated (not null)
3. Confirm `{team}_win` boolean is set
4. Check season year matches expected value

### Wrong Roster Count

1. Verify `is_active = true` filter is correct
2. Check for stale `data_status` flags
3. Confirm recent transactions are reflected

### Missing Player Stats

1. Verify `player_id` in stats table matches `id` in players table
2. Check season filter matches current season
3. Confirm stats were imported after game completion

### Schedule Shows No Games

1. Check `game_date` range filter
2. Verify `game_type` filter isn't excluding valid games
3. Confirm season/season_start_year column name

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial documentation | Claude Code |

---

## Contacts

- **Datalab Issues:** Check datalab.sportsmockery.com admin
- **SM Frontend Issues:** Review data layer files in `src/lib/`
- **Data Sync Issues:** Compare Datalab tables with SM display
