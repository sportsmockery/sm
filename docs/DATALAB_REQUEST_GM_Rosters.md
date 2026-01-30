# Data Lab Request: Add Chicago Teams to GM Roster Tables

**From:** Claude Code (SM Frontend)
**Date:** January 29, 2026
**Priority:** CRITICAL
**Status:** ✅ RESOLVED

---

## Resolution (January 29, 2026)

Data Lab has added all 5 Chicago teams to the GM roster tables:

| Team | Table | Players Added | Status |
|------|-------|---------------|--------|
| Bears | `gm_nfl_rosters` | 81 | ✅ Fixed |
| Bulls | `gm_nba_rosters` | 18 | ✅ Fixed |
| Blackhawks | `gm_nhl_rosters` | 20 | ✅ Fixed |
| Cubs | `gm_mlb_rosters` | 40 | ✅ Fixed |
| White Sox | `gm_mlb_rosters` | 40 | ✅ Fixed |

**Root Cause:** Chicago teams were never originally populated in the GM roster tables. Chicago data lives in separate `{team}_players` tables maintained by team-specific cron jobs.

**Fix Applied:** Data Lab migrated data from team-specific tables to GM roster tables.

---

## Original Issue (For Reference)

The GM Trade Simulator on SportsMockery could not display players for any Chicago team because all 5 Chicago teams were **missing from the GM roster tables** in the Data Lab database.

### Affected Tables

| Table | Total Rows | Chicago Team | Expected team_key | Status |
|-------|------------|--------------|-------------------|--------|
| `gm_nfl_rosters` | 2,471 | Bears | `bears` | ✅ ADDED |
| `gm_nba_rosters` | 511 | Bulls | `bulls` | ✅ ADDED |
| `gm_nhl_rosters` | 1,472 | Blackhawks | `blackhawks` | ✅ ADDED |
| `gm_mlb_rosters` | 1,103 | Cubs | `cubs` | ✅ ADDED |
| `gm_mlb_rosters` | 1,103 | White Sox | `whitesox` | ✅ ADDED |

---

## Verification (Passed)

```
Team          | Count | Sample Player
--------------|-------|---------------------------
Bears         | 81    | Devin Duvernay
Bulls         | 18    | Zach Collins
Blackhawks    | 20    | Colton Dach
Cubs          | 40    | Daniel Palencia
White Sox     | 40    | Jairo Iriarte
```

---

## Data Architecture Note

Chicago teams use `{team}_players` tables as the source of truth, synced hourly by team-specific cron jobs:

- `/api/cron/sync-bears` → `bears_players`
- `/api/cron/sync-bulls` → `bulls_players`
- `/api/cron/sync-blackhawks` → `blackhawks_players`
- `/api/cron/sync-cubs` → `cubs_players`
- `/api/cron/sync-whitesox` → `whitesox_players`

The GM roster tables (`gm_*_rosters`) are populated from these sources for the Trade Simulator.
