# SportsMockery Homepage & Personal Feed Architecture

This project implements two complementary experiences for Chicago sports fans: a simple, recency-based homepage and a personalized feed, both powered by the same content and a consistent trending definition.

---

## Overview

- **Homepage (`/`)**  
  Recency-first view of all published Chicago sports stories, plus a trending band based solely on view counts.

- **Personal feed (`/feed`)**  
  Logged-in users see the same stories, re-ordered by a personalization scoring system (Scoring V2).

- **Trending**  
  Any story marked as trending is always determined strictly by recent views, never arbitrarily.

---

## Data Sources

All content comes from the `sm_posts` table with at least these key fields:

- `status` – only `status = 'published'` posts are shown.
- `published_at` – used for recency ordering and 7-day trending window.
- `views` – used to rank trending posts.
- `importance_score` – editor-set weight for personalization.
- `team_slug` – Bears, Bulls, Blackhawks, Cubs, White Sox, etc.
- `content_type` – article, video, analysis, etc., for badges and scoring.
- `is_evergreen` – marks guides/evergreen content for alternate card style.

Personalization also uses:

- `user_engagement_profile` – per-user JSON fields for team scores, format preferences, author affinity, and topic views.
- `user_interactions` – per-user per-post interactions (click, read time, scroll depth, etc.).

---

## Homepage (`/`) Behavior

The homepage is intentionally **not personalized**. It shows what’s happening in Chicago sports right now for everyone.

### Query Logic

1. **Editor picks**

   Fetch all posts with:

   - `editor_pick = true`
   - `status = 'published'`
   - `pinned_slot` between 1 and 6

   Sorted by `pinned_slot ASC`. Used to build the hero section and “More Featured” list.

2. **Trending posts**

   - Define a 7-day window: `published_at >= now() - 7 days`.
   - Fetch posts with:
     - `status = 'published'`
     - `published_at` in that window
   - Order by `views DESC` and take a limited set (e.g., top 20, with top 5 displayed).
   - That list’s IDs are used to set an `is_trending` flag in the main feed array.

3. **Main feed posts**

   Fetch all recent content with:

   - `status = 'published'`
   - Ordered by `published_at DESC`
   - Limited to a reasonable maximum (e.g., 200 rows)

   For each post, set:

   - `is_trending = true` if its ID appears in the trending set.
   - `author_name` (if needed) and other UI-friendly fields.

4. **Fallbacks**

   - If the editor picks or feed arrays are empty (e.g., empty DB or error), a small hardcoded fallback set is used to avoid rendering a blank homepage.
   - Fallbacks only activate when there is truly no data in that section, not based on user login status.

### Display Logic

- **Editor picks hero**

  - Slots 1–3: larger visual cards (image, headline, team badge).
  - Slots 4–6: text-only “More Featured” list.

- **Team filter tabs**

  - Pills: All, Bears, Bulls, Blackhawks, Cubs, White Sox.
  - Default selection is **All**, so the homepage always shows all teams initially.
  - Changing tabs filters the in-memory post array by `team_slug` only; no extra queries.

- **Main feed**

  - Ordered purely by `published_at DESC` (recency).
  - Cards are text-first, with:
    - Team pill (Bears/Bulls/etc.).
    - Optional `🔥 TRENDING` badge if `is_trending` is true.
    - Optional content-type badge (VIDEO, ANALYSIS, etc.) based on `content_type`.
    - Evergreen guide cards get a small thumbnail and `GUIDE` badge.

- **Recency labels**

  - “Just now”, “Today”, “Yesterday”, “X days ago” for posts up to 6 days old.
  - Calendar date format (e.g., “Jan 9”) for older posts.

---

## Personal Feed (`/feed`) Behavior

The personal feed is for **logged-in users only** and uses full personalization.

### Access Control

- If there is no authenticated user, `/feed` redirects to `/`.

### Query Logic

The feed uses the same base content queries as the homepage:

- Editor picks: same as homepage.
- Trending posts: same 7-day, `views DESC` logic as homepage.
- Main feed posts: same `status = 'published'`, ordered by `published_at DESC`, same row limit.

The difference is **ordering**, not which posts are included.

### Personalization Data

For the logged-in user:

- Load their `user_engagement_profile` row (if present) for:
  - `team_scores` – how strongly they engage with each team.
  - `format_prefs` – preference for article vs video vs analysis.
  - `author_reads` – counts of posts read by each author.
  - `topic_views_today` – how many posts of a given topic they have seen today.

- Load `user_interactions` to build:
  - `viewedPostIds` – IDs where they’ve clicked or read.

### Scoring V2

Each post gets a score using a function like:

\[
\text{final score} = \text{importance base} + \text{recency decay} + \text{team affinity} + \text{trending boost} + \text{unseen bonus} + \text{format preference boost} + \text{author affinity} + \text{topic fatigue penalty}
\]

- **Base**: `importance_score` or default 50.  
- **Recency decay**: exponential curve that penalizes older content heavier after a few days instead of a strict -5/day.  
- **Team affinity**: weighted from `team_scores` per `team_slug`, up to a capped bonus.  
- **Trending boost**: fixed bonus if `is_trending` is true.  
- **Unseen bonus**: small bonus if the user has not interacted with this post yet.  
- **Format preference**: boosts content types aligned with their reading habits (e.g., video vs article).  
- **Author affinity**: additional points for writers they read frequently.  
- **Topic fatigue**: penalty if they’ve already consumed many posts on the same topic today.

This scoring happens only on the feed route, not on the homepage.

### Ordering and Inclusion

- All posts from the query are included in the personal feed.
- Posts are sorted by score using a helper like `sortPostsByScore(posts, context)`.
- No score threshold or filter is applied; low-scoring posts just appear lower in the list, they are not hidden.

### Display

- Same visual components as the homepage:
  - Editor picks hero.
  - Team tabs.
  - Main feed list.
  - Trending sidebar/drawer.

- The difference is that the main feed list is sorted by score rather than raw recency, and the feed components use `isLoggedIn` to label the primary section as “For You” instead of “Trending in Chicago Sports.”

---

## Trending Logic

Trending is consistent across homepage and personal feed:

- **Window**: last 7 days of content, based on `published_at`.
- **Ranking**: `ORDER BY views DESC`.
- **Top N** (usually 5–20) define “trending”.

Usage:

- These posts appear in:
  - A dedicated trending section (sidebar on desktop, inline drawer on mobile).
  - The main feed, with `is_trending` providing a 🔥 badge and a small scoring boost in the personal feed.

- Trending is not redefined by score and is not editorially set; it is purely view-based, anchored to real fan interest.

---

## Anonymous vs Logged-in Behavior

- **Anonymous / first-time users**
  - See the homepage with all recent posts in recency order.
  - Can filter by team using the tabs.
  - See trending based on views but do not have a “For You” feed or any personalized ranking.

- **Logged-in users**
  - See the same homepage as everyone else when they visit `/`.
  - Get a personalized `/feed` with full scoring and ranking tuned to their behavior and team interests.

---

This setup keeps the homepage simple, predictable, and inclusive for all Chicago fans, while giving logged-in users a separate, clearly defined place for a deeper, personalized experience.
