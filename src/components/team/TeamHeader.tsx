'use client'

import Image from 'next/image'
import type { TeamInfo, NextGameInfo, LastGameInfo, TeamRecord } from './TeamHubLayout'

interface TeamHeaderProps {
  team: TeamInfo
  record?: TeamRecord | null
  nextGame?: NextGameInfo | null
  lastGame?: LastGameInfo | null
}

function formatRecord(team: TeamInfo, record?: TeamRecord | null) {
  if (!record) return '--'

  let base = ''

  if (team.league === 'NFL') {
    const tie = record.ties && record.ties > 0 ? `-${record.ties}` : ''
    base = `${record.wins}-${record.losses}${tie}`
  } else if (team.league === 'NHL') {
    const ot = record.otLosses && record.otLosses > 0 ? `-${record.otLosses}` : ''
    base = `${record.wins}-${record.losses}${ot}`
  } else {
    base = `${record.wins}-${record.losses}`
  }

  if (record.postseason && (record.postseason.wins > 0 || record.postseason.losses > 0)) {
    return `${base} • ${record.postseason.wins}-${record.postseason.losses} in playoffs`
  }

  return base
}

function formatLastResult(lastGame?: LastGameInfo | null) {
  if (!lastGame) return 'No recent game'
  const prefix = lastGame.result || ''
  const location = lastGame.isHome ? 'vs' : '@'
  return `${prefix} ${lastGame.teamScore}-${lastGame.opponentScore} ${location} ${lastGame.opponent}`
}

function formatWinPct(record?: TeamRecord | null) {
  if (!record) return '--'
  if (record.pct) return `${record.pct}%`
  const totalGames = record.wins + record.losses + (record.ties || 0)
  if (!totalGames) return '--'
  const pct = ((record.wins / totalGames) * 100).toFixed(1)
  return `${pct}%`
}

export default function TeamHeader({ team, record, nextGame, lastGame }: TeamHeaderProps) {
  const recordText = formatRecord(team, record)
  const lastResultText = formatLastResult(lastGame)
  const winPct = formatWinPct(record)

  return (
    <header
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-5"
      style={{
        position: 'relative',
        borderBottom: '1px solid rgba(11,15,20,0.07)',
        background:
          'radial-gradient(circle at 0% 0%, rgba(200,56,3,0.08) 0, transparent 42%) ,' +
          'linear-gradient(to bottom, #f7f7f9, #f2f3f6)',
        padding: '16px 24px 14px',
        minHeight: 176,
      }}
    >
      {/* Left: Logo + name + subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: '#FAFAFB',
            border: '1px solid rgba(11,15,20,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
            flexShrink: 0,
          }}
        >
          <Image
            src={team.logo}
            alt={team.name}
            width={52}
            height={52}
            style={{ width: 52, height: 52, objectFit: 'contain' }}
            unoptimized
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h1
              style={{
                fontSize: 24,
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: -0.3,
                margin: 0,
                color: '#0B0F14',
                whiteSpace: 'nowrap',
              }}
            >
              {team.name}
            </h1>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(11,15,20,0.7)',
                border: '1px solid rgba(11,15,20,0.08)',
                background: '#F8F8FA',
              }}
            >
              {record?.recordLabel || `${new Date().getFullYear()} Season`}
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              margin: 0,
              color: 'rgba(11,15,20,0.65)',
              maxWidth: 360,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {team.league === 'NFL'
              ? 'Chicago • NFC North'
              : team.league === 'NBA'
              ? 'Chicago • Central Division'
              : team.league === 'NHL'
              ? 'Chicago • Central Division'
              : 'Chicago • American League'}
          </p>
        </div>
      </div>

      {/* Right: stat band */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'flex-end',
          gap: 10,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 0,
            borderRadius: 999,
            overflow: 'hidden',
            border: '1px solid rgba(11,15,20,0.08)',
            background: '#FFFFFF',
            boxShadow: '0 10px 24px rgba(0,0,0,0.03)',
          }}
        >
          {/* Record */}
          <div
            style={{
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 112,
              borderRight: '1px solid rgba(11,15,20,0.06)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(11,15,20,0.6)',
              }}
            >
              Record
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#0B0F14',
              }}
            >
              {recordText}
            </span>
          </div>

          {/* Last result */}
          <div
            style={{
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 172,
              borderRight: '1px solid rgba(11,15,20,0.06)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(11,15,20,0.6)',
              }}
            >
              Last Game
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(11,15,20,0.8)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {lastResultText}
            </span>
          </div>

          {/* Win % / standing */}
          <div
            style={{
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 120,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(11,15,20,0.6)',
              }}
            >
              {record?.divisionRank ? 'Division Rank' : 'Win %'}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#0B0F14',
              }}
            >
              {record?.divisionRank || winPct}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

