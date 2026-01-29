# GM Trade Simulator - Complete Guide

> **Last Updated:** January 29, 2026
> **Version:** 2.0
> **Platforms:** Web (Next.js) + Mobile (Expo/React Native)

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Web Application](#web-application)
4. [Mobile Application](#mobile-application)
5. [API Reference](#api-reference)
6. [AI Grading System](#ai-grading-system)
7. [Database Schema](#database-schema)
8. [Authentication](#authentication)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The **GM Trade Simulator** is an AI-powered trade evaluation tool that lets Chicago sports fans play General Manager. Users can build hypothetical trades between any of the 5 Chicago teams (Bears, Bulls, Blackhawks, Cubs, White Sox) and any team in their respective leagues (NFL, NBA, NHL, MLB), then receive instant AI grades with detailed analysis.

### Key Features

- **Trade Building** - Select players and draft picks from both teams
- **AI Grading** - Claude Sonnet 4 evaluates trades with sport-specific logic
- **Real-time Validation** - Cap implications, roster impacts, trade rules
- **Animated Results** - 5-phase reveal with confetti for elite trades
- **Team Fit Analysis** - See how well players fit their new team
- **What-If Scenarios** - Test different scenarios (player improvement, injuries)
- **Leaderboard** - Compete with other users for highest grades
- **Trade History** - View and revisit all past trades
- **Export & Share** - Download trades or share via unique links

### Supported Teams

| Chicago Team | Sport | League |
|--------------|-------|--------|
| Chicago Bears | Football | NFL |
| Chicago Bulls | Basketball | NBA |
| Chicago Blackhawks | Hockey | NHL |
| Chicago Cubs | Baseball | MLB |
| Chicago White Sox | Baseball | MLB |

---

## How It Works

### User Flow

```
1. Sign In (required)
   ↓
2. Select Your Chicago Team
   ↓
3. Browse Your Roster → Select Players to Trade Away
   ↓
4. Select Opponent Team (any team in the league)
   ↓
5. Browse Opponent Roster → Select Players to Receive
   ↓
6. Add Draft Picks (optional)
   ↓
7. Review Trade + Validation
   ↓
8. Submit for AI Grade
   ↓
9. View Animated Results
   ↓
10. Explore What-If Scenarios, Export, or Share
```

### Grade Scale

| Grade | Status | Meaning |
|-------|--------|---------|
| 90-100 | Elite | Franchise-altering trade (very rare) |
| 75-89 | Accepted | Good trade, but flagged as "dangerous" if risky |
| 50-74 | Rejected | Decent concept but flawed execution |
| 30-49 | Rejected | Bad trade - giving up too much or not enough |
| 15-29 | Rejected | Very bad - unrealistic proposal |
| 0-14 | Rejected | Catastrophic - untouchable player or absurd |

**Note:** Grades 75+ are marked as "accepted" (the other team would realistically agree). Grades 75-90 are also flagged as "dangerous" indicating high-risk/high-reward.

---

## Web Application

### URL

- **Production:** https://test.sportsmockery.com/gm
- **Analytics:** https://test.sportsmockery.com/gm/analytics

### Page Structure

The main GM page (`/gm`) uses a 3-column layout:

```
┌─────────────────────────────────────────────────────────────┐
│                     War Room Header                          │
│  [GM Score]  [Session Name]  [Analytics] [Prefs] [History]  │
├─────────────────────────────────────────────────────────────┤
│        Team Selector (Bears | Bulls | Hawks | Cubs | Sox)   │
├────────────────┬────────────────────┬───────────────────────┤
│                │                    │                       │
│  Your Roster   │    Trade Board     │   Opponent Roster     │
│                │                    │                       │
│  [Search]      │  ┌──────┬──────┐   │   [Team Picker]       │
│  [Filter]      │  │ SEND │ RECV │   │   [Search]            │
│                │  │      │      │   │   [Filter]            │
│  Player Card   │  │Player│Player│   │                       │
│  Player Card   │  │Player│Player│   │   Player Card         │
│  Player Card   │  │      │      │   │   Player Card         │
│  ...           │  │Picks │Picks │   │   ...                 │
│                │  └──────┴──────┘   │                       │
│                │                    │                       │
│                │  [Validate] [Grade]│                       │
│                │                    │                       │
├────────────────┴────────────────────┴───────────────────────┤
│                    Trade History                             │
└─────────────────────────────────────────────────────────────┘
```

### Components (23 Total)

| Component | Purpose |
|-----------|---------|
| `PlayerCard.tsx` | Displays player with headshot, stats, contract info |
| `TradeBoard.tsx` | Two-panel trade visualization with sent/received |
| `GradeReveal.tsx` | Animated 5-phase grade reveal overlay |
| `TeamSelector.tsx` | Horizontal scroll of 5 Chicago teams |
| `RosterPanel.tsx` | Left sidebar with searchable roster |
| `OpponentRosterPanel.tsx` | Right sidebar with opponent roster |
| `OpponentTeamPicker.tsx` | Modal to select any league team |
| `DraftPickSelector.tsx` | UI for adding draft picks to trade |
| `WarRoomHeader.tsx` | Page header with score, links |
| `LeaderboardPanel.tsx` | User rankings display |
| `TradeHistory.tsx` | Paginated past trades |
| `StatComparison.tsx` | Side-by-side stat comparison |
| `SessionManager.tsx` | Create/switch sessions |
| `PreferencesModal.tsx` | User settings (risk, style) |
| `ValidationIndicator.tsx` | Real-time trade validation |
| `TeamFitOverlay.tsx` | Player fit analysis modal |
| `TeamFitRadar.tsx` | Radar chart for fit breakdown |
| `WhatIfPanel.tsx` | Scenario testing UI |
| `SimulationChart.tsx` | Monte Carlo visualization |
| `AnalyticsDashboard.tsx` | Trade analytics display |
| `ExportModal.tsx` | Export dialog (JSON/CSV/PDF) |
| `ScenarioTabs.tsx` | Scenario type selector |
| `PlayerTrendBadge.tsx` | Hot/rising/stable/declining indicator |

### File Locations

```
src/
  app/
    gm/
      page.tsx              # Main GM page
      analytics/
        page.tsx            # Analytics dashboard
  components/
    gm/
      PlayerCard.tsx        # (and 22 more components)
```

---

## Mobile Application

### Screens (13 Total)

| Screen | Route | Purpose |
|--------|-------|---------|
| Index | `/gm` | Team selection home screen |
| Roster | `/gm/roster` | Browse Chicago team roster |
| Opponent | `/gm/opponent` | Select opponent team |
| Opponent Roster | `/gm/opponent-roster` | Browse opponent roster |
| Draft Picks | `/gm/draft-picks` | Add draft picks |
| Review | `/gm/review` | Review trade before grading |
| Result | `/gm/result` | View AI grade with animation |
| History | `/gm/history` | Past trades list |
| Leaderboard | `/gm/leaderboard` | User rankings |
| Analytics | `/gm/analytics` | Personal trade analytics |
| Team Fit | `/gm/team-fit` | Player fit analysis |
| What If | `/gm/what-if` | Scenario testing |
| Preferences | `/gm/preferences` | User settings |

### Navigation Flow

```
Index (Team Selection)
  ↓
Roster (Select players to send)
  ↓
Opponent (Pick opponent team)
  ↓
Opponent Roster (Select players to receive)
  ↓
Draft Picks (Optional)
  ↓
Review (Final check)
  ↓
Result (AI Grade)
  ↓
History / Leaderboard / What-If
```

### File Locations

```
mobile/
  app/
    gm/
      index.tsx             # Team selection
      roster.tsx            # Your roster
      opponent.tsx          # Opponent picker
      opponent-roster.tsx   # Opponent roster
      draft-picks.tsx       # Draft picks
      review.tsx            # Trade review
      result.tsx            # Grade result
      history.tsx           # Trade history
      leaderboard.tsx       # Leaderboard
      analytics.tsx         # Analytics
      team-fit.tsx          # Team fit
      what-if.tsx           # What-if scenarios
      preferences.tsx       # Preferences
  lib/
    gm-types.ts             # TypeScript interfaces
    gm-api.ts               # API client
    gm-context.tsx          # State management
```

### Authentication Fix (January 2026)

The mobile app uses the `useAuth` hook to manage authentication state. The GM index screen now:

1. Waits for auth to finish loading before allowing team selection
2. Proactively checks if user is logged in before API calls
3. Shows auth prompt if user is not authenticated

```typescript
// mobile/app/gm/index.tsx
const { user, isLoading: authLoading } = useAuth()

const handleSelectTeam = async (teamKey: string) => {
  if (!user) {
    setShowAuthPrompt(true)
    return
  }
  // ... proceed with API calls
}
```

---

## API Reference

### Base URL

```
https://test.sportsmockery.com/api/gm
```

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/roster` | GET | Fetch team roster with stats |
| `/teams` | GET | Get all opponent teams |
| `/grade` | POST | Submit trade for AI grading |
| `/trades` | GET | Get user's trade history |
| `/trades` | DELETE | Clear trade history |
| `/leaderboard` | GET | Get user rankings |
| `/sessions` | GET | Get user's sessions |
| `/sessions` | POST | Create new session |
| `/cap` | GET | Get team salary cap data |
| `/validate` | POST | Validate trade structure |
| `/share/[code]` | GET | Get shared trade by code |

### Advanced Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/preferences` | GET/POST | User GM preferences |
| `/fit` | GET | Player team fit analysis |
| `/simulate` | POST | Monte Carlo simulation |
| `/scenarios` | POST | What-if scenarios |
| `/analytics` | GET | Trade analytics |
| `/export` | GET | Export trades (JSON/CSV/PDF) |
| `/log-error` | POST | Log frontend errors |

### Draft Endpoints (Experimental)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/draft/start` | POST | Begin draft scenario |
| `/draft/pick` | POST | Make a draft pick |
| `/draft/grade` | POST | Grade draft selection |
| `/draft/prospects` | GET | Get prospect list |
| `/draft/auto` | POST | Auto-generate picks |
| `/draft/history` | GET | Get draft history |

### Example: Grade Trade Request

```typescript
POST /api/gm/grade
Content-Type: application/json
Authorization: Bearer {token}

{
  "chicago_team": "bears",
  "trade_partner": "Dallas Cowboys",
  "partner_team_key": "dal",
  "players_sent": [
    {
      "player_id": "4241479",
      "full_name": "DJ Moore",
      "position": "WR",
      "stat_line": "78 REC, 983 YDS, 5 TD"
    }
  ],
  "players_received": [
    {
      "player_id": "4362628",
      "full_name": "CeeDee Lamb",
      "position": "WR",
      "stat_line": "101 REC, 1,204 YDS, 8 TD"
    }
  ],
  "draft_picks_sent": [
    { "year": 2026, "round": 2, "condition": null }
  ],
  "draft_picks_received": [],
  "session_id": "abc123"
}
```

### Example: Grade Response

```typescript
{
  "grade": 42,
  "status": "rejected",
  "is_dangerous": false,
  "reasoning": "While DJ Moore is a solid receiver, CeeDee Lamb is a top-5 WR in the NFL. Dallas has no incentive to trade their franchise receiver for a lesser player and a 2nd round pick. This trade severely undervalues Lamb.",
  "breakdown": {
    "realism": 15,
    "value_balance": 40,
    "team_needs": 65,
    "player_caliber": 35,
    "contract_cap": 55,
    "age_future": 70
  },
  "cap_analysis": {
    "chicago_cap_before": 25000000,
    "chicago_cap_after": 18000000,
    "partner_cap_before": 12000000,
    "partner_cap_after": 19000000
  },
  "trade_summary": "Bears send DJ Moore + 2026 2nd to Cowboys for CeeDee Lamb"
}
```

---

## AI Grading System

### Model

- **Model:** Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Provider:** Anthropic API (direct, not via DataLab)

### Grading Criteria

| Factor | Weight | Description |
|--------|--------|-------------|
| Realism | 30% | Would the other team actually accept? |
| Value Balance | 25% | Fair exchange of talent/assets? |
| Team Needs | 15% | Does it address roster holes? |
| Player Caliber | 10% | Quality of players involved |
| Contract/Cap | 15% | Cap implications and flexibility |
| Age/Future | 5% | Long-term value consideration |

### Critical Rule: Realism Gate

**If the other team would never realistically accept the trade, the grade is capped at 20 maximum**, regardless of how good it would be for the Chicago team.

This prevents users from proposing lopsided trades like "Bench player for MVP candidate."

### Sport-Specific Rules

#### NFL
- **Caleb Williams (Bears)** = Untouchable. Grade 0 if traded.
- Division trades penalized -5 to -10 points
- Draft pick values calibrated to NFL trade charts
- Salary cap matching not required

#### NBA
- Salary matching is mandatory (within 125% + $100K)
- Rookie-scale contracts have premium value
- Stepien Rule: Cannot trade consecutive 1st round picks
- Star power matters more than depth

#### NHL
- **Connor Bedard (Blackhawks)** = Untouchable. Grade 0 if traded.
- Retained salary mechanic (up to 50%)
- Entry-level contracts have premium value
- Rebuilding teams prefer prospects + picks

#### MLB
- Prospects are the primary trade currency
- Years of control is critical (6 years for rookies)
- Cubs (92-70): Buyers, looking to compete
- White Sox (60-102): Sellers, rebuilding mode
- No salary cap, but luxury tax considerations

### Untouchable Players

These players cannot be traded without receiving a grade of 0:

| Team | Player | Reason |
|------|--------|--------|
| Bears | Caleb Williams | Franchise QB, #1 pick |
| Blackhawks | Connor Bedard | Generational talent, face of franchise |

---

## Database Schema

### Primary Tables (Datalab Supabase)

#### `gm_trades`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who created trade |
| session_id | UUID | Session this trade belongs to |
| chicago_team | TEXT | bears/bulls/blackhawks/cubs/whitesox |
| partner_team_key | TEXT | Opponent team key (e.g., "dal") |
| partner_team_name | TEXT | Full team name |
| grade | INTEGER | AI grade (0-100) |
| status | TEXT | accepted/rejected |
| is_dangerous | BOOLEAN | Risky trade flag |
| reasoning | TEXT | AI explanation |
| breakdown | JSONB | Score breakdown by category |
| cap_analysis | JSONB | Cap impact details |
| shared_code | TEXT | Unique share link code |
| created_at | TIMESTAMP | When trade was created |

#### `gm_trade_items`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| trade_id | UUID | Foreign key to gm_trades |
| item_type | TEXT | "player" or "pick" |
| direction | TEXT | "sent" or "received" |
| player_data | JSONB | Player info if item_type=player |
| pick_data | JSONB | Pick info if item_type=pick |

#### `gm_sessions`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who owns session |
| session_name | TEXT | Custom name |
| chicago_team | TEXT | Team for this session |
| is_active | BOOLEAN | Current active session |
| num_trades | INTEGER | Trade count |
| num_approved | INTEGER | Accepted trade count |
| num_dangerous | INTEGER | Dangerous trade count |
| created_at | TIMESTAMP | Created timestamp |

#### `gm_leaderboard`

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Primary key |
| display_name | TEXT | User's display name |
| total_score | INTEGER | Sum of all grades |
| trades_count | INTEGER | Total trades made |
| avg_grade | DECIMAL | Average grade |
| best_grade | INTEGER | Highest single grade |
| accepted_count | INTEGER | Number of accepted trades |
| current_streak | INTEGER | Current win streak |

#### `gm_league_teams`

| Column | Type | Description |
|--------|------|-------------|
| team_key | TEXT | Primary key (e.g., "dal") |
| team_name | TEXT | Full name |
| abbreviation | TEXT | 3-letter code |
| logo_url | TEXT | Team logo URL |
| primary_color | TEXT | Hex color |
| sport | TEXT | nfl/nba/nhl/mlb |
| division | TEXT | Division name |

#### `gm_errors`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| source | TEXT | "frontend" or "backend" |
| error_type | TEXT | timeout/cors/parse/network/api/unknown |
| error_message | TEXT | Error description |
| route | TEXT | API route that failed |
| metadata | JSONB | Additional context |
| created_at | TIMESTAMP | When error occurred |

#### `gm_audit_logs`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who made request |
| trade_id | UUID | Related trade |
| request_payload | JSONB | What was sent to AI |
| response_payload | JSONB | What AI returned |
| grade | INTEGER | Resulting grade |
| reasoning | TEXT | AI reasoning |
| created_at | TIMESTAMP | When logged |

---

## Authentication

### Web (Cookie-Based)

The web app uses Supabase Auth with cookies:

```typescript
// Login flow
User → /login → Supabase Auth → Cookie set

// API protection
import { getGMAuthUser } from '@/lib/gm-auth'

export async function POST(request: NextRequest) {
  const user = await getGMAuthUser(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Please sign in', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }
  // ... handle request
}
```

### Mobile (Bearer Token)

The mobile app uses Bearer tokens in the Authorization header:

```typescript
// Auth flow
User → /auth screen → Supabase Auth → Token stored
useAuth hook → api.setAuthToken(session.access_token)

// API calls
const token = api.getAuthToken()
fetch('/api/gm/roster', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Unified Auth Handler

The `getGMAuthUser` function handles both methods:

```typescript
// src/lib/gm-auth.ts
export async function getGMAuthUser(request?: NextRequest) {
  // 1. Try Bearer token (mobile)
  const authHeader = request?.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    // Validate with Supabase
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) return user
  }

  // 2. Fall back to cookies (web)
  const cookieStore = await cookies()
  const supabase = createServerClient(/* ... */)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

---

## Advanced Features

### 1. Team Fit Analysis

Shows how well a player would fit on the target team:

- **Overall Fit Score** (0-100)
- **Breakdown:**
  - Positional Need (does team need this position?)
  - Age Fit (matches team timeline?)
  - Cap Fit (affordable?)
  - Scheme Fit (matches system?)
- **Insights:** AI-generated explanation

### 2. What-If Scenarios

Test different scenarios to see adjusted grades:

| Scenario | Description |
|----------|-------------|
| Player Improvement | What if player improves 10-20%? |
| Player Decline | What if player regresses? |
| Injury Impact | What if key player gets injured? |
| Age Progression | Grade after 1-2-3 years |
| Market Shift | If player values change |

### 3. Monte Carlo Simulation

Runs 1000+ simulations with randomized variables:

- **Percentiles:** 10th, 25th, 50th, 75th, 90th
- **Distribution:** Histogram of possible grades
- **Risk Analysis:** Upside vs downside potential

### 4. User Preferences

Customize your GM style:

| Setting | Options |
|---------|---------|
| Risk Tolerance | Conservative / Moderate / Aggressive |
| Team Phase | Rebuilding / Contending / Win Now / Auto |
| Trade Style | Balanced / Star Hunting / Depth Building / Draft Focused |
| Age Preference | Young / Prime / Veteran / Any |
| Cap Flexibility | Low / Medium / High priority |

### 5. Export & Share

- **Export Formats:** JSON, CSV, PDF
- **Share Links:** Generate unique code for any trade
- **Share URL:** `https://test.sportsmockery.com/gm/share/{code}`

---

## Troubleshooting

### Common Issues

#### "Auth Required" Error on Mobile

**Cause:** The auth token wasn't loaded before API calls were made.

**Fix (Applied January 2026):** The GM index screen now uses `useAuth` hook and waits for auth to load:

```typescript
const { user, isLoading: authLoading } = useAuth()

// Don't allow team selection until auth is loaded
disabled={loading || authLoading}
```

#### "Failed to Load Roster"

**Possible Causes:**
1. Network connectivity issue
2. Auth token expired
3. Server error

**Solutions:**
1. Check internet connection
2. Sign out and sign back in
3. Try again in a few moments

#### Trade Validation Errors

| Error | Meaning | Solution |
|-------|---------|----------|
| "Cap space exceeded" | Trade puts team over cap | Remove high-salary player or add cap relief |
| "Roster size limit" | Too many/few players | Balance players sent/received |
| "Position conflict" | Position rules violated | Check sport-specific roster rules |

#### Grade Seems Wrong

**Remember:**
- Realism is 30% of the grade
- If the other team wouldn't accept, max grade is 20
- Star players require star players or significant picks in return
- Check the AI reasoning for explanation

### Error Logging

Errors are automatically logged to the `gm_errors` table. To view:

```sql
SELECT * FROM gm_errors
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Getting Help

- **Bug Reports:** https://github.com/sportsmockery/sm/issues
- **Email:** support@sportsmockery.com

---

## Changelog

### January 29, 2026
- Fixed mobile auth loading issue in GM index screen
- Added `useAuth` hook integration for proper auth state management
- Added keyboard dismiss button on mobile auth screen

### January 27, 2026
- Added GM Trade Simulator section to CLAUDE.md
- Implemented GM error logging to `gm_errors` table
- Added roster sync cron job

### January 2026 (Initial Release)
- Full GM Trade Simulator launch
- 23 web components
- 13 mobile screens
- AI grading with Claude Sonnet 4
- Leaderboard, sessions, analytics
- Export and share functionality

---

## Quick Reference

### Chicago Team Keys

| Team | Key | Sport |
|------|-----|-------|
| Bears | `bears` | NFL |
| Bulls | `bulls` | NBA |
| Blackhawks | `blackhawks` | NHL |
| Cubs | `cubs` | MLB |
| White Sox | `whitesox` | MLB |

### Grade Thresholds

| Grade | Status | Dangerous |
|-------|--------|-----------|
| 75+ | Accepted | Yes (if 75-90) |
| 50-74 | Rejected | No |
| 0-49 | Rejected | No |

### API Authentication Header

```
Authorization: Bearer {supabase_access_token}
```

---

*This guide is maintained by the SportsMockery development team. For the latest updates, check the repository at `/docs/GM_Trade_Simulator/`.*
