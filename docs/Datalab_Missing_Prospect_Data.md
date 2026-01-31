# Mock Draft - Missing Prospect Data Request

**From:** SM Frontend Team
**To:** Datalab Team
**Date:** January 30, 2026
**Priority:** HIGH

---

## Summary

The Mock Draft feature is working correctly for NFL and MLB, but **NBA and NHL drafts fail** because there are **0 prospects** in the `draft_prospects` table for these sports.

### Current Data Status

| Sport | 2026 Prospects | Status |
|-------|----------------|--------|
| NFL | 100 | Working |
| MLB | 75 | Working |
| **NBA** | **0** | **MISSING - NEEDS DATA** |
| **NHL** | **0** | **MISSING - NEEDS DATA** |

When users try to start a Bulls or Blackhawks mock draft, they see the eligibility modal saying "Check back later" because there's no prospect data.

---

## Request 1: NBA 2026 Prospects

**Table:** `draft_prospects`
**Required Records:** 60+ prospects (top 60 for 2-round draft)

### Required Columns (match existing NFL/MLB format)

```sql
INSERT INTO draft_prospects (
  sport,           -- 'nba'
  draft_year,      -- 2026
  name,            -- Player name
  position,        -- 'PG', 'SG', 'SF', 'PF', 'C'
  school,          -- College/international team
  height,          -- e.g., "6'5"
  weight,          -- lbs
  age,             -- Player age
  headshot_url,    -- ESPN headshot URL (optional)
  projected_round, -- 1 or 2
  projected_pick,  -- 1-60
  grade,           -- Prospect grade 0-100
  strengths,       -- JSONB array of strings
  weaknesses,      -- JSONB array of strings
  comparison,      -- "Comparable to [NBA player]"
  espn_id          -- ESPN ID (optional)
)
```

### Data Sources for NBA 2026

1. **ESPN NBA Draft Prospects**: https://www.espn.com/nba/draft/bestavailable
2. **NBA.com Mock Draft**: https://www.nba.com/news/mock-draft
3. **The Ringer Big Board**: https://www.theringer.com/nba-draft
4. **Sports Illustrated NBA Draft**: https://www.si.com/nba/draft

### Top Prospects to Include (2026 NBA Draft)

Based on current mock drafts, priority players:

1. Cooper Flagg (Duke) - SF/PF - Projected #1
2. Dylan Harper (Rutgers) - SG - Projected #2-3
3. Ace Bailey (Rutgers) - SF - Projected #2-3
4. VJ Edgecombe (Baylor) - SG - Projected Top 5
5. Kon Knueppel (Duke) - SG/SF - Projected Top 5
6. Tre Johnson (Texas) - SG - Projected Top 10
7. Kasparas Jakucionis (Illinois) - PG - Projected Top 10
8. Egor Demin (BYU) - PG - Projected Top 10
9. Khaman Maluach (Duke) - C - Projected Top 10
10. Nolan Traore (France) - PG - Projected Top 15

Continue with top 60 prospects including international players.

---

## Request 2: NHL 2026 Prospects

**Table:** `draft_prospects`
**Required Records:** 100+ prospects (7-round draft, focus on first 3 rounds)

### Required Columns (match existing NFL/MLB format)

```sql
INSERT INTO draft_prospects (
  sport,           -- 'nhl'
  draft_year,      -- 2026
  name,            -- Player name
  position,        -- 'C', 'LW', 'RW', 'D', 'G'
  school,          -- Junior team (OHL/WHL/QMJHL/Europe)
  height,          -- e.g., "6'2"
  weight,          -- lbs
  age,             -- Player age (typically 17-18)
  headshot_url,    -- Elite Prospects or NHL headshot
  projected_round, -- 1-7
  projected_pick,  -- 1-224
  grade,           -- Prospect grade 0-100
  strengths,       -- JSONB array of strings
  weaknesses,      -- JSONB array of strings
  comparison,      -- "Comparable to [NHL player]"
  espn_id          -- ESPN ID (optional)
)
```

### Data Sources for NHL 2026

1. **NHL Central Scouting**: https://www.nhl.com/news/nhl-central-scouting-rankings
2. **Elite Prospects**: https://www.eliteprospects.com/draft-center
3. **The Athletic NHL Draft**: https://theathletic.com/tag/nhl-draft/
4. **Sportsnet Draft Rankings**: https://www.sportsnet.ca/hockey/nhl/nhl-draft/

### Top Prospects to Include (2026 NHL Draft)

Based on NHL Central Scouting and mock drafts:

1. James Hagens (USNTDP) - C - Projected #1
2. Porter Martone (Brampton/OHL) - RW - Projected Top 3
3. Ivan Ryabkin (Yaroslavl/Russia) - LW - Projected Top 5
4. Radim Mrtka (Czechia U20) - D - Projected Top 5
5. Sam Dickinson (London/OHL) - D - Projected Top 10
6. Malcolm Spence (Erie/OHL) - LW/C - Projected Top 10
7. Linus Eriksson (Djurgarden/SHL) - C - Projected Top 10
8. Matthew Schaefer (Erie/OHL) - D - Projected Top 10
9. Cole Beaudoin (Barrie/OHL) - C - Projected Top 15
10. Caleb Desnoyers (Moncton/QMJHL) - C - Projected Top 15

Continue with top 100+ prospects covering 3 rounds minimum.

---

## Chicago Team Pick Positions (For Reference)

When populating data, note Chicago's expected draft positions:

### Bulls (NBA)
- Current record suggests lottery pick
- Expected pick range: 8-15 overall
- Bulls draft 1 pick per round (2 total)

### Blackhawks (NHL)
- Current record: 21-22-8
- Expected pick range: 10-20 overall
- Blackhawks have 7 picks (one per round)

---

## Verification Query

After inserting data, run this to verify:

```sql
-- Check prospect counts by sport/year
SELECT sport, draft_year, COUNT(*) as count
FROM draft_prospects
WHERE draft_year = 2026
GROUP BY sport, draft_year
ORDER BY sport;

-- Expected output after fix:
-- nba  | 2026 | 60+
-- nfl  | 2026 | 100
-- nhl  | 2026 | 100+
-- mlb  | 2026 | 75
```

---

## SM Eligibility Check

SM's eligibility endpoint (`/api/gm/draft/eligibility`) checks for prospects:

```typescript
// Current check that fails for NBA/NHL
const { data: prospects, error } = await datalabAdmin
  .from('draft_prospects')
  .select('id')
  .eq('sport', sport)      // 'nba' or 'nhl'
  .eq('draft_year', 2026)
  .limit(1)

// If no prospects found, returns eligible: false
```

Once prospects are inserted, this check will pass.

---

## Timeline

- **Immediate need**: Users are trying to run Bulls/Blackhawks mock drafts now
- **NBA Draft**: June 2026
- **NHL Draft**: June 2026

Please prioritize NBA prospects first (fewer players needed), then NHL.

---

## Existing Table Schema Reference

The `draft_prospects` table already exists. Here's the working schema from NFL/MLB data:

```sql
-- Check existing columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'draft_prospects';
```

Match the exact column names and types used by existing NFL/MLB records.

---

## Contact

Reply to this document or update SM team once NBA/NHL prospects are populated. We'll verify the eligibility endpoint works and update the Mock Draft Tests document.
