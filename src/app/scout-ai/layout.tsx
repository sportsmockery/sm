import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scout AI',
  description: 'Get instant answers about the Bears, Bulls, Cubs, White Sox, and Blackhawks with Scout AI - your Chicago sports assistant.',
  alternates: { canonical: 'https://sportsmockery.com/scout-ai' },
  openGraph: {
    title: 'Scout AI | Sports Mockery',
    description: 'Get instant answers about the Bears, Bulls, Cubs, White Sox, and Blackhawks with Scout AI - your Chicago sports assistant.',
    images: [{ url: 'https://sportsmockery.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scout AI | Sports Mockery',
    description: 'Get instant answers about Chicago sports with Scout AI.',
    images: ['https://sportsmockery.com/og-image.png'],
  },
}

export default function ScoutAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
