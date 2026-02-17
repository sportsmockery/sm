'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import GameHighlights from '@/components/scores/GameHighlights'

const HAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png'

interface Game {
  gameId: string
  date: string
  opponent: string
  opponentFullName: string | null
  opponentLogo: string | null
  hawksScore: number | null
  oppScore: number | null
  result: 'W' | 'L' | 'OTL' | null
  homeAway: 'home' | 'away'
  isOT?: boolean
}

interface PlayerStats {
  name: string
  position: string
  headshotUrl: string | null
  goals: number | null
  assists: number | null
  points: number | null
  plusMinus: number | null
  pim: number | null
  shots: number | null
  hits: number | null
  blockedShots: number | null
  toi: string | null
  saves: number | null
  goalsAgainst: number | null
  shotsAgainst: number | null
}

interface BoxScore {
  gameId: string
  date: string
  venue: string | null
  isOT: boolean
  isShootout: boolean
  blackhawks: { score: number; result: string | null; isHome: boolean; skaters: PlayerStats[]; goalies: PlayerStats[] }
  opponent: { abbrev: string; fullName: string; score: number; logo: string; skaters: PlayerStats[]; goalies: PlayerStats[] }
}

export default function BoxScoreClient({ games, initialGameId }: { games: Game[]; initialGameId: string | null }) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGameId)
  const [boxScore, setBoxScore] = useState<BoxScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTeam, setActiveTeam] = useState<'blackhawks' | 'opponent'>('blackhawks')
  const [activeTab, setActiveTab] = useState<'skaters' | 'goalies'>('skaters')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const check = () => {
      const el = scrollRef.current
      if (el) { setCanScrollLeft(el.scrollLeft > 0); setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10) }
    }
    check()
    scrollRef.current?.addEventListener('scroll', check)
    return () => scrollRef.current?.removeEventListener('scroll', check)
  }, [games])

  useEffect(() => {
    if (!selectedGameId) { setLoading(false); return }
    setLoading(true); setActiveTeam('blackhawks'); setActiveTab('skaters')
    fetch(`/api/blackhawks/boxscore/${selectedGameId}`)
      .then(r => r.json())
      .then(d => { setBoxScore(d.error ? null : d); setLoading(false) })
      .catch(() => { setBoxScore(null); setLoading(false) })
  }, [selectedGameId])

  const scroll = (dir: 'left' | 'right') => scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  const teamData = boxScore ? (activeTeam === 'blackhawks' ? boxScore.blackhawks : boxScore.opponent) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Game Selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>Select Game</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} disabled={!canScrollLeft}
              className={`p-2 rounded-lg transition-all ${!canScrollLeft ? 'cursor-not-allowed opacity-40' : 'hover:brightness-95 dark:hover:brightness-110'}`}
              style={{
                backgroundColor: canScrollLeft ? 'var(--sm-card)' : 'var(--sm-surface)',
                border: canScrollLeft ? '1px solid var(--sm-border)' : '1px solid transparent',
                color: canScrollLeft ? 'var(--sm-text)' : 'var(--sm-text-muted)',
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scroll('right')} disabled={!canScrollRight}
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
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
          {games.map((game) => {
            const isSelected = game.gameId === selectedGameId
            const isWin = game.result === 'W'
            return (
              <button key={game.gameId} onClick={() => setSelectedGameId(game.gameId)}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSelected ? 'text-white' : 'hover:brightness-95 dark:hover:brightness-110 hover:shadow-md'}`}
                style={{
                  backgroundColor: isSelected ? '#0E0E0E' : 'var(--sm-card)',
                  border: isSelected ? '1px solid #CF0A2C' : '1px solid var(--sm-border)',
                  ...(isSelected ? { boxShadow: '0 0 0 3px rgba(207, 10, 44, 0.3)' } : {}),
                }}>
                {game.opponentLogo && <Image src={game.opponentLogo} alt={game.opponent} width={36} height={36} className="w-9 h-9" unoptimized />}
                <div className="text-left">
                  <div className="text-xs" style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--sm-text-muted)' }}>
                    {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="font-semibold" style={{ color: isSelected ? '#ffffff' : 'var(--sm-text)' }}>
                    {game.homeAway === 'home' ? 'vs' : '@'} {game.opponent}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold ${isWin ? 'text-green-500' : game.result === 'OTL' ? 'text-yellow-500' : 'text-red-500'}`}>{game.result}</span>
                    <span className="text-sm font-semibold" style={{ color: isSelected ? '#ffffff' : 'var(--sm-text)' }}>
                      {game.hawksScore}-{game.oppScore}{game.isOT ? ' (OT)' : ''}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl p-12" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#CF0A2C] border-t-transparent rounded-full animate-spin" />
            <span style={{ color: 'var(--sm-text-muted)' }}>Loading box score...</span>
          </div>
        </div>
      ) : !boxScore ? (
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>Select a game to view the box score</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Game Header */}
          <div className="bg-gradient-to-r from-[#0E0E0E] to-[#1a1a1a] rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Image src={HAWKS_LOGO} alt="Chicago Blackhawks" width={64} height={64} className="w-16 h-16" unoptimized />
                  <div>
                    <div className="text-sm text-white/60">Chicago</div>
                    <div className="text-3xl font-bold">{boxScore.blackhawks.score}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${boxScore.blackhawks.result === 'W' ? 'bg-green-500/20 text-green-400' : boxScore.blackhawks.result === 'OTL' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {boxScore.blackhawks.result === 'W' ? 'WIN' : boxScore.blackhawks.result === 'OTL' ? 'OT LOSS' : 'LOSS'}
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
                <div className="text-white/60">{new Date(boxScore.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                {boxScore.venue && <div className="text-white/60 mt-1">{boxScore.venue}</div>}
                {boxScore.isOT && <div className="text-yellow-400 mt-1">{boxScore.isShootout ? 'Shootout' : 'Overtime'}</div>}
              </div>
            </div>
          </div>

          {/* Team Toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--sm-border)' }}>
            <button onClick={() => setActiveTeam('blackhawks')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'blackhawks' ? '#CF0A2C' : 'var(--sm-card)',
                color: activeTeam === 'blackhawks' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={HAWKS_LOGO} alt="Blackhawks" width={24} height={24} className="w-6 h-6" unoptimized />
              Blackhawks
            </button>
            <button onClick={() => setActiveTeam('opponent')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'opponent' ? '#CF0A2C' : 'var(--sm-card)',
                color: activeTeam === 'opponent' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={boxScore.opponent.logo} alt={boxScore.opponent.abbrev} width={24} height={24} className="w-6 h-6" unoptimized />
              {boxScore.opponent.fullName}
            </button>
          </div>

          {/* Skaters / Goalies Tabs */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
            <div className="flex" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              {(['skaters', 'goalies'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all hover:brightness-95 dark:hover:brightness-110"
                  style={{
                    backgroundColor: activeTab === tab ? '#CF0A2C' : 'transparent',
                    color: activeTab === tab ? '#ffffff' : 'var(--sm-text-muted)',
                  }}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === 'skaters' ? (
                <SkatersTable players={teamData?.skaters || []} />
              ) : (
                <GoaliesTable players={teamData?.goalies || []} />
              )}
            </div>
          </div>

          {/* Game Highlights */}
          <GameHighlights
            gameId={boxScore.gameId}
            homeTeam={boxScore.blackhawks.isHome ? 'blackhawks' : boxScore.opponent.abbrev}
            awayTeam={boxScore.blackhawks.isHome ? boxScore.opponent.abbrev : 'blackhawks'}
            gameDate={boxScore.date}
            sport="nhl"
            team="blackhawks"
          />
        </div>
      )}
    </div>
  )
}

function SkatersTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <div className="py-12 text-center" style={{ color: 'var(--sm-text-muted)' }}>No skater stats available</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
            <th className="px-3 py-3">Player</th>
            <th className="px-2 py-3 text-center">G</th>
            <th className="px-2 py-3 text-center">A</th>
            <th className="px-2 py-3 text-center">PTS</th>
            <th className="px-2 py-3 text-center">+/-</th>
            <th className="px-2 py-3 text-center">PIM</th>
            <th className="px-2 py-3 text-center">SOG</th>
            <th className="px-2 py-3 text-center">HIT</th>
            <th className="px-2 py-3 text-center">BLK</th>
            <th className="px-2 py-3 text-center">TOI</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-3 py-3"><PlayerCell player={p} /></td>
              <td className="px-2 py-3 text-center font-bold text-sm">{p.goals ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.assists ?? '-'}</td>
              <td className="px-2 py-3 text-center font-bold text-sm">{p.points ?? '-'}</td>
              <td className={`px-2 py-3 text-center text-sm ${(p.plusMinus || 0) > 0 ? 'text-green-500' : (p.plusMinus || 0) < 0 ? 'text-red-500' : ''}`}>
                {p.plusMinus != null ? (p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus) : '-'}
              </td>
              <td className="px-2 py-3 text-center text-sm">{p.pim ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.shots ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.hits ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.blockedShots ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>{p.toi || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GoaliesTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <div className="py-12 text-center" style={{ color: 'var(--sm-text-muted)' }}>No goalie stats available</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
            <th className="px-3 py-3">Player</th>
            <th className="px-3 py-3 text-center">SV</th>
            <th className="px-3 py-3 text-center">GA</th>
            <th className="px-3 py-3 text-center">SA</th>
            <th className="px-3 py-3 text-center">SV%</th>
            <th className="px-3 py-3 text-center">TOI</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const svPct = p.shotsAgainst && p.shotsAgainst > 0 ? ((p.saves || 0) / p.shotsAgainst * 100).toFixed(1) : '-'
            return (
              <tr key={i} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                <td className="px-3 py-3"><PlayerCell player={p} /></td>
                <td className="px-3 py-3 text-center font-bold">{p.saves ?? '-'}</td>
                <td className="px-3 py-3 text-center font-bold text-red-500">{p.goalsAgainst ?? '-'}</td>
                <td className="px-3 py-3 text-center">{p.shotsAgainst ?? '-'}</td>
                <td className="px-3 py-3 text-center font-bold">{svPct}%</td>
                <td className="px-3 py-3 text-center" style={{ color: 'var(--sm-text-dim)' }}>{p.toi || '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PlayerCell({ player }: { player: PlayerStats }) {
  return (
    <div className="flex items-center gap-2">
      {player.headshotUrl ? (
        <Image src={player.headshotUrl} alt={player.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" style={{ border: '1px solid var(--sm-border)' }} unoptimized />
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--sm-text-muted)' }}>{player.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
      )}
      <div>
        <div className="font-medium text-sm" style={{ color: 'var(--sm-text)' }}>{player.name}</div>
        <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{player.position}</div>
      </div>
    </div>
  )
}
