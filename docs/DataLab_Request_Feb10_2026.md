# DataLab Request: Comprehensive Data Issues (February 10, 2026)

## Data Lab Request

**From:** Claude Code (SM Frontend)
**Date:** February 10, 2026
**Test Run:** 2026-02-10T08:15:07Z - 2026-02-10T08:16:19Z
**Test Summary:** 209 PASS | 8 FAIL | 30 WARN | 280 total checks
**DataLab Instance:** `siwoqfzzcxmngnseyzpv.supabase.co`

---

## Table of Contents

1. [CRITICAL Priority Issues](#critical-priority-issues)
   - 1.1 Bulls 0-0 Score Games
   - 1.2 Blackhawks 0-0 Score Games
   - 1.3 Cubs `game_time` 100% Missing
   - 1.4 White Sox `game_time` 100% Missing
   - 1.5 Cubs `opponent_full_name` 100% Missing
   - 1.6 White Sox `opponent_full_name` 100% Missing
   - 1.7 White Sox ESPN ID Mapping Broken (33%)
   - 1.8 `scout_query_history` Table Missing
2. [MODERATE Priority Issues](#moderate-priority-issues)
   - 2.1 College Data Missing Across 4 Teams
   - 2.2 Blackhawks Roster Inflated (37 vs Expected 20-25)
   - 2.3 Blackhawks Player Profile Data Missing (17/37)
   - 2.4 Bulls Team Stats Null Columns
   - 2.5 Cubs/White Sox Team Stats Null Columns
3. [LOW Priority / Informational](#low-priority--informational)
   - 3.1 Bulls Height Data Missing (18/18)
   - 3.2 Bulls/Blackhawks Integrity Check Failures
   - 3.3 Minor Missing Fields Across Teams

---

## CRITICAL Priority Issues

These issues directly affect the user-facing experience on team pages. Games display with 0-0 scores, schedules have no times, and player stats fail to load.

---

### 1.1 Bulls 0-0 Score Games

**Priority:** CRITICAL
**Table:** `bulls_games_master`
**Season:** 2026 (NBA ending-year convention)

#### Issue Summary
29 out of 83 completed Bulls games have `bulls_score = 0` and `opponent_score = 0`. These are completed games (not future/scheduled) that are missing actual final scores.

#### Current State
```sql
SELECT COUNT(*) FROM bulls_games_master
WHERE season = 2026
  AND bulls_score = 0
  AND opponent_score = 0;
-- Returns: 29
```

Total completed games: 83. Games with valid scores: 54. Games with 0-0: **29 (35%)**.

#### Expected State
All 83 completed games should have actual final scores populated in `bulls_score` and `opponent_score`.

#### Verification
- ESPN: https://www.espn.com/nba/team/schedule/_/name/chi/season/2026

#### Requested Action
1. Identify the 29 games with 0-0 scores in `bulls_games_master` WHERE `season = 2026 AND bulls_score = 0 AND opponent_score = 0`
2. Backfill actual final scores from ESPN for all 29 games
3. Update `bulls_win`, `point_diff`, and `total_points` columns accordingly
4. Verify `quarter_scores` JSONB is also populated if available

---

### 1.2 Blackhawks 0-0 Score Games

**Priority:** CRITICAL
**Table:** `blackhawks_games_master`
**Season:** 2026 (NHL ending-year convention)

#### Issue Summary
25 out of 82 completed Blackhawks games have `blackhawks_score = 0` and `opponent_score = 0`. Same issue as Bulls above.

#### Current State
```sql
SELECT COUNT(*) FROM blackhawks_games_master
WHERE season = 2026
  AND blackhawks_score = 0
  AND opponent_score = 0;
-- Returns: 25
```

Total completed games: 82. Games with valid scores: 57. Games with 0-0: **25 (30%)**.

#### Expected State
All 82 completed games should have actual final scores.

#### Verification
- ESPN: https://www.espn.com/nhl/team/schedule/_/name/chi/season/2026

#### Requested Action
1. Identify the 25 games with 0-0 scores in `blackhawks_games_master` WHERE `season = 2026 AND blackhawks_score = 0 AND opponent_score = 0`
2. Backfill actual final scores from ESPN for all 25 games
3. Update `blackhawks_win`, `goal_differential`, `home_score`, `away_score` columns
4. Update period scores (`period_1_blackhawks`, `period_1_opponent`, etc.) if available
5. Verify `is_overtime` and `is_shootout` flags are correct for affected games

---

### 1.3 Cubs `game_time` 100% Missing

**Priority:** CRITICAL
**Table:** `cubs_games_master`
**Column:** `game_time`
**Season:** 2025 (MLB calendar-year convention)

#### Issue Summary
All 171 Cubs games have `game_time = NULL`. The column exists but has never been populated.

#### Current State
```sql
SELECT COUNT(*) FROM cubs_games_master
WHERE season = 2025 AND game_time IS NULL;
-- Returns: 171 (100% of games)
```

#### Expected State
All 171 games should have `game_time` populated (e.g., `'1:20 PM ET'`, `'7:05 PM ET'`).

#### Verification
- ESPN: https://www.espn.com/mlb/team/schedule/_/name/chc/season/2025

#### Requested Action
1. Backfill `game_time` for all 171 games in `cubs_games_master` WHERE `season = 2025`
2. Use consistent time format (recommend `HH:MM AM/PM ET` or ISO time string)

---

### 1.4 White Sox `game_time` 100% Missing

**Priority:** CRITICAL
**Table:** `whitesox_games_master`
**Column:** `game_time`
**Season:** 2025 (MLB calendar-year convention)

#### Issue Summary
All 162 White Sox games have `game_time = NULL`. Same issue as Cubs.

#### Current State
```sql
SELECT COUNT(*) FROM whitesox_games_master
WHERE season = 2025 AND game_time IS NULL;
-- Returns: 162 (100% of games)
```

#### Verification
- ESPN: https://www.espn.com/mlb/team/schedule/_/name/chw/season/2025

#### Requested Action
1. Backfill `game_time` for all 162 games in `whitesox_games_master` WHERE `season = 2025`
2. Use same time format as Cubs for consistency

---

### 1.5 Cubs `opponent_full_name` 100% Missing

**Priority:** CRITICAL
**Table:** `cubs_games_master`
**Column:** `opponent_full_name`
**Season:** 2025

#### Issue Summary
All 171 Cubs games have `opponent_full_name = NULL`. The `opponent` column has abbreviations (e.g., `'STL'`, `'MIL'`), but the full name column (e.g., `'St. Louis Cardinals'`, `'Milwaukee Brewers'`) is empty.

#### Current State
```sql
SELECT opponent, opponent_full_name FROM cubs_games_master
WHERE season = 2025 LIMIT 5;
-- opponent has values like 'STL', 'MIL', etc.
-- opponent_full_name is NULL for all 171 rows
```

#### Requested Action
1. Populate `opponent_full_name` for all 171 games in `cubs_games_master` WHERE `season = 2025`
2. Map abbreviations to full team names (e.g., `'STL'` -> `'St. Louis Cardinals'`)

---

### 1.6 White Sox `opponent_full_name` 100% Missing

**Priority:** CRITICAL
**Table:** `whitesox_games_master`
**Column:** `opponent_full_name`
**Season:** 2025

#### Issue Summary
All 162 White Sox games have `opponent_full_name = NULL`. Same issue as Cubs.

#### Current State
```sql
SELECT opponent, opponent_full_name FROM whitesox_games_master
WHERE season = 2025 LIMIT 5;
-- opponent has abbreviation values, opponent_full_name is NULL for all 162 rows
```

#### Requested Action
1. Populate `opponent_full_name` for all 162 games in `whitesox_games_master` WHERE `season = 2025`
2. Use same naming convention as other teams (Bears and Bulls have this populated)

---

### 1.7 White Sox ESPN ID Mapping Broken (33%)

**Priority:** CRITICAL
**Table:** `whitesox_players` + `whitesox_player_game_stats`
**Season:** 2025

#### Issue Summary
Only 13 out of 39 active White Sox players (33%) have ESPN IDs that match `player_id` values in `whitesox_player_game_stats`. This means 67% of active players show "No stats recorded" on their player profile pages.

#### Current State
```sql
-- Active players with espn_id
SELECT COUNT(*) FROM whitesox_players WHERE is_active = true AND espn_id IS NOT NULL;
-- Returns: 40 (39 used in mapping test, 1 may lack stats expectation)

-- Cross-reference: how many active player espn_ids exist in stats?
SELECT COUNT(DISTINCT wp.espn_id)
FROM whitesox_players wp
JOIN whitesox_player_game_stats wpgs ON wp.espn_id::text = wpgs.player_id::text
WHERE wp.is_active = true AND wpgs.season = 2025;
-- Returns: ~13
```

**Comparison with other MLB team:**
- Cubs: 22/40 active players (55%) have matching stats
- White Sox: 13/39 active players (33%) have matching stats

#### Expected State
At least 80%+ of active players should have matching stats via ESPN ID join.

#### Possible Causes
1. `espn_id` values in `whitesox_players` may be stale or incorrect
2. `player_id` values in `whitesox_player_game_stats` may use a different ID format
3. Offseason roster changes may have introduced new players whose ESPN IDs don't match stats from the 2025 season

#### Requested Action
1. Audit `whitesox_players.espn_id` values against ESPN's current roster: https://www.espn.com/mlb/team/roster/_/name/chw
2. Audit `whitesox_player_game_stats.player_id` values to confirm they are ESPN IDs
3. Fix any mismatched IDs so the join `wp.espn_id = wpgs.player_id` works correctly
4. Report which players remain unmatched (new acquisitions with no 2025 stats are acceptable)

---

### 1.8 `scout_query_history` Table Missing

**Priority:** CRITICAL
**Table:** `scout_query_history` (does not exist)

#### Issue Summary
The `scout_query_history` table referenced in CLAUDE.md and the Scout AI query history feature does not exist in the DataLab Supabase instance.

#### Current State
```
Error: Could not find the table 'public.scout_query_history' in the schema cache
```

#### Expected State
Per CLAUDE.md and `supabase/migrations/20260125_scout_query_history.sql`, this table should exist for storing logged-in user query history with 30-day retention.

#### Schema (from CLAUDE.md)
```sql
CREATE TABLE scout_query_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  response TEXT,
  session_id TEXT,
  session_context JSONB,
  response_time_ms INTEGER
);
```

#### Requested Action
**One of the following:**
1. **If this table belongs in DataLab Supabase:** Create it using the schema above, plus add an index on `(user_id, created_at)` for the cleanup cron job
2. **If this table belongs in the main SM Supabase:** Confirm this so we can update the frontend code to use the correct Supabase client. Currently the route tester checks DataLab and it's not there.

---

## MODERATE Priority Issues

These issues affect data completeness but do not break core page functionality.

---

### 2.1 College Data Missing Across 4 Teams

**Priority:** MODERATE
**Tables:** `bulls_players`, `blackhawks_players`, `cubs_players`, `whitesox_players`

#### Issue Summary
The `college` column is missing for a significant percentage of active players across multiple teams.

| Team | Table | Missing | Total Active | % Missing |
|------|-------|---------|--------------|-----------|
| Bears | `bears_players` | 4 | 79 | 5% |
| **Bulls** | `bulls_players` | **12** | **18** | **67%** |
| **Blackhawks** | `blackhawks_players` | **36** | **37** | **97%** |
| **Cubs** | `cubs_players` | **24** | **40** | **60%** |
| **White Sox** | `whitesox_players` | **25** | **40** | **63%** |

Bears is in good shape (only 5% missing). The other four teams need attention.

#### Verification
- Bulls: https://www.espn.com/nba/team/roster/_/name/chi
- Blackhawks: https://www.espn.com/nhl/team/roster/_/name/chi
- Cubs: https://www.espn.com/mlb/team/roster/_/name/chc
- White Sox: https://www.espn.com/mlb/team/roster/_/name/chw

#### Requested Action
1. Backfill `college` for all active players across Bulls, Blackhawks, Cubs, and White Sox
2. For NHL/MLB players who didn't attend college, use their junior/minor league team or set to `'N/A'` rather than NULL (so we can distinguish "no college" from "data missing")
3. **Blackhawks is most urgent** at 97% missing (36/37 players)

```sql
-- Example: find Blackhawks players missing college
SELECT name, position, espn_id FROM blackhawks_players
WHERE is_active = true AND (college IS NULL OR college = '')
ORDER BY name;
```

---

### 2.2 Blackhawks Roster Inflated (37 Active vs Expected 20-25)

**Priority:** MODERATE
**Table:** `blackhawks_players`
**Column:** `is_active`

#### Issue Summary
37 players are marked `is_active = true`, but an NHL active roster is typically 20-25 players. This suggests players who have been sent down, traded, or placed on IR are still marked as active.

#### Current State
```sql
SELECT COUNT(*) FROM blackhawks_players WHERE is_active = true;
-- Returns: 37 (expected: 20-25)
```

#### Verification
- ESPN: https://www.espn.com/nhl/team/roster/_/name/chi (should show ~23 players)

#### Requested Action
1. Cross-reference active roster with ESPN's current Blackhawks roster
2. Set `is_active = false` for players no longer on the active NHL roster (AHL call-downs, trades, IR, etc.)
3. Target: 20-25 active players matching ESPN's current roster page

---

### 2.3 Blackhawks Player Profile Data Missing (17/37 Players)

**Priority:** MODERATE
**Table:** `blackhawks_players`
**Columns:** `headshot_url`, `height_inches`, `weight_lbs`, `age`

#### Issue Summary
17 out of 37 active Blackhawks players are missing `headshot_url`, `height_inches`, `weight_lbs`, and `age` simultaneously. These are likely the same 17 "extra" players from the inflated roster issue (2.2), but even if roster is trimmed, any remaining active players need complete profiles.

| Field | Missing Count | Total Active |
|-------|--------------|--------------|
| `headshot_url` | 17 | 37 |
| `height_inches` | 17 | 37 |
| `weight_lbs` | 17 | 37 |
| `age` | 17 | 37 |

#### Requested Action
1. If these 17 players remain active after roster cleanup (2.2), backfill their profile data from ESPN
2. All active players must have: `headshot_url`, `height_inches`, `weight_lbs`, `age`, and `birth_date`

```sql
-- Find players missing profile data
SELECT name, position, espn_id, headshot_url, height_inches, weight_lbs, age
FROM blackhawks_players
WHERE is_active = true AND (headshot_url IS NULL OR height_inches IS NULL)
ORDER BY name;
```

---

### 2.4 Bulls Team Stats Null Columns

**Priority:** MODERATE
**Table:** `bulls_team_season_stats`
**Season:** 2026

#### Issue Summary
4 out of 24 columns in `bulls_team_season_stats` are NULL:

| Column | Current Value | Expected |
|--------|--------------|----------|
| `pace` | NULL | ~99.5 (league average ~99) |
| `offensive_rating` | NULL | ~110-115 |
| `defensive_rating` | NULL | ~112-117 |
| `net_rating` | NULL | Calculated (off - def) |

These are advanced team stats that are available from ESPN and NBA.com.

#### Verification
- ESPN: https://www.espn.com/nba/team/stats/_/name/chi/season/2026
- NBA.com: https://www.nba.com/stats/team/1610612741/advanced

#### Requested Action
1. Populate `pace`, `offensive_rating`, `defensive_rating`, `net_rating` in `bulls_team_season_stats` for `season = 2026`
2. Source from ESPN or NBA.com advanced stats page

---

### 2.5 Cubs/White Sox Team Stats Null Columns

**Priority:** MODERATE
**Tables:** `cubs_team_season_stats`, `whitesox_team_season_stats`
**Season:** 2025

#### Issue Summary
Both MLB team stats tables are missing the same 4 columns:

| Column | Cubs Value | White Sox Value | Expected |
|--------|-----------|----------------|----------|
| `quality_starts` | NULL | NULL | Integer (e.g., 80-100) |
| `saves` | NULL | NULL | Integer (e.g., 30-50) |
| `errors` | NULL | NULL | Integer (e.g., 60-100) |
| `fielding_pct` | NULL | NULL | Decimal (e.g., 0.983) |

#### Verification
- Cubs: https://www.espn.com/mlb/team/stats/_/name/chc/season/2025
- White Sox: https://www.espn.com/mlb/team/stats/_/name/chw/season/2025

#### Requested Action
1. Populate `quality_starts`, `saves`, `errors`, `fielding_pct` for both teams:

```sql
-- Cubs
UPDATE cubs_team_season_stats
SET quality_starts = [value], saves = [value], errors = [value], fielding_pct = [value]
WHERE season = 2025;

-- White Sox
UPDATE whitesox_team_season_stats
SET quality_starts = [value], saves = [value], errors = [value], fielding_pct = [value]
WHERE season = 2025;
```

---

## LOW Priority / Informational

These items are minor or may resolve themselves after the critical fixes above.

---

### 3.1 Bulls Height Data Missing (18/18)

**Priority:** LOW (may be a column name issue)
**Table:** `bulls_players`

#### Issue Summary
All 18 active Bulls players show missing `height/height_inches`. However, the `bulls_players` table has separate columns: `height_feet`, `height_inches`, `height_total_inches`, and `height_display`. The test may be checking the wrong column.

#### Available Height Columns
From the test output, `bulls_players` has: `height_feet`, `height_inches`, `height_total_inches`, `height_display`

#### Requested Action
1. Verify whether `height_display` or `height_total_inches` has data (the test may have checked only `height_inches` which could be the inches-remainder, not total)
2. If all height columns are truly NULL, backfill from ESPN: https://www.espn.com/nba/team/roster/_/name/chi

---

### 3.2 Bulls/Blackhawks Integrity Check Failures

**Priority:** LOW (likely related to 0-0 score games or game_id join issues)
**Tables:** `bulls_games_master` + `bulls_player_game_stats`, `blackhawks_games_master` + `blackhawks_player_game_stats`

#### Issue Summary
The integrity check samples 3 random completed games and verifies that player stats exist for those games. Both Bulls and Blackhawks returned 0/3.

- **Bulls:** 0/3 sampled games had corresponding player stats
- **Blackhawks:** 0/3 sampled games had corresponding player stats

This may be caused by:
1. The sampled games happened to be from the 0-0 score batch (no real game data)
2. The `game_id` join between games_master and player_game_stats may be broken
3. Stats may use a different game identifier than the games_master `id` or `game_id`

#### Requested Action
1. After fixing 0-0 score games (issues 1.1 and 1.2), re-run integrity checks
2. Verify the join between `bulls_games_master.game_id` and `bulls_player_game_stats.game_id`
3. Verify the join between `blackhawks_games_master.game_id` and `blackhawks_player_game_stats.blackhawks_game_id`

---

### 3.3 Minor Missing Fields Across Teams

**Priority:** LOW

These are small gaps that can be addressed in a future data sweep:

| Team | Table | Field | Missing Count | Total |
|------|-------|-------|--------------|-------|
| Bears | `bears_players` | `jersey_number` | 10 | 79 |
| Bears | `bears_players` | `college` | 4 | 79 |
| Cubs | `cubs_players` | `height`, `weight_lbs`, `age` | 3 | 40 |
| White Sox | `whitesox_players` | `headshot_url` | 2 | 40 |
| White Sox | `whitesox_players` | `jersey_number` | 3 | 40 |
| White Sox | `whitesox_players` | `height`, `weight_lbs`, `age` | 4 | 40 |
| Blackhawks | `blackhawks_games_master` | `game_time` | 54 | 82 |
| Blackhawks | `blackhawks_games_master` | `opponent_full_name` | 76 | 82 |

**Note on Blackhawks:** The `game_time` (54/82 missing) and `opponent_full_name` (76/82 missing) issues are substantial but marked LOW here because the Cubs/White Sox 100%-missing versions are more urgent. If bandwidth allows, these should be addressed in the same pass.

---

## Summary Table

| # | Issue | Priority | Table(s) | Impact |
|---|-------|----------|----------|--------|
| 1.1 | Bulls 0-0 scores | CRITICAL | `bulls_games_master` | 29 games show 0-0 on scores page |
| 1.2 | Blackhawks 0-0 scores | CRITICAL | `blackhawks_games_master` | 25 games show 0-0 on scores page |
| 1.3 | Cubs game_time missing | CRITICAL | `cubs_games_master` | 171/171 schedules have no time |
| 1.4 | White Sox game_time missing | CRITICAL | `whitesox_games_master` | 162/162 schedules have no time |
| 1.5 | Cubs opponent_full_name | CRITICAL | `cubs_games_master` | 171/171 missing full opponent name |
| 1.6 | White Sox opponent_full_name | CRITICAL | `whitesox_games_master` | 162/162 missing full opponent name |
| 1.7 | White Sox ESPN ID mapping | CRITICAL | `whitesox_players` / `whitesox_player_game_stats` | 67% of players show no stats |
| 1.8 | scout_query_history missing | CRITICAL | `scout_query_history` | Table does not exist in DataLab |
| 2.1 | College data gaps | MODERATE | 4 player tables | 60-97% missing across teams |
| 2.2 | Blackhawks roster inflated | MODERATE | `blackhawks_players` | 37 active vs 20-25 expected |
| 2.3 | Blackhawks profile data | MODERATE | `blackhawks_players` | 17/37 missing headshot, height, weight, age |
| 2.4 | Bulls advanced stats null | MODERATE | `bulls_team_season_stats` | pace, ratings all NULL |
| 2.5 | MLB team stats null | MODERATE | `cubs/whitesox_team_season_stats` | quality_starts, saves, errors, fielding_pct NULL |

---

## Request to DataLab Team

Please prioritize in this order:

1. **0-0 score games** (1.1, 1.2) -- These are the most visible user-facing issues
2. **ESPN ID mapping** (1.7) -- White Sox player stats completely broken
3. **game_time and opponent_full_name** (1.3-1.6) -- MLB schedule pages incomplete
4. **scout_query_history** (1.8) -- Confirm which Supabase instance this belongs to
5. **Roster cleanup and college data** (2.1-2.3) -- Profile page completeness
6. **Null stat columns** (2.4-2.5) -- Advanced stats for team pages

Please respond with estimated timeline and any questions. We can re-run the comprehensive route tester after fixes are applied to verify resolution.

---

*Generated from SM DataLab Route Tester output (2026-02-10T08:15:07Z)*
*Frontend test script: `scripts/test-all-team-pages.mjs`*
