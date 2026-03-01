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
      id="article-progress"
      className={`fixed left-0 right-0 z-[1001] h-[2px] bg-transparent ${className}`}
      style={{ top: 0 }}
    >
      <div
        className="h-full transition-all duration-100 ease-out"
        style={{ width: `${progress}%`, backgroundImage: 'var(--sm-gradient)' }}
      />
    </div>
  )
}
