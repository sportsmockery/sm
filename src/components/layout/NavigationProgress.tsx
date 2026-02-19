'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      // Navigation completed — show the bar then fade out
      setIsNavigating(true)
      setIsComplete(true)
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setIsComplete(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  if (!isNavigating) return null

  return (
    <div
      className={`nav-progress-bar${isComplete ? ' complete' : ''}`}
      role="progressbar"
      aria-label="Page loading"
    />
  )
}
