// src/components/homepage/ForYouFeed.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from './PostCard';
import { TrendingInlineDrawer } from './TrendingInlineDrawer';
import { FeedSkeleton } from './FeedSkeleton';

const cardSpring = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  team_slug: string;
  category_slug: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  published_at: string;
  content_type: string;
  is_trending: boolean;
  is_evergreen: boolean;
  views: number | null;
}

interface ForYouFeedProps {
  posts: Post[];
  isLoggedIn: boolean;
  isMobile: boolean;
  showTrendingInline: boolean;
  trendingPosts: Post[];
  activeTeam?: string;
}

const POSTS_PER_PAGE = 15;

// Classify card size based on post properties
function getCardSize(post: Post, index: number): 'xl' | 'm' | 'compact' {
  // First post or posts with featured image + high views → XL (image-dominant)
  if (index === 0 || (post.featured_image && post.is_trending && (post.views ?? 0) > 500)) {
    return 'xl';
  }
  // Analysis, video, or evergreen content → M (medium with tags)
  if (post.content_type === 'analysis' || post.content_type === 'video' || post.is_evergreen) {
    return 'm';
  }
  // Everything else → compact (text-focus)
  return 'compact';
}

const TEAM_NAMES: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  'white-sox': 'White Sox',
};

export function ForYouFeed({
  posts,
  isLoggedIn,
  isMobile,
  showTrendingInline,
  trendingPosts,
  activeTeam,
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
  const feedGridRef = useRef<HTMLDivElement>(null);

  // Scroll-in animation: first 6 cards show immediately, rest animate in
  useEffect(() => {
    if (!feedGridRef.current) return;
    const IMMEDIATE_COUNT = 6;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('card-scroll-hidden');
            entry.target.classList.add('card-scroll-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    const cards = feedGridRef.current.querySelectorAll('[data-feed-card]');
    cards.forEach((card, i) => {
      if (i < IMMEDIATE_COUNT) {
        card.classList.remove('card-scroll-hidden');
      } else if (!card.classList.contains('card-scroll-in')) {
        card.classList.add('card-scroll-hidden');
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, [visiblePosts.length]);

  // Feature 2: Mark read articles from localStorage
  useEffect(() => {
    if (!feedGridRef.current) return;
    try {
      const raw = localStorage.getItem('sm-read-articles');
      if (!raw) return;
      const readSlugs: string[] = JSON.parse(raw);
      const slugSet = new Set(readSlugs);
      feedGridRef.current.querySelectorAll('[data-slug]').forEach((el) => {
        if (slugSet.has((el as HTMLElement).dataset.slug || '')) {
          el.classList.add('is-read');
        }
      });
    } catch {}
  }, [visiblePosts.length]);

  // Suppress unused variable warnings for props used conditionally
  void isLoggedIn;

  // Handle empty state
  if (!posts || posts.length === 0) {
    const teamLabel = activeTeam && activeTeam !== 'all' ? TEAM_NAMES[activeTeam] : null;
    return (
      <div className="glass-card feed-empty-state">
        {teamLabel ? (
          <>
            <p className="feed-empty-message">
              No {teamLabel} articles right now
            </p>
            <p className="feed-empty-submessage">
              Try showing all teams to see the latest Chicago sports content.
            </p>
          </>
        ) : (
          <>
            <p className="feed-empty-message">
              Welcome to SportsMockery! Fresh Chicago sports content is on the way.
            </p>
            <p className="feed-empty-submessage">
              Check back soon for Bears, Bulls, Blackhawks, Cubs, and White Sox
              coverage.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="feed-grid" ref={feedGridRef} style={{ gap: '32px', padding: '32px 0' }}>
      <AnimatePresence mode="popLayout">
        {visiblePosts.map((post, index) => (
          <motion.div
            key={post.id}
            layoutId={`feed-card-${post.id}`}
            layout="position"
            transition={cardSpring}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            data-feed-card
            data-slug={post.slug}
          >
            <PostCard post={post} priority={index < 3} cardSize={getCardSize(post, index)} />

            {/* Insert trending drawer after index 5 on mobile */}
            {showTrendingInline && isMobile && index === 5 && (
              <TrendingInlineDrawer posts={trendingPosts} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

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
          className="btn-secondary btn-load-more"
          style={{ width: '100%', marginTop: 24 }}
        >
          Load More Articles
        </button>
      )}
    </div>
  );
}
