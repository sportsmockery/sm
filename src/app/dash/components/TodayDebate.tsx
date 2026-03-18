'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TodaysDebate, VoteResult } from '../types'
import { parseDebateOptions } from '../types'
import { TeamLogo } from '../shared/TeamLogo'
import { useVote } from '../hooks/useVote'

interface TodayDebateProps {
  debate: TodaysDebate
}

export function TodayDebate({ debate }: TodayDebateProps) {
  const { question, options } = parseDebateOptions(debate.caption)
  const voteMutation = useVote()
  const [voteResult, setVoteResult] = useState<VoteResult | null>(null)
  const hasVoted = !!voteResult

  const handleVote = async (index: number) => {
    if (hasVoted) return
    try {
      const result = await voteMutation.mutateAsync({ pollId: debate.id, optionIndex: index })
      setVoteResult(result)
    } catch {
      // silently handle
    }
  }

  const totals = voteResult ? voteResult.total_votes : debate.total_votes
  const counts = voteResult ? voteResult.results : debate.vote_counts

  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-5">
      <div className="flex items-center gap-2 mb-4">
        <TeamLogo teamKey={debate.team} size={24} />
        <span className="text-[13px] text-gray-500 dark:text-[#888888] uppercase tracking-wider">Today&apos;s Debate</span>
      </div>
      <h3 className="text-base font-bold text-[#0B0F14] dark:text-[#FAFAFB] mb-4">{question}</h3>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const count = Number(counts?.[String(i)] || 0)
          const pct = totals > 0 ? Math.round((count / totals) * 100) : 0
          const isUserVote = voteResult?.your_vote === i

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={hasVoted || voteMutation.isPending}
              className="w-full text-left rounded-lg border border-gray-200 dark:border-[#222222] p-3 relative overflow-hidden transition-colors disabled:cursor-default hover:border-gray-300 dark:hover:border-[#333333]"
            >
              {/* Result bar */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-y-0 left-0 rounded-lg"
                  style={{ backgroundColor: isUserVote ? '#00D4FF15' : 'rgba(128,128,128,0.08)' }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="text-sm text-[#0B0F14] dark:text-[#FAFAFB]">{opt}</span>
                {hasVoted && (
                  <span className="text-sm font-medium tabular-nums" style={{ color: isUserVote ? '#00D4FF' : '#888888' }}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {hasVoted && (
        <div className="mt-3 flex items-center justify-between text-[13px] text-gray-500 dark:text-[#888888]">
          <span>{totals} Chicagoans voted</span>
          <a
            href={`/ask-ai?q=${encodeURIComponent(`The city voted. What do you think?`)}&team=${debate.team}&context=debate`}
            className="font-medium"
            style={{ color: '#00D4FF' }}
          >
            Ask Scout Why
          </a>
        </div>
      )}
    </div>
  )
}
