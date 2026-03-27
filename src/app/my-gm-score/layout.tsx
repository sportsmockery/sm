import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My GM Score',
  description: 'Track your GM performance across trades and mock drafts. See your scores, rankings, and history on Sports Mockery.',
  robots: { index: false, follow: false },
}

export default function MyGMScoreLayout({ children }: { children: React.ReactNode }) {
  return children
}
