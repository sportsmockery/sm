'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface PlayerData {
  playerId: string
  slug: string
  fullName: string
  position: string
  jerseyNumber: number | null
  headshotUrl: string | null
  height: string | null
  weight: number | null
  age: number | null
  experience: string | null
  college: string | null
  bats: string | null
  throws: string | null
  depthOrder: number
  isStarter: boolean
  injuryStatus: string | null
  injuryDetail: string | null
}

interface PositionData {
  position: string
  players: PlayerData[]
}

interface PositionGroupData {
  key: string
  name: string
  positions: PositionData[]
}

interface DepthChartClientProps {
  positionGroups: PositionGroupData[]
  totalPlayers: number
  starterCount: number
  injuredCount: number
  teamSlug: string
  teamColor: string
  starterBgAlpha: string
}

type SideFilter = 'all' | 'lineup' | 'starters' | 'relief'

function InjuryBadge({ status, detail }: { status: string; detail: string | null }) {
  let bg = '#eab308'
  let color = '#000'
  let label = status
  if (status === 'O' || status === 'Out' || status === 'IR') {
    bg = '#dc2626'
    color = '#fff'
    label = status === 'IR' ? 'IR' : 'OUT'
  } else if (status === 'D2D' || status === 'DD') {
    bg = '#f97316'
    color = '#fff'
    label = 'DTD'
  } else if (status === 'Q' || status === 'Questionable') {
    label = 'Q'
  }

  const tooltip = detail && detail !== 'questionable' ? `${label} (${detail})` : label

  return (
    <span
      title={tooltip}
      style={{
        marginLeft: '6px',
        fontSize: '9px',
        fontWeight: 700,
        padding: '1px 5px',
        borderRadius: '4px',
        backgroundColor: bg,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        lineHeight: '16px',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    >
      {tooltip}
    </span>
  )
}

export default function DepthChartClient({
  positionGroups,
  totalPlayers,
  starterCount,
  injuredCount,
  teamSlug,
  teamColor,
  starterBgAlpha,
}: DepthChartClientProps) {
  const [sideFilter, setSideFilter] = useState<SideFilter>('all')
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null)

  const filteredGroups = positionGroups.filter((g) => {
    if (sideFilter === 'all') return true
    if (sideFilter === 'lineup') return g.key === 'Lineup'
    if (sideFilter === 'starters') return g.key === 'Starting Pitchers'
    if (sideFilter === 'relief') return g.key === 'Relief Pitchers'
    return true
  })

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--sm-text)',
            letterSpacing: '-1px',
            margin: '0 0 8px 0',
          }}
        >
          Cubs Depth Chart
        </h1>
        <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
          Interactive roster depth chart with position breakdowns. Click any player for their full profile.
        </p>
      </div>

      {/* Summary + Filter Bar */}
      <div
        className="glass-card glass-card-sm glass-card-static"
        style={{ marginBottom: '24px', padding: '16px 20px' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
            <span>
              <span style={{ color: 'var(--sm-text-muted)' }}>Total: </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)' }}>{totalPlayers}</span>
            </span>
            <span>
              <span style={{ color: 'var(--sm-text-muted)' }}>Starters: </span>
              <span style={{ fontWeight: 600, color: teamColor }}>{starterCount}</span>
            </span>
            {injuredCount > 0 && (
              <span>
                <span style={{ color: 'var(--sm-text-muted)' }}>Injured: </span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{injuredCount}</span>
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'lineup', 'starters', 'relief'] as SideFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setSideFilter(f)}
                className={`draft-tab${sideFilter === f ? ' active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {f === 'all' ? 'All' : f === 'lineup' ? 'Lineup' : f === 'starters' ? 'SP' : 'RP'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {[
          { label: 'Trade Rumors', href: '/chicago-cubs/trade-rumors' },
          { label: 'Draft Tracker', href: '/chicago-cubs/draft-tracker' },
          { label: 'Payroll Tracker', href: '/chicago-cubs/cap-tracker' },
          { label: 'Full Roster', href: '/chicago-cubs/roster' },
        ].map((link) => (
          <Link key={link.label} href={link.href} className="team-pill">
            {link.label}
          </Link>
        ))}
      </div>

      {/* Depth Chart Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredGroups.map((group) => (
          <div
            key={group.key}
            style={{
              background: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Position Group Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                backgroundColor: 'var(--sm-surface)',
                borderBottom: '1px solid var(--sm-border)',
                borderLeft: `3px solid ${teamColor}`,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--sm-text)',
                  margin: 0,
                }}
              >
                {group.name}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--sm-text-muted)' }}>
                {group.positions.reduce((a, p) => a + p.players.length, 0)} players
              </span>
            </div>

            {/* Positions within group */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {group.positions.map((pos, posIdx) => (
                <div key={pos.position}>
                  {/* Position sub-header */}
                  <div
                    style={{
                      padding: '6px 20px 6px 48px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--sm-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      backgroundColor: 'var(--sm-surface)',
                      borderBottom: '1px solid var(--sm-border)',
                      ...(posIdx > 0 ? { borderTop: '1px solid var(--sm-border)' } : {}),
                    }}
                  >
                    {pos.position}
                  </div>
                  {pos.players.map((player, idx) => {
                    const isHovered = hoveredPlayer === player.playerId

                    return (
                      <Link
                        key={player.playerId}
                        href={`/${teamSlug}/players/${player.slug}`}
                        style={{ textDecoration: 'none', display: 'block' }}
                        onMouseEnter={() => setHoveredPlayer(player.playerId)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 20px',
                            borderBottom: idx < pos.players.length - 1 ? '1px solid var(--sm-border)' : 'none',
                            transition: 'all 0.2s ease',
                            transform: isHovered ? 'translateX(4px)' : 'none',
                            backgroundColor: isHovered
                              ? 'var(--sm-card-hover)'
                              : player.isStarter
                                ? starterBgAlpha
                                : 'transparent',
                            cursor: 'pointer',
                            position: 'relative',
                          }}
                        >
                          {/* Depth Number */}
                          <div style={{ width: '24px', fontSize: '12px', fontWeight: 700, color: player.isStarter ? teamColor : 'var(--sm-text-dim)', textAlign: 'center', flexShrink: 0 }}>
                            {player.depthOrder}
                          </div>

                          {/* Jersey Number */}
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                              flexShrink: 0,
                              backgroundColor: player.isStarter ? teamColor : 'var(--sm-surface)',
                              color: player.isStarter ? '#ffffff' : 'var(--sm-text-muted)',
                            }}
                          >
                            {player.jerseyNumber ?? '--'}
                          </div>

                          {/* Headshot */}
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: player.isStarter ? `2px solid ${teamColor}` : '2px solid var(--sm-border)',
                              background: 'var(--sm-surface)',
                            }}
                          >
                            {player.headshotUrl ? (
                              <Image src={player.headshotUrl} alt={player.fullName} width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--sm-text-dim)' }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Player Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--sm-text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {player.fullName}
                              {player.isStarter && (
                                <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 700, color: teamColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Starter
                                </span>
                              )}
                              {player.injuryStatus && (
                                <InjuryBadge status={player.injuryStatus} detail={player.injuryDetail} />
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>
                              {player.position}
                              {player.bats && <span> &middot; B: {player.bats}</span>}
                              {player.throws && <span> &middot; T: {player.throws}</span>}
                              {player.experience && <span> &middot; {player.experience}</span>}
                              {player.college && <span> &middot; {player.college}</span>}
                            </div>
                          </div>

                          {/* Physical Info - Desktop */}
                          <div className="hidden sm:flex" style={{ gap: '16px', fontSize: '12px', color: 'var(--sm-text-muted)', flexShrink: 0 }}>
                            {player.height && <span>{player.height}</span>}
                            {player.weight && <span>{player.weight} lbs</span>}
                            {player.age && <span>Age {player.age}</span>}
                          </div>

                          {/* Arrow */}
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: isHovered ? teamColor : 'var(--sm-text-dim)', flexShrink: 0, transition: 'color 0.2s' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
