'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  SUBMISSION_STATUSES, TEAM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS,
  TEAM_ACCENT_COLORS,
  type Team, type ContentType, type SubmissionStatus,
  type FanSubmission, type FanCreator, type FanSubmissionAsset,
} from '@/types/fan-showcase'

type SubmissionRow = FanSubmission & {
  creator: FanCreator
  assets: FanSubmissionAsset[]
}

interface AdminData {
  submissions: SubmissionRow[]
  statusCounts: Record<string, number>
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export default function AdminShowcaseList() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  // Filters
  const [status, setStatus] = useState<string>('all')
  const [team, setTeam] = useState<string>('all')
  const [type, setType] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      if (team !== 'all') params.set('team', team)
      if (type !== 'all') params.set('type', type)
      if (search) params.set('search', search)
      params.set('page', String(page))

      const res = await fetch(`/api/admin/fan-showcase?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }, [status, team, type, search, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (!data) return
    if (selected.size === data.submissions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(data.submissions.map(s => s.id)))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selected.size === 0) return
    setBulkLoading(true)
    try {
      const res = await fetch('/api/admin/fan-showcase/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], action }),
      })
      if (res.ok) {
        setSelected(new Set())
        fetchData()
      }
    } catch (err) {
      console.error('Bulk action failed:', err)
    } finally {
      setBulkLoading(false)
    }
  }

  const statusColor = (s: SubmissionStatus) => {
    switch (s) {
      case 'pending_review': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      case 'approved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'featured': return 'bg-[#D6B05E]/20 text-[#D6B05E] dark:bg-[#D6B05E]/20 dark:text-[#D6B05E]'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'changes_requested': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'archived': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Fan Showcase</h1>
        <p className="mt-1 text-[var(--text-muted)]">Review and manage fan submissions</p>
      </div>

      {/* Status counts */}
      {data?.statusCounts && (
        <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {['all', ...SUBMISSION_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`rounded-xl border p-3 text-left transition-all ${
                status === s
                  ? 'border-[#BC0000] bg-[#BC0000]/10'
                  : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-strong)]'
              }`}
            >
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {data.statusCounts[s] || 0}
              </p>
              <p className="text-[13px] text-[var(--text-muted)]">
                {s === 'all' ? 'All' : STATUS_LABELS[s as SubmissionStatus]}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
        <input
          type="search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search title, creator, email..."
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#BC0000] focus:outline-none focus:ring-1 focus:ring-[#BC0000]"
        />
        <select
          value={team}
          onChange={e => { setTeam(e.target.value); setPage(1) }}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <option value="all">All Teams</option>
          {Object.entries(TEAM_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={e => { setType(e.target.value); setPage(1) }}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <option value="all">All Types</option>
          {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-secondary)] px-4 py-3">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {selected.size} selected
          </span>
          <button
            onClick={() => handleBulkAction('approve')}
            disabled={bulkLoading}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#00D4FF' }}
          >
            Approve
          </button>
          <button
            onClick={() => handleBulkAction('reject')}
            disabled={bulkLoading}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#BC0000' }}
          >
            Reject
          </button>
          <button
            onClick={() => handleBulkAction('feature')}
            disabled={bulkLoading}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#D6B05E' }}
          >
            Feature
          </button>
          <button
            onClick={() => handleBulkAction('unfeature')}
            disabled={bulkLoading}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] disabled:opacity-50"
          >
            Unfeature
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        {loading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>
        ) : !data?.submissions?.length ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No submissions found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border-default)] text-[13px] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === data.submissions.length && data.submissions.length > 0}
                    onChange={toggleAll}
                    className="accent-[#BC0000]"
                  />
                </th>
                <th className="px-4 py-3">Thumbnail</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Creator</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {data.submissions.map(sub => {
                const thumb = sub.assets?.[0]?.thumbnail_url || sub.assets?.[0]?.asset_url
                return (
                  <tr key={sub.id} className="hover:bg-[var(--bg-hover)] transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(sub.id)}
                        onChange={() => toggleSelect(sub.id)}
                        className="accent-[#BC0000]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt=""
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[13px] text-[var(--text-muted)]">
                          {CONTENT_TYPE_LABELS[sub.type as ContentType]?.[0]}
                        </div>
                      )}
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <Link
                        href={`/admin/fan-showcase/${sub.id}`}
                        className="font-medium text-[var(--text-primary)] hover:text-[#BC0000] line-clamp-1"
                      >
                        {sub.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-[var(--text-primary)]">{sub.creator?.display_name}</span>
                        {sub.creator?.handle && (
                          <span className="block text-[13px] text-[var(--text-muted)]">@{sub.creator.handle}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: TEAM_ACCENT_COLORS[sub.team as Team] }}
                        title={TEAM_LABELS[sub.team as Team]}
                      />
                      <span className="ml-1.5 text-[var(--text-primary)]">
                        {TEAM_LABELS[sub.team as Team]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {CONTENT_TYPE_LABELS[sub.type as ContentType]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[13px] font-medium ${statusColor(sub.status as SubmissionStatus)}`}>
                        {STATUS_LABELS[sub.status as SubmissionStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {sub.ai_non_chicago_flag && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" title="Non-Chicago content detected">
                            NON-CHI
                          </span>
                        )}
                        {sub.ai_safety_flag && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300" title="Safety flag">
                            SAFETY
                          </span>
                        )}
                        {sub.ai_relevance_score != null && (
                          <span className="text-[13px] text-[var(--text-muted)]" title={`Relevance: ${sub.ai_relevance_score}`}>
                            {Math.round(sub.ai_relevance_score)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[var(--text-muted)]">
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1}&ndash;
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.totalPages}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
