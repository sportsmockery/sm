'use client'

import { useState, useEffect, useCallback } from 'react'

interface QueryLog {
  id: string
  query: string
  team: string | null
  team_display_name: string | null
  external_source_used: string
  response_received: string | null
  validation_source_1: string | null
  validation_source_1_result: string | null
  validation_source_2: string | null
  validation_source_2_result: string | null
  validation_source_3: string | null
  validation_source_3_result: string | null
  is_validated: boolean
  validation_match_score: number | null
  data_imported: boolean
  import_table: string | null
  created_at: string
}

interface Stats {
  totalQueries: number
  validatedQueries: number
  importedQueries: number
  byTeam: Record<string, { total: number; validated: number; imported: number }>
}

interface TeamData {
  id: string
  data_type: string
  data_key: string
  data_value: Record<string, any>
  external_source: string
  validation_sources: string[]
  confidence_score: number
  created_at: string
}

const TEAMS = [
  { value: '', label: 'All Teams' },
  { value: 'bears', label: 'Bears' },
  { value: 'bulls', label: 'Bulls' },
  { value: 'cubs', label: 'Cubs' },
  { value: 'whitesox', label: 'White Sox' },
  { value: 'blackhawks', label: 'Blackhawks' },
]

export default function AILoggingPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'data' | 'stats'>('logs')
  const [logs, setLogs] = useState<QueryLog[]>([])
  const [teamData, setTeamData] = useState<TeamData[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [filterValidated, setFilterValidated] = useState<string>('')
  const [filterImported, setFilterImported] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const limit = 20

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'logs',
        limit: limit.toString(),
        offset: (page * limit).toString(),
      })
      if (selectedTeam) params.set('team', selectedTeam)
      if (filterValidated) params.set('validated', filterValidated)
      if (filterImported) params.set('imported', filterImported)

      const response = await fetch(`/api/admin/ai-logging?${params}`)
      const data = await response.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTeam, filterValidated, filterImported, page])

  const fetchTeamData = useCallback(async () => {
    if (!selectedTeam) {
      setTeamData([])
      return
    }
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        action: 'team-data',
        team: selectedTeam,
        limit: '100',
      })
      const response = await fetch(`/api/admin/ai-logging?${params}`)
      const data = await response.json()
      setTeamData(data.data || [])
    } catch (error) {
      console.error('Error fetching team data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTeam])

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/ai-logging?action=stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs()
    } else if (activeTab === 'data') {
      fetchTeamData()
    } else if (activeTab === 'stats') {
      fetchStats()
    }
  }, [activeTab, fetchLogs, fetchTeamData, fetchStats])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getTeamColor = (team: string | null) => {
    const colors: Record<string, string> = {
      bears: 'bg-[#0B162A]',
      bulls: 'bg-[#CE1141]',
      cubs: 'bg-[#0E3386]',
      whitesox: 'bg-[#27251F]',
      blackhawks: 'bg-[#CF0A2C]',
    }
    return colors[team?.toLowerCase() || ''] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI External Source Logging</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Track and manage AI queries that required external data sources
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-default)]">
        <nav className="flex gap-4">
          {[
            { id: 'logs', label: 'Query Logs' },
            { id: 'data', label: 'Imported Data' },
            { id: 'stats', label: 'Statistics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[var(--accent-red)] text-[var(--accent-red)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedTeam}
          onChange={(e) => {
            setSelectedTeam(e.target.value)
            setPage(0)
          }}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          {TEAMS.map((team) => (
            <option key={team.value} value={team.value}>
              {team.label}
            </option>
          ))}
        </select>

        {activeTab === 'logs' && (
          <>
            <select
              value={filterValidated}
              onChange={(e) => {
                setFilterValidated(e.target.value)
                setPage(0)
              }}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="">All Validation Status</option>
              <option value="true">Validated</option>
              <option value="false">Not Validated</option>
            </select>

            <select
              value={filterImported}
              onChange={(e) => {
                setFilterImported(e.target.value)
                setPage(0)
              }}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="">All Import Status</option>
              <option value="true">Imported</option>
              <option value="false">Not Imported</option>
            </select>
          </>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          {/* Query Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center">
                  <p className="text-[var(--text-muted)]">No query logs found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden"
                      >
                        <div
                          className="p-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {log.team && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getTeamColor(log.team)}`}>
                                    {log.team_display_name || log.team}
                                  </span>
                                )}
                                <span className="text-xs text-[var(--text-muted)]">
                                  {formatDate(log.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--text-primary)] font-medium truncate">
                                {log.query}
                              </p>
                              <p className="text-xs text-[var(--text-muted)] mt-1">
                                Source: {log.external_source_used}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {log.is_validated ? (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Validated
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  Pending
                                </span>
                              )}
                              {log.data_imported && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  Imported
                                </span>
                              )}
                              <svg
                                className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expandedLog === log.id ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedLog === log.id && (
                          <div className="border-t border-[var(--border-default)] p-4 bg-[var(--bg-tertiary)]">
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Response */}
                              <div>
                                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Response</h4>
                                <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] p-3 rounded-lg max-h-40 overflow-y-auto">
                                  {log.response_received || 'No response recorded'}
                                </p>
                              </div>

                              {/* Validation Sources */}
                              <div>
                                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Validation Sources</h4>
                                <div className="space-y-2">
                                  {log.validation_source_1 && (
                                    <div className="bg-[var(--bg-card)] p-3 rounded-lg">
                                      <p className="text-xs font-medium text-[var(--text-primary)]">{log.validation_source_1}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-1">{log.validation_source_1_result || 'No result'}</p>
                                    </div>
                                  )}
                                  {log.validation_source_2 && (
                                    <div className="bg-[var(--bg-card)] p-3 rounded-lg">
                                      <p className="text-xs font-medium text-[var(--text-primary)]">{log.validation_source_2}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-1">{log.validation_source_2_result || 'No result'}</p>
                                    </div>
                                  )}
                                  {log.validation_source_3 && (
                                    <div className="bg-[var(--bg-card)] p-3 rounded-lg">
                                      <p className="text-xs font-medium text-[var(--text-primary)]">{log.validation_source_3}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-1">{log.validation_source_3_result || 'No result'}</p>
                                    </div>
                                  )}
                                  {!log.validation_source_1 && !log.validation_source_2 && (
                                    <p className="text-sm text-[var(--text-muted)]">No validation performed yet</p>
                                  )}
                                </div>
                              </div>

                              {/* Match Score */}
                              {log.validation_match_score !== null && (
                                <div>
                                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Validation Score</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          log.validation_match_score >= 0.8
                                            ? 'bg-green-500'
                                            : log.validation_match_score >= 0.5
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                        }`}
                                        style={{ width: `${log.validation_match_score * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">
                                      {(log.validation_match_score * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Import Info */}
                              {log.data_imported && log.import_table && (
                                <div>
                                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Import Details</h4>
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    Imported to: <code className="bg-[var(--bg-card)] px-2 py-1 rounded">{log.import_table}</code>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-[var(--text-muted)]">
                      Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={(page + 1) * limit >= total}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Imported Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {!selectedTeam ? (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center">
                  <p className="text-[var(--text-muted)]">Select a team to view imported AI data</p>
                </div>
              ) : teamData.length === 0 ? (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center">
                  <p className="text-[var(--text-muted)]">No imported data found for {selectedTeam}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-tertiary)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">Key</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">Confidence</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {teamData.map((data) => (
                        <tr key={data.id} className="hover:bg-[var(--bg-hover)]">
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full bg-[var(--accent-red-glow)] text-[var(--accent-red)] text-xs font-medium">
                              {data.data_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-primary)] max-w-xs truncate">
                            {data.data_key}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                            {data.external_source}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    data.confidence_score >= 0.8
                                      ? 'bg-green-500'
                                      : data.confidence_score >= 0.5
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${data.confidence_score * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-[var(--text-muted)]">
                                {(data.confidence_score * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                            {formatDate(data.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
                  <p className="text-sm text-[var(--text-muted)]">Total Queries</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{stats.totalQueries}</p>
                </div>
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
                  <p className="text-sm text-[var(--text-muted)]">Validated</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">{stats.validatedQueries}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {stats.totalQueries > 0 ? ((stats.validatedQueries / stats.totalQueries) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
                  <p className="text-sm text-[var(--text-muted)]">Imported</p>
                  <p className="text-3xl font-bold text-blue-500 mt-1">{stats.importedQueries}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {stats.totalQueries > 0 ? ((stats.importedQueries / stats.totalQueries) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
                  <p className="text-sm text-[var(--text-muted)]">Pending Validation</p>
                  <p className="text-3xl font-bold text-yellow-500 mt-1">
                    {stats.totalQueries - stats.validatedQueries}
                  </p>
                </div>
              </div>

              {/* By Team Breakdown */}
              <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
                <div className="border-b border-[var(--border-default)] px-6 py-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">Queries by Team</h3>
                </div>
                <div className="p-6">
                  {Object.keys(stats.byTeam).length === 0 ? (
                    <p className="text-[var(--text-muted)]">No team data available</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(stats.byTeam).map(([team, teamStats]) => (
                        <div key={team} className="flex items-center gap-4">
                          <span className={`w-24 px-2 py-1 rounded text-xs font-medium text-white text-center ${getTeamColor(team)}`}>
                            {team}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 h-4 bg-[var(--bg-tertiary)] rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${(teamStats.validated / Math.max(teamStats.total, 1)) * 100}%` }}
                                  title="Validated"
                                />
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${((teamStats.imported) / Math.max(teamStats.total, 1)) * 100}%` }}
                                  title="Imported"
                                />
                              </div>
                              <span className="text-sm font-medium text-[var(--text-primary)] w-12 text-right">
                                {teamStats.total}
                              </span>
                            </div>
                            <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                {teamStats.validated} validated
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                {teamStats.imported} imported
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
