'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Headphones, Share2 } from 'lucide-react';
import { api, type ArticleContent } from '@/lib/api';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { formatRelativeTime } from '@/lib/utils';

function ArticleInner() {
  const params = useSearchParams();
  const id = params.get('id');
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const player = useAudioPlayer();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .getArticle(Number(id))
      .then((a) => { if (!cancelled) setArticle(a); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [id]);

  function listen() {
    if (!article) return;
    player.play({
      id: article.id,
      title: article.title,
      artist: article.author?.display_name ?? 'Sports Mockery',
      artwork: article.featured_image ?? undefined,
      src: api.getAudioUrl(article.slug),
    });
  }

  function share() {
    if (typeof navigator !== 'undefined' && 'share' in navigator && article) {
      navigator
        .share({ title: article.title, url: typeof window !== 'undefined' ? window.location.href : '' })
        .catch(() => {});
    }
  }

  return (
    <main className="min-h-dvh pb-32">
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-3 pb-2 safe-top liquid-glass-dark border-b border-white/5">
        <Link href="/" aria-label="Back" className="h-10 w-10 grid place-items-center text-white/80">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={listen}
            aria-label="Listen to this article"
            className="h-10 w-10 rounded-full bg-brand-red grid place-items-center text-white"
          >
            <Headphones size={16} />
          </button>
          <button
            onClick={share}
            aria-label="Share"
            className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-white"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {error && <p className="px-5 mt-6 text-sm text-grade-red">{error}</p>}

      {!article ? (
        <div className="px-5 mt-6 space-y-3">
          <Skeleton className="w-full h-[260px]" rounded="2xl" />
          <Skeleton className="w-3/4 h-6" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>
      ) : (
        <article className="px-5 pt-6">
          {article.featured_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.featured_image}
              alt=""
              className="w-full rounded-2xl aspect-video object-cover"
              width={800}
              height={450}
            />
          )}
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">
            {(Array.isArray(article.category) ? article.category[0]?.name : article.category?.name) ?? 'News'}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white leading-tight">{article.title}</h1>
          <div className="mt-2 text-xs text-white/60">
            By {article.author?.display_name ?? 'Staff'} · {formatRelativeTime(article.published_at)}
          </div>

          <LiquidGlassCard className="mt-6 prose prose-invert max-w-none prose-sm">
            <div
              className="article-body"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />
          </LiquidGlassCard>
        </article>
      )}
    </main>
  );
}

export function ArticleView() {
  return (
    <Suspense fallback={<div className="p-8 text-white/60 text-sm">Loading…</div>}>
      <ArticleInner />
    </Suspense>
  );
}
