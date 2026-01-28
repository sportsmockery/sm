# GM Trade Simulator - Mobile Implementation Plan

## Overview
Port the web GM Trade Simulator to the mobile app as a multi-step wizard flow, accessible via a banner on the Teams page.

## Implementation Steps

### Phase 1: Foundation
1. **GM Banner on Teams page** - Add a styled banner at top of teams.tsx linking to /gm
2. **API client functions** - Add GM endpoints to `mobile/lib/api.ts` (roster, teams, grade, trades, leaderboard, sessions)
3. **GM types** - Define TypeScript interfaces for GM data

### Phase 2: Core Trade Flow (Multi-Step Wizard)
4. **`mobile/app/gm/index.tsx`** - Landing/team selection screen (pick your team from league teams)
5. **`mobile/app/gm/roster.tsx`** - Browse your team's roster, select players to trade away
6. **`mobile/app/gm/opponent.tsx`** - Pick opponent team
7. **`mobile/app/gm/opponent-roster.tsx`** - Browse opponent roster, select players to receive
8. **`mobile/app/gm/draft-picks.tsx`** - Optional draft pick selection for both sides
9. **`mobile/app/gm/review.tsx`** - Trade summary with "Submit for Grading" button
10. **`mobile/app/gm/result.tsx`** - Animated grade reveal (0-100 scale, accept/reject)

### Phase 3: History & Social
11. **`mobile/app/gm/history.tsx`** - Past trades list
12. **`mobile/app/gm/leaderboard.tsx`** - Top traders ranking

### Phase 4: State Management
13. **`mobile/lib/gm-context.tsx`** - React Context for trade state (selected team, players, opponent, draft picks)

## Design Approach
- Match existing app patterns: dark/light theme, Montserrat fonts, COLORS.primary (#bc0000)
- Step indicator at top showing progress (1/7 steps)
- Each step is a separate screen with back navigation
- Player cards show name, position, photo, key stats
- Grade reveal: animated circle with score, color-coded (green=accepted, red=rejected)
- Consistent with web experience but optimized for touch/scroll
