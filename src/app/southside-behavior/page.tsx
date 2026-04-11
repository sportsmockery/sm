// app/southside-behavior/page.tsx
import { Metadata } from 'next';
import { getSouthsideBehaviorEmbeds } from '@/lib/getSouthsideBehaviorEmbeds';
import { SouthsideBehaviorClient } from './SouthsideBehaviorClient';

export const metadata: Metadata = {
  title: 'Southside Behavior — White Sox Clips',
  description: 'Quick-hit TikToks from the South Side fan perspective. Catch the latest clips, reactions, and behind-the-scenes moments from Chicago White Sox fandom.',
  alternates: { canonical: '/southside-behavior' },
  openGraph: {
    title: 'Southside Behavior | Sports Mockery',
    description: 'Quick-hit TikToks and clips from the South Side fan perspective. White Sox reactions and behind-the-scenes moments.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

// Force dynamic to avoid build-time TikTok oEmbed failures
export const dynamic = 'force-dynamic'

export default async function SouthsideBehaviorPage() {
  const { latestEmbed, previousEmbeds } = await getSouthsideBehaviorEmbeds();

  return (
    <SouthsideBehaviorClient
      latestEmbed={latestEmbed}
      previousEmbeds={previousEmbeds}
    />
  );
}
