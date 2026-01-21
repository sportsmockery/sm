'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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

export default function BearsStickyBar({ className = '', isArticlePage }: BearsStickyBarProps) {
  const pathname = usePathname()
  const bearsInfo = TEAM_INFO.bears
  const [tickerData, setTickerData] = useState<TickerData | null>(null)
  const [isLiveGame, setIsLiveGame] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Detect if we're on an article page
  const isArticle = isArticlePage ?? (pathname?.match(/^\/[^/]+\/[^/]+$/) !== null && !pathname?.startsWith('/teams/'))

  // Fetch ticker data
  const fetchTicker = useCallback(async () => {
    try {
      const res = await fetch('/api/bears/ticker')
      const data = await res.json()
      setTickerData(data)
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
    fetchTicker()

    const startPolling = (isLive: boolean) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      const interval = isLive ? LIVE_POLL_INTERVAL : NORMAL_POLL_INTERVAL
      intervalRef.current = setInterval(async () => {
        const nowLive = await fetchTicker()
        if (nowLive !== isLive) {
          startPolling(nowLive)
        }
      }, interval)
    }

    startPolling(false)

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
    lastGame: tickerData?.lastGame ? {
      opponent: tickerData.lastGame.opponent,
      opponentFull: tickerData.lastGame.opponentFull,
      result: tickerData.lastGame.result,
      score: tickerData.lastGame.score,
      week: tickerData.lastGame.week,
      gameType: tickerData.lastGame.gameType,
    } : null,
    liveGame: tickerData?.liveGame || null,
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${isArticle ? 'h-[40px]' : 'h-[44px]'} ${className}`}
      style={{
        background: `linear-gradient(90deg, ${bearsInfo.primaryColor} 0%, #1a2a44 100%)`,
      }}
    >
      <div className="h-full w-full">
        <div className="flex items-center justify-between h-full max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* Left: Bears Logo + Info */}
          <div className="flex items-center gap-4">
            <Link href="/chicago-bears" className="flex items-center gap-2 group">
              <Image
                src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png"
                alt="Chicago Bears"
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
                unoptimized
              />
              <span className="hidden sm:inline text-white font-semibold text-sm group-hover:text-orange-300 transition-colors">
                Bears
              </span>
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-white/20" />

            {/* Live Game or Record */}
            {bearsData.liveGame ? (
              <div className="flex items-center gap-3">
                {/* Enhanced pulsing live indicator */}
                <span className="relative flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-red-400">Live</span>
                </span>
                <span className="text-white font-bold text-sm">
                  CHI {bearsData.liveGame.bearsScore} - {bearsData.liveGame.opponentScore} {bearsData.liveGame.opponent}
                </span>
                <span className="text-white/60 text-xs">
                  Q{bearsData.liveGame.quarter} {bearsData.liveGame.clock}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">{bearsData.record}</span>
                <span className="text-white/50 text-xs hidden sm:inline">Record</span>
              </div>
            )}

            {/* Next Game - Desktop Only */}
            {bearsData.nextGame && !bearsData.liveGame && (
              <>
                <div className="w-px h-5 bg-white/20 hidden lg:block" />
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-white/50 text-xs">Next:</span>
                  <span className="text-white/70 text-xs">{bearsData.nextGame.isHome ? 'vs' : '@'}</span>
                  {bearsData.nextGame.opponentAbbrev && (
                    <Image
                      src={`https://a.espncdn.com/i/teamlogos/nfl/500/${getTeamLogoCode(bearsData.nextGame.opponentAbbrev)}.png`}
                      alt={bearsData.nextGame.opponentAbbrev}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                      unoptimized
                    />
                  )}
                  <span className="text-white/70 text-xs">
                    {bearsData.nextGame.date} {bearsData.nextGame.time}
                  </span>
                  {/* Weather info */}
                  {tickerData?.nextGame?.temp && (
                    <span className="text-white/50 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                      {tickerData.nextGame.temp}°F
                      {tickerData.nextGame.wind && ` • ${tickerData.nextGame.wind}mph`}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Last Game - Show when no next game */}
            {!bearsData.nextGame && !bearsData.liveGame && bearsData.lastGame && (
              <>
                <div className="w-px h-5 bg-white/20 hidden lg:block" />
                <Link
                  href="/chicago-bears/scores"
                  className="hidden lg:flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                >
                  <span className="text-white/50 text-xs">Last:</span>
                  <span className={`text-xs font-bold ${bearsData.lastGame.result === 'W' ? 'text-green-400' : 'text-red-400'}`}>
                    {bearsData.lastGame.result}
                  </span>
                  <span className="text-white font-medium text-xs">
                    {bearsData.lastGame.score}
                  </span>
                  <span className="text-white/60 text-xs">
                    vs {bearsData.lastGame.opponent}
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Schedule */}
            <Link
              href="/chicago-bears/schedule"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule</span>
            </Link>

            {/* Roster */}
            <Link
              href="/chicago-bears/roster"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Roster</span>
            </Link>

            {/* Get Alerts - White button with team color text */}
            <Link
              href="/bears/subscribe"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-white hover:bg-gray-100"
              style={{ color: bearsInfo.secondaryColor }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="hidden sm:inline">Alerts</span>
            </Link>

            {/* Data Hub - Primary CTA */}
            <Link
              href="/bears"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-90"
              style={{
                backgroundColor: bearsInfo.secondaryColor,
                color: 'white',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Data Hub</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
