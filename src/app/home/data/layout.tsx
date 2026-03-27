import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chicago Sports Data & Analytics',
  description: 'Dive deep into Chicago sports data and analytics. Advanced stats, visualizations, and AI-powered insights for Bears, Bulls, Cubs, White Sox, and Blackhawks.',
  alternates: { canonical: '/home/data' },
  openGraph: {
    title: 'Chicago Sports Data & Analytics | Sports Mockery',
    description: 'Deep-dive into Chicago sports data. Stats, analytics, and visualizations for all five major Chicago teams.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function DataLayout({ children }: { children: React.ReactNode }) {
  return children
}
