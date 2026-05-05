import type { Metadata } from 'next'
import StudioShell from '@/components/studio/StudioShell'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
// Cascades to all /studio/* sub-routes.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Creator Studio',
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>
}
