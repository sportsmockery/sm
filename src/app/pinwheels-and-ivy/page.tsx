// app/pinwheels-and-ivy/page.tsx
import { Metadata } from 'next';
import { getPinwheelsAndIvyVideos } from '@/lib/getPinwheelsAndIvyVideos';
import { PinwheelsAndIvyClient } from './PinwheelsAndIvyClient';

export const metadata: Metadata = {
  title: 'Pinwheels & Ivy — Cubs Podcast',
  description: 'Watch the Pinwheels & Ivy podcast — in-depth Chicago Cubs analysis, trade rumors, prospect reports, and game breakdowns from the Sports Mockery network.',
  alternates: { canonical: '/pinwheels-and-ivy' },
  openGraph: {
    title: 'Pinwheels & Ivy Cubs Podcast | Sports Mockery',
    description: 'In-depth Chicago Cubs analysis, trade rumors, prospect reports, and game breakdowns.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export const revalidate = 900; // 15 minutes

export default async function PinwheelsAndIvyPage() {
  const { latestVideo, previousVideos } = await getPinwheelsAndIvyVideos();

  return (
    <PinwheelsAndIvyClient
      latestVideo={latestVideo}
      previousVideos={previousVideos}
    />
  );
}
