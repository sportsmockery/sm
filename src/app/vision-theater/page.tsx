import { Metadata } from 'next'
import { getVisionTheaterVideos } from '@/lib/getVisionTheaterVideos'
import VisionTheaterClient from './VisionTheaterClient'

export const metadata: Metadata = {
  title: 'Vision Theater',
  description: 'Watch the latest Chicago sports videos from Bears Film Room, Pinwheels & Ivy, and Untold Chicago Stories.',
  alternates: { canonical: 'https://sportsmockery.com/vision-theater' },
  openGraph: {
    title: 'Vision Theater | Sports Mockery',
    description: 'Watch the latest Chicago sports videos from Bears Film Room, Pinwheels & Ivy, and Untold Chicago Stories.',
    images: [{ url: 'https://sportsmockery.com/og-image.png', width: 1200, height: 630 }],
  },
}

export const revalidate = 900 // 15 minutes ISR

export default async function VisionTheaterPage() {
  const data = await getVisionTheaterVideos()
  return <VisionTheaterClient data={data} />
}
