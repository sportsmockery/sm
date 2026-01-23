// app/southside-behavior/page.tsx
import { Metadata } from 'next';
import { getSouthsideBehaviorEmbeds } from '@/lib/getSouthsideBehaviorEmbeds';
import { SouthsideBehaviorClient } from './SouthsideBehaviorClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Sports Mockery | Southside Behavior',
  },
  description: 'Quick-hit TikToks from the South Side fan perspective. Catch the latest clips, reactions, and behind-the-scenes moments from White Sox fandom.',
  openGraph: {
    title: 'Southside Behavior | White Sox TikTok',
    description: 'Quick-hit TikToks from the South Side fan perspective',
    type: 'website',
  },
};

export const revalidate = 900; // 15 minutes

export default async function SouthsideBehaviorPage() {
  const { latestEmbed, previousEmbeds } = await getSouthsideBehaviorEmbeds();

  return (
    <SouthsideBehaviorClient
      latestEmbed={latestEmbed}
      previousEmbeds={previousEmbeds}
    />
  );
}
