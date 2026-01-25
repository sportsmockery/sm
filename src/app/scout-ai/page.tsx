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
    // Only scroll the messages container if there are messages
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

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

    const badges: Record<string, { label: string; color: string }> = {
      web_fallback: { label: 'From Web Sources', color: 'bg-blue-500' },
      error: { label: 'Error', color: 'bg-red-500' },
      empty: { label: 'No Data', color: 'bg-yellow-500' },
    }

    const badge = badges[source]
    if (!badge) return null

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  // Loading state
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#bc0000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-lg mx-auto px-4 py-16">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#bc0000] to-[#ff4444] flex items-center justify-center mx-auto mb-6">
              <Image
                src="/downloads/scout-v2.png"
                alt="Scout AI"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
            >
              Sign in to Scout AI
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Get instant answers about the Bears, Bulls, Cubs, White Sox, and Blackhawks with our AI-powered sports assistant.
            </p>
            <Link
              href="/login?next=/scout-ai"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#bc0000] text-white font-semibold rounded-xl hover:bg-[#a00000] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </Link>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/login?next=/scout-ai" className="text-[#bc0000] hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Logged in but doesn't have access (free tier with limit reached or no access)
  if (!hasAccess) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-lg mx-auto px-4 py-16">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
            >
              Upgrade to SM+ for Unlimited Access
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Free accounts get {features.ask_ai.limit} AI questions per day. Upgrade to SM+ for unlimited access to Scout AI, plus Fan Chat and ad-free browsing.
            </p>
            <button
              onClick={() => openCheckout('sm_plus_monthly')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Upgrade to SM+ ($4.99/mo)
            </button>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Or{' '}
              <button
                onClick={() => openCheckout('sm_plus_annual')}
                className="text-[#bc0000] hover:underline"
              >
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Explanation */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-2xl p-6"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            >
              {/* Logo/Icon and Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#bc0000] to-[#ff4444] flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/downloads/scout-v2.png"
                    alt="Scout AI"
                    width={28}
                    height={28}
                    className="w-7 h-7"
                  />
                </div>
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
                >
                  Scout AI
                </h1>
              </div>

              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Scout AI is a high-IQ sports engine that's locked in to answer all your Chicago sports questions.
              </p>

              {/* What you can ask */}
              <div className="space-y-3">
                <h3
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  What you can ask
                </h3>
                <ul className="space-y-2">
                  {[
                    { icon: '📊', text: 'Compare players & stats' },
                    { icon: '📈', text: 'Explain advanced metrics' },
                    { icon: '📰', text: 'Summarize recent news' },
                    { icon: '🏈', text: 'Analyze matchups' },
                    { icon: '📅', text: 'Check schedules & scores' },
                    { icon: '🏆', text: 'Review team history' },
                  ].map((item) => (
                    <li
                      key={item.text}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Query History Section */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-[#bc0000]/10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Query History
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#bc0000]/20 text-[#bc0000]">
                    {queryHistory.length}
                  </span>
                </button>

                {showHistory && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {historyLoading ? (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Loading...</p>
                    ) : queryHistory.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No recent queries</p>
                    ) : (
                      <>
                        {queryHistory.slice(0, 10).map((entry) => (
                          <button
                            key={entry.id}
                            onClick={() => loadFromHistory(entry)}
                            className="w-full text-left p-2 rounded-lg text-xs transition-colors hover:bg-[#bc0000]/10"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <p className="font-medium truncate">{entry.query}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </p>
                          </button>
                        ))}
                        {queryHistory.length > 0 && (
                          <button
                            onClick={handleClearHistory}
                            className="w-full text-center text-xs py-2 text-red-500 hover:text-red-600"
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
          <div className="lg:col-span-3">
            <div
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                minHeight: 'calc(100vh - 200px)',
                maxHeight: 'calc(100vh - 200px)',
              }}
            >
              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className={`w-24 h-24 mb-6 ${isAnimating ? 'animate-thinking' : ''}`}>
                      <Image
                        src="/downloads/scout-v2.png"
                        alt="Scout AI"
                        width={96}
                        height={96}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
                    >
                      Ask me anything about Chicago sports
                    </h3>
                    <p className="text-sm max-w-md mb-8" style={{ color: 'var(--text-muted)' }}>
                      I can help with stats, history, analysis, and more for the Bears, Bulls, Cubs, White Sox, and Blackhawks.
                    </p>

                    {/* Suggested Prompts */}
                    <div className="w-full max-w-2xl">
                      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                        Try asking
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {suggestedPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => handlePromptClick(prompt)}
                            className="px-4 py-2 rounded-full text-sm transition-colors hover:bg-[#bc0000] hover:text-white"
                            style={{
                              backgroundColor: 'var(--bg-page)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-[#bc0000] text-white'
                              : ''
                          }`}
                          style={
                            message.role === 'assistant'
                              ? { backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }
                              : {}
                          }
                        >
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2">
                              {message.team && (
                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                  {message.team}
                                </span>
                              )}
                              {getSourceBadge(message.source)}
                            </div>
                          )}
                          <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                            {message.role === 'assistant' ? (
                              <>
                                <ReactMarkdown
                                  components={{
                                    table: ({ children }) => (
                                      <div className="overflow-x-auto my-2">
                                        <table className="min-w-full text-sm">{children}</table>
                                      </div>
                                    ),
                                    th: ({ children }) => (
                                      <th className="px-2 py-1 text-left font-semibold border-b" style={{ borderColor: 'var(--border-color)' }}>{children}</th>
                                    ),
                                    td: ({ children }) => (
                                      <td className="px-2 py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>{children}</td>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold">{children}</strong>
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
                              <p>{message.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div
                          className="rounded-2xl px-4 py-3 flex items-center gap-2"
                          style={{ backgroundColor: 'var(--bg-page)' }}
                        >
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Scout is thinking
                          </span>
                          <span className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#bc0000] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 rounded-full bg-[#bc0000] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 rounded-full bg-[#bc0000] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  {/* Scout Icon - Always visible, animates on question */}
                  <div className={`w-12 h-12 flex-shrink-0 ${isAnimating ? 'animate-thinking' : ''}`}>
                    <Image
                      src="/downloads/scout-v2.png"
                      alt="Scout AI"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the Bears, Bulls, Cubs, White Sox, or Blackhawks..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bc0000]"
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-5 py-3 bg-[#bc0000] text-white font-semibold rounded-xl hover:bg-[#a00000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
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
