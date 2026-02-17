'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import GameHighlights from '@/components/scores/GameHighlights'

const BULLS_LOGO = 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png'

interface Game {
  gameId: string
  date: string
  opponent: string
  opponentFullName: string | null
  opponentLogo: string | null
  bullsScore: number | null
  oppScore: number | null
  result: 'W' | 'L' | null
  homeAway: 'home' | 'away'
}

interface PlayerStats {
  name: string
  position: string
  headshotUrl: string | null
  minutes: string | null
  points: number | null
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  fgm: number | null
  fga: number | null
  tpm: number | null
  tpa: number | null
  ftm: number | null
  fta: number | null
}

interface BoxScore {
  gameId: string
  date: string
  venue: string | null
  bulls: {
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
}

export default function BoxScoreClient({ games, initialGameId }: { games: Game[]; initialGameId: string | null }) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGameId)
  const [boxScore, setBoxScore] = useState<BoxScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTeam, setActiveTeam] = useState<'bulls' | 'opponent'>('bulls')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const check = () => {
      const el = scrollRef.current
      if (el) {
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
      }
    }
    check()
    scrollRef.current?.addEventListener('scroll', check)
    return () => scrollRef.current?.removeEventListener('scroll', check)
  }, [games])

  useEffect(() => {
    if (!selectedGameId) { setLoading(false); return }
    setLoading(true)
    setActiveTeam('bulls')
    fetch(`/api/bulls/boxscore/${selectedGameId}`)
      .then(r => r.json())
      .then(d => { setBoxScore(d.error ? null : d); setLoading(false) })
      .catch(() => { setBoxScore(null); setLoading(false) })
  }, [selectedGameId])

  const scroll = (dir: 'left' | 'right') => scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  const currentPlayers = boxScore ? (activeTeam === 'bulls' ? boxScore.bulls.players : boxScore.opponent.players) : []

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
                  border: isSelected ? '1px solid #CE1141' : '1px solid var(--sm-border)',
                  ...(isSelected ? { boxShadow: '0 0 0 3px rgba(206, 17, 65, 0.3)' } : {}),
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
                    <span className={`text-sm font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>{game.result}</span>
                    <span className="text-sm font-semibold" style={{ color: isSelected ? '#ffffff' : 'var(--sm-text)' }}>{game.bullsScore}-{game.oppScore}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Box Score */}
      {loading ? (
        <div className="rounded-2xl p-12" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#CE1141] border-t-transparent rounded-full animate-spin" />
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
                  <Image src={BULLS_LOGO} alt="Chicago Bulls" width={64} height={64} className="w-16 h-16" unoptimized />
                  <div>
                    <div className="text-sm text-white/60">Chicago</div>
                    <div className="text-3xl font-bold">{boxScore.bulls.score}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${boxScore.bulls.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {boxScore.bulls.result === 'W' ? 'WIN' : 'LOSS'}
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
              </div>
            </div>
          </div>

          {/* Team Toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--sm-border)' }}>
            <button onClick={() => setActiveTeam('bulls')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'bulls' ? '#CE1141' : 'var(--sm-card)',
                color: activeTeam === 'bulls' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={BULLS_LOGO} alt="Bulls" width={24} height={24} className="w-6 h-6" unoptimized />
              Bulls
            </button>
            <button onClick={() => setActiveTeam('opponent')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'opponent' ? '#CE1141' : 'var(--sm-card)',
                color: activeTeam === 'opponent' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={boxScore.opponent.logo} alt={boxScore.opponent.abbrev} width={24} height={24} className="w-6 h-6" unoptimized />
              {boxScore.opponent.fullName}
            </button>
          </div>

          {/* Stats Table */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <h3 className="font-bold" style={{ color: 'var(--sm-text)' }}>Player Stats</h3>
            </div>
            <div className="p-4">
              {currentPlayers.length === 0 ? (
                <div className="py-12 text-center" style={{ color: 'var(--sm-text-muted)' }}>No player stats available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
                        <th className="px-3 py-3">Player</th>
                        <th className="px-2 py-3 text-center">MIN</th>
                        <th className="px-2 py-3 text-center">PTS</th>
                        <th className="px-2 py-3 text-center">REB</th>
                        <th className="px-2 py-3 text-center">AST</th>
                        <th className="px-2 py-3 text-center">STL</th>
                        <th className="px-2 py-3 text-center">BLK</th>
                        <th className="px-2 py-3 text-center">TO</th>
                        <th className="px-2 py-3 text-center">FG</th>
                        <th className="px-2 py-3 text-center">3PT</th>
                        <th className="px-2 py-3 text-center">FT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPlayers.map((p, i) => (
                        <tr key={i} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              {p.headshotUrl ? (
                                <Image src={p.headshotUrl} alt={p.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" style={{ border: '1px solid var(--sm-border)' }} unoptimized />
                              ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sm-surface)' }}>
                                  <span className="text-xs font-bold" style={{ color: 'var(--sm-text-muted)' }}>{p.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-sm" style={{ color: 'var(--sm-text)' }}>{p.name}</div>
                                <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{p.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>{p.minutes || '-'}</td>
                          <td className="px-2 py-3 text-center font-bold text-sm">{p.points ?? '-'}</td>
                          <td className="px-2 py-3 text-center text-sm">{p.rebounds ?? '-'}</td>
                          <td className="px-2 py-3 text-center text-sm">{p.assists ?? '-'}</td>
                          <td className="px-2 py-3 text-center text-sm">{p.steals ?? '-'}</td>
                          <td className="px-2 py-3 text-center text-sm">{p.blocks ?? '-'}</td>
                          <td className="px-2 py-3 text-center text-sm">{p.turnovers ?? '-'}</td>
                          <td className="px-2 py-3 text-center text-sm font-mono">{p.fgm ?? 0}-{p.fga ?? 0}</td>
                          <td className="px-2 py-3 text-center text-sm font-mono">{p.tpm ?? 0}-{p.tpa ?? 0}</td>
                          <td className="px-2 py-3 text-center text-sm font-mono">{p.ftm ?? 0}-{p.fta ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Game Highlights */}
          <GameHighlights
            gameId={boxScore.gameId}
            homeTeam={boxScore.bulls.isHome ? 'bulls' : boxScore.opponent.abbrev}
            awayTeam={boxScore.bulls.isHome ? boxScore.opponent.abbrev : 'bulls'}
            gameDate={boxScore.date}
            sport="nba"
            team="bulls"
          />
        </div>
      )}
    </div>
  )
}
