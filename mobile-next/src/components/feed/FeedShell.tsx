'use client';

import dynamic from 'next/dynamic';

const FeedList = dynamic(() => import('@/components/feed/FeedList').then((m) => m.FeedList), {
  ssr: false,
  loading: () => null,
});

export function FeedShell() {
  return <FeedList />;
}
