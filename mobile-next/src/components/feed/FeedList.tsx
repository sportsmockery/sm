'use client';

import { useEffect, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { api, type Post, type FeedResponse } from '@/lib/api';
import { ArticleCard } from './ArticleCard';
import { AdSlot } from '@/components/ui/AdSlot';
import { Skeleton } from '@/components/ui/Skeleton';

type Row =
  | { kind: 'feature'; post: Post }
  | { kind: 'standard'; post: Post }
  | { kind: 'ad'; format: 'banner' | 'mrec' };

function buildRows(feed: FeedResponse): Row[] {
  const rows: Row[] = [];
  if (feed.featured) rows.push({ kind: 'feature', post: feed.featured });
  rows.push({ kind: 'ad', format: 'banner' });
  feed.topHeadlines.forEach((p, i) => {
    rows.push({ kind: 'standard', post: p });
    if (i === 2) rows.push({ kind: 'ad', format: 'mrec' });
  });
  feed.latestNews.forEach((p, i) => {
    rows.push({ kind: 'standard', post: p });
    if (i > 0 && i % 5 === 0) rows.push({ kind: 'ad', format: 'banner' });
  });
  return rows;
}

export function FeedList() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getFeed()
      .then((r) => { if (!cancelled) setData(r); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => (data ? buildRows(data) : []), [data]);

  if (error) {
    return (
      <div className="px-4 py-12 text-center text-sm text-white/60">
        Couldn’t load feed. Pull to retry.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 py-4 space-y-4">
        <Skeleton className="w-full h-[260px]" rounded="2xl" />
        <Skeleton className="w-full h-[50px]" rounded="lg" />
        <Skeleton className="w-full h-[180px]" rounded="2xl" />
        <Skeleton className="w-full h-[180px]" rounded="2xl" />
      </div>
    );
  }

  return (
    <Virtuoso
      style={{ height: 'calc(100dvh - 80px)' }}
      data={rows}
      computeItemKey={(i, row) =>
        row.kind === 'ad' ? `ad-${i}` : `${row.kind}-${row.post.id}`
      }
      itemContent={(_, row) => (
        <div className="px-4 pt-4">
          {row.kind === 'feature' && <ArticleCard post={row.post} variant="feature" />}
          {row.kind === 'standard' && <ArticleCard post={row.post} variant="standard" />}
          {row.kind === 'ad' && <AdSlot format={row.format} />}
        </div>
      )}
      components={{
        Footer: () => <div className="h-32" />,
      }}
    />
  );
}
