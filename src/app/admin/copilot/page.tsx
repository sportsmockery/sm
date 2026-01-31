'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface AgentMetrics {
  agent: string
  total_requests: number
  avg_latency_ms: number
  p50_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  error_count: number
  error_rate: number
  last_24h_requests: number
  requests_by_day: Record<string, number>
}

interface MetricsTotals {
  total_requests: number
  total_errors: number
  avg_latency_ms: number
  last_24h_requests: number
}

interface FeatureFlag {
  id: string
  flag_name: string
  enabled: boolean
  rollout_percentage: number
  usage_24h: number
  metadata: {
    description?: string
    whitelist?: string[]
    last_emergency_rollback?: string
  }
  created_at: string
  updated_at: string
}

interface RollbackStatus {
  all_features_disabled: boolean
  enabled_feature_count: number
  total_feature_count: number
  last_emergency_rollback: {
    timestamp: string
    reason: string
    flags_disabled: string[]
  } | null
}

const API_BASE = 'https://datalab.sportsmockery.com'

const agentDescriptions: Record<string, string> = {
  scout: 'Scout AI - Chicago sports questions',
  gm: 'GM Trade Simulator - Trade grading',
  postiq: 'PostIQ - Content assistant',
  gm_auditor: 'GM Auditor - Trade grade verification',
  admin: 'Admin API requests',
}

export default function CopilotMonitoringPage() {
  const [metrics, setMetrics] = useState<AgentMetrics[]>([])
  const [totals, setTotals] = useState<MetricsTotals>({
    total_requests: 0,
    total_errors: 0,
    avg_latency_ms: 0,
    last_24h_requests: 0,
  })
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [rollbackStatus, setRollbackStatus] = useState<RollbackStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get access token
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        setAccessToken(session.access_token)
      } else {
        setError('Please sign in to access admin dashboard')
        setLoading(false)
      }
    }
    getSession()
  }, [supabase.auth])

  const headers = useCallback(() => ({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }), [accessToken])

  // Load all data
  const loadData = useCallback(async () => {
    if (!accessToken) return

    try {
      setLoading(true)
      setError(null)

      const [metricsRes, flagsRes, rollbackRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/copilot-metrics?days=7`, { headers: headers() }),
        fetch(`${API_BASE}/api/admin/feature-flags`, { headers: headers() }),
        fetch(`${API_BASE}/api/admin/emergency-rollback`, { headers: headers() }),
      ])

      // Check for auth errors
      if (metricsRes.status === 401 || flagsRes.status === 401 || rollbackRes.status === 401) {
        setError('Session expired. Please refresh and sign in again.')
        return
      }

      if (metricsRes.status === 403 || flagsRes.status === 403 || rollbackRes.status === 403) {
        setError('Access denied. Admin role required.')
        return
      }

      if (!metricsRes.ok || !flagsRes.ok || !rollbackRes.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const [metricsData, flagsData, rollbackData] = await Promise.all([
        metricsRes.json(),
        flagsRes.json(),
        rollbackRes.json(),
      ])

      setMetrics(metricsData.metrics || [])
      setTotals(metricsData.totals || {
        total_requests: 0,
        total_errors: 0,
        avg_latency_ms: 0,
        last_24h_requests: 0,
      })
      setFlags(flagsData.flags || [])
      setRollbackStatus(rollbackData)
    } catch (e: unknown) {
      console.error('[Copilot Dashboard] Error:', e)
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [accessToken, headers])

  useEffect(() => {
    if (accessToken) {
      loadData()
    }
  }, [accessToken, loadData])

  // Update a feature flag
  async function updateFlag(flagId: string, updates: Partial<FeatureFlag>) {
    if (!accessToken) return

    setUpdating(flagId)
    try {
      const response = await fetch(`${API_BASE}/api/admin/feature-flags`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ flag_id: flagId, ...updates }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update flag')
      }

      // Reload flags
      const flagsRes = await fetch(`${API_BASE}/api/admin/feature-flags`, { headers: headers() })
      const flagsData = await flagsRes.json()
      setFlags(flagsData.flags || [])
    } catch (e: unknown) {
      console.error('[Copilot Dashboard] Update flag error:', e)
      alert(e instanceof Error ? e.message : 'Failed to update flag')
    } finally {
      setUpdating(null)
    }
  }

  // Toggle flag enabled/disabled
  async function handleToggle(flagId: string, currentlyEnabled: boolean) {
    await updateFlag(flagId, { enabled: !currentlyEnabled })
  }

  // Update rollout percentage
  async function handleRolloutChange(flagId: string, percentage: number) {
    await updateFlag(flagId, { rollout_percentage: percentage })
  }

  // Emergency rollback
  async function handleEmergencyRollback() {
    const reason = prompt('Reason for emergency rollback:')
    if (!reason) return

    if (!confirm('DISABLE ALL v2 features? This affects ALL users immediately.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/emergency-rollback`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ reason }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Rollback complete. Disabled: ${result.flags_disabled?.join(', ') || 'all flags'}`)
        await loadData()
      } else {
        alert(`Rollback FAILED: ${result.error || 'Unknown error'}`)
      }
    } catch (e: unknown) {
      console.error('[Copilot Dashboard] Rollback error:', e)
      alert('Emergency rollback failed. Check console for details.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-red)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <h2 className="text-red-800 dark:text-red-300 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Copilot Monitoring</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            AI v2 system metrics, feature flags, and controls
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-primary)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <p className="text-sm text-[var(--text-muted)]">Total Requests (7d)</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {totals.total_requests?.toLocaleString() || 0}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <p className="text-sm text-[var(--text-muted)]">Last 24 Hours</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {totals.last_24h_requests?.toLocaleString() || 0}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <p className="text-sm text-[var(--text-muted)]">Avg Latency</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {totals.avg_latency_ms || 0}ms
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <p className="text-sm text-[var(--text-muted)]">Total Errors</p>
          <p className="text-3xl font-bold text-red-600">
            {totals.total_errors || 0}
          </p>
        </div>
      </div>

      {/* Agent Metrics */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Agent Metrics (7 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.agent} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
              <h3 className="text-lg font-semibold mb-1 capitalize flex items-center gap-2 text-[var(--text-primary)]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    metric.error_rate > 5 ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />
                {metric.agent.replace('_', ' ')}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {agentDescriptions[metric.agent] || 'AI agent'}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">Requests</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {metric.total_requests.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">Avg Latency</span>
                  <span className="font-semibold text-[var(--text-primary)]">{metric.avg_latency_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">P95 Latency</span>
                  <span className="font-semibold text-[var(--text-primary)]">{metric.p95_latency_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">Error Rate</span>
                  <span
                    className={`font-semibold ${
                      metric.error_rate > 5 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {metric.error_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] text-sm">Last 24h</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {metric.last_24h_requests.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {metrics.length === 0 && (
            <div className="col-span-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-center text-[var(--text-muted)]">
              No agent metrics available yet
            </div>
          )}
        </div>
      </section>

      {/* Feature Flags */}
      <section>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Feature Flags</h2>
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold font-mono text-[var(--text-primary)]">
                    {flag.flag_name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {flag.metadata?.description || 'No description'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {flag.usage_24h.toLocaleString()} requests in last 24h
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      flag.enabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggle(flag.id, flag.enabled)}
                    disabled={updating === flag.id}
                    className="px-3 py-1 text-sm rounded border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 text-[var(--text-primary)]"
                  >
                    {updating === flag.id ? 'Updating...' : flag.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[var(--text-muted)] w-20">Rollout:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={flag.rollout_percentage}
                  onChange={(e) => handleRolloutChange(flag.id, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent-red)]"
                  disabled={!flag.enabled || updating === flag.id}
                />
                <span className="text-sm font-semibold w-12 text-right text-[var(--text-primary)]">
                  {flag.rollout_percentage}%
                </span>
              </div>

              {/* Rollout presets */}
              <div className="flex gap-2 mt-3">
                {[0, 5, 10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleRolloutChange(flag.id, pct)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      flag.rollout_percentage === pct
                        ? 'bg-[var(--accent-red)] text-white'
                        : 'bg-[var(--bg-hover)] hover:bg-[var(--border-default)] text-[var(--text-primary)]'
                    }`}
                    disabled={!flag.enabled || updating === flag.id}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          ))}
          {flags.length === 0 && (
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-center text-[var(--text-muted)]">
              No feature flags configured
            </div>
          )}
        </div>
      </section>

      {/* Emergency Rollback */}
      <section className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
              Emergency Rollback
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4 max-w-2xl">
              Instantly disable ALL v2 features. All users will fall back to legacy endpoints.
              Use only when critical issues are detected in production.
            </p>
            {rollbackStatus?.last_emergency_rollback && (
              <p className="text-xs text-red-600 dark:text-red-500">
                Last rollback: {new Date(rollbackStatus.last_emergency_rollback.timestamp).toLocaleString()}
                {rollbackStatus.last_emergency_rollback.reason && ` - "${rollbackStatus.last_emergency_rollback.reason}"`}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {rollbackStatus && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  rollbackStatus.all_features_disabled
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                }`}
              >
                {rollbackStatus.enabled_feature_count}/{rollbackStatus.total_feature_count} enabled
              </span>
            )}
            <button
              onClick={handleEmergencyRollback}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Disable All V2 Features
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
