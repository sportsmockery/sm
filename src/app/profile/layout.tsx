import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Profile | Sports Mockery',
  description: 'Manage your Sports Mockery profile',
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
