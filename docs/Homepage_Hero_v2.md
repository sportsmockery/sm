# Homepage Hero V2 — Mode Selection Guide

> **Last Updated:** March 16, 2026

---

## Overview

The homepage hero is a dynamic system that selects one of five hero modes based on content context and user context. Only one mode renders at a time. The feed below the hero is never affected.

**Key files:**

| File | Purpose |
|------|---------|
| `src/components/home/hero/homepage-hero.tsx` | Controller — resolves mode and renders |
| `src/components/home/hero/types.ts` | Types, threshold constant, `resolveHeroMode()` |
| `src/components/home/hero/hero-shell.tsx` | Shared layout shell + `HeroCta` button |
| `src/components/home/hero/modes/*.tsx` | Individual mode components (5 files) |
| `src/lib/hero-data.ts` | Server-side data fetcher (`getHeroData()`) |

---

## Priority Order

Modes are evaluated top-to-bottom. The first qualifying mode wins.

| Priority | Mode | Trigger |
|----------|------|---------|
| 1 | **Trending Article Featured Hero** | A recent article has >= 2,500 views OR editor override |
| 2 | **Game Day Hero** | A Chicago team game is live or upcoming |
| 3 | **Personalized Team Pulse Hero** | Logged-in user has a primary team with recent articles |
| 4 | **Fan Debate Hero** | A recent article contains a debate block |
| 5 | **Scout Briefing Hero** | Always available — default fallback |

---

## Mode Details

### 1. Trending Article Featured Hero

**When it shows:** An article from `sm_posts` meets ALL of these:
- `status = 'published'`
- Has a `featured_image`
- Published within the last **48 hours** (absolute cutoff from `published_at`)
- `hero_override_at` within the last **24 hours** (if force-hero, display cap from when flagged)
- `views >= 2,500` **OR** `importance_score >= 90` (editor override)

**Data source:** `hero-data.ts → fetchFeaturedStory()` queries `sm_posts` ordered by views DESC, limited to 5 candidates within the 48h publish window. Force-hero articles must also have `hero_override_at` within 24h.

**What the user sees:**
- Article's featured image as full-width hero background with dark overlay
- "Trending Now" eyebrow label
- Article title and excerpt
- Optional team tag and publish freshness ("2h ago")
- Red "Read Now" CTA button linking to the article

**Editor override:** Set `importance_score >= 90` on any article to force it into trending hero mode regardless of view count. This maps to `forceHeroFeatured: true` in the props. The `hero_override_at` timestamp is auto-set when the flag is toggled on.

**Time limits:**
- **24h display cap:** Hero override expires 24 hours after `hero_override_at` (when the flag was set)
- **48h publish cap:** Article must be published within the last 48 hours regardless

**Visit cap (logged-in users):** After a logged-in user sees the same hero takeover article **2 times**, it is suppressed for that user. If both trending and story universe qualify, they alternate across visits.

**Feed dedup:** The hero article ID is passed to `MainFeed` which suppresses it from the first 3 feed positions to avoid repetition.

---

### 2. Game Day Hero

**When it shows:** ALL of these are true:
- No trending article qualifies (mode 1 did not fire)
- `live_games_registry` has a game with status `'live'` or `'pre'`

**Data source:** `hero-data.ts → fetchLiveGames()` queries `live_games_registry` for live/pre-game entries. Prefers `live` over `pre` if both exist.

**What the user sees:**
- Team matchup (e.g., "Bears vs Packers")
- Game time or "LIVE NOW"
- Optional storyline
- CTA linking to the team hub page

**When it goes away:** When the game ends (status leaves `live`/`pre`) and the registry clears.

---

### 3. Personalized Team Pulse Hero

**When it shows:** ALL of these are true:
- Modes 1-2 did not fire
- User is **logged in**
- User has a `favorite_teams` entry in `sm_user_preferences` (first team = primary)
- There are recent articles for that team

**Data source:** `hero-data.ts → fetchTeamPulse()` fetches the 50 most recent published articles, filters to the user's primary team by category slug, and extracts the top 3 headlines as topic pills.

**What the user sees:**
- Team name (e.g., "Chicago Bears")
- 2-3 trending topic headlines for that team
- CTA like "Enter Bears HQ" linking to team hub

**Who never sees this:** Logged-out users (no team preference available).

---

### 4. Fan Debate Hero

**When it shows:** ALL of these are true:
- Modes 1-3 did not fire
- A recent published article contains a `debate` block with a `question` field in its JSON content

**Data source:** `hero-data.ts → fetchDebateContext()` scans the 20 most recent `template_version = 1` articles, parses their block content JSON, and looks for a `type: "debate"` block.

**What the user sees:**
- Bold debate question
- Optional sentiment label
- "Join Debate" CTA linking to the article

---

### 5. Scout Briefing Hero (Default Fallback)

**When it shows:** No higher-priority mode qualified. This always renders.

**What the user sees:**
- Scout AI identity pill with avatar
- Personalized greeting if logged in ("Hi Chris,")
- "What can I help you with?" headline
- Search input with rotating placeholder prompts
- Quick action chips (e.g., "Bears rumors", "Cubs outlook")

**Data source:** No server data needed. Quick actions are currently hardcoded in `HomepageFeedV2.tsx`. Placeholder prompts fetch from `/api/scout-prompts` with static fallbacks.

---

## Data Flow

```
page.tsx (server)
  └─ getHeroData(userId)          ← src/lib/hero-data.ts
       ├─ fetchFeaturedStory()     → sm_posts (views, 48h window)
       ├─ fetchUserPrimaryTeam()   → sm_user_preferences
       ├─ fetchLiveGames()         → live_games_registry
       ├─ fetchTeamPulse()         → sm_posts filtered by team
       └─ fetchDebateContext()     → sm_posts debate blocks
  └─ passes hero props to HomepageFeedV2
       └─ <HomepageHero {...props} />
            └─ resolveHeroMode() picks the winning mode
```

---

## Common Scenarios

| Scenario | Hero Mode | Why |
|----------|-----------|-----|
| Bears article at 5,000 views, published 3h ago | Trending | Views exceed 2,500 threshold |
| Bears article at 1,000 views, importance_score = 95 | Trending | Editor override (importance >= 90) |
| Bears article at 800 views, Bears game live | Game Day | Article below threshold, live game exists |
| No trending article, no live game, logged-in Bears fan | Team Pulse | User has primary team with recent content |
| No trending, no game, logged out, debate article exists | Fan Debate | Debate block found in recent article |
| Nothing qualifies | Scout Briefing | Default fallback, always renders |
| Article at 3,000 views but published 3 days ago | Scout Briefing | Outside 48h window, article disqualified |

---

## Expanding Trending Logic (Future)

The `isTrendingStory()` function in `types.ts` is designed to be expanded. Currently it checks:

```typescript
export const TRENDING_VIEW_THRESHOLD = 2500

export function isTrendingStory(story) {
  if (story.forceHeroFeatured) return true
  return story.views >= TRENDING_VIEW_THRESHOLD
}
```

Future signals that can be added:
- Views velocity (views per hour)
- Engagement velocity (comments/reactions per hour)
- Recency weighting (newer articles get lower threshold)
- User team weighting (boost articles matching user's team)
- Comment/reaction count
- Social share velocity

---

## Feed Deduplication

When the hero shows a trending article, `heroArticleId` is passed down to `MainFeed.tsx`. The feed filters out that article from the first 3 positions:

```typescript
const heroSuppressedFeed = heroArticleId
  ? finalFeed.filter((item, idx) => {
      if (idx >= 3) return true
      return item.data?.postId !== heroArticleId
    })
  : finalFeed
```

The article can still appear later in the feed naturally — it's only suppressed from the top to avoid obvious repetition.
