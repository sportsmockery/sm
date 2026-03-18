'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import TeamHeader from './TeamHeader'

/**
 * Team Hub Layout Component
 *
 * Clean, light design with:
 * - Team Hero with logo, name, season badge
 * - Quick links (Trade Rumors, Draft News, Salary Cap, Depth Chart)
 * - Centered sub-navigation with cyan shimmer EDGE tab and red underline
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
const TEAM_TABS = [
  { id: 'overview', label: 'EDGE', path: '' },
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
  { id: 'overview', label: 'EDGE', path: '' },
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
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* ===== TEAM HEADER ===== */}
      <div ref={headerRef}>
        <TeamHeader team={team} />
      </div>

      {/* ===== SUB-NAVIGATION ===== */}
      <nav
        ref={navRef}
        className={`team-sub-nav ${isSticky ? 'sticky' : ''}`}
        style={{
          ...(isSticky ? { top: 'var(--sm-nav-height, 72px)', zIndex: 40 } : {}),
          backgroundColor: '#f1f3f5',
          borderBottom: '1px solid #dee2e6',
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'center',
          transition: 'box-shadow 0.2s ease',
          ...(isSticky ? { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}),
        }}
      >
        <div
          className="nav-container"
          style={{
            display: 'flex',
            gap: '32px',
            overflowX: 'auto',
            padding: '0 20px',
          }}
        >
          {tabs.map((tab: typeof tabs[number]) => {
            const isActive = tab.id === currentTab
            const href = tab.external
              ? `${tab.external}?channel=${team.slug.replace('chicago-', '')}`
              : basePath + tab.path

            const isEdgeTab = tab.id === 'overview'
            return (
              <Link
                key={tab.id}
                href={href}
                className="nav-item"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: isEdgeTab ? 'transparent' : (isActive ? '#111' : '#5f6368'),
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '16px 4px',
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                  ...(isEdgeTab ? {
                    background: 'linear-gradient(90deg, #00bcd4 0%, #ffffff 40%, #ffffff 60%, #00bcd4 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    animation: 'shimmer 3s linear infinite',
                    textShadow: '0 0 8px rgba(0, 188, 212, 0.3)',
                  } : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isEdgeTab) {
                    e.currentTarget.style.color = '#111'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isEdgeTab && !isActive) {
                    e.currentTarget.style.color = '#5f6368'
                  }
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="active-underline"
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      height: '3px',
                      width: '100%',
                      backgroundColor: '#bc0000',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          to {
            background-position: 200% center;
          }
        }
        @media (max-width: 1024px) {
          .nav-container {
            gap: 20px !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>

      {/* ===== MAIN CONTENT ===== */}
      <div
        style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '32px 24px 48px',
          background: '#f8f9fa',
        }}
      >
        {children}
      </div>
    </div>
  )
}
