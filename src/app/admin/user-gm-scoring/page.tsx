'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface UserGMScore {
  user_id: string
  email: string | null
  display_name: string | null
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  average_grade: number
  total_gm_score: number
  highest_grade: number
  lowest_grade: number
  last_trade_at: string | null
}

interface PaginatedResponse {
  users: UserGMScore[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function UserGMScoringPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('total_gm_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const subText = isDark ? '#9ca3af' : '#6b7280'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        sortBy,
        sortOrder,
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/gm-scoring?${params}`)
      if (!res.ok) {
        if (res.status === 403) {
          setError('Admin access required')
          return
        }
        throw new Error('Failed to fetch data')
      }

      const result = await res.json()
      setData(result)
    } catch (e) {
      setError('Failed to load GM scoring data')
    } finally {
      setLoading(false)
    }
  }, [page, search, sortBy, sortOrder])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchData()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  function getLetterGrade(grade: number): string {
    if (grade >= 90) return 'A'
    if (grade >= 80) return 'B+'
    if (grade >= 70) return 'B'
    if (grade >= 60) return 'C'
    if (grade >= 50) return 'D'
    return 'F'
  }

  function getGradeColor(grade: number): string {
    if (grade >= 90) return '#10b981'
    if (grade >= 80) return '#22c55e'
    if (grade >= 70) return '#84cc16'
    if (grade >= 60) return '#f59e0b'
    if (grade >= 50) return '#f97316'
    return '#ef4444'
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const SortIcon = ({ field }: { field: string }) => (
    <span style={{ marginLeft: 4, opacity: sortBy === field ? 1 : 0.3 }}>
      {sortBy === field && sortOrder === 'asc' ? '↑' : '↓'}
    </span>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          User GM Scoring
        </h1>
        <p style={{ fontSize: '14px', color: subText }}>
          View and analyze GM trade performance across all users
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          backgroundColor: '#ef444420',
          border: '1px solid #ef444440',
          color: '#ef4444',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {/* Search and Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Search by email or user ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
              backgroundColor: isDark ? '#374151' : '#fff',
              color: isDark ? '#fff' : '#000',
              fontSize: '14px',
            }}
          />
        </div>
        {data && (
          <div style={{ fontSize: '13px', color: subText }}>
            {data.total} users found
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        borderRadius: 12,
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        overflow: 'hidden',
        backgroundColor: isDark ? '#1f2937' : '#fff',
      }}>
        {loading && !data ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="w-6 h-6 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    User
                  </th>
                  <th
                    style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => handleSort('total_gm_score')}
                  >
                    GM Score <SortIcon field="total_gm_score" />
                  </th>
                  <th
                    style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => handleSort('total_trades')}
                  >
                    Trades <SortIcon field="total_trades" />
                  </th>
                  <th
                    style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => handleSort('accepted_trades')}
                  >
                    Accepted <SortIcon field="accepted_trades" />
                  </th>
                  <th
                    style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => handleSort('average_grade')}
                  >
                    Avg Grade <SortIcon field="average_grade" />
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    Best/Worst
                  </th>
                  <th
                    style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => handleSort('last_trade_at')}
                  >
                    Last Active <SortIcon field="last_trade_at" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user, i) => (
                  <tr
                    key={user.user_id}
                    style={{
                      borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      backgroundColor: i % 2 === 0 ? 'transparent' : (isDark ? '#374151/30' : '#f9fafb'),
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.display_name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '11px', color: subText }}>
                        {user.email || user.user_id.slice(0, 8)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: '#bc0000' }}>
                        {user.total_gm_score.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-primary)' }}>
                      {user.total_trades}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{user.accepted_trades}</span>
                      <span style={{ color: subText }}> / </span>
                      <span style={{ color: '#ef4444' }}>{user.rejected_trades}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 6,
                          backgroundColor: getGradeColor(user.average_grade) + '20',
                          color: getGradeColor(user.average_grade),
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {getLetterGrade(user.average_grade)} ({user.average_grade})
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{user.highest_grade}</span>
                      <span style={{ color: subText }}> / </span>
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{user.lowest_grade}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: subText, fontSize: '12px' }}>
                      {formatDate(user.last_trade_at)}
                    </td>
                  </tr>
                ))}
                {data?.users.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: subText }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
              backgroundColor: isDark ? '#374151' : '#fff',
              color: page === 1 ? subText : 'var(--text-primary)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '13px', color: subText }}>
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
              backgroundColor: isDark ? '#374151' : '#fff',
              color: page === data.totalPages ? subText : 'var(--text-primary)',
              cursor: page === data.totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
