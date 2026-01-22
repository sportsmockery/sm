// app/bears-film-room/page.tsx
import { Metadata } from 'next';
import { getBearsFilmRoomVideos } from '@/lib/getBearsFilmRoomVideos';
import { BearsFilmRoomClient } from './BearsFilmRoomClient';

export const metadata: Metadata = {
  title: 'Sports Mockery | BFR',
};

export const revalidate = 900; // 15 minutes

export default async function BearsFilmRoomPage() {
  const { latestVideo, previousVideos } = await getBearsFilmRoomVideos();

  return (
    <BearsFilmRoomClient
      latestVideo={latestVideo}
      previousVideos={previousVideos}
    />
  );
}
