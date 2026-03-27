import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chicago Sports Data & Analytics',
  description: 'Comprehensive stats, analytics, and data visualizations for Chicago Bears, Bulls, Cubs, White Sox, and Blackhawks. Team records, player stats, and historical data.',
  openGraph: {
    title: 'Chicago Sports Data & Analytics | Sports Mockery',
    description: 'Deep-dive into Chicago sports data. Stats, analytics, and visualizations for all five major Chicago teams.',
    type: 'website',
  },
}

export default function DataLayout({ children }: { children: React.ReactNode }) {
  return children
}
