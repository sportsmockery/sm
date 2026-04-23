'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface EdgeInsight {
  id: string
  article_id: string
  team: string
  insight_type: 'stat' | 'trend' | 'prediction' | 'risk' | 'sentiment'
  title: string
  summary: string
  confidence_score: number
  source: string
  metadata: Record<string, unknown>
  created_at: string
}

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  stat:       { label: 'STAT',       icon: '📊' },
  trend:      { label: 'TREND',      icon: '📈' },
  prediction: { label: 'PREDICTION', icon: '🎯' },
  risk:       { label: 'RISK',       icon: '⚠️' },
  sentiment:  { label: 'SENTIMENT',  icon: '💭' },
}

/** Single inline EDGE Insight strip — intelligence layer inside articles */
export function EdgeInsightStrip({ insight, articleId }: { insight: EdgeInsight; articleId: string | number }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const cfg = TYPE_CONFIG[insight.insight_type] || TYPE_CONFIG.stat

  return (
    <div
      className="edge-insight-strip"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        margin: '28px 0',
        borderRadius: 12,
        border: '1px solid var(--sm-border)',
        borderLeft: '3px solid #00D4FF',
        padding: '16px 20px',
        backgroundColor: 'var(--sm-card)',
        boxShadow: hovered ? '0 0 20px rgba(0, 212, 255, 0.08)' : 'none',
        transition: 'box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => router.push(`/scout-ai?context=${articleId}`)}
    >
      {/* Top row: label + type badge + confidence */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: '#00D4FF',
        }}>
          ⚡ EDGE INSIGHT
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
          color: 'var(--sm-text-dim)',
          padding: '2px 6px',
          borderRadius: 4,
          backgroundColor: 'var(--sm-surface)',
        }}>
          {cfg.icon} {cfg.label}
        </span>
        {insight.confidence_score >= 0.8 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            color: '#00D4FF',
            opacity: 0.7,
          }}>
            HIGH CONFIDENCE
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--sm-text)',
        lineHeight: 1.4,
        marginBottom: 4,
      }}>
        {insight.title}
      </div>

      {/* Summary */}
      <div style={{
        fontSize: 13,
        color: 'var(--sm-text-muted)',
        lineHeight: 1.5,
        marginBottom: 10,
      }}>
        {insight.summary}
      </div>

      {/* CTA */}
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: '#00D4FF',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        View Full Breakdown
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </div>
  )
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

/**
 * Fetches EDGE insights for an article and distributes them as inline strips.
 * Returns an array of { afterParagraph, node } for use with ArticleContentWithEmbeds.
 */
export function useEdgeInsights(articleId: string | number): EdgeInsight[] {
  const [insights, setInsights] = useState<EdgeInsight[]>([])

  useEffect(() => {
    if (!articleId) return

    const cacheKey = `edge-insights-${articleId}`

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) {
          setInsights(data)
          return
        }
      }
    } catch {}

    const controller = new AbortController()

    fetch(`https://datalab.sportsmockery.com/api/edge-insights?article_id=${articleId}`, {
      signal: controller.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const items = data?.insights || []
        setInsights(items)
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data: items, ts: Date.now() }))
        } catch {}
      })
      .catch(() => {})

    return () => controller.abort()
  }, [articleId])

  return insights
}
