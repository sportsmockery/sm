'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import SystemDiagnostic from './SystemDiagnostic'

type Panel = 'scout' | 'gm' | 'nextgen' | null

interface BriefingItem {
  team: string
  headline: string
  stat: string | null
  trend: 'up' | 'down' | 'neutral'
}

export default function AIHud() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activePanel, setActivePanel] = useState<Panel>(null)
  const [scoutQuery, setScoutQuery] = useState('')
  const [scoutMessages, setScoutMessages] = useState<{ role: string; content: string }[]>([])
  const [scoutLoading, setScoutLoading] = useState(false)
  const [briefing, setBriefing] = useState<BriefingItem[] | null>(null)
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [briefingError, setBriefingError] = useState(false)
  const [nextGenActive, setNextGenActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Toggle panel
  const toggle = (panel: Panel) => {
    if (activePanel === panel) {
      setActivePanel(null)
      if (panel === 'nextgen') {
        setNextGenActive(false)
        window.dispatchEvent(new CustomEvent('h1-data-overlay', { detail: { active: false } }))
      }
    } else {
      setActivePanel(panel)
      if (panel === 'gm') fetchBriefing()
      if (panel === 'nextgen') {
        setNextGenActive(true)
        window.dispatchEvent(new CustomEvent('h1-data-overlay', { detail: { active: true } }))
      } else if (nextGenActive) {
        setNextGenActive(false)
        window.dispatchEvent(new CustomEvent('h1-data-overlay', { detail: { active: false } }))
      }
    }
  }

  // Fetch GM briefing
  const fetchBriefing = async () => {
    setBriefingLoading(true)
    setBriefingError(false)
    try {
      const res = await fetch('/api/broker?type=briefing')
      const envelope = await res.json()
      if (envelope.data) {
        setBriefing(envelope.data)
      } else {
        setBriefingError(true)
      }
    } catch {
      setBriefingError(true)
    } finally {
      setBriefingLoading(false)
    }
  }

  // Scout AI submit
  const submitScout = async () => {
    if (!scoutQuery.trim() || scoutLoading) return

    const query = scoutQuery.trim()
    setScoutQuery('')
    setScoutMessages((prev) => [...prev, { role: 'user', content: query }])
    setScoutLoading(true)

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sessionId: sessionIdRef.current }),
      })
      const data = await res.json()
      if (data.sessionId) sessionIdRef.current = data.sessionId
      setScoutMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || 'No response received.' },
      ])
    } catch {
      setScoutMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Try again.' },
      ])
    } finally {
      setScoutLoading(false)
    }
  }

  // Focus input when scout panel opens
  useEffect(() => {
    if (activePanel === 'scout' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activePanel])

  // Clean up overlay on unmount
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('h1-data-overlay', { detail: { active: false } }))
    }
  }, [])

  const trendArrow = (trend: string) =>
    trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2022'

  const trendColor = (trend: string) =>
    trend === 'up' ? '#00d084' : trend === 'down' ? '#bc0000' : isDark ? '#555' : '#999'

  return (
    <>
      {/* Panel overlays */}
      <AnimatePresence>
        {activePanel === 'scout' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              bottom: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 420,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 400,
              borderRadius: 16,
              overflow: 'hidden',
              zIndex: 91,
              background: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(250,250,250,0.97)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
              backdropFilter: 'blur(20px)',
              boxShadow: isDark
                ? '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(188,0,0,0.1)'
                : '0 8px 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Image src="/downloads/scout-v2.png" alt="Scout" width={20} height={20} style={{ borderRadius: '50%' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>Scout AI</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', minHeight: 150 }}>
              {scoutMessages.length === 0 && (
                <div style={{ fontSize: 12, color: isDark ? '#555' : '#999', textAlign: 'center', marginTop: 40 }}>
                  Ask anything about Chicago sports
                </div>
              )}
              {scoutMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 10,
                      fontSize: 13,
                      lineHeight: 1.4,
                      maxWidth: '85%',
                      backgroundColor:
                        msg.role === 'user'
                          ? '#bc0000'
                          : isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.05)',
                      color: msg.role === 'user' ? '#fff' : isDark ? '#ddd' : '#333',
                    }}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
              {scoutLoading && (
                <div style={{ fontSize: 12, color: '#bc0000', fontStyle: 'italic' }}>Thinking...</div>
              )}
            </div>

            {/* Input */}
            <div
              style={{
                padding: '10px 12px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                display: 'flex',
                gap: 8,
              }}
            >
              <input
                ref={inputRef}
                value={scoutQuery}
                onChange={(e) => setScoutQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitScout()}
                placeholder="Ask Scout..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: 13,
                  borderRadius: 8,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                  color: isDark ? '#fff' : '#111',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={submitScout}
                disabled={scoutLoading}
                style={{
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#bc0000',
                  color: '#ffffff',
                  cursor: scoutLoading ? 'not-allowed' : 'pointer',
                  opacity: scoutLoading ? 0.5 : 1,
                  fontFamily: 'inherit',
                }}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}

        {activePanel === 'gm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              bottom: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 380,
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: 16,
              overflow: 'hidden',
              zIndex: 91,
              background: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(250,250,250,0.97)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
              backdropFilter: 'blur(20px)',
              boxShadow: isDark
                ? '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(188,0,0,0.1)'
                : '0 8px 40px rgba(0,0,0,0.15)',
              padding: 20,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#bc0000" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a4 4 0 0 0-8 0v2" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>GM Audit Briefing</span>
            </div>

            {briefingLoading && (
              <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: '#bc0000' }}>
                Loading briefing...
              </div>
            )}

            {briefingError && !briefingLoading && (
              <SystemDiagnostic
                systems={[
                  { name: 'Headlines', status: 'down' },
                  { name: 'Broker', status: 'down' },
                ]}
                onRetry={fetchBriefing}
              />
            )}

            {briefing && !briefingLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {briefing.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: '#bc0000',
                        }}
                      >
                        {item.team.replace('-', ' ')}
                      </span>
                      <span style={{ fontSize: 12, color: trendColor(item.trend) }}>{trendArrow(item.trend)}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isDark ? '#ddd' : '#222',
                        lineHeight: 1.35,
                        marginBottom: item.stat ? 4 : 0,
                      }}
                    >
                      {item.headline.length > 70 ? item.headline.slice(0, 67) + '...' : item.headline}
                    </div>
                    {item.stat && (
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'SF Mono', monospace",
                          color: '#bc0000',
                          fontWeight: 600,
                        }}
                      >
                        {item.stat}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          borderRadius: 'var(--h1-radius-pill)',
          background: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.4), 0 0 12px rgba(188,0,0,0.15)'
            : '0 4px 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Scout button */}
        <button
          className="h1-dock-btn"
          onClick={() => toggle('scout')}
          title="Scout AI"
          style={{
            backgroundColor: activePanel === 'scout' ? '#bc0000' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            color: activePanel === 'scout' ? '#fff' : isDark ? '#fff' : '#111',
          }}
        >
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout AI"
            width={22}
            height={22}
            style={{ borderRadius: '50%', opacity: activePanel === 'scout' ? 1 : 0.7 }}
          />
        </button>

        {/* GM Audit button */}
        <button
          className="h1-dock-btn"
          onClick={() => toggle('gm')}
          title="GM Audit"
          style={{
            backgroundColor: activePanel === 'gm' ? '#bc0000' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            color: activePanel === 'gm' ? '#fff' : isDark ? '#fff' : '#111',
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a4 4 0 0 0-8 0v2" />
          </svg>
        </button>

        {/* Next-Gen button */}
        <button
          className="h1-dock-btn"
          onClick={() => toggle('nextgen')}
          title="Next-Gen Data"
          style={{
            backgroundColor: activePanel === 'nextgen' ? '#bc0000' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            color: activePanel === 'nextgen' ? '#fff' : isDark ? '#fff' : '#111',
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        </button>
      </div>
    </>
  )
}
