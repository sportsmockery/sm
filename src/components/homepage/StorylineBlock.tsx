// src/components/homepage/StorylineBlock.tsx
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { PostCard } from './PostCard';

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

interface StorylineBlockProps {
  teamSlug: string;       // e.g. "chicago-bears"
  teamLabel: string;      // e.g. "BEARS"
  posts: Post[];
  hubRoute: string;       // e.g. "/chicago-bears"
  postCount: number;      // total posts in this team (before slice)
}

function getCardSize(post: Post, index: number): 'xl' | 'm' | 'compact' {
  if (index === 0 && post.featured_image) return 'xl';
  if (post.content_type === 'analysis' || post.content_type === 'video' || post.is_evergreen) return 'm';
  return 'compact';
}

export function StorylineBlock({ teamSlug, teamLabel, posts, hubRoute, postCount }: StorylineBlockProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (posts.length === 0) return null;

  return (
    <div className="storyline-block" data-team={teamSlug}>
      {/* Header */}
      <div className="storyline-block-header">
        <div className="storyline-block-title-row">
          <span className={`storyline-block-dot storyline-dot--${teamSlug.replace('chicago-', '')}`} />
          <h3 className="storyline-block-title">{teamLabel}</h3>
          <span className="storyline-block-count">{postCount} {postCount === 1 ? 'story' : 'stories'}</span>
        </div>
        <Link href={hubRoute} className="storyline-block-viewall">
          View all {teamLabel} &rarr;
        </Link>
      </div>

      {/* Horizontal card row with scroll arrows */}
      <div className="storyline-block-row-wrapper">
        <button
          className="storyline-scroll-btn storyline-scroll-btn--left"
          onClick={() => scrollBy('left')}
          aria-label="Scroll left"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <div className="storyline-block-row" ref={scrollRef}>
          {posts.map((post, i) => (
            <div key={post.id} className="storyline-card-slot" data-feed-card data-slug={post.slug}>
              <PostCard post={post} priority={i < 2} cardSize={getCardSize(post, i)} />
            </div>
          ))}
        </div>

        <button
          className="storyline-scroll-btn storyline-scroll-btn--right"
          onClick={() => scrollBy('right')}
          aria-label="Scroll right"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
