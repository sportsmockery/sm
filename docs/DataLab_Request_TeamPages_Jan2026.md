# Data Lab Request: Team Pages Data Fix
**Date:** January 25, 2026
**Priority:** CRITICAL
**Requester:** Frontend (test.sportsmockery.com)

---

## Summary

Team pages on test.sportsmockery.com are showing incorrect/empty data. Frontend queries are correct but database tables appear to have missing or incorrect data. This document details what needs to be verified and fixed for each team.

---

## Season Conventions (CRITICAL - Please Verify)

| Team | Sport | Current Season Value | Convention |
|------|-------|---------------------|------------|
| Bears | NFL | **2025** | Starting year (Sep 2025 - Feb 2026) |
| Bulls | NBA | **2026** | Ending year (Oct 2025 - Jun 2026) |
| Blackhawks | NHL | **2026** | Ending year (Oct 2025 - Jun 2026) |
| Cubs | MLB | **2025** | Calendar year (offseason) |
| White Sox | MLB | **2025** | Calendar year (offseason) |

---

## CHICAGO BEARS (NFL - Offseason, Season 2025)

### Expected Data (from reputable sources)
- **Regular Season:** 11-6
- **Postseason:** 1-1 (Wild Card W 31-27 vs GB, Divisional L 17-20 OT vs LAR)
- **Overall:** 12-7

### Tables to Check

#### 1. `bears_season_record` (season = 2025)
```sql
SELECT * FROM bears_season_record WHERE season = 2025;
```
**Expected:** Row with wins=11, losses=6 (regular season) OR wins=12, losses=7 (overall)

**If missing, INSERT:**
```sql
INSERT INTO bears_season_record (season, wins, losses, ties, division_rank)
VALUES (2025, 11, 6, 0, '2nd NFC North');
```

#### 2. `bears_games_master` (season = 2025)
```sql
SELECT COUNT(*), game_type FROM bears_games_master
WHERE season = 2025 GROUP BY game_type;
```
**Expected:**
- preseason: 3-4 games
- regular: 17 games
- postseason: 2 games (Wild Card, Divisional)

**Verify scores exist:**
```sql
SELECT game_date, opponent, bears_score, opponent_score, game_type
FROM bears_games_master
WHERE season = 2025
ORDER BY game_date;
```

#### 3. `bears_players` (active roster)
```sql
SELECT COUNT(*) FROM bears_players WHERE is_active = true;
```
**Expected:** 53-90 players (53 active + practice squad + IR)

#### 4. `bears_player_game_stats` (season = 2025)
```sql
SELECT COUNT(DISTINCT player_id) FROM bears_player_game_stats WHERE season = 2025;
```
**Expected:** 50+ players with game stats

**Key player to verify (Caleb Williams):**
```sql
SELECT SUM(passing_yds) as total_yards, SUM(passing_td) as total_td
FROM bears_player_game_stats
WHERE season = 2025 AND player_id = (SELECT id FROM bears_players WHERE name ILIKE '%caleb williams%');
```
**Expected:** ~3,942 yards, 27 TD (per reputable sources)

---

## CHICAGO BULLS (NBA - In Season, Season 2026)

### Expected Data (current as of Jan 25, 2026)
- **Record:** 22-22 (or current)
- **Status:** Active season

### Tables to Check

#### 1. `bulls_seasons` (season = 2026)
```sql
SELECT * FROM bulls_seasons WHERE season = 2026;
```
**Expected:** Row with current wins/losses (approximately 22-22)

#### 2. `bulls_games_master` (season = 2026)
```sql
SELECT COUNT(*) FROM bulls_games_master WHERE season = 2026;
```
**Expected:** 44+ games played so far this season

**Verify recent games:**
```sql
SELECT game_date, opponent, bulls_score, opponent_score
FROM bulls_games_master
WHERE season = 2026
ORDER BY game_date DESC
LIMIT 10;
```

#### 3. `bulls_players` (current roster)
```sql
SELECT COUNT(*) FROM bulls_players WHERE is_current_bulls = true;
```
**Expected:** 15-20 players

**NOTE:** Column is `is_current_bulls`, NOT `is_active`

#### 4. `bulls_player_game_stats` (season = 2026)
```sql
SELECT player_id, COUNT(*) as games, AVG(points) as ppg
FROM bulls_player_game_stats
WHERE season = 2026
GROUP BY player_id
ORDER BY ppg DESC
LIMIT 10;
```
**Expected:** Leaders like Josh Giddey ~19.2 PPG

---

## CHICAGO BLACKHAWKS (NHL - In Season, Season 2026)

### Expected Data (current as of Jan 25, 2026)
- **Record:** 21-22-8 (or current)
- **Status:** Active season

### Tables to Check

#### 1. `blackhawks_seasons` (season = 2026)
```sql
SELECT * FROM blackhawks_seasons WHERE season = 2026;
```
**Expected:** Row with wins, losses, otl (NOT ot_losses)

**NOTE:** Column is `otl`, NOT `ot_losses`

#### 2. `blackhawks_games_master` (season = 2026)
```sql
SELECT COUNT(*) FROM blackhawks_games_master WHERE season = 2026;
```
**Expected:** 50+ games played so far

#### 3. `blackhawks_players` (current roster)
```sql
SELECT COUNT(*) FROM blackhawks_players WHERE is_active = true;
```
**Expected:** 20-25 players

#### 4. `blackhawks_player_game_stats` (season = 2026)
**Connor Bedard verification:**
```sql
SELECT SUM(goals) as goals, SUM(assists) as assists, COUNT(*) as games
FROM blackhawks_player_game_stats
WHERE season = 2026 AND player_id = (SELECT id FROM blackhawks_players WHERE name ILIKE '%bedard%');
```
**Expected:** ~51 GP, 20 G, 28 A, 48 P (per reputable sources)

---

## CHICAGO CUBS (MLB - Offseason, Season 2025)

### Expected Data
- **Record:** 92-70
- **Status:** Offseason

### Tables to Check

#### 1. `cubs_seasons` (season = 2025)
```sql
SELECT * FROM cubs_seasons WHERE season = 2025;
```
**Expected:** Row with wins=92, losses=70

#### 2. `cubs_games_master` (season = 2025)
```sql
SELECT COUNT(*) FROM cubs_games_master WHERE season = 2025;
```
**Expected:** 162+ games (regular season)

#### 3. `cubs_team_season_stats` (season = 2025)
```sql
SELECT * FROM cubs_team_season_stats WHERE season = 2025;
```
**Expected:** team_avg ~.249, team_era, team_ops

#### 4. `cubs_players` (roster)
```sql
SELECT COUNT(*) FROM cubs_players WHERE is_active = true;
```
**Expected:** 26-45 players (40-man roster)

**Current count showing 264 - need to verify `is_active` filtering**

#### 5. `cubs_player_season_stats` (season = 2025)
**Dansby Swanson verification:**
```sql
SELECT * FROM cubs_player_season_stats
WHERE season = 2025 AND player_id = (SELECT id FROM cubs_players WHERE name ILIKE '%swanson%');
```
**Expected:** .244 AVG, 24 HR

---

## CHICAGO WHITE SOX (MLB - Offseason, Season 2025)

### Expected Data
- **Record:** 60-102
- **Status:** Offseason

### Tables to Check

#### 1. `whitesox_seasons` (season = 2025)
```sql
SELECT * FROM whitesox_seasons WHERE season = 2025;
```
**Expected:** Row with wins=60, losses=102

#### 2. `whitesox_games_master` (season = 2025)
```sql
SELECT COUNT(*) FROM whitesox_games_master WHERE season = 2025;
```
**Expected:** 162 games

#### 3. `whitesox_team_season_stats` (season = 2025)
```sql
SELECT * FROM whitesox_team_season_stats WHERE season = 2025;
```
**Expected:** team_avg ~.232

#### 4. `whitesox_players` (roster)
```sql
SELECT COUNT(*) FROM whitesox_players WHERE is_active = true;
```
**Expected:** 26-45 players

**Current count showing 224 - need to verify `is_active` filtering**

---

## Response Format Requested

Please respond with status for each team:

```
TEAM: [team name]
STATUS: [OK / ISSUES FOUND / MISSING DATA]

Tables checked:
- [table_name]: [status] [row count or issue]

Actions taken:
- [list of fixes applied]

Remaining issues:
- [any issues that couldn't be fixed]
```

---

## Priority Order

1. **CRITICAL (In-Season):** Bulls, Blackhawks - users expect current data
2. **HIGH (Offseason):** Bears - most traffic, playoff data important
3. **MEDIUM (Offseason):** Cubs, White Sox - offseason but should show 2025 data

---

## Contact

Frontend will verify fixes at:
- https://test.sportsmockery.com/chicago-bears/schedule
- https://test.sportsmockery.com/chicago-bulls/schedule
- https://test.sportsmockery.com/chicago-blackhawks/schedule
- https://test.sportsmockery.com/chicago-cubs/schedule
- https://test.sportsmockery.com/chicago-white-sox/schedule

After Data Lab confirms fixes, frontend will clear cache and verify all pages.
