// app/bears-film-room/page.tsx
import { Metadata } from 'next';
import { getBearsFilmRoomVideos } from '@/lib/getBearsFilmRoomVideos';
import { BearsFilmRoomClient } from './BearsFilmRoomClient';

export const metadata: Metadata = {
  title: 'Untold Chicago Stories — Video Series',
  description: 'Untold Chicago is a long-form podcast and video series giving former Chicago athletes the space to tell their story the way it was actually lived.',
  alternates: { canonical: '/bears-film-room' },
  openGraph: {
    title: 'Untold Chicago Stories | Sports Mockery',
    description: 'Long-form podcast giving former Chicago athletes the space to tell their story the way it was actually lived.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export const dynamic = 'force-dynamic';

export default async function BearsFilmRoomPage() {
  const { latestVideo, previousVideos } = await getBearsFilmRoomVideos();

  return (
    <BearsFilmRoomClient
      latestVideo={latestVideo}
      previousVideos={previousVideos}
    />
  );
}
