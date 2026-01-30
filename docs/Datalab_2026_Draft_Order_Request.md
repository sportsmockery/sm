# Mock Draft - 2026 Draft Order Request for Datalab

**From:** SM Frontend Team
**To:** Datalab Team
**Date:** January 29, 2026
**Priority:** HIGH - Blocking Mock Draft for Bears

---

## Issue

The Mock Draft feature shows "No draft order available for NFL 2026" when users try to start a Bears mock draft.

The `gm_draft_eligibility` view correctly shows Bears as eligible (eliminated in Divisional Round, 84 days until draft), but the `gm_draft_order` table doesn't have 2026 NFL draft data.

---

## Current State

```sql
-- This returns 0 rows
SELECT COUNT(*) FROM gm_draft_order
WHERE sport = 'nfl' AND draft_year = 2026;
```

The code now falls back to the most recent available year, but for proper 2026 mock drafts we need the actual 2026 draft order.

---

## What's Needed

### 2026 NFL Draft Order

The 2026 NFL Draft order should be determined by:

1. **Non-playoff teams** (picks 1-18): Ordered by 2025 regular season record (worst to best)
2. **Playoff teams** (picks 19-32): Ordered by round eliminated, then by record

**Data source:** https://www.espn.com/nfl/draft/rounds

### Required Columns for `gm_draft_order`

| Column | Type | Description |
|--------|------|-------------|
| sport | TEXT | 'nfl' |
| draft_year | INTEGER | 2026 |
| pick_number | INTEGER | 1-259 (7 rounds × 32 teams + comp picks) |
| round | INTEGER | 1-7 |
| team_key | TEXT | e.g., 'chi', 'gb', 'det' |
| team_name | TEXT | e.g., 'Chicago Bears' |
| team_logo | TEXT | ESPN CDN URL |
| team_color | TEXT | Hex color code |

### Bears Draft Position

Based on Bears' 11-6 record and Divisional Round elimination, they should pick somewhere in the 19-24 range in each round.

---

## Workaround

SM code now falls back to the most recent available year if 2026 isn't found. This allows users to run mock drafts, but the order may not reflect the actual 2026 draft positions.

---

## Also Needed (Lower Priority)

- **2026 MLB Draft Order** - Cubs and White Sox are also eligible (offseason)
- Update `gm_draft_prospects` to include 2026 class prospects

---

## Questions

1. What year(s) currently exist in `gm_draft_order` for NFL?
2. When can 2026 NFL draft order be populated?
3. Should we use projected order based on current standings, or wait until order is finalized?

Thank you!
