'use client'

import { useState } from 'react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: 'trophy' | 'star' | 'fire' | 'crown' | 'medal' | 'lightning' | 'heart' | 'target'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned: boolean
  earnedAt?: string
  progress?: number // 0-100 for partial progress
}

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  className?: string
}

const icons = {
  trophy: (
    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  ),
  star: (
    <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
    </svg>
  ),
  fire: (
    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  crown: (
    <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3H5v2h14v-2z" />
    </svg>
  ),
  medal: (
    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  lightning: (
    <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  heart: (
    <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  target: (
    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  ),
}

const rarityStyles = {
  common: {
    bg: 'from-zinc-500 to-zinc-600',
    border: 'border-zinc-500/50',
    glow: '',
    text: 'text-zinc-400',
  },
  rare: {
    bg: 'from-blue-500 to-blue-600',
    border: 'border-blue-500/50',
    glow: 'shadow-lg shadow-blue-500/30',
    text: 'text-blue-400',
  },
  epic: {
    bg: 'from-purple-500 to-purple-600',
    border: 'border-purple-500/50',
    glow: 'shadow-lg shadow-purple-500/30',
    text: 'text-purple-400',
  },
  legendary: {
    bg: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/50',
    glow: 'shadow-xl shadow-amber-500/40',
    text: 'text-amber-400',
  },
}

const sizeStyles = {
  sm: {
    container: 'h-10 w-10',
    icon: 'h-5 w-5',
    fontSize: 'text-xs',
  },
  md: {
    container: 'h-14 w-14',
    icon: 'h-7 w-7',
    fontSize: 'text-sm',
  },
  lg: {
    container: 'h-20 w-20',
    icon: 'h-10 w-10',
    fontSize: 'text-base',
  },
}

export default function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = false,
  className = '',
}: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const rarity = rarityStyles[achievement.rarity]
  const sizeStyle = sizeStyles[size]

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Badge */}
      <div
        className={`relative ${sizeStyle.container} rounded-full ${
          achievement.earned
            ? `bg-gradient-to-br ${rarity.bg} ${rarity.glow}`
            : 'bg-zinc-800'
        } ${rarity.border} border-2 transition-all`}
      >
        {/* Icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            achievement.earned ? 'text-white' : 'text-zinc-600'
          }`}
        >
          <div className={sizeStyle.icon}>{icons[achievement.icon]}</div>
        </div>

        {/* Progress ring (if not earned and has progress) */}
        {!achievement.earned && achievement.progress !== undefined && achievement.progress > 0 && (
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-zinc-700"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${achievement.progress * 2.83} 283`}
              className={rarity.text}
            />
          </svg>
        )}

        {/* Legendary animated glow */}
        {achievement.earned && achievement.rarity === 'legendary' && (
          <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 blur-md" />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-zinc-900 p-4 shadow-2xl">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                achievement.rarity === 'legendary'
                  ? 'bg-amber-500/20 text-amber-400'
                  : achievement.rarity === 'epic'
                  ? 'bg-purple-500/20 text-purple-400'
                  : achievement.rarity === 'rare'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-zinc-500/20 text-zinc-400'
              }`}
            >
              {achievement.rarity}
            </span>
            {achievement.earned && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Earned
              </span>
            )}
          </div>

          <h4 className="mb-1 font-bold text-white">{achievement.name}</h4>
          <p className="text-xs text-zinc-400">{achievement.description}</p>

          {showProgress && !achievement.earned && achievement.progress !== undefined && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Progress</span>
                <span className={rarity.text}>{achievement.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${rarity.bg}`}
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          )}

          {achievement.earned && achievement.earnedAt && (
            <p className="mt-2 text-[10px] text-zinc-600">Earned {achievement.earnedAt}</p>
          )}

          <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-zinc-900" />
        </div>
      )}
    </div>
  )
}

// Export a showcase component for multiple badges
export function AchievementShowcase({
  achievements,
  maxVisible = 5,
}: {
  achievements: Achievement[]
  maxVisible?: number
}) {
  const visible = achievements.slice(0, maxVisible)
  const remaining = achievements.length - maxVisible

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((achievement) => (
        <AchievementBadge key={achievement.id} achievement={achievement} size="sm" />
      ))}
      {remaining > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-800 text-xs font-bold text-zinc-400">
          +{remaining}
        </div>
      )}
    </div>
  )
}
