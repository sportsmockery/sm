'use client'

import { useState, useEffect } from 'react'

interface CarbonFootprintProps {
  className?: string
}

export default function CarbonFootprint({ className = '' }: CarbonFootprintProps) {
  const [stats, setStats] = useState({
    pagesViewed: 0,
    carbonSaved: 0,
    treesEquivalent: 0,
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Simulate tracking page views and calculating carbon
    // In a real app, this would track actual metrics
    const stored = localStorage.getItem('sm-carbon-stats')
    if (stored) {
      setStats(JSON.parse(stored))
    } else {
      // Initialize with some demo values
      const initial = {
        pagesViewed: Math.floor(Math.random() * 50) + 10,
        carbonSaved: 0,
        treesEquivalent: 0,
      }
      initial.carbonSaved = initial.pagesViewed * 0.2 // 0.2g per page vs average
      initial.treesEquivalent = initial.carbonSaved / 21000 // 21kg per tree per year
      setStats(initial)
      localStorage.setItem('sm-carbon-stats', JSON.stringify(initial))
    }
  }, [])

  // Update stats on page view
  useEffect(() => {
    const newStats = {
      pagesViewed: stats.pagesViewed + 1,
      carbonSaved: (stats.pagesViewed + 1) * 0.2,
      treesEquivalent: ((stats.pagesViewed + 1) * 0.2) / 21000,
    }

    const timer = setTimeout(() => {
      setStats(newStats)
      localStorage.setItem('sm-carbon-stats', JSON.stringify(newStats))
    }, 1000)

    return () => clearTimeout(timer)
  }, []) // Only run once on mount

  return (
    <div className={`${className}`}>
      {/* Compact view */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 transition-all hover:bg-emerald-500/20"
      >
        {/* Leaf icon */}
        <svg
          className="h-4 w-4 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>

        <span className="text-xs font-semibold text-emerald-400">
          {stats.carbonSaved.toFixed(1)}g CO₂ saved
        </span>

        {/* Expand icon */}
        <svg
          className={`h-3 w-3 text-emerald-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl bg-zinc-900 p-5 shadow-2xl">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-white">Your Carbon Impact</h4>
              <p className="text-xs text-zinc-500">Eco-optimized browsing</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-2xl font-black text-emerald-400">
                {stats.carbonSaved.toFixed(1)}g
              </div>
              <div className="text-xs text-zinc-500">CO₂ Saved</div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-2xl font-black text-white">{stats.pagesViewed}</div>
              <div className="text-xs text-zinc-500">Pages Viewed</div>
            </div>
          </div>

          {/* Progress visualization */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Progress to 1 tree</span>
              <span className="font-semibold text-emerald-400">
                {(stats.treesEquivalent * 100).toFixed(4)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all duration-500"
                style={{ width: `${Math.min(stats.treesEquivalent * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-600">
              One tree absorbs ~21kg CO₂/year
            </p>
          </div>

          {/* How we save carbon */}
          <div className="space-y-2 rounded-xl bg-emerald-500/10 p-3">
            <h5 className="text-xs font-semibold text-emerald-400">How we&apos;re eco-friendly:</h5>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Optimized images & lazy loading
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Green hosting infrastructure
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Efficient code & caching
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Dark mode reduces screen energy
              </li>
            </ul>
          </div>

          {/* Close hint */}
          <p className="mt-3 text-center text-[10px] text-zinc-600">
            Click outside to close
          </p>
        </div>
      )}
    </div>
  )
}
