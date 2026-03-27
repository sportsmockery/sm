import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GM Trade Simulator',
  description: 'Build your dream Chicago Bears roster with our AI-powered trade simulator. Grade trades, analyze cap impact, and manage rosters for Bears, Bulls, Cubs, White Sox, and Blackhawks.',
  openGraph: {
    title: 'GM Trade Simulator | Sports Mockery',
    description: 'AI-powered trade simulator for all Chicago sports teams. Build trades, get instant grades, and compete with other GMs.',
    type: 'website',
  },
}

export default function GMLayout({ children }: { children: React.ReactNode }) {
  return children
}
