'use client'

import { useState } from 'react'
import { TEAM_INFO } from '@/lib/types'
import { getAskBearsAISuggestions } from '@/lib/bears'

interface AskBearsAIProps {
  className?: string
}

/**
 * AI-powered question suggestions for Bears content
 * Provides quick questions users can ask about the Bears
 */
export default function AskBearsAI({ className = '' }: AskBearsAIProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const bearsInfo = TEAM_INFO.bears

  const suggestions = getAskBearsAISuggestions('default')

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question)
    // In production, this would trigger an AI response or search
    // For now, we'll just show the question was selected
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
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Ask About the Bears
            </h3>
            <p className="text-white/60 text-sm">Quick answers powered by AI</p>
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
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedQuestion === question
                  ? 'bg-white/20 ring-2 ring-white/30'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
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

      {/* Selected question response (placeholder) */}
      {selectedQuestion && (
        <div className="px-4 pb-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: bearsInfo.secondaryColor }}
              >
                AI
              </div>
              <span className="text-white/80 text-sm font-medium">Bears AI</span>
            </div>
            <p className="text-white/70 text-sm">
              To answer your question about "{selectedQuestion}", check out our latest articles and analysis.
            </p>
            <div className="mt-3">
              <a
                href={`/search?q=${encodeURIComponent(selectedQuestion)}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: bearsInfo.secondaryColor }}
              >
                Search related articles
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
        <div className="relative">
          <input
            type="text"
            placeholder="Ask your own question..."
            className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40 transition-colors"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
