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
            className={`flex items-center rounded-full transition-all ${sizeClasses[size]} ${isAnimating ? 'scale-110' : ''}`}
            style={
              isActive
                ? { backgroundColor: 'color-mix(in srgb, var(--sm-accent) 10%, transparent)', boxShadow: '0 0 0 2px color-mix(in srgb, var(--sm-accent) 30%, transparent)' }
                : { backgroundColor: 'var(--sm-surface)' }
            }
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
              className="font-medium"
              style={{ color: isActive ? 'var(--sm-accent)' : 'var(--sm-text-muted)' }}
            >
              {counts[key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
