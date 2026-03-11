# SportsMockery - Claude Project Knowledge Base

> **Last Updated:** March 11, 2026
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

## Platform Identity (IMPORTANT)

SM Edge is a **sports intelligence platform**, not a traditional sports blog. It combines editorial storytelling, advanced analytics, fan debate, AI insights (Scout), and interactive participation.

**The experience should feel like:** Twitter-style discovery + Bloomberg-style analytics + The Athletic-style editorial + Reddit-style participation — unified into one platform.

**SM Edge must feel:** modern, intelligent, Chicago-rooted, premium, fast, editorial, analytical.

**Avoid styles that resemble:** sportsbook UIs, ESPN clones, generic blog themes.

**Editorial Principle:** Every feature must reinforce at least one of: Sports Intelligence, Fan Participation, Editorial Credibility. Before adding any feature ask: *"Does this help fans understand the game better or participate more?"* If not, it does not belong.

---

## Design System (ALWAYS FOLLOW)

- **DO NOT** modify the ThemeToggle in `src/components/ThemeToggle.tsx` or Header.tsx — it's finalized.
- **Always use inline `style={{}}` for button colors** (backgroundColor, color, border, outline, SVG stroke). Tailwind color classes get overridden.

### Core Color Palette

SM Edge uses a **strict five-color palette**. No additional accent colors should be introduced.

| Name | Hex | Usage |
|------|-----|-------|
| **Black** | `#0B0F14` | Backgrounds, text (dark mode bg, light mode text) |
| **White** | `#FAFAFB` | Backgrounds, text (light mode bg, dark mode text) |
| **Red** | `#BC0000` | Brand — breaking news, rumors, debate tension, brand emphasis |
| **Edge Cyan** | `#00D4FF` | Intelligence — analytics, charts, Scout AI, system interactions, insight modules |
| **Gold** | `#D6B05E` | Premium — top fan takes, elite GM rank, premium insights, featured moments |

**Rules:**
- **Red = brand** (primary identity, buttons, alerts)
- **Cyan = intelligence** (AI, tech, data-driven features)
- **Gold = premium** (paid tiers, exclusive content)
- **DO NOT** use `#000000` — use `#0B0F14` instead
- **DO NOT** use `#FFFFFF` — use `#FAFAFB` instead
- **NEVER introduce:** orange, emerald, violet, purple, alternate blues. All UI must follow this palette.

### Typography — Space Grotesk (ALWAYS FOLLOW)

**Space Grotesk** is the sole typeface (`--font-space-grotesk` via `next/font/google`, mapped to `font-sans` in Tailwind). **No additional fonts.**

| Context | Weight | Size | Usage |
|---------|--------|------|-------|
| Hero headlines | **Bold (700)** | 64–72px (`text-[clamp(48px,5vw,72px)]`) | Homepage hero, major story moments |
| Article titles | **Medium (500)** | 20–24px | Article headlines, feed card titles |
| Body text | **Regular (400)** | 18px | Article paragraphs, analysis text |
| UI labels | **Regular (400)** | 14px | Buttons, card labels, block labels |
| Metadata | **Regular (400)** | 13px | Timestamps, authors, read time |

- **DO NOT** use other font families unless explicitly told to.
- **DO NOT** size hero headlines below 48px or above 72px.
- **DO NOT** use text smaller than 13px (accessibility).
- Use `font-bold` for heroes, `font-medium` for article titles, default weight for body/UI/metadata.
- **DO NOT** modify `font-family` declarations in `globals.css`, `tokens.css`, or `tailwind.config.ts` unless Chris explicitly asks for a font migration. These files control site-wide typography — changing them breaks the entire site. The branding rules here define the **target standard**; the actual CSS migration is a separate, owner-approved task.

### Motion & Animation

Two categories of motion exist:

**Ambient motion** (background, decorative — slow, 2–6s):

| Effect | Where | Color | CSS Class / Keyframe |
|--------|-------|-------|---------------------|
| **Star pulse** | Breaking news badges, live indicators | `#BC0000` | `animate-pulse-star` — scale 1→1.15 + opacity glow, 2s ease |
| **Cyan telemetry lines** | AI/Scout sections, data borders | `#00D4FF` | `animate-telemetry` — subtle opacity sweep left→right, 4s linear infinite |
| **Data orb rotation** | Stats widgets, score orbs, data hubs | `#00D4FF` / `#D6B05E` | `animate-orb-spin` — rotate 360°, 6s linear infinite |

**Interactive motion** (user-triggered — fast, 200–300ms):

| Effect | Where | Duration |
|--------|-------|----------|
| **Fade-in** | Content appearing | 200–300ms |
| **Slide-up** | Cards entering viewport | 200–300ms |
| **Vote fill** | Poll bar animations | 200–300ms |
| **Chart draw** | Analytics visualizations | 200–300ms |
| **Hover micro-signals** | Cards, buttons, interactive elements | 200ms ease-out, scale 1.02 + subtle glow |

**Rules:**
- Ambient motion should be **subconscious** — users notice it peripherally, not directly
- Interactive motion should be **responsive** — fast and intentional
- Use `prefers-reduced-motion: reduce` to disable all custom animations for accessibility
- **Star pulse** = breaking/live content only (red glow)
- **Telemetry** = AI/intelligence features only (cyan sweep)
- **Orb spin** = data visualization contexts only
- Avoid flashy or distracting animations

### Theme Mode (MANDATORY)

**Light mode is the default.** All components must support both light and dark mode.

**Rules:**
- **DO NOT** create any component without styling for both light and dark mode
- **Light mode = default** — components must look correct with no theme class applied
- Use Tailwind `dark:` variants for dark mode overrides (e.g., `bg-white dark:bg-[#0B0F14]`)
- For inline styles, use CSS variables or conditional logic based on theme context — never hardcode only one mode
- Test every new component visually in both modes before considering it complete
- Glass-morphic containers (`rgba(255,255,255,0.04)`) are dark-mode patterns — provide a light-mode equivalent (e.g., `rgba(11,15,20,0.03)` or solid light backgrounds)
- Text colors must flip: `#0B0F14` text on light backgrounds, `#FAFAFB` text on dark backgrounds
- Accent colors (Red, Cyan, Gold) stay the same in both modes — only backgrounds and text swap
- Borders: use `rgba(0,0,0,0.08)` for light mode, `rgba(255,255,255,0.08)` for dark mode

---

## Layout Standards (ALWAYS FOLLOW)

### Homepage — Full-Screen Hero + Infinite Feed

The homepage is a **two-stage experience**:

```
Stage 1: Full-Screen Hero (100vh) → user scrolls → Stage 2: Infinite Feed
```

**Stage 1 — Hero Entry (`src/components/home/edge-hero.tsx`):**
- Hero **always fills 100% of viewport height** (`min-h-screen`) on initial load
- Feed must NOT be visible until user scrolls
- Hero does NOT collapse or transform into a header — it simply scrolls away
- Hero content may include: Scout prompt, contextual message, quick discovery suggestions
- Hero may dynamically change layout based on mode (Scout Briefing, Breaking Radar, Analytics, Debate Arena) but must always remain **full-screen on entry**

**Hero Layout Rules:**
- Keep the hero vertically balanced — not too high or too low
- Blitz logo (`/blitz_logo.svg`, 240x88) stays top-left, visually light, does not dominate
- Scout identity pill must feel attached to the headline, not floating separately
- Search input is the clear action point — the thing the eye lands on
- **DO NOT:** add giant cards wrapping the hero, side panels, charts, tabs, stats, dashboard widgets, feed cards, giant gradients, or animated gimmicks

**Hero Architecture:**
- Component supports `mode` prop: `"default" | "breaking" | "team" | "analytics" | "debate"`
- Only `"default"` (Scout) mode is implemented now — keep it clean and minimal
- The shell (layout, spacing, input) must be reusable across all future hero modes

**Hero Background Animation (Chicago Stars):**
- **Component:** `src/components/homepage/HeroStatsOrbs.tsx` — canvas-based Chicago six-pointed stars
- **Rendered in:** `src/components/home/edge-hero.tsx` (inside the `<section>` as first child)
- Stars are drawn as proper 6-pointed star polygons (alternating outer/inner radius), NOT circles
- 62 stars on desktop, 37 on mobile — subtle, ambient motion
- 2/3 red (`#BC0000`), 1/3 cyan (`#00D4FF`) with fading trail lines behind each star
- Each star slowly rotates as it drifts
- Respects `prefers-reduced-motion: reduce`
- **Old `ParticleBg` dots removed from `layout.tsx`** — do NOT re-add `<ParticleBg />`
- The old `HomepageFeed.tsx` (used only on `/feed`) has its own orbs — those are separate
- To adjust: edit `HeroStatsOrbs.tsx` — speed, count, opacity, and star shape are all in that one file

**Stage 2 — Feed:** Infinite scroll stream of feed cards generated from article blocks. Begins immediately after the hero.

### Content Width

| Context | Max Width |
|---------|-----------|
| Article body | 720px |
| Homepage feed | 1300px (3-column) |
| Hero content | max-w-2xl (centered) |

### Spacing System

| Context | Size |
|---------|------|
| Section spacing | 64px |
| Paragraph spacing | 20px |
| Card spacing | 24px |

Maintain consistent vertical rhythm.

### Card Design System

Cards are the primary container for feed items, analytics, debates, rumors, and polls.

| Property | Value |
|----------|-------|
| Border radius | 14px |
| Border | `1px solid rgba(11,15,20,0.08)` |
| Padding | 20px |

Cards should feel: structured, minimal, editorial. **Avoid excessive shadows.**

### Mobile Standards

Mobile traffic is the majority.

- Minimum tap target: **44px**
- Cards must stack vertically
- Avoid horizontal scrolling
- Charts must resize responsively
- Support keyboard navigation

---

## Content Architecture

### Block-Driven Content System

**Article blocks are the source of truth.** The platform follows a block-driven content system:

```
Writer → Block Editor → Article JSON → Article Renderer + Feed Extractor → Feed Cards → Homepage Feed
```

Articles are composed from reusable blocks: paragraph, subheading, image, scout insight, chart, player comparison, rumor confidence, trade scenario, debate, poll, reaction stream. Blocks appear in article order.

### Article Templates

| Template | Purpose | Dominant Color |
|----------|---------|---------------|
| Standard News | Fast editorial updates | — |
| Stats / Player Comparison | Data-driven analysis | Cyan |
| Rumor / Trade Simulator | Front office speculation | Red |
| Trending Story | Fan momentum highlights | — |
| Fan Debate | Participation & voting | — |

### Block → Feed Card Mapping

One article can generate **multiple feed moments**:

| Block | Feed Card |
|-------|-----------|
| Paragraph | ArticleCard |
| ChartBlock | AnalyticsCard |
| DebateBlock | DebateCard |
| RumorBlock | RumorCard |
| PollBlock | PollCard |

### Core Article Components

| Component | Purpose | Accent |
|-----------|---------|--------|
| ArticleHeader | Category, headline, subheadline | Red (category) |
| ArticleMeta | Author, role, publish time, read time | — |
| ArticleBody | Width/spacing wrapper | — |
| InsightBlock | Scout AI commentary | Cyan |
| UpdateBlock | Breaking editorial update | Red |
| ChartBlock | Analytics visualization | Cyan |
| PlayerComparisonBlock | Side-by-side comparison | — |
| DraftPickBlock | Mock draft visualization | Gold |
| PollBlock | Fan voting (option A → cyan, B → red) | Cyan/Red |
| DebateBlock | Pro → cyan, Con → red | Cyan/Red |
| RumorConfidenceBlock | Rumor certainty display | Red |
| ReactionStreamBlock | Fan reactions (platform-generated, not writer-authored) | — |
| TopTakeBlock | Premium reactions | Gold |

### Naming Conventions

Components use PascalCase. Suffix meanings:
- **Block** → article primitive
- **Card** → feed component
- **Panel** → editor configuration
- **Renderer** → data → UI mapper

---

## Developer Rules (ALWAYS FOLLOW)

1. Do not duplicate styling logic across components
2. Shared primitives should power both article pages and feed cards
3. Business logic belongs in `lib/`, not inside React components
4. Block editor panels should not control article rendering styles
5. The homepage must render the hero with `min-h-screen`
6. Components must support keyboard navigation, high color contrast, alt text for images
7. No text smaller than 13px

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

### Sidebar & Leaderboard Data Flow (CRITICAL — Single Source of Truth)

**All stats flow from ONE place:** `src/lib/{team}Data.ts` → `get{Team}Stats()` → `leaderboards` object.

```
DB (DataLab) → {team}Data.ts get{Team}Stats() → Team Pages (server components)
                                               → team-sidebar-data.ts → Team Page Sidebars
                                               → /api/team-sidebar → Homepage Feed Sidebar (client)
```

**Rules:**
- Team pages pull from DB via `get{Team}Stats()` — this is the canonical source
- Sidebars and homepage feed mirror the same data from the same functions
- **NEVER create separate DB queries** for sidebar stats — always use the existing leaderboard functions
- If stats are wrong, fix in ONE place: the `getLeaderboards()` function in `{team}Data.ts`
- `team-sidebar-data.ts` calls `get{Team}Stats()` and extracts top leaders — it does NOT query the DB directly

**Leaderboard query safety checklist:**
1. **Always filter `is_opponent = false`** — all `*_player_game_stats` tables contain both team and opponent rows
2. **Always filter by `playersMap.has()`** — only show active roster players
3. **Bears: filter `game_type` in JS** — values are inconsistent (null, empty, 'regular', 'postseason')
4. **MLB (Cubs/WhiteSox): include `walks` in select** — needed for OBP calculation
5. **Verify fallback queries match primary queries** — same columns, same filters

**Leaderboard categories by team:**

| Team | Categories | Sort |
|------|-----------|------|
| Bears | Pass Yds, Rush Yds, Rec Yds, Tackles, Sacks | Total stats |
| Bulls | PTS (total), PPG, RPG, SPG, BPG | PTS by total; others by per-game |
| Cubs | AVG, HR, OBP, RBI, AB | AVG/OBP by rate (min 50 AB); others by total |
| White Sox | AVG, HR, OBP, RBI, AB | Same as Cubs |
| Blackhawks | Goals, Assists, Points, SV%, Goals (#2) | Skaters by total; goalies by SV% |

**Key files:**

| File | Purpose |
|------|---------|
| `src/lib/{team}Data.ts` | Source of truth — DB queries, aggregation, leaderboards |
| `src/lib/team-sidebar-data.ts` | Extracts top leaders from leaderboards for sidebar display |
| `src/app/api/team-sidebar/route.ts` | API route for homepage feed sidebar (client-side fetch) |
| `src/components/homepage/FeedTeamSidebar.tsx` | Compact sidebar for homepage feed (client component) |
| `src/components/team/shared/TeamRosterHighlights.tsx` | Full sidebar for team hub pages (server component) |

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
