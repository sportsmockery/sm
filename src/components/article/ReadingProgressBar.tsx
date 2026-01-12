'use client'

import { useState, useEffect } from 'react'

interface ReadingProgressBarProps {
  className?: string
}

export default function ReadingProgressBar({
  className = '',
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return (
    <div
      className={`fixed left-0 top-16 z-40 h-1 w-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-[#8B0000] via-[#FF0000] to-[#FF6666] transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Glow effect at the progress tip */}
      <div
        className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent to-[#FF6666]/50 blur-sm transition-all duration-150 ease-out"
        style={{ left: `calc(${progress}% - 2rem)` }}
      />
    </div>
  )
}
