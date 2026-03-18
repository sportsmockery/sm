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

  // Loading
  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #F8F9FB 0%, #EEF0F4 100%)' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'rgba(0,212,255,0.2)', borderTopColor: 'transparent' }} />
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase block" style={{ color: 'rgba(11,15,20,0.25)' }}>Chicago Sports Intelligence</span>
            <span className="text-[10px] tracking-wide block mt-1" style={{ color: 'rgba(11,15,20,0.15)' }}>Connecting to data sources...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #F8F9FB 0%, #EEF0F4 100%)' }}>
        <div className="rounded-2xl p-8 text-center max-w-sm" style={{ backgroundColor: '#fff', boxShadow: '0 8px 40px rgba(11,15,20,0.06), 0 1px 3px rgba(11,15,20,0.04)' }}>
          <span className="text-sm font-bold" style={{ color: '#BC0000' }}>Connection Failed</span>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(11,15,20,0.45)' }}>{error}</p>
          <button onClick={refresh} className="mt-5 text-xs px-5 py-2.5 rounded-xl font-bold transition-all" style={{ backgroundColor: '#0B0F14', color: '#fff' }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const sortedTeams = [...data.teams].sort((a, b) => (a.dashboard_priority ?? 99) - (b.dashboard_priority ?? 99))

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #F8F9FB 0%, #F0F1F5 100%)' }}>
      <GlobalControlBar meta={data.meta} lastFetched={lastFetched} onRefresh={refresh} loading={loading} />

      <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-[1800px] mx-auto space-y-6">
        {/* Executive Briefing */}
        <CityOverviewPanel city={data.city} teams={sortedTeams} />

        <LiveCommandCenter live={data.live} />

        {/* Mobile */}
        <MobileTeamSelector teams={sortedTeams} selectedTeam={mobileDrawerTeam} onSelectTeam={handleMobileSelectTeam} />

        {/* Intelligence Matrix — elevated white surface */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(11,15,20,0.04), 0 8px 32px rgba(11,15,20,0.04)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(11,15,20,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
              <h2 className="text-[13px] font-bold tracking-[0.04em]" style={{ color: '#0B0F14' }}>Team Intelligence Matrix</h2>
            </div>
            {selectedTeamKey && (
              <button
                onClick={() => setSelectedTeamKey(null)}
                className="text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all"
                style={{ color: 'rgba(11,15,20,0.5)', backgroundColor: 'rgba(11,15,20,0.04)', border: '1px solid rgba(11,15,20,0.06)' }}
              >
                Clear Selection
              </button>
            )}
          </div>
          <TeamStatusMatrix teams={sortedTeams} selectedTeam={selectedTeamKey} onSelectTeam={handleSelectTeam} />
        </section>

        {/* Workspace + Supporting Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {selectedTeam && (
            <div className="lg:col-span-8 hidden lg:block">
              <div
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: '#fff',
                  boxShadow: `0 1px 3px rgba(11,15,20,0.04), 0 8px 40px rgba(11,15,20,0.06), 0 0 0 1px ${selectedTeam.color_primary}18`,
                }}
              >
                <TeamWorkspace team={selectedTeam} onClose={() => setSelectedTeamKey(null)} />
              </div>
            </div>
          )}

          <div className={selectedTeam ? 'lg:col-span-4 space-y-6' : 'lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6'}>
            <TrendsPanel trends={data.trends} />
            <LeaderboardsPanel leaders={data.leaders} />
          </div>
        </div>

        {/* Freshness */}
        <div className="flex flex-wrap gap-6 pt-4" style={{ borderTop: '1px solid rgba(11,15,20,0.04)' }}>
          {Object.entries(data.meta.data_freshness).map(([key, timestamp]) => {
            const ago = Math.round((Date.now() - new Date(timestamp).getTime()) / 60000)
            return (
              <span key={key} className="text-[10px] tracking-wide" style={{ color: 'rgba(11,15,20,0.18)' }}>
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
