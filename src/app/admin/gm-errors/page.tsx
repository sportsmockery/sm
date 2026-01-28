'use client'

import { useState, useEffect, useCallback } from 'react'

interface GmError {
  id: string
  created_at: string
  source: string
  error_type: string
  error_message: string
  user_id: string | null
  route: string | null
  request_payload: any
  metadata: any
}

const SOURCE_COLORS: Record<string, string> = {
  frontend: '#3b82f6',
  backend: '#ef4444',
  cron: '#8b5cf6',
  ai: '#eab308',
}

const ERROR_TYPES = ['all', 'api', 'ai', 'network', 'timeout', 'parse', 'sync_result', 'sync_error', 'unknown']
const SOURCES = ['all', 'frontend', 'backend', 'cron', 'ai']

export default function GmErrorsPage() {
  const [errors, setErrors] = useState<GmError[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchErrors = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.set('error_type', filterType)
      if (filterSource !== 'all') params.set('source', filterSource)
      const res = await fetch(`/api/gm/log-error?${params}`)
      if (res.ok) {
        const data = await res.json()
        setErrors(data.errors || [])
      }
    } catch (e) {
      console.error('Failed to fetch GM errors:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLastRefresh(new Date())
    }
  }, [filterType, filterSource])

  useEffect(() => {
    fetchErrors()
    const interval = setInterval(() => fetchErrors(), 60_000)
    return () => clearInterval(interval)
  }, [fetchErrors])

  const cronResults = errors.filter(e => e.source === 'cron')
  const recentErrors = errors.filter(e => e.source !== 'cron' || e.error_type === 'sync_error')
  const errorCount = errors.filter(e => e.error_type !== 'sync_result').length
  const cronCount = cronResults.length

  return (
    <div style={{ padding: '24px', maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>GM Trade Simulator — Errors & Logs</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
            Trade simulator errors, AI grading failures, and cron sync results
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastRefresh && (
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchErrors(true)}
            disabled={refreshing}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              backgroundColor: '#bc0000', color: '#fff',
              fontWeight: 600, fontSize: '13px', cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <SummaryCard label="Total Logs" value={errors.length} color="#6b7280" />
        <SummaryCard label="Errors" value={errorCount} color="#ef4444" />
        <SummaryCard label="Cron Runs" value={cronCount} color="#8b5cf6" />
        <SummaryCard
          label="Last Cron"
          value={cronResults.length > 0 ? new Date(cronResults[0].created_at).toLocaleTimeString() : '—'}
          color="#22c55e"
          isText
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Source:</span>
          {SOURCES.map(s => (
            <button
              key={s}
              onClick={() => setFilterSource(s)}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                backgroundColor: filterSource === s ? '#bc0000' : '#e5e7eb',
                color: filterSource === s ? '#fff' : '#6b7280',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Type:</span>
          {ERROR_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 600,
                backgroundColor: filterType === t ? '#bc0000' : '#e5e7eb',
                color: filterType === t ? '#fff' : '#6b7280',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</div>
      ) : errors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: '14px' }}>
          No logs found for the selected filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {errors.map(err => {
            const isExpanded = expandedId === err.id
            const sourceColor = SOURCE_COLORS[err.source] || '#6b7280'
            const isError = err.error_type !== 'sync_result'
            return (
              <div
                key={err.id}
                onClick={() => setExpandedId(isExpanded ? null : err.id)}
                style={{
                  borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: '#fff',
                  cursor: 'pointer', overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                  {/* Source badge */}
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    backgroundColor: `${sourceColor}15`, color: sourceColor,
                    textTransform: 'uppercase', flexShrink: 0,
                  }}>
                    {err.source}
                  </span>
                  {/* Type badge */}
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                    backgroundColor: isError ? '#ef444415' : '#22c55e15',
                    color: isError ? '#ef4444' : '#22c55e',
                    flexShrink: 0,
                  }}>
                    {err.error_type}
                  </span>
                  {/* Message */}
                  <span style={{
                    flex: 1, fontSize: '13px', color: '#1a1a1a', fontWeight: 500,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {err.error_message}
                  </span>
                  {/* Route */}
                  {err.route && (
                    <span style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0 }}>
                      {err.route}
                    </span>
                  )}
                  {/* Timestamp */}
                  <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>
                    {new Date(err.created_at).toLocaleString()}
                  </span>
                </div>
                {isExpanded && (
                  <div style={{ padding: '0 14px 12px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.6, marginTop: 8 }}>
                      <strong>Message:</strong> {err.error_message}
                    </div>
                    {err.user_id && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 4 }}>
                        User: {err.user_id}
                      </div>
                    )}
                    {err.request_payload && (
                      <pre style={{
                        fontSize: '11px', color: '#6b7280', marginTop: 8,
                        backgroundColor: '#f9fafb', padding: 8, borderRadius: 6,
                        overflow: 'auto', maxHeight: 200,
                      }}>
                        {JSON.stringify(err.request_payload, null, 2)}
                      </pre>
                    )}
                    {err.metadata && (
                      <pre style={{
                        fontSize: '11px', color: '#6b7280', marginTop: 8,
                        backgroundColor: '#f9fafb', padding: 8, borderRadius: 6,
                        overflow: 'auto', maxHeight: 200,
                      }}>
                        {JSON.stringify(err.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color, isText }: { label: string; value: number | string; color: string; isText?: boolean }) {
  return (
    <div style={{
      padding: '16px', borderRadius: 10, backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: isText ? '14px' : '28px', fontWeight: 800, color }}>
        {value}
      </div>
    </div>
  )
}
