'use client'

/**
 * Root page-transition template.
 *
 * In the App Router, `template.tsx` re-mounts on every navigation (unlike
 * `layout.tsx`), giving Framer Motion a clean hook to animate route changes
 * without breaking hydration of the persistent layout above it.
 *
 * Behavior:
 *   - Desktop / mouse pointer  → no animation (instant page swap).
 *   - Touch / coarse pointer   → subtle iOS-style push/fade.
 *   - prefers-reduced-motion   → no animation.
 *   - First render             → no animation (SSR-safe; prevents flash).
 *
 * Tradeoffs (deliberate):
 *   - `mode="wait"` (not `popLayout`) — old page exits before new enters,
 *     so the transition reads as a single push instead of a stacked flash.
 *   - No direction-awareness yet (back/forward look identical). Adding
 *     iOS-style pop direction needs a popstate listener; deferred.
 *
 * Caveat: components inside this template will re-mount on every navigation.
 * That's already true of any App Router page change, so no behavioral surprise,
 * but it's worth knowing if you add page-level state that should persist.
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

const IOS_TRANSITION = {
  type: 'tween' as const,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
  duration: 0.32,
}

export default function PageTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (prefersReducedMotion) {
      setEnabled(false)
      return
    }
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [prefersReducedMotion])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={enabled ? { x: 16, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        exit={enabled ? { x: -16, opacity: 0 } : { opacity: 1 }}
        transition={IOS_TRANSITION}
        className="min-h-[100dvh] w-full"
        style={{ willChange: enabled ? 'transform, opacity' : undefined }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
