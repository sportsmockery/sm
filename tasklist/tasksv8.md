# Bears Data Sync System (v8)

## Overview
Implement ESPN + MySportsFeeds data sync for Bears tables in datalab, with hourly updates and real-time game updates. Sync to test.sportsmockery.com.

**Rules:**
- DO NOT delete any data from datalabs tables
- DO NOT add null information
- DO NOT change the format of datalabs tables
- ESPN is PRIMARY, MySportsFeeds is BACKUP

---

## Tasks

### 1. Inspect current bears_games_master schema
- [x] Query datalab to get current table structure
- [x] Document all existing columns
- [x] Identify which columns need updating for live games

**Current schema:**
- `id` (PK), `game_id`, `external_id`
- `game_date`, `game_time`, `season`, `week`, `game_type`
- `opponent`, `is_bears_home`
- `bears_score`, `opponent_score`, `bears_win`
- `stadium`, `roof`, `temp_f`, `wind_mph`
- `is_playoff`, `verified`

**Columns to update for future games:**
- `bears_score`, `opponent_score`, `bears_win` (live/final scores)
- `game_date`, `game_time` (if schedule changes)
- `temp_f`, `wind_mph` (weather on game day)

### 2. Create ESPN API integration
- [x] Create `src/lib/espn-api.ts` with ESPN endpoints
- [x] Implement scoreboard fetcher (schedules + live games)
- [x] Implement game summary fetcher (detailed stats)
- [x] Add error handling and rate limiting

### 3. Create MySportsFeeds API integration (backup)
- [x] Create `src/lib/mysportsfeeds-api.ts`
- [x] Implement schedule/scores fetcher
- [x] Only used when ESPN fails

### 4. Create Bears data sync service
- [x] Create `src/lib/bears-sync.ts` orchestration layer
- [x] Implement `refreshSchedule()` - fetch and upsert upcoming games
- [x] Implement `syncLiveGame()` - update live game data
- [x] Implement fallback logic (ESPN → MySportsFeeds)

### 5. Create API route for manual sync trigger
- [x] Create `src/app/api/bears/sync/route.ts`
- [x] POST endpoint to trigger sync
- [x] GET endpoint to check sync status

### 6. Create Vercel Cron for hourly sync
- [x] Add cron configuration to `vercel.json`
- [x] Create `src/app/api/cron/bears-sync/route.ts`
- [x] Implement hourly sync logic
- [x] Ensure idempotent, safe to rerun

### 7. Create real-time sync during live games
- [x] Implement live game detection
- [x] Fast polling during active games (every minute via cron)
- [x] Update scores, quarter, clock, possession
- [x] Create `src/app/api/cron/bears-live/route.ts`

### 8. Update BearsStickyBar to use fresh data
- [x] Ensure ticker endpoint reads from synced data
- [x] BearsStickyBar fetches from /api/bears/ticker
- [x] Ticker reads from bears_games_master (already done)

### 9. Test and verify
- [ ] Test ESPN API calls
- [ ] Test fallback to MySportsFeeds
- [ ] Verify hourly cron runs
- [ ] Verify live game updates work
- [ ] Deploy and monitor

---

## Progress Log

### Started: 2025-01-17

**Files created:**
- `src/lib/espn-api.ts` - ESPN NFL API client (primary source)
- `src/lib/mysportsfeeds-api.ts` - MySportsFeeds API client (backup)
- `src/lib/bears-sync.ts` - Sync orchestration layer
- `src/app/api/bears/sync/route.ts` - Manual sync trigger API
- `src/app/api/cron/bears-sync/route.ts` - Hourly cron job
- `src/app/api/cron/bears-live/route.ts` - Live game cron job

**Files modified:**
- `vercel.json` - Added cron configuration
- `src/middleware.ts` - Added /api/cron to public paths

**Cron Schedule:**
- `/api/cron/bears-sync` - Every hour at minute 0 (`0 * * * *`)
- `/api/cron/bears-live` - Every minute (`* * * * *`) - smart polling, only active during game windows

**Data Flow:**
1. ESPN API (primary) → bears_games_master
2. MySportsFeeds API (backup) → bears_games_master (fallback)
3. bears_games_master → /api/bears/ticker → BearsStickyBar

**Rules enforced:**
- DO NOT delete any data
- DO NOT add null values
- DO NOT change table format
- ESPN is PRIMARY, MySportsFeeds is BACKUP

