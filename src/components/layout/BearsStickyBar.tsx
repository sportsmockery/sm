'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { TEAM_INFO } from '@/lib/types'

interface BearsStickyBarProps {
  className?: string
  isArticlePage?: boolean
}

interface TickerData {
  record: string
  regularRecord?: string
  postseasonRecord?: string
  nextGame: {
    opponent: string
    opponentAbbrev?: string
    opponentFull?: string
    date: string
    fullDate: string
    time: string
    temp?: number
    wind?: number
    weather?: string
    spread?: number
    stadium?: string
    isHome?: boolean
    isToday?: boolean
  } | null
  lastGame: {
    opponent: string
    opponentFull?: string
    result: string
    score: string
    week: number
    gameType?: string
  } | null
  liveGame?: {
    opponent: string
    bearsScore: number
    opponentScore: number
    quarter: number
    clock: string
    possession?: string
  } | null
}

// Polling intervals
const LIVE_POLL_INTERVAL = 10000 // 10 seconds during live games
const NORMAL_POLL_INTERVAL = 300000 // 5 minutes during non-game times

/**
 * Bears-focused sticky navigation bar
 * Shows Bears record, next game, and quick links
 * Height: 48px default, 36px on article pages per spec
 *
 * Polling behavior:
 * - Every 10 seconds during live Bears games
 * - Every 5 minutes during non-game times
 */
export default function BearsStickyBar({ className = '', isArticlePage }: BearsStickyBarProps) {
  const pathname = usePathname()
  const bearsInfo = TEAM_INFO.bears
  const [tickerData, setTickerData] = useState<TickerData | null>(null)
  const [isLiveGame, setIsLiveGame] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Detect if we're on an article page (has slug after category)
  const isArticle = isArticlePage ?? (pathname?.match(/^\/[^/]+\/[^/]+$/) !== null && !pathname?.startsWith('/teams/'))

  // Fetch ticker data
  const fetchTicker = useCallback(async () => {
    try {
      const res = await fetch('/api/bears/ticker')
      const data = await res.json()
      setTickerData(data)

      // Check if there's a live game
      const hasLiveGame = !!data.liveGame
      setIsLiveGame(hasLiveGame)

      return hasLiveGame
    } catch (err) {
      console.error('Failed to fetch Bears ticker:', err)
      return false
    }
  }, [])

  // Set up polling with dynamic interval
  useEffect(() => {
    // Initial fetch
    fetchTicker()

    // Set up polling
    const startPolling = (isLive: boolean) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      const interval = isLive ? LIVE_POLL_INTERVAL : NORMAL_POLL_INTERVAL
      intervalRef.current = setInterval(async () => {
        const nowLive = await fetchTicker()

        // If live status changed, update polling interval
        if (nowLive !== isLive) {
          startPolling(nowLive)
        }
      }, interval)
    }

    // Start with normal polling, will switch to live if game detected
    startPolling(false)

    // Also check immediately for live game status
    fetch('/api/bears/sync')
      .then(res => res.json())
      .then(data => {
        if (data.hasLiveGame) {
          setIsLiveGame(true)
          startPolling(true)
        }
      })
      .catch(() => {})

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchTicker])

  // Map team abbreviations to ESPN logo codes
  const getTeamLogoCode = (abbrev: string): string => {
    const logoMap: Record<string, string> = {
      'LA': 'lar', 'LAR': 'lar', 'LAC': 'lac',
      'SF': 'sf', 'SFO': 'sf', 'GB': 'gb', 'GNB': 'gb',
      'NE': 'ne', 'NWE': 'ne', 'TB': 'tb', 'TAM': 'tb',
      'KC': 'kc', 'KAN': 'kc', 'NO': 'no', 'NOR': 'no',
      'LV': 'lv', 'LVR': 'lv', 'MIN': 'min', 'DET': 'det',
      'PHI': 'phi', 'DAL': 'dal', 'NYG': 'nyg', 'WAS': 'was',
      'ATL': 'atl', 'CAR': 'car', 'SEA': 'sea', 'ARI': 'ari',
      'DEN': 'den', 'PIT': 'pit', 'BAL': 'bal', 'CLE': 'cle',
      'CIN': 'cin', 'BUF': 'buf', 'MIA': 'mia', 'NYJ': 'nyj',
      'IND': 'ind', 'TEN': 'ten', 'JAX': 'jax', 'HOU': 'hou',
    }
    return logoMap[abbrev.toUpperCase()] || abbrev.toLowerCase()
  }

  // Use fetched data or fallback
  const bearsData = {
    record: tickerData?.record || '--',
    nextGame: tickerData?.nextGame ? {
      opponent: tickerData.nextGame.opponent,
      opponentAbbrev: tickerData.nextGame.opponentAbbrev,
      date: tickerData.nextGame.date,
      time: tickerData.nextGame.time,
      weather: tickerData.nextGame.weather,
      stadium: tickerData.nextGame.stadium,
      isHome: tickerData.nextGame.isHome,
      isToday: tickerData.nextGame.isToday,
    } : null,
    liveGame: tickerData?.liveGame || null,
  }

  const quickLinks = [
    { name: 'News', href: '/chicago-bears' },
    { name: 'Stats', href: '/chicago-bears/stats' },
    { name: 'Roster', href: '/chicago-bears/roster' },
    { name: 'Scores', href: '/chicago-bears/scores' },
  ]

  return (
    <div
      className={`${isArticle ? 'h-[36px]' : 'h-[48px]'} bg-gradient-to-r from-[${bearsInfo.primaryColor}] to-[#1a2940] ${className}`}
      style={{
        background: `linear-gradient(to right, ${bearsInfo.primaryColor}, #1a2940)`,
      }}
    >
      <div className={`max-w-[1110px] mx-auto ${isArticle ? 'px-3 md:px-4' : 'px-4'} h-full`}>
        <div className="flex items-center justify-between h-full">
          {/* Left: Bears badge + record/live score */}
          <div className="flex items-center gap-3">
            {/* Bears logo */}
            <Link
              href="/chicago-bears"
              className="flex items-center gap-2 group"
            >
              <Image
                src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png"
                alt="Chicago Bears"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                unoptimized
              />
              <span
                className="hidden sm:inline text-white font-bold text-sm uppercase tracking-wide group-hover:text-orange-300 transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Bears
              </span>
            </Link>

            {/* Live Game Score OR Record */}
            {bearsData.liveGame ? (
              <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="text-red-400 text-xs font-bold animate-pulse">LIVE</span>
                <span
                  className="text-white font-bold text-sm"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  CHI {bearsData.liveGame.bearsScore} - {bearsData.liveGame.opponentScore} {bearsData.liveGame.opponent}
                </span>
                <span className="text-white/60 text-xs">
                  Q{bearsData.liveGame.quarter} {bearsData.liveGame.clock}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="text-white/70 text-xs">Record:</span>
                <span
                  className="text-white font-bold text-sm"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {bearsData.record}
                </span>
              </div>
            )}

            {/* Next game (hidden on mobile) */}
            {bearsData.nextGame && (
              <div className="hidden md:flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="text-white/70 text-xs">Next:</span>
                <span className="text-white/70 text-xs">{bearsData.nextGame.isHome ? 'vs' : '@'}</span>
                {bearsData.nextGame.opponentAbbrev && (
                  <Image
                    src={`https://a.espncdn.com/i/teamlogos/nfl/500/${getTeamLogoCode(bearsData.nextGame.opponentAbbrev)}.png`}
                    alt={bearsData.nextGame.opponentAbbrev}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                    unoptimized
                  />
                )}
                <span className="text-white/60 text-xs">
                  {bearsData.nextGame.date} {bearsData.nextGame.time}
                  {bearsData.nextGame.stadium && ` • ${bearsData.nextGame.stadium}`}
                  {bearsData.nextGame.weather && ` • ${bearsData.nextGame.weather}`}
                </span>
              </div>
            )}
          </div>

          {/* Center: Quick links (hidden on small screens) */}
          <nav className="hidden lg:flex items-center gap-1">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-white/80 text-xs font-medium uppercase tracking-wide hover:text-white hover:bg-white/10 rounded transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: CTA button */}
          <Link
            href="/bears/subscribe"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{
              backgroundColor: bearsInfo.secondaryColor,
              color: 'white',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="hidden sm:inline">Get Bears Alerts</span>
            <span className="sm:hidden">Alerts</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
