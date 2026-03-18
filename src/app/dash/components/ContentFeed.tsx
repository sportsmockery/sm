'use client'

import type { FeedItem } from '../types'
import { TeamLogo } from '../shared/TeamLogo'

export function ContentFeed({ items }: { items: FeedItem[] }) {
  if (!items || items.length === 0) return null

  // Filter to articles only for the main feed — data_card and nextgen
  // are visual noise in the City Pulse context. Show them as compact mentions.
  const articles = items.filter(i => i.type === 'article') as Extract<FeedItem, { type: 'article' }>[]
  const dataCards = items.filter(i => i.type === 'data_card') as Extract<FeedItem, { type: 'data_card' }>[]

  return (
    <div className="space-y-4">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">Latest</h2>

      {/* Articles — clean text-only cards */}
      <div className="space-y-2">
        {articles.map((item, i) => (
          <a key={i} href={item.url} className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-3.5 hover:border-gray-300 dark:hover:border-[#333333] transition-colors">
            <TeamLogo teamKey={item.team} size={20} className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-1.5 py-px rounded text-[10px] font-medium uppercase bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-[#888888]">
                  {item.topic}
                </span>
                <span className="text-[12px] text-gray-400 dark:text-[#666666] ml-auto flex-shrink-0">{formatTs(item.ts)}</span>
              </div>
              <h3 className="text-[14px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] leading-snug line-clamp-2">{item.title}</h3>
              <p className="text-[12px] text-gray-500 dark:text-[#888888] line-clamp-1 mt-0.5">{item.summary}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Data cards — compact horizontal strip, not full images */}
      {dataCards.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">Data Cards</span>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {dataCards.slice(0, 6).map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] overflow-hidden">
                <div className="relative h-[120px]">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="px-2.5 py-2 flex items-center gap-1.5">
                  <TeamLogo teamKey={item.team_key} size={16} />
                  <span className="text-[12px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] line-clamp-1">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTs(ts: string): string {
  try {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin}m`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}
