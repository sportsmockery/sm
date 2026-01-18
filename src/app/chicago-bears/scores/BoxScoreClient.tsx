'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

interface Game {
  gameId: string
  week: number
  date: string
  opponent: string
  opponentFullName: string | null
  opponentLogo: string | null
  bearsScore: number | null
  oppScore: number | null
  result: 'W' | 'L' | 'T' | null
  isPlayoff: boolean
  playoffRound: string | null
  homeAway: 'home' | 'away'
}

interface PlayerStats {
  playerId: number
  name: string
  position: string
  headshotUrl: string | null
  passingCmp: number | null
  passingAtt: number | null
  passingYds: number | null
  passingTd: number | null
  passingInt: number | null
  rushingCar: number | null
  rushingYds: number | null
  rushingTd: number | null
  rushingLng: number | null
  receivingRec: number | null
  receivingTgts: number | null
  receivingYds: number | null
  receivingTd: number | null
  receivingLng: number | null
  defTacklesTotal: number | null
  defTacklesSolo: number | null
  defSacks: number | null
  defTfl: number | null
  defPassesDefended: number | null
  defInt: number | null
  fumFum: number | null
  fumLost: number | null
}

interface BoxScore {
  gameId: string
  date: string
  week: number
  isPlayoff: boolean
  playoffRound: string | null
  venue: string | null
  weather: {
    tempF: number | null
    windMph: number | null
    summary: string | null
  } | null
  bears: {
    score: number
    result: 'W' | 'L' | null
    isHome: boolean
    passing: PlayerStats[]
    rushing: PlayerStats[]
    receiving: PlayerStats[]
    defense: PlayerStats[]
  }
  opponent: {
    abbrev: string
    fullName: string
    score: number
    logo: string
  }
}

interface Props {
  games: Game[]
  initialGameId: string | null
}

export default function BoxScoreClient({ games, initialGameId }: Props) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGameId)
  const [boxScore, setBoxScore] = useState<BoxScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'passing' | 'rushing' | 'receiving' | 'defense'>('passing')

  useEffect(() => {
    if (!selectedGameId) {
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/bears/boxscore/${selectedGameId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setBoxScore(null)
        } else {
          setBoxScore(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setBoxScore(null)
        setLoading(false)
      })
  }, [selectedGameId])

  const selectedGame = games.find(g => g.gameId === selectedGameId)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Game Selector - Horizontal Scroll */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Select Game
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {games.map((game) => {
            const gameDate = new Date(game.date)
            const isSelected = game.gameId === selectedGameId
            const isWin = game.result === 'W'

            return (
              <button
                key={game.gameId}
                onClick={() => setSelectedGameId(game.gameId)}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#0B162A] border-[#C83200] text-white'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                {/* Opponent Logo */}
                {game.opponentLogo && (
                  <Image
                    src={game.opponentLogo}
                    alt={game.opponent}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                )}
                <div className="text-left">
                  <div className={`text-xs ${isSelected ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                    {game.playoffRound || `Week ${game.week}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                      {game.homeAway === 'home' ? 'vs' : '@'} {game.opponent}
                    </span>
                    <span className={`text-sm font-bold ${
                      isWin ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {game.result}
                    </span>
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                    {game.bearsScore}-{game.oppScore}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Box Score Display */}
      {loading ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#C83200] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--text-muted)]">Loading box score...</span>
          </div>
        </div>
      ) : !boxScore || !selectedGame ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <p className="text-[var(--text-muted)]">Select a game to view the box score</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Game Header */}
          <div className="bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Matchup */}
              <div className="flex items-center gap-6">
                {/* Bears */}
                <div className="flex items-center gap-3">
                  <Image
                    src={BEARS_LOGO}
                    alt="Chicago Bears"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                  <div>
                    <div className="text-sm text-white/60">Chicago</div>
                    <div className="text-3xl font-bold">{boxScore.bears.score}</div>
                  </div>
                </div>

                {/* Result */}
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                  boxScore.bears.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {boxScore.bears.result === 'W' ? 'WIN' : 'LOSS'}
                </div>

                {/* Opponent */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-white/60">{boxScore.opponent.fullName}</div>
                    <div className="text-3xl font-bold">{boxScore.opponent.score}</div>
                  </div>
                  <Image
                    src={boxScore.opponent.logo}
                    alt={boxScore.opponent.fullName}
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
              </div>

              {/* Game Info */}
              <div className="text-right text-sm">
                <div className="text-white/60">
                  {boxScore.playoffRound || `Week ${boxScore.week}`} • {new Date(boxScore.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {boxScore.venue && (
                  <div className="text-white/60 mt-1">{boxScore.venue}</div>
                )}
                {boxScore.weather && boxScore.weather.tempF && (
                  <div className="text-white/60 mt-1">
                    {boxScore.weather.tempF}°F
                    {boxScore.weather.windMph && ` • ${boxScore.weather.windMph} mph wind`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Tabs */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <div className="flex border-b border-[var(--border-subtle)]">
              {(['passing', 'rushing', 'receiving', 'defense'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === tab
                      ? 'bg-[#C83200] text-white'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Stats Table */}
            <div className="p-4">
              {activeTab === 'passing' && (
                <PassingTable players={boxScore.bears.passing} />
              )}
              {activeTab === 'rushing' && (
                <RushingTable players={boxScore.bears.rushing} />
              )}
              {activeTab === 'receiving' && (
                <ReceivingTable players={boxScore.bears.receiving} />
              )}
              {activeTab === 'defense' && (
                <DefenseTable players={boxScore.bears.defense} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PassingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) {
    return <EmptyStats message="No passing stats available" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">C/ATT</th>
            <th className="px-4 py-3 text-center">YDS</th>
            <th className="px-4 py-3 text-center">AVG</th>
            <th className="px-4 py-3 text-center">TD</th>
            <th className="px-4 py-3 text-center">INT</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerId} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)]">
              <td className="px-4 py-3">
                <PlayerCell player={player} />
              </td>
              <td className="px-4 py-3 text-center font-mono">
                {player.passingCmp}/{player.passingAtt}
              </td>
              <td className="px-4 py-3 text-center font-bold">{player.passingYds}</td>
              <td className="px-4 py-3 text-center font-mono text-[var(--text-secondary)]">
                {player.passingAtt ? (player.passingYds! / player.passingAtt).toFixed(1) : '-'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-green-500">{player.passingTd}</td>
              <td className="px-4 py-3 text-center font-bold text-red-500">{player.passingInt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RushingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) {
    return <EmptyStats message="No rushing stats available" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">CAR</th>
            <th className="px-4 py-3 text-center">YDS</th>
            <th className="px-4 py-3 text-center">AVG</th>
            <th className="px-4 py-3 text-center">TD</th>
            <th className="px-4 py-3 text-center">LNG</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerId} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)]">
              <td className="px-4 py-3">
                <PlayerCell player={player} />
              </td>
              <td className="px-4 py-3 text-center font-mono">{player.rushingCar}</td>
              <td className="px-4 py-3 text-center font-bold">{player.rushingYds}</td>
              <td className="px-4 py-3 text-center font-mono text-[var(--text-secondary)]">
                {player.rushingCar ? (player.rushingYds! / player.rushingCar).toFixed(1) : '-'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-green-500">{player.rushingTd}</td>
              <td className="px-4 py-3 text-center">{player.rushingLng || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReceivingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) {
    return <EmptyStats message="No receiving stats available" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">REC</th>
            <th className="px-4 py-3 text-center">TGTS</th>
            <th className="px-4 py-3 text-center">YDS</th>
            <th className="px-4 py-3 text-center">AVG</th>
            <th className="px-4 py-3 text-center">TD</th>
            <th className="px-4 py-3 text-center">LNG</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerId} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)]">
              <td className="px-4 py-3">
                <PlayerCell player={player} />
              </td>
              <td className="px-4 py-3 text-center font-mono">{player.receivingRec}</td>
              <td className="px-4 py-3 text-center font-mono text-[var(--text-secondary)]">{player.receivingTgts}</td>
              <td className="px-4 py-3 text-center font-bold">{player.receivingYds}</td>
              <td className="px-4 py-3 text-center font-mono text-[var(--text-secondary)]">
                {player.receivingRec ? (player.receivingYds! / player.receivingRec).toFixed(1) : '-'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-green-500">{player.receivingTd}</td>
              <td className="px-4 py-3 text-center">{player.receivingLng || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DefenseTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) {
    return <EmptyStats message="No defensive stats available" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">TOT</th>
            <th className="px-4 py-3 text-center">SOLO</th>
            <th className="px-4 py-3 text-center">SACK</th>
            <th className="px-4 py-3 text-center">TFL</th>
            <th className="px-4 py-3 text-center">PD</th>
            <th className="px-4 py-3 text-center">INT</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerId} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)]">
              <td className="px-4 py-3">
                <PlayerCell player={player} />
              </td>
              <td className="px-4 py-3 text-center font-bold">{player.defTacklesTotal}</td>
              <td className="px-4 py-3 text-center font-mono">{player.defTacklesSolo || '-'}</td>
              <td className="px-4 py-3 text-center font-bold text-[#C83200]">{player.defSacks || '-'}</td>
              <td className="px-4 py-3 text-center">{player.defTfl || '-'}</td>
              <td className="px-4 py-3 text-center">{player.defPassesDefended || '-'}</td>
              <td className="px-4 py-3 text-center font-bold text-green-500">{player.defInt || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PlayerCell({ player }: { player: PlayerStats }) {
  return (
    <Link
      href={`/chicago-bears/players/${player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      className="flex items-center gap-3 group"
    >
      {player.headshotUrl ? (
        <Image
          src={player.headshotUrl}
          alt={player.name}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover border border-[var(--border-subtle)]"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <span className="text-xs font-bold text-[var(--text-muted)]">
            {player.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      )}
      <div>
        <div className="font-medium text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors">
          {player.name}
        </div>
        <div className="text-xs text-[var(--text-muted)]">{player.position}</div>
      </div>
    </Link>
  )
}

function EmptyStats({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-[var(--text-muted)]">
      {message}
    </div>
  )
}
