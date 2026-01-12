'use client'

import { useState, useEffect } from 'react'

interface BookmarkButtonProps {
  articleId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BookmarkButton({
  articleId,
  size = 'md',
  className = '',
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('sm-bookmarks') || '[]')
    setIsBookmarked(bookmarks.includes(articleId))
  }, [articleId])

  const handleToggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('sm-bookmarks') || '[]')

    if (isBookmarked) {
      // Remove bookmark
      const updated = bookmarks.filter((id: string) => id !== articleId)
      localStorage.setItem('sm-bookmarks', JSON.stringify(updated))
      setIsBookmarked(false)
    } else {
      // Add bookmark
      bookmarks.push(articleId)
      localStorage.setItem('sm-bookmarks', JSON.stringify(bookmarks))
      setIsBookmarked(true)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <button
      onClick={handleToggleBookmark}
      className={`group flex items-center justify-center rounded-full transition-all ${
        isBookmarked
          ? 'bg-[#8B0000] text-white hover:bg-[#6d0000]'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
      } ${sizeClasses[size]} ${isAnimating ? 'scale-110' : ''} ${className}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg
        className={`${iconSizes[size]} transition-transform ${
          isAnimating ? 'scale-125' : 'group-hover:scale-110'
        }`}
        fill={isBookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
    </button>
  )
}
