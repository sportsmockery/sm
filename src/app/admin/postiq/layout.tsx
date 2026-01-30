import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PostIQ',
}

export default function PostIQLayout({ children }: { children: React.ReactNode }) {
  return children
}
