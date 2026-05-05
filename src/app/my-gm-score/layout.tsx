import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My GM Score',
  description: 'Track your GM performance across trades and mock drafts. See your scores, rankings, and history on Sports Mockery.',
  robots: { index: false, follow: false },
}

export default function MyGMScoreLayout({ children }: { children: React.ReactNode }) {
  return children
}
