'use client'

import { useState } from 'react'
import type { HomepageData, TodaysPoll } from '../types'
import { TodayDebate } from './TodayDebate'

interface FanInteractionProps {
  fanZone: HomepageData['fan_zone']
}

export function FanInteraction({ fanZone }: FanInteractionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Ask Scout Mini */}
      <AskScoutMini suggestions={fanZone.scout_suggestions} />

      {/* Play GM CTA */}
      <div className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-5 flex flex-col justify-between">
        <div>
          <span className="text-[13px] text-gray-500 dark:text-[#888888] uppercase tracking-wider">Trade Simulator</span>
          <h3 className="mt-2 text-lg font-bold text-[#0B0F14] dark:text-[#FAFAFB]">Play GM</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-[#888888]">Build trades, get AI grades, simulate seasons.</p>
        </div>
        <a
          href="/gm"
          className="mt-4 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#D6B05E' }}
        >
          Start Trading
        </a>
      </div>

      {/* Today's Poll */}
      {fanZone.todays_poll ? (
        <TodayDebate debate={{ ...fanZone.todays_poll, vote_counts: {}, total_votes: 0 }} />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-5 flex items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-[#888888]">Poll coming soon</span>
        </div>
      )}
    </div>
  )
}

function AskScoutMini({ suggestions }: { suggestions: string[] }) {
  const [query, setQuery] = useState(suggestions[0] || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/ask-ai?q=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-5">
      <div className="flex items-center gap-2 mb-3">
        <img src="/downloads/scout-v2.png" alt="Scout" className="w-6 h-6 rounded-full" />
        <span className="text-sm font-medium text-[#0B0F14] dark:text-[#FAFAFB]">Ask Scout anything about Chicago sports</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#0B0F14] dark:text-[#FAFAFB] placeholder-gray-400 outline-none focus:border-[#00D4FF]"
          placeholder="Ask about any Chicago team..."
        />
      </form>
      {suggestions.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.slice(1, 3).map((s, i) => (
            <button
              key={i}
              onClick={() => setQuery(s)}
              className="text-[13px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-[#888888] hover:text-[#00D4FF] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
