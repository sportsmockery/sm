'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import PollResults from './PollResults'

interface PollOption {
  id: number
  option_text: string
  vote_count: number
  display_order: number
  color?: string
}

interface Poll {
  id: number
  question: string
  poll_type: 'single' | 'multiple'
  status: 'active' | 'closed' | 'scheduled'
  show_results: boolean
  total_votes: number
  ends_at: string | null
  options: PollOption[]
}

interface PollEmbedProps {
  id?: string | number
  poll?: Poll
  className?: string
}

export default function PollEmbed({ id, poll: propPoll, className = '' }: PollEmbedProps) {
  const [poll, setPoll] = useState<Poll | null>(propPoll || null)
  const [loading, setLoading] = useState(!propPoll && !!id)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVotedOptionId, setUserVotedOptionId] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  // Check localStorage for previous vote
  useEffect(() => {
    if (poll) {
      const voteKey = `poll_vote_${poll.id}`
      const storedVote = localStorage.getItem(voteKey)
      if (storedVote) {
        const voteData = JSON.parse(storedVote)
        setHasVoted(true)
        setUserVotedOptionId(voteData.optionId)
        setShowResults(true)
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
      setPoll(data)
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
          optionId: selectedOptions[0], // For single choice
          optionIds: selectedOptions, // For multiple choice
          anonymousId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to vote')
      }

      const updatedPoll = await res.json()
      setPoll(updatedPoll)
      setHasVoted(true)
      setUserVotedOptionId(selectedOptions[0])
      setShowResults(true)

      // Store vote in localStorage
      localStorage.setItem(`poll_vote_${poll.id}`, JSON.stringify({
        optionId: selectedOptions[0],
        votedAt: new Date().toISOString(),
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote')
    } finally {
      setVoting(false)
    }
  }

  function toggleOption(optionId: number) {
    if (poll?.poll_type === 'single') {
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <span className="text-xl">🗳️</span>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-purple-500">Poll</span>
            {isPollClosed && (
              <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                Closed
              </span>
            )}
          </div>
        </div>
        {poll.show_results && !showResults && (
          <button
            onClick={() => setShowResults(true)}
            className="text-xs text-purple-500 hover:text-purple-400 transition-colors"
          >
            View Results
          </button>
        )}
      </div>

      {/* Question */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        {poll.question}
      </h3>

      {/* Voting Options or Results */}
      {showResults || hasVoted || isPollClosed ? (
        <PollResults
          options={poll.options}
          totalVotes={poll.total_votes}
          userVotedOptionId={userVotedOptionId}
          showWinner={true}
        />
      ) : (
        <div className="space-y-3">
          {poll.options
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
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  } ${!canVote ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.option_text}
                    </span>
                  </div>
                </motion.button>
              )
            })}

          {/* Vote Button */}
          {canVote && (
            <motion.button
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || voting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
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

      {/* Poll Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {poll.poll_type === 'multiple' ? 'Select multiple options' : 'Select one option'}
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
