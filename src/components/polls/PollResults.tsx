'use client'

import { motion } from 'framer-motion'
import type { PollOption, ChicagoTeam, PollType } from '@/types/polls'
import { getTeamColors, getRandomMicrocopy } from '@/types/polls'

interface PollResultsProps {
  options: PollOption[]
  totalVotes: number
  userVotedOptions?: string[]
  teamTheme?: ChicagoTeam
  pollType?: PollType
  showWinner?: boolean
}

export default function PollResults({
  options,
  totalVotes,
  userVotedOptions = [],
  teamTheme,
  pollType = 'single',
  showWinner = true,
}: PollResultsProps) {
  const teamColors = getTeamColors(teamTheme || null)

  // Find the winning option
  const maxVotes = Math.max(...options.map(o => o.vote_count || 0))
  const winningOptions = options.filter(o => (o.vote_count || 0) === maxVotes && maxVotes > 0)

  // Generate colors for options
  const generateOptionColor = (index: number, option: PollOption) => {
    if (option.team_tag) {
      return getTeamColors(option.team_tag).primary
    }
    // Use team color variants
    const opacity = 1 - (index * 0.15)
    return teamColors.primary
  }

  // Emoji poll results
  if (pollType === 'emoji') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 justify-center">
          {options.map((option, index) => {
            const percentage = totalVotes > 0 ? Math.round(((option.vote_count || 0) / totalVotes) * 100) : 0
            const isWinner = showWinner && winningOptions.some(w => w.id === option.id)
            const isUserVote = userVotedOptions.includes(option.id)

            return (
              <motion.div
                key={option.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`relative flex flex-col items-center p-4 rounded-xl ${
                  isWinner ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-400' :
                  isUserVote ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <span className="text-4xl mb-2">{option.emoji || option.option_text}</span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <span className="text-lg font-bold" style={{ color: teamColors.primary }}>
                    {percentage}%
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {(option.vote_count || 0).toLocaleString()}
                  </span>
                </motion.div>
                {isUserVote && (
                  <span className="absolute -top-1 -right-1 text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
                {isWinner && (
                  <span className="absolute -top-1 -left-1 text-sm">🏆</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Total votes */}
        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalVotes.toLocaleString()} total {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>
    )
  }

  // Scale poll results
  if (pollType === 'scale') {
    const avgScore = totalVotes > 0
      ? options.reduce((sum, opt) => sum + (parseInt(opt.option_text) * (opt.vote_count || 0)), 0) / totalVotes
      : 0

    return (
      <div className="space-y-4">
        {/* Average score display */}
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full text-white text-3xl font-bold"
            style={{ backgroundColor: teamColors.primary }}
          >
            {avgScore.toFixed(1)}
          </motion.div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Average score</p>
        </div>

        {/* Distribution bars */}
        <div className="space-y-2">
          {options.map((option, index) => {
            const percentage = totalVotes > 0 ? Math.round(((option.vote_count || 0) / totalVotes) * 100) : 0
            const isUserVote = userVotedOptions.includes(option.id)

            return (
              <div key={option.id} className="flex items-center gap-2">
                <span className="w-6 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {option.option_text}
                </span>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      backgroundColor: teamColors.primary,
                      opacity: 0.5 + (parseInt(option.option_text) / 20)
                    }}
                  >
                    {percentage > 10 && (
                      <span className="text-xs font-medium text-white">{percentage}%</span>
                    )}
                  </motion.div>
                </div>
                {isUserVote && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${teamColors.primary}20`, color: teamColors.primary }}>
                    You
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Total votes */}
        <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalVotes.toLocaleString()} total {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>
    )
  }

  // Standard poll results
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const percentage = totalVotes > 0 ? Math.round(((option.vote_count || 0) / totalVotes) * 100) : 0
        const isWinner = showWinner && winningOptions.some(w => w.id === option.id)
        const isUserVote = userVotedOptions.includes(option.id)
        const barColor = generateOptionColor(index, option)

        return (
          <div key={option.id} className="relative">
            {/* Option label and percentage */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {option.option_image && (
                  <img
                    src={option.option_image}
                    alt={option.option_text}
                    className="h-6 w-6 rounded object-cover"
                  />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.option_text}
                </span>
                {option.team_tag && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${getTeamColors(option.team_tag).primary}15`,
                      color: getTeamColors(option.team_tag).primary
                    }}
                  >
                    {option.team_tag}
                  </span>
                )}
                {isUserVote && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${teamColors.primary}15`,
                      color: teamColors.primary
                    }}
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Your vote
                  </span>
                )}
                {isWinner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Leading
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-gray-900 dark:text-white">
                  {percentage}%
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({(option.vote_count || 0).toLocaleString()} {(option.vote_count || 0) === 1 ? 'vote' : 'votes'})
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                className="h-full rounded-full relative"
                style={{ backgroundColor: barColor }}
              >
                {/* Shimmer effect for winner */}
                {isWinner && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                )}
              </motion.div>
            </div>
          </div>
        )
      })}

      {/* Total votes with microcopy */}
      <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: teamColors.primary }}>
            {getRandomMicrocopy('results_header')}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalVotes.toLocaleString()} total {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>
    </div>
  )
}
