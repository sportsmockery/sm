// src/components/homepage/TrendingInlineDrawer.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  team_slug: string;
}

interface TrendingInlineDrawerProps {
  posts: Post[];
}

export function TrendingInlineDrawer({ posts }: TrendingInlineDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const topFive = posts.slice(0, 5);

  return (
    <div className="glass-card-sm trending-inline-drawer">
      <button
        className="trending-drawer-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span>Trending Now</span>
        <span className={`trending-drawer-chevron ${isExpanded ? 'expanded' : ''}`}>&rsaquo;</span>
      </button>
      {isExpanded && (
        <ol className="trending-drawer-list">
          {topFive.map((post, index) => (
            <li key={post.id} className="trending-drawer-item">
              <span className="trending-drawer-rank">{index + 1}</span>
              <Link href={`/${post.slug}`} className="trending-drawer-link">{post.title}</Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
