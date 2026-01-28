// src/components/homepage/TrendingSection.tsx
'use client';

import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  team_slug: string;
}

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  const topFive = posts.slice(0, 5);

  return (
    <aside className="trending-section" aria-label="Trending Stories">
      <h3 className="trending-section-header">
        <span className="trending-icon">Trending Now</span>
      </h3>
      <ol className="trending-list">
        {topFive.map((post, index) => (
          <li key={post.id} className="trending-item">
            <span className="trending-rank">{index + 1}</span>
            <Link href={`/${post.slug}`} className="trending-link">
              <span className={`trending-team-indicator trending-team-indicator--${post.team_slug}`} />
              <span className="trending-title">{post.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
