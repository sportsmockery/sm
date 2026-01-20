'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thanks for your question about "${userMessage.content}". I'm Mockery AI, your Chicago sports expert. This feature is coming soon - I'll be able to answer questions about the Bears, Bulls, Cubs, White Sox, and Blackhawks with real-time stats, historical data, and expert analysis. Stay tuned!`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Explanation */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-2xl p-6"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            >
              {/* Logo/Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#bc0000] to-[#ff4444] flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <h1
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
              >
                Ask Mockery AI
              </h1>

              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Your intelligent Chicago sports assistant. Get instant answers about all five Chicago teams.
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

              {/* Teams */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Supported Teams
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Bears', 'Bulls', 'Cubs', 'White Sox', 'Blackhawks'].map((team) => (
                    <span
                      key={team}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
                    >
                      {team}
                    </span>
                  ))}
                </div>
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
              {/* Chat Header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#bc0000] to-[#ff4444] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
                    >
                      Mockery AI
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Chicago Sports Expert
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full text-green-600 text-xs font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#bc0000]/20 to-[#ff4444]/20 flex items-center justify-center mb-6">
                      <svg className="w-10 h-10 text-[#bc0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
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
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div
                          className="rounded-2xl px-4 py-3"
                          style={{ backgroundColor: 'var(--bg-page)' }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#bc0000] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[#bc0000] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[#bc0000] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
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
                    className="px-6 py-3 bg-[#bc0000] text-white font-semibold rounded-xl hover:bg-[#a00000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
