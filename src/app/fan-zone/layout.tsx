import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fan Zone',
  description: 'Join the Chicago sports fan community. Connect with Bears, Bulls, Cubs, White Sox, and Blackhawks fans.',
}

export default function FanZoneLayout({ children }: { children: React.ReactNode }) {
  return children
}
