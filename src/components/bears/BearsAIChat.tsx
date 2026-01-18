'use client'

import { useState, useRef, useEffect } from 'react'
import { TEAM_INFO } from '@/lib/types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BearsAIChatProps {
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED_QUESTIONS = [
  "How is Caleb Williams performing?",
  "What's the Bears record this season?",
  "Any trade rumors?",
  "When's the next game?",
  "Who are the key players to watch?",
]

export default function BearsAIChat({ isOpen, onClose }: BearsAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bearsInfo = TEAM_INFO.bears

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Add welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hey Bears fan! 🐻 I'm your Bears AI assistant. Ask me anything about the Chicago Bears - from game stats to trade rumors to player updates. What would you like to know?",
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/bears/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-10), // Send last 10 messages for context
        }),
      })

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, something went wrong. Please try again in a moment.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (question: string) => {
    sendMessage(question)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[300] md:bg-transparent md:pointer-events-none"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div
        className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-[400px] md:h-[600px] md:max-h-[80vh] z-[301] flex flex-col bg-white dark:bg-zinc-900 md:rounded-2xl md:shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700"
          style={{
            background: `linear-gradient(to right, ${bearsInfo.primaryColor}, #1a2940)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: bearsInfo.secondaryColor }}
            >
              AI
            </div>
            <div>
              <h3 className="text-white font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Bears AI Assistant
              </h3>
              <p className="text-white/70 text-xs">Powered by AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                    : 'text-white'
                }`}
                style={
                  msg.role === 'assistant'
                    ? { backgroundColor: bearsInfo.primaryColor }
                    : undefined
                }
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.role === 'user'
                      ? 'text-zinc-500'
                      : 'text-white/60'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-white"
                style={{ backgroundColor: bearsInfo.primaryColor }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-white/70">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (only show when few messages) */}
        {messages.length <= 2 && !isLoading && (
          <div className="px-4 pb-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about the Bears..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C83200] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 rounded-xl text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ backgroundColor: bearsInfo.secondaryColor }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
