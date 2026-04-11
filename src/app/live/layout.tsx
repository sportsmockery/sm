import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Games',
  description: 'Live scores, stats, and play-by-play for Chicago Bears, Bulls, Cubs, White Sox, and Blackhawks games.',
  openGraph: {
    title: 'Live Games | Sports Mockery',
    description: 'Real-time scores and stats for all Chicago sports teams.',
    type: 'website',
  },
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children
}
