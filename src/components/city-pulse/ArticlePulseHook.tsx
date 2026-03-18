'use client'

import { useEffect, useState } from 'react'
import { datalabClient } from '@/lib/supabase-datalab'
import type { HomepageData } from '@/app/dash/types'
import { TEAM_LOGOS } from '@/app/dash/types'
import { trackPulseEvent } from '@/app/dash3/lib/pulseAnalytics'

const TEAM_DISPLAY: Record<string, string> = {
  bears: 'Bears', bulls: 'Bulls', blackhawks: 'Blackhawks', cubs: 'Cubs', whitesox: 'White Sox',
}

interface ArticlePulseHookProps {
  team?: string | null // team key from article
}

export function ArticlePulseHook({ team }: ArticlePulseHookProps) {
  const [pulseData, setPulseData] = useState<{ mood: string; emoji: string; record: string; teamVibe: string; color: string } | null>(null)

  useEffect(() => {
    async function fetchPulse() {
      try {
        const { data, error } = await datalabClient.rpc('get_homepage_cached')
        if (error || !data) return

        const homepage = data as HomepageData
        const pulse = homepage.hero.city_pulse
        const pct = pulse.win_pct

        let mood = 'Cautious'
        let emoji = '\u{1F914}'
        if (pct >= 0.6) { mood = 'On Fire'; emoji = '\u{1F525}' }
        else if (pct >= 0.52) { mood = 'Confident'; emoji = '\u{1F60F}' }
        else if (pct >= 0.42) { mood = 'Frustrated'; emoji = '\u{1F612}' }
        else if (pct < 0.42) { mood = 'Pain'; emoji = '\u{1F480}' }

        const record = `${pulse.aggregate_wins}-${pulse.aggregate_losses}`

        let teamVibe = ''
        let color = '#888888'
        if (team) {
          const t = homepage.team_grid.find(tg => tg.team_key === team)
          if (t) {
            teamVibe = `${TEAM_DISPLAY[team] || team} are ${t.vibe_label.toLowerCase()} (${t.record})`
            color = t.vibe_color
          }
        }

        setPulseData({ mood, emoji, record, teamVibe, color })
      } catch {}
    }
    fetchPulse()
  }, [team])

  if (!pulseData) return null

  const teamSlug = team === 'whitesox' ? 'white-sox' : team

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#111111] px-3.5 py-3 my-4">
      <div className="flex items-center gap-2 mb-1.5">
        {team && <img src={TEAM_LOGOS[team] || ''} alt="" className="w-4 h-4 object-contain" />}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">City Pulse Impact</span>
      </div>

      <p className="text-[13px] text-[#0B0F14] dark:text-[#FAFAFB] leading-snug">
        <span>{pulseData.emoji}</span>{' '}
        Chicago is <span className="font-medium">{pulseData.mood.toLowerCase()}</span> at {pulseData.record}.
        {pulseData.teamVibe && (
          <span> <span className="font-medium" style={{ color: pulseData.color }}>{pulseData.teamVibe}.</span></span>
        )}
      </p>

      <div className="mt-2 flex items-center gap-3">
        <a
          href="/dash3"
          onClick={() => trackPulseEvent('article_hook_pulse_tap', { team })}
          className="text-[12px] font-medium"
          style={{ color: '#00D4FF' }}
        >
          See City Pulse &rsaquo;
        </a>
        {team && teamSlug && (
          <a
            href={`/chicago-${teamSlug}`}
            onClick={() => trackPulseEvent('article_hook_team_tap', { team })}
            className="text-[12px] font-medium"
            style={{ color: '#BC0000' }}
          >
            {TEAM_DISPLAY[team] || team} Hub &rsaquo;
          </a>
        )}
        <a
          href={`/ask-ai?q=${encodeURIComponent(`Why are the ${TEAM_DISPLAY[team || ''] || 'Chicago teams'} struggling?`)}&context=pulse`}
          onClick={() => trackPulseEvent('article_hook_scout_tap', { team })}
          className="text-[12px] font-medium text-gray-500 dark:text-[#888888]"
        >
          Ask Scout &rsaquo;
        </a>
      </div>
    </div>
  )
}
