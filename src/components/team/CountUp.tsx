'use client'

import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

export function useCountUp(target: number, duration = 1000, delay = 0): number {
  const prefersReducedMotion = useReducedMotion()
  const [value, setValue] = useState(prefersReducedMotion ? target : 0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (prefersReducedMotion || target === 0) {
      setValue(target)
      return
    }

    const timeout = setTimeout(() => {
      startTimeRef.current = performance.now()

      const animate = (now: number) => {
        const elapsed = now - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutQuart(progress)
        setValue(Math.round(easedProgress * target))

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay, prefersReducedMotion])

  return value
}

export default function CountUpValue({
  value,
  duration = 1000,
  delay = 0,
}: {
  value: number
  duration?: number
  delay?: number
}) {
  const display = useCountUp(value, duration, delay)
  return <>{display}</>
}
