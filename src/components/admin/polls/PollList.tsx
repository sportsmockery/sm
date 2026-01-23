'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Poll, PollStatus, PollType, ChicagoTeam } from '@/types/polls'
import { getTeamColors, TEAM_COLORS } from '@/types/polls'

interface PollListProps {
  initialPolls?: Poll[]
}

const STATUS_COLORS: Record<PollStatus, { bg: string; text: string; dot: string }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  scheduled: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  closed: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  archived: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
}

const POLL_TYPE_ICONS: Record<PollType, string> = {
  single: '🔘',
  multiple: '☑️',
  scale: '📊',
  emoji: '😊',
}

export default function PollList({ initialPolls = [] }: PollListProps) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const [loading, setLoading] = useState(!initialPolls.length)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<PollStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<PollType | 'all'>('all')
  const [teamFilter, setTeamFilter] = useState<ChicagoTeam | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPolls, setTotalPolls] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchPolls()
  }, [statusFilter, typeFilter, teamFilter, searchQuery, showArchived, page])

  async function fetchPolls() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (teamFilter && teamFilter !== 'all') params.set('team', teamFilter)
      if (searchQuery) params.set('search', searchQuery)
      if (showArchived) params.set('archived', 'true')
      params.set('limit', String(limit))
      params.set('offset', String((page - 1) * limit))

      const res = await fetch(`/api/polls?${params}`)
      if (!res.ok) throw new Error('Failed to fetch polls')

      const data = await res.json()
      setPolls(data.polls)
      setTotalPolls(data.total)
    } catch (err) {
      setError('Failed to load polls')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(pollId: string, newStatus: PollStatus) {
    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update poll')

      // Refresh list
      fetchPolls()
    } catch (err) {
      console.error('Error updating poll:', err)
    }
  }

  async function handleDelete(pollId: string, hard = false) {
    if (!confirm(hard ? 'Permanently delete this poll? This cannot be undone.' : 'Archive this poll?')) {
      return
    }

    try {
      const res = await fetch(`/api/polls/${pollId}${hard ? '?hard=true' : ''}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete poll')

      // Refresh list
      fetchPolls()
    } catch (err) {
      console.error('Error deleting poll:', err)
    }
  }

  function copyShortcode(pollId: string) {
    navigator.clipboard.writeText(`[poll:${pollId}]`)
    // Could add a toast notification here
  }

  const totalPages = Math.ceil(totalPolls / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Polls</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage interactive polls for your articles
          </p>
        </div>
        <Link
          href="/polls/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Poll
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PollStatus | 'all')}
          className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="closed">Closed</option>
        </select>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PollType | 'all')}
          className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="single">Single Choice</option>
          <option value="multiple">Multiple Choice</option>
          <option value="scale">Scale</option>
          <option value="emoji">Emoji</option>
        </select>

        {/* Team filter */}
        <select
          value={teamFilter || 'all'}
          onChange={(e) => setTeamFilter(e.target.value === 'all' ? 'all' : e.target.value as ChicagoTeam)}
          className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="all">All Teams</option>
          {Object.keys(TEAM_COLORS).filter(t => t !== 'default').map(team => (
            <option key={team} value={team}>
              {team.charAt(0).toUpperCase() + team.slice(1)}
            </option>
          ))}
        </select>

        {/* Show archived toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          Show archived
        </label>
      </div>

      {/* Poll list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : polls.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <span className="text-3xl">🗳️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No polls found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || teamFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first poll'}
          </p>
          {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && teamFilter === 'all' && (
            <Link
              href="/polls/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Create Poll
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Poll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Votes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {polls.map((poll, index) => {
                    const statusStyle = STATUS_COLORS[poll.status]
                    const teamColors = getTeamColors(poll.team_theme || null)

                    return (
                      <motion.tr
                        key={poll.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {poll.team_theme && (
                              <div
                                className="w-1 h-10 rounded-full"
                                style={{ backgroundColor: teamColors.primary }}
                              />
                            )}
                            <div>
                              <Link
                                href={`/polls/${poll.id}/edit`}
                                className="font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                              >
                                {poll.title || poll.question}
                              </Link>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {poll.question}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5">
                            <span>{POLL_TYPE_ICONS[poll.poll_type]}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {poll.poll_type}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {poll.total_votes.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(poll.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Copy shortcode */}
                            <button
                              onClick={() => copyShortcode(poll.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Copy shortcode"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>

                            {/* View results */}
                            <Link
                              href={`/polls/${poll.id}/results`}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="View results"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/polls/${poll.id}/edit`}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Edit poll"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>

                            {/* Status dropdown */}
                            <div className="relative group">
                              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <div className="py-1">
                                  {poll.status !== 'active' && (
                                    <button
                                      onClick={() => handleStatusChange(poll.id, 'active')}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                      Activate
                                    </button>
                                  )}
                                  {poll.status !== 'closed' && (
                                    <button
                                      onClick={() => handleStatusChange(poll.id, 'closed')}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                      Close Poll
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(poll.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    Archive
                                  </button>
                                  {poll.status === 'archived' && (
                                    <button
                                      onClick={() => handleDelete(poll.id, true)}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      Delete Permanently
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalPolls)} of {totalPolls} polls
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
