import type { Metadata } from 'next'
import '@/styles/bears1.css'
import Bears1Nav from '@/components/bears1/Bears1Nav'

export const metadata: Metadata = {
  title: {
    absolute: 'Chicago Bears | Obsidian Intelligence Hub',
  },
  description: 'Chicago Bears war-room briefing — roster intelligence, rumor radar, and AI-powered analysis.',
}

export default function Bears1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="b1-root">
      <Bears1Nav />
      {children}
    </div>
  )
}
