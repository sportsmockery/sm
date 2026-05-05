import type { Metadata } from 'next'
import AdminShell from '@/components/admin/AdminShell'

// Force dynamic rendering so every /admin/* request gets a fresh CSP nonce
// stamped on its <link>/<script> tags. Without this, the build-time nonce
// baked into prerendered HTML doesn't match the per-request CSP header and
// strict-dynamic blocks every script — leaving /admin black for signed-in
// users. Pairs with the middleware nonce-forwarding fix in ef54686a.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
