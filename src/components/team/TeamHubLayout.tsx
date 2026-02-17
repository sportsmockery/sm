'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTeamRecord } from '@/contexts/TeamRecordContext'

/**
 * Team Hub Layout Component
 *
 * 2030 Premium Design System: Team Hubs
 * Features:
 * - Team Hero with gradient bg, large logo, stats bar, quick links
 * - Sticky Team Subnav with tabs
 * - Slot for main content
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
const TEAM_TABS = [
  { id: 'overview', label: 'Overview', path: '' },
  { id: 'live', label: 'Live', path: '/live' },
  { id: 'schedule', label: 'Schedule', path: '/schedule' },
  { id: 'scores', label: 'Scores', path: '/scores' },
  { id: 'stats', label: 'Stats', path: '/stats' },
  { id: 'roster', label: 'Roster', path: '/roster' },
  { id: 'players', label: 'Players', path: '/players' },
  { id: 'news', label: 'News', path: '/news' },
  { id: 'fan-chat', label: 'Fan Chat', path: '', external: '/fan-chat' },
]

// NFL tabs
const NFL_TABS = [
  { id: 'overview', label: 'Overview', path: '' },
  { id: 'live', label: 'Live', path: '/live' },
  { id: 'schedule', label: 'Schedule', path: '/schedule' },
  { id: 'scores', label: 'Box Scores', path: '/scores' },
  { id: 'stats', label: 'Stats', path: '/stats' },
  { id: 'roster', label: 'Roster', path: '/roster' },
  { id: 'players', label: 'Players', path: '/players' },
  { id: 'fan-chat', label: 'Fan Chat', path: '', external: '/fan-chat' },
]

// Team taglines
const TEAM_TAGLINES: Record<string, string> = {
  'chicago-bears': 'Monsters of the Midway',
  'chicago-bulls': 'See Red',
  'chicago-blackhawks': 'One Goal',
  'chicago-cubs': 'Fly the W',
  'chicago-white-sox': 'Change the Game',
}

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

  const tabs = team.league === 'NFL' ? NFL_TABS : TEAM_TABS
  const basePath = `/${team.slug}`

  const currentTab = activeTab || tabs.find(tab => {
    const fullPath = basePath + tab.path
    if (tab.path === '') {
      return pathname === basePath || pathname === basePath + '/'
    }
    return pathname?.startsWith(fullPath)
  })?.id || 'overview'

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

    if (record.postseason && (record.postseason.wins > 0 || record.postseason.losses > 0)) {
      return `${regularSeason} • Playoffs: ${record.postseason.wins}-${record.postseason.losses}`
    }

    return regularSeason
  }

  useEffect(() => {
    const formatted = formatRecord()
    setContextRecord(formatted)
    return () => setContextRecord(null)
  }, [record, team.league, setContextRecord])

  // Build quick links for team
  const quickLinks = [
    { label: 'Schedule', href: `/${team.slug}/schedule` },
    { label: 'Roster', href: `/${team.slug}/roster` },
    { label: 'Stats', href: `/${team.slug}/stats` },
    { label: 'Scores', href: `/${team.slug}/scores` },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Team Hero Section */}
      <div
        ref={headerRef}
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
          borderBottom: `2px solid ${team.secondaryColor}`,
        }}
      >
        {/* Background pattern - faded team logo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.03) 2px, transparent 0)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          {/* Team Header Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-6">
            {/* Team Logo */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Image
                src={team.logo}
                alt={team.name}
                width={80}
                height={80}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>

            {/* Team Name & Info */}
            <div className="text-center sm:text-left">
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                  fontFamily: "'Montserrat', sans-serif",
                  marginBottom: '8px',
                }}
              >
                {team.name}
              </h1>
              <p
                style={{
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500,
                }}
              >
                {TEAM_TAGLINES[team.slug] || team.league}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div
            className="grid gap-4 sm:gap-6 mb-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            }}
          >
            {/* Record */}
            <div
              style={{
                textAlign: 'center',
                padding: '16px 12px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {formatRecord() || '--'}
              </div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                Record
              </div>
            </div>

            {/* Division Rank */}
            {record?.divisionRank && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                  {record.divisionRank}
                </div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  Division
                </div>
              </div>
            )}

            {/* Last Game */}
            {lastGame && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: lastGame.result === 'W' ? '#4ade80' : lastGame.result === 'L' ? '#f87171' : '#fff',
                    marginBottom: '4px',
                  }}
                >
                  {lastGame.result} {lastGame.teamScore}-{lastGame.opponentScore}
                </div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  {lastGame.isHome ? 'vs' : '@'} {lastGame.opponent}
                </div>
              </div>
            )}

            {/* Next Game */}
            {nextGame && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
                </div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  {nextGame.date} {nextGame.time}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  padding: '10px 24px',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '100px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
                className="hover:bg-white/25 hover:-translate-y-0.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Team Subnav */}
      <div
        ref={navRef}
        className={`z-40 ${isSticky ? 'sticky top-[140px] shadow-md' : ''}`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop: Horizontal bar */}
          <nav className="hidden md:flex items-center gap-1 py-1 overflow-x-auto">
            {tabs.map((tab: any) => {
              const isActive = tab.id === currentTab
              const href = tab.external
                ? `${tab.external}?channel=${team.slug.replace('chicago-', '')}`
                : basePath + tab.path

              return (
                <Link
                  key={tab.id}
                  href={href}
                  className="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative"
                  style={{
                    color: isActive ? 'var(--sm-text)' : 'var(--sm-text-muted)',
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: team.secondaryColor || team.primaryColor }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile: Scrollable pill row */}
          <nav className="flex md:hidden items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab: any) => {
              const isActive = tab.id === currentTab
              const href = tab.external
                ? `${tab.external}?channel=${team.slug.replace('chicago-', '')}`
                : basePath + tab.path

              return (
                <Link
                  key={tab.id}
                  href={href}
                  className="px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors min-h-[44px] flex items-center"
                  style={isActive ? {
                    backgroundColor: team.secondaryColor || team.primaryColor,
                    color: '#fff',
                  } : {
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--sm-text-muted)',
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10"
        style={{
          maxWidth: '1400px',
          backgroundColor: 'var(--bg-page)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
