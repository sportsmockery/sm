'use client'

import { motion } from 'framer-motion'

interface PollOption {
  id: number
  option_text: string
  vote_count: number
  color?: string
}

interface PollResultsProps {
  options: PollOption[]
  totalVotes: number
  userVotedOptionId?: number | null
  showWinner?: boolean
}

const defaultColors = [
  'from-purple-600 to-indigo-600',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
]

export default function PollResults({
  options,
  totalVotes,
  userVotedOptionId,
  showWinner = true,
}: PollResultsProps) {
  // Find the winning option
  const maxVotes = Math.max(...options.map(o => o.vote_count))
  const winningOptions = options.filter(o => o.vote_count === maxVotes && maxVotes > 0)

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0
        const isWinner = showWinner && winningOptions.some(w => w.id === option.id)
        const isUserVote = userVotedOptionId === option.id
        const colorGradient = defaultColors[index % defaultColors.length]

        return (
          <div key={option.id} className="relative">
            {/* Option label and percentage */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.option_text}
                </span>
                {isUserVote && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-500">
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
                  ({option.vote_count.toLocaleString()} {option.vote_count === 1 ? 'vote' : 'votes'})
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                className={`h-full bg-gradient-to-r ${colorGradient} rounded-full relative`}
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

      {/* Total votes */}
      <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalVotes.toLocaleString()} total {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>
    </div>
  )
}
