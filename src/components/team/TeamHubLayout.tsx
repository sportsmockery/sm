'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTeamRecord } from '@/contexts/TeamRecordContext'

/**
 * Team Hub Layout Component
 *
 * V10 Design System: Section 5 - Team Hubs
 * Based on ESPN.com, The Athletic, and CBS Sports team hub layouts
 *
 * Features:
 * - Team Header Band with logo, name, next game, record, team-colored gradient
 * - Sticky Team Subnav with tabs (desktop: horizontal bar, mobile: scrollable pills)
 * - Slot for main content
 *
 * Design Sources:
 * - ESPN: Team header band with gradient, next game prominently displayed
 * - The Athletic: Clean subnav with active state indicators
 * - CBS Sports: Record badge and game countdown
 */

export interface TeamInfo {
  name: string
  shortName: string
  slug: string
  logo: string
  primaryColor: string
  secondaryColor: string
  league: 'NFL' | 'NBA' | 'MLB' | 'NHL'
}

export interface NextGameInfo {
  opponent: string
  opponentLogo?: string
  date: string
  time: string
  isHome: boolean
  venue?: string
}

export interface LastGameInfo {
  opponent: string
  opponentLogo?: string
  date: string
  isHome: boolean
  teamScore: number
  opponentScore: number
  result: 'W' | 'L' | 'T'
}

export interface TeamRecord {
  wins: number
  losses: number
  ties?: number
  otLosses?: number
  pct?: string
  divisionRank?: string
  postseason?: {
    wins: number
    losses: number
  }
}

interface TeamHubLayoutProps {
  team: TeamInfo
  nextGame?: NextGameInfo | null
  lastGame?: LastGameInfo | null
  record?: TeamRecord | null
  children: React.ReactNode
  activeTab?: string
}

// Standard tabs for all team hubs
// Note: Fan Chat uses external path format with channel query param
const TEAM_TABS = [
  { id: 'overview', label: 'Overview', path: '' },
  { id: 'schedule', label: 'Schedule', path: '/schedule' },
  { id: 'scores', label: 'Scores', path: '/scores' },
  { id: 'stats', label: 'Stats', path: '/stats' },
  { id: 'roster', label: 'Roster', path: '/roster' },
  { id: 'players', label: 'Players', path: '/players' },
  { id: 'news', label: 'News', path: '/news' },
  { id: 'fan-chat', label: 'Fan Chat', path: '', external: '/fan-chat' },
]

// NFL tabs (includes scores for box scores)
const NFL_TABS = [
  { id: 'overview', label: 'Overview', path: '' },
  { id: 'schedule', label: 'Schedule', path: '/schedule' },
  { id: 'scores', label: 'Box Scores', path: '/scores' },
  { id: 'stats', label: 'Stats', path: '/stats' },
  { id: 'roster', label: 'Roster', path: '/roster' },
  { id: 'players', label: 'Players', path: '/players' },
  { id: 'fan-chat', label: 'Fan Chat', path: '', external: '/fan-chat' },
]

export default function TeamHubLayout({
  team,
  nextGame,
  lastGame,
  record,
  children,
  activeTab,
}: TeamHubLayoutProps) {
  const pathname = usePathname()
  const [isSticky, setIsSticky] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { setRecord: setContextRecord } = useTeamRecord()

  // Determine active tab from pathname
  const tabs = team.league === 'NFL' ? NFL_TABS : TEAM_TABS
  const basePath = `/${team.slug}`

  const currentTab = activeTab || tabs.find(tab => {
    const fullPath = basePath + tab.path
    if (tab.path === '') {
      return pathname === basePath || pathname === basePath + '/'
    }
    return pathname?.startsWith(fullPath)
  })?.id || 'overview'

  // Handle sticky nav
  // Main site header is ~140px (52px top bar + 44px nav + 44px BearsStickyBar)
  const MAIN_HEADER_HEIGHT = 140

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom
        setIsSticky(headerBottom <= MAIN_HEADER_HEIGHT)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Format record display
  const formatRecord = () => {
    if (!record) return null

    let regularSeason = ''
    if (team.league === 'NFL') {
      const tie = record.ties && record.ties > 0 ? `-${record.ties}` : ''
      regularSeason = `${record.wins}-${record.losses}${tie}`
    } else if (team.league === 'NHL') {
      const ot = record.otLosses && record.otLosses > 0 ? `-${record.otLosses}` : ''
      regularSeason = `${record.wins}-${record.losses}${ot}`
    } else {
      regularSeason = `${record.wins}-${record.losses}`
    }

    // Add postseason if available
    if (record.postseason && (record.postseason.wins > 0 || record.postseason.losses > 0)) {
      return `${regularSeason} • Playoffs: ${record.postseason.wins}-${record.postseason.losses}`
    }

    return regularSeason
  }

  // Push the formatted record to context so the sticky bar can read it
  useEffect(() => {
    const formatted = formatRecord()
    setContextRecord(formatted)
    return () => setContextRecord(null)
  }, [record, team.league, setContextRecord])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Team Header Band */}
      <div
        ref={headerRef}
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.primaryColor}dd 50%, ${team.secondaryColor}80 100%)`,
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-[1320px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
            {/* Left: Team Identity */}
            <div className="flex items-center gap-4">
              {/* Team Logo */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center p-1.5 sm:p-2 shadow-lg">
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>

              {/* Team Name & Tag */}
              <div>
                <h1
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {team.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white/90 font-medium">
                    {team.league}
                  </span>
                  {record && (
                    <span className="text-white/80 font-semibold">
                      {formatRecord()}
                    </span>
                  )}
                  {record?.divisionRank && (
                    <span className="text-white/60 text-sm">
                      {record.divisionRank}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Last Game & Next Game */}
            <div className="flex items-center gap-3">
              {/* Last Game */}
              {lastGame && (
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-right">
                    <div className="text-xs text-white/60 uppercase tracking-wide font-medium">
                      Last Game
                    </div>
                    <div className={`text-lg font-bold ${lastGame.result === 'W' ? 'text-green-400' : lastGame.result === 'L' ? 'text-red-400' : 'text-white'}`}>
                      {lastGame.result}
                    </div>
                    <div className="text-xs text-white/70">
                      {lastGame.teamScore}-{lastGame.opponentScore}
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/20" />

                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs">
                      {lastGame.isHome ? 'vs' : '@'}
                    </span>
                    {lastGame.opponentLogo && (
                      <Image
                        src={lastGame.opponentLogo}
                        alt={lastGame.opponent}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain"
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Next Game */}
              {nextGame && (
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-right">
                    <div className="text-xs text-white/60 uppercase tracking-wide font-medium">
                      Next Game
                    </div>
                    <div className="text-sm text-white font-medium mt-0.5">
                      {nextGame.date}
                    </div>
                    <div className="text-xs text-white/70">
                      {nextGame.time}
                    </div>
                  </div>

                  <div className="w-px h-10 bg-white/20" />

                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs">
                      {nextGame.isHome ? 'vs' : '@'}
                    </span>
                    {nextGame.opponentLogo && (
                      <Image
                        src={nextGame.opponentLogo}
                        alt={nextGame.opponent}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain"
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Team Subnav - positioned below main site header (140px) */}
      <div
        ref={navRef}
        className={`bg-[var(--bg-surface)] border-b transition-shadow z-40 ${
          isSticky ? 'sticky top-[140px] shadow-md' : ''
        }`}
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-[1320px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Desktop: Horizontal bar */}
          <nav className="hidden md:flex items-center gap-1 py-1 overflow-x-auto">
            {tabs.map((tab: any) => {
              const isActive = tab.id === currentTab
              // Handle external links (like Fan Chat) with channel parameter
              const href = tab.external
                ? `${tab.external}?channel=${team.slug.replace('chicago-', '')}`
                : basePath + tab.path

              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    isActive
                      ? 'text-[var(--link-color)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: team.secondaryColor }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile: Horizontally scrollable pill row - 44px min tap target */}
          <nav className="flex md:hidden items-center gap-1.5 sm:gap-2 py-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab: any) => {
              const isActive = tab.id === currentTab
              // Handle external links (like Fan Chat) with channel parameter
              const href = tab.external
                ? `${tab.external}?channel=${team.slug.replace('chicago-', '')}`
                : basePath + tab.path

              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap rounded-full transition-colors min-h-[40px] sm:min-h-[44px] flex items-center ${
                    isActive
                      ? 'text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  }`}
                  style={isActive ? { backgroundColor: team.secondaryColor } : {}}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1320px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </div>
    </div>
  )
}
