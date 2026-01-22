// app/southside-behavior/page.tsx
import { getSouthsideBehaviorEmbeds } from '@/lib/getSouthsideBehaviorEmbeds';
import { SouthsideBehaviorClient } from './SouthsideBehaviorClient';

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
