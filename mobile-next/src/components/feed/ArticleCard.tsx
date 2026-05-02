'use client';

import Link from 'next/link';
import type { Post } from '@/lib/api';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';

const TEAM_ACCENT: Record<string, string> = {
  bears: 'var(--color-team-bears)',
  cubs: 'var(--color-team-cubs)',
  bulls: 'var(--color-team-bulls)',
  blackhawks: 'var(--color-team-blackhawks)',
  whitesox: 'var(--color-team-whitesox)',
};

function categorySlug(post: Post): string {
  const cat = Array.isArray(post.category) ? post.category[0] : post.category;
  return cat?.slug || 'news';
}

function categoryName(post: Post): string {
  const cat = Array.isArray(post.category) ? post.category[0] : post.category;
  return cat?.name || 'News';
}

export interface ArticleCardProps {
  post: Post;
  variant?: 'feature' | 'standard' | 'compact';
  className?: string;
}

export function ArticleCard({ post, variant = 'standard', className }: ArticleCardProps) {
  const accent = TEAM_ACCENT[categorySlug(post)] ?? 'rgba(255,255,255,0.18)';
  const heroH =
    variant === 'feature'
      ? 'h-[260px]'
      : variant === 'compact'
      ? 'h-[112px]'
      : 'h-[180px]';

  return (
    <Link href={`/article/view?id=${post.id}`} className={cn('block', className)} aria-label={post.title}>
      <LiquidGlassCard
        className="overflow-hidden p-0 border-l-4"
        rounded="2xl"
        padded={false}
        style={{ borderLeftColor: accent }}
      >
        {post.featured_image && (
          <div className={cn('w-full bg-black/40 overflow-hidden', heroH)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              width={800}
              height={400}
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-brand-red font-semibold">
            <span>{categoryName(post)}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/60 normal-case tracking-normal">
              {formatRelativeTime(post.published_at)}
            </span>
          </div>
          <h3
            className={cn(
              'mt-2 font-semibold text-white',
              variant === 'feature' ? 'text-xl leading-snug' : 'text-base leading-snug',
            )}
          >
            {post.title}
          </h3>
          {variant !== 'compact' && post.excerpt && (
            <p className="mt-2 text-sm text-white/70 line-clamp-2">{post.excerpt}</p>
          )}
          <div className="mt-3 flex items-center justify-between text-[11px] text-white/50">
            <span className="truncate">By {post.author?.display_name ?? 'Staff'}</span>
            <span className="tabular-nums">{formatNumber(post.views)} views</span>
          </div>
        </div>
      </LiquidGlassCard>
    </Link>
  );
}
