import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
// Without this, the CDN-served prerender lacks per-request nonces and
// strict-dynamic blocks every script — leaving the page non-interactive.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Notifications | Sports Mockery',
  robots: { index: false, follow: false },
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
