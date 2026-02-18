// src/components/homepage/ForYouFeed.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PostCard } from './PostCard';
import { TrendingInlineDrawer } from './TrendingInlineDrawer';
import { FeedSkeleton } from './FeedSkeleton';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  team_slug: string;
  author_name: string | null;
  published_at: string;
  content_type: string;
  is_trending: boolean;
  is_evergreen: boolean;
}

interface ForYouFeedProps {
  posts: Post[];
  isLoggedIn: boolean;
  isMobile: boolean;
  showTrendingInline: boolean;
  trendingPosts: Post[];
}

const POSTS_PER_PAGE = 15;

export function ForYouFeed({
  posts,
  isLoggedIn,
  isMobile,
  showTrendingInline,
  trendingPosts,
}: ForYouFeedProps) {
  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (isLoading || displayCount >= posts.length) return;
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + POSTS_PER_PAGE, posts.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, displayCount, posts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const visiblePosts = posts.slice(0, displayCount);

  // Suppress unused variable warnings for props used conditionally
  void isLoggedIn;

  // Handle empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="glass-card feed-empty-state">
        <p className="feed-empty-message">
          Welcome to SportsMockery! Fresh Chicago sports content is on the way.
        </p>
        <p className="feed-empty-submessage">
          Check back soon for Bears, Bulls, Blackhawks, Cubs, and White Sox
          coverage.
        </p>
      </div>
    );
  }

  return (
    <div className="feed-grid">
      {visiblePosts.map((post, index) => (
        <div key={post.id}>
          <PostCard post={post} priority={index < 3} />

          {/* Insert trending drawer after index 5 on mobile */}
          {showTrendingInline && isMobile && index === 5 && (
            <TrendingInlineDrawer posts={trendingPosts} />
          )}
        </div>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef}>
        {isLoading && <FeedSkeleton count={3} />}
        {displayCount >= posts.length && posts.length > 0 && (
          <p className="feed-end-message">You&apos;re all caught up!</p>
        )}
      </div>

      {/* Fallback load more button */}
      {displayCount < posts.length && !isLoading && (
        <button
          onClick={loadMore}
          className="btn-secondary"
          style={{ width: '100%', marginTop: 24 }}
        >
          Load More Stories
        </button>
      )}
    </div>
  );
}
