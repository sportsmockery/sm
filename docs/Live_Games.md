# Live Games Infrastructure

> **Last Updated:** January 23, 2026
> **Status:** Production

## Overview

The live games system displays real-time scores and game data for Chicago teams (Bears, Bulls, Cubs, White Sox, Blackhawks) on test.sportsmockery.com. All data flows from Datalab - the site never calls ESPN directly.

---

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│   ESPN API  │ -> │   Datalab   │ -> │  Cron Job (10s)  │ -> │  In-Memory  │
│             │    │ /live/games │    │ /api/cron/live-  │    │    Cache    │
└─────────────┘    └─────────────┘    │     games        │    └─────────────┘
                                      └──────────────────┘           │
                                                                     v
                                      ┌──────────────────┐    ┌─────────────┐
                                      │   UI Components  │ <- │ /api/live-  │
                                      │  (poll every 10s)│    │    games    │
                                      └──────────────────┘    └─────────────┘
```

**Key Rules:**
- UI components ONLY consume `/api/live-games` endpoints
- ONLY the cron job talks to Datalab
- No direct ESPN calls from test.sportsmockery.com

---

## Live Game Page URLs

### Route Pattern
```
/live/[sport]/[gameId]
```

### Examples
| Sport | URL Pattern | Example |
|-------|-------------|---------|
| NFL | `/live/nfl/[gameId]` | `/live/nfl/401547789` |
| NBA | `/live/nba/[gameId]` | `/live/nba/401584521` |
| NHL | `/live/nhl/[gameId]` | `/live/nhl/401559234` |
| MLB | `/live/mlb/[gameId]` | `/live/mlb/401472156` |

### Live Game Page Features
- Sticky score header with team logos
- Real-time score updates (10-second polling)
- Play-by-play feed
- Box scores (sport-specific stats)
- Team stats comparison
- Win probability bar
- Venue and broadcast information

---

## API Endpoints

### GET /api/live-games
Returns all in-progress games for Chicago teams.

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `team` | Filter by team: `bears`, `bulls`, `cubs`, `whitesox`, `blackhawks` |
| `all` | If `true`, return all games (not just in-progress) |

**Response:**
```json
{
  "games": [
    {
      "game_id": "401547789",
      "sport": "nfl",
      "status": "in_progress",
      "home_team_id": "bears",
      "away_team_id": "packers",
      "home_team_name": "Chicago Bears",
      "away_team_name": "Green Bay Packers",
      "home_team_abbr": "CHI",
      "away_team_abbr": "GB",
      "home_logo_url": "https://...",
      "away_logo_url": "https://...",
      "home_score": 17,
      "away_score": 14,
      "period": 3,
      "period_label": "3rd Quarter",
      "clock": "8:42",
      "chicago_team": "bears",
      "is_chicago_home": true
    }
  ],
  "count": 1,
  "cache_age_seconds": 5,
  "is_stale": false,
  "timestamp": "2026-01-23T19:30:00.000Z"
}
```

### GET /api/live-games/[gameId]
Returns full game data including player stats and play-by-play.

**Response includes:**
- Team details (name, abbr, logo, score, timeouts)
- Game state (period, clock, status)
- Venue information
- Weather (for outdoor sports)
- Broadcast info
- Live odds and win probability
- Player stats (sport-specific)
- Play-by-play feed
- Team stats comparison

### POST /api/cron/live-games
Manually trigger a cache refresh (for testing).

**Headers:**
```
x-internal-request: true
```

---

## UI Components

### LiveGamesTopBar
**Location:** `src/components/layout/LiveGamesTopBar.tsx`

**Displays on:**
- Homepage (shows all Chicago teams)
- Team pages (shows only that team's games)

**Behavior:**
- Polls `/api/live-games` every 10 seconds
- Only renders when there are in-progress games
- Shows: LIVE badge, team logos, scores, period/clock
- Clicking navigates to `/live/[sport]/[gameId]`

### Live Game Page
**Location:** `src/app/live/[sport]/[gameId]/page.tsx`

**Tabs:**
1. Play-by-Play - Chronological game events
2. Box Score - Player statistics by team
3. Team Stats - Side-by-side team comparison

---

## Polling & Synchronization

### Cron Job Schedule
- **Frequency:** Every 10 seconds
- **Endpoint:** `GET /api/cron/live-games`
- **Source:** Datalab `/live/games`

### UI Polling
- **Frequency:** Every 10 seconds
- **Source:** `/api/live-games`

### Game Start Synchronization
The system includes upcoming games scheduled to start within the next 5 minutes. This ensures:
1. "Starting Soon" indicator appears before the game begins
2. Games transition smoothly from "SOON" to "LIVE" when they start
3. No delay waiting for the next poll cycle

**How It Works:**
1. API returns games with `include_upcoming=true` parameter
2. Games with `game_start_time` within 5 minutes are included
3. UI shows yellow "SOON" badge with countdown for upcoming games
4. UI shows red "LIVE" badge with pulsing dot for in-progress games
5. When game status changes to `in_progress`, badge automatically updates

**Visual Indicators:**
| Status | Badge | Color | Animation |
|--------|-------|-------|-----------|
| `in_progress` | LIVE | Red | Pulsing dot |
| `upcoming` (< 5 min) | SOON | Yellow | Pulse |

**Latency Budget:**
| Stage | Max Latency |
|-------|-------------|
| ESPN → Datalab | ~5 seconds |
| Datalab → Cache | 10 seconds |
| Cache → UI | 10 seconds |
| **Total** | ~25 seconds |

**Note:** Games appear in the "Starting Soon" state up to 5 minutes before scheduled start time, ensuring users see them before the game begins.

---

## Cache Details

### Location
`src/lib/live-games-cache.ts`

### Singleton Instance
```typescript
import { liveGamesCache } from '@/lib/live-games-cache'
```

### Methods
| Method | Description |
|--------|-------------|
| `getAllGames()` | All cached games |
| `getInProgressGames()` | Games with status "in_progress" |
| `getChicagoGames()` | In-progress Chicago team games |
| `getTeamGames(teamId)` | In-progress games for specific team |
| `getGame(gameId)` | Single game by ID |
| `isStale()` | True if cache > 20 seconds old |
| `getCacheAge()` | Seconds since last update |

### Chicago Team IDs
```typescript
const CHICAGO_TEAM_IDS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']
```

---

## File Locations

| File | Purpose |
|------|---------|
| `src/lib/live-games-cache.ts` | In-memory cache and Datalab fetch functions |
| `src/app/api/live-games/route.ts` | List all live games endpoint |
| `src/app/api/live-games/[gameId]/route.ts` | Single game details endpoint |
| `src/app/api/cron/live-games/route.ts` | Cron job to refresh cache |
| `src/components/layout/LiveGamesTopBar.tsx` | Live game indicator bar |
| `src/app/live/[sport]/[gameId]/page.tsx` | Full live game page |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATALAB_API_URL` | Datalab base URL | `https://datalab.sportsmockery.com` |
| `CRON_SECRET` | Auth token for cron endpoint | (required in production) |

---

## Testing

### Manual Cache Refresh
```bash
curl -X POST https://test.sportsmockery.com/api/cron/live-games \
  -H "x-internal-request: true"
```

### Check Cache Status
```bash
curl https://test.sportsmockery.com/api/live-games
```

### View Specific Game
```bash
curl https://test.sportsmockery.com/api/live-games/401547789
```
