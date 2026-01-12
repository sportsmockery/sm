'use client'

import { useState } from 'react'

interface RegionSentiment {
  id: string
  name: string
  sentiment: number // -100 to 100
  fanCount: number
  topTeam: string
}

interface GlobalSentimentProps {
  regions?: RegionSentiment[]
}

const defaultRegions: RegionSentiment[] = [
  { id: 'na-midwest', name: 'Midwest', sentiment: 72, fanCount: 45000, topTeam: 'Bears' },
  { id: 'na-west', name: 'West Coast', sentiment: 45, fanCount: 12000, topTeam: 'Bulls' },
  { id: 'na-east', name: 'East Coast', sentiment: 38, fanCount: 8500, topTeam: 'Cubs' },
  { id: 'na-south', name: 'South', sentiment: 25, fanCount: 6200, topTeam: 'Bears' },
  { id: 'europe', name: 'Europe', sentiment: 65, fanCount: 15000, topTeam: 'Bulls' },
  { id: 'asia', name: 'Asia', sentiment: 58, fanCount: 22000, topTeam: 'Bulls' },
]

export default function GlobalSentiment({ regions = defaultRegions }: GlobalSentimentProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>('all')

  const teams = ['all', 'Bears', 'Bulls', 'Cubs', 'White Sox', 'Blackhawks']

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return { bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/50' }
    if (sentiment >= 30) return { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/50' }
    return { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' }
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 60) return 'Optimistic'
    if (sentiment >= 30) return 'Neutral'
    return 'Pessimistic'
  }

  const totalFans = regions.reduce((acc, r) => acc + r.fanCount, 0)
  const avgSentiment = Math.round(
    regions.reduce((acc, r) => acc + r.sentiment * r.fanCount, 0) / totalFans
  )

  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/30 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Global Fan Sentiment</h3>
            <p className="text-xs text-zinc-500">Live fan mood worldwide</p>
          </div>
        </div>
      </div>

      {/* Team Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {teams.map((team) => (
          <button
            key={team}
            onClick={() => setSelectedTeam(team)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              selectedTeam === team
                ? 'bg-teal-500 text-white'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {team === 'all' ? 'All Teams' : team}
          </button>
        ))}
      </div>

      {/* World Map Visualization (Simplified) */}
      <div className="mb-6 rounded-xl bg-zinc-800/50 p-4">
        <div className="relative aspect-[2/1] w-full">
          {/* Simplified world map dots */}
          <div className="absolute inset-0">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* Region dots */}
            {regions.map((region) => {
              const colors = getSentimentColor(region.sentiment)
              const positions: Record<string, { left: string; top: string }> = {
                'na-midwest': { left: '22%', top: '35%' },
                'na-west': { left: '12%', top: '40%' },
                'na-east': { left: '28%', top: '38%' },
                'na-south': { left: '23%', top: '50%' },
                'europe': { left: '48%', top: '30%' },
                'asia': { left: '75%', top: '40%' },
              }

              const pos = positions[region.id] || { left: '50%', top: '50%' }

              return (
                <div
                  key={region.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: pos.left, top: pos.top }}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {/* Pulse effect */}
                  <div className={`absolute inset-0 -m-2 animate-ping rounded-full ${colors.bg} opacity-30`} />

                  {/* Main dot */}
                  <div className={`relative h-4 w-4 rounded-full ${colors.bg} shadow-lg ${colors.glow}`} />

                  {/* Tooltip */}
                  {hoveredRegion === region.id && (
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 shadow-xl">
                      <p className="font-bold text-white">{region.name}</p>
                      <p className={`text-sm ${colors.text}`}>
                        {region.sentiment}% {getSentimentLabel(region.sentiment)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {region.fanCount.toLocaleString()} fans • Top: {region.topTeam}
                      </p>
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-zinc-900" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <div className="text-2xl font-black text-white">{totalFans.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">Global Fans</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <div className={`text-2xl font-black ${getSentimentColor(avgSentiment).text}`}>
            {avgSentiment}%
          </div>
          <div className="text-xs text-zinc-500">Avg Sentiment</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <div className="text-2xl font-black text-white">{regions.length}</div>
          <div className="text-xs text-zinc-500">Regions</div>
        </div>
      </div>

      {/* Region List */}
      <div className="space-y-2">
        {regions.map((region) => {
          const colors = getSentimentColor(region.sentiment)

          return (
            <div
              key={region.id}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${colors.bg}`} />
                <span className="text-sm font-medium text-white">{region.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {region.fanCount.toLocaleString()} fans
                </span>
                <span className={`text-sm font-bold ${colors.text}`}>
                  {region.sentiment}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 rounded-lg bg-teal-500/10 p-3">
        <p className="text-center text-xs text-teal-300/70">
          Sentiment data updated in real-time based on social engagement
        </p>
      </div>
    </div>
  )
}
