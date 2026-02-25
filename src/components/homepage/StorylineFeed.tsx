// src/components/homepage/StorylineFeed.tsx
'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { StorylineBlock } from './StorylineBlock';
import { PostCard } from './PostCard';
import { TrendingInlineDrawer } from './TrendingInlineDrawer';
import { FeedSkeleton } from './FeedSkeleton';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  team_slug: string | null;
  category_slug: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  published_at: string;
  content_type: string;
  is_trending: boolean;
  is_evergreen: boolean;
  views: number | null;
}

interface StorylineFeedProps {
  posts: Post[];
  isLoggedIn: boolean;
  isMobile: boolean;
  showTrendingInline: boolean;
  trendingPosts: Post[];
  activeTeam?: string;
  userTeamPreference?: string | null;
}

// Chicago team category slugs → display info
const TEAM_CONFIG: Record<string, { label: string; hub: string }> = {
  'chicago-bears':      { label: 'BEARS',      hub: '/chicago-bears' },
  'chicago-bulls':      { label: 'BULLS',      hub: '/chicago-bulls' },
  'chicago-blackhawks': { label: 'BLACKHAWKS', hub: '/chicago-blackhawks' },
  'chicago-cubs':       { label: 'CUBS',       hub: '/chicago-cubs' },
  'chicago-white-sox':  { label: 'WHITE SOX',  hub: '/chicago-white-sox' },
};

// Map team_slug (short) to category_slug (full) for grouping
const TEAM_SLUG_TO_CATEGORY: Record<string, string> = {
  'bears':      'chicago-bears',
  'bulls':      'chicago-bulls',
  'blackhawks': 'chicago-blackhawks',
  'cubs':       'chicago-cubs',
  'white-sox':  'chicago-white-sox',
  'whitesox':   'chicago-white-sox',
};

// Preference slug → category slug
const PREF_TO_CATEGORY: Record<string, string> = {
  'bears':      'chicago-bears',
  'bulls':      'chicago-bulls',
  'blackhawks': 'chicago-blackhawks',
  'cubs':       'chicago-cubs',
  'white-sox':  'chicago-white-sox',
  'whitesox':   'chicago-white-sox',
};

const MAX_CARDS_PER_BLOCK = 6;
const INITIAL_BLOCKS = 4;

interface TeamGroup {
  categorySlug: string;
  label: string;
  hub: string;
  posts: Post[];
  totalCount: number;
  maxImportance: number;
  latestDate: number;
}

export function StorylineFeed({
  posts,
  isLoggedIn,
  isMobile,
  showTrendingInline,
  trendingPosts,
  activeTeam,
  userTeamPreference,
}: StorylineFeedProps) {
  const [blocksShown, setBlocksShown] = useState(INITIAL_BLOCKS);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Suppress unused variable warnings
  void isLoggedIn;

  // Group posts by category_slug (team)
  const teamGroups = useMemo(() => {
    const groups = new Map<string, Post[]>();

    for (const post of posts) {
      // Determine category key: prefer category_slug, fall back to team_slug mapping
      let catKey = post.category_slug || '';
      if (!TEAM_CONFIG[catKey] && post.team_slug) {
        catKey = TEAM_SLUG_TO_CATEGORY[post.team_slug] || '';
      }
      // Skip posts that don't belong to a Chicago team
      if (!TEAM_CONFIG[catKey]) continue;

      const arr = groups.get(catKey) || [];
      arr.push(post);
      groups.set(catKey, arr);
    }

    // Build sorted group list
    const result: TeamGroup[] = [];
    for (const [catSlug, teamPosts] of groups.entries()) {
      const config = TEAM_CONFIG[catSlug];
      if (!config) continue;

      const maxImportance = teamPosts.reduce(
        (max, p) => Math.max(max, (p as any).importance_score ?? 0),
        0
      );
      const latestDate = teamPosts.reduce(
        (max, p) => Math.max(max, new Date(p.published_at).getTime()),
        0
      );

      result.push({
        categorySlug: catSlug,
        label: config.label,
        hub: config.hub,
        posts: teamPosts,
        totalCount: teamPosts.length,
        maxImportance,
        latestDate,
      });
    }

    // Sort: max importance desc, then latest date desc
    result.sort((a, b) => {
      if (b.maxImportance !== a.maxImportance) return b.maxImportance - a.maxImportance;
      return b.latestDate - a.latestDate;
    });

    // Reorder: if user has a preferred team, move it to the top
    if (userTeamPreference) {
      const prefCat = PREF_TO_CATEGORY[userTeamPreference];
      if (prefCat) {
        const prefIdx = result.findIndex((g) => g.categorySlug === prefCat);
        if (prefIdx > 0) {
          const [prefGroup] = result.splice(prefIdx, 1);
          result.unshift(prefGroup);
        }
      }
    }

    return result;
  }, [posts, userTeamPreference]);

  // Remaining posts that don't belong to any Chicago team (show as flat list at bottom)
  const uncategorizedPosts = useMemo(() => {
    const chicagoIds = new Set<string>();
    for (const g of teamGroups) {
      for (const p of g.posts) chicagoIds.add(p.id);
    }
    return posts.filter((p) => !chicagoIds.has(p.id));
  }, [posts, teamGroups]);

  // Visible blocks
  const visibleGroups = teamGroups.slice(0, blocksShown);
  const hasMore = blocksShown < teamGroups.length || uncategorizedPosts.length > 0;

  // Load more
  const loadMore = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setBlocksShown((prev) => Math.min(prev + 2, teamGroups.length + 1));
      setIsLoading(false);
    }, 200);
  }, [isLoading, teamGroups.length]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      },
      { rootMargin: '300px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Scroll-in animation for blocks
  useEffect(() => {
    if (!feedRef.current) return;
    const blocks = feedRef.current.querySelectorAll('.storyline-block');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('storyline-block--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px', threshold: 0.05 }
    );
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, [visibleGroups.length]);

  // Mark read articles
  useEffect(() => {
    if (!feedRef.current) return;
    try {
      const raw = localStorage.getItem('sm-read-articles');
      if (!raw) return;
      const slugSet = new Set<string>(JSON.parse(raw));
      feedRef.current.querySelectorAll('[data-slug]').forEach((el) => {
        if (slugSet.has((el as HTMLElement).dataset.slug || '')) {
          el.classList.add('is-read');
        }
      });
    } catch {}
  }, [visibleGroups.length]);

  // Empty state
  if (teamGroups.length === 0 && uncategorizedPosts.length === 0) {
    const teamLabel =
      activeTeam && activeTeam !== 'all'
        ? (TEAM_CONFIG[PREF_TO_CATEGORY[activeTeam] || '']?.label || activeTeam)
        : null;
    return (
      <div className="glass-card feed-empty-state">
        {teamLabel ? (
          <>
            <p className="feed-empty-message">No {teamLabel} articles right now</p>
            <p className="feed-empty-submessage">Try showing all teams to see the latest Chicago sports content.</p>
          </>
        ) : (
          <>
            <p className="feed-empty-message">Welcome to SportsMockery! Fresh Chicago sports content is on the way.</p>
            <p className="feed-empty-submessage">Check back soon for Bears, Bulls, Blackhawks, Cubs, and White Sox coverage.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="storyline-feed" ref={feedRef}>
      {visibleGroups.map((group, gi) => (
        <div key={group.categorySlug}>
          <StorylineBlock
            teamSlug={group.categorySlug}
            teamLabel={group.label}
            posts={group.posts.slice(0, MAX_CARDS_PER_BLOCK)}
            hubRoute={group.hub}
            postCount={group.totalCount}
          />

          {/* Mobile trending drawer after 2nd block */}
          {showTrendingInline && isMobile && gi === 1 && (
            <TrendingInlineDrawer posts={trendingPosts} />
          )}
        </div>
      ))}

      {/* Uncategorized posts (non-Chicago) as a flat section */}
      {blocksShown >= teamGroups.length && uncategorizedPosts.length > 0 && (
        <div className="storyline-block storyline-block--misc">
          <div className="storyline-block-header">
            <div className="storyline-block-title-row">
              <span className="storyline-block-dot" />
              <h3 className="storyline-block-title">MORE STORIES</h3>
              <span className="storyline-block-count">{uncategorizedPosts.length} stories</span>
            </div>
          </div>
          <div className="storyline-block-row-wrapper">
            <div className="storyline-block-row">
              {uncategorizedPosts.slice(0, MAX_CARDS_PER_BLOCK).map((post, i) => (
                <div key={post.id} className="storyline-card-slot" data-feed-card data-slug={post.slug}>
                  <PostCard post={post} priority={false} cardSize={i === 0 ? 'xl' : 'compact'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef}>
        {isLoading && <FeedSkeleton count={2} />}
        {!hasMore && teamGroups.length > 0 && (
          <p className="feed-end-message">You&apos;re all caught up!</p>
        )}
      </div>
    </div>
  );
}
