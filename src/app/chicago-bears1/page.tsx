'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ObsidianScene from '@/components/bears1/ObsidianScene'
import HolographicRoster from '@/components/bears1/HolographicRoster'
import RumorRadar from '@/components/bears1/RumorRadar'
import BearsNewsFeed from '@/components/bears1/BearsNewsFeed'
import BearsAIHud from '@/components/bears1/BearsAIHud'
import type { BearsPlayer } from '@/lib/bearsData'
import type { Bears1Data } from '@/lib/bears1Data'

export default function Bears1Page() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activePlayer, setActivePlayer] = useState<BearsPlayer | null>(null)
  const [data, setData] = useState<Bears1Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/broker?type=bears1')
        const envelope = await res.json()
        if (envelope.data) setData(envelope.data)
      } catch {
        // Silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleActiveChange = useCallback((player: BearsPlayer | null) => {
    setActivePlayer(player)
  }, [])

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 'var(--b1-nav-height)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid rgba(188,0,0,0.2)',
              borderTopColor: '#bc0000',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#bc0000',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
            }}
          >
            Initializing Obsidian Hub
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 'var(--b1-nav-height)',
        }}
      >
        <div style={{ textAlign: 'center', color: isDark ? '#555' : '#999', fontSize: 13 }}>
          Unable to load data. Please try again.
        </div>
      </main>
    )
  }

  const record = data.record

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Three.js background layer */}
      <ObsidianScene hasActivePlayer={!!activePlayer} isDark={isDark} />

      {/* HTML overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Team Status Bar */}
        <section
          style={{
            paddingTop: 'calc(var(--b1-nav-height) + 24px)',
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'calc(var(--b1-nav-height) + 24px) 24px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 900,
                fontStyle: 'italic',
                color: isDark ? '#fff' : '#111',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              BEARS
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                background: isDark ? 'rgba(188,0,0,0.1)' : 'rgba(188,0,0,0.06)',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#bc0000',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {record.regularSeason.wins}-{record.regularSeason.losses}
                {record.regularSeason.ties > 0 ? `-${record.regularSeason.ties}` : ''}
              </span>
              {record.divisionRank && (
                <span
                  style={{
                    fontSize: 10,
                    color: isDark ? '#888' : '#666',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {record.divisionRank}
                </span>
              )}
            </div>
            {record.postseason.wins + record.postseason.losses > 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: isDark ? '#666' : '#999',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                POST: {record.postseason.wins}-{record.postseason.losses}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: isDark ? '#444' : '#bbb',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            2025 SEASON \u2022 {data.players.length} ACTIVE PLAYERS
          </div>
        </section>

        {/* Holographic Roster */}
        <HolographicRoster
          players={data.players}
          stats={data.stats}
          onActiveChange={handleActiveChange}
        />

        {/* Two-column: Radar + News */}
        <section
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px 120px',
          }}
        >
          <div
            className="b1-intel-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
              alignItems: 'start',
            }}
          >
            <RumorRadar rumors={data.radarData} />
            <BearsNewsFeed headlines={data.headlines} />
          </div>
        </section>
      </div>

      {/* AI HUD dock */}
      <BearsAIHud activePlayer={activePlayer} />

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .b1-intel-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}
