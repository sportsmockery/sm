'use client'

import { useState } from 'react'

interface ReactionCounts {
  fire: number
  laugh: number
  sad: number
  angry: number
}

interface ReactionButtonsProps {
  articleId: string
  initialCounts?: ReactionCounts
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const reactions = [
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'laugh', emoji: '😂', label: 'Laugh' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'angry', emoji: '😡', label: 'Angry' },
] as const

export default function ReactionButtons({
  articleId,
  initialCounts = { fire: 234, laugh: 89, sad: 12, angry: 45 },
  size = 'md',
  className = '',
}: ReactionButtonsProps) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts)
  const [userReaction, setUserReaction] = useState<keyof ReactionCounts | null>(null)
  const [animatingKey, setAnimatingKey] = useState<string | null>(null)

  const handleReaction = (key: keyof ReactionCounts) => {
    setAnimatingKey(key)
    setTimeout(() => setAnimatingKey(null), 300)

    if (userReaction === key) {
      // Remove reaction
      setCounts(prev => ({ ...prev, [key]: prev[key] - 1 }))
      setUserReaction(null)
    } else {
      // Add/change reaction
      if (userReaction) {
        setCounts(prev => ({ ...prev, [userReaction]: prev[userReaction] - 1 }))
      }
      setCounts(prev => ({ ...prev, [key]: prev[key] + 1 }))
      setUserReaction(key)
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm gap-1',
    md: 'px-3 py-1.5 text-base gap-1.5',
    lg: 'px-4 py-2 text-lg gap-2',
  }

  const emojiSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {reactions.map(({ key, emoji, label }) => {
        const isActive = userReaction === key
        const isAnimating = animatingKey === key

        return (
          <button
            key={key}
            onClick={() => handleReaction(key)}
            className={`flex items-center rounded-full transition-all ${sizeClasses[size]} ${
              isActive
                ? 'bg-[#8B0000]/10 ring-2 ring-[#8B0000]/30 dark:bg-[#8B0000]/20'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
            } ${isAnimating ? 'scale-110' : ''}`}
            aria-label={label}
          >
            <span
              className={`${emojiSizes[size]} transition-transform ${
                isAnimating ? 'scale-125' : ''
              }`}
            >
              {emoji}
            </span>
            <span
              className={`font-medium ${
                isActive
                  ? 'text-[#8B0000] dark:text-[#FF6666]'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {counts[key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
