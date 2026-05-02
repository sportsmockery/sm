'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, type Post } from '@/lib/api';
import { ArticleCard } from '@/components/feed/ArticleCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { TEAMS, type TeamId } from '@/lib/config';

export function TeamView() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const team = TEAMS[slug as TeamId];

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    api
      .getTeamArticles(slug, { limit: 30 })
      .then((r) => { if (!cancelled) setPosts(r.posts); })
      .catch(() => { if (!cancelled) setPosts([]); });
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">Team</p>
        <h1 className="text-display font-bold text-white">{team?.name ?? slug}</h1>
      </header>

      {!posts ? (
        <div className="space-y-4">
          <Skeleton className="w-full h-[180px]" rounded="2xl" />
          <Skeleton className="w-full h-[180px]" rounded="2xl" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-white/60">Nothing yet for {team?.shortName ?? slug}.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => <ArticleCard key={p.id} post={p} />)}
        </div>
      )}
    </main>
  );
}
