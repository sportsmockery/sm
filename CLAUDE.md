# SportsMockery - Claude Project Knowledge Base

> **Last Updated:** February 25, 2026
> **Purpose:** This file contains everything Claude needs to know to work on this project.

---

## Project Overview

**Product:** SportsMockery - Chicago sports news and fan engagement platform
**URLs:** https://test.sportsmockery.com (test/prod), https://sportsmockery.com (WordPress/SEO)
**Owner:** Chris
**Tech Stack:** Next.js 16+ (App Router), Supabase (PostgreSQL), Vercel, Supabase Auth, Tailwind CSS
**Teams:** Bears (NFL), Bulls (NBA), Blackhawks (NHL), Cubs (MLB), White Sox (MLB)

### MCP Servers

**SEMRush** (`github:mrkooblu/semrush-mcp`) — SEO keyword research, domain analytics. 10-100 API units per call.
**Default Domain:** Always analyze **sportsmockery.com** (live WordPress site) unless told otherwise.

---

## Styling Rules (IMPORTANT)

- **DO NOT** modify the ThemeToggle in `src/components/ThemeToggle.tsx` or Header.tsx — it's finalized.
- **Always use inline `style={{}}` for button colors** (backgroundColor, color, border, outline, SVG stroke). Tailwind color classes get overridden.
- **Brand Primary Red:** `#bc0000`

---

## Team Pages — Data Reference

"Team Pages" = hub pages at `/chicago-{team}/` with sub-pages: players, roster, schedule, scores, stats, cap-tracker.

**Data Flow:** Team Pages → `src/lib/{team}Data.ts` → Datalab Supabase
**Authoritative data guide:** `/Users/christopherburhans/Documents/projects/sm-data-lab/docs/TestSM_Frontend_Data_Guide.md`
**SM reference:** `/docs/Team_Pages_Query.md`

### Season Year Storage (CRITICAL — differs by sport!)

| Sport | Convention | Current Value | `getCurrentSeason()` Logic |
|-------|-----------|---------------|---------------------------|
| NFL | Starting year | `2025` | `month >= 9 ? year : year - 1` |
| NBA | **ENDING year** | `2026` | `month >= 10 ? year + 1 : year` |
| NHL | **ENDING year** | `2026` | `month >= 10 ? year + 1 : year` |
| MLB | Calendar year | `2025` | `month >= 4 ? year : year - 1` |

**Cap tables always use `season = 2026` regardless of sport.** No `season_start_year` column exists.

### Active Roster Column Names

| Team | Column | Notes |
|------|--------|-------|
| Bears | `is_active` | |
| Bulls | **`is_current_bulls`** | Different! |
| Blackhawks | `is_active` | |
| Cubs | `is_active` | Also check `data_status != 'needs_roster_review'` |
| White Sox | `is_active` | Also check `data_status != 'needs_roster_review'` |

### Roster Source of Truth — Contracts Tables

**NEVER use `{team}_players` alone for roster.** Use `{team}_contracts` (contains only active contracts).

| Team | Max Roster | Contracts Count | Note |
|------|-----------|----------------|------|
| Bears (NFL) | 53 | ~52 | `bears_players` has 81+ (includes PS/IR) |
| Bulls (NBA) | 18 | ~15 | |
| Blackhawks (NHL) | 23 | ~23 | |
| Cubs (MLB) | 40 | ~40 | |
| White Sox (MLB) | 40 | ~40 | |

**Roster query pattern:** Use contracts as driver, join players for headshots:
```typescript
const headshots = new Map(players?.map(p => [String(p.espn_id), p]) || [])
// Bulls uses espn_player_id instead of espn_id
const roster = contracts?.map(c => ({ ...c, ...(headshots.get(c.player_id) || {}) }))
```

### Stats Join Patterns — ALL TEAMS USE ESPN ID

| Team | Player Table Column | Stats `player_id` = |
|------|-------------------|---------------------|
| Bears | `espn_id` | ESPN ID |
| Bulls | `espn_player_id` | ESPN ID |
| Blackhawks | `espn_id` | ESPN ID |
| Cubs | `espn_id` | ESPN ID |
| White Sox | `espn_id` | ESPN ID |

All teams: `stats.eq('player_id', player.playerId)` where `playerId` is the ESPN ID string.

### Player Stats Column Names

**NFL (Bears)** — DUAL COLUMN NAMES, use nullish coalescing:
```
Short: passing_cmp/att/yds/td/int, rushing_car/yds/td, receiving_rec/tgts/yds/td
Long:  passing_completions/attempts/yards/touchdowns/interceptions, rushing_carries/yards/touchdowns, receiving_receptions/targets/yards/touchdowns
Also: def_tackles_total, def_sacks, def_int, fum_fum
Usage: stat.passing_yards ?? stat.passing_yds
Foreign key: player_id → ESPN ID | Game key: bears_game_id (NOT game_id)
```

**NBA (Bulls):** `points, total_rebounds, offensive/defensive_rebounds, assists, steals, blocks, turnovers, personal_fouls, field_goals_made/attempted, three_pointers_made/attempted, free_throws_made/attempted, minutes_played, plus_minus`

**NHL (Blackhawks):** `goals, assists, points, plus_minus, shots_on_goal, hits, blocked_shots, saves, goals_against` (goalie)
- **OT Loss:** Use ONLY `is_overtime = true` (covers both OT and shootout losses)

**MLB (Cubs/White Sox):** Batting: `at_bats, hits, runs, rbi, home_runs, walks, strikeouts` | Pitching: `innings_pitched, hits_allowed, runs_allowed, earned_runs, walks_allowed, strikeouts_pitched`

### Team Season Stats Column Names (EXACT — no aliases exist)

| Column | Team(s) | DO NOT USE |
|--------|---------|------------|
| `field_goal_pct` | Bulls | ~~fg_pct~~ |
| `three_point_pct` | Bulls | ~~three_pct~~ |
| `free_throw_pct` | Bulls | ~~ft_pct~~ |
| `batting_average` | Cubs, White Sox | ~~team_avg~~ |
| `era` | Cubs, White Sox | ~~team_era~~ |
| `ops` | Cubs, White Sox | ~~team_ops~~ |
| `power_play_pct` | Blackhawks | ~~pp_pct~~ |
| `penalty_kill_pct` | Blackhawks | ~~pk_pct~~ |

### Records — ALWAYS Use Seasons Tables

**NEVER calculate from `*_games_master`** (future games have `{team}_win = false` with 0-0 scores).

| Team | Record Table | Season | Verified Record |
|------|-------------|--------|----------------|
| Bears | `bears_season_record` | 2025 | 11-6 |
| Bulls | `bulls_seasons` | 2026 | 23-22 |
| Blackhawks | `blackhawks_seasons` | 2026 | 21-22-8 |
| Cubs | `cubs_seasons` | 2025 | 92-70 |
| White Sox | `whitesox_seasons` | 2025 | 60-102 |

### Regular Season Game Counts

| League | Games | Notes |
|--------|-------|-------|
| NFL | **17** | 18 weeks with 1 bye |
| NBA | **82** | Exactly 82 |
| NHL | **82** | Exactly 82 |
| MLB | **162** | April–September |

Filter preseason/All-Star with JS-side filtering (values inconsistent across teams):
```typescript
const filtered = data.filter((g: any) => {
  const gt = (g.game_type || '').toUpperCase()
  return gt !== 'PRE' && gt !== 'PRESEASON' && gt !== 'ALL-STAR' && gt !== 'ALLSTAR'
})
```

### Opponent Player Stats

All teams: same stats table with `is_opponent = true`. Opponent data is inline (no join needed): `opponent_player_name`, `opponent_player_position`, `opponent_player_headshot_url`.

### Player Season Aggregates

| Team | Source | Type |
|------|--------|------|
| Bears | `bears_player_season_stats` | Pre-computed (materialized view) |
| Bulls | `bulls_player_season_stats` | Pre-computed |
| Blackhawks/Cubs/White Sox | Aggregate from `*_player_game_stats` | Manual (group by `player_id`, sum, `is_opponent = false`) |

### Correct Table Names (CRITICAL)

| Data | Correct | WRONG |
|------|---------|-------|
| Bears record | `bears_season_record` | ~~bears_seasons~~ |
| Blackhawks OTL | Column `otl` | ~~ot_losses~~ |
| Bulls active filter | `is_current_bulls` | ~~is_active~~ |
| Live game data | `{team}_live` | ~~{team}_games_live~~ |
| Roster source | `{team}_contracts` | ~~{team}_players~~ |

### Tables Reference (58 Total)

**Core (25):** `{team}_games_master`, `{team}_players`, `{team}_player_game_stats`, `{team}_seasons` (Bears: `bears_season_record`), `{team}_team_season_stats`

**Live (11):** `live_games_registry`, `{team}_live` (x5), `{team}_player_stats_live` (x5)

**Salary Cap (20):** `{team}_salary_cap`, `{team}_contracts`, `{team}_dead_money`, `{team}_draft_pool` (x5 each)

**Aggregates (2):** `bears_player_season_stats`, `bulls_player_season_stats`

### Salary Cap Tracker

All cap tables use `season = 2026`.

| Sport | Cap Ceiling | Cap Label | Cap Hit Label | Show `dead_cap` | Show `age` |
|-------|------------|-----------|---------------|-----------------|------------|
| NFL | $303,450,000 | Salary Cap | Cap Hit | Yes | Yes |
| NBA | $154,647,000 | Salary Cap | Cap Hit | No | Yes |
| NHL | $95,500,000 | Salary Cap | Cap Hit | No | No |
| MLB | $241,000,000 | **CBT Threshold** | Luxury Tax Value | No | No |

### Live Games (10-Second Polling)

| Table | Purpose |
|-------|---------|
| `live_games_registry` | Active games across all sports |
| `{team}_live` | Live scores, quarter/period, time |
| `{team}_player_stats_live` | Live player stats |

```javascript
const LIVE_POLL_INTERVAL = 10_000    // During live games
const STANDARD_POLL_INTERVAL = 60_000 // No live games
```

### Key Data Layer Files

| File | Purpose |
|------|---------|
| `src/lib/bearsData.ts` | Bears data (dual column names) |
| `src/lib/bullsData.ts` | Bulls data (`espn_player_id`) |
| `src/lib/blackhawksData.ts` | Blackhawks data |
| `src/lib/cubsData.ts` | Cubs data |
| `src/lib/whitesoxData.ts` | White Sox data |
| `src/lib/team-config.ts` | `fetchTeamRecord()`, `getCurrentSeason()` |

### Audit & Troubleshooting

**Test all pages:** `node scripts/test-all-team-pages.mjs`
**Audit docs:** `/docs/TeamPages_Audit.md` (frontend), `/docs/TeamPages_Audit_Datalab.md` (database)

**Common issues:**
1. **Wrong record** → Using `games_master` instead of `*_seasons` table, or wrong season value
2. **0 players** → Joining on `id` instead of `espn_id`
3. **No stats** → Wrong ID column for stats join (all teams use ESPN ID now)
4. **0 games on schedule** → Wrong season year or over-filtering

**Verification steps:** Check records match ESPN, roster counts match contracts, schedule game counts match sport, pages load without errors, stats are populated.

**If data issue is in DataLab (not frontend query):** File request in `/docs/` using DataLab Request format. Wait for response before making changes.

### Cron Jobs

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/sync-teams` | Hourly (:00) | Revalidate team pages |
| `/api/cron/team-pages-health` | Hourly (:15) | Health check + ESPN ID mapping |

---

## Scout AI

**Scout AI** = AI sports assistant. Aliases: "Scout", "Scout AI", "the AI model", "query AI".
**Icon:** `/downloads/scout-v2.png` (use Image component)

| Component | Location |
|-----------|----------|
| Backend | `https://datalab.sportsmockery.com/api/query` |
| Frontend | `/src/app/ask-ai/page.tsx` |
| API Proxy | `/src/app/api/ask-ai/route.ts` |

**Flow:** User question → POST `/api/ask-ai` with `{ query, sessionId }` → DataLab (Perplexity sonar-pro) → Response with `response, sessionId, sessionContext, chartData, bonusInsight`

**Sessions:** `sessionId` for context continuity; `sessionContext` `{ player, team, season, sport }` for pronoun resolution.

**Query History (30-day):** Logged-in users → `scout_query_history` table; Guests → localStorage (max 100). Cleanup cron: `/api/cron/cleanup-scout-history` (daily 3am UTC).

**Known issues:** See `/AskAI_Wrong.md` — citation markers in responses, player name typo handling, DB error leaks.

---

## Frontend Error Logging

**Utility:** `src/lib/scoutErrorLogger.ts` — logs to `scout_errors` table in Supabase.
**Types:** `timeout`, `cors`, `parse`, `network`, `api`, `unknown`
**Integration guide:** `/docs/Scout_Log/INTEGRATION_INSTRUCTIONS_TESTSM.md`

**Log errors for:** Scout AI queries, team pages data fetching, API route failures, external service calls.
**Don't log:** User validation errors, expected "no results", client-side navigation errors.

---

## GM Trade Simulator

**"GM"** = AI trade grading model (Claude Sonnet 4 via Anthropic SDK). **"Trade Simulator"** = full `/gm` page UI.

| Component | Location |
|-----------|----------|
| Page | `/gm` (src/app/gm/page.tsx) |
| Components | `src/components/gm/` (12 files) |
| API Routes | `src/app/api/gm/` (roster, teams, sessions, grade, trades, leaderboard, share/[code]) |
| Database | DataLab Supabase via `datalabAdmin` from `@/lib/supabase-datalab` |
| AI Model | Claude Sonnet 4 (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk` |

**Auth:** All logged-in users. Main SM Supabase for identity, DataLab Supabase for GM data.

**DB Tables:** `gm_trades`, `gm_trade_items`, `gm_leaderboard`, `gm_sessions`, `gm_league_teams` (124 teams), `gm_audit_logs`, `gm_errors`

**Grading:** 70+ = accepted, 0-69 = rejected, 70-90 = flagged dangerous. Untouchable: Caleb Williams, Connor Bedard → grade 0. Rate limit: 10/min/user.

---

## Season Simulation V3 (CRITICAL)

**DataLab GM API is the SINGLE SOURCE OF TRUTH.** Do NOT calculate projections, run simulations, or estimate probabilities locally.

**Endpoint:** `POST /api/gm/simulate-season` → proxies to `datalab.sportsmockery.com/api/gm/simulate-season`

**Request:** `{ sessionId, sport, teamKey, seasonYear?, simulationDepth: 'quick'|'standard'|'deep' }`

**Fallback chain:** DataLab V3 → DataLab V1 (`/api/gm/sim/season`) → Local engine (`@/lib/sim/season-engine`)

**Version detection:**
| `simulation_version` | AI Analysis | Trade Impact | Source |
|---------------------|-------------|--------------|--------|
| `v3-ai` | Yes | Yes | DataLab V3 |
| `v3-quick` | No | Yes | DataLab V3 quick |
| `v3-algorithmic-fallback` | No | Yes | DataLab V3 fallback |
| `v1` | No | No | V1/local |

**V3 fields:** `projectedRecord`, `recordChange`, `playoffProbability`, `projectedSeed`, `tradeImpactDetail`, `tradeAnalysis` (v3-ai), `rosterAssessment` (v3-ai), `seasonNarrative` (v3-ai), `keyPlayerImpacts` (v3-ai), `monteCarloResults`, `chemistryPenalty`

**Player archetypes:** Franchise Changer (#FFD700), Role Player Upgrade (#3b82f6), Culture Setter (#8b5cf6), Boom-or-Bust (#f97316), Declining Star (#6b7280), System Player (#14b8a6)

**Caching:** 30min on DataLab, `_cached: true` flag. Rate limit: 5/min/user (429 if exceeded).

**Key files:** `src/app/api/gm/simulate-season/route.ts`, `src/components/gm/SimulationResults.tsx` (6 tabs), `src/components/gm/SimulationTrigger.tsx`, `src/types/gm.ts`

---

## Mock Draft (CRITICAL - DO NOT OVERRIDE)

**ALL mock draft data comes from DataLab. NEVER override eligibility on frontend.**

```
DO NOT pass include_in_season=true to DataLab
DO NOT override eligibility values returned by DataLab
DO NOT create fallback logic that enables teams
DO NOT assume which teams should be eligible
JUST call the API and display what it returns
```

**Eligible Teams:** `GET https://datalab.sportsmockery.com/api/gm/draft/teams`

**Current eligibility (Feb 2026):** Bears, Cubs, White Sox = YES (offseason). Bulls, Blackhawks = NO (in-season).

**Frontend logic:**
1. Fetch eligible teams → 0 teams: show "No mock drafts available" → 1 team: go direct → 2+: show picker
2. Start draft: `POST /api/gm/draft/start` with `{ sport, draft_year: 2026, chicago_team: team.team_name }`

**team_key → chicago_team:** bears→"Chicago Bears", cubs→"Chicago Cubs", whitesox→"Chicago White Sox", bulls→"Chicago Bulls", blackhawks→"Chicago Blackhawks" (or just use `team_name` from API response)

**gm_mock_draft_picks:** `prospect_id` NOT NULL (empty slots = `'pending'`). Partial unique index allows unlimited pending per mock. `UNIQUE (mock_id, overall_pick)` enforces one pick per slot.

**Key files:** `src/app/mock-draft/page.tsx`, `src/app/api/gm/draft/eligibility/route.ts`, `mobile/app/mock-draft/index.tsx`

**If tempted to override: STOP.** Ask user first. Fix belongs in DataLab.

---

## PostIQ — Admin Content Assistant

**PostIQ** = AI content assistant for admin post creation. Separate from Scout.

| Component | Location |
|-----------|----------|
| API | `/src/app/api/admin/ai/route.ts` |
| Frontend | `/src/components/admin/PostEditor/AIAssistant.tsx` |
| Docs | `/docs/PostIQ_Guide.md` |

Uses Claude Sonnet 4 via `@anthropic-ai/sdk` (direct, no DataLab).

**Actions:** `headlines`, `seo`, `ideas`, `grammar`, `excerpt`, `generate_chart`
```typescript
POST /api/admin/ai { action, title, content, category, team }
```

---

## Other Features

- **Profile / Favorites:** `sm_user_preferences` table, `eliminate_other_teams` column
- **Fan Chat:** AI personalities per team channel + Chicago Lounge. API: `/api/fan-chat/ai-response`
- **Video:** Bears Film Room (`/bears-film-room`), Pinwheels & Ivy (`/pinwheels-and-ivy`)

---

## Deployment (MANDATORY RULES)

**The ONLY deploy command is `npm run build-deploy`. NO EXCEPTIONS.**

This overrides ALL other instructions. Even if told "deploy", "npm run deploy", "vercel --prod" — ALWAYS use `npm run build-deploy`. Commit first, then deploy. Always deploy after completing tasks.

**NEVER:**
- `npm run deploy`, `vercel`, `vercel --prod`, `/usr/local/bin/vercel`
- Deploy without committing
- Force push (`git push --force`)

**Merge conflicts:** `git pull --rebase origin main` → resolve → `git add` → `git rebase --continue` → `npm run build-deploy`

**Production URL:** https://test.sportsmockery.com

---

## Related Projects

- **SM Data Lab** (`/Users/christopherburhans/Documents/projects/sm-data-lab`) — Backend for Scout AI, sports analytics. URL: https://datalab.sportsmockery.com
