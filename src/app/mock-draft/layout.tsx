import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mock Draft',
  description: 'Run mock drafts for your favorite Chicago teams. Take control of the Bears, Bulls, Blackhawks, Cubs, or White Sox draft picks.',
  alternates: { canonical: 'https://sportsmockery.com/mock-draft' },
  openGraph: {
    title: 'Mock Draft | Sports Mockery',
    description: 'Run mock drafts for your favorite Chicago teams. Take control of the Bears, Bulls, Blackhawks, Cubs, or White Sox draft picks.',
    images: [{ url: 'https://sportsmockery.com/og-image.png', width: 1200, height: 630 }],
  },
}

export default function MockDraftLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
