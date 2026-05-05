import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
// Cascades to /live and /live/[sport]/[gameId]. Live game pages also benefit
// from skipping CDN HTML cache since scores update every 10s anyway.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Live Games',
  description: 'Live scores and updates for the Bears, Bulls, Cubs, White Sox, and Blackhawks.',
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children
}
