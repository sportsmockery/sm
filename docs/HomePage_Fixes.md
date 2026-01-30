# Homepage Fixes

This document outlines the fixes needed for the SportsMockery homepage based on the January 29, 2026 test report.

---

## Priority 0: Critical Fixes (Immediate)

### Fix 1: Image Loading

**Problem:** 31,051 posts have featured_image URLs but images don't render on homepage.

**Root Cause:** Image URLs point to old WordPress CDN (2014-2017) that may be broken or slow.

**Files to Modify:**
- `src/components/homepage/EditorPicksHero.tsx`
- `src/components/homepage/PostCard.tsx`

**Solution:**

```typescript
// src/components/homepage/ImageWithFallback.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority = false
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback placeholder
  const placeholder = '/images/placeholder-post.jpg';

  if (!src || error) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        priority={priority}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </>
  );
}
```

**Usage in EditorPicksHero.tsx:**
```typescript
import { ImageWithFallback } from './ImageWithFallback';

// Replace:
{pick.featured_image ? (
  <Image src={pick.featured_image} ... />
) : (
  <div className="editor-pick-placeholder" />
)}

// With:
<ImageWithFallback
  src={pick.featured_image}
  alt={pick.title}
  fill
  className="editor-pick-image"
  priority={pick.pinned_slot === 1}
/>
```

---

### Fix 2: View Tracking

**Problem:** Only 13 of 31,106 posts have views recorded. Trending section is broken.

**Root Cause:** View tracking API not being called or not recording to database.

**Files to Check:**
- `src/app/api/views/route.ts`
- `src/app/api/views/[id]/route.ts`
- Post page components that should call view API

**Debugging Steps:**

```typescript
// Add to post page component (e.g., src/app/[category]/[slug]/page.tsx)
useEffect(() => {
  const trackView = async () => {
    console.log('[View Tracking] Recording view for post:', postId);
    try {
      const res = await fetch(`/api/views/${postId}`, { method: 'POST' });
      const data = await res.json();
      console.log('[View Tracking] Response:', data);
    } catch (error) {
      console.error('[View Tracking] Error:', error);
    }
  };

  trackView();
}, [postId]);
```

**Fix for API Route:**

```typescript
// src/app/api/views/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Increment view count
  const { data, error } = await supabase.rpc('increment_view_count', {
    post_id: parseInt(postId)
  });

  if (error) {
    console.error('[Views API] Error incrementing view:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, views: data });
}
```

**Database Function (run in Supabase):**

```sql
CREATE OR REPLACE FUNCTION increment_view_count(post_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE sm_posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id
  RETURNING views INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql;
```

---

## Priority 1: High Priority Fixes (This Week)

### Fix 3: Add Live Games Widget

**Problem:** No live game scores on homepage. Fans want to see current scores immediately.

**Files to Create:**
- `src/components/homepage/LiveGamesBar.tsx`

**Implementation:**

```typescript
// src/components/homepage/LiveGamesBar.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LiveGame {
  id: string;
  sport: string;
  team: string;
  opponent: string;
  teamScore: number;
  opponentScore: number;
  status: 'pre' | 'live' | 'final';
  period?: string;
  timeRemaining?: string;
  startTime?: string;
}

export function LiveGamesBar() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/live-games');
        const data = await res.json();
        setGames(data.games || []);
      } catch (error) {
        console.error('Failed to fetch live games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();

    // Poll every 30 seconds for live games
    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="live-games-bar bg-gray-900 text-white py-2 px-4">
        <div className="animate-pulse flex gap-4">
          <div className="h-6 w-32 bg-gray-700 rounded" />
          <div className="h-6 w-32 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return null; // No games to show
  }

  return (
    <div className="live-games-bar bg-gray-900 text-white py-2 overflow-x-auto">
      <div className="flex gap-6 px-4 min-w-max">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/live/${game.sport}/${game.id}`}
            className="flex items-center gap-3 hover:bg-gray-800 px-3 py-1 rounded transition-colors"
          >
            {game.status === 'live' && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <span className="font-medium">{game.team}</span>
            <span className="text-xl font-bold">
              {game.teamScore} - {game.opponentScore}
            </span>
            <span className="text-gray-400">{game.opponent}</span>
            {game.status === 'live' && game.period && (
              <span className="text-xs bg-red-600 px-2 py-0.5 rounded">
                {game.period} {game.timeRemaining}
              </span>
            )}
            {game.status === 'final' && (
              <span className="text-xs text-gray-500">FINAL</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Add to Homepage:**

```typescript
// src/components/homepage/HomepageFeed.tsx
import { LiveGamesBar } from './LiveGamesBar';

export function HomepageFeed({ ... }) {
  return (
    <div className="homepage-feed">
      <LiveGamesBar />
      {/* ... rest of homepage */}
    </div>
  );
}
```

---

### Fix 4: Balance Team Content

**Problem:** 59% Bears, 4% Blackhawks. Unfair team representation.

**Files to Modify:**
- `src/app/page.tsx`

**Solution - Round-Robin Team Balancing:**

```typescript
// src/lib/balanceTeamContent.ts
interface Post {
  id: string;
  team_slug: string | null;
  published_at: string;
  [key: string]: any;
}

const CHICAGO_TEAMS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'];

export function balanceTeamContent(posts: Post[], maxPerTeam: number = 10): Post[] {
  // Group posts by team
  const byTeam: Record<string, Post[]> = {};
  const noTeam: Post[] = [];

  for (const post of posts) {
    if (post.team_slug && CHICAGO_TEAMS.includes(post.team_slug)) {
      if (!byTeam[post.team_slug]) byTeam[post.team_slug] = [];
      byTeam[post.team_slug].push(post);
    } else {
      noTeam.push(post);
    }
  }

  // Take top N from each team, round-robin style
  const balanced: Post[] = [];
  let hasMore = true;
  let index = 0;

  while (hasMore && balanced.length < posts.length) {
    hasMore = false;
    for (const team of CHICAGO_TEAMS) {
      const teamPosts = byTeam[team] || [];
      if (index < teamPosts.length && index < maxPerTeam) {
        balanced.push(teamPosts[index]);
        hasMore = true;
      }
    }
    index++;
  }

  // Add non-team posts at the end
  balanced.push(...noTeam.slice(0, 20));

  return balanced;
}
```

**Usage in page.tsx:**

```typescript
import { balanceTeamContent } from '@/lib/balanceTeamContent';

async function getHomepageData() {
  // ... existing queries ...

  // Balance the content before returning
  const balancedPosts = balanceTeamContent(postsWithFlags, 15);

  return {
    // ...
    rankedPosts: balancedPosts,
  };
}
```

---

### Fix 5: Add Breaking News Banner

**Problem:** No way to highlight major Chicago sports news.

**Files to Create:**
- `src/components/homepage/BreakingNewsBanner.tsx`

**Implementation:**

```typescript
// src/components/homepage/BreakingNewsBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BreakingNews {
  id: string;
  title: string;
  slug: string;
  team_slug: string | null;
}

export function BreakingNewsBanner() {
  const [news, setNews] = useState<BreakingNews | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const res = await fetch('/api/homepage?breaking=true');
        const data = await res.json();
        if (data.breakingNews) {
          // Check if user already dismissed this
          const dismissedId = localStorage.getItem('dismissed_breaking');
          if (dismissedId !== data.breakingNews.id) {
            setNews(data.breakingNews);
          }
        }
      } catch (error) {
        console.error('Failed to fetch breaking news:', error);
      }
    };

    fetchBreaking();
  }, []);

  const handleDismiss = () => {
    if (news) {
      localStorage.setItem('dismissed_breaking', news.id);
    }
    setDismissed(true);
  };

  if (!news || dismissed) return null;

  return (
    <div className="breaking-news-banner bg-red-600 text-white py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold uppercase tracking-wider text-sm bg-white text-red-600 px-2 py-1 rounded">
            Breaking
          </span>
          <Link href={`/${news.slug}`} className="font-medium hover:underline">
            {news.title}
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white p-1"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

**API Support:**

```typescript
// Add to src/app/api/homepage/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wantBreaking = searchParams.get('breaking') === 'true';

  if (wantBreaking) {
    // Get most recent high-importance post (importance_score >= 90)
    const { data: breaking } = await supabase
      .from('sm_posts')
      .select('id, title, slug, team_slug')
      .eq('status', 'published')
      .gte('importance_score', 90)
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ breakingNews: breaking });
  }

  // ... existing homepage API logic
}
```

---

## Priority 2: Medium Priority Fixes (This Month)

### Fix 6: Editorial Curation Admin Tool

**Problem:** All 31,106 posts have importance_score = 50.

**Files to Create:**
- `src/app/admin/curation/page.tsx`

**Quick Fix - Batch Update Recent Posts:**

```sql
-- Run in Supabase SQL Editor
-- Set recent posts to higher importance
UPDATE sm_posts
SET importance_score = 70
WHERE published_at > NOW() - INTERVAL '7 days'
  AND status = 'published';

-- Set posts with high views to even higher importance
UPDATE sm_posts
SET importance_score = 85
WHERE views > 100
  AND status = 'published';
```

---

### Fix 7: Content Type Tagging

**Problem:** Only 1,000 posts have content_type set.

**Batch Update Script:**

```sql
-- Tag video content
UPDATE sm_posts
SET content_type = 'video'
WHERE content ILIKE '%youtube.com%'
   OR content ILIKE '%vimeo.com%'
   OR content ILIKE '%<video%';

-- Tag analysis content
UPDATE sm_posts
SET content_type = 'analysis'
WHERE (title ILIKE '%analysis%' OR title ILIKE '%breakdown%' OR title ILIKE '%deep dive%')
  AND content_type IS NULL;

-- Tag podcast content
UPDATE sm_posts
SET content_type = 'podcast'
WHERE (title ILIKE '%podcast%' OR content ILIKE '%anchor.fm%' OR content ILIKE '%spotify.com/episode%')
  AND content_type IS NULL;

-- Default remaining to article
UPDATE sm_posts
SET content_type = 'article'
WHERE content_type IS NULL;
```

---

### Fix 8: Trending Algorithm Fallback

**Problem:** While view tracking is broken, trending shows random content.

**Temporary Solution - Use Recency + Importance:**

```typescript
// src/app/page.tsx - Update trending query
// Instead of relying on views, use a hybrid score

const { data: trendingPostsRaw = [] } = await supabase
  .from('sm_posts')
  .select('id, title, slug, views, published_at, importance_score, category:sm_categories!category_id(slug)')
  .eq('status', 'published')
  .gte('published_at', sevenDaysAgo.toISOString())
  .order('importance_score', { ascending: false })  // Use importance instead of views
  .order('published_at', { ascending: false })
  .limit(20);
```

---

## Priority 3: Nice to Have (Future)

### Fix 9: Game Day Mode

Auto-enhance homepage during live Chicago team games.

```typescript
// src/hooks/useGameDayMode.ts
export function useGameDayMode() {
  const [isGameDay, setIsGameDay] = useState(false);
  const [liveTeams, setLiveTeams] = useState<string[]>([]);

  useEffect(() => {
    const checkLiveGames = async () => {
      const res = await fetch('/api/live-games');
      const data = await res.json();

      const live = data.games?.filter((g: any) => g.status === 'live') || [];
      setIsGameDay(live.length > 0);
      setLiveTeams(live.map((g: any) => g.team.toLowerCase()));
    };

    checkLiveGames();
    const interval = setInterval(checkLiveGames, 60000);
    return () => clearInterval(interval);
  }, []);

  return { isGameDay, liveTeams };
}
```

---

### Fix 10: Chicago Sports Calendar

```typescript
// src/components/homepage/UpcomingGames.tsx
'use client';

import { useEffect, useState } from 'react';

interface UpcomingGame {
  id: string;
  team: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
}

export function UpcomingGames() {
  const [games, setGames] = useState<UpcomingGame[]>([]);

  useEffect(() => {
    // Fetch upcoming games for all Chicago teams
    const fetchGames = async () => {
      const res = await fetch('/api/schedule?teams=bears,bulls,blackhawks,cubs,whitesox&days=7');
      const data = await res.json();
      setGames(data.games || []);
    };
    fetchGames();
  }, []);

  return (
    <div className="upcoming-games bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-bold text-lg mb-3">Upcoming Games</h3>
      <div className="space-y-2">
        {games.slice(0, 5).map((game) => (
          <div key={game.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <div>
              <span className="font-medium">{game.team}</span>
              <span className="text-gray-500 mx-2">vs</span>
              <span>{game.opponent}</span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(game.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Implementation Order

1. **Week 1:**
   - [ ] Fix 1: Image loading with fallbacks
   - [ ] Fix 2: Debug and fix view tracking
   - [ ] Fix 3: Add live games bar

2. **Week 2:**
   - [ ] Fix 4: Balance team content
   - [ ] Fix 5: Breaking news banner
   - [ ] Fix 7: Batch update content types

3. **Week 3:**
   - [ ] Fix 6: Editorial curation tools
   - [ ] Fix 8: Trending algorithm fallback

4. **Week 4+:**
   - [ ] Fix 9: Game day mode
   - [ ] Fix 10: Chicago sports calendar

---

## Verification Checklist

After implementing fixes, verify:

- [ ] Images load on homepage (no broken placeholders)
- [ ] View counts increment when viewing posts
- [ ] Trending section shows different posts than main feed
- [ ] All 5 Chicago teams appear in first 20 posts
- [ ] Live games bar appears during game time
- [ ] Breaking news banner can be set and dismissed
- [ ] Content type badges appear (VIDEO, ANALYSIS, etc.)
- [ ] Response time < 1.5 seconds
- [ ] Mobile layout works correctly
