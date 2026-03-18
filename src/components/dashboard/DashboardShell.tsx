'use client'

import { useState, useCallback } from 'react'
import { useDashboardData } from './useDashboardData'
import GlobalControlBar from './GlobalControlBar'
import CityOverviewPanel from './CityOverviewPanel'
import TeamStatusMatrix from './TeamStatusMatrix'
import LiveCommandCenter from './LiveCommandCenter'
import TeamWorkspace from './TeamWorkspace'
import TrendsPanel from './TrendsPanel'
import LeaderboardsPanel from './LeaderboardsPanel'
import MobileTeamSelector from './MobileTeamSelector'
import MobileTeamDrawer from './MobileTeamDrawer'

export default function DashboardShell() {
  const { data, loading, error, lastFetched, refresh } = useDashboardData()
  const [selectedTeamKey, setSelectedTeamKey] = useState<string | null>(null)
  const [mobileDrawerTeam, setMobileDrawerTeam] = useState<string | null>(null)

  const handleSelectTeam = useCallback((teamKey: string) => {
    setSelectedTeamKey((prev) => (prev === teamKey ? null : teamKey))
  }, [])

  const handleMobileSelectTeam = useCallback((teamKey: string) => {
    setMobileDrawerTeam(teamKey)
  }, [])

  const selectedTeam = data?.teams.find((t) => t.team_key === selectedTeamKey) || null
  const mobileTeam = data?.teams.find((t) => t.team_key === mobileDrawerTeam) || null

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#090C10' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(0,212,255,0.25)', borderTopColor: 'transparent' }}
          />
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(232,234,237,0.3)' }}>
            Loading Intelligence
          </span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#090C10' }}>
        <div
          className="rounded-2xl border p-6 text-center max-w-sm backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-sm font-medium" style={{ color: '#BC0000' }}>Connection Failed</span>
          <p className="text-xs mt-2" style={{ color: 'rgba(232,234,237,0.4)' }}>{error}</p>
          <button
            onClick={refresh}
            className="mt-4 text-xs px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const sortedTeams = [...data.teams].sort((a, b) => {
    const ap = a.dashboard_priority ?? 99
    const bp = b.dashboard_priority ?? 99
    return ap - bp
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#090C10' }}>
      <GlobalControlBar meta={data.meta} lastFetched={lastFetched} onRefresh={refresh} loading={loading} />

      <div className="px-3 sm:px-5 lg:px-8 py-5 max-w-[1720px] mx-auto space-y-5">
        {/* Executive Briefing */}
        <CityOverviewPanel city={data.city} teams={sortedTeams} />

        {/* Live */}
        <LiveCommandCenter live={data.live} />

        {/* Mobile selector */}
        <MobileTeamSelector teams={sortedTeams} selectedTeam={mobileDrawerTeam} onSelectTeam={handleMobileSelectTeam} />

        {/* Intelligence Matrix */}
        <div
          className="rounded-2xl border overflow-hidden backdrop-blur-xl"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.06)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div
            className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(232,234,237,0.4)' }}>
                Team Intelligence Matrix
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,212,255,0.4)' }} />
            </div>
            {selectedTeamKey && (
              <button
                onClick={() => setSelectedTeamKey(null)}
                className="text-[11px] px-3 py-1 rounded-lg font-medium transition-all"
                style={{ color: 'rgba(232,234,237,0.4)', backgroundColor: 'rgba(255,255,255,0.04)' }}
              >
                Clear Selection
              </button>
            )}
          </div>
          <TeamStatusMatrix teams={sortedTeams} selectedTeam={selectedTeamKey} onSelectTeam={handleSelectTeam} />
        </div>

        {/* Primary Workspace Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {selectedTeam && (
            <div
              className="lg:col-span-8 hidden lg:block rounded-2xl transition-all duration-300"
              style={{
                boxShadow: `0 0 32px ${selectedTeam.color_primary}12, 0 4px 24px rgba(0,0,0,0.3)`,
              }}
            >
              <TeamWorkspace team={selectedTeam} onClose={() => setSelectedTeamKey(null)} />
            </div>
          )}

          <div className={selectedTeam ? 'lg:col-span-4 space-y-5' : 'lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-5'}>
            <TrendsPanel trends={data.trends} />
            <LeaderboardsPanel leaders={data.leaders} />
          </div>
        </div>

        {/* Freshness */}
        <div className="flex flex-wrap gap-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
          {Object.entries(data.meta.data_freshness).map(([key, timestamp]) => {
            const ago = Math.round((Date.now() - new Date(timestamp).getTime()) / 60000)
            return (
              <span key={key} className="text-[10px] tracking-wide" style={{ color: 'rgba(232,234,237,0.15)' }}>
                {key}: {ago < 1 ? '<1m' : `${ago}m`} ago
              </span>
            )
          })}
        </div>
      </div>

      <MobileTeamDrawer team={mobileTeam} onClose={() => setMobileDrawerTeam(null)} />
    </div>
  )
}
