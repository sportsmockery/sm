import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sports Mockery | Media Library',
}

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return children
}
