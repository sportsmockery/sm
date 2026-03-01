'use client'

import { useEffect } from 'react'

export function useCursorGlow() {
  useEffect(() => {
    // Skip on touch devices
    if (typeof window === 'undefined' || 'ontouchstart' in window) return

    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll<HTMLElement>('.glow-orb')
      if (orbs.length === 0) return

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i]
        const rect = orb.getBoundingClientRect()
        const orbCenterX = rect.left + rect.width / 2
        const orbCenterY = rect.top + rect.height / 2

        const dx = (e.clientX - orbCenterX) * 0.05
        const dy = (e.clientY - orbCenterY) * 0.05

        orb.style.transform = `translate(${dx}px, ${dy}px)`
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
}
