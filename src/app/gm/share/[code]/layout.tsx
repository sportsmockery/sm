import type { Metadata } from 'next'

// Simulator output URLs are user-generated trade configurations — they
// are valid for sharing but not for indexing (thin pages, short lifespan).
// Keep noindex per the auto-SEO playbook (#43).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function GMShareLayout({ children }: { children: React.ReactNode }) {
  return children
}
