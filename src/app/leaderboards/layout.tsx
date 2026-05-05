import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fan Leaderboards',
  description: 'See who tops the Sports Mockery fan leaderboards. Compete with other Chicago sports fans.',
}

export default function LeaderboardsLayout({ children }: { children: React.ReactNode }) {
  return children
}
