'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Types for player data
type Side = 'OFF' | 'DEF' | 'ST'

interface BearsPlayer {
  playerId: string
  slug: string
  fullName: string
  firstName: string
  lastName: string
  jerseyNumber: number | null
  position: string
  positionGroup: string | null
  side: Side
  height: string | null
  weight: number | null
  age: number | null
  experience: string | null
  college: string | null
  headshotUrl: string | null
  primaryRole: string | null
  status: string | null
}

interface PlayerSeasonStats {
  gamesPlayed: number
  passYards: number | null
  passTD: number | null
  passINT: number | null
  completionPct: number | null
  rushYards: number | null
  rushTD: number | null
  yardsPerCarry: number | null
  receptions: number | null
  recYards: number | null
  recTD: number | null
  tackles: number | null
  sacks: number | null
  interceptions: number | null
  passesDefended: number | null
  forcedFumbles: number | null
  snaps: number | null
}

interface PlayerProfile {
  player: BearsPlayer
  currentSeason: PlayerSeasonStats | null
}

// Filter players by side
function filterPlayersBySide(players: BearsPlayer[], side: Side | 'ALL'): BearsPlayer[] {
  if (side === 'ALL') return players
  return players.filter(p => p.side === side)
}

export default function BearsPlayerSelectorPage() {
  const [players, setPlayers] = useState<BearsPlayer[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<BearsPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<Side | 'ALL'>('ALL')
  const [selectedPlayer, setSelectedPlayer] = useState<BearsPlayer | null>(null)
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Load players on mount via API
  useEffect(() => {
    async function loadPlayers() {
      try {
        const res = await fetch('/api/bears/players')
        const data = await res.json()
        setPlayers(data.players || [])
        setFilteredPlayers(data.players || [])
      } catch (err) {
        console.error('Failed to load players:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPlayers()
  }, [])

  // Filter players when search or side filter changes
  useEffect(() => {
    let result = players

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.jerseyNumber?.toString() === q
      )
    }

    // Apply side filter
    result = filterPlayersBySide(result, sideFilter)

    setFilteredPlayers(result)
  }, [players, searchQuery, sideFilter])

  // Load player profile when selected (desktop only) via API
  useEffect(() => {
    if (!selectedPlayer) {
      setPlayerProfile(null)
      return
    }

    const playerSlug = selectedPlayer.slug
    async function loadProfile() {
      setLoadingProfile(true)
      try {
        const res = await fetch(`/api/bears/players/${playerSlug}`)
        const data = await res.json()
        if (data.player) {
          setPlayerProfile({
            player: data.player,
            currentSeason: data.currentSeason,
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [selectedPlayer])

  const sideOptions: { value: Side | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'OFF', label: 'Offense' },
    { value: 'DEF', label: 'Defense' },
    { value: 'ST', label: 'Special Teams' },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #0B162A, rgba(11,22,42,0.9))', borderBottom: '1px solid var(--sm-border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-bears" className="hover:text-white">Chicago Bears</Link>
            <span>/</span>
            <span className="text-white">Player Profiles</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Chicago Bears Players
          </h1>
          <p className="text-white/70 mt-2">
            Search and explore the 2025 Bears roster. Click a player to view their full profile.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Player Selector */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            {/* Search Box */}
            <div className="mb-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--sm-text-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search players by name or number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--sm-card)',
                    border: '1px solid var(--sm-border)',
                    color: 'var(--sm-text)',
                    borderRadius: '12px',
                  }}
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {sideOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSideFilter(option.value)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  style={
                    sideFilter === option.value
                      ? { backgroundColor: '#C83200', color: '#fff' }
                      : { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text-muted)', border: '1px solid var(--sm-border)' }
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Player List */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
              <div className="p-3" style={{ borderBottom: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
                <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                  {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center" style={{ color: 'var(--sm-text-muted)' }}>
                    Loading players...
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <div className="p-8 text-center" style={{ color: 'var(--sm-text-muted)' }}>
                    No players found
                  </div>
                ) : (
                  filteredPlayers.map((player) => (
                    <div key={player.playerId}>
                      {/* Desktop: Hover to preview */}
                      <div
                        className="hidden lg:block"
                        onMouseEnter={() => setSelectedPlayer(player)}
                      >
                        <Link
                          href={`/chicago-bears/players/${player.slug}`}
                          className="flex items-center gap-3 px-4 py-3 transition-colors"
                          style={{
                            borderBottom: '1px solid var(--sm-border)',
                            backgroundColor: selectedPlayer?.playerId === player.playerId ? 'var(--sm-card-hover)' : 'transparent',
                          }}
                        >
                          <PlayerRow player={player} />
                        </Link>
                      </div>

                      {/* Mobile: Direct link */}
                      <Link
                        href={`/chicago-bears/players/${player.slug}`}
                        className="lg:hidden flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{ borderBottom: '1px solid var(--sm-border)' }}
                      >
                        <PlayerRow player={player} />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick View Panel (Desktop only) */}
          <div className="hidden lg:block flex-1">
            <div className="sticky top-24">
              {selectedPlayer ? (
                <QuickViewPanel
                  player={selectedPlayer}
                  profile={playerProfile}
                  loading={loadingProfile}
                />
              ) : (
                <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sm-surface)' }}>
                    <svg className="w-8 h-8" style={{ color: 'var(--sm-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p style={{ color: 'var(--sm-text-muted)' }}>
                    Hover over a player to see a quick preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Player Row Component
function PlayerRow({ player }: { player: BearsPlayer }) {
  return (
    <>
      {/* Jersey Number */}
      <span className="w-8 h-8 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0B162A' }}>
        {player.jerseyNumber ?? '--'}
      </span>

      {/* Headshot */}
      {player.headshotUrl ? (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--sm-border)' }}>
          <Image
            src={player.headshotUrl}
            alt={player.fullName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <svg className="w-5 h-5" style={{ color: 'var(--sm-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}

      {/* Name and Position */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate" style={{ color: 'var(--sm-text)' }}>
          {player.fullName}
        </div>
        <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
          {player.position}
        </div>
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4" style={{ color: 'var(--sm-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </>
  )
}

// Quick View Panel Component
function QuickViewPanel({
  player,
  profile,
  loading,
}: {
  player: BearsPlayer
  profile: PlayerProfile | null
  loading: boolean
}) {
  const stats = profile?.currentSeason

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
      {/* Header with gradient */}
      <div
        className="p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0B162A 0%, #0B162A 60%, #C83200 100%)' }}
      >
        <div className="flex items-start gap-4">
          {/* Headshot */}
          {player.headshotUrl ? (
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/20 flex-shrink-0">
              <Image
                src={player.headshotUrl}
                alt={player.fullName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-white/20 rounded text-sm font-bold">
                #{player.jerseyNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-sm font-medium" style={{ backgroundColor: '#C83200' }}>
                {player.position}
              </span>
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {player.fullName}
            </h2>
            <div className="text-white/70 text-sm mt-1">
              Chicago Bears {player.side === 'OFF' ? 'Offense' : player.side === 'DEF' ? 'Defense' : 'Special Teams'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--sm-text-muted)' }}>
          2025 Season Stats
        </h3>

        {loading ? (
          <div className="text-center py-4" style={{ color: 'var(--sm-text-muted)' }}>
            Loading stats...
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-4">
            {/* Show position-appropriate stats */}
            {player.position === 'QB' && (
              <>
                <StatCard label="Pass YDS" value={stats.passYards ?? 0} />
                <StatCard label="Pass TD" value={stats.passTD ?? 0} />
                <StatCard label="INT" value={stats.passINT ?? 0} />
              </>
            )}
            {['RB', 'FB'].includes(player.position) && (
              <>
                <StatCard label="Rush YDS" value={stats.rushYards ?? 0} />
                <StatCard label="Rush TD" value={stats.rushTD ?? 0} />
                <StatCard label="YPC" value={stats.yardsPerCarry ?? 0} />
              </>
            )}
            {['WR', 'TE'].includes(player.position) && (
              <>
                <StatCard label="Rec YDS" value={stats.recYards ?? 0} />
                <StatCard label="Rec TD" value={stats.recTD ?? 0} />
                <StatCard label="REC" value={stats.receptions ?? 0} />
              </>
            )}
            {['CB', 'S', 'FS', 'SS', 'DB'].includes(player.position) && (
              <>
                <StatCard label="Tackles" value={stats.tackles ?? 0} />
                <StatCard label="INT" value={stats.interceptions ?? 0} />
                <StatCard label="PD" value={stats.passesDefended ?? 0} />
              </>
            )}
            {['LB', 'ILB', 'OLB', 'MLB'].includes(player.position) && (
              <>
                <StatCard label="Tackles" value={stats.tackles ?? 0} />
                <StatCard label="Sacks" value={stats.sacks ?? 0} />
                <StatCard label="INT" value={stats.interceptions ?? 0} />
              </>
            )}
            {['DE', 'DT', 'NT', 'DL'].includes(player.position) && (
              <>
                <StatCard label="Tackles" value={stats.tackles ?? 0} />
                <StatCard label="Sacks" value={stats.sacks ?? 0} />
                <StatCard label="FF" value={stats.forcedFumbles ?? 0} />
              </>
            )}
            {/* Default for O-line or unknown */}
            {!['QB', 'RB', 'FB', 'WR', 'TE', 'CB', 'S', 'FS', 'SS', 'DB', 'LB', 'ILB', 'OLB', 'MLB', 'DE', 'DT', 'NT', 'DL'].includes(player.position) && (
              <>
                <StatCard label="Games" value={stats.gamesPlayed} />
                <StatCard label="Snaps" value={stats.snaps ?? 0} />
                <StatCard label="--" value="--" />
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-4" style={{ color: 'var(--sm-text-muted)' }}>
            No stats available
          </div>
        )}

        {/* View Profile Link */}
        <Link
          href={`/chicago-bears/players/${player.slug}`}
          className="mt-6 flex items-center justify-center gap-2 w-full py-3 font-semibold rounded-xl transition-colors"
          style={{ backgroundColor: '#C83200', color: '#fff' }}
        >
          View Full Profile
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--sm-surface)' }}>
      <div className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
        {label}
      </div>
    </div>
  )
}
