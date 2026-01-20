'use client'

import { ReactNode } from 'react'
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface MotionProviderProps {
  children: ReactNode
}

/**
 * MotionProvider
 *
 * Wraps the application to enable:
 * - AnimatePresence for page transitions
 * - LazyMotion with domAnimation for reduced bundle size
 * - Automatic key-based exit animations on route changes
 *
 * Usage: Wrap in layout.tsx around the main content area
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname()

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          // Scroll to top after page transition
          if (typeof window !== 'undefined') {
            window.scrollTo(0, 0)
          }
        }}
      >
        <div key={pathname}>
          {children}
        </div>
      </AnimatePresence>
    </LazyMotion>
  )
}
