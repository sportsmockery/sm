import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GM Trade Simulator',
  description: 'AI-powered trade simulator for all Chicago sports teams. Build trades, get instant grades, and compete with other GMs.',
  alternates: { canonical: 'https://sportsmockery.com/gm' },
  openGraph: {
    title: 'GM Trade Simulator | Sports Mockery',
    description: 'AI-powered trade simulator for all Chicago sports teams. Build trades, get instant grades, and compete with other GMs.',
    type: 'website',
    images: [{ url: 'https://sportsmockery.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GM Trade Simulator | Sports Mockery',
    description: 'AI-powered trade simulator for all Chicago sports teams. Build trades, get instant grades, and compete with other GMs.',
    images: ['https://sportsmockery.com/og-image.png'],
  },
}

export default function GMLayout({ children }: { children: React.ReactNode }) {
  return children
}
