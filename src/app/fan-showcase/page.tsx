import type { Metadata } from 'next'
import ShowcasePageClient from '@/components/fan-showcase/ShowcasePageClient'

export const metadata: Metadata = {
  title: 'Fan Showcase | Chicago Sports Creators',
  description:
    'The best fan-created content from Bears, Bulls, Cubs, White Sox, and Blackhawks creators. Edits, art, takes, and fantasy wins — by Chicago fans, for Chicago fans.',
  openGraph: {
    title: 'Fan Showcase | Sports Mockery',
    description:
      'Chicago fans are built different. See the best fan edits, art, takes, and fantasy wins from independent creators.',
    type: 'website',
  },
}

export default function FanShowcasePage() {
  return (
    <main className="mx-auto max-w-[1300px] px-4 pb-16 pt-8 md:px-6">
      <ShowcasePageClient />
    </main>
  )
}
