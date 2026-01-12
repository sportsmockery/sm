'use client'

import { useState } from 'react'
import Link from 'next/link'

interface AIInsight {
  id: string
  title: string
  summary: string
  confidence: number
  timestamp: string
  category: string
}

interface AIInsightsProps {
  insights?: AIInsight[]
}

const defaultInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Bears Offensive Line Analysis',
    summary: 'Based on recent performance metrics, the Bears offensive line has shown a 23% improvement in pass protection. Key factors include improved chemistry and adjusted blocking schemes.',
    confidence: 87,
    timestamp: '2 hours ago',
    category: 'Bears',
  },
  {
    id: '2',
    title: 'Bulls Trade Deadline Predictions',
    summary: 'Historical patterns suggest a 68% probability of a significant trade. Watch for movement involving veteran contracts to create cap flexibility.',
    confidence: 68,
    timestamp: '4 hours ago',
    category: 'Bulls',
  },
  {
    id: '3',
    title: 'Cubs Pitching Rotation Outlook',
    summary: 'Advanced analytics indicate the current rotation projects for a 3.42 ERA if healthy. Depth concerns remain the primary risk factor.',
    confidence: 74,
    timestamp: '6 hours ago',
    category: 'Cubs',
  },
]

export default function AIInsights({ insights = defaultInsights }: AIInsightsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AI Icon */}
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            {/* Pulse effect */}
            <div className="absolute -inset-1 animate-pulse rounded-xl bg-emerald-500/20 blur-sm" />
          </div>

          <div>
            <h3 className="font-bold text-white">AI Analysis</h3>
            <p className="text-xs text-zinc-500">Powered by Claude</p>
          </div>
        </div>

        <Link
          href="/predictions"
          className="text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
        >
          View All
        </Link>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="group cursor-pointer rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-emerald-500/30 hover:bg-white/10"
            onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
          >
            {/* Top row */}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <span className="mb-1 inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  {insight.category}
                </span>
                <h4 className="font-semibold text-white transition-colors group-hover:text-emerald-300">
                  {insight.title}
                </h4>
              </div>

              {/* Confidence meter */}
              <div className="ml-4 text-right">
                <div className="text-xs text-zinc-500">Confidence</div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${insight.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{insight.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Summary (expandable) */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedId === insight.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-sm leading-relaxed text-zinc-400">{insight.summary}</p>
            </div>

            {/* Bottom row */}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{insight.timestamp}</span>
              <div className="flex items-center gap-1 text-xs text-zinc-500 transition-colors group-hover:text-emerald-400">
                <span>{expandedId === insight.id ? 'Less' : 'More'}</span>
                <svg
                  className={`h-3 w-3 transition-transform ${expandedId === insight.id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 rounded-lg bg-emerald-500/10 p-3">
        <p className="text-center text-xs text-emerald-300/70">
          AI insights are generated for entertainment purposes and should not be used for betting decisions.
        </p>
      </div>
    </div>
  )
}
