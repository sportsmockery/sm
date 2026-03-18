import { Metadata } from 'next'
import { getVisionTheaterVideos } from '@/lib/getVisionTheaterVideos'
import VisionTheaterClient from './VisionTheaterClient'

export const metadata: Metadata = {
  title: 'Vision Theater',
  description:
    'Watch the latest Chicago sports videos from Pinwheels & Ivy and @untoldchicago.',
  openGraph: {
    title: 'Vision Theater | Sports Mockery',
    description: 'Your Chicago sports video hub.',
  },
}

export const revalidate = 900 // 15 minutes ISR

export default async function VisionTheaterPage() {
  const data = await getVisionTheaterVideos()
  return <VisionTheaterClient data={data} />
}
