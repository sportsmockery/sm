'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PredictionCardProps {
  id: string
  title: string
  prediction: string
  confidence: number
  outcome?: 'pending' | 'correct' | 'incorrect'
  team: string
  teamColor: string
  timestamp: string
  reasoning?: string
}

export default function PredictionCard({
  id,
  title,
  prediction,
  confidence,
  outcome = 'pending',
  team,
  teamColor,
  timestamp,
  reasoning,
}: PredictionCardProps) {
  const [showReasoning, setShowReasoning] = useState(false)

  const outcomeStyles = {
    pending: {
      badge: 'bg-yellow-500/20 text-yellow-400',
      ring: 'ring-yellow-500/30',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Pending',
    },
    correct: {
      badge: 'bg-emerald-500/20 text-emerald-400',
      ring: 'ring-emerald-500/30',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Correct',
    },
    incorrect: {
      badge: 'bg-red-500/20 text-red-400',
      ring: 'ring-red-500/30',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Incorrect',
    },
  }

  const styles = outcomeStyles[outcome]

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-zinc-900 ring-1 ${styles.ring} transition-all hover:ring-2`}>
      {/* Animated glow effect */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ background: `linear-gradient(135deg, ${teamColor}, transparent)` }}
      />

      {/* Header with team color accent */}
      <div
        className="relative h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${teamColor}, transparent)` }}
      />

      <div className="relative p-5">
        {/* Top row */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span
              className="mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${teamColor}20`, color: teamColor }}
            >
              {team}
            </span>
            <p className="text-xs text-zinc-500">{timestamp}</p>
          </div>

          {/* Outcome badge */}
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${styles.badge}`}>
            {styles.icon}
            <span className="text-xs font-semibold">{styles.label}</span>
          </div>
        </div>

        {/* SM Prophecy branding */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">SM Prophecy</span>
        </div>

        {/* Title */}
        <h3 className="mb-3 font-bold text-white">{title}</h3>

        {/* Prediction */}
        <div className="mb-4 rounded-xl bg-white/5 p-4">
          <p className="text-sm leading-relaxed text-zinc-300">{prediction}</p>
        </div>

        {/* Confidence Meter */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Confidence Level
            </span>
            <span className="text-lg font-black text-white">{confidence}%</span>
          </div>

          {/* Meter visualization */}
          <div className="relative h-3 overflow-hidden rounded-full bg-zinc-800">
            {/* Background segments */}
            <div className="absolute inset-0 flex">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-zinc-900/50 last:border-r-0" />
              ))}
            </div>

            {/* Fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
              style={{
                width: `${confidence}%`,
                background: `linear-gradient(90deg, ${teamColor}88, ${teamColor})`,
              }}
            />

            {/* Shimmer effect */}
            <div
              className="absolute inset-y-0 left-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ width: `${confidence}%` }}
            />
          </div>

          {/* Scale labels */}
          <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Reasoning toggle */}
        {reasoning && (
          <div>
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span>AI Reasoning</span>
              <svg
                className={`h-4 w-4 transition-transform ${showReasoning ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                showReasoning ? 'mt-3 max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="rounded-lg bg-zinc-800/50 p-3 text-xs leading-relaxed text-zinc-400">
                {reasoning}
              </p>
            </div>
          </div>
        )}

        {/* View details link */}
        <Link
          href={`/predictions/${id}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-semibold text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
        >
          View Full Analysis
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
