'use client'

import { useState, useEffect } from 'react'

interface ReaderModeToggleProps {
  className?: string
}

/**
 * Reader Mode toggle button
 * When active, hides sidebar and centers content for distraction-free reading
 */
export default function ReaderModeToggle({ className = '' }: ReaderModeToggleProps) {
  const [isReaderMode, setIsReaderMode] = useState(false)

  useEffect(() => {
    // Toggle reader-mode class on article wrapper
    const articleWrapper = document.querySelector('.article-wrapper')
    if (articleWrapper) {
      if (isReaderMode) {
        articleWrapper.classList.add('reader-mode')
        document.body.classList.add('reader-mode-active')
      } else {
        articleWrapper.classList.remove('reader-mode')
        document.body.classList.remove('reader-mode-active')
      }
    }

    return () => {
      // Cleanup on unmount
      articleWrapper?.classList.remove('reader-mode')
      document.body.classList.remove('reader-mode-active')
    }
  }, [isReaderMode])

  return (
    <button
      onClick={() => setIsReaderMode(!isReaderMode)}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors hover:brightness-95 dark:hover:brightness-110 ${className}`}
      style={
        isReaderMode
          ? { backgroundColor: '#bc0000', color: '#ffffff' }
          : { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }
      }
      aria-pressed={isReaderMode}
      title={isReaderMode ? 'Exit reader mode' : 'Enter reader mode'}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <span>{isReaderMode ? 'Exit Reader' : 'Reader mode'}</span>
    </button>
  )
}
