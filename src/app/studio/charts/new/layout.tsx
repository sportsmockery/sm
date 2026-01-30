import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Chart',
}

export default function NewChartLayout({ children }: { children: React.ReactNode }) {
  return children
}
