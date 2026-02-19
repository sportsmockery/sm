// src/components/homepage/PostCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { differenceInHours, differenceInDays, format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  team_slug: string | null;
  category_slug: string | null;
  author_name: string | null;
  published_at: string;
  content_type: string;
  is_trending: boolean;
  is_evergreen: boolean;
}

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

const TEAM_DISPLAY_NAMES: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  'white-sox': 'White Sox',
};

function formatRecency(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutesAgo = Math.floor(diffMs / 60000);
  const hoursAgo = differenceInHours(now, date);
  const daysAgo = differenceInDays(now, date);

  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo <= 6) return `${daysAgo}d ago`;
  return format(date, 'MMM d');
}

function getContentTypeBadge(contentType: string): string | null {
  const badges: Record<string, string> = {
    video: 'VIDEO',
    analysis: 'ANALYSIS',
    podcast: 'PODCAST',
    gallery: 'GALLERY',
  };
  return badges[contentType] || null;
}

export type { Post };

function markAsRead(slug: string) {
  try {
    const raw = localStorage.getItem('sm-read-articles');
    const arr: string[] = raw ? JSON.parse(raw) : [];
    if (!arr.includes(slug)) {
      arr.push(slug);
      // Cap at 200 to avoid bloating localStorage
      if (arr.length > 200) arr.shift();
      localStorage.setItem('sm-read-articles', JSON.stringify(arr));
    }
  } catch {}
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const recencyLabel = formatRecency(post.published_at);
  const teamName = post.team_slug
    ? TEAM_DISPLAY_NAMES[post.team_slug] || post.team_slug.replace('-', ' ')
    : null;

  // Build URL with category prefix: /chicago-bears/article-slug
  const postUrl = post.category_slug
    ? `/${post.category_slug}/${post.slug}`
    : `/${post.slug}`;

  // Keep getContentTypeBadge available for future use
  void getContentTypeBadge;

  return (
    <article className="glass-card feed-card">
      <Link href={postUrl} onClick={() => markAsRead(post.slug)}>
        <div className="card-image">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="card-placeholder" />
          )}
          {teamName && (
            <span className="sm-tag card-team-pill">{teamName}</span>
          )}
          {post.is_trending && (
            <span
              className="sm-tag card-team-pill"
              style={{
                background: 'rgba(255,107,53,0.9)',
                right: 12,
                left: 'auto',
                top: 12,
                position: 'absolute',
              }}
            >
              Trending
            </span>
          )}
        </div>
        <div className="card-body">
          <h3>{post.title}</h3>
          {post.excerpt && <p className="card-excerpt">{post.excerpt}</p>}
          <div className="card-meta">
            <div className="author-avatar" />
            <span>
              {post.author_name || 'Sports Mockery'} &middot; {recencyLabel}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
