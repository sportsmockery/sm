'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// Polling interval: 10 seconds
const POLL_INTERVAL = 10000

interface PlayerStats {
  player_id: string
  game_id: string
  team_id: string
  is_home_team: boolean
  full_name: string
  jersey_number: string | null
  position: string | null
  side: string | null
  // NFL
  nfl_pass_attempts?: number
  nfl_pass_completions?: number
  nfl_passing_yards?: number
  nfl_passing_tds?: number
  nfl_interceptions?: number
  nfl_rush_attempts?: number
  nfl_rushing_yards?: number
  nfl_rushing_tds?: number
  nfl_receptions?: number
  nfl_receiving_yards?: number
  nfl_receiving_tds?: number
  nfl_tackles?: number
  nfl_sacks?: number
  // NBA
  nba_minutes?: string
  nba_points?: number
  nba_fg_made?: number
  nba_fg_att?: number
  nba_3p_made?: number
  nba_3p_att?: number
  nba_ft_made?: number
  nba_ft_att?: number
  nba_reb_total?: number
  nba_assists?: number
  nba_steals?: number
  nba_blocks?: number
  nba_turnovers?: number
  nba_plus_minus?: number
  // NHL
  nhl_toi?: string
  nhl_goals?: number
  nhl_assists?: number
  nhl_points?: number
  nhl_shots?: number
  nhl_plus_minus?: number
  nhl_hits?: number
  nhl_blocks?: number
  // MLB
  mlb_ab?: number
  mlb_hits?: number
  mlb_home_runs?: number
  mlb_rbi?: number
  mlb_bb?: number
  mlb_so?: number
  mlb_avg?: number
  mlb_ip?: number
  mlb_h_allowed?: number
  mlb_er?: number
  mlb_k?: number
  mlb_era?: number
}

interface Play {
  play_id: string
  sequence: number
  game_clock: string
  period: number
  period_label: string
  description: string
  play_type: string
  team_id: string | null
  score_home: number
  score_away: number
}

interface TeamData {
  team_id: string
  name: string
  abbr: string
  logo_url: string
  score: number
  timeouts: number | null
  is_chicago: boolean
}

interface GameData {
  game_id: string
  sport: 'nfl' | 'nba' | 'nhl' | 'mlb'
  season: number
  game_date: string
  status: string
  home_team: TeamData
  away_team: TeamData
  period: number | null
  period_label: string | null
  clock: string | null
  venue: {
    name: string | null
    city: string | null
    state: string | null
  }
  weather: {
    temperature: number | null
    condition: string | null
    wind_speed: number | null
  }
  broadcast: {
    network: string | null
    announcers: string | null
  }
  odds: {
    win_probability_home: number | null
    win_probability_away: number | null
    spread_favorite_team_id: string | null
    spread_points: number | null
    moneyline_home: string | null
    moneyline_away: string | null
    over_under: number | null
  }
  players: PlayerStats[]
  play_by_play: Play[]
  team_stats: { home: Record<string, number | string>; away: Record<string, number | string> } | null
  cache_age_seconds: number
  timestamp: string
}

export default function LiveGamePage() {
  const params = useParams()
  const sport = params?.sport as string
  const gameId = params?.gameId as string

  const [game, setGame] = useState<GameData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'plays' | 'boxscore' | 'stats'>('plays')

  // Fetch game data
  const fetchGame = useCallback(async () => {
    if (!gameId) return

    try {
      const res = await fetch(`/api/live-games/${gameId}`, { cache: 'no-store' })

      if (!res.ok) {
        if (res.status === 404) {
          setError('Game not found')
        } else {
          throw new Error(`Failed to fetch: ${res.status}`)
        }
        return
      }

      const data: GameData = await res.json()
      setGame(data)
      setError(null)
    } catch (err) {
      console.error('[LiveGamePage] Error fetching game:', err)
      setError(err instanceof Error ? err.message : 'Failed to load game')
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  // Set up polling
  useEffect(() => {
    fetchGame()

    const interval = setInterval(fetchGame, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchGame])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !game) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {error || 'Game not found'}
          </h1>
          <p className="text-[var(--text-muted)] mb-4">
            This game may have ended or is not available.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#bc0000] text-white rounded hover:bg-[#a00000] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'

  // Get sport-specific period label
  const getPeriodDisplay = () => {
    if (!isLive) return isFinal ? 'FINAL' : game.status.toUpperCase()
    if (game.period_label && game.clock) {
      return `${game.period_label} ${game.clock}`
    }
    if (game.period_label) {
      return game.period_label
    }
    return 'LIVE'
  }

  // Render player stats based on sport
  const renderBoxScore = () => {
    const homePlayers = game.players.filter(p => p.is_home_team)
    const awayPlayers = game.players.filter(p => !p.is_home_team)

    if (sport === 'nba') {
      return (
        <div className="space-y-6">
          {[{ team: game.away_team, players: awayPlayers }, { team: game.home_team, players: homePlayers }].map(({ team, players }) => (
            <div key={team.team_id} className="bg-[var(--bg-surface)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
                  <span className="font-bold text-[var(--text-primary)]">{team.name}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr className="text-[var(--text-muted)]">
                      <th className="px-3 py-2 text-left font-medium">Player</th>
                      <th className="px-2 py-2 text-center font-medium">MIN</th>
                      <th className="px-2 py-2 text-center font-medium">PTS</th>
                      <th className="px-2 py-2 text-center font-medium">REB</th>
                      <th className="px-2 py-2 text-center font-medium">AST</th>
                      <th className="px-2 py-2 text-center font-medium">FG</th>
                      <th className="px-2 py-2 text-center font-medium">3P</th>
                      <th className="px-2 py-2 text-center font-medium">+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.sort((a, b) => (b.nba_points || 0) - (a.nba_points || 0)).map(player => (
                      <tr key={player.player_id} className="border-t border-[var(--border-color)]">
                        <td className="px-3 py-2 text-[var(--text-primary)]">
                          <span className="font-medium">{player.full_name}</span>
                          {player.position && <span className="text-[var(--text-muted)] ml-1 text-xs">{player.position}</span>}
                        </td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nba_minutes || '-'}</td>
                        <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{player.nba_points ?? '-'}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nba_reb_total ?? '-'}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nba_assists ?? '-'}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nba_fg_made ?? 0}-{player.nba_fg_att ?? 0}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nba_3p_made ?? 0}-{player.nba_3p_att ?? 0}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nba_plus_minus != null ? (player.nba_plus_minus > 0 ? `+${player.nba_plus_minus}` : player.nba_plus_minus) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (sport === 'nfl') {
      return (
        <div className="space-y-6">
          {[{ team: game.away_team, players: awayPlayers }, { team: game.home_team, players: homePlayers }].map(({ team, players }) => {
            const passers = players.filter(p => p.nfl_pass_attempts && p.nfl_pass_attempts > 0)
            const rushers = players.filter(p => p.nfl_rush_attempts && p.nfl_rush_attempts > 0)
            const receivers = players.filter(p => p.nfl_receptions && p.nfl_receptions > 0)

            return (
              <div key={team.team_id} className="bg-[var(--bg-surface)] rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
                    <span className="font-bold text-[var(--text-primary)]">{team.name}</span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {passers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Passing</h4>
                      {passers.map(p => (
                        <div key={p.player_id} className="flex justify-between py-1">
                          <span className="text-[var(--text-primary)]">{p.full_name}</span>
                          <span className="text-[var(--text-muted)]">{p.nfl_pass_completions}/{p.nfl_pass_attempts}, {p.nfl_passing_yards} YDS, {p.nfl_passing_tds} TD, {p.nfl_interceptions} INT</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {rushers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Rushing</h4>
                      {rushers.sort((a, b) => (b.nfl_rushing_yards || 0) - (a.nfl_rushing_yards || 0)).slice(0, 5).map(p => (
                        <div key={p.player_id} className="flex justify-between py-1">
                          <span className="text-[var(--text-primary)]">{p.full_name}</span>
                          <span className="text-[var(--text-muted)]">{p.nfl_rush_attempts} CAR, {p.nfl_rushing_yards} YDS, {p.nfl_rushing_tds} TD</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {receivers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Receiving</h4>
                      {receivers.sort((a, b) => (b.nfl_receiving_yards || 0) - (a.nfl_receiving_yards || 0)).slice(0, 5).map(p => (
                        <div key={p.player_id} className="flex justify-between py-1">
                          <span className="text-[var(--text-primary)]">{p.full_name}</span>
                          <span className="text-[var(--text-muted)]">{p.nfl_receptions} REC, {p.nfl_receiving_yards} YDS, {p.nfl_receiving_tds} TD</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (sport === 'nhl') {
      return (
        <div className="space-y-6">
          {[{ team: game.away_team, players: awayPlayers }, { team: game.home_team, players: homePlayers }].map(({ team, players }) => (
            <div key={team.team_id} className="bg-[var(--bg-surface)] rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
                  <span className="font-bold text-[var(--text-primary)]">{team.name}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr className="text-[var(--text-muted)]">
                      <th className="px-3 py-2 text-left font-medium">Player</th>
                      <th className="px-2 py-2 text-center font-medium">TOI</th>
                      <th className="px-2 py-2 text-center font-medium">G</th>
                      <th className="px-2 py-2 text-center font-medium">A</th>
                      <th className="px-2 py-2 text-center font-medium">PTS</th>
                      <th className="px-2 py-2 text-center font-medium">SOG</th>
                      <th className="px-2 py-2 text-center font-medium">+/-</th>
                      <th className="px-2 py-2 text-center font-medium">HITS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.sort((a, b) => (b.nhl_points || 0) - (a.nhl_points || 0)).map(player => (
                      <tr key={player.player_id} className="border-t border-[var(--border-color)]">
                        <td className="px-3 py-2 text-[var(--text-primary)]">
                          <span className="font-medium">{player.full_name}</span>
                          {player.position && <span className="text-[var(--text-muted)] ml-1 text-xs">{player.position}</span>}
                        </td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nhl_toi || '-'}</td>
                        <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{player.nhl_goals ?? '-'}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nhl_assists ?? '-'}</td>
                        <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{player.nhl_points ?? '-'}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nhl_shots ?? '-'}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nhl_plus_minus != null ? (player.nhl_plus_minus > 0 ? `+${player.nhl_plus_minus}` : player.nhl_plus_minus) : '-'}</td>
                        <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.nhl_hits ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (sport === 'mlb') {
      return (
        <div className="space-y-6">
          {[{ team: game.away_team, players: awayPlayers }, { team: game.home_team, players: homePlayers }].map(({ team, players }) => {
            const batters = players.filter(p => p.mlb_ab && p.mlb_ab > 0)
            const pitchers = players.filter(p => p.mlb_ip && p.mlb_ip > 0)

            return (
              <div key={team.team_id} className="bg-[var(--bg-surface)] rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
                    <span className="font-bold text-[var(--text-primary)]">{team.name}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {batters.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase px-4 py-2 bg-[var(--bg-secondary)]">Batting</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                            <th className="px-3 py-2 text-left font-medium">Player</th>
                            <th className="px-2 py-2 text-center font-medium">AB</th>
                            <th className="px-2 py-2 text-center font-medium">H</th>
                            <th className="px-2 py-2 text-center font-medium">HR</th>
                            <th className="px-2 py-2 text-center font-medium">RBI</th>
                            <th className="px-2 py-2 text-center font-medium">BB</th>
                            <th className="px-2 py-2 text-center font-medium">K</th>
                            <th className="px-2 py-2 text-center font-medium">AVG</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batters.map(player => (
                            <tr key={player.player_id} className="border-t border-[var(--border-color)]">
                              <td className="px-3 py-2 text-[var(--text-primary)]">
                                <span className="font-medium">{player.full_name}</span>
                                {player.position && <span className="text-[var(--text-muted)] ml-1 text-xs">{player.position}</span>}
                              </td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_ab ?? '-'}</td>
                              <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{player.mlb_hits ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_home_runs ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_rbi ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_bb ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_so ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_avg?.toFixed(3) ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                  {pitchers.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase px-4 py-2 bg-[var(--bg-secondary)] mt-2">Pitching</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                            <th className="px-3 py-2 text-left font-medium">Player</th>
                            <th className="px-2 py-2 text-center font-medium">IP</th>
                            <th className="px-2 py-2 text-center font-medium">H</th>
                            <th className="px-2 py-2 text-center font-medium">ER</th>
                            <th className="px-2 py-2 text-center font-medium">K</th>
                            <th className="px-2 py-2 text-center font-medium">ERA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pitchers.map(player => (
                            <tr key={player.player_id} className="border-t border-[var(--border-color)]">
                              <td className="px-3 py-2 text-[var(--text-primary)]">
                                <span className="font-medium">{player.full_name}</span>
                              </td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_ip ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_h_allowed ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_er ?? '-'}</td>
                              <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{player.mlb_k ?? '-'}</td>
                              <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_era?.toFixed(2) ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    return <div className="text-[var(--text-muted)]">Box score not available</div>
  }

  // Render team stats comparison
  const renderTeamStats = () => {
    if (!game.team_stats) {
      return <div className="text-center text-[var(--text-muted)] py-8">Team stats not available</div>
    }

    const statKeys = Object.keys(game.team_stats.home)

    return (
      <div className="bg-[var(--bg-surface)] rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Image src={game.away_team.logo_url} alt={game.away_team.name} width={32} height={32} className="object-contain" unoptimized />
            <span className="font-bold text-[var(--text-primary)]">{game.away_team.abbr}</span>
          </div>
          <span className="text-[var(--text-muted)] text-sm">Team Stats</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)]">{game.home_team.abbr}</span>
            <Image src={game.home_team.logo_url} alt={game.home_team.name} width={32} height={32} className="object-contain" unoptimized />
          </div>
        </div>
        <div className="space-y-3">
          {statKeys.map(key => {
            const awayVal = game.team_stats!.away[key]
            const homeVal = game.team_stats!.home[key]
            const awayNum = typeof awayVal === 'number' ? awayVal : parseFloat(String(awayVal)) || 0
            const homeNum = typeof homeVal === 'number' ? homeVal : parseFloat(String(homeVal)) || 0
            const total = awayNum + homeNum || 1
            const awayPct = (awayNum / total) * 100
            const homePct = (homeNum / total) * 100

            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[var(--text-primary)]">{awayVal}</span>
                  <span className="text-[var(--text-muted)] capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-[var(--text-primary)]">{homeVal}</span>
                </div>
                <div className="flex h-2 rounded overflow-hidden bg-[var(--bg-secondary)]">
                  <div className="bg-blue-500" style={{ width: `${awayPct}%` }} />
                  <div className="bg-[#bc0000]" style={{ width: `${homePct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sticky Score Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Back link */}
          <div className="py-2 border-b border-white/10">
            <Link href="/" className="text-white/60 hover:text-white text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Score display */}
          <div className="py-4 flex items-center justify-between">
            {/* Away Team */}
            <div className="flex items-center gap-3 flex-1">
              <Image
                src={game.away_team.logo_url}
                alt={game.away_team.name}
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
              <div>
                <div className="text-lg font-bold">{game.away_team.name}</div>
                <div className="text-white/60 text-sm">{game.away_team.abbr}</div>
              </div>
            </div>

            {/* Score */}
            <div className="text-center px-6">
              <div className="flex items-center gap-4 text-4xl font-bold">
                <span className={game.away_team.score > game.home_team.score ? 'text-green-400' : ''}>
                  {game.away_team.score}
                </span>
                <span className="text-white/30">-</span>
                <span className={game.home_team.score > game.away_team.score ? 'text-green-400' : ''}>
                  {game.home_team.score}
                </span>
              </div>
              <div className={`text-sm mt-1 ${isLive ? 'text-red-400' : 'text-white/60'}`}>
                {isLive && (
                  <span className="inline-flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                    </span>
                  </span>
                )}
                {getPeriodDisplay()}
              </div>
            </div>

            {/* Home Team */}
            <div className="flex items-center gap-3 flex-1 justify-end text-right">
              <div>
                <div className="text-lg font-bold">{game.home_team.name}</div>
                <div className="text-white/60 text-sm">{game.home_team.abbr}</div>
              </div>
              <Image
                src={game.home_team.logo_url}
                alt={game.home_team.name}
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Game info bar */}
          <div className="py-2 border-t border-white/10 flex items-center justify-center gap-4 text-sm text-white/60">
            {game.venue.name && (
              <span>{game.venue.name}{game.venue.city ? `, ${game.venue.city}` : ''}</span>
            )}
            {game.broadcast.network && (
              <>
                <span className="text-white/20">|</span>
                <span>TV: {game.broadcast.network}</span>
              </>
            )}
            {game.weather.temperature && (sport === 'nfl' || sport === 'mlb') && (
              <>
                <span className="text-white/20">|</span>
                <span>{game.weather.temperature}°F {game.weather.condition}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Win Probability Bar */}
      {(game.odds.win_probability_home != null || game.odds.win_probability_away != null) && (
        <div className="bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
          <div className="max-w-[1200px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--text-muted)]">Win Probability</span>
              <div className="flex items-center gap-4">
                <span className="font-medium text-[var(--text-primary)]">
                  {game.away_team.abbr}: {game.odds.win_probability_away != null ? `${(game.odds.win_probability_away * 100).toFixed(0)}%` : '-'}
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {game.home_team.abbr}: {game.odds.win_probability_home != null ? `${(game.odds.win_probability_home * 100).toFixed(0)}%` : '-'}
                </span>
              </div>
            </div>
            <div className="flex h-3 rounded overflow-hidden bg-[var(--bg-secondary)]">
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(game.odds.win_probability_away || 0) * 100}%` }}
              />
              <div
                className="bg-[#bc0000] transition-all duration-500"
                style={{ width: `${(game.odds.win_probability_home || 0) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex gap-2 mb-4 border-b border-[var(--border-color)]">
          {(['plays', 'boxscore', 'stats'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#bc0000] text-[#bc0000]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'plays' ? 'Play-by-Play' : tab === 'boxscore' ? 'Box Score' : 'Team Stats'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'plays' && (
          <div className="space-y-2">
            {game.play_by_play.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-8">
                No plays available yet
              </div>
            ) : (
              game.play_by_play
                .sort((a, b) => b.sequence - a.sequence)
                .map(play => (
                  <div
                    key={play.play_id}
                    className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border-color)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-[var(--text-muted)] mb-1">
                          {play.period_label} {play.game_clock}
                        </div>
                        <div className="text-[var(--text-primary)]">
                          {play.description}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-[var(--text-primary)]">
                          {play.score_away} - {play.score_home}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'boxscore' && renderBoxScore()}

        {activeTab === 'stats' && renderTeamStats()}
      </div>

      {/* Footer - Cache age indicator */}
      <div className="fixed bottom-2 right-2 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded shadow">
        Updated {game.cache_age_seconds}s ago
      </div>
    </div>
  )
}
