// app/untold-chicago-stories/page.tsx
import { Metadata } from 'next';
import { getUntoldChicagoVideos } from '@/lib/getUntoldChicagoVideos';
import { UntoldChicagoClient } from './UntoldChicagoClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Sports Mockery | Untold Chicago Stories',
  },
  description: 'Untold Chicago is a long-form podcast and video series giving former Chicago athletes the space to tell their story the way it was actually lived.',
};

export const revalidate = 900; // 15 minutes

export default async function UntoldChicagoStoriesPage() {
  const { latestVideo, previousVideos } = await getUntoldChicagoVideos();

  return (
    <UntoldChicagoClient
      latestVideo={latestVideo}
      previousVideos={previousVideos}
    />
  );
}
