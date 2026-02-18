'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { TeamInfo } from '@/components/team/TeamHubLayout'
import type { LastGameWithId } from '@/lib/team-config'

interface LastGameBoxScoreProps {
  team: TeamInfo
  lastGame: LastGameWithId
}

interface BoxScoreData {
  team: {
    score: number
    result: 'W' | 'L' | null
    isHome: boolean
    players: PlayerStats[]
  }
  opponent: {
    abbrev: string
    fullName: string
    score: number
    logo: string
    players: PlayerStats[]
  }
  venue?: string
  date?: string
}

interface PlayerStats {
  name: string
  position: string
  headshotUrl?: string | null
  // NBA
  minutes?: string | null
  points?: number | null
  rebounds?: number | null
  assists?: number | null
  steals?: number | null
  blocks?: number | null
  fgm?: number | null
  fga?: number | null
  tpm?: number | null
  tpa?: number | null
  // NFL
  passingCmp?: number | null
  passingAtt?: number | null
  passingYds?: number | null
  passingTd?: number | null
  rushingCar?: number | null
  rushingYds?: number | null
  rushingTd?: number | null
  receivingRec?: number | null
  receivingYds?: number | null
  receivingTd?: number | null
  defTacklesTotal?: number | null
  defSacks?: number | null
  // NHL
  goals?: number | null
  nhlAssists?: number | null
  nhlPoints?: number | null
  shots?: number | null
  plusMinus?: number | null
  // MLB
  atBats?: number | null
  hits?: number | null
  homeRuns?: number | null
  rbi?: number | null
  inningsPitched?: string | null
  strikeouts?: number | null
  era?: number | null
}

// Team logos
const TEAM_LOGOS: Record<string, string> = {
  bears: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
  bulls: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
  blackhawks: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
  cubs: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
  whitesox: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
}

// Map team slugs to API endpoints
const TEAM_ENDPOINTS: Record<string, string> = {
  'chicago-bears': 'bears',
  'chicago-bulls': 'bulls',
  'chicago-blackhawks': 'blackhawks',
  'chicago-cubs': 'cubs',
  'chicago-white-sox': 'whitesox',
}

export default function LastGameBoxScore({ team, lastGame }: LastGameBoxScoreProps) {
  const [boxScore, setBoxScore] = useState<BoxScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTeam, setActiveTeam] = useState<'team' | 'opponent'>('team')

  const teamKey = TEAM_ENDPOINTS[team.slug] || team.slug.replace('chicago-', '')
  const teamLogo = TEAM_LOGOS[teamKey] || team.logo

  useEffect(() => {
    if (!lastGame.gameId) {
      setIsLoading(false)
      setError('No game ID available')
      return
    }

    const fetchBoxScore = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/${teamKey}/boxscore/${lastGame.gameId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch box score')
        }
        const data = await res.json()

        // Transform API response to unified format
        // Each team's API returns data under its own key (bears, bulls, etc.)
        const teamData = data[teamKey] || data.bears || data.bulls || data.blackhawks || data.cubs || data.whitesox

        // Bears returns categorized stats, other teams return players array
        // Flatten Bears stats into a single players array for display
        let teamPlayers: PlayerStats[] = []
        if (teamData?.players) {
          teamPlayers = teamData.players
        } else if (teamData?.passing || teamData?.rushing || teamData?.receiving || teamData?.defense) {
          // Bears format - combine all categories
          const passing = (teamData.passing || []).map((p: any) => ({ ...p, category: 'passing' }))
          const rushing = (teamData.rushing || []).map((p: any) => ({ ...p, category: 'rushing' }))
          const receiving = (teamData.receiving || []).map((p: any) => ({ ...p, category: 'receiving' }))
          const defense = (teamData.defense || []).map((p: any) => ({ ...p, category: 'defense' }))
          teamPlayers = [...passing, ...rushing, ...receiving, ...defense]
        }

        let oppPlayers: PlayerStats[] = []
        if (data.opponent?.players) {
          oppPlayers = data.opponent.players
        } else if (data.opponent?.passing || data.opponent?.rushing) {
          const passing = (data.opponent.passing || []).map((p: any) => ({ ...p, category: 'passing' }))
          const rushing = (data.opponent.rushing || []).map((p: any) => ({ ...p, category: 'rushing' }))
          const receiving = (data.opponent.receiving || []).map((p: any) => ({ ...p, category: 'receiving' }))
          const defense = (data.opponent.defense || []).map((p: any) => ({ ...p, category: 'defense' }))
          oppPlayers = [...passing, ...rushing, ...receiving, ...defense]
        }

        const transformed: BoxScoreData = {
          team: {
            score: teamData?.score ?? lastGame.teamScore,
            result: teamData?.result ?? lastGame.result,
            isHome: teamData?.isHome ?? lastGame.isHome,
            players: teamPlayers,
          },
          opponent: {
            abbrev: data.opponent?.abbrev ?? lastGame.opponentAbbrev ?? '',
            fullName: data.opponent?.fullName ?? lastGame.opponent,
            score: data.opponent?.score ?? lastGame.opponentScore,
            logo: data.opponent?.logo ?? '',
            players: oppPlayers,
          },
          venue: data.venue,
          date: data.date ?? lastGame.date,
        }

        setBoxScore(transformed)
        setError(null)
      } catch (err) {
        console.error('[LastGameBoxScore] Error:', err)
        setError('Failed to load box score')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoxScore()
  }, [lastGame.gameId, teamKey])

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: 'var(--sm-card)' }}>
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: team.secondaryColor, borderTopColor: 'transparent' }}
            />
            <span style={{ color: 'var(--sm-text-muted)' }}>Loading box score...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error or no data state
  if (error || !boxScore) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <LastGameHeader team={team} lastGame={lastGame} teamLogo={teamLogo} />
        <div className="rounded-xl p-12 text-center mt-6" style={{ backgroundColor: 'var(--sm-card)' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            {error || 'Box score not available for this game'}
          </p>
          <Link
            href={`/${team.slug}/scores`}
            className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: team.secondaryColor, color: '#fff' }}
          >
            View All Scores
          </Link>
        </div>
      </div>
    )
  }

  const currentPlayers = activeTeam === 'team' ? boxScore.team.players : boxScore.opponent.players

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--sm-text-muted)' }}>
            Last Game
          </span>
        </div>
      </div>

      {/* Game Score Header */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.primaryColor}dd 100%)`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6">
          {/* Team */}
          <div className="flex items-center gap-4">
            <Image
              src={teamLogo}
              alt={team.name}
              width={64}
              height={64}
              className="w-16 h-16"
              unoptimized
            />
            <div>
              <div className="text-sm text-white/60">Chicago</div>
              <div className="text-4xl font-bold">{boxScore.team.score}</div>
            </div>
          </div>

          {/* Result badge */}
          <div
            className={`px-4 py-2 rounded-lg font-bold text-lg ${
              boxScore.team.result === 'W'
                ? 'bg-green-500/20 text-green-400'
                : boxScore.team.result === 'L'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/20 text-white'
            }`}
          >
            {boxScore.team.result === 'W' ? 'WIN' : boxScore.team.result === 'L' ? 'LOSS' : 'TIE'}
          </div>

          {/* Opponent */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-white/60">{boxScore.opponent.fullName}</div>
              <div className="text-4xl font-bold">{boxScore.opponent.score}</div>
            </div>
            {boxScore.opponent.logo && (
              <Image
                src={boxScore.opponent.logo}
                alt={boxScore.opponent.fullName}
                width={64}
                height={64}
                className="w-16 h-16"
                unoptimized
              />
            )}
          </div>
        </div>

        {/* Game info */}
        <div className="text-center mt-4 text-sm text-white/60">
          {lastGame.date}
          {boxScore.venue && <span> &bull; {boxScore.venue}</span>}
        </div>
      </div>

      {/* Team Toggle */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--sm-border)' }}>
        <button
          onClick={() => setActiveTeam('team')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors ${
            activeTeam === 'team'
              ? 'text-white'
              : 'hover:brightness-95 dark:hover:brightness-110'
          }`}
          style={activeTeam === 'team'
            ? { backgroundColor: team.primaryColor }
            : { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text-muted)' }
          }
        >
          <Image src={teamLogo} alt={team.shortName} width={24} height={24} className="w-6 h-6" unoptimized />
          {team.shortName}
        </button>
        <button
          onClick={() => setActiveTeam('opponent')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors ${
            activeTeam === 'opponent'
              ? 'text-white'
              : 'hover:brightness-95 dark:hover:brightness-110'
          }`}
          style={activeTeam === 'opponent'
            ? { backgroundColor: team.primaryColor }
            : { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text-muted)' }
          }
        >
          {boxScore.opponent.logo && (
            <Image
              src={boxScore.opponent.logo}
              alt={boxScore.opponent.abbrev}
              width={24}
              height={24}
              className="w-6 h-6"
              unoptimized
            />
          )}
          {boxScore.opponent.fullName}
        </button>
      </div>

      {/* Player Stats */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
        {lastGame.sport === 'nba' && <NBAStatsTable players={currentPlayers} />}
        {lastGame.sport === 'nfl' && <NFLStatsTable players={currentPlayers} />}
        {lastGame.sport === 'nhl' && <NHLStatsTable players={currentPlayers} />}
        {lastGame.sport === 'mlb' && <MLBStatsTable players={currentPlayers} />}
      </div>

      {/* Link to full scores page */}
      <div className="text-center">
        <Link
          href={`/${team.slug}/scores`}
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: team.secondaryColor }}
        >
          View All Game Scores
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

// Simple header for error states
function LastGameHeader({
  team,
  lastGame,
  teamLogo,
}: {
  team: TeamInfo
  lastGame: LastGameWithId
  teamLogo: string
}) {
  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{
        background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.primaryColor}dd 100%)`,
      }}
    >
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-3">
          <Image src={teamLogo} alt={team.name} width={48} height={48} className="w-12 h-12" unoptimized />
          <span className="text-2xl font-bold">{lastGame.teamScore}</span>
        </div>
        <div
          className={`px-3 py-1 rounded font-bold ${
            lastGame.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {lastGame.result}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{lastGame.opponentScore}</span>
          {lastGame.opponentLogo && (
            <Image
              src={lastGame.opponentLogo}
              alt={lastGame.opponent}
              width={48}
              height={48}
              className="w-12 h-12"
              unoptimized
            />
          )}
        </div>
      </div>
      <div className="text-center mt-2 text-sm text-white/60">{lastGame.date}</div>
    </div>
  )
}

// NBA Stats Table
function NBAStatsTable({ players }: { players: PlayerStats[] }) {
  if (!players.length) return <EmptyStats />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
            <th className="px-4 py-3 sticky left-0" style={{ backgroundColor: 'var(--sm-surface)' }}>Player</th>
            <th className="px-3 py-3 text-center">MIN</th>
            <th className="px-3 py-3 text-center">PTS</th>
            <th className="px-3 py-3 text-center">REB</th>
            <th className="px-3 py-3 text-center">AST</th>
            <th className="px-3 py-3 text-center">FG</th>
            <th className="px-3 py-3 text-center">3PT</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => (
            <tr key={i} className="last:border-0 hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-4 py-3 sticky left-0" style={{ backgroundColor: 'var(--sm-card)' }}>
                <PlayerCell player={player} />
              </td>
              <td className="px-3 py-3 text-center font-mono text-sm" style={{ color: 'var(--sm-text-muted)' }}>{player.minutes || '-'}</td>
              <td className="px-3 py-3 text-center font-bold" style={{ color: 'var(--sm-text)' }}>{player.points ?? '-'}</td>
              <td className="px-3 py-3 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.rebounds ?? '-'}</td>
              <td className="px-3 py-3 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.assists ?? '-'}</td>
              <td className="px-3 py-3 text-center font-mono text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                {player.fgm ?? 0}-{player.fga ?? 0}
              </td>
              <td className="px-3 py-3 text-center font-mono text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                {player.tpm ?? 0}-{player.tpa ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// NFL Stats Table
function NFLStatsTable({ players }: { players: PlayerStats[] }) {
  if (!players.length) return <EmptyStats />

  // Categorize players by stats
  const passers = players.filter(p => p.passingAtt && p.passingAtt > 0)
  const rushers = players.filter(p => p.rushingCar && p.rushingCar > 0)
  const receivers = players.filter(p => p.receivingRec && p.receivingRec > 0)

  return (
    <div>
      {passers.length > 0 && (
        <div className="p-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
          <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--sm-text-muted)' }}>Passing</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  <th className="text-left pb-2">Player</th>
                  <th className="text-center pb-2">C/ATT</th>
                  <th className="text-center pb-2">YDS</th>
                  <th className="text-center pb-2">TD</th>
                </tr>
              </thead>
              <tbody>
                {passers.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2"><PlayerCell player={p} /></td>
                    <td className="text-center font-mono">{p.passingCmp}/{p.passingAtt}</td>
                    <td className="text-center font-bold">{p.passingYds}</td>
                    <td className="text-center text-green-500 font-bold">{p.passingTd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {rushers.length > 0 && (
        <div className="p-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
          <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--sm-text-muted)' }}>Rushing</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  <th className="text-left pb-2">Player</th>
                  <th className="text-center pb-2">CAR</th>
                  <th className="text-center pb-2">YDS</th>
                  <th className="text-center pb-2">TD</th>
                </tr>
              </thead>
              <tbody>
                {rushers.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2"><PlayerCell player={p} /></td>
                    <td className="text-center font-mono">{p.rushingCar}</td>
                    <td className="text-center font-bold">{p.rushingYds}</td>
                    <td className="text-center text-green-500 font-bold">{p.rushingTd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {receivers.length > 0 && (
        <div className="p-4">
          <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--sm-text-muted)' }}>Receiving</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  <th className="text-left pb-2">Player</th>
                  <th className="text-center pb-2">REC</th>
                  <th className="text-center pb-2">YDS</th>
                  <th className="text-center pb-2">TD</th>
                </tr>
              </thead>
              <tbody>
                {receivers.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2"><PlayerCell player={p} /></td>
                    <td className="text-center font-mono">{p.receivingRec}</td>
                    <td className="text-center font-bold">{p.receivingYds}</td>
                    <td className="text-center text-green-500 font-bold">{p.receivingTd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// NHL Stats Table
function NHLStatsTable({ players }: { players: PlayerStats[] }) {
  if (!players.length) return <EmptyStats />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
            <th className="px-4 py-3">Player</th>
            <th className="px-3 py-3 text-center">G</th>
            <th className="px-3 py-3 text-center">A</th>
            <th className="px-3 py-3 text-center">PTS</th>
            <th className="px-3 py-3 text-center">SOG</th>
            <th className="px-3 py-3 text-center">+/-</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => (
            <tr key={i} className="last:border-0 hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-4 py-3"><PlayerCell player={player} /></td>
              <td className="px-3 py-3 text-center font-bold" style={{ color: 'var(--sm-text)' }}>{player.goals ?? '-'}</td>
              <td className="px-3 py-3 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nhlAssists ?? '-'}</td>
              <td className="px-3 py-3 text-center font-bold">{player.nhlPoints ?? '-'}</td>
              <td className="px-3 py-3 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.shots ?? '-'}</td>
              <td className="px-3 py-3 text-center" style={{ color: 'var(--sm-text-muted)' }}>
                {player.plusMinus != null ? (player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// MLB Stats Table
function MLBStatsTable({ players }: { players: PlayerStats[] }) {
  if (!players.length) return <EmptyStats />

  const batters = players.filter(p => p.atBats && p.atBats > 0)
  const pitchers = players.filter(p => p.inningsPitched)

  return (
    <div>
      {batters.length > 0 && (
        <div className="p-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
          <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--sm-text-muted)' }}>Batting</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  <th className="text-left pb-2">Player</th>
                  <th className="text-center pb-2">AB</th>
                  <th className="text-center pb-2">H</th>
                  <th className="text-center pb-2">HR</th>
                  <th className="text-center pb-2">RBI</th>
                </tr>
              </thead>
              <tbody>
                {batters.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2"><PlayerCell player={p} /></td>
                    <td className="text-center font-mono">{p.atBats}</td>
                    <td className="text-center font-bold">{p.hits}</td>
                    <td className="text-center text-green-500 font-bold">{p.homeRuns || '-'}</td>
                    <td className="text-center font-bold">{p.rbi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {pitchers.length > 0 && (
        <div className="p-4">
          <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--sm-text-muted)' }}>Pitching</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  <th className="text-left pb-2">Player</th>
                  <th className="text-center pb-2">IP</th>
                  <th className="text-center pb-2">K</th>
                  <th className="text-center pb-2">ERA</th>
                </tr>
              </thead>
              <tbody>
                {pitchers.map((p, i) => (
                  <tr key={i}>
                    <td className="py-2"><PlayerCell player={p} /></td>
                    <td className="text-center font-mono">{p.inningsPitched}</td>
                    <td className="text-center font-bold">{p.strikeouts}</td>
                    <td className="text-center">{p.era?.toFixed(2) || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerCell({ player }: { player: PlayerStats }) {
  return (
    <div className="flex items-center gap-2">
      {player.headshotUrl ? (
        <Image
          src={player.headshotUrl}
          alt={player.name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--sm-text-muted)' }}>
            {player.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      )}
      <div>
        <div className="font-medium text-sm" style={{ color: 'var(--sm-text)' }}>{player.name}</div>
        {player.position && <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{player.position}</div>}
      </div>
    </div>
  )
}

function EmptyStats() {
  return (
    <div className="py-12 text-center" style={{ color: 'var(--sm-text-muted)' }}>
      No player stats available for this game
    </div>
  )
}
