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
  team_slug: string;
  author_name: string | null;
  published_at: string;
  content_type: string;
  is_trending: boolean;
  is_evergreen: boolean;
}

interface PostCardProps {
  post: Post;
  isMobile: boolean;
  showImage: boolean;
  priority?: boolean;
}

function formatRecency(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const hoursAgo = differenceInHours(now, date);
  const daysAgo = differenceInDays(now, date);

  if (hoursAgo < 2) return 'Just now';
  if (hoursAgo < 24) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo <= 6) return `${daysAgo} days ago`;
  return format(date, 'MMM d');
}

function getContentTypeBadge(contentType: string): string | null {
  const badges: Record<string, string> = {
    'video': 'VIDEO',
    'analysis': 'ANALYSIS',
    'podcast': 'PODCAST',
    'gallery': 'GALLERY'
  };
  return badges[contentType] || null;
}

export function PostCard({ post, isMobile, showImage, priority = false }: PostCardProps) {
  const contentBadge = getContentTypeBadge(post.content_type);
  const recencyLabel = formatRecency(post.published_at);

  // Evergreen cards show small thumbnail, standard cards are text-only
  if (post.is_evergreen && showImage) {
    return (
      <article className="post-card post-card--evergreen">
        <Link href={`/${post.slug}`} className="post-card-link">
          <div className="post-card-thumbnail">
            {post.featured_image ? (
              <Image
                src={post.featured_image}
                alt=""
                width={80}
                height={80}
                className="post-card-thumb-image"
                priority={priority}
              />
            ) : (
              <div className="post-card-thumb-placeholder" />
            )}
          </div>
          <div className="post-card-content">
            <div className="post-card-meta-top">
              <span className={`team-pill team-pill--${post.team_slug}`}>
                {post.team_slug.replace('-', ' ')}
              </span>
              <span className="evergreen-badge">GUIDE</span>
            </div>
            <h3 className="post-card-title">{post.title}</h3>
          </div>
        </Link>
      </article>
    );
  }

  // Standard text-first card (no image)
  return (
    <article className="post-card post-card--standard">
      <Link href={`/${post.slug}`} className="post-card-link">
        <div className="post-card-content">
          <div className="post-card-meta-top">
            <span className={`team-pill team-pill--${post.team_slug}`}>
              {post.team_slug.replace('-', ' ')}
            </span>
            {post.is_trending && (
              <span className="trending-badge">TRENDING</span>
            )}
            {contentBadge && (
              <span className="content-type-badge">{contentBadge}</span>
            )}
          </div>
          <h3 className="post-card-title">{post.title}</h3>
          <div className="post-card-meta-bottom">
            {post.author_name && (
              <span className="post-card-author">{post.author_name}</span>
            )}
            <span className="post-card-recency">{recencyLabel}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
