# Data Lab Database Audit Document

> **Purpose:** Comprehensive checklist for auditing and maintaining datalab.sportsmockery.com database tables
> **Audience:** Data Lab Claude / Database Administrators
> **Last Updated:** January 25, 2026
> **Counterpart:** `/docs/TeamPages_Audit.md` (Frontend audit document)

---

## Instructions to Claude for Running Database Audit on datalab.sportsmockery.com

You are responsible for maintaining accurate, complete, and properly structured data in the datalab.sportsmockery.com Supabase database. The frontend at test.sportsmockery.com depends on this data being correct. Run this audit to verify data integrity, identify issues, and fix them proactively.

### Audit Objectives

1. **Verify data accuracy** against official sources (ESPN, NFL.com, NBA.com, NHL.com, MLB.com)
2. **Check for duplicates** in all game and player tables
3. **Ensure roster counts** are reasonable (not inflated with historical players)
4. **Confirm season records** match official standings
5. **Validate column values** are populated (not NULL or "—" where data should exist)

### Tools Available

- Direct Supabase SQL queries
- Web search for verification
- Browse official league sites for current data

---

## Critical Table Reference

### Bears Tables

| Table | Purpose | Key Columns | Frontend Depends On |
|-------|---------|-------------|---------------------|
| `bears_season_record` | Authoritative W-L record | `regular_season_wins`, `regular_season_losses`, `postseason_wins`, `postseason_losses`, `division_rank` | Schedule, Stats pages |
| `bears_season_summary` | Team stats | `points_for`, `points_against`, `total_yards`, etc. | Stats page |
| `bears_games_master` | All games | `game_id`, `season`, `week`, `game_type`, `bears_score`, `opponent_score`, `game_date` | Schedule, Scores pages |
| `bears_players` | Roster | `is_active`, `jersey_number`, `position`, `height`, `weight`, `age` | Roster, Players pages |
| `bears_player_game_stats` | Per-game stats | `player_id`, `game_id`, `pass_yards`, `rush_yards`, etc. | Player pages, Stats leaders |

### Bulls Tables

| Table | Purpose | Key Columns | Frontend Depends On |
|-------|---------|-------------|---------------------|
| `bulls_seasons` | Authoritative W-L record | `season`, `wins`, `losses` | Schedule, Stats pages |
| `bulls_games_master` | All games | `game_id`, `season`, `bulls_score`, `opponent_score`, `bulls_win`, `game_date` | Schedule, Scores pages |
| `bulls_players` | Roster | `is_current_bulls`, `jersey_number`, `position`, `height`, `weight_lbs`, `age` | Roster, Players pages |
| `bulls_player_game_stats` | Per-game stats | `player_id`, `game_id`, `points`, `total_rebounds`, `assists` | Player pages, Stats leaders |

**CRITICAL:** Frontend filters games with `WHERE bulls_score > 0 OR opponent_score > 0`. Future games with 0-0 scores are excluded from record calculations.

### Blackhawks Tables

| Table | Purpose | Key Columns | Frontend Depends On |
|-------|---------|-------------|---------------------|
| `blackhawks_seasons` | Authoritative W-L-OTL record | `season`, `wins`, `losses`, `otl` (NOT ot_losses!), `points` | Schedule, Stats pages |
| `blackhawks_games_master` | All games | `game_id`, `season`, `blackhawks_score`, `opponent_score`, `game_date` | Schedule, Scores pages |
| `blackhawks_players` | Roster | `is_active`, `jersey_number`, `position`, `height`, `weight`, `age` | Roster, Players pages |
| `blackhawks_player_game_stats` | Per-game stats | `player_id`, `game_id`, `goals`, `assists`, `points` | Player pages, Stats leaders |

**CRITICAL:** OTL column is `otl`, NOT `ot_losses`. Frontend queries this exact column name.

### Cubs Tables

| Table | Purpose | Key Columns | Frontend Depends On |
|-------|---------|-------------|---------------------|
| `cubs_seasons` | Authoritative W-L record | `season`, `wins`, `losses` | Schedule, Stats pages |
| `cubs_games_master` | All games | `game_id`, `season`, `cubs_score`, `opponent_score`, `game_date` | Schedule, Scores pages |
| `cubs_players` | Roster | `is_active`, `jersey_number`, `position`, `height`, `weight`, `bats`, `throws`, `age` | Roster, Players pages |
| `cubs_player_game_stats` | Per-game stats | `player_id`, `game_id`, `hits`, `at_bats`, `home_runs`, `rbi` | Player pages, Stats leaders |

**CRITICAL:** Roster should be ~32-40 players (40-man roster), NOT 200+. Use `is_active = true` filter.

### White Sox Tables

| Table | Purpose | Key Columns | Frontend Depends On |
|-------|---------|-------------|---------------------|
| `whitesox_seasons` | Authoritative W-L record | `season`, `wins`, `losses` | Schedule, Stats pages |
| `whitesox_games_master` | All games | `game_id`, `season`, `whitesox_score`, `opponent_score`, `game_date` | Schedule, Scores pages |
| `whitesox_players` | Roster | `is_active`, `jersey_number`, `position`, `height`, `weight`, `bats`, `throws`, `age` | Roster, Players pages |
| `whitesox_player_game_stats` | Per-game stats | `player_id`, `game_id`, `hits`, `at_bats`, `home_runs`, `rbi` | Player pages, Stats leaders |

**CRITICAL:** Roster should be ~36-40 players, NOT 200+. Use `is_active = true` filter.

---

## Season Year Conventions (CRITICAL)

| League | Convention | Current Season Value | Example |
|--------|------------|---------------------|---------|
| NFL | Starting year | `2025` | Sep 2025 - Feb 2026 season |
| NBA | ENDING year | `2026` | Oct 2025 - Jun 2026 season |
| NHL | ENDING year | `2026` | Oct 2025 - Jun 2026 season |
| MLB | Calendar year | `2025` | Apr 2025 - Oct 2025 season |

**Frontend uses these exact conventions. If seasons table has wrong year, data won't display.**

---

## Audit Procedure by Team

### Chicago Bears Audit

#### Step 1: Fetch Current Data from Official Sources

```
Web search: "Chicago Bears 2025 season record ESPN"
Browse: espn.com/nfl/team/_/name/chi/chicago-bears
Cross-reference: nfl.com/teams/chicago-bears/
```

Record the following from official sources:
- Regular season record (e.g., 11-6)
- Postseason record (e.g., 1-1)
- Division rank (e.g., 1st NFC North)
- Key player stats (Caleb Williams passing yards, TDs)
- Active roster count (~53)

#### Step 2: Verify Season Record Table

```sql
SELECT * FROM bears_season_record WHERE season = 2025;
```

**Check:**
- [ ] `regular_season_wins` matches official
- [ ] `regular_season_losses` matches official
- [ ] `postseason_wins` matches official (if applicable)
- [ ] `postseason_losses` matches official (if applicable)
- [ ] `division_rank` is set

**Fix if wrong:**
```sql
UPDATE bears_season_record
SET regular_season_wins = [correct],
    regular_season_losses = [correct],
    postseason_wins = [correct],
    postseason_losses = [correct],
    division_rank = '[correct]'
WHERE season = 2025;
```

#### Step 3: Verify Games Table

```sql
-- Count games
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE game_type = 'regular') as regular,
  COUNT(*) FILTER (WHERE game_type = 'postseason') as postseason,
  COUNT(*) FILTER (WHERE game_type = 'preseason') as preseason
FROM bears_games_master
WHERE season = 2025;

-- Check for duplicates
SELECT game_id, COUNT(*)
FROM bears_games_master
WHERE season = 2025
GROUP BY game_id
HAVING COUNT(*) > 1;

-- Verify scores exist for completed games
SELECT game_id, game_date, bears_score, opponent_score
FROM bears_games_master
WHERE season = 2025
  AND game_date < CURRENT_DATE
  AND (bears_score IS NULL OR bears_score = 0);
```

**Expected:**
- 17 regular season games
- 2+ postseason games (if team made playoffs)
- No duplicates
- All past games have scores

#### Step 4: Verify Roster Table

```sql
-- Count active players
SELECT COUNT(*) FROM bears_players WHERE is_active = true;

-- Check for missing data
SELECT name, jersey_number, position, height, weight, age
FROM bears_players
WHERE is_active = true
  AND (height IS NULL OR weight IS NULL OR age IS NULL);

-- Check for duplicates
SELECT name, COUNT(*)
FROM bears_players
WHERE is_active = true
GROUP BY name
HAVING COUNT(*) > 1;
```

**Expected:**
- ~53-81 active players (53 roster + practice squad)
- No NULL heights/weights/ages
- No duplicate player names

#### Step 5: Verify Player Stats

```sql
-- Get Caleb Williams stats
SELECT
  SUM(pass_yards) as total_pass_yards,
  SUM(pass_td) as total_pass_td,
  COUNT(*) as games_played
FROM bears_player_game_stats
WHERE player_id = (SELECT id FROM bears_players WHERE name ILIKE '%caleb williams%')
  AND season = 2025;
```

**Compare to official source. Fix if wrong:**
```sql
-- Example fix for incorrect game stats
UPDATE bears_player_game_stats
SET pass_yards = [correct]
WHERE player_id = [id] AND game_id = [game_id];
```

**Audit for Chicago Bears complete.**

---

### Chicago Bulls Audit

#### Step 1: Fetch Current Data from Official Sources

```
Web search: "Chicago Bulls current record 2025-26 NBA.com"
Browse: nba.com/bulls
Cross-reference: espn.com/nba/team/_/name/chi/chicago-bulls
```

Record:
- Current W-L record
- Games played
- Key player stats (PPG leaders)
- Active roster count (~15-18)

#### Step 2: Verify Season Record Table

```sql
SELECT * FROM bulls_seasons WHERE season = 2026;
```

**Check:**
- [ ] `wins` matches current official
- [ ] `losses` matches current official

**CRITICAL:** Season = 2026 for 2025-26 NBA season (ending year convention)

#### Step 3: Verify Games Table

```sql
-- Count played games (exclude future 0-0 games)
SELECT
  COUNT(*) as total_games,
  COUNT(*) FILTER (WHERE bulls_score > 0 OR opponent_score > 0) as played,
  COUNT(*) FILTER (WHERE bulls_score = 0 AND opponent_score = 0) as unplayed
FROM bulls_games_master
WHERE season = 2026;

-- Verify record matches
SELECT
  COUNT(*) FILTER (WHERE bulls_win = true AND (bulls_score > 0 OR opponent_score > 0)) as wins,
  COUNT(*) FILTER (WHERE bulls_win = false AND (bulls_score > 0 OR opponent_score > 0)) as losses
FROM bulls_games_master
WHERE season = 2026;

-- Check for duplicates
SELECT game_id, COUNT(*)
FROM bulls_games_master
WHERE season = 2026
GROUP BY game_id
HAVING COUNT(*) > 1;
```

#### Step 4: Verify Roster Table

```sql
-- Count current roster
SELECT COUNT(*) FROM bulls_players WHERE is_current_bulls = true;

-- Check for missing data
SELECT name, jersey_number, position, height, weight_lbs, age
FROM bulls_players
WHERE is_current_bulls = true
  AND (height IS NULL OR weight_lbs IS NULL OR age IS NULL);
```

**Expected:** ~15-18 players with all fields populated

#### Step 5: Verify Key Players Exist

```sql
-- Check Zach LaVine exists
SELECT * FROM bulls_players WHERE slug = 'zach-lavine';

-- If traded, ensure status reflects this
-- If still on team, ensure is_current_bulls = true
```

**Audit for Chicago Bulls complete.**

---

### Chicago Blackhawks Audit

#### Step 1: Fetch Current Data from Official Sources

```
Web search: "Chicago Blackhawks current record 2025-26 NHL.com"
Browse: nhl.com/blackhawks
Cross-reference: espn.com/nhl/team/_/name/chi/chicago-blackhawks
```

Record:
- Current W-L-OTL record
- Points
- Connor Bedard stats (goals, assists, points)
- Active roster count (~20-23)

#### Step 2: Verify Season Record Table

```sql
-- CRITICAL: Column is 'otl' not 'ot_losses'
SELECT season, wins, losses, otl, points
FROM blackhawks_seasons
WHERE season = 2026;
```

**Check:**
- [ ] `wins` matches official
- [ ] `losses` matches official
- [ ] `otl` matches official (overtime losses)
- [ ] `points` = (wins * 2) + otl

**Verify column exists:**
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'blackhawks_seasons'
  AND column_name IN ('otl', 'ot_losses');
```

#### Step 3: Verify Games and Roster

```sql
-- Games count
SELECT COUNT(*) FROM blackhawks_games_master WHERE season = 2026;

-- Roster count
SELECT COUNT(*) FROM blackhawks_players WHERE is_active = true;

-- Bedard exists
SELECT * FROM blackhawks_players WHERE slug = 'connor-bedard';
```

**Audit for Chicago Blackhawks complete.**

---

### Chicago Cubs Audit

#### Step 1: Fetch Current Data from Official Sources

```
Web search: "Chicago Cubs 2025 season record MLB.com"
Browse: mlb.com/cubs
Cross-reference: espn.com/mlb/team/_/name/chc/chicago-cubs
```

Record:
- Final W-L record (e.g., 92-70, NOT 98-76)
- Key player stats
- Active roster count (~40)

#### Step 2: Verify Season Record Table

```sql
SELECT * FROM cubs_seasons WHERE season = 2025;
```

**Check:**
- [ ] `wins` = 92 (NOT 98)
- [ ] `losses` = 70 (NOT 76)

#### Step 3: Verify Roster Count

```sql
-- CRITICAL: Should NOT be 264
SELECT COUNT(*) FROM cubs_players WHERE is_active = true;
```

**Expected:** 32-40 players

**If inflated, fix:**
```sql
-- Mark all inactive first
UPDATE cubs_players SET is_active = false;

-- Then activate only current roster (from ESPN/MLB.com roster page)
UPDATE cubs_players SET is_active = true
WHERE name IN ('Dansby Swanson', 'Nico Hoerner', 'Seiya Suzuki', ...);
```

#### Step 4: Verify Key Player Stats

```sql
-- Dansby Swanson 2025 stats
SELECT * FROM cubs_player_game_stats
WHERE player_id = (SELECT id FROM cubs_players WHERE slug = 'dansby-swanson')
  AND season = 2025;
```

**Audit for Chicago Cubs complete.**

---

### Chicago White Sox Audit

#### Step 1: Fetch Current Data from Official Sources

```
Web search: "Chicago White Sox 2025 season record MLB.com"
Browse: mlb.com/whitesox
Cross-reference: espn.com/mlb/team/_/name/chw/chicago-white-sox
```

Record:
- Final W-L record (e.g., 60-102, NOT 61-106)
- Active roster count (~36-40)

#### Step 2: Verify Season Record Table

```sql
SELECT * FROM whitesox_seasons WHERE season = 2025;
```

**Check:**
- [ ] `wins` = 60 (NOT 61)
- [ ] `losses` = 102 (NOT 106)

#### Step 3: Verify Roster Count

```sql
-- CRITICAL: Should NOT be 221
SELECT COUNT(*) FROM whitesox_players WHERE is_active = true;
```

**Expected:** 36-40 players

**If inflated, fix with same pattern as Cubs.**

**Audit for Chicago White Sox complete.**

---

## Duplicate Detection Queries

Run these periodically to catch data quality issues:

```sql
-- Games duplicates (all teams)
SELECT 'bears' as team, game_id, COUNT(*) FROM bears_games_master GROUP BY game_id HAVING COUNT(*) > 1
UNION ALL
SELECT 'bulls', game_id, COUNT(*) FROM bulls_games_master GROUP BY game_id HAVING COUNT(*) > 1
UNION ALL
SELECT 'blackhawks', game_id, COUNT(*) FROM blackhawks_games_master GROUP BY game_id HAVING COUNT(*) > 1
UNION ALL
SELECT 'cubs', game_id, COUNT(*) FROM cubs_games_master GROUP BY game_id HAVING COUNT(*) > 1
UNION ALL
SELECT 'whitesox', game_id, COUNT(*) FROM whitesox_games_master GROUP BY game_id HAVING COUNT(*) > 1;

-- Player duplicates
SELECT 'bears' as team, name, COUNT(*) FROM bears_players WHERE is_active = true GROUP BY name HAVING COUNT(*) > 1
UNION ALL
SELECT 'bulls', name, COUNT(*) FROM bulls_players WHERE is_current_bulls = true GROUP BY name HAVING COUNT(*) > 1
UNION ALL
SELECT 'blackhawks', name, COUNT(*) FROM blackhawks_players WHERE is_active = true GROUP BY name HAVING COUNT(*) > 1
UNION ALL
SELECT 'cubs', name, COUNT(*) FROM cubs_players WHERE is_active = true GROUP BY name HAVING COUNT(*) > 1
UNION ALL
SELECT 'whitesox', name, COUNT(*) FROM whitesox_players WHERE is_active = true GROUP BY name HAVING COUNT(*) > 1;
```

---

## Quick Health Check Query

Run this single query to get overview of all teams:

```sql
SELECT
  'Bears' as team,
  (SELECT regular_season_wins || '-' || regular_season_losses FROM bears_season_record WHERE season = 2025) as record,
  (SELECT COUNT(*) FROM bears_games_master WHERE season = 2025) as games,
  (SELECT COUNT(*) FROM bears_players WHERE is_active = true) as roster
UNION ALL
SELECT
  'Bulls',
  (SELECT wins || '-' || losses FROM bulls_seasons WHERE season = 2026),
  (SELECT COUNT(*) FROM bulls_games_master WHERE season = 2026 AND (bulls_score > 0 OR opponent_score > 0)),
  (SELECT COUNT(*) FROM bulls_players WHERE is_current_bulls = true)
UNION ALL
SELECT
  'Blackhawks',
  (SELECT wins || '-' || losses || '-' || otl FROM blackhawks_seasons WHERE season = 2026),
  (SELECT COUNT(*) FROM blackhawks_games_master WHERE season = 2026),
  (SELECT COUNT(*) FROM blackhawks_players WHERE is_active = true)
UNION ALL
SELECT
  'Cubs',
  (SELECT wins || '-' || losses FROM cubs_seasons WHERE season = 2025),
  (SELECT COUNT(*) FROM cubs_games_master WHERE season = 2025),
  (SELECT COUNT(*) FROM cubs_players WHERE is_active = true)
UNION ALL
SELECT
  'White Sox',
  (SELECT wins || '-' || losses FROM whitesox_seasons WHERE season = 2025),
  (SELECT COUNT(*) FROM whitesox_games_master WHERE season = 2025),
  (SELECT COUNT(*) FROM whitesox_players WHERE is_active = true);
```

**Expected Output:**
| team | record | games | roster |
|------|--------|-------|--------|
| Bears | 11-6 (or 12-7 overall) | 19 | 53-81 |
| Bulls | 23-22 (current) | ~45 | 15-18 |
| Blackhawks | 21-22-8 | ~51 | 20-23 |
| Cubs | 92-70 | 162+ | 32-40 |
| White Sox | 60-102 | 162 | 36-40 |

---

## Audit Results Template

```markdown
## Data Lab Database Audit Results

**Date:** [DATE]
**Auditor:** Data Lab Claude

### Quick Health Check Results

| Team | Record | Games | Roster | Status |
|------|--------|-------|--------|--------|
| Bears | [X-X] | [N] | [N] | ✅/❌ |
| Bulls | [X-X] | [N] | [N] | ✅/❌ |
| Blackhawks | [X-X-X] | [N] | [N] | ✅/❌ |
| Cubs | [X-X] | [N] | [N] | ✅/❌ |
| White Sox | [X-X] | [N] | [N] | ✅/❌ |

### Issues Found

#### [Team Name]
- **Table:** `[table_name]`
- **Issue:** [description]
- **Current Value:** [value]
- **Correct Value:** [value from official source]
- **Source:** [URL]

### Fixes Applied

```sql
-- [Description]
[SQL statement executed]
```

### Verification After Fixes

[Re-run quick health check and confirm all ✅]
```

---

## Response Template to Frontend

After completing audit, send this to frontend Claude:

```markdown
## Data Lab Response

**Status:** [Audit Complete / Issues Fixed / Needs Frontend Fix]

### Current Data State

| Team | Table | Key Value | Status |
|------|-------|-----------|--------|
| Bears | bears_season_record | 11-6 regular, 1-1 post | ✅ |
| Bulls | bulls_seasons | 23-22 | ✅ |
| Blackhawks | blackhawks_seasons | 21-22-8 (otl column) | ✅ |
| Cubs | cubs_seasons | 92-70 | ✅ |
| Cubs | cubs_players (active) | 32 | ✅ |
| White Sox | whitesox_seasons | 60-102 | ✅ |
| White Sox | whitesox_players (active) | 36 | ✅ |

### Actions Taken

1. [List SQL updates executed]
2. [List any schema notes]

### Frontend Query Recommendations

If issues persist, frontend should verify:
1. Using correct table name (e.g., `bears_season_record` not `bears_seasons`)
2. Using correct season year (NBA/NHL = 2026, NFL/MLB = 2025)
3. Using correct column name (Blackhawks `otl` not `ot_losses`)
4. Filtering played games for Bulls (`WHERE bulls_score > 0 OR opponent_score > 0`)

### No Actions Needed

Data verified correct. If frontend still shows wrong values, issue is in frontend query logic.
```

---

## Cron Job Verification

Ensure these sync jobs are running correctly:

| Job | Frequency | Tables Updated | Health Check |
|-----|-----------|----------------|--------------|
| sync-bears | Hourly | bears_games_master, bears_players | Check game count |
| sync-bulls | Hourly | bulls_games_master, bulls_players | Check game count |
| sync-blackhawks | Hourly | blackhawks_games_master, blackhawks_players | Check game count |
| sync-cubs | Daily (offseason) | cubs_games_master, cubs_players | Check roster count |
| sync-whitesox | Daily (offseason) | whitesox_games_master, whitesox_players | Check roster count |

**Roster Sync Pattern (Correct):**
1. Mark all players `is_active = false`
2. Sync current roster from ESPN
3. Mark synced players `is_active = true`

This prevents roster inflation from historical players.

---

## Version History

| Date | Changes | Author |
|------|---------|--------|
| 2026-01-25 | Initial creation | Claude Code |
