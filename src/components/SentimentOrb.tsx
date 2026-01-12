'use client'

import { useEffect, useState } from 'react'

interface SentimentData {
  team: string
  percentage: number
  sentiment: 'optimistic' | 'pessimistic' | 'neutral'
  color: string
}

interface SentimentOrbProps {
  data?: SentimentData
}

const defaultData: SentimentData = {
  team: 'Bears',
  percentage: 72,
  sentiment: 'optimistic',
  color: '#C83200',
}

export default function SentimentOrb({ data = defaultData }: SentimentOrbProps) {
  const [mounted, setMounted] = useState(false)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setAnimatedPercentage(data.percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [data.percentage])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  const sentimentColor = data.sentiment === 'optimistic'
    ? 'from-green-400 to-emerald-500'
    : data.sentiment === 'pessimistic'
    ? 'from-red-400 to-rose-500'
    : 'from-yellow-400 to-amber-500'

  const sentimentText = data.sentiment === 'optimistic'
    ? 'optimistic'
    : data.sentiment === 'pessimistic'
    ? 'pessimistic'
    : 'neutral'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-900/70">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-20 animate-[spin_10s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg, ${data.color}, transparent, ${data.color})`,
        }}
      />

      {/* Content */}
      <div className="relative">
        <h3 className="mb-4 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Fan Sentiment
        </h3>

        {/* Orb container */}
        <div className="mx-auto flex h-36 w-36 items-center justify-center">
          {/* SVG Circle */}
          <svg className="absolute h-36 w-36 -rotate-90 transform">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-zinc-200 dark:text-zinc-700"
            />
            {/* Progress circle */}
            <circle
              cx="72"
              cy="72"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: mounted ? strokeDashoffset : circumference,
                transition: 'stroke-dashoffset 1.5s ease-out',
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={data.color} />
                <stop offset="100%" stopColor={data.color} stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="relative z-10 text-center">
            <span
              className="text-3xl font-bold"
              style={{ color: data.color }}
            >
              {mounted ? animatedPercentage : 0}%
            </span>
          </div>
        </div>

        {/* Label */}
        <p className="mt-4 text-center">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {data.team} fans
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">
            {' '}are{' '}
          </span>
          <span className={`font-semibold bg-gradient-to-r ${sentimentColor} bg-clip-text text-transparent`}>
            {sentimentText}
          </span>
        </p>

        {/* Mini stats */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Trending up
          </span>
          <span>Updated 2h ago</span>
        </div>
      </div>
    </div>
  )
}
