// app/pinwheelsandivy/page.tsx
import { Metadata } from 'next';
import { getPinwheelsAndIvyVideos } from '@/lib/getPinwheelsAndIvyVideos';
import { PinwheelsAndIvyClient } from './PinwheelsAndIvyClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Sports Mockery | P & I',
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
