'use client'

import { useState, useEffect, useCallback } from 'react'

interface HttpCheck {
  page: string
  status: number
  ok: boolean
}

interface DataChecks {
  recordTableExists: boolean
  gamesCount: number
  rosterCount: number
  rosterInRange: boolean
  issues: string[]
}

interface TeamResult {
  team: string
  timestamp: string
  httpChecks: HttpCheck[]
  dataChecks: DataChecks
  overallStatus: 'healthy' | 'warning' | 'error'
}

interface HealthCheckResponse {
  success: boolean
  overallStatus: 'healthy' | 'warning' | 'error'
  teamsChecked: number
  issuesFound: number
  issues?: string[]
  results: TeamResult[]
  duration: string
  timestamp: string
  error?: string
}

const TEAM_DISPLAY_NAMES: Record<string, string> = {
  'chicago-bears': 'Bears',
  'chicago-bulls': 'Bulls',
  'chicago-blackhawks': 'Blackhawks',
  'chicago-cubs': 'Cubs',
  'chicago-white-sox': 'White Sox',
}

const TEAM_COLORS: Record<string, string> = {
  'chicago-bears': '#0B162A',
  'chicago-bulls': '#CE1141',
  'chicago-blackhawks': '#CF0A2C',
  'chicago-cubs': '#0E3386',
  'chicago-white-sox': '#27251F',
}

export default function TeamPagesSyncPage() {
  const [data, setData] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchHealthCheck = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true)
    }
    setError(null)

    try {
      const response = await fetch('/api/cron/team-pages-health')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch health check data')
      }

      setData(result)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHealthCheck()

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchHealthCheck(), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchHealthCheck])

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-500 bg-emerald-500/10'
      case 'warning':
        return 'text-amber-500 bg-amber-500/10'
      case 'error':
        return 'text-red-500 bg-red-500/10'
    }
  }

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[var(--text-muted)]">Running health check...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <svg className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-500 mb-2">Health Check Failed</h3>
        <p className="text-[var(--text-muted)] mb-4">{error}</p>
        <button
          onClick={() => fetchHealthCheck(true)}
          className="px-4 py-2 rounded-lg bg-[var(--accent-red)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Team Pages Sync</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Monitor data synchronization between frontend and Data Lab
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-sm text-[var(--text-muted)]">
              Last check: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchHealthCheck(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-red)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {refreshing ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            )}
            {refreshing ? 'Checking...' : 'Run Check'}
          </button>
        </div>
      </div>

      {/* Overall Status */}
      {data && (
        <div className={`rounded-xl border p-6 ${
          data.overallStatus === 'healthy'
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : data.overallStatus === 'warning'
              ? 'border-amber-500/20 bg-amber-500/5'
              : 'border-red-500/20 bg-red-500/5'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getStatusColor(data.overallStatus)}`}>
              {getStatusIcon(data.overallStatus)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {data.overallStatus === 'healthy'
                  ? 'All Systems Healthy'
                  : data.overallStatus === 'warning'
                    ? 'Some Issues Detected'
                    : 'Critical Issues Found'}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {data.teamsChecked} teams checked | {data.issuesFound} issues found | {data.duration}
              </p>
            </div>
          </div>

          {data.issues && data.issues.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Issues Summary:</h3>
              <ul className="space-y-1">
                {data.issues.map((issue, i) => (
                  <li key={i} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">*</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Team Cards */}
      {data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.results.map((result) => (
            <div
              key={result.team}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden"
            >
              {/* Team Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ backgroundColor: TEAM_COLORS[result.team] + '15' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: TEAM_COLORS[result.team] }}
                  >
                    {TEAM_DISPLAY_NAMES[result.team]?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {TEAM_DISPLAY_NAMES[result.team] || result.team}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(result.overallStatus)}`}>
                  {getStatusIcon(result.overallStatus)}
                  <span className="capitalize">{result.overallStatus}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* HTTP Checks */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Page Status
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {result.httpChecks.map((check) => (
                      <div
                        key={check.page}
                        className={`text-center p-2 rounded-lg text-xs ${
                          check.ok
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        <div className="font-medium">
                          {check.page.split('/').pop() || 'home'}
                        </div>
                        <div className="opacity-70">{check.status || 'ERR'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Checks */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Data Status
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-2 rounded-lg ${
                      result.dataChecks.recordTableExists
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      <div className="text-xs opacity-70">Record</div>
                      <div className="font-medium">{result.dataChecks.recordTableExists ? 'OK' : 'ERR'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
                      <div className="text-xs text-[var(--text-muted)]">Games</div>
                      <div className="font-medium text-[var(--text-primary)]">{result.dataChecks.gamesCount}</div>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      result.dataChecks.rosterInRange
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      <div className="text-xs opacity-70">Roster</div>
                      <div className="font-medium">{result.dataChecks.rosterCount}</div>
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {result.dataChecks.issues.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                      Issues
                    </h4>
                    <ul className="space-y-1">
                      {result.dataChecks.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-amber-500 flex items-start gap-1.5">
                          <svg className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Automated Sync Schedule</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
            <div className="text-sm font-medium text-[var(--text-primary)]">Health Check</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Every hour at :15</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
            <div className="text-sm font-medium text-[var(--text-primary)]">Team Sync</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Every hour at :00</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
            <div className="text-sm font-medium text-[var(--text-primary)]">Bears Data</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Every hour at :30</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
            <div className="text-sm font-medium text-[var(--text-primary)]">Live Games</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Every minute</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">What This Page Monitors</h3>
          <ul className="text-sm text-[var(--text-muted)] space-y-1">
            <li>* HTTP status of all team pages (schedule, scores, stats, roster, players)</li>
            <li>* Correct table names used (bears_season_record, not bears_seasons)</li>
            <li>* Correct column names (otl not ot_losses, is_current_bulls not is_active)</li>
            <li>* Roster counts within expected ranges per league</li>
            <li>* Season values using correct conventions (NFL/MLB=starting year, NBA/NHL=ending year)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
