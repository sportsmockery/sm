# DataLab Request: Team Season Stats Tables

**Date:** January 26, 2026
**From:** test.sportsmockery.com Development Team
**To:** SM Data Lab Team (datalab.sportsmockery.com)
**Priority:** HIGH
**Subject:** Missing `team_season_stats` Tables for Bulls, Cubs, White Sox, Blackhawks

---

## Executive Summary

During our full production audit, we discovered that **only the Bears have a `team_season_stats` table**. The Bulls, Cubs, White Sox, and Blackhawks are all missing this critical table, which prevents us from displaying team-level statistics on the Stats pages.

### Current State

| Team | `team_season_stats` Table | Status |
|------|---------------------------|--------|
| Bears | `bears_team_season_stats` | ✅ EXISTS (60 columns) |
| Bulls | `bulls_team_season_stats` | ❌ MISSING |
| Cubs | `cubs_team_season_stats` | ❌ MISSING |
| White Sox | `whitesox_team_season_stats` | ❌ MISSING |
| Blackhawks | `blackhawks_team_season_stats` | ❌ MISSING |

---

## What We Need

### 1. Bulls Team Season Stats Table (`bulls_team_season_stats`)

**NBA-specific columns needed:**

```sql
CREATE TABLE bulls_team_season_stats (
  id SERIAL PRIMARY KEY,
  season INTEGER NOT NULL,  -- 2026 for 2025-26 season

  -- Basic Stats
  games_played INTEGER,
  wins INTEGER,
  losses INTEGER,
  win_pct DECIMAL(4,3),

  -- Scoring
  points_per_game DECIMAL(5,1),
  points_total INTEGER,
  opponent_ppg DECIMAL(5,1),          -- IMPORTANT: Points allowed
  point_differential DECIMAL(5,1),

  -- Field Goals
  field_goals_made INTEGER,
  field_goals_attempted INTEGER,
  field_goal_pct DECIMAL(4,1),

  -- Three Pointers
  three_pointers_made INTEGER,
  three_pointers_attempted INTEGER,
  three_point_pct DECIMAL(4,1),

  -- Free Throws
  free_throws_made INTEGER,
  free_throws_attempted INTEGER,
  free_throw_pct DECIMAL(4,1),

  -- Rebounds
  offensive_rebounds INTEGER,
  defensive_rebounds INTEGER,
  total_rebounds INTEGER,
  rebounds_per_game DECIMAL(4,1),
  opponent_rpg DECIMAL(4,1),

  -- Assists & Turnovers
  assists INTEGER,
  assists_per_game DECIMAL(4,1),
  turnovers INTEGER,
  turnovers_per_game DECIMAL(4,1),
  assist_turnover_ratio DECIMAL(4,2),

  -- Defense
  steals INTEGER,
  steals_per_game DECIMAL(4,1),
  blocks INTEGER,
  blocks_per_game DECIMAL(4,1),

  -- Advanced
  pace DECIMAL(5,1),                   -- Possessions per game
  offensive_rating DECIMAL(5,1),       -- Points per 100 possessions
  defensive_rating DECIMAL(5,1),
  net_rating DECIMAL(5,1),
  effective_fg_pct DECIMAL(4,1),
  true_shooting_pct DECIMAL(4,1),

  -- Rankings (optional but nice)
  offensive_rank INTEGER,
  defensive_rank INTEGER,

  -- Metadata
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data_status TEXT DEFAULT 'imported'
);
```

**Data Source:** ESPN Bulls Team Stats page
- https://www.espn.com/nba/team/stats/_/name/chi/season/2026/seasontype/2

---

### 2. Cubs Team Season Stats Table (`cubs_team_season_stats`)

**MLB-specific columns needed:**

```sql
CREATE TABLE cubs_team_season_stats (
  id SERIAL PRIMARY KEY,
  season INTEGER NOT NULL,

  -- Basic
  games_played INTEGER,
  wins INTEGER,
  losses INTEGER,
  win_pct DECIMAL(4,3),

  -- Batting
  runs_scored INTEGER,
  runs_per_game DECIMAL(4,2),
  hits INTEGER,
  doubles INTEGER,
  triples INTEGER,
  home_runs INTEGER,
  rbi INTEGER,
  walks INTEGER,
  strikeouts INTEGER,
  stolen_bases INTEGER,
  caught_stealing INTEGER,
  batting_average DECIMAL(4,3),
  on_base_pct DECIMAL(4,3),
  slugging_pct DECIMAL(4,3),
  ops DECIMAL(4,3),

  -- Pitching
  runs_allowed INTEGER,
  runs_allowed_per_game DECIMAL(4,2),
  earned_runs INTEGER,
  era DECIMAL(4,2),
  hits_allowed INTEGER,
  home_runs_allowed INTEGER,
  walks_allowed INTEGER,
  strikeouts_pitched INTEGER,
  whip DECIMAL(4,2),
  quality_starts INTEGER,
  saves INTEGER,
  blown_saves INTEGER,

  -- Fielding
  errors INTEGER,
  fielding_pct DECIMAL(4,3),
  double_plays INTEGER,

  -- Metadata
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data_status TEXT DEFAULT 'imported'
);
```

**Data Source:** ESPN Cubs Team Stats
- https://www.espn.com/mlb/team/stats/_/name/chc/season/2025

---

### 3. White Sox Team Season Stats Table (`whitesox_team_season_stats`)

**Same structure as Cubs** (MLB):

```sql
CREATE TABLE whitesox_team_season_stats (
  -- Same columns as cubs_team_season_stats
);
```

**Data Source:** ESPN White Sox Team Stats
- https://www.espn.com/mlb/team/stats/_/name/chw/season/2025

---

### 4. Blackhawks Team Season Stats Table (`blackhawks_team_season_stats`)

**NHL-specific columns needed:**

```sql
CREATE TABLE blackhawks_team_season_stats (
  id SERIAL PRIMARY KEY,
  season INTEGER NOT NULL,  -- 2026 for 2025-26 season

  -- Basic
  games_played INTEGER,
  wins INTEGER,
  losses INTEGER,
  ot_losses INTEGER,
  points INTEGER,              -- NHL standings points
  point_pct DECIMAL(4,3),

  -- Scoring
  goals_for INTEGER,
  goals_against INTEGER,
  goal_differential INTEGER,
  goals_per_game DECIMAL(4,2),
  goals_against_per_game DECIMAL(4,2),

  -- Power Play
  power_play_goals INTEGER,
  power_play_opportunities INTEGER,
  power_play_pct DECIMAL(4,1),

  -- Penalty Kill
  penalty_kill_goals_against INTEGER,
  times_shorthanded INTEGER,
  penalty_kill_pct DECIMAL(4,1),

  -- Shots
  shots_for INTEGER,
  shots_against INTEGER,
  shots_per_game DECIMAL(4,1),
  shots_against_per_game DECIMAL(4,1),
  shooting_pct DECIMAL(4,1),
  save_pct DECIMAL(4,3),

  -- Faceoffs
  faceoffs_won INTEGER,
  faceoffs_lost INTEGER,
  faceoff_pct DECIMAL(4,1),

  -- Other
  hits INTEGER,
  blocked_shots INTEGER,
  penalty_minutes INTEGER,

  -- Metadata
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data_status TEXT DEFAULT 'imported'
);
```

**Data Source:** ESPN Blackhawks Team Stats
- https://www.espn.com/nhl/team/stats/_/name/chi/season/2026/seasontype/2

---

## Why This Matters

### Current Impact on test.sportsmockery.com

1. **Stats Pages Are Incomplete**
   - `/chicago-bulls/stats` - Cannot display team averages
   - `/chicago-cubs/stats` - No team batting/pitching stats
   - `/chicago-white-sox/stats` - Same issue
   - `/chicago-blackhawks/stats` - No team stats displayed

2. **User Experience**
   - Users visiting stats pages expect to see team-level statistics
   - Currently showing "No team stats available" for 4 of 5 teams
   - Makes the site look incomplete/unprofessional

3. **Competitive Disadvantage**
   - ESPN, CBS Sports, The Athletic all show team stats
   - Our Bears page looks great; the others look empty

### What We Currently Have to Work With

We CAN calculate some stats from `player_game_stats` tables, but this is:
- **Slow:** Requires aggregating thousands of rows per request
- **Incomplete:** Missing opponent stats (points allowed, etc.)
- **Missing Advanced Stats:** No pace, ratings, rankings

Example of what we can calculate for Bulls from player stats:
```
Games with stats: 45
Total Points: 4,982 | PPG: 110.7
Total Rebounds: 1,935 | RPG: 43.0
Total Assists: 1,198 | APG: 26.6
FG%: 46.1%
3P%: 35.2%
```

But we're **missing**:
- Points allowed / Opponent PPG
- Defensive stats
- Pace and efficiency ratings
- League rankings

---

## Recommended Data Sources

| Team | ESPN URL | Season Type |
|------|----------|-------------|
| Bulls | espn.com/nba/team/stats/_/name/chi/season/2026/seasontype/2 | Regular Season |
| Cubs | espn.com/mlb/team/stats/_/name/chc/season/2025 | Regular Season |
| White Sox | espn.com/mlb/team/stats/_/name/chw/season/2025 | Regular Season |
| Blackhawks | espn.com/nhl/team/stats/_/name/chi/season/2026/seasontype/2 | Regular Season |

---

## Requested Timeline

Given that **all other data is now complete and production-ready**, these team stats tables are the final piece needed for a complete launch.

| Priority | Table | Reason |
|----------|-------|--------|
| 1 | `bulls_team_season_stats` | Current season (2025-26), active games |
| 2 | `blackhawks_team_season_stats` | Current season (2025-26), active games |
| 3 | `cubs_team_season_stats` | 2025 season complete, can backfill |
| 4 | `whitesox_team_season_stats` | 2025 season complete, can backfill |

---

## Questions for DataLab Team

1. **Can you create these tables and populate them?**
2. **What's the estimated timeline?**
3. **Will these be auto-updated like the Bears table?**
4. **Should we create the tables ourselves and you populate them, or will you handle everything?**

---

## Contact

For questions about this request or the expected data format, please reach out to the test.sportsmockery.com development team.

**Audit completed:** January 26, 2026
**All other data verified:** Records ✅, Schedules ✅, Rosters ✅, Player Stats ✅
