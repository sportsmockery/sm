import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polls',
}

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return children
}
