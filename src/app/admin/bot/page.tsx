'use client'

import { useState, useEffect, useCallback } from 'react'

// Types for bot data
interface BotStatus {
  team_slug: string
  enabled: boolean
  community_id: string | null
  today_replies: number
  today_posts: number
  daily_reply_limit: number
  daily_post_limit: number
  can_reply: boolean
  can_post: boolean
  pending_responses: number
}

interface BotConfig {
  id: number
  team_slug: string
  community_id: string | null
  enabled: boolean
  daily_reply_limit: number
  daily_post_limit: number
  min_delay_seconds: number
  max_delay_seconds: number
  system_prompt: string | null
}

interface BotLog {
  id: number
  team_slug: string | null
  log_level: string
  action: string
  message: string | null
  created_at: string
}

interface PendingResponse {
  id: number
  team_slug: string
  response_type: string
  content: string
  in_reply_to_tweet_id: string | null
  status: string
  created_at: string
}

const TEAM_DISPLAY: Record<string, { name: string; emoji: string; color: string }> = {
  'chicago-bears': { name: 'Bears', emoji: '🐻', color: '#0B162A' },
  'chicago-bulls': { name: 'Bulls', emoji: '🐂', color: '#CE1141' },
  'chicago-cubs': { name: 'Cubs', emoji: '🧸', color: '#0E3386' },
  'chicago-white-sox': { name: 'White Sox', emoji: '⚾', color: '#27251F' },
  'chicago-blackhawks': { name: 'Blackhawks', emoji: '🏒', color: '#CF0A2C' },
}

export default function BotAdminPage() {
  const [statuses, setStatuses] = useState<BotStatus[]>([])
  const [configs, setConfigs] = useState<BotConfig[]>([])
  const [logs, setLogs] = useState<BotLog[]>([])
  const [pendingResponses, setPendingResponses] = useState<PendingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isPosting, setIsPosting] = useState(false)

  // Fetch bot data
  const fetchData = useCallback(async () => {
    try {
      // Fetch status
      const statusRes = await fetch('/api/bot/status')
      const statusData = await statusRes.json()
      if (statusData.success) {
        setStatuses(statusData.statuses || [])
        setLogs(statusData.recent_logs || [])
      }

      // Fetch configs
      const configRes = await fetch('/api/bot/config')
      const configData = await configRes.json()
      if (configData.success) {
        setConfigs(configData.configs || [])
      }

      // Fetch pending responses from status
      if (statusData.pending_by_team) {
        // We'd need another endpoint for actual responses
        // For now, use the pending counts
      }

      setError(null)
    } catch (err) {
      setError('Failed to fetch bot data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Toggle bot enabled status
  const toggleBot = async (team_slug: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/bot/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_slug, enabled }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      } else {
        setError(data.error || 'Failed to update')
      }
    } catch (err) {
      setError('Failed to toggle bot')
    }
  }

  // Trigger monitoring
  const triggerMonitor = async (team_slug?: string) => {
    setIsMonitoring(true)
    try {
      const res = await fetch('/api/bot/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team_slug ? { team_slug } : {}),
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      } else {
        setError(data.error || 'Monitor failed')
      }
    } catch (err) {
      setError('Failed to trigger monitor')
    } finally {
      setIsMonitoring(false)
    }
  }

  // Post pending responses
  const postResponses = async (team_slug?: string) => {
    setIsPosting(true)
    try {
      const res = await fetch('/api/bot/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team_slug ? { team_slug, limit: 3 } : { limit: 5 }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
      } else {
        setError(data.error || 'Post failed')
      }
    } catch (err) {
      setError('Failed to post responses')
    } finally {
      setIsPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">X Bot Management</h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">X Bot Management</h1>
            <p className="text-zinc-400 mt-1">
              Manage AI-powered engagement for Chicago sports communities
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => triggerMonitor()}
              disabled={isMonitoring}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isMonitoring ? 'Monitoring...' : 'Monitor All'}
            </button>
            <button
              onClick={() => postResponses()}
              disabled={isPosting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isPosting ? 'Posting...' : 'Post Pending'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-200">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Team Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {statuses.map(status => {
            const team = TEAM_DISPLAY[status.team_slug] || {
              name: status.team_slug,
              emoji: '🏈',
              color: '#666',
            }
            return (
              <div
                key={status.team_slug}
                className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden"
              >
                <div
                  className="p-4"
                  style={{ borderTopWidth: 4, borderTopColor: team.color }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{team.emoji}</span>
                      <span className="font-semibold text-white">{team.name}</span>
                    </div>
                    <button
                      onClick={() => toggleBot(status.team_slug, !status.enabled)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        status.enabled
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                      }`}
                    >
                      {status.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-400">
                      <span>Replies Today</span>
                      <span className="text-white">
                        {status.today_replies}/{status.daily_reply_limit}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Posts Today</span>
                      <span className="text-white">
                        {status.today_posts}/{status.daily_post_limit}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Pending</span>
                      <span className={status.pending_responses > 0 ? 'text-yellow-400' : 'text-white'}>
                        {status.pending_responses}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-2">
                    <button
                      onClick={() => triggerMonitor(status.team_slug)}
                      disabled={isMonitoring || !status.enabled}
                      className="flex-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 rounded text-xs transition-colors"
                    >
                      Monitor
                    </button>
                    <button
                      onClick={() => postResponses(status.team_slug)}
                      disabled={isPosting || !status.enabled || status.pending_responses === 0}
                      className="flex-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 rounded text-xs transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Logs */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No recent activity</p>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.log_level === 'error'
                        ? 'bg-red-900/50 text-red-400'
                        : log.log_level === 'warn'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {log.log_level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {log.team_slug && (
                        <span className="text-xs">
                          {TEAM_DISPLAY[log.team_slug]?.emoji}
                        </span>
                      )}
                      <span className="font-medium text-white">{log.action}</span>
                    </div>
                    {log.message && (
                      <p className="text-zinc-400 text-sm truncate">{log.message}</p>
                    )}
                  </div>
                  <span className="text-zinc-500 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Configuration</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="text-left py-3 px-4">Team</th>
                  <th className="text-left py-3 px-4">Community ID</th>
                  <th className="text-center py-3 px-4">Reply Limit</th>
                  <th className="text-center py-3 px-4">Post Limit</th>
                  <th className="text-center py-3 px-4">Min Delay</th>
                  <th className="text-center py-3 px-4">Max Delay</th>
                </tr>
              </thead>
              <tbody>
                {configs.map(config => {
                  const team = TEAM_DISPLAY[config.team_slug]
                  return (
                    <tr
                      key={config.team_slug}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{team?.emoji}</span>
                          <span className="text-white">{team?.name || config.team_slug}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-xs">
                        {config.community_id || '—'}
                      </td>
                      <td className="py-3 px-4 text-center text-white">
                        {config.daily_reply_limit}
                      </td>
                      <td className="py-3 px-4 text-center text-white">
                        {config.daily_post_limit}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-400">
                        {config.min_delay_seconds}s
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-400">
                        {config.max_delay_seconds}s
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-3">Quick Start</h3>
          <ol className="list-decimal list-inside space-y-2 text-zinc-400">
            <li>
              Add Twitter API credentials to <code className="text-zinc-300 bg-zinc-800 px-1 rounded">.env.local</code>
            </li>
            <li>
              Run the database migration: <code className="text-zinc-300 bg-zinc-800 px-1 rounded">migrations/x-bot-schema.sql</code>
            </li>
            <li>
              Enable the bot for each team using the toggle buttons above
            </li>
            <li>
              Click &quot;Monitor All&quot; to scan for engagement opportunities
            </li>
            <li>
              Review pending responses in the database before clicking &quot;Post Pending&quot;
            </li>
          </ol>
          <p className="mt-4 text-sm text-zinc-500">
            For automated operation, set up cron jobs to call <code>/api/bot/monitor</code> and <code>/api/bot/post</code> endpoints.
          </p>
        </div>
      </div>
    </div>
  )
}
