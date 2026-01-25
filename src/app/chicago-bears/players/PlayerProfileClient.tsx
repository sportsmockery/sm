'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface PlayerListItem {
  playerId: string
  slug: string
  fullName: string
  jerseyNumber: number | null
  position: string
  headshotUrl: string | null
}

interface PlayerSeasonStats {
  season: number
  gamesPlayed: number
  passAttempts: number | null
  passCompletions: number | null
  passYards: number | null
  passTD: number | null
  passINT: number | null
  completionPct: number | null
  yardsPerAttempt: number | null
  rushAttempts: number | null
  rushYards: number | null
  rushTD: number | null
  yardsPerCarry: number | null
  receptions: number | null
  recYards: number | null
  recTD: number | null
  targets: number | null
  yardsPerReception: number | null
  tackles: number | null
  sacks: number | null
  interceptions: number | null
  passesDefended: number | null
  forcedFumbles: number | null
  fumbleRecoveries: number | null
  fumbles: number | null
  snaps: number | null
}

interface PlayerProfile {
  player: {
    playerId: string
    slug: string
    fullName: string
    firstName: string
    lastName: string
    jerseyNumber: number | null
    position: string
    positionGroup: string | null
    side: string
    height: string | null
    weight: number | null
    age: number | null
    experience: string | null
    college: string | null
    headshotUrl: string | null
    status: string | null
  }
  seasons: PlayerSeasonStats[]
  currentSeason: PlayerSeasonStats | null
  gameLog: any[]
}

interface Props {
  players: PlayerListItem[]
  initialPlayerSlug: string
  initialProfile: PlayerProfile | null
}

export default function PlayerProfileClient({ players, initialPlayerSlug, initialProfile }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(initialPlayerSlug)
  const [profile, setProfile] = useState<PlayerProfile | null>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const selectedPlayer = players.find(p => p.slug === selectedSlug)

  // Fetch new profile when selection changes
  useEffect(() => {
    if (selectedSlug === initialPlayerSlug && initialProfile) {
      setProfile(initialProfile)
      return
    }

    setLoading(true)
    fetch(`/api/bears/players/${selectedSlug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [selectedSlug, initialPlayerSlug, initialProfile])

  const handlePlayerSelect = (slug: string) => {
    setSelectedSlug(slug)
    setDropdownOpen(false)
  }

  return (
    <div className="pb-12">
      {/* Player Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Players
          </h1>
          <Link
            href="/chicago-bears/roster"
            className="text-sm text-[#C83200] hover:underline"
          >
            View Full Roster →
          </Link>
        </div>

        {/* Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full md:w-96 flex items-center justify-between gap-3 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl hover:border-[#C83200]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {selectedPlayer?.headshotUrl ? (
                <Image
                  src={selectedPlayer.headshotUrl}
                  alt={selectedPlayer.fullName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    {selectedPlayer?.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <div className="text-left">
                <div className="font-semibold text-[var(--text-primary)]">
                  {selectedPlayer?.jerseyNumber && `#${selectedPlayer.jerseyNumber} `}
                  {selectedPlayer?.fullName}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{selectedPlayer?.position}</div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute z-50 mt-2 w-full md:w-96 max-h-80 overflow-y-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-xl">
              {players.map(player => (
                <button
                  key={player.playerId}
                  onClick={() => handlePlayerSelect(player.slug)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors ${
                    player.slug === selectedSlug ? 'bg-[#C83200]/10' : ''
                  }`}
                >
                  {player.headshotUrl ? (
                    <Image
                      src={player.headshotUrl}
                      alt={player.fullName}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--text-muted)]">
                        {player.fullName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-medium text-[var(--text-primary)]">
                      {player.jerseyNumber && `#${player.jerseyNumber} `}
                      {player.fullName}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{player.position}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player Profile */}
      {loading ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#C83200] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--text-muted)]">Loading player...</span>
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Player Header Card */}
          <div className="bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 rounded-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Photo */}
              <div className="md:w-64 aspect-[3/4] md:aspect-auto relative bg-[#0B162A]">
                {profile.player.headshotUrl ? (
                  <Image
                    src={profile.player.headshotUrl}
                    alt={profile.player.fullName}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 256px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/20">
                      {profile.player.jerseyNumber || '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-white/60 uppercase tracking-wider mb-1">
                      {profile.player.position}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                      {profile.player.jerseyNumber && (
                        <span className="text-[#C83200]">#{profile.player.jerseyNumber} </span>
                      )}
                      {profile.player.fullName}
                    </h2>
                  </div>
                </div>

                {/* Bio Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {profile.player.height && (
                    <div>
                      <div className="text-xs text-white/50 uppercase">Height</div>
                      <div className="font-semibold">{profile.player.height}</div>
                    </div>
                  )}
                  {profile.player.weight && (
                    <div>
                      <div className="text-xs text-white/50 uppercase">Weight</div>
                      <div className="font-semibold">{profile.player.weight} lbs</div>
                    </div>
                  )}
                  {profile.player.age && (
                    <div>
                      <div className="text-xs text-white/50 uppercase">Age</div>
                      <div className="font-semibold">{profile.player.age}</div>
                    </div>
                  )}
                  {profile.player.experience && (
                    <div>
                      <div className="text-xs text-white/50 uppercase">Experience</div>
                      <div className="font-semibold">{profile.player.experience}</div>
                    </div>
                  )}
                  {profile.player.college && (
                    <div className="col-span-2">
                      <div className="text-xs text-white/50 uppercase">College</div>
                      <div className="font-semibold">{profile.player.college}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Season Stats */}
          {profile.currentSeason && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                {profile.currentSeason.season} Season Stats
              </h3>
              <div className="text-sm text-[var(--text-muted)] mb-4">
                {profile.currentSeason.gamesPlayed} Games Played
              </div>

              {/* Passing Stats */}
              {profile.currentSeason.passAttempts && profile.currentSeason.passAttempts > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Passing</h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <StatBox label="CMP/ATT" value={`${profile.currentSeason.passCompletions}/${profile.currentSeason.passAttempts}`} />
                    <StatBox label="YDS" value={profile.currentSeason.passYards} highlight />
                    <StatBox label="TD" value={profile.currentSeason.passTD} highlight />
                    <StatBox label="INT" value={profile.currentSeason.passINT} />
                    <StatBox label="CMP%" value={profile.currentSeason.completionPct ? `${profile.currentSeason.completionPct}%` : '-'} />
                    <StatBox label="Y/A" value={profile.currentSeason.yardsPerAttempt || '-'} />
                  </div>
                </div>
              )}

              {/* Rushing Stats */}
              {profile.currentSeason.rushAttempts && profile.currentSeason.rushAttempts > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Rushing</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    <StatBox label="CAR" value={profile.currentSeason.rushAttempts} />
                    <StatBox label="YDS" value={profile.currentSeason.rushYards} highlight />
                    <StatBox label="TD" value={profile.currentSeason.rushTD} highlight />
                    <StatBox label="Y/C" value={profile.currentSeason.yardsPerCarry || '-'} />
                  </div>
                </div>
              )}

              {/* Receiving Stats */}
              {profile.currentSeason.receptions && profile.currentSeason.receptions > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Receiving</h4>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    <StatBox label="REC" value={profile.currentSeason.receptions} />
                    <StatBox label="TGTS" value={profile.currentSeason.targets || '-'} />
                    <StatBox label="YDS" value={profile.currentSeason.recYards} highlight />
                    <StatBox label="TD" value={profile.currentSeason.recTD} highlight />
                    <StatBox label="Y/R" value={profile.currentSeason.yardsPerReception || '-'} />
                  </div>
                </div>
              )}

              {/* Defensive Stats */}
              {profile.currentSeason.tackles && profile.currentSeason.tackles > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Defense</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    <StatBox label="TKL" value={profile.currentSeason.tackles} highlight />
                    <StatBox label="SACK" value={profile.currentSeason.sacks || 0} />
                    <StatBox label="INT" value={profile.currentSeason.interceptions || 0} />
                    <StatBox label="PD" value={profile.currentSeason.passesDefended || 0} />
                  </div>
                </div>
              )}

              {/* No Stats Message */}
              {(!profile.currentSeason.passAttempts || profile.currentSeason.passAttempts === 0) &&
               (!profile.currentSeason.rushAttempts || profile.currentSeason.rushAttempts === 0) &&
               (!profile.currentSeason.receptions || profile.currentSeason.receptions === 0) &&
               (!profile.currentSeason.tackles || profile.currentSeason.tackles === 0) && (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  No stats recorded this season
                </div>
              )}
            </div>
          )}

          {/* View Full Profile Link */}
          <div className="text-center">
            <Link
              href={`/chicago-bears/players/${profile.player.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C83200] hover:bg-[#a82900] text-white font-semibold rounded-xl transition-colors"
            >
              View Full Profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center">
          <p className="text-[var(--text-muted)]">Player not found</p>
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, highlight }: { label: string; value: string | number | null; highlight?: boolean }) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-center">
      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? 'text-[#C83200]' : 'text-[var(--text-primary)]'}`}>
        {value ?? '-'}
      </div>
    </div>
  )
}
