import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authors',
}

export default function AuthorsLayout({ children }: { children: React.ReactNode }) {
  return children
}
