'use client'

import { ReactNode } from 'react'
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useTeamTheme } from '@/hooks/useTeamTheme'
import { useCursorGlow } from '@/hooks/useCursorGlow'

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
 * - Dynamic team theming (CSS variable injection)
 * - Cursor-tracked glow orb effect
 *
 * Usage: Wrap in layout.tsx around the main content area
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname()
  useTeamTheme()
  useCursorGlow()

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
        <div key={pathname} className="page-transition-in">
          {children}
        </div>
      </AnimatePresence>
    </LazyMotion>
  )
}
