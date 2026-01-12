'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface TickerItem {
  id: string
  text: string
  href?: string
  isBreaking?: boolean
}

interface LiveTickerProps {
  items?: TickerItem[]
}

const defaultItems: TickerItem[] = [
  { id: '1', text: 'Bears sign new offensive coordinator', href: '/chicago-bears', isBreaking: true },
  { id: '2', text: 'Bulls trade rumors heating up ahead of deadline', href: '/chicago-bulls' },
  { id: '3', text: 'Cubs spring training roster announced', href: '/chicago-cubs' },
  { id: '4', text: 'White Sox make key bullpen addition', href: '/chicago-white-sox' },
  { id: '5', text: 'Blackhawks prospect called up from AHL', href: '/chicago-blackhawks' },
]

export default function LiveTicker({ items = defaultItems }: LiveTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    let animationId: number
    let scrollPosition = 0

    const animate = () => {
      scrollPosition += 0.5
      if (scrollPosition >= scrollElement.scrollWidth / 2) {
        scrollPosition = 0
      }
      scrollElement.style.transform = `translateX(-${scrollPosition}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [])

  const tickerContent = (
    <>
      {items.map((item) => (
        <div key={item.id} className="flex shrink-0 items-center gap-4 px-6">
          {item.isBreaking && (
            <span className="flex items-center gap-1.5 rounded bg-white/20 px-2 py-0.5 text-xs font-bold uppercase">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Breaking
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="whitespace-nowrap text-sm font-medium hover:underline"
            >
              {item.text}
            </Link>
          ) : (
            <span className="whitespace-nowrap text-sm font-medium">{item.text}</span>
          )}
          <span className="text-white/50">•</span>
        </div>
      ))}
    </>
  )

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-red-700 to-transparent" />
      <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-red-700 to-transparent" />

      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2 bg-red-700 pr-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider">Live</span>
      </div>

      {/* Scrolling content */}
      <div className="py-2.5 pl-24">
        <div ref={scrollRef} className="flex">
          {tickerContent}
          {tickerContent}
        </div>
      </div>
    </div>
  )
}
