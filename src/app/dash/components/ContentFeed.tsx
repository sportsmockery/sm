'use client'

import type { FeedItem } from '../types'
import { TeamLogo } from '../shared/TeamLogo'

export function ContentFeed({ items }: { items: FeedItem[] }) {
  if (!items || items.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#0B0F14] dark:text-[#FAFAFB]">Latest</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <FeedCard key={i} item={item} />
        ))}
      </div>
    </div>
  )
}

function FeedCard({ item }: { item: FeedItem }) {
  switch (item.type) {
    case 'article':
      return (
        <a href={item.url} className="block rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-4 hover:border-gray-300 dark:hover:border-[#333333] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <TeamLogo teamKey={item.team} size={20} />
            <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-[#888888]">
              {item.topic}
            </span>
            <span className="text-[13px] text-gray-400 dark:text-[#666666] ml-auto">{formatTs(item.ts)}</span>
          </div>
          <h3 className="text-base font-medium text-[#0B0F14] dark:text-[#FAFAFB] mb-1">{item.title}</h3>
          <p className="text-sm text-gray-600 dark:text-[#888888] line-clamp-2">{item.summary}</p>
        </a>
      )

    case 'data_card':
      return (
        <div className="rounded-xl border border-gray-200 dark:border-[#222222] overflow-hidden bg-white dark:bg-[#111111]">
          <div className="relative aspect-video">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-sm text-white">{item.chicago_take}</p>
            </div>
          </div>
          <div className="p-3 flex items-center gap-2">
            <TeamLogo teamKey={item.team_key} size={20} />
            <span className="text-sm font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{item.title}</span>
          </div>
        </div>
      )

    case 'viral_post':
      return (
        <div className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TeamLogo teamKey={item.team} size={20} />
            <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase" style={{ backgroundColor: '#BC000020', color: '#BC0000' }}>
              {item.format}
            </span>
            <span className="text-[13px] text-gray-500 dark:text-[#888888] tabular-nums ml-auto">Score: {item.score}</span>
          </div>
          <p className="text-sm text-[#0B0F14] dark:text-[#FAFAFB] whitespace-pre-line">{item.caption}</p>
        </div>
      )

    case 'nextgen':
      return (
        <div className="rounded-xl border border-gray-200 dark:border-[#222222] overflow-hidden bg-white dark:bg-[#111111]">
          {item.thumbnail_url && (
            <div className="aspect-video">
              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-3">
            <span className="text-sm font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{item.title}</span>
          </div>
        </div>
      )

    default:
      return null
  }
}

function formatTs(ts: string): string {
  try {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}
