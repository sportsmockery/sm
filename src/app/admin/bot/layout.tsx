import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bot',
}

export default function BotLayout({ children }: { children: React.ReactNode }) {
  return children
}
