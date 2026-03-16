'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

interface ToolGridProps {
  teamSlug: string
  accentColor: string
  secondaryColor: string
  compact?: boolean
}

interface ToolCard {
  title: string
  path: string
  icon: React.ReactNode
  preview: React.ReactNode
  topRightBadge?: React.ReactNode
}

function TradeRumorsPreview() {
  return null
}

function DraftNewsPreview() {
  return null
}

function CapTrackerPreview() {
  return null
}

function DepthChartPreview() {
  return null
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
      title: 'Draft News',
      path: `/${teamSlug}/draft-tracker`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      preview: <DraftNewsPreview />,
    },
    {
      title: ['chicago-cubs', 'chicago-white-sox'].includes(teamSlug) ? 'Luxury Tax' : ['chicago-bears', 'chicago-bulls', 'chicago-blackhawks'].includes(teamSlug) ? 'Salary Cap' : 'Cap Tracker',
      path: `/${teamSlug}/cap-tracker`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: <CapTrackerPreview />,
    },
    {
      title: 'Depth Chart',
      path: `/${teamSlug}/depth-chart`,
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      preview: <DepthChartPreview />,
    },
  ]
}

export default function ToolGrid({ teamSlug, accentColor, secondaryColor, compact }: ToolGridProps) {
  const prefersReducedMotion = useReducedMotion()
  const tools = getTools(teamSlug, accentColor)

  const iconSize = compact ? '32px' : '44px'
  const iconRadius = compact ? '8px' : '12px'
  const cardPadding = compact ? '12px 14px' : '24px'
  const fontSize = compact ? '13px' : '16px'
  const gap = compact ? '8px' : '12px'

  return (
    <section style={{ marginBottom: compact ? '0' : '16px' }} className="team-tool-grid-section">
      <div
        className={compact ? undefined : 'tool-grid'}
        style={compact ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        } : undefined}
      >
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
                  padding: cardPadding,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {tool.topRightBadge && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    {tool.topRightBadge}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap }}>
                  <div
                    style={{
                      width: iconSize,
                      height: iconSize,
                      borderRadius: iconRadius,
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
                      color: 'var(--sm-text)',
                      fontSize,
                      fontWeight: 700,
                      letterSpacing: '-0.3px',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {tool.title}
                  </h3>
                </div>
                {!compact && <div style={{ flex: 1 }}>{tool.preview}</div>}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
