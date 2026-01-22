'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TeamGameData {
  teamKey: string
  teamName: string
  teamAbbrev: string
  teamLogo: string
  teamColor: string
  scoresPath: string
  isInSeason: boolean
  nextGame: {
    opponent: string
    opponentLogo: string | null
    date: string
    time: string
    isHome: boolean
  } | null
  lastGame: {
    opponent: string
    opponentLogo: string | null
    result: 'W' | 'L' | 'T' | 'OTL'
    teamScore: number
    oppScore: number
    date: string
  } | null
}

const TEAM_CONFIG = {
  bears: {
    name: 'Bears',
    abbrev: 'CHI',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    color: '#0B162A',
    scoresPath: '/chicago-bears/scores',
    // NFL: September through December (add 1, 2 back for playoff teams)
    seasonMonths: [9, 10, 11, 12],
  },
  bulls: {
    name: 'Bulls',
    abbrev: 'CHI',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    color: '#CE1141',
    scoresPath: '/chicago-bulls/scores',
    // NBA: October through June
    seasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6],
  },
  blackhawks: {
    name: 'Blackhawks',
    abbrev: 'CHI',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    color: '#CF0A2C',
    scoresPath: '/chicago-blackhawks/scores',
    // NHL: October through June
    seasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6],
  },
  cubs: {
    name: 'Cubs',
    abbrev: 'CHC',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    color: '#0E3386',
    scoresPath: '/chicago-cubs/scores',
    // MLB: Late March through October
    seasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
  },
  whitesox: {
    name: 'White Sox',
    abbrev: 'CWS',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    color: '#27251F',
    scoresPath: '/chicago-white-sox/scores',
    // MLB: Late March through October
    seasonMonths: [3, 4, 5, 6, 7, 8, 9, 10],
  },
}

type TeamKey = keyof typeof TEAM_CONFIG

function isTeamInSeason(teamKey: TeamKey): boolean {
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const config = TEAM_CONFIG[teamKey]
  return config.seasonMonths.includes(currentMonth)
}

export default function HomepageTeamBar() {
  const [teamsData, setTeamsData] = useState<TeamGameData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeamsData() {
      const inSeasonTeams = (Object.keys(TEAM_CONFIG) as TeamKey[]).filter(isTeamInSeason)

      const teamsPromises = inSeasonTeams.map(async (teamKey) => {
        const config = TEAM_CONFIG[teamKey]

        try {
          // Fetch ticker data from existing API
          const response = await fetch(`/api/teams/${teamKey}/ticker`)
          const data = response.ok ? await response.json() : null

          return {
            teamKey,
            teamName: config.name,
            teamAbbrev: config.abbrev,
            teamLogo: config.logo,
            teamColor: config.color,
            scoresPath: config.scoresPath,
            isInSeason: true,
            nextGame: data?.nextGame ? {
              opponent: data.nextGame.opponentAbbrev || data.nextGame.opponent,
              opponentLogo: data.nextGame.opponentLogo || null,
              date: data.nextGame.date,
              time: data.nextGame.time,
              isHome: data.nextGame.isHome ?? true,
            } : null,
            lastGame: data?.lastGame ? {
              opponent: data.lastGame.opponentAbbrev || data.lastGame.opponent,
              opponentLogo: data.lastGame.opponentLogo || null,
              result: data.lastGame.result?.charAt(0) as 'W' | 'L' | 'T' | 'OTL',
              teamScore: parseInt(data.lastGame.score?.split('-')[0]) || 0,
              oppScore: parseInt(data.lastGame.score?.split('-')[1]) || 0,
              date: data.lastGame.date || '',
            } : null,
          } as TeamGameData
        } catch (error) {
          console.error(`Error fetching ${teamKey} data:`, error)
          return {
            teamKey,
            teamName: config.name,
            teamAbbrev: config.abbrev,
            teamLogo: config.logo,
            teamColor: config.color,
            scoresPath: config.scoresPath,
            isInSeason: true,
            nextGame: null,
            lastGame: null,
          } as TeamGameData
        }
      })

      const results = await Promise.all(teamsPromises)
      // Show all in-season teams (even if no game data available)
      setTeamsData(results)
      setLoading(false)
    }

    fetchTeamsData()

    // Refresh every 5 minutes
    const interval = setInterval(fetchTeamsData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="w-full bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
            Loading Chicago sports...
          </div>
        </div>
      </div>
    )
  }

  if (teamsData.length === 0) {
    return null // No teams in season
  }

  return (
    <div className="w-full bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-stretch justify-center divide-x divide-zinc-700/50 overflow-x-auto scrollbar-hide">
          {teamsData.map((team) => (
            <TeamSection key={team.teamKey} team={team} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TeamSection({ team }: { team: TeamGameData }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 min-w-fit">
      {/* Team Logo */}
      <Link href={`/chicago-${team.teamKey === 'whitesox' ? 'white-sox' : team.teamKey}`} className="flex-shrink-0">
        <Image
          src={team.teamLogo}
          alt={team.teamName}
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
          unoptimized
        />
      </Link>

      {/* Last Game Result */}
      {team.lastGame && (
        <Link
          href={team.scoresPath}
          className="flex items-center gap-2 hover:bg-zinc-800/50 rounded px-2 py-1 transition-colors"
          title="View box score"
        >
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            team.lastGame.result === 'W'
              ? 'bg-green-500/20 text-green-400'
              : team.lastGame.result === 'OTL'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {team.lastGame.result}
          </span>
          <span className="text-zinc-300 text-sm font-medium">
            {team.lastGame.teamScore}-{team.lastGame.oppScore}
          </span>
          {team.lastGame.opponentLogo ? (
            <Image
              src={team.lastGame.opponentLogo}
              alt={team.lastGame.opponent}
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
              unoptimized
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <span className="text-zinc-500 text-xs">
            {team.lastGame.opponent}
          </span>
        </Link>
      )}

      {/* Divider */}
      {team.lastGame && team.nextGame && (
        <div className="w-px h-6 bg-zinc-700/50" />
      )}

      {/* Next Game */}
      {team.nextGame && (
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs uppercase tracking-wider">Next</span>
          <span className="text-zinc-400 text-xs">
            {team.nextGame.isHome ? 'vs' : '@'}
          </span>
          {team.nextGame.opponentLogo ? (
            <Image
              src={team.nextGame.opponentLogo}
              alt={team.nextGame.opponent}
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
              unoptimized
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <span className="text-zinc-300 text-sm">
            {team.nextGame.opponent}
          </span>
          <span className="text-zinc-500 text-xs">
            {team.nextGame.date} {team.nextGame.time}
          </span>
        </div>
      )}

      {/* No games message */}
      {!team.lastGame && !team.nextGame && (
        <span className="text-zinc-500 text-xs">Schedule loading...</span>
      )}
    </div>
  )
}
