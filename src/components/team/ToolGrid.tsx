'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

interface ToolGridProps {
  teamSlug: string
  accentColor: string
  secondaryColor: string
}

interface ToolCard {
  title: string
  path: string
  icon: React.ReactNode
  preview: React.ReactNode
}

function TradeRumorsPreview() {
  return (
    <div style={{ overflow: 'hidden', position: 'relative', height: '24px', marginTop: '12px' }}>
      <div
        style={{
          display: 'flex',
          gap: '24px',
          whiteSpace: 'nowrap',
          animation: 'ticker-scroll 12s linear infinite',
          fontSize: '12px',
          color: 'var(--sm-text-dim)',
        }}
      >
        <span>Latest trade buzz &bull; Rumor mill active &bull; Cap implications &bull; Trade deadline watch</span>
        <span>Latest trade buzz &bull; Rumor mill active &bull; Cap implications &bull; Trade deadline watch</span>
      </div>
    </div>
  )
}

function DraftTrackerPreview() {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      <span
        style={{
          padding: '4px 12px',
          borderRadius: 'var(--sm-radius-pill)',
          fontSize: '11px',
          fontWeight: 600,
          background: 'var(--sm-gradient-subtle)',
          color: 'var(--sm-text-muted)',
          border: '1px solid var(--sm-border)',
        }}
      >
        Mock Draft
      </span>
      <span
        style={{
          padding: '4px 12px',
          borderRadius: 'var(--sm-radius-pill)',
          fontSize: '11px',
          fontWeight: 600,
          background: 'var(--sm-surface)',
          color: 'var(--sm-text-dim)',
          border: '1px solid var(--sm-border)',
        }}
      >
        Big Board
      </span>
    </div>
  )
}

function CapTrackerPreview({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--sm-text-dim)', fontWeight: 600 }}>Cap Space</span>
        <span style={{ fontSize: '11px', color: 'var(--sm-text-muted)', fontWeight: 600 }}>75%</span>
      </div>
      <div
        style={{
          height: '6px',
          borderRadius: '3px',
          background: 'var(--sm-surface)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '75%',
            height: '100%',
            borderRadius: '3px',
            background: accentColor,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}

function DepthChartPreview({ accentColor }: { accentColor: string }) {
  const positions = ['QB', 'WR1', 'RB']
  return (
    <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
      {positions.map((pos) => (
        <span
          key={pos}
          style={{
            padding: '3px 10px',
            borderRadius: 'var(--sm-radius-pill)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {pos}
        </span>
      ))}
    </div>
  )
}

function GameCenterPreview() {
  return (
    <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sm-success)', display: 'inline-block' }} />
        <span>Live scores &amp; play-by-play</span>
      </div>
    </div>
  )
}

function SimulatorPreview({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ marginTop: '12px' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: 'var(--sm-radius-pill)',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: accentColor,
          color: '#ffffff',
        }}
      >
        Build a Trade
        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </span>
    </div>
  )
}

function getTools(teamSlug: string, accentColor: string): ToolCard[] {
  return [
    {
      title: 'Trade Rumors',
      path: `/${teamSlug}/trade-rumors`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
      preview: <TradeRumorsPreview />,
    },
    {
      title: 'Draft Tracker',
      path: `/${teamSlug}/draft-tracker`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      preview: <DraftTrackerPreview />,
    },
    {
      title: 'Cap Tracker',
      path: `/${teamSlug}/cap-tracker`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: <CapTrackerPreview accentColor={accentColor} />,
    },
    {
      title: 'Depth Chart',
      path: `/${teamSlug}/depth-chart`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      preview: <DepthChartPreview accentColor={accentColor} />,
    },
    {
      title: 'Game Center',
      path: `/${teamSlug}/game-center`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      ),
      preview: <GameCenterPreview />,
    },
    {
      title: 'Simulator',
      path: '/gm',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      preview: <SimulatorPreview accentColor={accentColor} />,
    },
  ]
}

export default function ToolGrid({ teamSlug, accentColor, secondaryColor }: ToolGridProps) {
  const prefersReducedMotion = useReducedMotion()
  const tools = getTools(teamSlug, accentColor)

  return (
    <section style={{ marginBottom: '48px' }}>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--sm-text)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          paddingBottom: '8px',
          borderBottom: '3px solid var(--sm-red)',
          margin: '0 0 20px 0',
        }}
      >
        Team Tools
      </h2>
      <div className="tool-grid">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.title}
            style={{ minWidth: 0, overflow: 'hidden' }}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={
              prefersReducedMotion
                ? {}
                : {
                    y: -4,
                    boxShadow: `0 0 20px ${accentColor}25`,
                    transition: { duration: 0.2, ease: 'easeInOut' },
                  }
            }
          >
            <Link
              href={tool.path}
              style={{ textDecoration: 'none', display: 'block', height: '100%' }}
            >
              <div
                className="glass-card"
                style={{
                  height: '100%',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${secondaryColor}40, ${accentColor}20)`,
                      border: `1px solid ${accentColor}30`,
                      color: accentColor,
                      flexShrink: 0,
                    }}
                  >
                    {tool.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: 'var(--sm-text)',
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '-0.3px',
                      margin: 0,
                    }}
                  >
                    {tool.title}
                  </h3>
                </div>
                <div style={{ flex: 1 }}>{tool.preview}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
