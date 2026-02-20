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
 * - Team Hero with team-hero-{slug} accent background + sm-grid-overlay
 * - Glass-card stat pills, Space Grotesk headings
 * - Sticky subnav with team-pill quick-nav
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
  { id: 'overview', label: 'Hub', path: '' },
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
  { id: 'overview', label: 'Hub', path: '' },
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

// Map team slugs to CSS hero classes
const TEAM_HERO_CLASS: Record<string, string> = {
  'chicago-bears': 'team-hero-bears',
  'chicago-bulls': 'team-hero-bulls',
  'chicago-blackhawks': 'team-hero-hawks',
  'chicago-cubs': 'team-hero-cubs',
  'chicago-white-sox': 'team-hero-whitesox',
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

  const heroClass = TEAM_HERO_CLASS[team.slug] || ''

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* ===== TEAM HERO SECTION ===== */}
      <div
        ref={headerRef}
        className={heroClass}
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '48px',
          paddingBottom: '48px',
        }}
      >
        {/* Grid overlay */}
        <div className="sm-grid-overlay" />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
          {/* Team header row */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            {/* Logo */}
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: 'var(--sm-radius-lg)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Image
                src={team.logo}
                alt={team.name}
                width={72}
                height={72}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                unoptimized
              />
            </div>

            {/* Name + tagline */}
            <div style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '48px',
                  fontWeight: 700,
                  color: 'var(--sm-text)',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                  margin: '0 0 8px 0',
                }}
              >
                {team.name}
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--sm-text-muted)', fontWeight: 500, margin: 0 }}>
                {TEAM_TAGLINES[team.slug] || team.league}
              </p>
            </div>
          </div>

          {/* Stats bar - glass pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            {/* Record */}
            <div
              className="glass-card glass-card-sm glass-card-static"
              style={{ textAlign: 'center', minWidth: '120px', padding: '16px 20px' }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {formatRecord() || '--'}
              </div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sm-text-dim)', fontWeight: 600 }}>
                Record
              </div>
            </div>

            {/* Division Rank */}
            {record?.divisionRank && (
              <div
                className="glass-card glass-card-sm glass-card-static"
                style={{ textAlign: 'center', minWidth: '120px', padding: '16px 20px' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {record.divisionRank}
                </div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sm-text-dim)', fontWeight: 600 }}>
                  Division
                </div>
              </div>
            )}

            {/* Last Game */}
            {lastGame && (
              <div
                className="glass-card glass-card-sm glass-card-static"
                style={{ textAlign: 'center', minWidth: '120px', padding: '16px 20px' }}
              >
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: lastGame.result === 'W' ? 'var(--sm-success)' : lastGame.result === 'L' ? 'var(--sm-error)' : 'var(--sm-text)',
                }}>
                  {lastGame.result} {lastGame.teamScore}-{lastGame.opponentScore}
                </div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sm-text-dim)', fontWeight: 600 }}>
                  {lastGame.isHome ? 'vs' : '@'} {lastGame.opponent}
                </div>
              </div>
            )}

            {/* Next Game */}
            {nextGame && (
              <div
                className="glass-card glass-card-sm glass-card-static"
                style={{ textAlign: 'center', minWidth: '120px', padding: '16px 20px' }}
              >
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
                </div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sm-text-dim)', fontWeight: 600 }}>
                  {nextGame.date} {nextGame.time}
                </div>
              </div>
            )}
          </div>

          {/* Quick-nav pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {[
              { label: 'Schedule', href: `/${team.slug}/schedule` },
              { label: 'Roster', href: `/${team.slug}/roster` },
              { label: 'Stats', href: `/${team.slug}/stats` },
              { label: 'Scores', href: `/${team.slug}/scores` },
              { label: 'Players', href: `/${team.slug}/players` },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="team-pill"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STICKY SUBNAV ===== */}
      <div
        ref={navRef}
        className={isSticky ? 'sticky' : ''}
        style={{
          ...(isSticky ? { top: '140px', zIndex: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' } : {}),
          background: 'var(--sm-surface)',
          borderBottom: '1px solid var(--sm-border)',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
          {/* Desktop tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', padding: '4px 0' }}>
            {tabs.map((tab: typeof tabs[number]) => {
              const isActive = tab.id === currentTab
              const href = tab.external
                ? `${tab.external}?channel=${team.slug.replace('chicago-', '')}`
                : basePath + tab.path

              return (
                <Link
                  key={tab.id}
                  href={href}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    color: isActive ? 'var(--sm-text)' : 'var(--sm-text-muted)',
                    textDecoration: 'none',
                    position: 'relative',
                    transition: 'color 0.2s',
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        borderRadius: '2px',
                        background: 'var(--sm-red)',
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '32px 24px 48px',
          background: 'var(--sm-dark)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
