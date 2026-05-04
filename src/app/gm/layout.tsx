import type { Metadata } from 'next'

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
