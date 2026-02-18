'use client'

import { useState, useEffect } from 'react'

interface FollowButtonProps {
  authorId: number
  authorName: string
  className?: string
}

export default function FollowButton({
  authorId,
  authorName,
  className = '',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const following = JSON.parse(localStorage.getItem('sm_following') || '[]')
    setIsFollowing(following.includes(authorId))
    setIsLoading(false)
  }, [authorId])

  const handleFollow = () => {
    const following = JSON.parse(localStorage.getItem('sm_following') || '[]')

    if (isFollowing) {
      const newFollowing = following.filter((id: number) => id !== authorId)
      localStorage.setItem('sm_following', JSON.stringify(newFollowing))
      setIsFollowing(false)
    } else {
      const newFollowing = [...following, authorId]
      localStorage.setItem('sm_following', JSON.stringify(newFollowing))
      setIsFollowing(true)
    }
  }

  if (isLoading) {
    return (
      <button
        disabled
        className={`rounded-xl border px-6 py-2.5 text-sm font-semibold ${className}`}
        style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text-dim)' }}
      >
        <span className="inline-block h-4 w-16 animate-pulse rounded" style={{ backgroundColor: 'var(--sm-surface)' }} />
      </button>
    )
  }

  return (
    <button
      onClick={handleFollow}
      className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
        isFollowing
          ? 'border border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] hover:bg-[#8B0000] hover:text-white dark:border-[#FF6666] dark:bg-[#FF6666]/10 dark:text-[#FF6666] dark:hover:bg-[#FF6666] dark:hover:text-white'
          : 'bg-[#8B0000] text-white hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]'
      } ${className}`}
      aria-label={isFollowing ? `Unfollow ${authorName}` : `Follow ${authorName}`}
    >
      {isFollowing ? (
        <>
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          Following
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
            />
          </svg>
          Follow
        </>
      )}
    </button>
  )
}
