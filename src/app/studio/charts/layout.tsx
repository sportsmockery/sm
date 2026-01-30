import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Charts',
}

export default function StudioChartsLayout({ children }: { children: React.ReactNode }) {
  return children
}
