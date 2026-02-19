// src/components/homepage/TrendingSection.tsx
'use client';

import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  team_slug: string;
  category_slug?: string | null;
}

interface TrendingSectionProps {
  posts: Post[];
}

const TEAM_PILL_LABELS: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Hawks',
  cubs: 'Cubs',
  'white-sox': 'White Sox',
  whitesox: 'White Sox',
};

export function TrendingSection({ posts }: TrendingSectionProps) {
  const topFive = posts.slice(0, 5);

  return (
    <aside className="glass-card trending-section" aria-label="Trending Stories">
      <h3>Trending Now</h3>
      {topFive.length === 0 ? (
        <p className="trending-empty">Check back soon for trending stories</p>
      ) : (
        <ol className="trending-list">
          {topFive.map((post, index) => (
            <li key={post.id} className="trending-item">
              <span className="trending-rank">{index + 1}</span>
              <Link href={post.category_slug ? `/${post.category_slug}/${post.slug}` : `/${post.slug}`} className="trending-link">
                <span className="trending-content">
                  {post.team_slug && (
                    <>
                      <span className={`trending-team-indicator trending-team-indicator--${post.team_slug}`} />
                      <span className="trending-team-pill">{TEAM_PILL_LABELS[post.team_slug] || post.team_slug}</span>
                    </>
                  )}
                  <span className="trending-title">{post.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
