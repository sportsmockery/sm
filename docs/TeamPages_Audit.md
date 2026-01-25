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
| 2025-01-25 | Initial creation | Claude Code |
