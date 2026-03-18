'use client'

import { useState, useEffect, useCallback } from 'react'
import ShowcaseCard from './ShowcaseCard'
import type { FanSubmission, FanSubmissionAsset, FanCreator } from '@/types/fan-showcase'

type FeaturedSubmission = FanSubmission & {
  creator: FanCreator
  assets: FanSubmissionAsset[]
}

interface HeroCarouselProps {
  items: FeaturedSubmission[]
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent(i => (i + 1) % items.length)
  }, [items.length])

  const prev = useCallback(() => {
    setCurrent(i => (i - 1 + items.length) % items.length)
  }, [items.length])

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, items.length])

  if (items.length === 0) return null

  return (
    <div className="relative">
      {/* Main slide */}
      <div className="overflow-hidden rounded-[14px]">
        <ShowcaseCard submission={items[current]} variant="hero" />
      </div>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? 'w-6 bg-[#BC0000]'
                  : 'w-2 bg-[var(--border-default)] hover:bg-[var(--border-strong)]'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
