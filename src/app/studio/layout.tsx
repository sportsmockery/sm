import type { Metadata } from 'next'
import StudioShell from '@/components/studio/StudioShell'

export const metadata: Metadata = {
  title: 'Creator Studio',
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>
}
