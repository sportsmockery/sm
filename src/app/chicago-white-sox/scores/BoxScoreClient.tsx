'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const SOX_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png'

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
  whitesox: { score: number; result: string | null; isHome: boolean; batters: PlayerStats[]; pitchers: PlayerStats[] }
  opponent: { abbrev: string; fullName: string; score: number; logo: string; batters: PlayerStats[]; pitchers: PlayerStats[] }
}

export default function BoxScoreClient({ games, initialGameId }: { games: Game[]; initialGameId: string | null }) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGameId)
  const [boxScore, setBoxScore] = useState<BoxScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTeam, setActiveTeam] = useState<'whitesox' | 'opponent'>('whitesox')
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
    setLoading(true); setActiveTeam('whitesox'); setActiveTab('batting')
    fetch(`/api/whitesox/boxscore/${selectedGameId}`)
      .then(r => r.json()).then(d => { setBoxScore(d.error ? null : d); setLoading(false) })
      .catch(() => { setBoxScore(null); setLoading(false) })
  }, [selectedGameId])

  const scroll = (dir: 'left' | 'right') => scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  const teamData = boxScore ? (activeTeam === 'whitesox' ? boxScore.whitesox : boxScore.opponent) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Select Game</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} disabled={!canScrollLeft}
              className={`p-2 rounded-lg border transition-all ${canScrollLeft ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-muted)] cursor-not-allowed opacity-40'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scroll('right')} disabled={!canScrollRight}
              className={`p-2 rounded-lg border transition-all ${canScrollRight ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'bg-[var(--bg-tertiary)] border-transparent text-[var(--text-muted)] cursor-not-allowed opacity-40'}`}>
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
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isSelected ? 'bg-[#27251F] border-[#C4CED4] text-white ring-2 ring-[#C4CED4]/30' : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:shadow-md'}`}>
                {game.opponentLogo && <Image src={game.opponentLogo} alt={game.opponent} width={36} height={36} className="w-9 h-9" unoptimized />}
                <div className="text-left">
                  <div className={`text-xs ${isSelected ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                    {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className={`font-semibold ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {game.homeAway === 'home' ? 'vs' : '@'} {game.opponent}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>{game.result}</span>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>{game.teamScore}-{game.oppScore}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#27251F] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--text-muted)]">Loading box score...</span>
          </div>
        </div>
      ) : !boxScore ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <p className="text-[var(--text-muted)]">Select a game to view the box score</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#27251F] to-[#27251F]/90 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Image src={SOX_LOGO} alt="Chicago White Sox" width={64} height={64} className="w-16 h-16" unoptimized />
                  <div>
                    <div className="text-sm text-white/60">Chicago</div>
                    <div className="text-3xl font-bold">{boxScore.whitesox.score}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${boxScore.whitesox.result === 'W' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {boxScore.whitesox.result === 'W' ? 'WIN' : 'LOSS'}
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

          <div className="flex rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            <button onClick={() => setActiveTeam('whitesox')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors ${activeTeam === 'whitesox' ? 'bg-[#27251F] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}>
              <Image src={SOX_LOGO} alt="White Sox" width={24} height={24} className="w-6 h-6" unoptimized />
              White Sox
            </button>
            <button onClick={() => setActiveTeam('opponent')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors ${activeTeam === 'opponent' ? 'bg-[#27251F] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}>
              <Image src={boxScore.opponent.logo} alt={boxScore.opponent.abbrev} width={24} height={24} className="w-6 h-6" unoptimized />
              {boxScore.opponent.fullName}
            </button>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <div className="flex border-b border-[var(--border-subtle)]">
              {(['batting', 'pitching'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-[#C4CED4] text-[#27251F]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}>
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
        </div>
      )}
    </div>
  )
}

function BattingTable({ players }: { players: PlayerStats[] }) {
  if (players.length === 0) return <div className="py-12 text-center text-[var(--text-muted)]">No batting stats available</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
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
            <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)]">
              <td className="px-3 py-3"><PlayerCell player={p} /></td>
              <td className="px-2 py-3 text-center text-sm">{p.ab ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.r ?? '-'}</td>
              <td className="px-2 py-3 text-center font-bold text-sm">{p.h ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.doubles ?? '-'}</td>
              <td className="px-2 py-3 text-center text-sm">{p.triples ?? '-'}</td>
              <td className="px-2 py-3 text-center font-bold text-sm text-[#27251F] dark:text-[#C4CED4]">{p.hr ?? '-'}</td>
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
  if (players.length === 0) return <div className="py-12 text-center text-[var(--text-muted)]">No pitching stats available</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
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
              <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)]">
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
        <Image src={player.headshotUrl} alt={player.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)]" unoptimized />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <span className="text-xs font-bold text-[var(--text-muted)]">{player.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
      )}
      <div>
        <div className="font-medium text-[var(--text-primary)] text-sm">{player.name}</div>
        <div className="text-xs text-[var(--text-muted)]">{player.position}</div>
      </div>
    </div>
  )
}
