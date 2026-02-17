'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import GameHighlights from '@/components/scores/GameHighlights'

const CUBS_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png'

interface Game {
  gameId: string
  date: string
  opponent: string
  opponentFullName: string | null
  opponentLogo: string | null
  teamScore: number | null
  oppScore: number | null
  result: 'W' | 'L' | null
  homeAway: 'home' | 'away'
}

interface PlayerStats {
  name: string; position: string; headshotUrl: string | null
  ab: number | null; r: number | null; h: number | null; doubles: number | null; triples: number | null
  hr: number | null; rbi: number | null; bb: number | null; so: number | null; sb: number | null
  ip: number | null; ha: number | null; ra: number | null; er: number | null
  bba: number | null; k: number | null; w: boolean | null; l: boolean | null; sv: boolean | null
}

interface BoxScore {
  gameId: string; date: string; venue: string | null
  cubs: { score: number; result: string | null; isHome: boolean; batters: PlayerStats[]; pitchers: PlayerStats[] }
  opponent: { abbrev: string; fullName: string; score: number; logo: string; batters: PlayerStats[]; pitchers: PlayerStats[] }
}

export default function BoxScoreClient({ games, initialGameId }: { games: Game[]; initialGameId: string | null }) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGameId)
  const [boxScore, setBoxScore] = useState<BoxScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTeam, setActiveTeam] = useState<'cubs' | 'opponent'>('cubs')
  const [activeTab, setActiveTab] = useState<'batting' | 'pitching'>('batting')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const check = () => { const el = scrollRef.current; if (el) { setCanScrollLeft(el.scrollLeft > 0); setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10) } }
    check(); scrollRef.current?.addEventListener('scroll', check)
    return () => scrollRef.current?.removeEventListener('scroll', check)
  }, [games])

  useEffect(() => {
    if (!selectedGameId) { setLoading(false); return }
    setLoading(true); setActiveTeam('cubs'); setActiveTab('batting')
    fetch(`/api/cubs/boxscore/${selectedGameId}`)
      .then(r => r.json()).then(d => { setBoxScore(d.error ? null : d); setLoading(false) })
      .catch(() => { setBoxScore(null); setLoading(false) })
  }, [selectedGameId])

  const scroll = (dir: 'left' | 'right') => scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  const teamData = boxScore ? (activeTeam === 'cubs' ? boxScore.cubs : boxScore.opponent) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
                  backgroundColor: isSelected ? '#0E3386' : 'var(--sm-card)',
                  border: isSelected ? '1px solid #CC3433' : '1px solid var(--sm-border)',
                  ...(isSelected ? { boxShadow: '0 0 0 3px rgba(204, 52, 51, 0.3)' } : {}),
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
                    <span className="text-sm font-semibold" style={{ color: isSelected ? '#ffffff' : 'var(--sm-text)' }}>{game.teamScore}-{game.oppScore}</span>
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
            <div className="w-6 h-6 border-2 border-[#0E3386] border-t-transparent rounded-full animate-spin" />
            <span style={{ color: 'var(--sm-text-muted)' }}>Loading box score...</span>
          </div>
        </div>
      ) : !boxScore ? (
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>Select a game to view the box score</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0E3386] to-[#0E3386]/90 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Image src={CUBS_LOGO} alt="Chicago Cubs" width={64} height={64} className="w-16 h-16" unoptimized />
                  <div>
                    <div className="text-sm text-white/60">Chicago</div>
                    <div className="text-3xl font-bold">{boxScore.cubs.score}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${boxScore.cubs.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {boxScore.cubs.result === 'W' ? 'WIN' : 'LOSS'}
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

          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--sm-border)' }}>
            <button onClick={() => setActiveTeam('cubs')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'cubs' ? '#0E3386' : 'var(--sm-card)',
                color: activeTeam === 'cubs' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={CUBS_LOGO} alt="Cubs" width={24} height={24} className="w-6 h-6" unoptimized />
              Cubs
            </button>
            <button onClick={() => setActiveTeam('opponent')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all hover:brightness-95 dark:hover:brightness-110"
              style={{
                backgroundColor: activeTeam === 'opponent' ? '#0E3386' : 'var(--sm-card)',
                color: activeTeam === 'opponent' ? '#ffffff' : 'var(--sm-text-muted)',
              }}>
              <Image src={boxScore.opponent.logo} alt={boxScore.opponent.abbrev} width={24} height={24} className="w-6 h-6" unoptimized />
              {boxScore.opponent.fullName}
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
            <div className="flex" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              {(['batting', 'pitching'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-all hover:brightness-95 dark:hover:brightness-110"
                  style={{
                    backgroundColor: activeTab === tab ? '#CC3433' : 'transparent',
                    color: activeTab === tab ? '#ffffff' : 'var(--sm-text-muted)',
                  }}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === 'batting' ? (
                <BattingTable players={teamData?.batters || []} />
              ) : (
                <PitchingTable players={teamData?.pitchers || []} />
              )}
            </div>
          </div>

          {/* Game Highlights */}
          <GameHighlights
            gameId={boxScore.gameId}
            homeTeam={boxScore.cubs.isHome ? 'cubs' : boxScore.opponent.abbrev}
            awayTeam={boxScore.cubs.isHome ? boxScore.opponent.abbrev : 'cubs'}
            gameDate={boxScore.date}
            sport="mlb"
            team="cubs"
          />
        </div>
      )}
    </div>
  )
}

function BattingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <div className="py-12 text-center" style={{ color: 'var(--sm-text-muted)' }}>No batting stats available</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
            <th className="px-3 py-3">Player</th>
            <th className="px-2 py-3 text-center">AB</th>
            <th className="px-2 py-3 text-center">R</th>
            <th className="px-2 py-3 text-center">H</th>
            <th className="px-2 py-3 text-center">2B</th>
            <th className="px-2 py-3 text-center">3B</th>
            <th className="px-2 py-3 text-center">HR</th>
            <th className="px-2 py-3 text-center">RBI</th>
            <th className="px-2 py-3 text-center">BB</th>
            <th className="px-2 py-3 text-center">SO</th>
            <th className="px-2 py-3 text-center">SB</th>
            <th className="px-2 py-3 text-center">AVG</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <td className="px-3 py-3"><PlayerCell player={p} /></td>
              <td className="px-2 py-3 text-center text-sm">{p.ab ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.r ?? '-'}</td>
              <td className="px-2 py-3 text-center font-bold text-sm">{p.h ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.doubles ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.triples ?? '-'}</td>
              <td className="px-2 py-3 text-center font-bold text-sm text-[#CC3433]">{p.hr ?? '-'}</td>
              <td className="px-2 py-3 text-center font-bold text-sm">{p.rbi ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.bb ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.so ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.sb ?? '-'}</td>
              <td className="px-2 py-3 text-center font-mono text-sm">{p.ab && p.ab > 0 ? ((p.h || 0) / p.ab).toFixed(3).replace(/^0/, '') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PitchingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <div className="py-12 text-center" style={{ color: 'var(--sm-text-muted)' }}>No pitching stats available</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
            <th className="px-3 py-3">Player</th>
            <th className="px-2 py-3 text-center">IP</th>
            <th className="px-2 py-3 text-center">H</th>
            <th className="px-2 py-3 text-center">R</th>
            <th className="px-2 py-3 text-center">ER</th>
            <th className="px-2 py-3 text-center">BB</th>
            <th className="px-2 py-3 text-center">K</th>
            <th className="px-2 py-3 text-center">DEC</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const dec = p.w ? 'W' : p.l ? 'L' : p.sv ? 'SV' : '-'
            return (
              <tr key={i} className="last:border-0 transition-all hover:brightness-95 dark:hover:brightness-110" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                <td className="px-3 py-3"><PlayerCell player={p} /></td>
                <td className="px-2 py-3 text-center font-bold text-sm">{p.ip ?? '-'}</td>
                <td className="px-2 py-3 text-center text-sm">{p.ha ?? '-'}</td>
                <td className="px-2 py-3 text-center text-sm">{p.ra ?? '-'}</td>
                <td className="px-2 py-3 text-center text-sm">{p.er ?? '-'}</td>
                <td className="px-2 py-3 text-center text-sm">{p.bba ?? '-'}</td>
                <td className="px-2 py-3 text-center font-bold text-sm">{p.k ?? '-'}</td>
                <td className={`px-2 py-3 text-center font-bold text-sm ${dec === 'W' ? 'text-green-500' : dec === 'L' ? 'text-red-500' : dec === 'SV' ? 'text-blue-500' : ''}`}>{dec}</td>
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
