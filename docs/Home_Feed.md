# Home Feed ("The River") — Architecture Guide

> **Last Updated:** March 7, 2026

The homepage (`/`) serves the **SM 2.0 River** — a personalized, score-ranked, infinite-scroll feed of typed cards. This replaced the legacy `HomepageFeed` component that displayed flat `sm_posts` lists.

---

## High-Level Flow

```
Browser hits /
        |
        v
  src/app/page.tsx  (React Server Component, force-dynamic)
        |
        |  1. Detect user segment (anonymous / logged_in / sm_plus) via cookies()
        |  2. Detect algorithm state (standard / game_day_active)
        |  3. Load user engagement profile from sm_user_preferences (if logged in)
        |  4. Parallel Supabase queries for posts, hub updates, box scores, trades
        |  5. Score all candidates with river-scoring composite formula
        |  6. Sort by score, slice top 12, build base64url cursor
        |
        v
  RiverPageClient  (client component — src/app/river/RiverPageClient.tsx)
        |
        |  Passes initialCards + initialCursor into useRiverFeed hook
        |
        +---> RiverLayout  (left rail, right rail, mobile filter strips)
        +---> RiverFeed    (Virtuoso infinite list, card-type switch)
```

The `/river` route uses the identical architecture (its own `page.tsx` performs the same server-side fetch).

---

## Key Files

| File | Role |
|------|------|
| `src/app/page.tsx` | Server entrypoint. SSR fetches first 12 cards with auth-aware scoring. |
| `src/app/river/page.tsx` | Alternate `/river` route. Same SSR logic as homepage. |
| `src/app/river/RiverPageClient.tsx` | Client shell. Wires `useRiverFeed` into `RiverLayout` + `RiverFeed`. |
| `src/app/api/river/route.ts` | `GET /api/river` — paginated API for client-side fetches (load-more, filter changes). |
| `src/hooks/useRiverFeed.ts` | SWR Infinite hook. Manages pagination, team/mode filters, SSR-to-client handoff. |
| `src/components/SportsRiver/RiverFeed.tsx` | Virtuoso-powered feed renderer with per-card-type switch scaffold. |
| `src/components/SportsRiver/BaseGlassCard.tsx` | Glassmorphism card wrapper with dwell tracking and spring animations. |
| `src/components/SportsRiver/RiverLayout.tsx` | Three-column layout: left rail (feed modes, team filters), center feed, right rail (SM+, newsletter, live scores). |
| `src/components/SportsRiver/RiverGhostPill.tsx` | "New content" toast pill when WebSocket pushes a card while user is scrolled down. |
| `src/components/SportsRiver/RiverOfflineBanner.tsx` | Reconnecting banner shown when WebSocket drops. |
| `src/components/SportsRiver/ScoutGreeting.tsx` | Time-of-day greeting ("Good morning — here's what Chicago fans need to know"). |
| `src/lib/river-types.ts` | All TypeScript types: `CardType` (17 variants), `RiverCard`, `RiverFeedResponse`, table row interfaces. |
| `src/lib/river-scoring.ts` | Scoring functions: `scorePostCandidate`, `scoreGenericCandidate`, `scoreRiverCandidates`. |
| `src/lib/river-tokens.ts` | HMAC-signed tracking tokens for analytics (`generateTrackingToken`, `validateTrackingToken`). |
| `src/context/WebSocketProvider.tsx` | Supabase Realtime provider. Listens for INSERTs on `sm_hub_updates` and `sm_box_scores`. |
| `src/hooks/useGhostUpdate.ts` | Per-card live update hook. Subscribes to Postgres UPDATE events for a specific row. |

---

## Server-Side Rendering (SSR)

### User Segment Detection

The server page uses `cookies()` from `next/headers` to create a Supabase server client and call `getUser()`. This avoids the old pattern of loopback HTTP to `/api/river` (which couldn't forward cookies and broke auth detection).

Three segments:
- **`anonymous`** — no auth cookies or failed auth check
- **`logged_in`** — valid Supabase session, no active SM+ subscription
- **`sm_plus`** — valid session + active subscription where `isProTier(tier)` is true

### Data Sources (Parallel Queries)

| Source Table | Card Type(s) | Limit | Filter |
|-------------|-------------|-------|--------|
| `sm_posts` (joined with `sm_categories`) | `scout_summary` or `trending_article` (based on `engagement_velocity > 10`) | 60 | `status = 'published'`, ordered by `published_at` desc |
| `sm_hub_updates` | `hub_update` | 20 | `feed_eligible = true` |
| `sm_box_scores` | `box_score` | 10 | `feed_eligible = true`, `game_status IN ('live', 'final')` |
| `sm_trade_proposals_feed` | `trade_proposal` | 10 | `editor_approved = true`, `rejected = false` |

The API route (`/api/river`) additionally queries `sm_polls`, `sm_charts`, `chat_messages`, and video-filtered `sm_posts` for the full set of card types, plus injects static placeholder cards for types without dedicated DB tables (e.g., `listen_now`, `infographic`, `comment_spotlight`, `trending_player`).

### Scoring

Each candidate gets a composite score via `src/lib/river-scoring.ts`:

**Posts** (`scorePostCandidate`):
```
Logged-in:  userAffinity(40%) + recency(25%) + engagement(20%) + teamPref(15%)
Anonymous:  baseScore(50%) + recency + engagement + teamPref
```

- **userAffinity** — from `scoring-v2` using the user's `favorite_teams` from `sm_user_preferences`
- **recency** — hours-old decay: <1h=100, <6h=80, <24h=50, <48h=25, then tails off
- **engagement** — capped at 30 from `engagement_velocity * 2`
- **teamPref** — +15 if card matches the active team filter

**Non-posts** (`scoreGenericCandidate`):
```
recency(60%) + teamBoost(15) + gameDayBoost(20 for live box_scores) + extraBoost
```

Candidates are sorted descending by score with `card_id` as a deterministic tiebreaker. The top 12 are sliced for SSR.

### Cursor

The cursor is a base64url-encoded JSON object `{ last_score, last_id }`. The client passes this on subsequent fetches so the API can filter out already-seen cards using the composite `(score, card_id)` key.

---

## Client-Side Hydration and Pagination

### `useRiverFeed` Hook

Uses **SWR Infinite** (`useSWRInfinite`) to manage paginated fetching against `GET /api/river`.

Key behaviors:
- **Initial state**: SSR cards are displayed immediately. SWR does not fetch on mount when `initialCards` is non-empty.
- **Load more**: `endReached` on Virtuoso calls `loadMore()` which increments `setSize`.
- **Filter/mode changes**: When `teamFilter` or `feedMode` changes:
  1. `paramsChanged` flag is set to `true`
  2. `initialCursorRef` is cleared (empty string)
  3. `setSize(1)` resets pagination to page 1
  4. `mutate(undefined, { revalidate: true })` clears stale data and fetches fresh
  5. The `riverCards` memo skips prepending SSR `initialCards` when `paramsChanged` is true

This ensures filter changes produce a clean feed without stale SSR cards mixing in.

### SWR Key Function

```
/api/river?cursor={cursor}&team={teamFilter}&mode={feedMode}&limit=20
```

Page 0 uses the SSR cursor (or empty after filter change). Subsequent pages use `previousPageData.feed_meta.next_cursor`. Returns `null` when `has_more` is false to stop fetching.

---

## Card Types (17 Total)

| Card Type | Accent Color | Data Source | Description |
|-----------|-------------|-------------|-------------|
| `scout_summary` | `#00D4FF` | `sm_posts` (low engagement velocity) | AI-summarized article card |
| `trending_article` | `#00D4FF` | `sm_posts` (engagement_velocity > 10) | Hot/trending article |
| `hub_update` | `#BC0000` | `sm_hub_updates` | Team hub breaking update |
| `box_score` | `#BC0000` | `sm_box_scores` | Live/final game score card |
| `trade_proposal` | `#D6B05E` | `sm_trade_proposals_feed` | Fan-submitted trade graded by AI |
| `vision_theater` | `#BC0000` | `sm_posts` (content_type=video) | Video content card |
| `trending_player` | `#BC0000` | Static placeholder | Player trending card |
| `fan_chat` | `#00FF00` | `chat_messages` | Fan chat message highlight |
| `mock_draft` | `#BC0000` | Static (Mar-May, draft-eligible teams) | Mock draft promo |
| `sm_plus` | `#D6B05E` | Static (hidden for SM+ users) | SM+ upgrade promo |
| `infographic` | `#0891B2` | Static placeholder | Data visualization card |
| `chart` | `#00D4FF` | `sm_charts` | Chart/data card |
| `poll` | `#BC0000` | `sm_polls` | Active poll card |
| `comment_spotlight` | `#00D4FF` | Static placeholder | Featured community comment |
| `listen_now` | `#BC0000` | Static placeholder | Podcast/audio card |
| `join_newsletter` | `#00D4FF` | Static | Newsletter signup promo |
| `download_app` | `#BC0000` | Static | App download promo |

All card types currently render through `PlaceholderCard` (glassmorphism card with type label, heading, and body). The `renderCard` function in `RiverFeed.tsx` has an exhaustive `switch` statement covering all 17 types — T5 components plug directly into each case branch.

---

## Feed Modes

The left rail (desktop) and horizontal pill strip (mobile) expose 8 feed modes:

| Mode | Behavior |
|------|----------|
| `for_you` | All card types, score-ranked (default) |
| `live` | Only live box scores and live hub updates |
| `trending` | All types, sorted by `engagement_velocity` then `view_count` |
| `scout` | Only `scout_summary` and `trending_article` |
| `community` | Only `fan_chat`, `poll`, `comment_spotlight`, `trade_proposal` |
| `watch` | Only `vision_theater` |
| `listen` | Only `listen_now` |
| `data` | Only `infographic`, `chart`, `box_score` |

Team filters: `all`, `bears`, `cubs`, `bulls`, `blackhawks`, `white-sox`. When a team is selected, the API allows up to 20% cross-team cards for variety.

---

## Rendering Pipeline

### RiverFeed (Virtuoso)

The feed uses `react-virtuoso` with `useWindowScroll` for efficient rendering of potentially hundreds of cards. Key configuration:
- `overscan={5}` — renders 5 extra items above/below viewport
- `increaseViewportBy={200}` — extends the rendered range by 200px
- `endReached={loadMore}` — triggers next page fetch when scrolled near bottom
- Footer shows a spinner during loading or "You're all caught up" when no more cards

### BaseGlassCard

Every card is wrapped in `BaseGlassCard` which provides:
- **Glassmorphism styling**: `rgba(27, 36, 48, 0.72)` background with `blur(20px)` backdrop
- **Accent bar**: 2px colored top border based on card type
- **Spring animation**: Framer Motion entry animation (`opacity: 0, scale: 0.92, y: 30` -> visible), respects `prefers-reduced-motion`
- **Hover lift**: Cards lift 8px on hover with deeper shadow
- **Breathing animation**: Every 8th card (`index % 8 === 7`) gets a subtle scale pulse
- **Dwell tracking**: IntersectionObserver at 60% threshold starts a 1500ms timer. If the card stays visible, a `sendBeacon` fires to `/api/track/dwell` with the card's tracking token. Guards prevent duplicate timers and duplicate beacon sends.

### Tracking Tokens

Each card carries an HMAC-SHA256 signed token containing `{ card_id, card_type, user_segment, session_id, team_slug, expires_at }`. The token is base64url-encoded with a `.signature` suffix. Tokens expire after 24 hours. Validated server-side in the dwell/interaction tracking endpoints.

---

## Real-Time Updates (WebSocket)

### WebSocketProvider

Wraps the app in a Supabase Realtime context. Maintains:
- **Main channel** (`chicago_breaking`): Listens for `INSERT` events on `sm_hub_updates` and `sm_box_scores`. New rows are converted to `RiverCard` objects and broadcast to injection listeners.
- **Per-card channels**: Individual cards can subscribe to `UPDATE` events on their source table row via `subscribeToCard(cardId, table, callback)`.

### Ghost Pill

When a new card arrives via WebSocket while the user is scrolled down (past 100px), `RiverGhostPill` shows a floating toast: "New Hub Update - Tap to see". The pill auto-dismisses after 8 seconds. Tapping it scrolls to top.

### Ghost Updates (`useGhostUpdate`)

Individual cards (especially live box scores) use `useGhostUpdate` to subscribe to row-level changes. When a Postgres UPDATE fires:
1. The hook computes a minimal diff (changed fields only)
2. Merges the patch into local state
3. Sets `isUpdating=true` for 1.5s (can be used for flash/highlight animations)

### Offline Banner

`RiverOfflineBanner` renders a "Reconnecting to live updates..." bar with a pulsing dot when the WebSocket connection state is `reconnecting` or `offline`.

---

## Insertion Rules (`sm_feed_rules` Table)

The API route enforces per-card-type frequency rules loaded from `sm_feed_rules` (cached in-memory for 60 seconds):

| Column | Purpose |
|--------|---------|
| `card_type` | Which card type this rule applies to |
| `max_per_n_cards` | Maximum instances within a sliding window |
| `n_cards_window` | Size of the sliding window (in cards) |
| `min_gap_cards` | Minimum number of cards between same-type instances |
| `enabled` | Whether this rule is active |

This prevents, for example, three newsletter promos appearing back-to-back. SM+ promo cards are also suppressed for SM+ users.

---

## Layout Structure

### Desktop (md+)

```
+-------------------+--------------------+--------------------+
| Left Rail (280px) | Center Feed (680px)| Right Rail (320px) |
|                   |                    |                    |
| Feed Modes        | Virtuoso cards     | SM+ upsell         |
| Team Filters      |                    | Daily Scout        |
| Trending Now      |                    | Newsletter signup  |
| Live Chat peek    |                    | Download App       |
|                   |                    | Live Scores        |
+-------------------+--------------------+--------------------+
```

### Mobile

```
+----------------------------------------+
| Feed mode pills (horizontal scroll)    |
| Team filter pills (horizontal scroll)  |
+----------------------------------------+
| Center Feed (full width, 16px padding) |
+----------------------------------------+
```

Both rails are `sticky top-0 h-screen` with `overflow-y-auto`.

---

## API Route (`GET /api/river`)

### Query Parameters

| Param | Default | Description |
|-------|---------|-------------|
| `cursor` | (none) | Base64url cursor from previous page |
| `team` | `all` | Team filter: `all`, `bears`, `cubs`, `bulls`, `blackhawks`, `white-sox` |
| `mode` | `for_you` | Feed mode (see table above) |
| `limit` | `20` | Cards per page (clamped 1-40) |

### Response Shape

```typescript
{
  feed_meta: {
    next_cursor: string;     // base64url encoded {last_score, last_id}
    has_more: boolean;
    algorithm_state: 'standard' | 'game_day_active';
  },
  river_cards: RiverCard[];  // array of typed cards
}
```

### Cache Headers

- **Game day active**: `public, s-maxage=10, stale-while-revalidate=5`
- **Standard**: `public, s-maxage=30, stale-while-revalidate=15`

### Error Handling

On any unhandled error, the API returns an empty feed (`200` with zero cards) rather than a `500`, so the client always gets a valid response shape.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `sm_posts` | Articles, joined with `sm_categories` for team slug derivation |
| `sm_hub_updates` | Team hub breaking news updates |
| `sm_box_scores` | Game scores (live and final) |
| `sm_trade_proposals_feed` | Editor-approved fan trade proposals |
| `sm_polls` | Active polls |
| `sm_charts` | Data visualization charts |
| `chat_messages` | Fan chat messages |
| `sm_feed_rules` | Card frequency/spacing rules |
| `sm_user_preferences` | User favorite teams (for personalized scoring) |
| `subscriptions` | SM+ subscription status |
