import type { Metadata } from 'next'
import AboutEdgePageClient from './AboutEdgePageClient'

export const metadata: Metadata = {
  title: 'About EDGE',
  description:
    'Sports Mockery EDGE is the smarter, faster Chicago sports intelligence layer built for fans who want more than headlines.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About EDGE | Sports Mockery',
    description:
      'Sports Mockery EDGE is the smarter, faster Chicago sports intelligence layer built for fans who want more than headlines.',
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutEdgePageClient />
}
