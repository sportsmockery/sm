'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TeamCard as TeamCardType, Injury, FeedItem } from '../types'
import { VibeRing } from '../shared/VibeRing'
import { VibeBadge } from '../shared/VibeBadge'
import { StreakBadge } from '../shared/StreakBadge'
import { SeasonPhaseBadge } from '../shared/SeasonPhaseBadge'
import { TEAM_LOGOS } from '../types'

interface TeamGridProps {
  teams: TeamCardType[]
  injuries: Injury[]
  feed: FeedItem[]
}

export function TeamGrid({ teams, injuries, feed }: TeamGridProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map(team => (
        <TeamCardComponent
          key={team.team_key}
          team={team}
          isExpanded={expanded === team.team_key}
          onToggle={() => setExpanded(expanded === team.team_key ? null : team.team_key)}
          injuries={injuries.filter(i => i.team_key === team.team_key)}
          headlines={feed.filter(f => f.type === 'article' && (f as any).team === team.team_key).slice(0, 3) as any[]}
        />
      ))}
    </div>
  )
}

function TeamCardComponent({
  team,
  isExpanded,
  onToggle,
  injuries,
  headlines,
}: {
  team: TeamCardType
  isExpanded: boolean
  onToggle: () => void
  injuries: Injury[]
  headlines: { title: string; url: string }[]
}) {
  const logoUrl = TEAM_LOGOS[team.team_key] || ''
  const [showAllInjuries, setShowAllInjuries] = useState(false)

  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] overflow-hidden cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-[#333333]"
      onClick={onToggle}
    >
      {/* Collapsed view */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <VibeRing score={team.vibe_score} color={team.vibe_color} logoUrl={logoUrl} size={48} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{team.team_name}</span>
              <VibeBadge label={team.vibe_label} color={team.vibe_color} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-gray-500 dark:text-[#888888]">
              <span className="font-medium tabular-nums">{team.record}</span>
              <span>·</span>
              <SeasonPhaseBadge phase={team.team_phase} />
              <StreakBadge type={team.streak_type} count={team.streak_count} />
            </div>
          </div>
        </div>

        {/* Top headline */}
        {headlines.length > 0 && (
          <p className="mt-3 text-sm text-gray-600 dark:text-[#888888] line-clamp-1">
            {headlines[0].title}
          </p>
        )}
      </div>

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-t border-gray-100 dark:border-[#222222] px-4 pb-4 pt-3 space-y-3">
              {/* Last game */}
              {team.last_game && (
                <div className="text-sm text-gray-600 dark:text-[#888888]">
                  <span className="font-medium" style={{ color: team.last_game.result === 'W' ? '#16a34a' : '#BC0000' }}>
                    {team.last_game.result}
                  </span>{' '}
                  {team.last_game.score} vs {team.last_game.opponent} ({team.last_game.date})
                </div>
              )}

              {/* Next game */}
              {team.next_game && (
                <div className="text-sm text-gray-600 dark:text-[#888888]">
                  Next: {team.next_game.home ? 'vs' : '@'} {team.next_game.opponent_full}, {team.next_game.date}
                  {team.next_game.time && ` ${team.next_game.time}`}
                  {team.next_game.type === 'spring_training' && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Spring Training</span>
                  )}
                </div>
              )}

              {/* Headlines */}
              {headlines.length > 0 && (
                <div className="space-y-1.5">
                  {headlines.map((h, i) => (
                    <a key={i} href={h.url} className="block text-sm text-[#0B0F14] dark:text-[#FAFAFB] hover:underline line-clamp-1" onClick={e => e.stopPropagation()}>
                      {h.title}
                    </a>
                  ))}
                </div>
              )}

              {/* Injuries */}
              {injuries.length > 0 && (
                <div>
                  <div className="text-[13px] font-medium text-gray-500 dark:text-[#888888] mb-1.5">Injuries</div>
                  <div className="space-y-1">
                    {(showAllInjuries ? injuries : injuries.slice(0, 3)).map((inj, i) => (
                      <InjuryRow key={i} injury={inj} />
                    ))}
                  </div>
                  {injuries.length > 3 && !showAllInjuries && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAllInjuries(true) }}
                      className="mt-1 text-[13px] font-medium"
                      style={{ color: '#00D4FF' }}
                    >
                      Show all {injuries.length}
                    </button>
                  )}
                </div>
              )}

              {/* Scout CTA */}
              <a
                href={`/ask-ai?team=${team.team_key}&context=dashboard`}
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: '#00D4FF' }}
                onClick={e => e.stopPropagation()}
              >
                Ask Scout about {team.team_key}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  O: '#BC0000',
  IR: '#BC0000',
  IL60: '#BC0000',
  DD: '#eab308',
  Q: '#f97316',
}

function InjuryRow({ injury }: { injury: Injury }) {
  const color = STATUS_COLORS[injury.status] || '#888888'
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="px-1.5 py-0.5 rounded font-medium text-white" style={{ backgroundColor: color }}>
        {injury.status}
      </span>
      <span className="text-[#0B0F14] dark:text-[#FAFAFB]">{injury.player}</span>
      <span className="text-gray-400 dark:text-[#666666]">{injury.position}</span>
      {injury.detail && <span className="text-gray-400 dark:text-[#666666]">({injury.detail})</span>}
      {injury.starter && <span className="text-[11px] font-medium" style={{ color: '#D6B05E' }}>STARTER</span>}
    </div>
  )
}
