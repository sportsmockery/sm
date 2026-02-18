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
    <main style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Header */}
      <div className="sm-hero-bg" style={{
        position: 'relative',
        background: 'linear-gradient(to right, #0B162A, rgba(11,22,42,0.9))',
        borderBottom: '1px solid var(--sm-border)',
      }}>
        <div className="sm-grid-overlay" />
        <div style={{ position: 'relative', maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/chicago-bears" style={{ color: 'inherit', textDecoration: 'none' }}>Chicago Bears</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>Player Profiles</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(1.875rem, 3vw, 2.25rem)', fontWeight: 700, color: '#fff', fontFamily: 'var(--sm-font-heading)' }}>
            Chicago Bears Players
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
            Search and explore the 2025 Bears roster. Click a player to view their full profile.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Player Selector */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            {/* Search Box */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <svg
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--sm-text-muted)' }}
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
                  className="input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {sideOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSideFilter(option.value)}
                  className="sm-tag"
                  style={
                    sideFilter === option.value
                      ? { background: '#C83200', color: '#fff', border: 'none', cursor: 'pointer' }
                      : { background: 'var(--sm-card)', color: 'var(--sm-text-muted)', border: '1px solid var(--sm-border)', cursor: 'pointer' }
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Player List */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px', borderBottom: '1px solid var(--sm-border)', background: 'var(--sm-surface)' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)' }}>
                  {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--sm-text-muted)' }}>
                    Loading players...
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--sm-text-muted)' }}>
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
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--sm-border)',
                            background: selectedPlayer?.playerId === player.playerId ? 'var(--sm-card-hover)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <PlayerRow player={player} />
                        </Link>
                      </div>

                      {/* Mobile: Direct link */}
                      <Link
                        href={`/chicago-bears/players/${player.slug}`}
                        className="lg:hidden"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--sm-border)',
                          textDecoration: 'none',
                          transition: 'background 0.15s ease',
                        }}
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
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--sm-surface)',
                  }}>
                    <svg style={{ width: '32px', height: '32px', color: 'var(--sm-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <span style={{
        width: '32px',
        height: '32px',
        borderRadius: 'var(--sm-radius-sm)',
        background: '#0B162A',
        color: '#fff',
        fontSize: 'var(--text-sm)',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {player.jerseyNumber ?? '--'}
      </span>

      {/* Headshot */}
      {player.headshotUrl ? (
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--sm-border)' }}>
          <Image
            src={player.headshotUrl}
            alt={player.fullName}
            width={40}
            height={40}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--sm-surface)' }}>
          <svg style={{ width: '20px', height: '20px', color: 'var(--sm-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}

      {/* Name and Position */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="truncate" style={{ fontWeight: 500, color: 'var(--sm-text)' }}>
          {player.fullName}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)' }}>
          {player.position}
        </div>
      </div>

      {/* Arrow */}
      <svg style={{ width: '16px', height: '16px', color: 'var(--sm-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Header with gradient */}
      <div style={{
        padding: '24px',
        color: '#fff',
        background: 'linear-gradient(135deg, #0B162A 0%, #0B162A 60%, #C83200 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Headshot */}
          {player.headshotUrl ? (
            <div style={{ width: '96px', height: '96px', borderRadius: 'var(--sm-radius-md)', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
              <Image
                src={player.headshotUrl}
                alt={player.fullName}
                width={96}
                height={96}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{ width: '96px', height: '96px', borderRadius: 'var(--sm-radius-md)', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.5)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="sm-tag" style={{ background: 'rgba(255,255,255,0.2)' }}>
                #{player.jerseyNumber}
              </span>
              <span className="sm-tag" style={{ background: '#C83200' }}>
                {player.position}
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--sm-font-heading)' }}>
              {player.fullName}
            </h2>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
              Chicago Bears {player.side === 'OFF' ? 'Offense' : player.side === 'DEF' ? 'Defense' : 'Special Teams'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: 'var(--sm-text-muted)' }}>
          2025 Season Stats
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--sm-text-muted)' }}>
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
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--sm-text-muted)' }}>
            No stats available
          </div>
        )}

        {/* View Profile Link */}
        <Link
          href={`/chicago-bears/players/${player.slug}`}
          className="btn btn-md"
          style={{
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            borderRadius: 'var(--sm-radius-md)',
            fontWeight: 600,
            background: '#C83200',
            color: '#fff',
            border: 'none',
            textDecoration: 'none',
          }}
        >
          View Full Profile
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{
      borderRadius: 'var(--sm-radius-md)',
      padding: '12px',
      textAlign: 'center',
      background: 'var(--sm-surface)',
      border: '1px solid var(--sm-border)',
    }}>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sm-text-muted)' }}>
        {label}
      </div>
    </div>
  )
}
