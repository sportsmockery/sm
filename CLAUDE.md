# SportsMockery - Claude Project Knowledge Base

> **Last Updated:** January 25, 2026 (ESPN ID fix applied)
> **Purpose:** This file contains everything Claude needs to know to work on this project.

---

## Project Overview

**Product:** SportsMockery - Chicago sports news and fan engagement platform
**URL:** https://test.sportsmockery.com (test), https://sportsmockery.com (production)
**Owner:** Chris

### Tech Stack
- **Framework:** Next.js 16+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS

---

## Styling Rules (IMPORTANT)

### Always Use Inline Styles for Button Colors
Tailwind classes for colors/borders on buttons often get overridden by other CSS. **Always use inline `style={{}}` for:**
- `backgroundColor`
- `color`
- `border`
- `outline`
- SVG `stroke` color

**Example - Correct:**
```jsx
<Link
  href="/fan-chat"
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded"
  style={{
    backgroundColor: theme === 'dark' ? '#ffffff' : '#bc0000',
    color: theme === 'dark' ? '#bc0000' : '#ffffff',
    border: 'none',
    outline: 'none',
  }}
>
  <svg stroke={theme === 'dark' ? '#bc0000' : '#ffffff'} ...>
```

**Example - Wrong (will get overridden):**
```jsx
<Link
  className={`... ${theme === 'dark' ? 'bg-white text-[#bc0000]' : 'bg-[#bc0000] text-white'}`}
>
```

### Brand Colors
- **Primary Red:** `#bc0000`
- Use this for CTA buttons, accents, and highlights

### Teams Covered
- Chicago Bears (NFL)
- Chicago Bulls (NBA)
- Chicago Blackhawks (NHL)
- Chicago Cubs (MLB)
- Chicago White Sox (MLB)

---

## Team Pages (CRITICAL REFERENCE)

When the user says "Team Pages", they mean the team hub pages at `/chicago-{team}/` with sub-pages for players, roster, schedule, scores, and stats for all 5 Chicago teams (Bears, Bulls, Blackhawks, Cubs, White Sox).

**NEVER mark team pages as complete without verifying ALL data is displaying correctly.**

### Data Flow Architecture

```
Team Pages → Data Layer (src/lib/{team}Data.ts) → Datalab Supabase
```

### Datalab Reference Document

The **authoritative** Datalab integration guide is at:
`/Users/christopherburhans/Documents/projects/sm-data-lab/docs/SportsMockery_Integration_Guide.md`

SM's reference doc is at: `/docs/Team_Pages_Query.md`

---

### CRITICAL: Season Year Storage (Differs by Sport!)

**CONFIRMED BY DATALAB (Jan 25, 2026)**

| Sport | Stored As | Jan 2026 Season Value | Example |
|-------|-----------|----------------------|---------|
| **NFL** | Starting year | `2025` | 2025-26 season = 2025 |
| **NBA** | **ENDING year** | `2026` | 2025-26 season = **2026** |
| **NHL** | **ENDING year** | `2026` | 2025-26 season = **2026** |
| **MLB** | Calendar year | `2025` (offseason) | 2025 season = 2025 |

**NBA AND NHL USE ENDING YEAR!** Query Bulls and Blackhawks with `season = 2026` for the 2025-26 season.

**CONFIRMED:** There is NO `season_start_year` column in any tables - use `season` only.

---

### CRITICAL: Active Roster Column Names

| Team | Column Name | Note |
|------|-------------|------|
| Bears | `is_active` | |
| Bulls | **`is_current_bulls`** | Different from others! |
| Blackhawks | `is_active` | |
| Cubs | `is_active` | Also check `data_status != 'needs_roster_review'` |
| White Sox | `is_active` | Also check `data_status != 'needs_roster_review'` |

---

### CRITICAL: Stats Join Patterns DIFFER BY TEAM (Jan 25, 2026)

**Join patterns are NOT the same for all teams!** Data Lab confirmed:

| Team | Join Pattern | Code Usage |
|------|--------------|------------|
| **Bears** | `bp.id = bpgs.player_id` | Use `player.internalId` (number) |
| **Bulls** | `bp.player_id = bpgs.player_id` | Use `player.playerId` (string) |
| **Blackhawks** | `bp.espn_id = bpgs.player_id` | Use `player.playerId` (string) |
| **Cubs** | `cp.espn_id = cpgs.player_id` | Use `player.playerId` (string) |
| **White Sox** | `wp.espn_id = wpgs.player_id` | Use `player.playerId` (string) |

**Bears uses internal ID, all others use ESPN ID!**

```typescript
// BEARS - use internal database ID
const stats = await query.from('bears_player_game_stats').eq('player_id', player.internalId)

// ALL OTHER TEAMS - use ESPN ID (playerId)
const stats = await query.from('bulls_player_game_stats').eq('player_id', player.playerId)
```

**Player Interface Structure:**
```typescript
interface Player {
  playerId: string    // ESPN ID (use for Bulls, Blackhawks, Cubs, White Sox)
  internalId: number  // Database ID (use ONLY for Bears)
  // ... other fields
}
```

---

### CRITICAL: Player Stats Column Names by Sport

#### NFL (Bears)
```
passing_cmp, passing_att, passing_yds, passing_td, passing_int
rushing_car, rushing_yds, rushing_td
receiving_rec, receiving_tgts, receiving_yds, receiving_td
def_tackles_total, def_sacks, def_int
fum_fum
```
**Foreign key:** `player_id` → ESPN ID (NOT `bears_players.id`)
**Game key:** `bears_game_id` (NOT `game_id`)

#### NBA (Bulls)
```
points, total_rebounds, offensive_rebounds, defensive_rebounds
assists, steals, blocks, turnovers, personal_fouls
field_goals_made, field_goals_attempted
three_pointers_made, three_pointers_attempted
free_throws_made, free_throws_attempted
minutes_played, plus_minus
```

#### NHL (Blackhawks)
```
goals, assists, points, plus_minus
shots_on_goal, hits, blocked_shots
saves, goals_against (goalie)
```
**OT Loss Logic (CONFIRMED BY DATALAB):** Use ONLY `is_overtime = true` (covers both OT and shootout losses):
```sql
-- OT Losses (includes shootout) - returns the 8 OTL in 21-22-8 record
WHERE blackhawks_win = false AND is_overtime = true
```

#### MLB (Cubs/White Sox)
```
-- Batting
at_bats, hits, runs, rbi, home_runs, walks, strikeouts

-- Pitching
innings_pitched, hits_allowed, runs_allowed, earned_runs
walks_allowed, strikeouts_pitched
```

---

### CRITICAL: Record Query Best Practice

**ALWAYS use `{team}_seasons` table for authoritative win/loss records.**

Calculating records from `{team}_games_master` can be inaccurate because:
- Future games may have `{team}_win = false` with 0-0 scores
- Filtering by `score > 0` may still have edge cases

```typescript
// WRONG - calculating from games_master
const { data } = await supabase
  .from('bulls_games_master')
  .select('bulls_win')
  .eq('season', 2026)
const losses = data.filter(g => g.bulls_win === false).length // Includes future games!

// CORRECT - use seasons table (recommended by Datalab)
const { data } = await supabase
  .from('bulls_seasons')
  .select('wins, losses')
  .eq('season', 2026)
  .single()
// Returns: { wins: 23, losses: 22 }
```

---

### Verified Records (Jan 25, 2026)

| Team | Table | Season | Record | Notes |
|------|-------|--------|--------|-------|
| Bears | `bears_season_record` | 2025 | 11-6 | Complete |
| Bulls | `bulls_seasons` | 2026 | **23-22** | In progress |
| Blackhawks | `blackhawks_seasons` | 2026 | 21-22-8 | In progress |
| Cubs | `cubs_seasons` | 2025 | **98-76** | Offseason |
| White Sox | `whitesox_seasons` | 2025 | 61-106 | Offseason |

**Bears roster of 81 (CONFIRMED BY DATALAB):** 53 active + 16 practice squad + ~12 IR/other. Display all - there's no column to filter further.

---

### Verification Checklist Before Marking Complete

#### Scores Page (`/chicago-{team}/scores`)
- [ ] Game selector shows all completed games
- [ ] Stats tables have data (not "No stats available")
- [ ] Player names and photos display

#### Players Page (`/chicago-{team}/players`)
- [ ] Player selector works
- [ ] Player profile displays bio info
- [ ] Season stats display (not "No stats recorded")

#### Stats Page (`/chicago-{team}/stats`)
- [ ] Team record matches official (check against espn.com)
- [ ] Leaderboards have players with stats

#### Schedule Page (`/chicago-{team}/schedule`)
- [ ] Games display (not "0 games")
- [ ] Completed games show scores

---

### How to Debug Missing Stats

1. **Check the API response**: Browser DevTools → Network → find the API call
2. **Check column names**: Compare with list above
3. **Check join columns**: `player_id` must match `{team}_players.id` (internal ID)
4. **Check season value**: Use correct year per sport (NHL = ending year!)
5. **Test in Datalab**: Run SQL directly in Supabase dashboard

---

### Live Games (10-Second Polling)

During live games, Datalab updates every 10 seconds. SM must poll at the same rate.

| Table | Purpose |
|-------|---------|
| `live_games_registry` | Active games across all sports |
| `{team}_games_live` | Live scores, quarter/period, time |
| `{team}_player_stats_live` | Live player stats |

```javascript
const LIVE_POLL_INTERVAL = 10_000    // During live games
const STANDARD_POLL_INTERVAL = 60_000 // No live games
```

---

### Tables Reference

| Team | Games | Players | Stats | Seasons |
|------|-------|---------|-------|---------|
| Bears | `bears_games_master` | `bears_players` | `bears_player_game_stats` | `bears_season_record` |
| Bulls | `bulls_games_master` | `bulls_players` | `bulls_player_game_stats` | `bulls_seasons` |
| Blackhawks | `blackhawks_games_master` | `blackhawks_players` | `blackhawks_player_game_stats` | `blackhawks_seasons` |
| Cubs | `cubs_games_master` | `cubs_players` | `cubs_player_game_stats` | `cubs_seasons` |
| White Sox | `whitesox_games_master` | `whitesox_players` | `whitesox_player_game_stats` | `whitesox_seasons` |

---

## Team Pages Audit Protocol (RUN EVERY SESSION)

**CRITICAL:** At the start of every session involving team pages, run a quick health check.

### Audit Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **Frontend Audit** | `/docs/TeamPages_Audit.md` | Comprehensive frontend checklist |
| **Data Lab Audit** | `/docs/TeamPages_Audit_Datalab.md` | Database verification guide |

### Quick Health Check (Run First)

Before making any team page changes, verify data is displaying:

```bash
# Check all team pages return 200
for team in "chicago-bears" "chicago-bulls" "chicago-blackhawks" "chicago-cubs" "chicago-white-sox"; do
  for page in "schedule" "scores" "stats" "roster" "players"; do
    curl -s -o /dev/null -w "${team}/${page}: %{http_code}\n" "https://test.sportsmockery.com/${team}/${page}"
  done
done
```

### Inter-Claude Communication Protocol

When encountering data issues, communicate with Data Lab using this format:

```markdown
## Data Lab Request

**From:** Claude Code (SM Frontend)
**Date:** [Current Date]
**Priority:** [Critical/High/Medium/Low]

### Issue Summary
[1-2 sentence description]

### Affected Tables
- Table: `[table_name]`
- Expected: [what data should return]
- Actual: [what data is returning]

### Verification
- Checked official source: [ESPN/MLB/NHL/NBA/NFL.com URL]
- Correct value: [value]

### Requested Action
[Specific fix needed]
```

### Correct Table Names (MEMORIZE THESE)

| Data | Correct Table | WRONG Table |
|------|---------------|-------------|
| Bears record | `bears_season_record` | ~~bears_seasons~~ |
| Blackhawks OTL | Column is `otl` | ~~ot_losses~~ |
| Bulls active roster | `is_current_bulls` | ~~is_active~~ |
| All games filters | Include `score > 0` filter | Raw count |

### Season Values (MEMORIZE THESE)

| League | Current Season | Convention |
|--------|---------------|------------|
| NFL | `2025` | Starting year |
| NBA | `2026` | ENDING year |
| NHL | `2026` | ENDING year |
| MLB | `2025` | Calendar year |

### Automatic Verification Steps

1. **Check records match official sources** (ESPN, league sites)
2. **Check roster counts are reasonable:**
   - NFL: 53-81 (roster + practice squad)
   - NBA: 15-18
   - NHL: 20-23
   - MLB: 32-40 (NOT 200+!)
3. **Check all pages load without errors**
4. **Check stats are populated (not "—" or 0.0)**

### If Issues Found

1. First check if it's a frontend query issue (wrong table/column/season)
2. If frontend is correct, send Data Lab Request
3. Wait for Data Lab Response before making further changes
4. After Data Lab fixes, clear Vercel cache: `vercel --prod --force`

---

## Team Pages Health Check Cron Job

**Endpoint:** `/api/cron/team-pages-health`
**Schedule:** Every hour at minute 15 (`15 * * * *`)
**Admin Dashboard:** `/admin/team-pages-sync`

### What It Checks

1. **HTTP Status**: All team page URLs return 200
2. **Record Table**: Season record exists for current season
3. **Games Count**: Games exist for current season
4. **Roster Count**: Active players within expected range
5. **Stats Count**: Player stats exist for current season
6. **ESPN ID Mapping**: Verifies player-to-stats join works correctly

### ESPN ID Mapping Check

The cron job validates that ESPN IDs from the players table can be found in the stats table:

```typescript
// If < 50% of active players have matching stats, it reports an error:
"ESPN ID mapping issue: only X/Y active players have matching stats"
```

### Expected Roster Ranges

| Team | Min | Max | Notes |
|------|-----|-----|-------|
| Bears | 53 | 90 | Roster + practice squad |
| Bulls | 15 | 20 | NBA roster |
| Blackhawks | 20 | 25 | NHL roster |
| Cubs | 26 | 45 | 40-man roster |
| White Sox | 26 | 45 | 40-man roster |

### Key Files

| File | Purpose |
|------|---------|
| `/src/app/api/cron/team-pages-health/route.ts` | Cron endpoint |
| `/src/app/admin/team-pages-sync/page.tsx` | Admin dashboard |
| `/vercel.json` | Cron schedule configuration |

### Adding to vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/team-pages-health",
      "schedule": "15 * * * *"
    }
  ]
}
```

---

## Scout AI - Chicago Sports AI Assistant

**Scout AI** is the AI-powered sports assistant for Chicago sports questions. When the user mentions "Scout", "Scout AI", "the AI model", or "query AI", they are referring to this system.

**Branding:** Always display as "Scout AI" with the Scout icon at `/downloads/scout-v2.png`.

### Where Scout AI Lives
| Location | Description |
|----------|-------------|
| Backend | https://datalab.sportsmockery.com/api/query |
| Frontend | /scout-ai page on test.sportsmockery.com |
| API Route | /src/app/api/ask-ai/route.ts (proxies to Data Lab) |
| Icon | `/downloads/scout-v2.png` (use Image component) |

### How Scout Works
1. User submits question on /scout-ai page
2. Frontend sends POST to /api/ask-ai with `{ query, sessionId }`
3. API route proxies to Data Lab: https://datalab.sportsmockery.com/api/query
4. Data Lab uses Perplexity sonar-pro model to generate response
5. Response includes: `response`, `sessionId`, `sessionContext`, `chartData`, `bonusInsight`

### Session Management
Scout maintains conversation context for follow-ups:
- **sessionId**: Passed between requests to maintain context
- **sessionContext**: `{ player, team, season, sport }` for pronoun resolution
- Pronouns like "he", "his", "that player" resolve to last mentioned entity

### Key Files
| File | Purpose |
|------|---------|
| `/src/app/api/ask-ai/route.ts` | Proxies requests to Data Lab API |
| `/src/app/ask-ai/page.tsx` | Scout AI chat interface |
| `/downloads/scout-v2.png` | Scout AI icon (use with Image component) |
| `/AskAI_Wrong.md` | QA test failure log |

### Known Issues (from QA testing)
See `/AskAI_Wrong.md` for documented failures:
1. Citation markers [1][2][3] appearing in responses
2. Player name typo handling needs improvement
3. Database errors sometimes leak to user responses

---

## Frontend Error Logging System (CRITICAL)

**USE THIS FOR ALL FRONTEND ERRORS** - Scout AI, API calls, data fetching, etc.

A shared `scout_errors` table exists in Supabase for logging frontend errors. This enables debugging between frontend and Data Lab teams.

### Error Logging Utility

**Location:** `src/lib/scoutErrorLogger.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export type FrontendErrorType = 'timeout' | 'cors' | 'parse' | 'network' | 'api' | 'unknown'

interface LogErrorParams {
  errorType: FrontendErrorType
  errorMessage: string
  userQuery?: string
  sessionId?: string
  responseTimeMs?: number
  requestPayload?: Record<string, unknown>
  responsePayload?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export async function logFrontendError(params: LogErrorParams): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('scout_errors').insert({
      source: 'frontend',
      error_type: params.errorType,
      error_message: params.errorMessage,
      user_query: params.userQuery,
      session_id: params.sessionId,
      response_time_ms: params.responseTimeMs,
      request_payload: params.requestPayload,
      response_payload: params.responsePayload,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      metadata: params.metadata,
    })
  } catch (e) {
    console.error('[Error Logger] Failed:', e)
  }
}

export function getErrorType(error: unknown): FrontendErrorType {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('timeout') || msg.includes('aborted')) return 'timeout'
    if (msg.includes('cors')) return 'cors'
    if (msg.includes('json') || msg.includes('parse')) return 'parse'
    if (msg.includes('network') || msg.includes('fetch')) return 'network'
  }
  return 'unknown'
}
```

### Error Types (Use Consistently)

| Type | When to Use |
|------|-------------|
| `timeout` | Request exceeded time limit |
| `cors` | CORS policy blocked request |
| `parse` | Failed to parse JSON response |
| `network` | Network connection failed |
| `api` | API returned error response (4xx/5xx) |
| `unknown` | Any other error |

### Usage Pattern

**Wrap ALL API calls with error logging:**

```typescript
import { logFrontendError, getErrorType } from '@/lib/scoutErrorLogger'

async function fetchData(query: string) {
  const startTime = Date.now()

  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      await logFrontendError({
        errorType: 'api',
        errorMessage: `HTTP ${response.status}`,
        userQuery: query,
        responseTimeMs: Date.now() - startTime,
      })
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()

  } catch (error) {
    await logFrontendError({
      errorType: getErrorType(error),
      errorMessage: error instanceof Error ? error.message : String(error),
      userQuery: query,
      responseTimeMs: Date.now() - startTime,
    })
    throw error
  }
}
```

### Viewing Errors

```sql
-- Recent frontend errors
SELECT created_at, error_type, error_message, user_query, response_time_ms
FROM scout_errors
WHERE source = 'frontend'
ORDER BY created_at DESC
LIMIT 20;

-- Error counts by type (last 24h)
SELECT error_type, COUNT(*) as count
FROM scout_errors
WHERE source = 'frontend' AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type;

-- Slow requests (over 10s)
SELECT * FROM scout_errors
WHERE response_time_ms > 10000
ORDER BY created_at DESC;
```

### Table Schema

```sql
CREATE TABLE scout_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT NOT NULL,           -- 'frontend' or 'backend'
  error_type TEXT NOT NULL,       -- timeout, cors, parse, network, api, unknown
  error_message TEXT,
  user_query TEXT,
  session_id TEXT,
  response_time_ms INTEGER,
  request_payload JSONB,
  response_payload JSONB,
  user_agent TEXT,
  metadata JSONB
);
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/scoutErrorLogger.ts` | Error logging utility |
| `/docs/Scout_Log/` | Debug session logs |
| `/docs/Scout_Log/INTEGRATION_INSTRUCTIONS_TESTSM.md` | Full integration guide |

### When to Log Errors

**ALWAYS log errors for:**
- Scout AI queries
- Team pages data fetching
- Any API route failures
- External service calls (Data Lab, etc.)

**DON'T log:**
- User validation errors (empty form fields, etc.)
- Expected "no results" responses
- Client-side navigation errors

---

## PostIQ - Admin Content Assistant

**PostIQ** is the AI-powered content assistant for admin post creation. When the user mentions "PostIQ", "admin AI", or "content assistant", they are referring to this system.

**Note:** PostIQ is separate from Scout. Scout answers user sports questions; PostIQ helps admins write posts.

### Where PostIQ Lives
| Location | Description |
|----------|-------------|
| API Route | `/src/app/api/admin/ai/route.ts` |
| Frontend | `/src/components/admin/PostEditor/AIAssistant.tsx` |
| UI Location | AI Assistant panel in `/admin/posts/new` |

### How PostIQ Works
- Uses Claude Sonnet 4 (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- Direct API calls to Anthropic (no Data Lab involved)
- Returns JSON responses parsed by the frontend

### Features
| Feature | Description |
|---------|-------------|
| **Headlines** | Generates 5 alternative headlines for articles |
| **SEO** | Analyzes content, returns optimized title, meta description, keywords, and Mockery Score (1-100) |
| **Ideas** | Generates 5 article ideas based on category/team |
| **Grammar** | Checks grammar, spelling, and punctuation; shows issues with corrections |
| **Excerpt** | Auto-generates 2-3 sentence article summary |
| **Auto-Chart** | Analyzes article, creates chart from data, inserts into content (checkbox in sidebar) |

### API Usage
```typescript
POST /api/admin/ai
{ action: 'headlines' | 'seo' | 'ideas' | 'grammar' | 'excerpt' | 'generate_chart', title, content, category, team }
```

### Key Files
| File | Purpose |
|------|---------|
| `/src/app/api/admin/ai/route.ts` | Backend route handling all PostIQ requests |
| `/src/components/admin/PostEditor/AIAssistant.tsx` | Frontend UI component |
| `/docs/PostIQ_Guide.md` | Full documentation |

---

## Key Features

### Profile / Favorite Teams
- Users can select favorite Chicago teams
- "Eliminate other teams from Homepage" toggle filters feed
- Stored in `sm_user_preferences` table with `eliminate_other_teams` column

### Fan Chat
- AI-powered chat personalities for each team channel
- Chicago Lounge for general sports talk
- Uses `/api/fan-chat/ai-response` endpoint

### Video Section (formerly Podcasts)
- Bears Film Room: /bears-film-room
- Pinwheels & Ivy: /pinwheels-and-ivy

---

## Deployment

**⚠️ CRITICAL: Multiple Claude Code sessions run in parallel. Use the safe deploy command.**

### Deploy Command (Handles Everything Automatically)
```bash
# Commit your changes first, then:
npm run deploy
```

The deploy script automatically:
1. Fetches latest from remote
2. Pulls/rebases if behind (gets other sessions' changes)
3. Attempts auto-rebase if branches diverged
4. Pushes your commits to git
5. Deploys to Vercel

### If Merge Conflicts Occur
The script will abort and show instructions:
```bash
git pull --rebase origin main
# Edit conflicting files to resolve
git add <resolved-files>
git rebase --continue
npm run deploy
```

### Protections in Place
| Layer | What It Does |
|-------|--------------|
| `npm run deploy` | Auto-syncs, pushes, then deploys |
| `bin/vercel` wrapper | Same checks for any `vercel --prod` command |
| Git pre-push hook | Blocks push if diverged |

### NEVER Do These
- ❌ Deploy without committing first
- ❌ Force push (`git push --force`)
- ❌ Run `/usr/local/bin/vercel` directly (bypasses wrapper)

Production URL: https://test.sportsmockery.com

---

## Related Projects

- **SM Data Lab** (`/Users/christopherburhans/Documents/projects/sm-data-lab`)
  - Backend for Scout AI
  - Sports analytics and data
  - URL: https://datalab.sportsmockery.com
