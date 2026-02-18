'use client'

import { useState, useEffect } from 'react'
import GlassCard from '@/components/ui/GlassCard'

interface TeamSentiment {
  team: string
  sentiment: number // -100 to 100
  trend: 'up' | 'down' | 'stable'
  recentEvents: string[]
}

const sampleSentiments: TeamSentiment[] = [
  {
    team: 'Bears',
    sentiment: 72,
    trend: 'up',
    recentEvents: ['Win vs. Packers', 'Rookie QB performance'],
  },
  {
    team: 'Bulls',
    sentiment: 45,
    trend: 'stable',
    recentEvents: ['Close loss to Heat', 'LaVine injury update'],
  },
  {
    team: 'Cubs',
    sentiment: 28,
    trend: 'down',
    recentEvents: ['Trade rumors', 'Offseason concerns'],
  },
  {
    team: 'White Sox',
    sentiment: -15,
    trend: 'down',
    recentEvents: ['Rebuilding mode', 'Star player trade'],
  },
  {
    team: 'Blackhawks',
    sentiment: 55,
    trend: 'up',
    recentEvents: ['Rookie shining', 'Winning streak'],
  },
]

const getSentimentColor = (sentiment: number) => {
  if (sentiment >= 70) return { bg: 'from-emerald-500 to-emerald-400', text: 'text-emerald-500' }
  if (sentiment >= 40) return { bg: 'from-lime-500 to-lime-400', text: 'text-lime-500' }
  if (sentiment >= 10) return { bg: 'from-yellow-500 to-yellow-400', text: 'text-yellow-500' }
  if (sentiment >= -20) return { bg: 'from-orange-500 to-orange-400', text: 'text-orange-500' }
  return { bg: 'from-red-500 to-red-400', text: 'text-red-500' }
}

const getSentimentLabel = (sentiment: number) => {
  if (sentiment >= 70) return 'Ecstatic'
  if (sentiment >= 40) return 'Optimistic'
  if (sentiment >= 10) return 'Cautious'
  if (sentiment >= -20) return 'Frustrated'
  return 'Despairing'
}

interface SentimentOrbProps {
  sentiments?: TeamSentiment[]
  className?: string
}

export default function SentimentOrb({ sentiments = sampleSentiments, className = '' }: SentimentOrbProps) {
  const [activeTeam, setActiveTeam] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const currentSentiment = sentiments[activeTeam]
  const colors = getSentimentColor(currentSentiment.sentiment)

  useEffect(() => {
    // Auto-rotate through teams
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setActiveTeam((prev) => (prev + 1) % sentiments.length)
        setIsAnimating(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [sentiments.length])

  const normalizedSentiment = (currentSentiment.sentiment + 100) / 2 // Convert -100 to 100 to 0 to 100

  return (
    <section className={className}>
      <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-5 w-5"
            style={{ color: '#8B0000' }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
          <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
            Fan Sentiment
          </h3>
        </div>

        {/* Orb visualization */}
        <div className="relative mb-6 flex justify-center">
          <div
            className={`relative flex h-36 w-36 items-center justify-center rounded-full transition-all duration-500 ${isAnimating ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}
          >
            {/* Outer glow */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} blur-xl opacity-40`}
            />
            {/* Inner orb */}
            <div
              className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-full bg-gradient-to-br ${colors.bg} shadow-lg`}
            >
              {/* Sentiment score */}
              <span className="text-3xl font-black text-white">
                {currentSentiment.sentiment > 0 ? '+' : ''}{currentSentiment.sentiment}
              </span>
              <span className="text-xs font-medium text-white/80">
                {getSentimentLabel(currentSentiment.sentiment)}
              </span>
            </div>
            {/* Pulsing ring */}
            <div
              className={`absolute inset-0 animate-ping rounded-full bg-gradient-to-br ${colors.bg} opacity-20`}
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>

        {/* Team info */}
        <div className={`text-center transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <h4 className="mb-1 font-heading text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
            {currentSentiment.team}
          </h4>
          <div className="mb-3 flex items-center justify-center gap-1 text-sm">
            {currentSentiment.trend === 'up' && (
              <>
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                <span className="text-emerald-500">Trending Up</span>
              </>
            )}
            {currentSentiment.trend === 'down' && (
              <>
                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                </svg>
                <span className="text-red-500">Trending Down</span>
              </>
            )}
            {currentSentiment.trend === 'stable' && (
              <>
                <svg className="h-4 w-4" style={{ color: 'var(--sm-text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                </svg>
                <span style={{ color: 'var(--sm-text-muted)' }}>Stable</span>
              </>
            )}
          </div>

          {/* Recent events */}
          <div className="space-y-1">
            {currentSentiment.recentEvents.map((event, i) => (
              <p key={i} className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                • {event}
              </p>
            ))}
          </div>
        </div>

        {/* Team selector */}
        <div className="mt-4 flex justify-center gap-2">
          {sentiments.map((s, i) => (
            <button
              key={s.team}
              onClick={() => {
                setIsAnimating(true)
                setTimeout(() => {
                  setActiveTeam(i)
                  setIsAnimating(false)
                }, 300)
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                i === activeTeam
                  ? 'w-6'
                  : ''
              }`}
              style={{ backgroundColor: i === activeTeam ? '#8B0000' : 'var(--sm-border)' }}
              aria-label={`View ${s.team} sentiment`}
            />
          ))}
        </div>

        {/* Meter bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            <span>😤 Angry</span>
            <span>😊 Happy</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500">
            <div
              className="h-full w-1 bg-white shadow-lg transition-all duration-500"
              style={{ marginLeft: `calc(${normalizedSentiment}% - 2px)` }}
            />
          </div>
        </div>

        {/* Powered by badge */}
        <p className="mt-4 text-center text-xs" style={{ color: 'var(--sm-text-dim)' }}>
          Powered by social media analysis
        </p>
      </div>
    </section>
  )
}
