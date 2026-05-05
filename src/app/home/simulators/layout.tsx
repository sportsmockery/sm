import type { Metadata } from 'next'

// Force dynamic rendering so each request gets a fresh CSP nonce stamped on
// <link>/<script> tags. Without this, the Vercel CDN serves cached HTML with
// stale nonces that the new response-header CSP rejects, breaking hydration
// and theming. See PR description for full diagnosis.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mock Draft & Trade Simulators',
  description: 'Run mock drafts and build trades for the NFL, NBA, MLB, and NHL. AI-powered draft grades and trade analysis for all Chicago sports teams and beyond.',
  alternates: { canonical: '/home/simulators' },
  openGraph: {
    title: 'Mock Draft & Trade Simulators | Sports Mockery',
    description: 'Build trades and run mock drafts across 4 leagues. AI grades every move. 124 teams, infinite possibilities.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function SimulatorsLayout({ children }: { children: React.ReactNode }) {
  return children
}
