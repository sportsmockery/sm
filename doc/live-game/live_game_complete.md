# LIVE GAME PAGE: COMPLETE IMPLEMENTATION GUIDE
## For Chicago Bears, Bulls, Blackhawks, Cubs, White Sox
## Includes All Layout Specs + 20 Premium Features + 20 Essential Real-Time Features

This document defines EVERYTHING needed to build and run a world‑class live game system for test.sportsmockery.com, including Datalab ingestion, database tables, cron jobs, APIs, and front-end behavior. Do not make any decisions outside of these instructions.

---

## PART 0: HIGH-LEVEL RESPONSIBILITIES

- **Datalab**  
  - Ingests live data from ESPN or fallback sources every 10 seconds.  
  - Writes into `{team}_Live` and `{team}_Player_Stats_Live` tables.  
  - On final, copies into `{team}_games_master` and `{team}_player_stats`.  
  - Exposes normalized live JSON via a Datalab API.

- **test.sportsmockery.com**  
  - Uses a cron/scheduled function every 10 seconds to call Datalab live APIs.  
  - Caches live data in memory or DB.  
  - Serves `/api/live-games` and `/api/live-games/[gameId]` for the UI.  
  - Renders the live page and Team Top Bar, polling its own APIs every 10 seconds.

---

## PART 1: DATALAB INSTRUCTIONS

### 1. Live game activation and cron model

For upcoming games, when they start based on date and time (Central Time, USA), there must be **separate cron jobs** that:

- Run every 10 seconds to pull game data from upstream APIs (ESPN or fallback).  
- Populate and update Datalab’s **live tables** for test.sportsmockery.com.  
- Deactivate and archive data when games are final.

If ESPN data does not provide specific fields, you must find another provider and map it into the same schema. Do not change the schema.

### 2. Live tables and master tables

For each team (bears, bulls, blackhawks, cubs, whitesox) create four tables:

- `{team}_Live`
- `{team}_Player_Stats_Live`
- `{team}_games_master`
- `{team}_player_stats`

The two “_Live” tables are **per-game scratch space**, updated every 10 seconds. When games complete, copy rows into the master tables and delete the live rows.

#### 2.1 `{team}_Live` table schema

Example: `bears_Live`.

Columns (exact names):

- `id` bigserial PRIMARY KEY
- `game_id` text NOT NULL UNIQUE  -- same as Datalab `gameId`
- `sport` text NOT NULL           -- `nfl`, `nba`, `nhl`, `mlb`
- `season` integer NOT NULL
- `game_date` timestamptz NOT NULL      -- kickoff/first pitch (UTC)
- `status` text NOT NULL                -- `upcoming`, `in_progress`, `final`, `suspended`
- `home_team_id` text NOT NULL          -- `bears`, `bulls`, etc.
- `away_team_id` text NOT NULL
- `home_team_name` text NOT NULL
- `away_team_name` text NOT NULL
- `home_team_abbr` text NOT NULL
- `away_team_abbr` text NOT NULL
- `home_logo_url` text NOT NULL
- `away_logo_url` text NOT NULL
- `home_score` integer NOT NULL DEFAULT 0
- `away_score` integer NOT NULL DEFAULT 0
- `period` integer NULL                 -- quarter/period/inning number
- `period_label` text NULL              -- `Q1`, `Q2`, `1st`, `Top 7th`, etc.
- `clock` text NULL                     -- `4:23`, `TOP 7, 2 OUT`, etc.
- `home_timeouts` integer NULL
- `away_timeouts` integer NULL
- `venue_name` text NULL
- `venue_city` text NULL
- `venue_state` text NULL
- `temperature` integer NULL
- `weather_condition` text NULL
- `wind_speed` integer NULL
- `broadcast_network` text NULL
- `broadcast_announcers` text NULL
- `live_win_probability_home` numeric NULL  -- 0–1
- `live_win_probability_away` numeric NULL
- `live_spread_favorite_team_id` text NULL
- `live_spread_points` numeric NULL
- `live_moneyline_home` text NULL
- `live_moneyline_away` text NULL
- `live_over_under` numeric NULL
- `last_event_id` text NULL
- `raw_payload` jsonb NOT NULL           -- full Datalab normalized JSON
- `created_at` timestamptz NOT NULL DEFAULT now()
- `updated_at` timestamptz NOT NULL DEFAULT now()

Add trigger to set `updated_at = now()` on UPDATE.

#### 2.2 `{team}_Player_Stats_Live` schema

Example: `bears_Player_Stats_Live`.

Columns:

- `id` bigserial PRIMARY KEY
- `game_id` text NOT NULL         -- FK to `{team}_Live.game_id`
- `player_id` text NOT NULL
- `team_id` text NOT NULL         -- `bears`, `packers`, etc.
- `is_home_team` boolean NOT NULL
- `full_name` text NOT NULL
- `jersey_number` text NULL
- `position` text NULL
- `side` text NULL                -- e.g., `OFF`, `DEF`, `ST` for NFL

NFL stats:

- `nfl_pass_attempts` integer NULL
- `nfl_pass_completions` integer NULL
- `nfl_passing_yards` integer NULL
- `nfl_passing_tds` integer NULL
- `nfl_interceptions` integer NULL
- `nfl_rush_attempts` integer NULL
- `nfl_rushing_yards` integer NULL
- `nfl_rushing_tds` integer NULL
- `nfl_targets` integer NULL
- `nfl_receptions` integer NULL
- `nfl_receiving_yards` integer NULL
- `nfl_receiving_tds` integer NULL
- `nfl_tackles` integer NULL
- `nfl_sacks` numeric NULL
- `nfl_forced_fumbles` integer NULL
- `nfl_fumble_recoveries` integer NULL
- `nfl_passes_defended` integer NULL
- `nfl_qb_hits` integer NULL

NBA stats:

- `nba_minutes` text NULL              -- `MM:SS`
- `nba_points` integer NULL
- `nba_fg_made` integer NULL
- `nba_fg_att` integer NULL
- `nba_fg_pct` numeric NULL
- `nba_3p_made` integer NULL
- `nba_3p_att` integer NULL
- `nba_3p_pct` numeric NULL
- `nba_ft_made` integer NULL
- `nba_ft_att` integer NULL
- `nba_ft_pct` numeric NULL
- `nba_reb_off` integer NULL
- `nba_reb_def` integer NULL
- `nba_reb_total` integer NULL
- `nba_assists` integer NULL
- `nba_steals` integer NULL
- `nba_blocks` integer NULL
- `nba_turnovers` integer NULL
- `nba_fouls` integer NULL
- `nba_plus_minus` integer NULL

NHL stats:

- `nhl_toi` text NULL
- `nhl_goals` integer NULL
- `nhl_assists` integer NULL
- `nhl_points` integer NULL
- `nhl_shots` integer NULL
- `nhl_plus_minus` integer NULL
- `nhl_pim` integer NULL
- `nhl_hits` integer NULL
- `nhl_blocks` integer NULL
- `nhl_faceoffs_won` integer NULL
- `nhl_faceoffs_total` integer NULL

MLB batting stats:

- `mlb_ab` integer NULL
- `mlb_runs` integer NULL
- `mlb_hits` integer NULL
- `mlb_doubles` integer NULL
- `mlb_triples` integer NULL
- `mlb_home_runs` integer NULL
- `mlb_rbi` integer NULL
- `mlb_bb` integer NULL
- `mlb_so` integer NULL
- `mlb_sb` integer NULL
- `mlb_cs` integer NULL
- `mlb_avg` numeric NULL
- `mlb_obp` numeric NULL
- `mlb_slg` numeric NULL
- `mlb_ops` numeric NULL

MLB pitching stats:

- `mlb_ip` numeric NULL
- `mlb_h_allowed` integer NULL
- `mlb_r_allowed` integer NULL
- `mlb_er` integer NULL
- `mlb_bb_allowed` integer NULL
- `mlb_k` integer NULL
- `mlb_hr_allowed` integer NULL
- `mlb_era` numeric NULL
- `mlb_pitches` integer NULL
- `mlb_strikes` integer NULL

Generic:

- `raw_payload` jsonb NOT NULL
- `created_at` timestamptz NOT NULL DEFAULT now()
- `updated_at` timestamptz NOT NULL DEFAULT now()

Add UNIQUE `(game_id, player_id)`.

#### 2.3 Master tables

Use `{team}_games_master` and `{team}_player_stats` as existing season-long tables. They must be able to receive all stat fields above. On final:

- Insert one row per game into `{team}_games_master`.  
- Insert one row per player per game into `{team}_player_stats`.

### 3. Upstream data: ESPN and fallbacks

Inside Datalab:

- Primary source: ESPN live JSON per sport.  
- If ESPN lacks a stat:
  - Use league APIs (NFL, NBA, NHL, MLB) or a commercial provider.  
- Normalize all inputs into the **single Datalab JSON schema** from your earlier live-game spec.  
- Store the raw upstream payload into `raw_payload` columns for later debugging.

### 4. Chron jobs inside Datalab

#### 4.1 Game activation cron (every 1 minute)

- Fetch scheduled games from team schedule/master tables.  
- If `now() (CST)` >= game’s scheduled `game_date` and `status = 'upcoming'`:
  - Insert or update row in `{team}_Live` with `status = 'in_progress'`.  
  - Insert placeholder rows into `{team}_Player_Stats_Live` as needed.  
  - Mark this `game_id` as active (e.g., in a `live_games_registry` table).

#### 4.2 Live ingest cron (every 10 seconds)

For each active `game_id`:

1. Determine source API URL (ESPN / fallback).  
2. Fetch JSON.  
3. Normalize JSON into:
   - `live_game_row` for `{team}_Live`.  
   - A list of `live_player_rows` for `{team}_Player_Stats_Live`.  
4. Upsert them:
   - `{team}_Live`: upsert by `game_id`.  
   - `{team}_Player_Stats_Live`: upsert by `(game_id, player_id)`.

If upstream status says `final`:

- Set `{team}_Live.status = 'final'` for that game.

#### 4.3 Archival cron (every 1 minute)

For any `{team}_Live` with `status = 'final'` and not yet archived:

1. Insert summary row into `{team}_games_master`.  
2. Insert all associated player rows from `{team}_Player_Stats_Live` into `{team}_player_stats`.  
3. Delete from `{team}_Player_Stats_Live` and `{team}_Live`.  
4. Mark game as archived (e.g., in master table `archived_at`).

### 5. Datalab live API

Expose a read-only Datalab API:

- `GET /live/games` → returns array of all active live games (from `{team}_Live`).  
- `GET /live/games/{gameId}` → returns the full live JSON for that game, including:
  - All fields from the original live game schema.  
  - A `players` property combining home and away live stats.

test.sportsmockery.com must only call these endpoints.

---

## PART 2: test.sportsmockery.com INSTRUCTIONS

### 1. Backend cron (app side) every 10 seconds

Implement a backend job (cron or scheduled function) that runs every 10 seconds:

- Calls `Datalab /live/games`.  
- For each game:
  - Cache the full Datalab JSON for that `gameId` in:
    - In-memory store (Redis) OR  
    - App DB tables `live_games` and `live_player_stats` (optional mirror).  

Expose internal APIs:

- `GET /api/live-games` → returns all live games from the cache.  
- `GET /api/live-games/[gameId]` → returns single game + player stats.

The UI must ONLY use these `/api/live-games` endpoints.

### 2. Live page data flow

For the route pattern:

- `/live/{sport}/{gameId}`

Behavior:

- On initial load:
  - Call `/api/live-games/[gameId]`.  
- Poll every 10 seconds:
  - Call `/api/live-games/[gameId]` again.  
- Use this JSON to drive all UI elements:
  - Header  
  - Hero  
  - Play-by-play  
  - Box score, stats, visualizations  
  - Leaders, lineups, injuries, odds  
  - Recap and exports on final.

No direct calls to Datalab or ESPN in browser.

### 3. Team Top Bar behavior

The Team Top Bar appears on:

- Homepage.  
- Each team page:
  - `/chicago-bears`
  - `/chicago-bulls`
  - `/chicago-blackhawks`
  - `/chicago-cubs`
  - `/chicago-white-sox`.

Behavior:

- Poll `/api/live-games` every 10 seconds.  
- For each game where `status = 'in_progress'` and `homeTeam.teamId` or `awayTeam.teamId` is a Chicago team:

  - On homepage:
    - Display a live pill per game (all Chicago teams).  
  - On team-specific page:
    - Display only pills where that team is involved.

Live pill contents:

- Chicago logo (larger) + opponent logo (smaller).  
- Score: `CHI 24 – 21 GB`.  
- Status snippet: `Q4 2:34`, `TOP 7`, etc.  
- Red `LIVE` badge.

Click behavior:

- Clicking any live pill navigates to `/live/{sport}/{gameId}` for that game.  
- There can be more than one live pill at once; each represents a distinct live page.

---

## PART 3: LIVE PAGE UI & FEATURES

The following UI requirements are for test.sportsmockery.com and must use the data described above.

### 1. Overall layout

- Sticky header  
- Hero section  
- Main content grid (3 columns desktop, stacked on mobile):

  - Left: Play-by-play  
  - Center: Box score, team comparison, charts  
  - Right: Leaders, lineups, injuries, odds, standings, polls, social

### 2. Sticky header (scoreboard)

Use the header spec previously defined:

- Large Chicago logo vs opponent logo.  
- Scores (home vs away, Chicago emphasized).  
- Period + game clock.  
- LIVE badge (or FINAL).  
- Broadcast info.  
- Optional team records/seed.

Clock updating client-side every second.

### 3. Hero section

Cards:

1. **Matchup + Venue**  
   - Team names, records, seeds, logos.  
   - Venue + weather + attendance.

2. **Pre-Game Team Stats & Rankings**  
   - Season stats with ranks (offense/defense metrics per sport).

3. **Season Snapshot / Live summary**  
   - Simple season synopsis or live high-level stats.

### 4. Play-by-play feed (left column)

Implement:

- Chronological commentary log:
  - Timestamp / game clock.  
  - Down-and-distance, inning count, period (sport-specific).  
  - Event icon.  
  - Description text.  
  - Players involved.

New plays:

- Insert at top.  
- Animate slide-in.  
- Don’t snap scroll if user is reading older plays; show “new plays” banner.

### 5. Box scores & stats (center column)

Implement:

- Full player box per sport:
  - NFL, NBA, NHL, MLB as already described.  
- Team stat comparison:
  - Live totals + percentages side-by-side with bar visuals.

### 6. Analytical visuals (center column)

Implement:

- Game flow chart (score margin over time).  
- Win probability chart (from `momentum.winProbabilityHome/Away`).  
- Shot/heat/hit maps (NBA/NHL/MLB).  
- NFL drive chart.  
- MLB pitch-by-pitch tracker.

### 7. Leaders, lineups, injuries, standings, odds (right column)

Implement cards:

- Leaders / Top performers  
- Lineups:
  - Current players on the field/ice/court and batting order.  
- Injury report  
- Standings + playoff implications  
- Matchup stats (e.g., batter vs pitcher)  
- Live odds & lines (from `oddsAndBetting`)  
- Bench & special teams stats  
- Advanced metrics (TS%, EPA/play, OPS, etc.) in a collapsible panel  
- Fan poll widget (results-only, optional)

### 8. Post-game recap & export

On final:

- Show final score line and status.  
- Recap headline and summary.  
- Video highlights carousel.  
- Key moments carousel.  
- CSV & PDF export of box score and play-by-play.  
- Social share buttons with Chicago hashtags.  
- Matchup history summary.

---

## PART 4: POLLING & UPDATE RULES

- Datalab:
  - Activator cron: every 1 minute.  
  - Ingest cron: every 10 seconds.  
  - Archival cron: every 1 minute.

- test.sportsmockery.com:
  - Backend cron to Datalab: every 10 seconds.  
  - `/api/live-games` cache ensures fresh data.  
  - Frontend:
    - Live page polls `/api/live-games/[gameId]` every 10 seconds.  
    - Team Top Bar polls `/api/live-games` every 10 seconds.  
    - Header clock updates every second in the browser.

Do not alter these intervals.

---

## PART 5: IMPLEMENTATION CHECKLIST

You must:

- Create all Datalab tables and crons exactly as defined.  
- Implement Datalab `/live/games` and `/live/games/{gameId}` endpoints.  
- Implement test.sportsmockery.com cron that populates `/api/live-games`.  
- Build `/live/{sport}/{gameId}` pages using this spec.  
- Implement Team Top Bar with live pills linking to live pages.  
- Ensure page is responsive and mobile-optimized.  
- Ensure no frontend talks directly to ESPN or other external providers.

Do not deviate from any of these details.

