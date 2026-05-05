import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
// Cascades to /subscription/success and any future subscription routes.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Subscription | Sports Mockery',
  robots: { index: false, follow: false },
}

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children
}
