# SportsMockery - Claude Project Knowledge Base

> **Last Updated:** January 25, 2026
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

| Sport | Stored As | Jan 2026 Season Value | Example |
|-------|-----------|----------------------|---------|
| **NFL** | Starting year | `2025` | 2025-26 season = 2025 |
| **NBA** | **ENDING year** | `2026` | 2025-26 season = **2026** |
| **NHL** | **ENDING year** | `2026` | 2025-26 season = **2026** |
| **MLB** | Calendar year | `2025` (offseason) | 2025 season = 2025 |

**NBA AND NHL USE ENDING YEAR!** Query Bulls and Blackhawks with `season = 2026` for the 2025-26 season.

There is NO `season_start_year` column in Blackhawks tables - use `season` only.

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

### CRITICAL: Player Stats Column Names by Sport

#### NFL (Bears)
```
passing_cmp, passing_att, passing_yds, passing_td, passing_int
rushing_car, rushing_yds, rushing_td
receiving_rec, receiving_tgts, receiving_yds, receiving_td
def_tackles_total, def_sacks, def_int
fum_fum
```
**Foreign key:** `player_id` → `bears_players.id` (internal ID, NOT ESPN ID)
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
**OT Loss Logic:** Use ONLY `is_overtime = true` (covers both OT and shootout losses):
```sql
-- OT Losses (includes shootout)
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

### Current Data Status (Jan 2026)

| Team | Record | Roster Count | Season Query | Notes |
|------|--------|--------------|--------------|-------|
| Bears | 11-6 (reg) + 1-1 (playoffs) | 81 | `season = 2025` | Complete (includes PS, IR) |
| Bulls | **22-22** (in progress) | 18 | `season = 2026` | Ending year! |
| Blackhawks | 21-22-8 (50 pts) | 20 | `season = 2026` | Ending year! |
| Cubs | 98-74 | 35 | `season = 2025` | Offseason |
| White Sox | 61-106 | 35 | `season = 2025` | Offseason |

**Bears roster of 81** includes: 53 active + 16 practice squad + ~12 IR/other. Display all.

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

## Scout - The Ask AI Model

**Scout** is the AI-powered "Ask AI" feature for Chicago sports questions. When the user mentions "Scout", "the AI model", "Ask AI", or "query AI", they are referring to this system.

### Where Scout Lives
| Location | Description |
|----------|-------------|
| Backend | https://datalab.sportsmockery.com/api/query |
| Frontend | /ask-ai page on test.sportsmockery.com |
| API Route | /src/app/api/ask-ai/route.ts (proxies to Data Lab) |

### How Scout Works
1. User submits question on /ask-ai page
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
| `/src/app/ask-ai/page.tsx` | Ask AI chat interface |
| `/AskAI_Wrong.md` | QA test failure log |

### Known Issues (from QA testing)
See `/AskAI_Wrong.md` for documented failures:
1. Citation markers [1][2][3] appearing in responses
2. Player name typo handling needs improvement
3. Database errors sometimes leak to user responses

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
