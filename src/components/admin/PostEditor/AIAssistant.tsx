'use client'

import { useState } from 'react'

interface AIAssistantProps {
  title: string
  content: string
  category?: string
  team?: string
  onHeadlineSelect: (headline: string) => void
  onSEOUpdate: (seo: { seoTitle: string; metaDescription: string }) => void
  onExcerptGenerate: (excerpt: string) => void
  onContentPolish: (content: string) => void
}

interface MockeryScore {
  score: number
  feedback: string
}

interface SEOResult {
  seoTitle: string
  metaDescription: string
  focusKeyword: string
  secondaryKeywords: string[]
  mockeryScore: MockeryScore
  improvements: string[]
}

interface ArticleIdea {
  headline: string
  angle: string
  type: string
}

export default function AIAssistant({
  title,
  content,
  category,
  team,
  onHeadlineSelect,
  onSEOUpdate,
  onExcerptGenerate,
  onContentPolish,
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'headlines' | 'seo' | 'ideas' | 'polish'>('headlines')
  const [loading, setLoading] = useState(false)
  const [headlines, setHeadlines] = useState<string[]>([])
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null)
  const [ideas, setIdeas] = useState<ArticleIdea[]>([])
  const [error, setError] = useState('')

  const callAI = async (action: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, title, content, category, team }),
      })

      if (!response.ok) {
        throw new Error('AI service unavailable')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI suggestions')
      return null
    } finally {
      setLoading(false)
    }
  }

  const generateHeadlines = async () => {
    const result = await callAI('headlines')
    if (result?.headlines) {
      setHeadlines(result.headlines)
    }
  }

  const optimizeSEO = async () => {
    const result = await callAI('seo')
    if (result) {
      setSeoResult(result)
    }
  }

  const generateIdeas = async () => {
    const result = await callAI('ideas')
    if (result?.ideas) {
      setIdeas(result.ideas)
    }
  }

  const polishContent = async () => {
    const result = await callAI('polish')
    if (result?.content) {
      onContentPolish(result.content)
    }
  }

  const generateExcerpt = async () => {
    const result = await callAI('excerpt')
    if (result?.excerpt) {
      onExcerptGenerate(result.excerpt)
    }
  }

  const applySEO = () => {
    if (seoResult) {
      onSEOUpdate({
        seoTitle: seoResult.seoTitle,
        metaDescription: seoResult.metaDescription,
      })
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 px-4 py-3">
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">AI Assistant</span>
        </div>
        <div className="flex border-t border-zinc-200 dark:border-zinc-800">
          {[
            { key: 'headlines', label: 'Headlines' },
            { key: 'seo', label: 'SEO' },
            { key: 'ideas', label: 'Ideas' },
            { key: 'polish', label: 'Polish' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {activeTab === 'headlines' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Generate attention-grabbing headline alternatives for your article.
            </p>
            <button
              onClick={generateHeadlines}
              disabled={loading || !title}
              className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Headlines'}
            </button>
            {headlines.length > 0 && (
              <div className="space-y-2">
                {headlines.map((headline, index) => (
                  <button
                    key={index}
                    onClick={() => onHeadlineSelect(headline)}
                    className="w-full rounded-lg border border-zinc-200 p-3 text-left text-sm text-zinc-900 transition-colors hover:border-purple-300 hover:bg-purple-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-purple-700 dark:hover:bg-purple-900/20"
                  >
                    {headline}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Optimize your article for search engines and get a Mockery Score.
            </p>
            <div className="flex gap-2">
              <button
                onClick={optimizeSEO}
                disabled={loading || !content}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze SEO'}
              </button>
              <button
                onClick={generateExcerpt}
                disabled={loading || !content}
                className="rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 disabled:opacity-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                Auto Excerpt
              </button>
            </div>

            {seoResult && (
              <div className="space-y-4">
                {/* Mockery Score */}
                <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Mockery Score</span>
                    <span className="text-3xl font-bold">{seoResult.mockeryScore.score}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/80">{seoResult.mockeryScore.feedback}</p>
                </div>

                {/* SEO Suggestions */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                      Optimized Title
                    </label>
                    <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                      {seoResult.seoTitle}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                      Meta Description
                    </label>
                    <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                      {seoResult.metaDescription}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                      Keywords
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {seoResult.focusKeyword}
                      </span>
                      {seoResult.secondaryKeywords.map((kw, i) => (
                        <span key={i} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  {seoResult.improvements.length > 0 && (
                    <div>
                      <label className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                        Improvements
                      </label>
                      <ul className="mt-1 space-y-1">
                        {seoResult.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="text-yellow-500">•</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={applySEO}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Apply SEO Suggestions
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Generate article ideas based on current trends and your selected category/team.
            </p>
            <button
              onClick={generateIdeas}
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Ideas'}
            </button>
            {ideas.length > 0 && (
              <div className="space-y-3">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                        {idea.headline}
                      </h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        idea.type === 'satire' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' :
                        idea.type === 'opinion' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                        idea.type === 'analysis' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {idea.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{idea.angle}</p>
                    <button
                      onClick={() => onHeadlineSelect(idea.headline)}
                      className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                    >
                      Use this headline →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'polish' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Give your content the Sports Mockery touch - add wit, personality, and edge.
            </p>
            <button
              onClick={polishContent}
              disabled={loading || !content}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {loading ? 'Polishing...' : '✨ Mockery Polish'}
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              This will update your content with improved style and tone while keeping the core message intact.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
