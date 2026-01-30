# Data Lab Request: Add Chicago Teams to GM Roster Tables

**From:** Claude Code (SM Frontend)
**Date:** January 29, 2026
**Priority:** CRITICAL

---

## Issue Summary

The GM Trade Simulator on SportsMockery cannot display players for any Chicago team because all 5 Chicago teams are **missing from the GM roster tables** in the Data Lab database.

---

## Affected Tables

| Table | Total Rows | Chicago Team | Expected team_key | Status |
|-------|------------|--------------|-------------------|--------|
| `gm_nfl_rosters` | 2,471 | Bears | `bears` | ❌ MISSING |
| `gm_nba_rosters` | 511 | Bulls | `bulls` | ❌ MISSING |
| `gm_nhl_rosters` | 1,472 | Blackhawks | `blackhawks` | ❌ MISSING |
| `gm_mlb_rosters` | 1,103 | Cubs | `cubs` | ❌ MISSING |
| `gm_mlb_rosters` | 1,103 | White Sox | `whitesox` | ❌ MISSING |

---

## Current State

### NFL Teams Present (31 teams, Bears missing):
```
49ers, bengals, bills, broncos, browns, buccaneers, cardinals, chargers,
chiefs, colts, commanders, cowboys, dolphins, eagles, falcons, giants,
jaguars, jets, lions, packers, panthers, patriots, raiders, rams, ravens,
saints, seahawks, steelers, texans, titans, vikings
```
**Missing:** `bears`

### NBA Teams Present (29 teams, Bulls missing):
```
76ers, blazers, bucks, cavaliers, celtics, clippers, grizzlies, hawks,
heat, hornets, jazz, kings, knicks, lakers, magic, mavericks, nets,
nuggets, pacers, pelicans, pistons, raptors, rockets, spurs, suns,
thunder, timberwolves, warriors, wizards
```
**Missing:** `bulls`

### NHL Teams Present (31 teams, Blackhawks missing):
```
avalanche, bluejackets, blues, bruins, canadiens, canucks, capitals,
devils, ducks, flames, flyers, goldenknights, hurricanes, islanders,
jets, kings, kraken, lightning, mapleleafs, oilers, panthers, penguins,
predators, rangers, redwings, sabres, senators, sharks, stars, utah, wild
```
**Missing:** `blackhawks`

### MLB Teams Present (28 teams, Cubs & White Sox missing):
```
angels, astros, athletics, bluejays, braves, brewers, cardinals,
diamondbacks, dodgers, giants, guardians, mariners, marlins, mets,
nationals, orioles, padres, phillies, pirates, rangers, rays, reds,
redsox, rockies, royals, tigers, twins, yankees
```
**Missing:** `cubs`, `whitesox`

---

## Requested Action

Please add roster data for all 5 Chicago teams to the appropriate GM roster tables:

### 1. Bears → `gm_nfl_rosters`
- team_key: `bears`
- Source: ESPN or official NFL roster API
- Include all active roster players with:
  - espn_player_id, full_name, position, jersey_number
  - headshot_url, age, weight_lbs, college, years_exp
  - draft_year, draft_round, draft_pick
  - base_salary, cap_hit, contract_years_remaining
  - contract_expires_year, contract_signed_year, is_rookie_deal
  - status, is_active

### 2. Bulls → `gm_nba_rosters`
- team_key: `bulls`
- Same fields as above (NBA-specific)

### 3. Blackhawks → `gm_nhl_rosters`
- team_key: `blackhawks`
- Same fields as above (NHL-specific)

### 4. Cubs → `gm_mlb_rosters`
- team_key: `cubs`
- Same fields as above (MLB-specific)

### 5. White Sox → `gm_mlb_rosters`
- team_key: `whitesox`
- Same fields as above (MLB-specific)

---

## SM Frontend Configuration

The SM frontend expects these team_key values in the GM API:

```typescript
// src/app/api/gm/roster/route.ts
const TEAM_CONFIG = {
  bears: { gmRosterTeamKey: 'chi', sport: 'nfl', ... },  // NEEDS TO BE 'bears'
  bulls: { gmRosterTeamKey: 'chi', sport: 'nba', ... },  // NEEDS TO BE 'bulls'
  blackhawks: { gmRosterTeamKey: 'chi', sport: 'nhl', ... },  // NEEDS TO BE 'blackhawks'
  cubs: { gmRosterTeamKey: 'chc', sport: 'mlb', ... },  // NEEDS TO BE 'cubs'
  whitesox: { gmRosterTeamKey: 'chw', sport: 'mlb', ... },  // NEEDS TO BE 'whitesox'
}
```

**Note:** The current config uses abbreviations (`chi`, `chc`, `chw`) but the actual team_keys in the database use full lowercase names (`bears`, `bulls`, etc.).

**We will update the SM frontend to use the correct team_keys once Data Lab confirms the Chicago teams have been added.**

---

## Verification

After adding the data, please verify with these queries:

```sql
-- Verify Bears
SELECT COUNT(*) FROM gm_nfl_rosters WHERE team_key = 'bears' AND is_active = true;
-- Expected: ~53 active roster players

-- Verify Bulls
SELECT COUNT(*) FROM gm_nba_rosters WHERE team_key = 'bulls' AND is_active = true;
-- Expected: ~15-17 active roster players

-- Verify Blackhawks
SELECT COUNT(*) FROM gm_nhl_rosters WHERE team_key = 'blackhawks' AND is_active = true;
-- Expected: ~23 active roster players

-- Verify Cubs
SELECT COUNT(*) FROM gm_mlb_rosters WHERE team_key = 'cubs' AND is_active = true;
-- Expected: ~26-40 roster players

-- Verify White Sox
SELECT COUNT(*) FROM gm_mlb_rosters WHERE team_key = 'whitesox' AND is_active = true;
-- Expected: ~26-40 roster players
```

---

## Impact

Until this is fixed:
- ❌ GM Trade Simulator shows 0 players for all Chicago teams
- ❌ Users cannot create trades with Chicago players
- ❌ Core functionality of the GM feature is broken for our target audience (Chicago sports fans)

---

## Contact

Please respond to this request or update the `gm_errors` table with status updates.

Thank you!
