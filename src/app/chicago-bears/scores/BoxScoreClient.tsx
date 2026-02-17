'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import GameHighlights from '@/components/scores/GameHighlights'

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
  isPreseason?: boolean
  gameType?: 'preseason' | 'regular' | 'postseason'
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
  receivingRec: number | null
  receivingTgts: number | null
  receivingYds: number | null
  receivingTd: number | null
  defTacklesTotal: number | null
  defSacks: number | null
  defInt: number | null
  fumFum: number | null
}

interface TeamBoxStats {
  score: number
  result: 'W' | 'L' | null
  isHome: boolean
  passing: PlayerStats[]
  rushing: PlayerStats[]
  receiving: PlayerStats[]
  defense: PlayerStats[]
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
  bears: TeamBoxStats
  opponent: TeamBoxStats & {
    abbrev: string
    fullName: string
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
  const [activeTeam, setActiveTeam] = useState<'bears' | 'opponent'>('bears')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const checkScroll = () => {
      const el = scrollContainerRef.current
      if (el) {
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
      }
    }
    checkScroll()
    scrollContainerRef.current?.addEventListener('scroll', checkScroll)
    return () => scrollContainerRef.current?.removeEventListener('scroll', checkScroll)
  }, [games])

  const scrollGames = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!selectedGameId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setActiveTeam('bears')
    fetch(`/api/bears/boxscore/${selectedGameId}`)
      .then(res => res.json())
      .then(data => {
        setBoxScore(data.error ? null : data)
        setLoading(false)
      })
      .catch(() => { setBoxScore(null); setLoading(false) })
  }, [selectedGameId])

  const selectedGame = games.find(g => g.gameId === selectedGameId)
  const currentStats = boxScore ? (activeTeam === 'bears' ? boxScore.bears : boxScore.opponent) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Game Selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>Select Game</h2>
          <div className="flex gap-2">
            <button onClick={() => scrollGames('left')} disabled={!canScrollLeft}
              className={`p-2 rounded-lg transition-all ${!canScrollLeft ? 'cursor-not-allowed opacity-40' : 'hover:brightness-95 dark:hover:brightness-110'}`}
              style={{
                backgroundColor: canScrollLeft ? 'var(--sm-card)' : 'var(--sm-surface)',
                border: canScrollLeft ? '1px solid var(--sm-border)' : '1px solid transparent',
                color: canScrollLeft ? 'var(--sm-text)' : 'var(--sm-text-muted)',
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollGames('right')} disabled={!canScrollRight}
              className={`p-2 rounded-lg transition-all ${!canScrollRight ? 'cursor-not-allowed opacity-40' : 'hover:brightness-95 dark:hover:brightness-110'}`}
              style={{
                backgroundColor: canScrollRight ? 'var(--sm-card)' : 'var(--sm-surface)',
                border: canScrollRight ? '1px solid var(--sm-border)' : '1px solid transparent',
                color: canScrollRight ? 'var(--sm-text)' : 'var(--sm-text-muted)',
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
          {games.map((game) => {
            const gameDate = new Date(game.date)
            const isSelected = game.gameId === selectedGameId
            const isWin = game.result === 'W'
            return (
              <button key={game.gameId} onClick={() => setSelectedGameId(game.gameId)}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSelected ? 'text-white' : 'hover:brightness-95 dark:hover:brightness-110 hover:shadow-md'}`}
                style={{
                  backgroundColor: isSelected ? '#0B162A' : 'var(--sm-card)',
                  border: isSelected ? '1px solid #C83200' : '1px solid var(--sm-border)',
                  ...(isSelected ? { boxShadow: '0 0 0 3px rgba(200, 50, 0, 0.3)' } : {}),
                }}>
                {game.opponentLogo && <Image src={game.opponentLogo} alt={game.opponent} width={36} height={36} className="w-9 h-9" unoptimized />}
                <div className="text-left">
                  <div className="text-xs" style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--sm-text-muted)' }}>
                    {game.playoffRound || `Week ${game.week}`} &bull; {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: isSelected ? '#ffffff' : 'var(--sm-text)' }}>
                      {game.homeAway === 'home' ? 'vs' : '@'} {game.opponent}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>{game.result}</span>
                    <span className="text-sm font-semibold" style={{ color: isSelected ? '#ffffff' : 'var(--sm-text)' }}>{game.bearsScore}-{game.oppScore}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Box Score Display */}
      {loading ? (
        <div className="rounded-2xl p-12" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#C83200] border-t-transparent rounded-full animate-spin" />
            <span style={{ color: 'var(--sm-text-muted)' }}>Loading box score...</span>
          </div>
        </div>
      ) : !boxScore || !selectedGame ? (
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>Select a game to view the box score</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Game Header */}
          <div className="bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Image src={BEARS_LOGO} alt="Chicago Bears" width={64} height={64} className="w-16 h-16" unoptimized />
                  <div>
                    <div className="text-sm text-white/60">Chicago</div>
                    <div className="text-3xl font-bold">{boxScore.bears.score}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${boxScore.bears.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {boxScore.bears.result === 'W' ? 'WIN' : 'LOSS'}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-white/60">{boxScore.opponent.fullName}</div>
                    <div className="text-3xl font-bold">{boxScore.opponent.score}</div>
                  </div>
                  <Image src={boxScore.opponent.logo} alt={boxScore.opponent.fullName} width={64} height={64} className="w-16 h-16" unoptimized />
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-white/60">
                  {boxScore.playoffRound || `Week ${boxScore.week}`} &bull; {new Date(boxScore.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {boxScore.venue && <div className="text-white/60 mt-1">{boxScore.venue}</div>}
                {boxScore.weather?.tempF && (
                  <div className="text-white/60 mt-1">
                    {boxScore.weather.tempF}&deg;F{boxScore.weather.windMph ? ` \u2022 ${boxScore.weather.windMph} mph wind` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--sm-border)' }}>
            <button onClick={() => setActiveTeam('bears')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'bears' ? '#0B162A' : 'var(--sm-card)',
                color: activeTeam === 'bears' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={BEARS_LOGO} alt="Bears" width={24} height={24} className="w-6 h-6" unoptimized />
              Bears
            </button>
            <button onClick={() => setActiveTeam('opponent')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'opponent' ? '#0B162A' : 'var(--sm-card)',
                color: activeTeam === 'opponent' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={boxScore.opponent.logo} alt={boxScore.opponent.abbrev} width={24} height={24} className="w-6 h-6" unoptimized />
              {boxScore.opponent.fullName}
            </button>
          </div>

          {/* Stats Tabs */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
            <div className="flex" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              {(['passing', 'rushing', 'receiving', 'defense'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all hover:brightness-95 dark:hover:brightness-110"
                  style={{
                    backgroundColor: activeTab === tab ? '#C83200' : 'transparent',
                    color: activeTab === tab ? '#ffffff' : 'var(--sm-text-muted)',
                  }}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === 'passing' && <PassingTable players={currentStats?.passing || []} />}
              {activeTab === 'rushing' && <RushingTable players={currentStats?.rushing || []} />}
              {activeTab === 'receiving' && <ReceivingTable players={currentStats?.receiving || []} />}
              {activeTab === 'defense' && <DefenseTable players={currentStats?.defense || []} />}
            </div>
          </div>

          {/* Game Highlights */}
          <GameHighlights
            gameId={boxScore.gameId}
            homeTeam={boxScore.bears.isHome ? 'CHI' : boxScore.opponent.abbrev}
            awayTeam={boxScore.bears.isHome ? boxScore.opponent.abbrev : 'CHI'}
            gameDate={boxScore.date}
            week={boxScore.week}
            sport="nfl"
            team="bears"
            className="mt-6"
          />
        </div>
      )}
    </div>
  )
}

function PassingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <EmptyStats message="No passing stats available" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
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
            <tr key={player.playerId} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-4 py-3"><PlayerCell player={player} /></td>
              <td className="px-4 py-3 text-center font-mono">{player.passingCmp}/{player.passingAtt}</td>
              <td className="px-4 py-3 text-center font-bold">{player.passingYds}</td>
              <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--sm-text-dim)' }}>
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
  if (players.length === 0) return <EmptyStats message="No rushing stats available" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">CAR</th>
            <th className="px-4 py-3 text-center">YDS</th>
            <th className="px-4 py-3 text-center">AVG</th>
            <th className="px-4 py-3 text-center">TD</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerId} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-4 py-3"><PlayerCell player={player} /></td>
              <td className="px-4 py-3 text-center font-mono">{player.rushingCar}</td>
              <td className="px-4 py-3 text-center font-bold">{player.rushingYds}</td>
              <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--sm-text-dim)' }}>
                {player.rushingCar ? (player.rushingYds! / player.rushingCar).toFixed(1) : '-'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-green-500">{player.rushingTd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReceivingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <EmptyStats message="No receiving stats available" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">REC</th>
            <th className="px-4 py-3 text-center">TGTS</th>
            <th className="px-4 py-3 text-center">YDS</th>
            <th className="px-4 py-3 text-center">AVG</th>
            <th className="px-4 py-3 text-center">TD</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerId} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-4 py-3"><PlayerCell player={player} /></td>
              <td className="px-4 py-3 text-center font-mono">{player.receivingRec}</td>
              <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--sm-text-dim)' }}>{player.receivingTgts}</td>
              <td className="px-4 py-3 text-center font-bold">{player.receivingYds}</td>
              <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--sm-text-dim)' }}>
                {player.receivingRec ? (player.receivingYds! / player.receivingRec).toFixed(1) : '-'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-green-500">{player.receivingTd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DefenseTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <EmptyStats message="No defensive stats available" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
            <th className="px-4 py-3">Player</th>
            <th className="px-4 py-3 text-center">TOT</th>
            <th className="px-4 py-3 text-center">SACK</th>
            <th className="px-4 py-3 text-center">INT</th>
            <th className="px-4 py-3 text-center">FF</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.playerId} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-4 py-3"><PlayerCell player={player} /></td>
              <td className="px-4 py-3 text-center font-bold">{player.defTacklesTotal}</td>
              <td className="px-4 py-3 text-center font-bold text-[#C83200]">{player.defSacks || '-'}</td>
              <td className="px-4 py-3 text-center font-bold text-green-500">{player.defInt || '-'}</td>
              <td className="px-4 py-3 text-center">{player.fumFum || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PlayerCell({ player }: { player: PlayerStats }) {
  return (
    <div className="flex items-center gap-3">
      {player.headshotUrl ? (
        <Image src={player.headshotUrl} alt={player.name} width={36} height={36}
          className="w-9 h-9 rounded-full object-cover" style={{ border: '1px solid var(--sm-border)' }} unoptimized />
      ) : (
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--sm-text-muted)' }}>
            {player.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      )}
      <div>
        <div className="font-medium" style={{ color: 'var(--sm-text)' }}>{player.name}</div>
        <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{player.position}</div>
      </div>
    </div>
  )
}

function EmptyStats({ message }: { message: string }) {
  return <div className="py-12 text-center" style={{ color: 'var(--sm-text-muted)' }}>{message}</div>
}
