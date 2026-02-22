## Data Lab Request: Bears Defensive Interceptions Missing

**From:** Claude Code (SM Frontend)
**Date:** February 21, 2026
**Priority:** Medium

### Issue Summary
The `interceptions` column in `bears_player_game_stats` appears to have no non-zero values for the 2025 regular season, causing the new Interception Leaders leaderboard on `/chicago-bears/stats` to display "No interception stats available."

### Affected Tables
- Table: `bears_player_game_stats`
- Column: `interceptions`
- Season: 2025
- Expected: Non-zero interception counts for defensive players (CBs, Safeties, LBs)
- Actual: All values appear to be 0 or NULL for regular season game_type rows

### Evidence
- **Sacks work fine**: The `defensive_sacks` / `def_sacks` column IS populated — Montez Sweat shows 9.5 sacks, Gervon Dexter 5 sacks
- **Tackles work fine**: `defensive_total_tackles` / `def_tackles_total` IS populated — Jaquan Brisker shows 74 TKL
- **Interceptions do NOT aggregate**: No player has `interceptions > 0` when aggregating all 2025 regular season rows
- **Player profile select uses the same column**: `select('... interceptions')` at line 487 of bearsData.ts — individual player profiles may also show 0 INTs

### Verification
- ESPN Bears 2025 defensive stats show multiple players with interceptions:
  - https://www.espn.com/nfl/team/stats/_/name/chi/season/2025/seasontype/2
  - Jaylon Johnson, Tyrique Stevenson, Jaquan Brisker, and others should have INTs

### Diagnostic Query
```sql
-- Check if any interceptions exist for 2025
SELECT player_id, SUM(interceptions) as total_int
FROM bears_player_game_stats
WHERE season = 2025
GROUP BY player_id
HAVING SUM(interceptions) > 0
ORDER BY total_int DESC;

-- Check column existence and sample values
SELECT DISTINCT interceptions
FROM bears_player_game_stats
WHERE season = 2025
LIMIT 20;

-- Also check if a different column name is used
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'bears_player_game_stats'
AND column_name ILIKE '%int%';
```

### Requested Action
1. Verify the `interceptions` column exists and check if data is populated
2. If unpopulated, backfill defensive interception data for the 2025 Bears season from ESPN
3. Ensure the column is included in the regular data sync pipeline going forward

### Frontend Code (already handles the data)
The frontend aggregation at `src/lib/bearsData.ts:1049` already checks all possible column names:
```typescript
totals.interceptions += (stat.defensive_interceptions ?? stat.def_int ?? stat.interceptions ?? 0)
```
No frontend changes needed once the data is populated.
