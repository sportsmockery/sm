'use client'

import Link from 'next/link'
import Image from 'next/image'
import { type TeamOption } from './TeamSelector'

export interface TeamSeasonData {
  season: number
  record: {
    wins: number
    losses: number
    ties?: number
    otLosses?: number
  }
  standing: string
  nextGame: {
    opponent: string
    opponentLogo?: string | null
    date: string
    time: string
    isHome: boolean
  } | null
  lastGame: {
    opponent: string
    result: 'W' | 'L' | 'T' | null
    score: string
  } | null
}

interface TeamSeasonCardProps {
  team: TeamOption
  season: TeamSeasonData
  className?: string
}

export default function TeamSeasonCard({
  team,
  season,
  className = '',
}: TeamSeasonCardProps) {
  const { record, standing, nextGame, lastGame } = season

  // Calculate win percentage
  const totalGames = record.wins + record.losses + (record.ties || 0)
  const winPct = totalGames > 0
    ? ((record.wins / totalGames) * 100).toFixed(1)
    : '0.0'

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        color: 'var(--sm-text)',
      }}
    >
      {/* Team accent stripe */}
      <div style={{ height: 3, background: team.primaryColor }} />

      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--sm-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center p-0.5" style={{ background: 'var(--sm-surface)' }}>
              <Image
                src={team.logo}
                alt={team.name}
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sm-text)', margin: 0 }}>
                {season.season} Season
              </h3>
              <p style={{ fontSize: 12, color: 'var(--sm-text-muted)', margin: 0 }}>{standing}</p>
            </div>
          </div>
          <Link
            href={`/${team.categorySlug}/schedule`}
            style={{ fontSize: 12, color: 'var(--sm-text-muted)', textDecoration: 'none', fontWeight: 500 }}
          >
            Schedule
          </Link>
        </div>
      </div>

      {/* Record display */}
      <div style={{ padding: '20px' }}>
        <div className="flex items-center justify-center gap-8">
          {/* Wins */}
          <div className="text-center">
            <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--sm-text)', lineHeight: 1 }}>{record.wins}</div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginTop: 4 }}>Wins</div>
          </div>

          {/* Divider */}
          <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--sm-border)' }}>-</div>

          {/* Losses */}
          <div className="text-center">
            <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--sm-text)', lineHeight: 1 }}>{record.losses}</div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginTop: 4 }}>Losses</div>
          </div>

          {/* OT Losses or Ties (if applicable) */}
          {(record.otLosses !== undefined || (record.ties && record.ties > 0)) && (
            <>
              <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--sm-border)' }}>-</div>
              <div className="text-center">
                <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--sm-text)', lineHeight: 1 }}>{record.otLosses ?? record.ties}</div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginTop: 4 }}>
                  {record.otLosses !== undefined ? 'OT' : 'Ties'}
                </div>
              </div>
            </>
          )}

          {/* Win % */}
          <div className="text-center" style={{ borderLeft: '1px solid var(--sm-border)', paddingLeft: 28 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--sm-text)', lineHeight: 1 }}>{winPct}%</div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginTop: 4 }}>Win %</div>
          </div>
        </div>
      </div>

      {/* Game info */}
      <div className="grid grid-cols-2" style={{ borderTop: '1px solid var(--sm-border)' }}>
        {/* Next game */}
        <div style={{ padding: '14px 20px', borderRight: '1px solid var(--sm-border)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginBottom: 6 }}>Next Game</div>
          {nextGame ? (
            <div>
              <div className="flex items-center gap-2">
                {nextGame.opponentLogo && (
                  <Image
                    src={nextGame.opponentLogo}
                    alt=""
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                  />
                )}
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--sm-text)' }}>
                  {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--sm-text-muted)', marginTop: 4 }}>
                {nextGame.date} {nextGame.time && `• ${nextGame.time}`}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--sm-text-muted)', fontSize: 13 }}>Offseason</div>
          )}
        </div>

        {/* Last game */}
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sm-text-muted)', marginBottom: 6 }}>Last Game</div>
          {lastGame && lastGame.result ? (
            <div>
              <div className="flex items-center gap-2">
                <span style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                  backgroundColor: lastGame.result === 'W' ? 'rgba(34,197,94,0.15)' : lastGame.result === 'L' ? 'rgba(188,0,0,0.15)' : 'rgba(214,176,94,0.15)',
                  color: lastGame.result === 'W' ? '#16a34a' : lastGame.result === 'L' ? '#BC0000' : '#D6B05E',
                }}>
                  {lastGame.result}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--sm-text)' }}>{lastGame.opponent}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--sm-text-muted)', marginTop: 4 }}>{lastGame.score}</div>
            </div>
          ) : (
            <div style={{ color: 'var(--sm-text-muted)', fontSize: 13 }}>No recent games</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid var(--sm-border)', background: 'var(--sm-surface)' }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${team.categorySlug}/roster`} style={{ fontSize: 13, color: 'var(--sm-text-muted)', textDecoration: 'none', fontWeight: 500 }}>
            Roster
          </Link>
          <Link href={`/${team.categorySlug}/stats`} style={{ fontSize: 13, color: 'var(--sm-text-muted)', textDecoration: 'none', fontWeight: 500 }}>
            Stats
          </Link>
          <Link href={`/${team.categorySlug}/schedule`} style={{ fontSize: 13, color: 'var(--sm-text-muted)', textDecoration: 'none', fontWeight: 500 }}>
            Schedule
          </Link>
        </div>
        <Link
          href={`/${team.categorySlug}`}
          className="flex items-center gap-1"
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 6,
            backgroundColor: '#BC0000',
            color: '#FAFAFB',
            textDecoration: 'none',
            lineHeight: 1,
          }}
        >
          All News <span style={{ fontSize: 14 }}>&rarr;</span>
        </Link>
      </div>
    </div>
  )
}
