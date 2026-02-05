'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Poll {
  id: string
  question: string
  status: 'draft' | 'active' | 'closed'
  created_at: string
  total_votes?: number
}

export default function StudioPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/polls')
      if (!response.ok) throw new Error('Failed to fetch polls')
      const data = await response.json()
      setPolls(data.polls || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPolls()
  }, [fetchPolls])

  const statusColors = {
    draft: 'bg-amber-500/10 text-amber-500',
    active: 'bg-emerald-500/10 text-emerald-500',
    closed: 'bg-gray-500/10 text-gray-500',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Polls</h1>
          <p className="mt-1 text-[var(--text-muted)]">Create and manage polls</p>
        </div>
        <Link
          href="/polls/new"
          className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium"
          style={{ backgroundColor: '#bc0000', color: '#ffffff' }}
        >
          New Poll
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-red)]"></div>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchPolls} className="mt-4 text-sm text-red-400 underline">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && polls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
          <svg className="h-16 w-16 text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
          <p className="text-[var(--text-muted)] text-center mb-4">No polls yet</p>
          <Link
            href="/polls/new"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: '#bc0000', color: '#ffffff' }}
          >
            Create your first poll
          </Link>
        </div>
      )}

      {!loading && !error && polls.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}/edit`}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 hover:border-[var(--accent-red)] transition-colors"
            >
              <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2">{poll.question}</h3>
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[poll.status]}`}>
                  {poll.status}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {poll.total_votes || 0} votes
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
