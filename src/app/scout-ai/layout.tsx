import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sports Mockery | Scout AI',
  description: 'Get instant answers about the Bears, Bulls, Cubs, White Sox, and Blackhawks with Scout AI - your Chicago sports assistant.',
}

export default function ScoutAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
