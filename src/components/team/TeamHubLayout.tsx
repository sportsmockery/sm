'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { useTeamRecord } from '@/contexts/TeamRecordContext'
import { useTheme } from '@/contexts/ThemeContext'
import CountUpValue from './CountUp'
import HeroParticles from './HeroParticles'
import HeroSearchBar from './HeroSearchBar'

/**
 * Team Hub Layout Component
 *
 * 2030 Premium Design System: Team Hubs
 * - Team Hero with team-hero-{slug} accent background + sm-grid-overlay
 * - Framer Motion hero entrance + shimmer logo + count-up record
 * - Particle background + red gradient overlay
 * - SM logo top-left, inline search bar
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
  const prefersReducedMotion = useReducedMotion()

  let theme = 'dark'
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const themeCtx = useTheme()
    theme = themeCtx.theme
  } catch {
    // ThemeContext may not be available in all render paths
  }

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

  // Count-up record display
  const renderCountUpRecord = () => {
    if (!record) return '--'

    const wins = <CountUpValue value={record.wins} duration={1000} />
    const losses = <CountUpValue value={record.losses} duration={1000} delay={300} />

    if (team.league === 'NFL' && record.ties && record.ties > 0) {
      const ties = <CountUpValue value={record.ties} duration={1000} delay={600} />
      return <>{wins}-{losses}-{ties}</>
    }
    if (team.league === 'NHL' && record.otLosses && record.otLosses > 0) {
      const ot = <CountUpValue value={record.otLosses} duration={1000} delay={600} />
      return <>{wins}-{losses}-{ot}</>
    }
    return <>{wins}-{losses}</>
  }

  // Motion variants for hero entrance
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  }

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
        {/* Particle dots background */}
        <HeroParticles />

        {/* Red gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(188,0,0,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* Grid overlay */}
        <div className="sm-grid-overlay" />

        {/* SM Logo - top left */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '24px',
            zIndex: 2,
            opacity: 0.7,
            transition: 'opacity 0.3s',
          }}
          className="hero-sm-logo"
        >
          <Image
            src={theme === 'light' ? '/downloads/sm-logo-light.png' : '/downloads/sm-logo-dark.png'}
            alt="Sports Mockery"
            width={120}
            height={30}
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
            unoptimized
          />
        </div>

        {/* Content */}
        <motion.div
          style={{ position: 'relative', zIndex: 1, maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}
          variants={prefersReducedMotion ? undefined : heroContainerVariants}
          initial={prefersReducedMotion ? undefined : 'hidden'}
          animate={prefersReducedMotion ? undefined : 'visible'}
        >
          {/* Team header row */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '32px' }}
            variants={prefersReducedMotion ? undefined : heroItemVariants}
          >
            {/* Logo with shimmer pulse */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : { scale: [0.97, 1.03, 0.97] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              }
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
            </motion.div>

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
          </motion.div>

          {/* Stats bar - glass pills with count-up */}
          <motion.div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '28px',
            }}
            variants={prefersReducedMotion ? undefined : heroItemVariants}
          >
            {/* Record with count-up */}
            <div
              className="glass-card glass-card-sm glass-card-static"
              style={{ textAlign: 'center', minWidth: '120px', padding: '16px 20px' }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {renderCountUpRecord()}
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
          </motion.div>

          {/* Inline search bar scaffold */}
          <motion.div variants={prefersReducedMotion ? undefined : heroItemVariants}>
            <HeroSearchBar teamName={team.name} />
          </motion.div>
        </motion.div>
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
          padding: '48px 24px 48px',
          background: 'var(--sm-dark)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
