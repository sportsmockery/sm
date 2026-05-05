import type { Metadata } from 'next'

// Force dynamic rendering so the per-request CSP nonce reaches inline scripts.
// Cascades to /gm, /gm/analytics, /gm/share/[code]. Replaces page-level
// force-dynamic on /gm/page.tsx (kept for redundancy, harmless).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'GM Trade Simulator',
  description: 'Build trades with our AI-powered trade simulator. Grade deals, analyze salary cap impact, and manage rosters for Bears, Bulls, Cubs, White Sox, and Blackhawks.',
  alternates: { canonical: '/gm' },
  openGraph: {
    title: 'GM Trade Simulator | Sports Mockery',
    description: 'AI-powered trade simulator for all Chicago sports teams. Build trades, get instant grades, and compete with other GMs.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function GMLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">GM Trade Simulator</h1>
      {children}
    </>
  )
}
