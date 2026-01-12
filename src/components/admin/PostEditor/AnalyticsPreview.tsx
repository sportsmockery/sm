'use client'

import { useMemo } from 'react'

interface AnalyticsPreviewProps {
  content: string
  title: string
  mockeryScore?: number | null
}

export default function AnalyticsPreview({
  content,
  title,
  mockeryScore,
}: AnalyticsPreviewProps) {
  const analytics = useMemo(() => {
    // Strip HTML tags for word count
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const words = textContent.split(' ').filter((word) => word.length > 0)
    const wordCount = words.length
    const charCount = textContent.length

    // Calculate reading time (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 200)

    // Calculate title SEO metrics
    const titleLength = title.length
    const titleOptimal = titleLength >= 50 && titleLength <= 60

    // Calculate content metrics
    const paragraphs = content.split(/<\/p>|<br\s*\/?>/i).filter((p) => p.trim()).length
    const hasImages = /<img\s/i.test(content)
    const hasLinks = /<a\s/i.test(content)
    const hasHeadings = /<h[2-6]/i.test(content)

    return {
      wordCount,
      charCount,
      readingTimeMinutes,
      titleLength,
      titleOptimal,
      paragraphs,
      hasImages,
      hasLinks,
      hasHeadings,
    }
  }, [content, title])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">Analytics Preview</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Mockery Score */}
        {mockeryScore !== undefined && mockeryScore !== null && (
          <div className={`rounded-lg bg-gradient-to-r ${getScoreGradient(mockeryScore)} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Mockery Score</span>
              <span className="text-3xl font-bold">{mockeryScore}</span>
            </div>
            <p className="mt-1 text-sm text-white/80">
              {mockeryScore >= 80
                ? 'This article has serious Sports Mockery energy!'
                : mockeryScore >= 60
                ? 'Good, but could use more edge.'
                : 'Needs more wit and personality.'}
            </p>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {analytics.wordCount}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Words</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {analytics.readingTimeMinutes}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Min read</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {analytics.paragraphs}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Paragraphs</p>
          </div>
        </div>

        {/* Content Checklist */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
            Content Checklist
          </p>

          <div className="space-y-1.5">
            {/* Title length */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Title length</span>
              <span className={analytics.titleOptimal ? 'text-green-500' : 'text-yellow-500'}>
                {analytics.titleLength}/60 chars
              </span>
            </div>

            {/* Has images */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Images</span>
              {analytics.hasImages ? (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-yellow-500 text-xs">Add images</span>
              )}
            </div>

            {/* Has links */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Internal links</span>
              {analytics.hasLinks ? (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-yellow-500 text-xs">Add links</span>
              )}
            </div>

            {/* Has headings */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Headings</span>
              {analytics.hasHeadings ? (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-yellow-500 text-xs">Add headings</span>
              )}
            </div>

            {/* Word count check */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Word count {analytics.wordCount >= 300 ? '' : '(min 300)'}
              </span>
              {analytics.wordCount >= 300 ? (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`text-xs ${analytics.wordCount >= 150 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {300 - analytics.wordCount} more needed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {analytics.wordCount < 300 && (
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Articles with 300+ words perform better in search results. Consider adding more detail.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
