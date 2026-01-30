import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sports Mockery | Mock Draft',
  description: 'Run mock drafts for your favorite Chicago teams. Take control of the Bears, Bulls, Blackhawks, Cubs, or White Sox draft picks.',
}

export default function MockDraftLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
