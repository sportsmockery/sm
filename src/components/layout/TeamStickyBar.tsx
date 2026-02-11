'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CHICAGO_TEAMS, ESPN_TEAM_IDS } from '@/lib/team-config'
import { useTeamRecord } from '@/contexts/TeamRecordContext'

type TeamKey = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'

interface TeamStickyBarProps {
  teamKey: TeamKey
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
    opponentLogo?: string
    date: string
    fullDate?: string
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
    opponentLogo?: string
    result: string
    score: string
    date?: string
    gameId?: string
  } | null
  liveGame?: {
    opponent: string
    teamScore: number
    opponentScore: number
    period: number | string
    clock: string
    possession?: string
  } | null
}

// Polling intervals
const LIVE_POLL_INTERVAL = 10000 // 10 seconds during live games
const NORMAL_POLL_INTERVAL = 300000 // 5 minutes during non-game times

// Team-specific configuration
const TEAM_CONFIG: Record<TeamKey, {
  abbrev: string
  league: 'nfl' | 'nba' | 'mlb' | 'nhl'
  periodLabel: string
  dataHubPath: string
  hasSchedulePage: boolean
  hasRosterPage: boolean
  hasScoresPage: boolean
}> = {
  bears: {
    abbrev: 'CHI',
    league: 'nfl',
    periodLabel: 'Q',
    dataHubPath: '/bears',
    hasSchedulePage: true,
    hasRosterPage: true,
    hasScoresPage: true,
  },
  bulls: {
    abbrev: 'CHI',
    league: 'nba',
    periodLabel: 'Q',
    dataHubPath: '/bulls',
    hasSchedulePage: true,
    hasRosterPage: true,
    hasScoresPage: true,
  },
  cubs: {
    abbrev: 'CHC',
    league: 'mlb',
    periodLabel: 'Inning',
    dataHubPath: '/cubs',
    hasSchedulePage: true,
    hasRosterPage: true,
    hasScoresPage: true,
  },
  whitesox: {
    abbrev: 'CWS',
    league: 'mlb',
    periodLabel: 'Inning',
    dataHubPath: '/white-sox',
    hasSchedulePage: true,
    hasRosterPage: true,
    hasScoresPage: true,
  },
  blackhawks: {
    abbrev: 'CHI',
    league: 'nhl',
    periodLabel: 'P',
    dataHubPath: '/blackhawks',
    hasSchedulePage: true,
    hasRosterPage: true,
    hasScoresPage: true,
  },
}

// ESPN logo URL patterns by league
const getOpponentLogoUrl = (league: string, abbrev: string): string => {
  const leagueMap: Record<string, string> = {
    nfl: 'nfl',
    nba: 'nba',
    mlb: 'mlb',
    nhl: 'nhl',
  }
  return `https://a.espncdn.com/i/teamlogos/${leagueMap[league]}/500/${abbrev.toLowerCase()}.png`
}

// NFL team abbreviation mapping
const NFL_LOGO_MAP: Record<string, string> = {
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
  'CHI': 'chi',
}

// NBA team abbreviation mapping
const NBA_LOGO_MAP: Record<string, string> = {
  'ATL': 'atl', 'BOS': 'bos', 'BKN': 'bkn', 'CHA': 'cha',
  'CHI': 'chi', 'CLE': 'cle', 'DAL': 'dal', 'DEN': 'den',
  'DET': 'det', 'GSW': 'gs', 'GS': 'gs', 'HOU': 'hou',
  'IND': 'ind', 'LAC': 'lac', 'LAL': 'lal', 'MEM': 'mem',
  'MIA': 'mia', 'MIL': 'mil', 'MIN': 'min', 'NOP': 'no', 'NO': 'no',
  'NYK': 'ny', 'NY': 'ny', 'OKC': 'okc', 'ORL': 'orl',
  'PHI': 'phi', 'PHX': 'phx', 'POR': 'por', 'SAC': 'sac',
  'SAS': 'sa', 'SA': 'sa', 'TOR': 'tor', 'UTA': 'utah', 'UTAH': 'utah',
  'WAS': 'wsh', 'WSH': 'wsh',
}

// MLB team abbreviation mapping
const MLB_LOGO_MAP: Record<string, string> = {
  'ARI': 'ari', 'ATL': 'atl', 'BAL': 'bal', 'BOS': 'bos',
  'CHC': 'chc', 'CWS': 'chw', 'CHW': 'chw', 'CIN': 'cin',
  'CLE': 'cle', 'COL': 'col', 'DET': 'det', 'HOU': 'hou',
  'KC': 'kc', 'KCR': 'kc', 'LAA': 'laa', 'LAD': 'lad',
  'MIA': 'mia', 'MIL': 'mil', 'MIN': 'min', 'NYM': 'nym',
  'NYY': 'nyy', 'OAK': 'oak', 'PHI': 'phi', 'PIT': 'pit',
  'SD': 'sd', 'SDP': 'sd', 'SF': 'sf', 'SFG': 'sf',
  'SEA': 'sea', 'STL': 'stl', 'TB': 'tb', 'TBR': 'tb',
  'TEX': 'tex', 'TOR': 'tor', 'WSH': 'wsh', 'WAS': 'wsh',
}

// NHL team abbreviation mapping
const NHL_LOGO_MAP: Record<string, string> = {
  'ANA': 'ana', 'ARI': 'ari', 'BOS': 'bos', 'BUF': 'buf',
  'CGY': 'cgy', 'CAR': 'car', 'CHI': 'chi', 'COL': 'col',
  'CBJ': 'cbj', 'DAL': 'dal', 'DET': 'det', 'EDM': 'edm',
  'FLA': 'fla', 'LA': 'la', 'LAK': 'la', 'MIN': 'min',
  'MTL': 'mtl', 'NSH': 'nsh', 'NJ': 'nj', 'NJD': 'nj',
  'NYI': 'nyi', 'NYR': 'nyr', 'OTT': 'ott', 'PHI': 'phi',
  'PIT': 'pit', 'SJ': 'sj', 'SJS': 'sj', 'SEA': 'sea',
  'STL': 'stl', 'TB': 'tbl', 'TBL': 'tbl', 'TOR': 'tor',
  'VAN': 'van', 'VGK': 'vgk', 'WAS': 'wsh', 'WSH': 'wsh',
  'WPG': 'wpg', 'UTA': 'uta',
}

const getLogoMap = (league: string): Record<string, string> => {
  switch (league) {
    case 'nfl': return NFL_LOGO_MAP
    case 'nba': return NBA_LOGO_MAP
    case 'mlb': return MLB_LOGO_MAP
    case 'nhl': return NHL_LOGO_MAP
    default: return {}
  }
}

export default function TeamStickyBar({ teamKey, className = '', isArticlePage }: TeamStickyBarProps) {
  const pathname = usePathname()
  const teamInfo = CHICAGO_TEAMS[teamKey]
  const config = TEAM_CONFIG[teamKey]
  const [tickerData, setTickerData] = useState<TickerData | null>(null)
  const [isLiveGame, setIsLiveGame] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { record: heroRecord } = useTeamRecord()

  // Detect if we're on an article page
  const isArticle = isArticlePage ?? (pathname?.match(/^\/[^/]+\/[^/]+$/) !== null && !pathname?.startsWith('/teams/'))

  // Fetch ticker data
  const fetchTicker = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${teamKey}/ticker`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTickerData(data)
      const hasLiveGame = !!data.liveGame
      setIsLiveGame(hasLiveGame)
      return hasLiveGame
    } catch (err) {
      console.error(`Failed to fetch ${teamKey} ticker:`, err)
      return false
    }
  }, [teamKey])

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

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchTicker])

  // Get logo URL for opponent
  const getOpponentLogo = (abbrev: string | undefined): string | null => {
    if (!abbrev) return null
    const logoMap = getLogoMap(config.league)
    const code = logoMap[abbrev.toUpperCase()] || abbrev.toLowerCase()
    return `https://a.espncdn.com/i/teamlogos/${config.league}/500/${code}.png`
  }

  const data = {
    record: heroRecord || tickerData?.record || '--',
    nextGame: tickerData?.nextGame,
    lastGame: tickerData?.lastGame,
    liveGame: tickerData?.liveGame,
  }

  // Determine gradient end color based on team
  const getGradientEndColor = (): string => {
    // Use a darker/muted version for gradient end
    switch (teamKey) {
      case 'bears': return '#1a2a44'
      case 'bulls': return '#1a1a1a'
      case 'cubs': return '#0a1a44'
      case 'whitesox': return '#1a1a1a'
      case 'blackhawks': return '#1a1a1a'
      default: return '#1a1a1a'
    }
  }

  // Determine hover color class based on team
  const getHoverColorClass = (): string => {
    switch (teamKey) {
      case 'bears': return 'hover:text-orange-300'
      case 'bulls': return 'hover:text-red-300'
      case 'cubs': return 'hover:text-blue-300'
      case 'whitesox': return 'hover:text-gray-300'
      case 'blackhawks': return 'hover:text-red-300'
      default: return 'hover:text-white'
    }
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${isArticle ? 'h-[40px]' : 'h-[44px]'} ${className}`}
      style={{
        background: `linear-gradient(90deg, ${teamInfo.primaryColor} 0%, ${getGradientEndColor()} 100%)`,
      }}
    >
      <div className="h-full w-full">
        <div className="flex items-center justify-between h-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Left: Team Logo + Info */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Link href={`/${teamInfo.slug}`} className={`flex items-center gap-1.5 sm:gap-2 group flex-shrink-0`}>
              <Image
                src={teamInfo.logo}
                alt={teamInfo.name}
                width={28}
                height={28}
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                unoptimized
              />
              <span className={`hidden sm:inline text-white font-semibold text-sm ${getHoverColorClass()} transition-colors`}>
                {teamInfo.shortName}
              </span>
            </Link>

            {/* Divider */}
            <div className="w-px h-5 bg-white/20 flex-shrink-0" />

            {/* Live Game or Record */}
            {data.liveGame ? (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Enhanced pulsing live indicator */}
                <span className="relative flex items-center gap-1 sm:gap-1.5 text-xs font-bold uppercase tracking-wide flex-shrink-0">
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                  </span>
                  <span className="text-red-400 hidden sm:inline">Live</span>
                </span>
                <span className="text-white font-bold text-xs sm:text-sm truncate">
                  {config.abbrev} {data.liveGame.teamScore} - {data.liveGame.opponentScore} {data.liveGame.opponent}
                </span>
                <span className="text-white/60 text-xs hidden sm:inline flex-shrink-0">
                  {config.periodLabel}{data.liveGame.period} {data.liveGame.clock}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">{data.record}</span>
                <span className="text-white/50 text-[10px] sm:text-xs hidden sm:inline">Record</span>
              </div>
            )}

            {/* Next Game - Desktop Only */}
            {data.nextGame && !data.liveGame && (
              <>
                <div className="w-px h-5 bg-white/20 hidden lg:block flex-shrink-0" />
                <div className="hidden lg:flex items-center gap-2 min-w-0">
                  <span className="text-white/50 text-xs flex-shrink-0">Next:</span>
                  <span className="text-white/70 text-xs flex-shrink-0">{data.nextGame.isHome ? 'vs' : '@'}</span>
                  {data.nextGame.opponentAbbrev && (
                    <Image
                      src={data.nextGame.opponentLogo || getOpponentLogo(data.nextGame.opponentAbbrev) || ''}
                      alt={data.nextGame.opponentAbbrev}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain flex-shrink-0"
                      unoptimized
                    />
                  )}
                  <span className="text-white/70 text-xs truncate">
                    {data.nextGame.date} {data.nextGame.time}
                  </span>
                </div>
              </>
            )}

            {/* Last Game - Show when no next game */}
            {!data.nextGame && !data.liveGame && data.lastGame && (
              <>
                <div className="w-px h-5 bg-white/20 hidden lg:block flex-shrink-0" />
                <Link
                  href={`/${teamInfo.slug}/scores`}
                  className="hidden lg:flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                >
                  <span className="text-white/50 text-xs">Last:</span>
                  <span className={`text-xs font-bold ${data.lastGame.result === 'W' ? 'text-green-400' : 'text-red-400'}`}>
                    {data.lastGame.result}
                  </span>
                  <span className="text-white font-medium text-xs">
                    {data.lastGame.score}
                  </span>
                  {data.lastGame.opponentLogo && (
                    <Image
                      src={data.lastGame.opponentLogo}
                      alt={data.lastGame.opponent}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain flex-shrink-0"
                      unoptimized
                    />
                  )}
                  <span className="text-white/60 text-xs">
                    {data.lastGame.opponent}
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Right: Quick Actions - Condensed on mobile */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Schedule - Hidden on mobile, styled like Alerts button */}
            {config.hasSchedulePage && (
              <Link
                href={`/${teamInfo.slug}/schedule`}
                className="hidden md:flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-white hover:bg-gray-100"
                style={{ color: teamInfo.secondaryColor }}
              >
                Schedule
              </Link>
            )}

            {/* Roster - Hidden on mobile, styled like Alerts button */}
            {config.hasRosterPage && (
              <Link
                href={`/${teamInfo.slug}/roster`}
                className="hidden md:flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-white hover:bg-gray-100"
                style={{ color: teamInfo.secondaryColor }}
              >
                Roster
              </Link>
            )}

            {/* Get Alerts - White button with team color text */}
            <Link
              href={`/${teamKey}/subscribe`}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-white hover:bg-gray-100"
              style={{ color: teamInfo.secondaryColor }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="hidden sm:inline">Alerts</span>
            </Link>

            {/* Data Hub - Primary CTA */}
            <Link
              href={config.dataHubPath}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-90"
              style={{
                backgroundColor: teamInfo.secondaryColor,
                color: teamKey === 'whitesox' ? '#000' : 'white', // Dark text for silver background
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Hub</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
