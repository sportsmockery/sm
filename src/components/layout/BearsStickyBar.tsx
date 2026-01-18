'use client'

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
    opponentFull?: string
    date: string
    fullDate: string
    time: string
    temp?: number
    wind?: number
    weather?: string
    spread?: number
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

  // Use fetched data or fallback
  const bearsData = {
    record: tickerData?.record || '--',
    nextGame: tickerData?.nextGame ? {
      opponent: tickerData.nextGame.opponent,
      date: tickerData.nextGame.date,
      time: tickerData.nextGame.time,
      weather: tickerData.nextGame.weather,
      isToday: tickerData.nextGame.isToday,
    } : null,
    liveGame: tickerData?.liveGame || null,
  }

  const quickLinks = [
    { name: 'News', href: '/chicago-bears' },
    { name: 'Data Hub', href: '/bears/data' },
    { name: 'Rumors', href: '/bears/rumors' },
    { name: 'Podcasts', href: '/podcasts?team=bears' },
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
            {/* Bears logo/badge */}
            <Link
              href="/chicago-bears"
              className="flex items-center gap-2 group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ backgroundColor: bearsInfo.secondaryColor }}
              >
                <span className="font-montserrat">B</span>
              </div>
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
                <span
                  className="text-white font-semibold text-sm"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {bearsData.nextGame.opponent}
                </span>
                <span className="text-white/60 text-xs">
                  {bearsData.nextGame.date} {bearsData.nextGame.time}
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
