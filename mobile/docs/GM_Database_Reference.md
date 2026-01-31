# GM Trade Simulator - Database Reference

> **Last Updated:** January 31, 2026
> **Principle:** Supabase-First - All data comes from Supabase tables

---

## Table Structure

### Player Data

| Data Type | Chicago Teams | Other Teams |
|-----------|---------------|-------------|
| Players | `{team}_players` | `gm_{sport}_rosters` |
| Contract Data | EMBEDDED in player tables | EMBEDDED in roster tables |

**Examples:**
- Cubs players: `cubs_players`
- White Sox players: `whitesox_players`
- Other MLB teams: `gm_mlb_rosters`
- Other NFL teams: `gm_nfl_rosters`

### Salary & Cap Data

| Data Type | Table Name |
|-----------|------------|
| Salary Caps | `gm_{sport}_salary_cap` |

**Examples:**
- MLB caps: `gm_mlb_salary_cap`
- NFL caps: `gm_nfl_salary_cap`
- NBA caps: `gm_nba_salary_cap`
- NHL caps: `gm_nhl_salary_cap`

### Draft & Prospects

| Data Type | Table Name |
|-----------|------------|
| Draft Picks | `draft_picks` (unified) |
| MLB Prospects | `gm_mlb_prospects` |
| General Prospects | `draft_prospects` |

### Trade Logic

| Data Type | Table Name |
|-----------|------------|
| Trade Rules | `gm_logic_rules` |

---

## Tables That DO NOT Exist

Never query these tables - they don't exist:

| Wrong Table | Correct Source |
|-------------|----------------|
| `{team}_contracts` | Contract data is in `{team}_players` |
| `{team}_prospects` | Use `draft_prospects` or `gm_mlb_prospects` |
| `gm_{sport}_contracts` | Contract data is in `gm_{sport}_rosters` |
| `draft_{sport}_picks` | Use unified `draft_picks` table |

---

## Contract Data Fields

Contract information is embedded in player/roster tables:

```typescript
interface PlayerContractFields {
  base_salary?: number | null     // Annual salary in dollars
  cap_hit?: number | null         // Salary cap hit in dollars
  contract_years?: number | null  // Years remaining on contract
  contract_expires_year?: number | null  // Year contract expires
  contract_signed_year?: number | null   // Year contract was signed
  is_rookie_deal?: boolean | null // True if on rookie contract
}
```

---

## MLB-Specific: Salary Retention & Cash

For MLB trades, additional financial considerations:

```typescript
interface MLBTradeFinancials {
  salary_retentions?: Record<string, number>  // player_id -> retention % (0-50)
  cash_sent?: number                          // Max $100,000 per CBA
  cash_received?: number                      // Max $100,000 per CBA
}
```

**Rules:**
- Salary retention: 0-50% per CBA rules
- Cash considerations: Max $100,000 direct cash per trade

---

## API Endpoints

All endpoints are relative to `API_BASE_URL` (test.sportsmockery.com):

| Endpoint | Purpose |
|----------|---------|
| `/api/gm/roster` | Get team roster (uses correct tables internally) |
| `/api/gm/teams` | Get opponent teams |
| `/api/gm/cap` | Get salary cap data |
| `/api/gm/prospects` | Get MLB prospects |
| `/api/gm/grade` | Submit trade for AI grading |
| `/api/gm/trades` | Get trade history |
| `/api/gm/leaderboard` | Get global leaderboard |

---

## Key Principle

The GM system follows a **Supabase-First** approach:

1. **Player/Contract Data** → Only from Supabase tables
2. **Trade Grading Knowledge** → Only from `gm_logic_rules` table
3. **No External Sources** → Does not reference external validation sources

Full documentation: `/docs/GM/GM_Database_Optimization_Frontend.md`
