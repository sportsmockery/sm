'use client'

import { useState } from 'react'
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

interface Props {
  players: PlayerListItem[]
}

const PLAYERS_PER_PAGE = 12

export default function PlayerProfileClient({ players }: Props) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(players.length / PLAYERS_PER_PAGE)
  const start = page * PLAYERS_PER_PAGE
  const visible = players.slice(start, start + PLAYERS_PER_PAGE)

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)' }}
        >
          Players
        </h1>
        <Link
          href="/chicago-bears/roster"
          className="text-sm hover:underline"
          style={{ color: '#C83200' }}
        >
          View Full Roster &rarr;
        </Link>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((player) => (
          <Link
            key={player.playerId}
            href={`/chicago-bears/players/${player.slug}`}
            className="group"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div
              className="glass-card glass-card-static"
              style={{
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              {/* Headshot */}
              {player.headshotUrl ? (
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: '3px solid var(--sm-border)', marginBottom: 12 }}
                >
                  <Image
                    src={player.headshotUrl}
                    alt={player.fullName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: '#C83200',
                    color: '#fff',
                    fontSize: 24,
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  {player.jerseyNumber ?? '?'}
                </div>
              )}

              {/* Name */}
              <div
                className="font-semibold group-hover:text-[#C83200] transition-colors"
                style={{
                  color: 'var(--sm-text)',
                  fontSize: 14,
                  lineHeight: 1.3,
                  marginBottom: 4,
                }}
              >
                {player.fullName}
              </div>

              {/* Position & Number */}
              <div style={{ color: 'var(--sm-text-muted)', fontSize: 12 }}>
                {player.position}
                {player.jerseyNumber && ` · #${player.jerseyNumber}`}
              </div>

              {/* View Profile Button */}
              <div
                className="flex items-center gap-1 mt-3"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#C83200',
                }}
              >
                View Full Profile
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
            style={{
              backgroundColor: page === 0 ? 'var(--sm-surface)' : '#C83200',
              color: page === 0 ? 'var(--sm-text-muted)' : '#ffffff',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              opacity: page === 0 ? 0.5 : 1,
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span style={{ color: 'var(--sm-text-muted)', fontSize: 14 }}>
            Page {page + 1} of {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
            style={{
              backgroundColor: page === totalPages - 1 ? 'var(--sm-surface)' : '#C83200',
              color: page === totalPages - 1 ? 'var(--sm-text-muted)' : '#ffffff',
              cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: page === totalPages - 1 ? 0.5 : 1,
            }}
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
