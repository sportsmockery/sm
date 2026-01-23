'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import PollResults from './PollResults'
import type { Poll, PollOption, ChicagoTeam, PollResults as PollResultsType } from '@/types/polls'
import { getTeamColors, getRandomMicrocopy } from '@/types/polls'

interface PollEmbedProps {
  id?: string
  poll?: Poll
  className?: string
  compact?: boolean
}

export default function PollEmbed({ id, poll: propPoll, className = '', compact = false }: PollEmbedProps) {
  const [poll, setPoll] = useState<Poll | null>(propPoll || null)
  const [loading, setLoading] = useState(!propPoll && !!id)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVotedOptions, setUserVotedOptions] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  // Get team colors
  const teamColors = getTeamColors(poll?.team_theme || null)

  // Check localStorage for previous vote
  useEffect(() => {
    if (poll) {
      const voteKey = `poll_vote_${poll.id}`
      const storedVote = localStorage.getItem(voteKey)
      if (storedVote) {
        try {
          const voteData = JSON.parse(storedVote)
          setHasVoted(true)
          setUserVotedOptions(voteData.optionIds || [voteData.optionId])
          setShowResults(true)
        } catch (e) {
          // Invalid stored data, ignore
        }
      }
    }
  }, [poll])

  // Fetch poll if ID provided
  useEffect(() => {
    if (id && !propPoll) {
      fetchPoll()
    }
  }, [id, propPoll])

  async function fetchPoll() {
    try {
      setLoading(true)
      const res = await fetch(`/api/polls/${id}`)
      if (!res.ok) throw new Error('Poll not found')
      const data = await res.json()
      setPoll(data.poll)
    } catch (err) {
      setError('Failed to load poll')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVote() {
    if (!poll || selectedOptions.length === 0) return

    setVoting(true)
    setError(null)
    try {
      // Generate anonymous ID for non-logged-in users
      let anonymousId = localStorage.getItem('sm_anonymous_id')
      if (!anonymousId) {
        anonymousId = crypto.randomUUID()
        localStorage.setItem('sm_anonymous_id', anonymousId)
      }

      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_ids: selectedOptions,
          anonymous_id: anonymousId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      // Update poll with results
      if (data.results?.poll) {
        setPoll(data.results.poll)
      }

      setHasVoted(true)
      setUserVotedOptions(selectedOptions)
      setShowResults(true)
      setSuccessMessage(data.message || getRandomMicrocopy('voted'))

      // Store vote in localStorage
      localStorage.setItem(`poll_vote_${poll.id}`, JSON.stringify({
        optionIds: selectedOptions,
        votedAt: new Date().toISOString(),
      }))

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote')
    } finally {
      setVoting(false)
    }
  }

  function toggleOption(optionId: string) {
    if (!poll) return

    if (poll.poll_type === 'single' || poll.poll_type === 'scale') {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    }
  }

  if (loading) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: teamColors.primary, borderTopColor: 'transparent' }} />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error && !poll) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!poll) return null

  const isPollClosed = poll.status === 'closed' || (poll.ends_at && new Date(poll.ends_at) < new Date())
  const canVote = !hasVoted && !isPollClosed && poll.status === 'active'

  // Generate CTA text
  const ctaText = getRandomMicrocopy('vote_cta')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] overflow-hidden hover:shadow-lg transition-shadow ${className}`}
      style={{
        borderTopWidth: '4px',
        borderTopColor: teamColors.primary,
      }}
    >
      {/* Poll Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${teamColors.primary}15` }}
            >
              <span className="text-xl">
                {poll.poll_type === 'emoji' ? '😊' : poll.poll_type === 'scale' ? '📊' : '🗳️'}
              </span>
            </div>
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: teamColors.primary }}
              >
                {poll.title || 'Poll'}
              </span>
              {isPollClosed && (
                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                  Closed
                </span>
              )}
              {poll.team_theme && (
                <span
                  className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${teamColors.primary}15`,
                    color: teamColors.primary
                  }}
                >
                  {poll.team_theme.charAt(0).toUpperCase() + poll.team_theme.slice(1)}
                </span>
              )}
            </div>
          </div>
          {poll.show_results && !showResults && !hasVoted && (
            <button
              onClick={() => setShowResults(true)}
              className="text-xs transition-colors"
              style={{ color: teamColors.primary }}
            >
              View Results
            </button>
          )}
        </div>

        {/* Question */}
        <h3 className={`font-bold text-gray-900 dark:text-white ${compact ? 'text-base mb-4' : 'text-lg mb-6'}`}>
          {poll.question}
        </h3>

        {/* Success message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg text-center text-sm font-medium"
              style={{
                backgroundColor: `${teamColors.primary}15`,
                color: teamColors.primary
              }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voting Options or Results */}
      <div className="p-6 pt-0">
        {showResults || hasVoted || isPollClosed ? (
          <PollResults
            options={poll.options}
            totalVotes={poll.total_votes}
            userVotedOptions={userVotedOptions}
            teamTheme={poll.team_theme}
            pollType={poll.poll_type}
            showWinner={true}
          />
        ) : (
          <div className="space-y-3">
            {/* Scale poll */}
            {poll.poll_type === 'scale' ? (
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>{poll.scale_labels?.min || poll.scale_min}</span>
                  <span>{poll.scale_labels?.max || poll.scale_max}</span>
                </div>
                <div className="flex gap-2 justify-between">
                  {poll.options.map((option) => {
                    const isSelected = selectedOptions.includes(option.id)
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleOption(option.id)}
                        disabled={!canVote}
                        whileHover={canVote ? { scale: 1.1 } : {}}
                        whileTap={canVote ? { scale: 0.95 } : {}}
                        className={`flex-1 aspect-square max-w-12 rounded-lg text-sm font-bold transition-all ${
                          isSelected
                            ? 'text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        } ${!canVote ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        style={isSelected ? { backgroundColor: teamColors.primary } : {}}
                      >
                        {option.option_text}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ) : poll.poll_type === 'emoji' ? (
              /* Emoji poll */
              <div className="flex flex-wrap gap-3 justify-center">
                {poll.options.map((option) => {
                  const isSelected = selectedOptions.includes(option.id)
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      disabled={!canVote}
                      whileHover={canVote ? { scale: 1.2 } : {}}
                      whileTap={canVote ? { scale: 0.9 } : {}}
                      className={`text-4xl p-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-gray-200 dark:bg-gray-700 shadow-lg'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      } ${!canVote ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      style={isSelected ? {
                        outline: `2px solid ${teamColors.primary}`,
                        outlineOffset: '2px'
                      } : {}}
                    >
                      {option.emoji || option.option_text}
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              /* Regular options */
              poll.options
                .sort((a, b) => a.display_order - b.display_order)
                .map((option) => {
                  const isSelected = selectedOptions.includes(option.id)
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      disabled={!canVote}
                      whileHover={canVote ? { scale: 1.01 } : {}}
                      whileTap={canVote ? { scale: 0.99 } : {}}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'bg-opacity-10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-opacity-50'
                      } ${!canVote ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      style={isSelected ? {
                        borderColor: teamColors.primary,
                        backgroundColor: `${teamColors.primary}10`
                      } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors`}
                          style={isSelected ? {
                            borderColor: teamColors.primary,
                            backgroundColor: teamColors.primary
                          } : {}}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {option.option_image && (
                          <img
                            src={option.option_image}
                            alt={option.option_text}
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {option.option_text}
                        </span>
                        {option.team_tag && (
                          <span
                            className="ml-auto text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${getTeamColors(option.team_tag).primary}15`,
                              color: getTeamColors(option.team_tag).primary
                            }}
                          >
                            {option.team_tag}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  )
                })
            )}

            {/* Vote Button */}
            {canVote && (
              <motion.button
                onClick={handleVote}
                disabled={selectedOptions.length === 0 || voting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full rounded-xl py-3 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                style={{ backgroundColor: teamColors.primary }}
              >
                {voting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Vote'
                )}
              </motion.button>
            )}

            {error && (
              <p className="text-center text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Poll Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
        <span>
          {!hasVoted && !isPollClosed && ctaText}
          {hasVoted && 'Thanks for voting!'}
          {isPollClosed && !hasVoted && 'This poll is closed'}
        </span>
        {poll.ends_at && !isPollClosed && (
          <span>
            Ends {new Date(poll.ends_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  )
}
