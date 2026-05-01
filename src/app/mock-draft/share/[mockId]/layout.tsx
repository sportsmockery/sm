import type { Metadata } from 'next'

// Simulator output — user-generated mock-draft results. Shareable but not
// indexable per the auto-SEO playbook (#43).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MockDraftShareLayout({ children }: { children: React.ReactNode }) {
  return children
}
