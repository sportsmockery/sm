// app/bears-film-room/page.tsx
import { Metadata } from 'next';
import { getBearsFilmRoomVideos } from '@/lib/getBearsFilmRoomVideos';
import { BearsFilmRoomClient } from './BearsFilmRoomClient';

export const metadata: Metadata = {
  title: 'Bears Film Room — Video Analysis',
  description: 'Watch in-depth Chicago Bears video analysis, film breakdowns, and podcast episodes. Expert analysis of Bears plays, draft prospects, and game strategy.',
  alternates: { canonical: '/bears-film-room' },
  openGraph: {
    title: 'Bears Film Room | Sports Mockery',
    description: 'In-depth Chicago Bears video analysis, film breakdowns, and podcast episodes.',
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
