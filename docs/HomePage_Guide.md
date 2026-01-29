# Homepage Guide

This document describes how the SportsMockery homepage (`/`) works, including data flow, queries, and component architecture.

---

## Overview

The homepage displays Chicago sports news in a simple, recency-based feed. It is **not personalized** - all users see the same content ordered by publication date.

**URL:** `/` (src/app/page.tsx)

**Key Principle:** Show "what's happening in Chicago sports right now" for everyone.

---

## Architecture

```
src/app/page.tsx (Server Component)
    │
    ├── getHomepageData()  ─────────────────────────────┐
    │   │                                               │
    │   ├── Supabase Query: Editor Picks (top 6)        │
    │   ├── Supabase Query: Trending Posts (last 7 days)│
    │   └── Supabase Query: All Posts (limit 200)       │
    │                                                   │
    │   └── getHomepageDataWithFallbacks()              │
    │       (applies fallbacks if queries return empty) │
    │                                               ▼
    └── <HomepageFeed />  ◄─────────────────────────────┘
            │
            ├── <EditorPicksHero />    (Featured posts)
            ├── Team Filter Tabs       (Client-side filtering)
            ├── <TrendingSidebar />    (Trending drawer/sidebar)
            └── <PostCard /> list      (Main feed)
```

---

## Data Source

All content comes from the `sm_posts` table in Supabase.

### Available Columns in sm_posts

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Primary key |
| `title` | string | Post title |
| `slug` | string | URL slug |
| `excerpt` | string | Short description |
| `featured_image` | string | Image URL |
| `category_id` | integer | Foreign key to sm_categories |
| `author_id` | integer | Foreign key to sm_authors |
| `content` | text | Full post content |
| `content_type` | string | article, video, analysis, etc. |
| `importance_score` | integer | Editor-set weight (0-100) |
| `primary_topic` | string | Main topic tag |
| `published_at` | timestamp | Publication date |
| `views` | integer | View count |
| `status` | string | draft, published, archived |

### Columns That Do NOT Exist

The following columns are referenced in some documentation but **do not exist** in the actual table:

- `team_slug` - Use category join instead
- `editor_pick` - Use importance_score as proxy
- `pinned_slot` - Simulated in code
- `is_evergreen` - Default to false

---

## Data Flow

### 1. Server-Side Data Fetching

The homepage uses a Server Component with `dynamic = 'force-dynamic'` to ensure fresh data on each request.

```typescript
// src/app/page.tsx
export const dynamic = 'force-dynamic'

async function getHomepageData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role bypasses RLS
  )
  // ... queries
}
```

### 2. Editor Picks Query

Since `editor_pick` and `pinned_slot` columns don't exist, we use `importance_score` as a proxy:

```typescript
const { data: editorPicksRaw = [] } = await supabase
  .from('sm_posts')
  .select('id, title, slug, featured_image, category:sm_categories!category_id(slug)')
  .eq('status', 'published')
  .order('importance_score', { ascending: false })
  .limit(6)
```

The `pinned_slot` is simulated by array index + 1.

### 3. Trending Posts Query

Trending is based strictly on views in the last 7 days:

```typescript
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

const { data: trendingPostsRaw = [] } = await supabase
  .from('sm_posts')
  .select('id, title, slug, views, published_at, ..., category:sm_categories!category_id(slug)')
  .eq('status', 'published')
  .gte('published_at', sevenDaysAgo.toISOString())
  .order('views', { ascending: false })
  .limit(20)
```

### 4. Main Feed Query

All recent posts ordered by recency (no scoring):

```typescript
const { data: allPostsRaw = [] } = await supabase
  .from('sm_posts')
  .select(`
    id, title, slug, excerpt, featured_image,
    published_at, importance_score, content_type, primary_topic,
    author_id, views,
    category:sm_categories!category_id(slug)
  `)
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(200)
```

### 5. Team Slug Derivation

Since `team_slug` doesn't exist, it's derived from the category:

```typescript
function getTeamSlug(category: any): string | null {
  const cat = Array.isArray(category) ? category[0] : category
  const slug = cat?.slug?.toLowerCase() || ''
  if (slug.includes('bears')) return 'bears'
  if (slug.includes('bulls')) return 'bulls'
  if (slug.includes('blackhawks')) return 'blackhawks'
  if (slug.includes('cubs')) return 'cubs'
  if (slug.includes('whitesox') || slug.includes('white-sox')) return 'whitesox'
  return null
}
```

---

## Fallback System

If queries return empty (database error, no content), hardcoded fallbacks are used:

```typescript
// src/lib/homepage-fallbacks.ts
export function getHomepageDataWithFallbacks(
  editorPicks: any[],
  rankedPosts: any[],
  trendingPosts: any[]
) {
  return {
    editorPicks: editorPicks.length > 0 ? editorPicks : FALLBACK_EDITOR_PICKS,
    rankedPosts: rankedPosts.length > 0 ? rankedPosts : FALLBACK_POSTS,
    trendingPosts: trendingPosts.length > 0 ? trendingPosts : []
  }
}
```

Fallback posts have IDs like `fallback-post-1` to identify them in debugging.

---

## Components

### HomepageFeed (src/components/homepage/HomepageFeed.tsx)

Main container component. Handles:
- Team filter tabs (client-side filtering)
- Mobile/desktop layout detection
- Renders child components

```typescript
interface HomepageFeedProps {
  initialPosts: Post[]
  editorPicks: EditorPick[]
  trendingPosts: Post[]
  userTeamPreference: string | null
  isLoggedIn: boolean
}
```

### EditorPicksHero (src/components/homepage/EditorPicksHero.tsx)

Displays top 6 posts by importance:
- Slots 1-3: Visual cards with images
- Slots 4-6: Text-only "More Featured" list

**Important:** Handles null `team_slug` gracefully with conditional rendering.

### PostCard (src/components/homepage/PostCard.tsx)

Individual post card with:
- Team pill badge (if team_slug exists)
- Trending badge (if is_trending)
- Content type badge (VIDEO, ANALYSIS, etc.)
- Recency label (Just now, Today, Yesterday, X days ago)

**Important:** Handles null `team_slug` gracefully with conditional rendering.

---

## Team Filtering

Team filtering happens **client-side** in HomepageFeed:

```typescript
const filteredPosts = activeTeam === 'all'
  ? safePosts
  : safePosts.filter(post => post.team_slug === activeTeam)
```

Available teams:
- `all` (default)
- `bears`
- `bulls`
- `blackhawks`
- `cubs`
- `whitesox`

---

## Error Handling

The homepage wraps data fetching in try/catch:

```typescript
export default async function HomePage() {
  try {
    const data = await getHomepageData()
    return <HomepageFeed {...data} />
  } catch (error) {
    console.error('[Homepage] CAUGHT ERROR:', error)
    return <HomepageFeed
      initialPosts={FALLBACK_POSTS}
      editorPicks={FALLBACK_EDITOR_PICKS}
      ...
    />
  }
}
```

---

## Personal Feed Comparison

The personal feed (`/feed`) uses the same queries but:

1. **Requires authentication** - redirects to `/` if not logged in
2. **Uses scoring** - posts sorted by `sortPostsByScore()` instead of recency
3. **Loads user profile** - `user_engagement_profile` for personalization

See `src/app/feed/page.tsx` for implementation.

---

## Debugging

### Check for Fallback Content

If you see posts with IDs like `fallback-post-1`, the queries are failing.

```bash
curl -s https://test.sportsmockery.com/ | grep -c 'fallback-post'
```

### Check Vercel Logs

```bash
vercel logs <deployment-url> --scope chris-burhans-projects
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `column sm_posts.team_slug does not exist` | Query uses non-existent column | Use category join |
| `column sm_posts.pinned_slot does not exist` | Query uses non-existent column | Use importance_score |
| `Cannot read properties of null (reading 'toUpperCase')` | Null team_slug | Add conditional rendering |
| `Cannot read properties of null (reading 'replace')` | Null team_slug | Add conditional rendering |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage server component |
| `src/app/feed/page.tsx` | Personal feed (logged-in users) |
| `src/components/homepage/HomepageFeed.tsx` | Main feed container |
| `src/components/homepage/EditorPicksHero.tsx` | Featured posts section |
| `src/components/homepage/PostCard.tsx` | Individual post card |
| `src/lib/homepage-fallbacks.ts` | Fallback data and helper |
| `src/lib/scoring-v2.ts` | Scoring system (feed only) |

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasses RLS) |

The homepage uses the service role key to bypass Row Level Security, ensuring all published posts are visible to anonymous users.
