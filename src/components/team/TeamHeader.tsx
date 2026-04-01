'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import type { TeamInfo } from './TeamHubLayout'

interface TeamHeaderProps {
  team: TeamInfo
  rightSlot?: ReactNode
}

export default function TeamHeader({ team, rightSlot }: TeamHeaderProps) {

  return (
    <header
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-5"
      style={{
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'transparent',
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
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
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
                color: '#FAFAFB',
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
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              {`${new Date().getFullYear()} Season`}
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              margin: 0,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 360,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {`Chicago • ${team.division || (team.league === 'NFL' ? 'NFC North' : team.league === 'NBA' ? 'Eastern Conference' : team.league === 'NHL' ? 'Central Division' : 'MLB')}`}
          </p>
        </div>
      </div>
      {/* Right: header tools / actions slot */}
      {rightSlot && (
        <div
          className="hidden lg:block"
          style={{
            flex: '1 1 auto',
            maxWidth: 640,
          }}
        >
          {rightSlot}
        </div>
      )}
    </header>
  )
}

