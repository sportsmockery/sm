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
              {`${new Date().getFullYear()} Season`}
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
      {/* Right: header tools / actions slot */}
      {rightSlot && (
        <div
          className="hidden md:block"
          style={{
            minWidth: 320,
            maxWidth: 520,
            transform: 'scale(0.9)',
            transformOrigin: 'top right',
          }}
        >
          {rightSlot}
        </div>
      )}
    </header>
  )
}

