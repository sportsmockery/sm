'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Poll, PollResults } from '@/types/polls'
import { getTeamColors, getRandomMicrocopy } from '@/types/polls'

export default function PollResultsPage() {
  const params = useParams()
  const id = params.id as string

  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPoll()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchPoll, 5000)
    return () => clearInterval(interval)
  }, [id])

  async function fetchPoll() {
    try {
      const res = await fetch(`/api/polls/${id}`)
      if (!res.ok) throw new Error('Failed to load poll')
      const data = await res.json()
      setPoll(data.poll)
    } catch (err) {
      setError('Failed to load poll results')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Poll not found</h2>
          <Link href="/polls" className="text-purple-600 dark:text-purple-400 hover:underline">
            Back to polls
          </Link>
        </div>
      </div>
    )
  }

  const teamColors = getTeamColors(poll.team_theme || null)
  const maxVotes = Math.max(...poll.options.map(o => o.vote_count || 0))
  const winningOption = poll.options.find(o => o.vote_count === maxVotes && maxVotes > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/polls" className="hover:text-purple-600 dark:hover:text-purple-400">
                Polls
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900 dark:text-white font-medium">Results</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{poll.title || 'Poll Results'}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{poll.question}</p>
            </div>
            <Link
              href={`/polls/${id}/edit`}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Edit Poll
            </Link>
          </div>

          {/* Live indicator */}
          <div className="mt-4 flex items-center gap-4">
            {poll.status === 'active' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
            {poll.team_theme && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-3xl font-bold" style={{ color: teamColors.primary }}>
              {poll.total_votes.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Votes</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {poll.options.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Options</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {poll.poll_type}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Poll Type</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {poll.status}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
          </div>
        </div>

        {/* Results Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {getRandomMicrocopy('results_header')}
          </h2>

          <div className="space-y-4">
            {poll.options
              .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
              .map((option, index) => {
                const percentage = poll.total_votes > 0
                  ? Math.round(((option.vote_count || 0) / poll.total_votes) * 100)
                  : 0
                const isWinner = option.id === winningOption?.id

                return (
                  <div key={option.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {option.option_text}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
                            <span>🏆</span> Winner
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {percentage}%
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ({(option.vote_count || 0).toLocaleString()})
                        </span>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                        className="h-full rounded-full relative"
                        style={{
                          backgroundColor: option.team_tag
                            ? getTeamColors(option.team_tag).primary
                            : teamColors.primary,
                        }}
                      >
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
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Embed This Poll</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Shortcode (for articles)
              </label>
              <div className="flex gap-2">
                <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono">
                  [poll:{poll.id}]
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`[poll:${poll.id}]`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Embed URL
              </label>
              <div className="flex gap-2">
                <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/polls/embed/${poll.id}` : `/polls/embed/${poll.id}`}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/polls/embed/${poll.id}`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
