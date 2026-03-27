import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mock Draft Simulator',
  description: 'Run mock drafts for the NFL, NBA, MLB, and NHL. AI-powered draft grades and trade analysis for all Chicago sports teams.',
  openGraph: {
    title: 'Mock Draft Simulator | Sports Mockery',
    description: 'Build trades and run mock drafts across 4 leagues. AI grades every move. 124 teams, infinite possibilities.',
    type: 'website',
  },
}

export default function SimulatorsLayout({ children }: { children: React.ReactNode }) {
  return children
}
