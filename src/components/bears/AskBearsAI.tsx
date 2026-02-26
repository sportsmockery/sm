'use client'

import { useState } from 'react'
import { TEAM_INFO } from '@/lib/types'
import { getAskBearsAISuggestions } from '@/lib/bears'
import ReactMarkdown from 'react-markdown'

interface AskBearsAIProps {
  className?: string
}

interface AIResponse {
  response: string
  source?: string
  team?: string
  teamDisplayName?: string
}

/**
 * AI-powered question answering for Bears content
 * Powered by SM Data Lab - uses the same AI model as datalab.sportsmockery.com
 */
export default function AskBearsAI({ className = '' }: AskBearsAIProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bearsInfo = TEAM_INFO.bears

  const suggestions = getAskBearsAISuggestions('default')

  const askQuestion = async (question: string) => {
    if (!question.trim() || isLoading) return

    setSelectedQuestion(question)
    setIsLoading(true)
    setError(null)
    setAiResponse(null)

    try {
      const response = await fetch('/api/scout-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question }),
      })

      const data = await response.json()

      // Check for explicit error field OR error source from API
      if (data.error || data.source === 'error') {
        setError(data.error || data.response || 'Failed to get a response. Please try again.')
      } else {
        setAiResponse({
          response: data.response,
          source: data.source,
          team: data.team,
          teamDisplayName: data.teamDisplayName,
        })
      }
    } catch (err) {
      console.error('AskBearsAI error:', err)
      setError('Failed to get a response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionClick = (question: string) => {
    askQuestion(question)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (customQuestion.trim()) {
      askQuestion(customQuestion.trim())
      setCustomQuestion('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      if (customQuestion.trim() && !isLoading) {
        askQuestion(customQuestion.trim())
        setCustomQuestion('')
      }
    }
  }

  const getSourceLabel = (source?: string) => {
    if (!source) return null
    const labels: Record<string, { text: string; color: string }> = {
      ai: { text: 'Verified Data', color: 'bg-green-500' },
      web_fallback: { text: 'Web Sources', color: 'bg-blue-500' },
      error: { text: 'Error', color: 'bg-red-500' },
    }
    return labels[source]
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bearsInfo.primaryColor} 0%, #1a2940 100%)`,
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* AI icon */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3
              className="text-white text-[16px] font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Ask About the Bears
            </h3>
            <p className="text-white/60 text-sm">Powered by SM Data Lab</p>
          </div>
        </div>
      </div>

      {/* Question suggestions */}
      <div className="p-4">
        <p className="text-white/70 text-xs uppercase tracking-wide mb-3">
          Popular Questions
        </p>
        <div className="space-y-2">
          {suggestions.slice(0, isExpanded ? suggestions.length : 3).map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(question)}
              disabled={isLoading}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedQuestion === question
                  ? 'bg-white/20 ring-2 ring-white/30'
                  : 'bg-white/10 hover:bg-white/15'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-white text-sm">{question}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Show more/less */}
        {suggestions.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-sm text-white/70 hover:text-white transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show ${suggestions.length - 3} More`}
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="px-4 pb-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-white/70 text-sm">Thinking...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 pb-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* AI Response */}
      {aiResponse && !isLoading && (
        <div className="px-4 pb-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: bearsInfo.secondaryColor }}
              >
                AI
              </div>
              <span className="text-white/80 text-sm font-medium">Bears AI</span>
              {aiResponse.source && getSourceLabel(aiResponse.source) && (
                <span className={`px-2 py-0.5 rounded text-xs text-white ${getSourceLabel(aiResponse.source)?.color}`}>
                  {getSourceLabel(aiResponse.source)?.text}
                </span>
              )}
            </div>
            <div className="text-white/90 text-sm prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {aiResponse.response}
              </ReactMarkdown>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <a
                href="/scout-ai"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                style={{ color: bearsInfo.secondaryColor }}
              >
                Ask more questions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Custom question input */}
      <div className="px-4 pb-4">
        <form onSubmit={handleCustomSubmit} className="relative">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your own question..."
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
