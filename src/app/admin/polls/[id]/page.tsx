'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PollResults from '@/components/polls/PollResults'

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
  starts_at: string
  ends_at: string | null
  created_at: string
  options: PollOption[]
}

export default function PollDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPoll()
  }, [id])

  async function fetchPoll() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/polls/${id}`)
      if (!res.ok) throw new Error('Poll not found')
      const data = await res.json()
      setPoll(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!poll) return

    try {
      await fetch(`/api/admin/polls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setPoll({ ...poll, status: newStatus as Poll['status'] })
    } catch (err) {
      console.error('Error updating poll:', err)
    }
  }

  function copyShortcode() {
    navigator.clipboard.writeText(`[poll:${id}]`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-red)] border-t-transparent" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-[var(--text-muted)]">{error || 'Poll not found'}</p>
        <Link
          href="/admin/polls"
          className="mt-4 text-[var(--accent-red)] hover:underline"
        >
          Back to Polls
        </Link>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'closed':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/polls"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Poll Results</h1>
          <p className="mt-1 text-[var(--text-muted)]">View detailed analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyShortcode}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
            </svg>
            Copy Shortcode
          </button>
          {poll.status === 'active' ? (
            <button
              onClick={() => handleStatusChange('closed')}
              className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-500 hover:bg-amber-500/20 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Close Poll
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/20 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Reopen Poll
            </button>
          )}
        </div>
      </div>

      {/* Poll Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden"
      >
        {/* Poll Header */}
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <span className="text-xl">🗳️</span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(poll.status)}`}
                >
                  {poll.status}
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-[var(--text-muted)]">
              <p>Created {new Date(poll.created_at).toLocaleDateString()}</p>
              {poll.ends_at && (
                <p>Ends {new Date(poll.ends_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Poll Content */}
        <div className="p-6">
          {/* Question */}
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            {poll.question}
          </h2>

          {/* Results */}
          <PollResults
            options={poll.options.sort((a, b) => a.display_order - b.display_order).map(opt => ({
              ...opt,
              id: String(opt.id),
              poll_id: String(poll.id),
              created_at: poll.created_at,
            }))}
            totalVotes={poll.total_votes}
            showWinner={true}
          />
        </div>

        {/* Poll Footer */}
        <div className="border-t border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
            <span>{poll.poll_type === 'multiple' ? 'Multiple choice' : 'Single choice'}</span>
            <span>{poll.show_results ? 'Results visible to voters' : 'Results hidden until voting'}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Total Votes</p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {poll.total_votes.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Options</p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {poll.options.length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Leading Option</p>
          <p className="mt-2 text-lg font-bold text-[var(--text-primary)] truncate">
            {poll.options.length > 0
              ? [...poll.options].sort((a, b) => b.vote_count - a.vote_count)[0]?.option_text || 'N/A'
              : 'N/A'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Avg. Votes/Option</p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {poll.options.length > 0
              ? Math.round(poll.total_votes / poll.options.length)
              : 0}
          </p>
        </div>
      </div>

      {/* Embed Preview */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Embed Preview
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Use this shortcode in your articles to embed this poll:
        </p>
        <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-tertiary)] p-4">
          <code className="flex-1 text-sm text-purple-500 font-mono">
            [poll:{poll.id}]
          </code>
          <button
            onClick={copyShortcode}
            className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-500 hover:bg-purple-500/20 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
