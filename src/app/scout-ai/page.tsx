'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/contexts/SubscriptionContext'
import type { ChartData } from '@/components/ask-ai/DataVisualization'
import {
  getLocalHistory,
  saveToLocalHistory,
  getSupabaseHistory,
  saveToSupabaseHistory,
  clearLocalHistory,
  clearSupabaseHistory,
  type QueryHistoryEntry,
} from '@/lib/scoutQueryHistory'

// Dynamically import DataVisualization to avoid SSR issues with Chart.js
const DataVisualization = dynamic(
  () => import('@/components/ask-ai/DataVisualization'),
  { ssr: false }
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  source?: string
  team?: string
  chartData?: ChartData
  bonusInsight?: string
}

const suggestedPrompts = [
  "What's the Bears' record this season?",
  "Who leads the Bulls in scoring?",
  "Compare Caleb Williams to other rookie QBs",
  "What are the Cubs' playoff chances?",
  "Blackhawks prospect rankings",
  "White Sox trade deadline moves",
]

const capabilities = [
  { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Stats & Analysis', desc: 'Compare players, advanced metrics, season stats' },
  { icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', title: 'News & Updates', desc: 'Latest moves, trades, injuries, and rumors' },
  { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Schedules & History', desc: 'Game results, upcoming matchups, team history' },
]

export default function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false) // Tracks animation (min 3 seconds)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [showHistory, setShowHistory] = useState(false)
  const [queryHistory, setQueryHistory] = useState<QueryHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const { canAccess, isLoading: subLoading, features, openCheckout } = useSubscription()

  // Check if user can access Ask AI (logged in + has feature access)
  const hasAccess = canAccess('ask_ai')
  const isPageLoading = authLoading || subLoading

  const scrollToBottom = () => {
    // Scroll within the container only, not the whole page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // Prevent browser scroll restoration on page load
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Only scroll after user has interacted (sent a message)
    // This prevents unwanted scrolling on page load or auth state changes
    if (messages.length > 0 && hasUserInteracted) {
      scrollToBottom()
    }
  }, [messages, hasUserInteracted])

  // Load query history
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      if (isAuthenticated && user?.id) {
        // Load from Supabase for logged-in users
        const history = await getSupabaseHistory(user.id)
        setQueryHistory(history)
      } else {
        // Load from localStorage for guests
        const history = getLocalHistory()
        setQueryHistory(history)
      }
    } catch (e) {
      console.error('[Scout] Failed to load history:', e)
    } finally {
      setHistoryLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Load history when auth state changes
  useEffect(() => {
    if (!authLoading) {
      loadHistory()
    }
  }, [authLoading, loadHistory])

  // Save query to history
  const saveToHistory = useCallback(async (query: string, response: string, team?: string, source?: string) => {
    const entry = { query, response, team, source }

    if (isAuthenticated && user?.id) {
      await saveToSupabaseHistory(user.id, entry)
    } else {
      saveToLocalHistory({ ...entry, timestamp: new Date().toISOString() })
    }

    // Refresh history
    loadHistory()
  }, [isAuthenticated, user?.id, loadHistory])

  // Clear history
  const handleClearHistory = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      await clearSupabaseHistory(user.id)
    } else {
      clearLocalHistory()
    }
    setQueryHistory([])
  }, [isAuthenticated, user?.id])

  // Load a previous query
  const loadFromHistory = useCallback((entry: QueryHistoryEntry) => {
    setInput(entry.query)
    setShowHistory(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent any page scrolling
    const scrollY = window.scrollY
    setTimeout(() => window.scrollTo(0, scrollY), 0)

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsAnimating(true) // Start animation
    setError(null)
    setHasUserInteracted(true) // Enable scrolling after first user interaction

    // Ensure animation runs for at least 3 seconds
    const animationStartTime = Date.now()
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content, sessionId }),
      })

      const data = await response.json()

      // Check for error responses from the API
      if (data.error || data.source === 'error') {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || data.response || "I'm having trouble connecting to the data service. Please try again in a moment.",
          timestamp: new Date(),
          source: 'error',
        }
        setMessages((prev) => [...prev, errorMessage])
        return
      }

      // Save session ID for follow-up context (pronoun resolution)
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I couldn't find an answer to that question.",
        timestamp: new Date(),
        source: data.source,
        team: data.teamDisplayName,
        chartData: data.chartData,
        bonusInsight: data.bonusInsight,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Save to query history (30-day retention)
      saveToHistory(userMessage.content, aiMessage.content, data.teamDisplayName, data.source)

    } catch (err) {
      console.error('Ask AI error:', err)
      setError('Failed to get a response. Please try again.')

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I had trouble processing your question. Please try again in a moment.",
        timestamp: new Date(),
        source: 'error',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)

      // Ensure animation runs for at least 3 seconds total
      const elapsed = Date.now() - animationStartTime
      const remainingTime = Math.max(0, 3000 - elapsed)

      if (remainingTime > 0) {
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false)
        }, remainingTime)
      } else {
        setIsAnimating(false)
      }
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  const getSourceBadge = (source?: string) => {
    if (!source) return null

    const badges: Record<string, { label: string; bg: string }> = {
      web_fallback: { label: 'From Web Sources', bg: 'rgba(59,130,246,0.2)' },
      error: { label: 'Error', bg: 'rgba(239,68,68,0.2)' },
      empty: { label: 'No Data', bg: 'rgba(245,158,11,0.2)' },
    }

    const badge = badges[source]
    if (!badge) return null

    return (
      <span className="sm-tag" style={{ background: badge.bg, fontSize: '10px', padding: '2px 8px' }}>
        {badge.label}
      </span>
    )
  }

  // Loading state
  if (isPageLoading) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sm-grid-overlay" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--sm-text-muted)', fontFamily: 'var(--sm-font-body)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
        <div className="sm-grid-overlay" />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 16px', position: 'relative', zIndex: 1 }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--sm-radius-lg)',
              background: 'var(--sm-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <Image src="/downloads/scout-v2.png" alt="Scout AI" width={40} height={40} style={{ width: 40, height: 40 }} />
            </div>
            <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--sm-text)', marginBottom: 12 }}>
              Sign in to Scout AI
            </h1>
            <p style={{ color: 'var(--sm-text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Get instant answers about the Bears, Bulls, Cubs, White Sox, and Blackhawks with our AI-powered sports assistant.
            </p>
            <Link href="/login?next=/scout-ai" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', gap: 8 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </Link>
            <p style={{ fontSize: 12, marginTop: 16, color: 'var(--sm-text-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/login?next=/scout-ai" style={{ color: 'var(--sm-red)' }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Logged in but doesn't have access (free tier with limit reached or no access)
  if (!hasAccess) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
        <div className="sm-grid-overlay" />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 16px', position: 'relative', zIndex: 1 }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--sm-radius-lg)',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="40" height="40" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--sm-text)', marginBottom: 12 }}>
              Upgrade to SM+ for Unlimited Access
            </h1>
            <p style={{ color: 'var(--sm-text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Free accounts get {features.ask_ai.limit} AI questions per day. Upgrade to SM+ for unlimited access to Scout AI, plus Fan Chat and ad-free browsing.
            </p>
            <button onClick={() => openCheckout('sm_plus_monthly')} className="btn btn-lg" style={{
              display: 'inline-flex', gap: 8,
              background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff',
              border: 'none', borderRadius: 'var(--sm-radius-md)', cursor: 'pointer',
            }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Upgrade to SM+ ($4.99/mo)
            </button>
            <p style={{ fontSize: 12, marginTop: 16, color: 'var(--sm-text-muted)' }}>
              Or{' '}
              <button onClick={() => openCheckout('sm_plus_annual')} style={{ color: 'var(--sm-red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>
                save 33% with annual ($39.99/yr)
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @keyframes thinking {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-5deg); }
          50% { transform: translateY(-4px) rotate(0deg); }
          75% { transform: translateY(-8px) rotate(5deg); }
        }
        .animate-thinking {
          animation: thinking 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
        <div className="sm-grid-overlay" />
        <div style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '32px 16px', position: 'relative', zIndex: 1 }}>

          {/* Feature capability cards - 3 column grid */}
          {messages.length === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {capabilities.map((cap) => (
                <div key={cap.title} className="glass-card glass-card-sm" style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--sm-radius-sm)', background: 'var(--sm-gradient-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                  }}>
                    <svg width="20" height="20" fill="none" stroke="var(--sm-red)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cap.icon} />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--sm-text)', marginBottom: 4 }}>{cap.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--sm-text-muted)', lineHeight: 1.4 }}>{cap.desc}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
            {/* Left Sidebar */}
            <div>
              <div className="glass-card glass-card-static" style={{ position: 'sticky', top: 96 }}>
                {/* Logo/Icon and Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--sm-radius-md)',
                    background: 'var(--sm-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Image src="/downloads/scout-v2.png" alt="Scout AI" width={28} height={28} style={{ width: 28, height: 28 }} />
                  </div>
                  <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--sm-text)' }}>
                    Scout AI
                  </h1>
                </div>

                <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                  Scout AI is a high-IQ sports engine that&apos;s locked in to answer all your Chicago sports questions.
                </p>

                {/* What you can ask */}
                <div>
                  <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sm-text-dim)', marginBottom: 12 }}>
                    What you can ask
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', text: 'Compare players & stats' },
                      { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', text: 'Explain advanced metrics' },
                      { icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', text: 'Summarize recent news' },
                      { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064', text: 'Analyze matchups' },
                      { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: 'Check schedules & scores' },
                      { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', text: 'Review team history' },
                    ].map((item) => (
                      <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--sm-text)' }}>
                        <svg width="14" height="14" fill="none" stroke="var(--sm-text-dim)" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Query History Section */}
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--sm-border)' }}>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 13, fontWeight: 500, padding: '8px 12px', borderRadius: 'var(--sm-radius-sm)',
                      color: 'var(--sm-text)', background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sm-gradient-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Query History
                    </span>
                    <span className="sm-tag" style={{ fontSize: 10, padding: '2px 8px' }}>
                      {queryHistory.length}
                    </span>
                  </button>

                  {showHistory && (
                    <div style={{ marginTop: 12, maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {historyLoading ? (
                        <p style={{ fontSize: 12, textAlign: 'center', padding: '16px 0', color: 'var(--sm-text-muted)' }}>Loading...</p>
                      ) : queryHistory.length === 0 ? (
                        <p style={{ fontSize: 12, textAlign: 'center', padding: '16px 0', color: 'var(--sm-text-muted)' }}>No recent queries</p>
                      ) : (
                        <>
                          {queryHistory.slice(0, 10).map((entry) => (
                            <button
                              key={entry.id}
                              onClick={() => loadFromHistory(entry)}
                              style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                gap: 8, padding: '8px 12px', borderRadius: 'var(--sm-radius-sm)', fontSize: 12,
                                color: 'var(--sm-text)', background: 'none', border: 'none', cursor: 'pointer',
                                transition: 'background 0.2s', textAlign: 'left',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sm-gradient-subtle)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{entry.query}</span>
                              <span style={{ fontSize: 10, flexShrink: 0, color: 'var(--sm-text-dim)' }}>
                                {new Date(entry.timestamp).toLocaleDateString()}
                              </span>
                            </button>
                          ))}
                          {queryHistory.length > 0 && (
                            <button
                              onClick={handleClearHistory}
                              style={{
                                width: '100%', textAlign: 'center', fontSize: 11, padding: '8px 0',
                                color: 'var(--sm-error)', background: 'none', border: 'none', cursor: 'pointer',
                              }}
                            >
                              Clear History
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div>
              <div className="glass-card glass-card-static" style={{
                padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                minHeight: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)',
              }}>
                {/* Messages Area */}
                <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                  {messages.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <div className={`${isAnimating ? 'animate-thinking scout-thinking-border' : ''}`} style={{ width: 96, height: 96, marginBottom: 24, borderRadius: '50%' }}>
                        <Image src="/downloads/scout-v2.png" alt="Scout AI" width={96} height={96} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <h3 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--sm-text)', marginBottom: 8 }}>
                        Ask me anything about Chicago sports
                      </h3>
                      <p style={{ fontSize: 14, maxWidth: 420, marginBottom: 32, color: 'var(--sm-text-muted)', lineHeight: 1.6 }}>
                        I can help with stats, history, analysis, and more for the Bears, Bulls, Cubs, White Sox, and Blackhawks.
                      </p>

                      {/* Suggested Prompts as sm-tag pills */}
                      <div style={{ width: '100%', maxWidth: 640 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, color: 'var(--sm-text-dim)' }}>
                          Try asking
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                          {suggestedPrompts.map((prompt) => (
                            <button
                              key={prompt}
                              onClick={() => handlePromptClick(prompt)}
                              className="glass-card-sm"
                              style={{
                                padding: '8px 16px', fontSize: 13, cursor: 'pointer',
                                color: 'var(--sm-text)', background: 'var(--sm-card)',
                                border: '1px solid var(--sm-border)', borderRadius: 'var(--sm-radius-pill)',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sm-red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--sm-red)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sm-card)'; e.currentTarget.style.color = 'var(--sm-text)'; e.currentTarget.style.borderColor = 'var(--sm-border)' }}
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}
                        >
                          <div
                            className={message.role === 'assistant' ? 'glass-card glass-card-sm glass-card-static' : ''}
                            style={{
                              maxWidth: '80%',
                              borderRadius: 'var(--sm-radius-md)',
                              padding: '12px 16px',
                              ...(message.role === 'user'
                                ? { background: 'var(--sm-gradient)', color: '#ffffff' }
                                : {}),
                            }}
                          >
                            {message.role === 'assistant' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                {message.team && (
                                  <span className="sm-tag" style={{ fontSize: 10, padding: '2px 8px' }}>
                                    {message.team}
                                  </span>
                                )}
                                {getSourceBadge(message.source)}
                              </div>
                            )}
                            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                              {message.role === 'assistant' ? (
                                <>
                                  <ReactMarkdown
                                    components={{
                                      table: ({ children }) => (
                                        <div className="sm-table-wrapper" style={{ margin: '8px 0' }}>
                                          <table className="sm-table">{children}</table>
                                        </div>
                                      ),
                                      th: ({ children }) => (
                                        <th>{children}</th>
                                      ),
                                      td: ({ children }) => (
                                        <td>{children}</td>
                                      ),
                                      strong: ({ children }) => (
                                        <strong style={{ fontWeight: 600 }}>{children}</strong>
                                      ),
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                  {message.chartData && (
                                    <DataVisualization
                                      chartData={message.chartData}
                                      bonusInsight={message.bonusInsight}
                                    />
                                  )}
                                </>
                              ) : (
                                <p style={{ margin: 0 }}>{message.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <div className="glass-card glass-card-sm glass-card-static scout-thinking-border" style={{
                            display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--sm-radius-md)', padding: '12px 16px',
                          }}>
                            <span style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>Scout is thinking</span>
                            <span style={{ display: 'flex', gap: 4 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sm-red)', animation: 'bounce 1s infinite', animationDelay: '0ms' }} />
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sm-red)', animation: 'bounce 1s infinite', animationDelay: '150ms' }} />
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sm-red)', animation: 'bounce 1s infinite', animationDelay: '300ms' }} />
                            </span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area - glass-card-sm bottom bar */}
                <div className="glass-card-sm" style={{ borderTop: '1px solid var(--sm-border)', borderRadius: 0, padding: '16px 24px' }}>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Scout Icon - Always visible, animates on question */}
                    <div className={`${isAnimating ? 'animate-thinking scout-thinking-border' : ''}`} style={{ width: 48, height: 48, flexShrink: 0, borderRadius: '50%' }}>
                      <Image src="/downloads/scout-v2.png" alt="Scout AI" width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about the Bears, Bulls, Cubs, White Sox, or Blackhawks..."
                      className="sm-input"
                      style={{ flex: 1 }}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="btn btn-primary btn-md"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Ask Scout
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
