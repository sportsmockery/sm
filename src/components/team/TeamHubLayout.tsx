'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import TeamHeader from './TeamHeader'
import ToolGrid from './ToolGrid'

/**
 * Team Hub Layout Component
 *
 * 2030 Premium Design System: Team Hubs
 * - Team Hero with team-hero-{slug} accent background + sm-grid-overlay
 * - Framer Motion hero entrance + shimmer logo + count-up record
 * - Floating orbs background + red gradient overlay
 * - Inline search bar
 * - Glass-card stat pills, Space Grotesk headings
 * - Sticky subnav
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
  recordLabel?: string  // e.g. "Spring Training" — defaults to "Record"
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
const TEAM_SLUG_TO_OWNER: Record<string, string> = {
  'chicago-bears': 'bears',
  'chicago-bulls': 'bulls',
  'chicago-blackhawks': 'blackhawks',
  'chicago-cubs': 'cubs',
  'chicago-white-sox': 'whitesox',
}

const TEAM_TABS = [
  { id: 'overview', label: 'EDGE', path: '' },
  { id: 'live', label: 'Live', path: '/live' },
  { id: 'schedule', label: 'Schedule', path: '/schedule' },
  { id: 'scores', label: 'Scores', path: '/scores' },
  { id: 'stats', label: 'Stats', path: '/stats' },
  { id: 'roster', label: 'Roster', path: '/roster' },
  { id: 'players', label: 'Players', path: '/players' },
  { id: 'news', label: 'News', path: '/news' },
  { id: 'gm-report', label: 'GM Report Card', path: '', ownerLink: true },
]

// NFL tabs
const NFL_TABS = [
  { id: 'overview', label: 'EDGE', path: '' },
  { id: 'live', label: 'Live', path: '/live' },
  { id: 'schedule', label: 'Schedule', path: '/schedule' },
  { id: 'scores', label: 'Box Scores', path: '/scores' },
  { id: 'stats', label: 'Stats', path: '/stats' },
  { id: 'roster', label: 'Roster', path: '/roster' },
  { id: 'players', label: 'Players', path: '/players' },
  { id: 'gm-report', label: 'GM Report Card', path: '', ownerLink: true },
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* ===== COMPACT TEAM HEADER ===== */}
      <div ref={headerRef} style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <TeamHeader
          team={team}
          rightSlot={
            <ToolGrid
              teamSlug={team.slug}
              accentColor={team.secondaryColor}
              secondaryColor={team.primaryColor}
              compact
            />
          }
        />
      </div>

      {/* ===== STICKY SUBNAV ===== */}
      <div
        ref={navRef}
        style={{
          position: 'sticky',
          top: 'var(--sm-nav-height, 72px)',
          zIndex: 40,
          background: 'var(--sm-surface)',
          borderBottom: '1px solid var(--sm-border)',
          transition: 'box-shadow 0.2s ease',
          boxShadow: isSticky ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
          {/* Desktop tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', overflowX: 'auto', padding: '4px 0' }}>
            {tabs.map((tab: typeof tabs[number]) => {
              const isActive = tab.id === currentTab
              const href = (tab as any).ownerLink
                ? `/owner/${TEAM_SLUG_TO_OWNER[team.slug] || team.slug.replace('chicago-', '')}`
                : (tab as any).external
                ? `${(tab as any).external}?channel=${team.slug.replace('chicago-', '')}`
                : basePath + tab.path

              const isEdgeTab = tab.id === 'overview'
              return (
                <Link
                  key={tab.id}
                  href={href}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    color: isEdgeTab ? '#00D4FF' : (isActive ? 'var(--sm-text)' : 'var(--sm-text-muted)'),
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
