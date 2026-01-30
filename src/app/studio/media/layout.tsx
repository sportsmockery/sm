import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Media',
}

export default function StudioMediaLayout({ children }: { children: React.ReactNode }) {
  return children
}
