import type { Metadata } from 'next'
import '@/styles/home1.css'
import Home1Nav from '@/components/home1/Home1Nav'

export const metadata: Metadata = {
  title: {
    absolute: 'Sports Mockery | Spatial Interface',
  },
  description: 'Chicago sports intelligence — real-time data, AI analysis, and fan engagement.',
}

export default function Home1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h1-root">
      <Home1Nav />
      {children}
    </div>
  )
}
