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
  primaryRole: string | null
}

interface PositionGroupData {
  key: string
  name: string
  players: PlayerData[]
}

interface DepthChartClientProps {
  positionGroups: PositionGroupData[]
  totalPlayers: number
  offenseCount: number
  defenseCount: number
}

type SideFilter = 'all' | 'offense' | 'defense' | 'special'

const OFFENSE_GROUPS = ['QB', 'RB', 'WR', 'TE', 'OL']
const DEFENSE_GROUPS = ['DL', 'LB', 'CB', 'S']

export default function DepthChartClient({
  positionGroups,
  totalPlayers,
  offenseCount,
  defenseCount,
}: DepthChartClientProps) {
  const [sideFilter, setSideFilter] = useState<SideFilter>('all')
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null)

  const filteredGroups = positionGroups.filter((g) => {
    if (sideFilter === 'all') return true
    if (sideFilter === 'offense') return OFFENSE_GROUPS.includes(g.key)
    if (sideFilter === 'defense') return DEFENSE_GROUPS.includes(g.key)
    if (sideFilter === 'special') return g.key === 'ST'
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
          Bears Depth Chart
        </h1>
        <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
          Interactive 53-man roster with starter/backup hierarchy. Click any player for their full profile.
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
              <span style={{ color: 'var(--sm-text-muted)' }}>OFF: </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)' }}>{offenseCount}</span>
            </span>
            <span>
              <span style={{ color: 'var(--sm-text-muted)' }}>DEF: </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)' }}>{defenseCount}</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'offense', 'defense', 'special'] as SideFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setSideFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                  backgroundColor: sideFilter === f ? '#C83200' : 'transparent',
                  color: sideFilter === f ? '#ffffff' : 'var(--sm-text-muted)',
                  borderColor: sideFilter === f ? '#C83200' : 'var(--sm-border)',
                }}
              >
                {f === 'all' ? 'All' : f === 'special' ? 'ST' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {[
          { label: 'Trade Rumors', href: '/chicago-bears/trade-rumors' },
          { label: 'Draft Tracker', href: '/chicago-bears/draft-tracker' },
          { label: 'Cap Tracker', href: '/chicago-bears/cap-tracker' },
          { label: 'Full Roster', href: '/chicago-bears/roster' },
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
                borderLeft: '3px solid #C83200',
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
                {group.players.length} player{group.players.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Players */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {group.players.map((player, idx) => {
                const isStarter = idx === 0 || player.primaryRole?.toLowerCase().includes('starter')
                const isHovered = hoveredPlayer === player.playerId

                return (
                  <Link
                    key={player.playerId}
                    href={`/chicago-bears/players/${player.slug}`}
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
                        borderBottom: idx < group.players.length - 1 ? '1px solid var(--sm-border)' : 'none',
                        transition: 'all 0.2s ease',
                        transform: isHovered ? 'translateX(4px)' : 'none',
                        backgroundColor: isHovered
                          ? 'var(--sm-card-hover)'
                          : isStarter
                            ? 'rgba(200,50,0,0.03)'
                            : 'transparent',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {/* Depth Number */}
                      <div
                        style={{
                          width: '24px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isStarter ? '#C83200' : 'var(--sm-text-dim)',
                          textAlign: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
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
                          backgroundColor: isStarter ? '#C83200' : 'var(--sm-surface)',
                          color: isStarter ? '#ffffff' : 'var(--sm-text-muted)',
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
                          border: isStarter ? '2px solid #C83200' : '2px solid var(--sm-border)',
                          background: 'var(--sm-surface)',
                        }}
                      >
                        {player.headshotUrl ? (
                          <Image
                            src={player.headshotUrl}
                            alt={player.fullName}
                            width={40}
                            height={40}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                              style={{ color: 'var(--sm-text-dim)' }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                              />
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
                          {isStarter && (
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#C83200',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Starter
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>
                          {player.position}
                          {player.experience && <span> &middot; {player.experience}</span>}
                          {player.college && <span> &middot; {player.college}</span>}
                        </div>
                      </div>

                      {/* Physical Info - Desktop */}
                      <div
                        className="hidden sm:flex"
                        style={{
                          gap: '16px',
                          fontSize: '12px',
                          color: 'var(--sm-text-muted)',
                          flexShrink: 0,
                        }}
                      >
                        {player.height && <span>{player.height}</span>}
                        {player.weight && <span>{player.weight} lbs</span>}
                        {player.age && <span>Age {player.age}</span>}
                      </div>

                      {/* Arrow */}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        style={{
                          color: isHovered ? '#C83200' : 'var(--sm-text-dim)',
                          flexShrink: 0,
                          transition: 'color 0.2s',
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
