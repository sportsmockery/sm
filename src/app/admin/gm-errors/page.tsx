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
  resolved?: boolean
  resolved_at?: string
  sport?: string
  team_key?: string
}

interface ErrorStats {
  total: number
  unresolved: number
  resolved: number
}

const SOURCE_COLORS: Record<string, string> = {
  frontend: '#3b82f6',
  backend: '#ef4444',
  cron: '#8b5cf6',
  ai: '#eab308',
  audit: '#06b6d4',
}

const ERROR_TYPES = ['all', 'api', 'ai', 'network', 'timeout', 'parse', 'sync_result', 'sync_error', 'audit_result', 'audit_error', 'unknown']
const SOURCES = ['all', 'frontend', 'backend', 'cron', 'ai', 'audit']

const DATALAB_BASE = 'https://datalab.sportsmockery.com'

export default function GmErrorsPage() {
  const [gmErrors, setGmErrors] = useState<GmError[]>([])
  const [draftErrors, setDraftErrors] = useState<GmError[]>([])
  const [gmStats, setGmStats] = useState<ErrorStats | null>(null)
  const [draftStats, setDraftStats] = useState<ErrorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [activeTab, setActiveTab] = useState<'gm' | 'draft'>('gm')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  const fetchErrors = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      // Fetch GM Trade Simulator errors from Datalab
      const gmRes = await fetch(`${DATALAB_BASE}/api/gm/errors?resolved=${showResolved}&hours=72`)
      if (gmRes.ok) {
        const data = await gmRes.json()
        setGmErrors(data.errors || [])
        setGmStats(data.stats || null)
      }

      // Fetch Mock Draft errors from Datalab
      const draftRes = await fetch(`${DATALAB_BASE}/api/gm/draft/errors?resolved=${showResolved}`)
      if (draftRes.ok) {
        const data = await draftRes.json()
        setDraftErrors(data.errors || [])
        setDraftStats(data.stats || null)
      }
    } catch (e) {
      console.error('Failed to fetch errors from Datalab:', e)
      // Fall back to local endpoint
      try {
        const params = new URLSearchParams()
        if (filterType !== 'all') params.set('error_type', filterType)
        if (filterSource !== 'all') params.set('source', filterSource)
        const res = await fetch(`/api/gm/log-error?${params}`)
        if (res.ok) {
          const data = await res.json()
          setGmErrors(data.errors || [])
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLastRefresh(new Date())
    }
  }, [filterType, filterSource, showResolved])

  useEffect(() => {
    fetchErrors()
    const interval = setInterval(() => fetchErrors(), 60_000)
    return () => clearInterval(interval)
  }, [fetchErrors])

  // Filter errors based on current filters
  const filterErrors = (errors: GmError[]) => {
    return errors.filter(e => {
      if (filterType !== 'all' && e.error_type !== filterType) return false
      if (filterSource !== 'all' && e.source !== filterSource) return false
      return true
    })
  }

  const currentErrors = activeTab === 'gm' ? filterErrors(gmErrors) : filterErrors(draftErrors)
  const currentStats = activeTab === 'gm' ? gmStats : draftStats

  const cronResults = gmErrors.filter(e => e.source === 'cron')
  const auditResults = gmErrors.filter(e => e.source === 'audit')
  const errorCount = gmErrors.filter(e => !['sync_result', 'audit_result'].includes(e.error_type) && !e.resolved).length
  const draftErrorCount = draftErrors.filter(e => !e.resolved).length

  return (
    <div style={{ padding: '24px', maxWidth: 1400 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>GM Trade Simulator & Mock Draft — Errors</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
            Errors from Datalab API • Auto-fixed hourly • Trade simulator, mock draft, AI grading, roster syncs
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('gm')}
          style={{
            padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 'none',
            backgroundColor: activeTab === 'gm' ? '#fff' : '#f3f4f6',
            color: activeTab === 'gm' ? '#bc0000' : '#6b7280',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            borderBottom: activeTab === 'gm' ? '2px solid #bc0000' : 'none',
          }}
        >
          Trade Simulator {errorCount > 0 && <span style={{ marginLeft: 6, backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: '11px' }}>{errorCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          style={{
            padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 'none',
            backgroundColor: activeTab === 'draft' ? '#fff' : '#f3f4f6',
            color: activeTab === 'draft' ? '#bc0000' : '#6b7280',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            borderBottom: activeTab === 'draft' ? '2px solid #bc0000' : 'none',
          }}
        >
          Mock Draft {draftErrorCount > 0 && <span style={{ marginLeft: 6, backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: '11px' }}>{draftErrorCount}</span>}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        <SummaryCard label="Total Logs" value={currentStats?.total || currentErrors.length} color="#6b7280" />
        <SummaryCard label="Unresolved" value={currentStats?.unresolved || 0} color="#ef4444" />
        <SummaryCard label="Auto-Resolved" value={currentStats?.resolved || 0} color="#22c55e" />
        {activeTab === 'gm' && (
          <>
            <SummaryCard label="Cron Runs" value={cronResults.length} color="#8b5cf6" />
            <SummaryCard
              label="Last Cron"
              value={cronResults.length > 0 ? new Date(cronResults[0].created_at).toLocaleTimeString() : '—'}
              color="#22c55e"
              isText
            />
          </>
        )}
        {activeTab === 'draft' && (
          <>
            <SummaryCard label="Draft Errors" value={draftErrorCount} color="#f59e0b" />
            <SummaryCard
              label="Data Source"
              value="Datalab API"
              color="#06b6d4"
              isText
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
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
          {ERROR_TYPES.slice(0, 6).map(t => (
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={e => setShowResolved(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Show resolved</span>
        </label>
      </div>

      {/* Auto-fix info */}
      <div style={{
        padding: '10px 14px', borderRadius: 8, marginBottom: 16,
        backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: '16px' }}>🔄</span>
        <span style={{ fontSize: '12px', color: '#15803d' }}>
          <strong>Auto-fixing enabled:</strong> Datalab runs hourly cron jobs to automatically resolve test probes, logging bugs, and data integrity issues.
        </span>
      </div>

      {/* Error table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</div>
      ) : currentErrors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: '14px' }}>
          {showResolved ? 'No logs found for the selected filters.' : '✓ No unresolved errors! All clear.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {currentErrors.map(err => {
            const isExpanded = expandedId === err.id
            const sourceColor = SOURCE_COLORS[err.source] || '#6b7280'
            const isError = !['sync_result', 'audit_result'].includes(err.error_type)
            const isResolved = err.resolved
            return (
              <div
                key={err.id}
                onClick={() => setExpandedId(isExpanded ? null : err.id)}
                style={{
                  borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: isResolved ? '#f9fafb' : '#fff',
                  cursor: 'pointer', overflow: 'hidden',
                  opacity: isResolved ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                  {/* Resolved badge */}
                  {isResolved && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      backgroundColor: '#22c55e15', color: '#22c55e',
                      flexShrink: 0,
                    }}>
                      ✓ RESOLVED
                    </span>
                  )}
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
                  {/* Sport/Team badges */}
                  {err.sport && (
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                      backgroundColor: '#3b82f615', color: '#3b82f6',
                      flexShrink: 0, textTransform: 'uppercase',
                    }}>
                      {err.sport}
                    </span>
                  )}
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
                    {err.resolved_at && (
                      <div style={{ fontSize: '11px', color: '#22c55e', marginTop: 4 }}>
                        Resolved at: {new Date(err.resolved_at).toLocaleString()}
                      </div>
                    )}
                    {err.user_id && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 4 }}>
                        User: {err.user_id}
                      </div>
                    )}
                    {err.team_key && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 4 }}>
                        Team: {err.team_key} ({err.sport})
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
