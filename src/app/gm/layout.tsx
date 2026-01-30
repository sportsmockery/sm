import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sports Mockery | Trade Simulator',
  description: 'Build and grade trades for Chicago sports teams. AI-powered trade analysis for Bears, Bulls, Blackhawks, Cubs, and White Sox.',
}

export default function GMLayout({ children }: { children: React.ReactNode }) {
  return children
}
