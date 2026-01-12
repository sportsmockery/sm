'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Prophecy {
  id: string
  text: string
  confidence: number
  team: string
  href: string
}

const sampleProphecies: Prophecy[] = [
  { id: '1', text: "Bears will clinch playoff spot this weekend", confidence: 82, team: 'bears', href: '/predictions/bears-playoffs' },
  { id: '2', text: "Bulls trade incoming before deadline", confidence: 67, team: 'bulls', href: '/predictions/bulls-trade' },
  { id: '3', text: "Cubs ace to be named All-Star starter", confidence: 75, team: 'cubs', href: '/predictions/cubs-all-star' },
  { id: '4', text: "Blackhawks rookie on pace for 30 goals", confidence: 71, team: 'blackhawks', href: '/predictions/blackhawks-rookie' },
  { id: '5', text: "White Sox rebuild ahead of schedule", confidence: 58, team: 'whitesox', href: '/predictions/whitesox-rebuild' },
]

const teamEmojis: Record<string, string> = {
  bears: '🐻',
  bulls: '🐂',
  cubs: '🧸',
  whitesox: '⚾',
  blackhawks: '🦅',
}

interface ProphecyTickerProps {
  prophecies?: Prophecy[]
  className?: string
}

export default function ProphecyTicker({ prophecies = sampleProphecies, className = '' }: ProphecyTickerProps) {
  const [isPaused, setIsPaused] = useState(false)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-emerald-400'
    if (confidence >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Oracle branding */}
      <div className="absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-zinc-950 via-zinc-950 to-transparent pl-4 pr-12">
        <div className="flex items-center gap-2">
          <span className="text-lg animate-pulse">🔮</span>
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Prophecies
          </span>
        </div>
      </div>

      {/* Prophecies ticker */}
      <div
        className={`flex items-center whitespace-nowrap py-2.5 pl-36 ${isPaused ? '' : 'animate-ticker'}`}
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        {[...prophecies, ...prophecies].map((prophecy, index) => (
          <Link
            key={`${prophecy.id}-${index}`}
            href={prophecy.href}
            className="group mx-4 flex items-center gap-3 text-sm transition-colors hover:text-white"
          >
            {/* Team emoji */}
            <span className="text-base">{teamEmojis[prophecy.team] || '🏆'}</span>

            {/* Prophecy text */}
            <span className="font-medium text-zinc-300 group-hover:text-white transition-colors">
              {prophecy.text}
            </span>

            {/* Confidence badge */}
            <span className={`flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-bold ${getConfidenceColor(prophecy.confidence)}`}>
              {prophecy.confidence}%
            </span>

            {/* Separator */}
            <span className="mx-2 h-4 w-px bg-zinc-700" />
          </Link>
        ))}
      </div>

      {/* Gradient fade right */}
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-zinc-950 to-transparent" />

      {/* Subtle glow effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-purple-500/5 to-transparent" />
    </div>
  )
}
