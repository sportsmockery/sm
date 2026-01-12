'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PollBuilder, { PollConfig } from '@/components/admin/PollBuilder/PollBuilder'

interface PollOption {
  id: number
  option_text: string
  vote_count: number
  display_order: number
}

interface Poll {
  id: number
  question: string
  poll_type: 'single' | 'multiple'
  status: 'active' | 'closed' | 'scheduled'
  show_results: boolean
  total_votes: number
  ends_at: string | null
  created_at: string
  options: PollOption[]
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'scheduled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null)

  useEffect(() => {
    fetchPolls()
  }, [filter, searchQuery])

  async function fetchPolls() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/admin/polls?${params}`)
      const data = await res.json()
      setPolls(data.polls || [])
    } catch (err) {
      console.error('Error fetching polls:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePoll(config: PollConfig) {
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: config.question,
          options: config.options.map(opt => ({ text: opt.text, color: opt.color })),
          pollType: config.pollType,
          showResults: config.showResults,
          endsAt: config.endsAt,
        }),
      })

      if (res.ok) {
        fetchPolls()
        setShowBuilder(false)
      }
    } catch (err) {
      console.error('Error creating poll:', err)
    }
  }

  async function handleStatusChange(pollId: number, newStatus: string) {
    try {
      await fetch(`/api/admin/polls/${pollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchPolls()
    } catch (err) {
      console.error('Error updating poll:', err)
    }
  }

  async function handleDelete(pollId: number) {
    if (!confirm('Are you sure you want to delete this poll?')) return

    try {
      await fetch(`/api/admin/polls/${pollId}`, { method: 'DELETE' })
      fetchPolls()
    } catch (err) {
      console.error('Error deleting poll:', err)
    }
  }

  function copyShortcode(pollId: number) {
    navigator.clipboard.writeText(`[poll:${pollId}]`)
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Polls</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Create and manage interactive polls for your articles
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Poll
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'closed', 'scheduled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-[var(--accent-red)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Polls List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-red)] border-t-transparent" />
        </div>
      ) : polls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 mb-4">
            <span className="text-3xl">🗳️</span>
          </div>
          <p className="text-[var(--text-muted)] text-center mb-4">
            {searchQuery || filter !== 'all' ? 'No polls match your filters' : 'No polls yet'}
          </p>
          <button
            onClick={() => setShowBuilder(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create your first poll
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 hover:shadow-lg transition-all"
            >
              {/* Poll Header */}
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadge(poll.status)}`}
                >
                  {poll.status}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyShortcode(poll.id)}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    title="Copy shortcode"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Question */}
              <h3 className="font-semibold text-[var(--text-primary)] mb-3 line-clamp-2">
                {poll.question}
              </h3>

              {/* Options Preview */}
              <div className="space-y-2 mb-4">
                {poll.options.slice(0, 3).map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[var(--text-secondary)] truncate flex-1 mr-2">
                      {option.option_text}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {option.vote_count} votes
                    </span>
                  </div>
                ))}
                {poll.options.length > 3 && (
                  <p className="text-xs text-[var(--text-muted)]">
                    +{poll.options.length - 3} more options
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
                <span>{poll.total_votes} total votes</span>
                <span>{poll.poll_type === 'multiple' ? 'Multiple choice' : 'Single choice'}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-default)]">
                <Link
                  href={`/admin/polls/${poll.id}`}
                  className="flex-1 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2 text-center text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  View Results
                </Link>
                {poll.status === 'active' ? (
                  <button
                    onClick={() => handleStatusChange(poll.id, 'closed')}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
                  >
                    Close
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(poll.id, 'active')}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  >
                    Reopen
                  </button>
                )}
                <button
                  onClick={() => handleDelete(poll.id)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Poll Builder Modal */}
      <PollBuilder
        isOpen={showBuilder}
        onClose={() => {
          setShowBuilder(false)
          setEditingPoll(null)
        }}
        onSave={handleCreatePoll}
      />
    </div>
  )
}
