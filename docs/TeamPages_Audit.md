# Team Pages Audit Document

> **Purpose:** Comprehensive checklist for auditing all team pages on test.sportsmockery.com
> **Last Updated:** January 25, 2026
> **Run By:** Claude Code (SM Frontend)

---

## Quick Reference: Correct Table Names

| Data Needed | Correct Table | Filter/Notes |
|-------------|---------------|--------------|
| Bears season record | `bears_season_record` | NOT bears_seasons |
| Bears season stats | `bears_season_summary` | Games played, avg points, etc. |
| Bears games | `bears_games_master` | All 19 games for 2025 |
| Bears roster | `bears_players` | WHERE is_active = true |
| Bulls season | `bulls_seasons` | season = 2026 for current |
| Bulls games | `bulls_games_master` | MUST filter: WHERE bulls_score > 0 OR opponent_score > 0 |
| Bulls roster | `bulls_players` | WHERE is_current_bulls = true |
| Blackhawks season | `blackhawks_seasons` | OTL column is `otl` NOT `ot_losses` |
| Blackhawks games | `blackhawks_games_master` | season = 2026 for current |
| Blackhawks roster | `blackhawks_players` | WHERE is_active = true |
| Cubs season | `cubs_seasons` | season = 2025 |
| Cubs games | `cubs_games_master` | 162 regular + playoffs |
| Cubs roster | `cubs_players` | WHERE is_active = true |
| White Sox season | `whitesox_seasons` | season = 2025 |
| White Sox games | `whitesox_games_master` | 162 games |
| White Sox roster | `whitesox_players` | WHERE is_active = true |

---

## Season Year Conventions (CRITICAL)

| League | Convention | Example |
|--------|------------|---------|
| NFL | Calendar year season starts | season = 2025 → Sep 2025 - Feb 2026 |
| NBA | ENDING year | season = 2026 → Oct 2025 - Jun 2026 |
| NHL | ENDING year | season = 2026 → Oct 2025 - Jun 2026 |
| MLB | Calendar year | season = 2025 → Apr 2025 - Oct 2025 |

---

## Instructions to Claude for Running Comprehensive Audit on test.sportsmockery.com

You are to run a comprehensive audit on the test.sportsmockery.com Next.js site for the Chicago Bears, Bulls, Cubs, White Sox, and Blackhawks pages (schedule, scores, stats, roster, players, individual player pages like caleb-williams, zach-lavine, dansby-swanson, luis-robert-jr, connor-bedard). Use your knowledge from previous interactions to check for inaccuracies, incompleteness, missing data, wrong data, duplicates, and other issues. To ensure future applicability when team stats change, always fetch the latest data from reputable sources using tools like web_search and browse_page before comparing. Verify accuracy by cross-referencing at least two sources (e.g., ESPN and official league sites like NFL.com, NBA.com, MLB.com, NHL.com; plus StatMuse or Pro-Football-Reference for historical). Data is pulled from datalab.sportsmockery.com Supabase tables—query those tables via code_execution tool to verify backend data if needed (e.g., check for duplicates in tables like bears_games_master). Do not delete any data or rename tables. Break the audit into sections per team and page, listing "What is Wrong" (specific issues like inaccurate record, missing fields, duplicates in data) and "What It Should Say" (correct data from fetched reputable sources). After auditing all pages, output an "Audit Summary" section summarizing key issues. Then, generate a "Response to Datalabs" section as a message to send to datalab.sportsmockery.com admins, detailing backend issues (e.g., missing rows, inaccurate entries, duplicates in tables) and suggested SQL updates/inserts (without deletions) to fix them based on fetched data. Proceed team by team, output "Audit for [team] complete" after each team.

### Audit Methodology

For each team, start with:
1. Use web_search and browse_page to fetch latest/current or last season data (e.g., for Bears: search "Chicago Bears 2025 record ESPN" and browse espn.com/nfl/team/_/name/chi/chicago-bears; cross-reference nfl.com/teams/chicago-bears/).
2. Verify key stats (record, player leaders, roster size) from 2+ sources for 100% accuracy.
3. Use fetched data as "right" for all comparisons below.

### Chicago Bears Audit Steps

1. Web search: "Chicago Bears most recent season record and stats ESPN"; browse top result (espn.com) and nfl.com/teams/chicago-bears/ for cross-verification (record, player stats like Williams passing yds, roster size ~53).
   - Task 1 complete.
2. Verify: Compare sources for accuracy (e.g., if ESPN says 12-7 overall, confirm with NFL.com).
   - Task 2 complete.

#### Schedule Page Steps
1. Browse https://test.sportsmockery.com/chicago-bears/schedule; check for wrong record (e.g., mismatched overall/regular), 0 games, missing preseason/postseason, no dates/times/locations/TV/highlights.
   - Task 1 complete.
2. Use code_execution to query `SELECT COUNT(DISTINCT game_id) FROM bears_games_master WHERE season=(most recent season from fetch)`; check for <expected games (e.g., 19 for reg+post), duplicates (`GROUP BY game_id HAVING COUNT>1`).
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

#### Scores Page Steps
1. Browse https://test.sportsmockery.com/chicago-bears/scores; check inconsistent record, 0 games, no box scores/quarters/videos.
   - Task 1 complete.
2. Query bears_teamgame for `SUM(points_for) WHERE game_id LIKE '[recent season]%'`; verify vs. fetched total pts, check duplicates.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

#### Stats Page Steps
1. Browse https://test.sportsmockery.com/chicago-bears/stats; check wrong player stats (e.g., mismatched yds/TDs), missing totals/rankings/charts, non-recent players.
   - Task 1 complete.
2. Query bears_playergame for `SUM(pass_yds) GROUP BY player_id`; verify leaders vs. fetched, duplicates.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

#### Roster Page Steps
1. Browse https://test.sportsmockery.com/chicago-bears/roster; check wrong player count (e.g., >53), missing ages/statuses/bios/depth, outdated players.
   - Task 1 complete.
2. Query `SELECT COUNT(DISTINCT player_id) FROM bears_playergame WHERE game_id LIKE '[recent season]%'`; check vs. fetched ~53, duplicates.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

#### Players Page Steps
1. Browse https://test.sportsmockery.com/chicago-bears/players; check only one player shown, inaccurate stats, no visible selector despite "Switch Player".
   - Task 1 complete.
2. Query for unique players; verify display logic vs. fetched roster.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

#### Individual Player Page Steps (caleb-williams)
1. Browse https://test.sportsmockery.com/chicago-bears/players/caleb-williams; check wrong stats (e.g., mismatched yds/TDs), missing logs/news/videos.
   - Task 1 complete.
2. Query bears_playergame `WHERE player_id=[Williams ID]`; sum stats vs. fetched, check duplicates.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

**Audit for Chicago Bears complete.**

### Chicago Bulls Audit Steps

1. Web search: "Chicago Bulls current record and stats NBA.com"; browse top result (nba.com) and espn.com/nba/team/_/name/chi/chicago-bulls for cross-verification (record, player leaders like Giddey PPG, roster ~18, recent games).
   - Task 1 complete.
2. Verify: Compare sources for accuracy (e.g., current W-L, next game).
   - Task 2 complete.

#### Schedule Page Steps
1. Browse https://test.sportsmockery.com/chicago-bulls/schedule; check wrong record, 0 games, no next at top/recent first, missing times/TV/streaks.
   - Task 1 complete.
2. Query `SELECT COUNT(*) FROM bulls_games_master WHERE season=(current season)`; check vs. fetched games played, duplicates.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

(Repeat similar structure for Scores, Stats, Roster, Players, Individual Player Page (zach-lavine), using bulls_games_master fields for verification.)

**Audit for Chicago Bulls complete.**

### Chicago Cubs Audit Steps

1. Web search: "Chicago Cubs most recent season record and stats MLB.com"; browse mlb.com/cubs and espn.com/mlb/team/_/name/chc/chicago-cubs for cross-verification (last season record, leaders like Busch AVG/HR, roster ~40).
   - Task 1 complete.
2. Verify: Compare sources for accuracy.
   - Task 2 complete.

#### Schedule Page Steps
1. Browse https://test.sportsmockery.com/chicago-cubs/schedule; check wrong record, 0 games, missing playoffs.
   - Task 1 complete.
2. Query `SELECT COUNT(*) FROM cubs_games_master WHERE season=(last season)`; check vs. fetched ~162+playoffs, duplicates.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

(Repeat for other Cubs pages using cubs_games_master.)

**Audit for Chicago Cubs complete.**

### Chicago White Sox Audit Steps

1. Web search: "Chicago White Sox most recent season record and stats MLB.com"; browse mlb.com/whitesox and espn.com/mlb/team/_/name/chw/chicago-white-sox for cross-verification.
   - Task 1 complete.
2. Verify: Compare sources.
   - Task 2 complete.

(Repeat structure for White Sox pages using whitesox_games_master.)

**Audit for Chicago White Sox complete.**

### Chicago Blackhawks Audit Steps

1. Web search: "Chicago Blackhawks current record and stats NHL.com"; browse nhl.com/blackhawks and espn.com/nhl/team/_/name/chi/chicago-blackhawks for cross-verification (current record, Bedard points, roster ~20, recent games).
   - Task 1 complete.
2. Verify: Compare sources (e.g., W-L-OT, next game).
   - Task 2 complete.

#### Schedule Page Steps
1. Browse https://test.sportsmockery.com/chicago-blackhawks/schedule; check wrong record, 0 games, no next at top/recent first.
   - Task 1 complete.
2. Query `SELECT COUNT(*) FROM blackhawks_games_master WHERE season=(current season)`; check vs. fetched games played, duplicates.
   - Task 2 complete.
3. List issues and corrections based on fetched data.
   - Task 3 complete.

(Repeat for other Blackhawks pages using blackhawks_games_master.)

**Audit for Chicago Blackhawks complete.**

### Final Output Requirements

After all teams, output:

1. **Audit Summary** with overall issues across all teams
2. **Response to Datalabs** formatted as:

```
Dear Datalabs Admins,

Audit (using sources [list e.g., ESPN, NFL.com, NBA.com, NHL.com, MLB.com]) found:

[list backend issues like missing rows in bears_games_master for 2025, duplicates in cubs_games_master, inaccurate sums in playergame tables]

Suggested fixes:
- UPDATE bears_games_master SET bears_score=24 WHERE game_id='2025-week1';
- INSERT INTO bulls_games_master (game_id, ...) VALUES (...);
- UPDATE cubs_seasons SET wins=92, losses=70 WHERE season=2025;
- etc.

No deletions proposed.

Verification sources:
- [URL 1]
- [URL 2]

Please confirm receipt and provide ETA for fixes.

Regards,
Claude Code (SM Frontend)
```

---

## Audit Checklist

### Pre-Audit Setup

```bash
# Clear browser cache or use incognito
# Note the current date/time for reference
# Have ESPN/official league sites open for verification
```

### Data Sources for Verification

- **NFL:** ESPN.com/nfl, NFL.com
- **NBA:** ESPN.com/nba, NBA.com
- **NHL:** ESPN.com/nhl, NHL.com
- **MLB:** ESPN.com/mlb, MLB.com, Baseball-Reference.com
- **Quick Stats:** StatMuse.com

---

## Chicago Bears Audit

### Page: /chicago-bears/schedule

**Check:**
- [ ] Record displays correctly (Regular: X-X, Postseason: X-X if applicable)
- [ ] All games listed (17 regular + preseason + playoffs)
- [ ] Game dates are correct
- [ ] Times displayed in CT
- [ ] TV networks shown
- [ ] Scores for completed games
- [ ] W/L indicators correct
- [ ] Bye week indicated

**Expected Values (2025 Season):**
- Regular Season: 11-6
- Postseason: 1-1 (Wild Card W, Divisional L)
- Total Games: 19 (17 regular + 2 playoff)

**Verification Query:**
```sql
SELECT
  COUNT(*) as total_games,
  COUNT(*) FILTER (WHERE game_type = 'regular') as regular,
  COUNT(*) FILTER (WHERE game_type = 'postseason') as playoff
FROM bears_games_master
WHERE season = 2025;
```

### Page: /chicago-bears/scores

**Check:**
- [ ] Same record as schedule page
- [ ] Completed games show final scores
- [ ] Box score data available for each game
- [ ] Most recent games appear first

### Page: /chicago-bears/stats

**Check:**
- [ ] Team record matches schedule
- [ ] Points per game calculated correctly
- [ ] Offensive/defensive yards accurate
- [ ] Leader categories populated:
  - [ ] Passing leader (Caleb Williams)
  - [ ] Rushing leader
  - [ ] Receiving leader
  - [ ] Defense leaders

**Key Stats to Verify (2025):**
- Caleb Williams: ~3,942 passing yards, 27 TD (NOT 4,303/29)

**Verification Query:**
```sql
SELECT * FROM bears_season_record WHERE season = 2025;
SELECT * FROM bears_season_summary WHERE season = 2025;
```

### Page: /chicago-bears/roster

**Check:**
- [ ] Player count reasonable (53 active roster, ~81 with practice squad)
- [ ] All positions represented
- [ ] Jersey numbers displayed
- [ ] Heights/weights populated (not "—")
- [ ] Ages populated
- [ ] Headshots loading

**Verification Query:**
```sql
SELECT COUNT(*) FROM bears_players WHERE is_active = true;
```

### Page: /chicago-bears/players

**Check:**
- [ ] Default player displays (first by jersey number)
- [ ] Player selector/dropdown works
- [ ] Stats display for selected player
- [ ] Links to individual player pages work

### Page: /chicago-bears/players/[slug]

**Test with:** `/chicago-bears/players/caleb-williams`

**Check:**
- [ ] Player bio displays
- [ ] Season stats accurate
- [ ] Game log available
- [ ] No "Not Found" errors

---

## Chicago Bulls Audit

### Page: /chicago-bulls/schedule

**Check:**
- [ ] Current season record (2025-26 = season 2026)
- [ ] Games sorted correctly (upcoming first or recent first)
- [ ] Future games show time, not score
- [ ] Completed games show W/L and score
- [ ] 82-game season accounted for

**Verification Query:**
```sql
-- CRITICAL: Must filter for played games
SELECT
  COUNT(*) FILTER (WHERE bulls_win = true AND (bulls_score > 0 OR opponent_score > 0)) as wins,
  COUNT(*) FILTER (WHERE bulls_win = false AND (bulls_score > 0 OR opponent_score > 0)) as losses,
  COUNT(*) FILTER (WHERE bulls_score = 0 AND opponent_score = 0) as unplayed
FROM bulls_games_master
WHERE season = 2026;
```

### Page: /chicago-bulls/scores

**Check:**
- [ ] Only completed games shown
- [ ] Box scores available
- [ ] Quarter-by-quarter scores

### Page: /chicago-bulls/stats

**Check:**
- [ ] PPG not 0.0
- [ ] RPG not 0.0
- [ ] APG not 0.0
- [ ] Leader categories populated

**Verification Query:**
```sql
SELECT wins, losses FROM bulls_seasons WHERE season = 2026;
```

### Page: /chicago-bulls/roster

**Check:**
- [ ] ~15-18 players (NBA roster)
- [ ] Heights populated (e.g., 6'4")
- [ ] Weights populated (e.g., 195 lbs)
- [ ] Ages populated

**Verification Query:**
```sql
SELECT COUNT(*) FROM bulls_players WHERE is_current_bulls = true;
```

### Page: /chicago-bulls/players/[slug]

**Test with:** `/chicago-bulls/players/zach-lavine`

**Check:**
- [ ] Page loads (not "Not Found")
- [ ] If traded, shows appropriate status
- [ ] Stats from current/last season

---

## Chicago Blackhawks Audit

### Page: /chicago-blackhawks/schedule

**Check:**
- [ ] Record shows W-L-OTL format (e.g., 21-22-8)
- [ ] OT losses counted separately
- [ ] 82-game season

**Verification Query:**
```sql
-- Note: Column is 'otl' not 'ot_losses'
SELECT wins, losses, otl, points FROM blackhawks_seasons WHERE season = 2026;
```

### Page: /chicago-blackhawks/stats

**Check:**
- [ ] Record not impossible (e.g., NOT 44-95-6)
- [ ] Goals for/against reasonable
- [ ] Power play % displayed
- [ ] Penalty kill % displayed

### Page: /chicago-blackhawks/roster

**Check:**
- [ ] ~20-23 players
- [ ] Goalies section separate
- [ ] Defensemen section
- [ ] Forwards section

**Verification Query:**
```sql
SELECT COUNT(*) FROM blackhawks_players WHERE is_active = true;
```

### Page: /chicago-blackhawks/players/[slug]

**Test with:** `/chicago-blackhawks/players/connor-bedard`

**Check:**
- [ ] Points, goals, assists displayed
- [ ] Game log available

---

## Chicago Cubs Audit

### Page: /chicago-cubs/schedule

**Check:**
- [ ] 162-game season (+ playoffs if applicable)
- [ ] Record accurate (2025: 92-70, NOT 98-76)
- [ ] Spring training games excluded from regular season count

**Verification Query:**
```sql
SELECT wins, losses FROM cubs_seasons WHERE season = 2025;
```

### Page: /chicago-cubs/stats

**Check:**
- [ ] Team batting average not "—"
- [ ] Team ERA not "—"
- [ ] Leaders populated

### Page: /chicago-cubs/roster

**Check:**
- [ ] ~40 players (40-man roster), NOT 264
- [ ] Heights populated
- [ ] Bats/Throws populated
- [ ] Ages populated

**Verification Query:**
```sql
SELECT COUNT(*) FROM cubs_players WHERE is_active = true;
-- Should be ~32-40, NOT 264
```

### Page: /chicago-cubs/players/[slug]

**Test with:** `/chicago-cubs/players/dansby-swanson`

**Check:**
- [ ] Stats display (not empty)
- [ ] 2025: .244 AVG, 24 HR

---

## Chicago White Sox Audit

### Page: /chicago-white-sox/schedule

**Check:**
- [ ] 162-game season
- [ ] Record accurate (2025: 60-102, NOT 61-106)

**Verification Query:**
```sql
SELECT wins, losses FROM whitesox_seasons WHERE season = 2025;
```

### Page: /chicago-white-sox/stats

**Check:**
- [ ] Team batting average not "—"
- [ ] Team ERA not "—"

### Page: /chicago-white-sox/roster

**Check:**
- [ ] ~36-40 players, NOT 221
- [ ] All fields populated

**Verification Query:**
```sql
SELECT COUNT(*) FROM whitesox_players WHERE is_active = true;
-- Should be ~36, NOT 221
```

---

## Frontend Code Verification

### Data Layer Files to Check

| Team | File | Key Functions |
|------|------|---------------|
| Bears | `/src/lib/bearsData.ts` | `getBearsSchedule()`, `getBearsRecord()` |
| Bulls | `/src/lib/bullsData.ts` | `getBullsSchedule()`, `getBullsRecord()` |
| Blackhawks | `/src/lib/blackhawksData.ts` | `getBlackhawksSchedule()`, `getBlackhawksRecord()` |
| Cubs | `/src/lib/cubsData.ts` | `getCubsSchedule()`, `getCubsRecord()` |
| White Sox | `/src/lib/whitesoxData.ts` | `getWhiteSoxSchedule()`, `getWhiteSoxRecord()` |

### Common Query Issues to Check

1. **Wrong table name:**
   - Bears: Using `bears_seasons` instead of `bears_season_record`

2. **Missing score filter (Bulls):**
   - Must include: `WHERE bulls_score > 0 OR opponent_score > 0`

3. **Wrong column name (Blackhawks):**
   - Using `ot_losses` instead of `otl`

4. **Wrong season year:**
   - NBA/NHL: Should use ENDING year (2026 for 2025-26 season)
   - NFL/MLB: Should use starting year (2025)

---

## Automated Audit Script

Run this to check all pages respond:

```bash
# Check all team pages return 200
for team in "chicago-bears" "chicago-bulls" "chicago-blackhawks" "chicago-cubs" "chicago-white-sox"; do
  for page in "schedule" "scores" "stats" "roster" "players"; do
    url="https://test.sportsmockery.com/${team}/${page}"
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "${team}/${page}: ${status}"
  done
done
```

---

## Audit Results Template

```markdown
## Team Pages Audit Results

**Date:** [DATE]
**Auditor:** Claude Code (SM Frontend)

### Summary

| Team | Schedule | Scores | Stats | Roster | Players | Issues |
|------|----------|--------|-------|--------|---------|--------|
| Bears | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | [count] |
| Bulls | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | [count] |
| Blackhawks | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | [count] |
| Cubs | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | [count] |
| White Sox | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | [count] |

### Detailed Findings

#### [Team Name]

**Page:** [page]
**Issue:** [description]
**Expected:** [value]
**Actual:** [value]
**Severity:** Critical/High/Medium/Low

---
```

---

## Data Lab Request Template

After completing the audit, use this template to request fixes:

```markdown
## Data Lab Request

**From:** Claude Code (SM Frontend)
**Date:** [Current Date]
**Priority:** [Critical/High/Medium/Low]

### Audit Summary

Completed comprehensive audit of all team pages on test.sportsmockery.com.

**Pages Audited:** 25 (5 teams × 5 pages each)
**Issues Found:** [X]
**Critical Issues:** [X]

### Issues by Team

#### Chicago Bears
| Page | Issue | Expected | Actual | Table | Column |
|------|-------|----------|--------|-------|--------|
| [page] | [issue] | [expected] | [actual] | [table] | [column] |

#### Chicago Bulls
| Page | Issue | Expected | Actual | Table | Column |
|------|-------|----------|--------|-------|--------|
| [page] | [issue] | [expected] | [actual] | [table] | [column] |

#### Chicago Blackhawks
| Page | Issue | Expected | Actual | Table | Column |
|------|-------|----------|--------|-------|--------|
| [page] | [issue] | [expected] | [actual] | [table] | [column] |

#### Chicago Cubs
| Page | Issue | Expected | Actual | Table | Column |
|------|-------|----------|--------|-------|--------|
| [page] | [issue] | [expected] | [actual] | [table] | [column] |

#### Chicago White Sox
| Page | Issue | Expected | Actual | Table | Column |
|------|-------|----------|--------|-------|--------|
| [page] | [issue] | [expected] | [actual] | [table] | [column] |

### Verification Sources

All expected values verified against:
- ESPN.com (primary)
- Official league sites (NFL.com, NBA.com, NHL.com, MLB.com)
- StatMuse.com (secondary)

### Requested Actions

#### Data Updates Required

1. **Table:** `[table_name]`
   - **Column:** `[column]`
   - **Current Value:** `[current]`
   - **Correct Value:** `[correct]`
   - **Source:** `[URL]`

2. [Continue for each issue...]

#### Query/Schema Questions

1. [Any questions about correct table names, column names, or query patterns]

### Frontend Changes (If Any)

If the issue is on the frontend side, note here:
- File: `[file path]`
- Function: `[function name]`
- Issue: `[description]`
- Fix: `[planned fix]`

---

**Please confirm receipt and provide ETA for fixes.**
```

---

## Post-Audit Checklist

After receiving Data Lab response:

- [ ] Verify Data Lab made requested changes
- [ ] Clear Vercel cache if needed: `vercel --prod --force`
- [ ] Re-check affected pages
- [ ] Update this document if new patterns discovered
- [ ] Commit any frontend fixes
- [ ] Deploy: `npm run deploy`

---

## Version History

| Date | Changes | Author |
|------|---------|--------|
| 2026-01-25 | Added comprehensive Claude audit instructions with step-by-step methodology | Claude Code |
| 2026-01-25 | Initial creation | Claude Code |
