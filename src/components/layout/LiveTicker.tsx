'use client'

import { useState } from 'react'
import Link from 'next/link'
import PulsingDot from '@/components/ui/PulsingDot'

const tickerItems = [
  { text: "BREAKING: Bears sign Pro Bowl pass rusher to 3-year deal", href: "/chicago-bears/breaking-bears-sign-pass-rusher" },
  { text: "Bulls defeat Celtics 115-108 in overtime thriller", href: "/chicago-bulls/bulls-defeat-celtics-overtime" },
  { text: "Cubs announce new starting pitcher acquisition", href: "/chicago-cubs/cubs-new-pitcher-acquisition" },
  { text: "Blackhawks rookie named to All-Star roster", href: "/chicago-blackhawks/rookie-all-star" },
  { text: "White Sox trade rumors: Big names on the move", href: "/chicago-white-sox/trade-rumors-update" },
]

export default function LiveTicker() {
  const [isPaused, setIsPaused] = useState(false)

  // Double the items for seamless infinite scroll
  const items = [...tickerItems, ...tickerItems]

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-r from-[#8B0000] via-red-600 to-[#8B0000] text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Live indicator */}
      <div className="absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-[#8B0000] to-transparent pl-4 pr-8">
        <div className="flex items-center gap-2">
          <PulsingDot color="red" size="sm" />
          <span className="text-xs font-bold uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Scrolling content */}
      <div
        className={`flex whitespace-nowrap py-2 ${isPaused ? '' : 'animate-ticker'}`}
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="inline-flex items-center px-8 text-sm font-medium transition-colors hover:text-white/80"
          >
            <span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-white" />
            {item.text}
          </Link>
        ))}
      </div>

      {/* Gradient fade right */}
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#8B0000] to-transparent" />
    </div>
  )
}
