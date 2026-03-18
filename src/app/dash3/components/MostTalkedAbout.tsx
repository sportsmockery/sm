'use client'

import { useMemo } from 'react'
import type { FeedItem, TeamCard } from '../../dash/types'
import { TEAM_LOGOS } from '../../dash/types'
import { trackPulseEvent } from '../lib/pulseAnalytics'

const TEAM_DISPLAY: Record<string, string> = {
  bears: 'Bears', bulls: 'Bulls', blackhawks: 'Blackhawks', cubs: 'Cubs', whitesox: 'White Sox',
}

interface MostTalkedAboutProps {
  feed: FeedItem[]
  teams: TeamCard[]
}

export function MostTalkedAbout({ feed, teams }: MostTalkedAboutProps) {
  const topTopic = useMemo(() => {
    // Count team mentions in feed
    const counts: Record<string, number> = {}
    for (const item of feed) {
      const team = 'team' in item ? (item as any).team : ('team_key' in item ? (item as any).team_key : null)
      if (team && TEAM_DISPLAY[team]) {
        counts[team] = (counts[team] || 0) + 1
      }
    }

    // Find max
    let topTeam = ''
    let topCount = 0
    for (const [key, count] of Object.entries(counts)) {
      if (count > topCount) { topTeam = key; topCount = count }
    }

    if (!topTeam || topCount < 2) return null

    const teamData = teams.find(t => t.team_key === topTeam)
    return { team: topTeam, count: topCount, teamData }
  }, [feed, teams])

  if (!topTopic) return null

  const teamSlug = topTopic.team === 'whitesox' ? 'white-sox' : topTopic.team

  return (
    <a
      href={`/chicago-${teamSlug}`}
      onClick={() => trackPulseEvent('most_talked_tap', { team: topTopic.team })}
      className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-[#1a1a1a] px-3 py-2 active:scale-[0.98] transition-transform"
    >
      <img src={TEAM_LOGOS[topTopic.team] || ''} alt="" className="w-5 h-5 object-contain" />
      <span className="text-[12px] text-gray-500 dark:text-[#888888]">Most talked about:</span>
      <span className="text-[12px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">
        {TEAM_DISPLAY[topTopic.team]}
      </span>
      <span className="text-[11px] text-gray-400 dark:text-[#555555]">{topTopic.count} stories</span>
      <span className="ml-auto text-[11px] font-medium" style={{ color: '#00D4FF' }}>&rsaquo;</span>
    </a>
  )
}
