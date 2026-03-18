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
    // Desktop: toggle selection in workspace panel
    setSelectedTeamKey((prev) => (prev === teamKey ? null : teamKey))
  }, [])

  const handleMobileSelectTeam = useCallback((teamKey: string) => {
    setMobileDrawerTeam(teamKey)
  }, [])

  const selectedTeam = data?.teams.find((t) => t.team_key === selectedTeamKey) || null
  const mobileTeam = data?.teams.find((t) => t.team_key === mobileDrawerTeam) || null

  // Loading state
  if (loading && !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0B0F14' }}
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#00D4FF" strokeWidth="2" className="animate-spin"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          <span className="text-sm" style={{ color: 'rgba(250,250,251,0.5)' }}>
            Loading intelligence...
          </span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0B0F14' }}
      >
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <span className="text-sm font-medium" style={{ color: '#BC0000' }}>
            Failed to load dashboard
          </span>
          <span className="text-xs" style={{ color: 'rgba(250,250,251,0.4)' }}>
            {error}
          </span>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0F14' }}>
      {/* Global Control Bar */}
      <GlobalControlBar
        meta={data.meta}
        lastFetched={lastFetched}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Main Content */}
      <div className="px-3 sm:px-4 lg:px-5 py-4 space-y-4 max-w-[1600px] mx-auto">
        {/* City Overview */}
        <CityOverviewPanel city={data.city} teams={data.teams} />

        {/* Live Command Center (conditional) */}
        <LiveCommandCenter live={data.live} />

        {/* Mobile Team Selector (visible on mobile/tablet) */}
        <MobileTeamSelector
          teams={data.teams}
          selectedTeam={mobileDrawerTeam}
          onSelectTeam={handleMobileSelectTeam}
        />

        {/* Team Status Matrix (desktop: always visible, mobile: horizontal scroll) */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(250,250,251,0.5)' }}>
              Team Status Matrix
            </span>
            {selectedTeamKey && (
              <button
                onClick={() => setSelectedTeamKey(null)}
                className="text-xs px-2 py-0.5 rounded"
                style={{ color: 'rgba(250,250,251,0.4)', backgroundColor: 'rgba(255,255,255,0.04)' }}
              >
                Clear Selection
              </button>
            )}
          </div>
          <TeamStatusMatrix
            teams={data.teams}
            selectedTeam={selectedTeamKey}
            onSelectTeam={handleSelectTeam}
          />
        </div>

        {/* Bottom Zone: Team Workspace + Trends/Leaders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Team Workspace (left side on desktop) */}
          {selectedTeam && (
            <div className="lg:col-span-7 hidden lg:block">
              <TeamWorkspace
                team={selectedTeam}
                onClose={() => setSelectedTeamKey(null)}
              />
            </div>
          )}

          {/* Trends + Leaders (right side, or full width if no team selected) */}
          <div className={selectedTeam ? 'lg:col-span-5 space-y-4' : 'lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4'}>
            <TrendsPanel trends={data.trends} />
            <LeaderboardsPanel leaders={data.leaders} />
          </div>
        </div>

        {/* Data Freshness Footer */}
        <div className="flex flex-wrap gap-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {Object.entries(data.meta.data_freshness).map(([key, timestamp]) => {
            const ago = Math.round((Date.now() - new Date(timestamp).getTime()) / 60000)
            return (
              <span key={key} className="text-xs" style={{ color: 'rgba(250,250,251,0.25)' }}>
                {key}: {ago < 1 ? '<1m' : `${ago}m`} ago
              </span>
            )
          })}
        </div>
      </div>

      {/* Mobile Team Drawer */}
      <MobileTeamDrawer
        team={mobileTeam}
        onClose={() => setMobileDrawerTeam(null)}
      />
    </div>
  )
}
