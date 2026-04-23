'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

interface ScoutInsightResponse {
  postId: string | null
  insight: string
  insight_type: 'context' | 'hot_take' | 'stat_bomb' | 'history' | 'prediction'
  related_stat: string | null
  cta: string | null
  cached: boolean
}

const INSIGHT_LABELS: Record<string, { label: string; icon: string }> = {
  context:    { label: 'SCOUT CONTEXT',    icon: '🔍' },
  hot_take:   { label: 'SCOUT HOT TAKE',   icon: '🔥' },
  stat_bomb:  { label: 'SCOUT STAT BOMB',  icon: '💣' },
  history:    { label: 'SCOUT FLASHBACK',   icon: '📜' },
  prediction: { label: 'SCOUT PREDICTION', icon: '🎯' },
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface ScoutInsightBoxProps {
  postId?: number
  postTitle: string
  content: string
  team?: string | null
}

export default function ScoutInsightBox({ postId, postTitle, content, team }: ScoutInsightBoxProps) {
  const [data, setData] = useState<ScoutInsightResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!content && !postTitle) return

    const cacheKey = `scout-insight-${postId || postTitle.slice(0, 40)}`

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { payload, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) {
          setData(payload)
          setLoading(false)
          return
        }
      }
    } catch {
      // Ignore cache errors
    }

    const controller = new AbortController()

    fetch('https://datalab.sportsmockery.com/api/scout/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: postId ? String(postId) : undefined,
        postTitle,
        content: content.slice(0, 8000),
        team: team || undefined,
        username: user?.name || undefined,
      }),
      signal: controller.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then((result: ScoutInsightResponse | null) => {
        if (result?.insight) {
          setData(result)
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ payload: result, ts: Date.now() }))
          } catch {
            // Ignore storage errors
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [postId, postTitle, content, team, user?.name])

  // Graceful degradation — render nothing if no data
  if (loading) {
    return (
      <div style={{
        margin: '32px 0',
        borderRadius: 14,
        border: '1px solid var(--sm-border)',
        borderLeft: '3px solid #00D4FF',
        padding: '20px 24px',
        backgroundColor: 'var(--sm-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Image src="/downloads/scout-v2.png" alt="Scout AI" width={22} height={22} style={{ borderRadius: '50%' }} />
          <div style={{ height: 12, width: 120, borderRadius: 6, background: 'var(--sm-surface)', animation: 'pulse 1.5s infinite' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 14, borderRadius: 6, background: 'var(--sm-surface)', width: '100%', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 14, borderRadius: 6, background: 'var(--sm-surface)', width: '85%', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 14, borderRadius: 6, background: 'var(--sm-surface)', width: '60%', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    )
  }

  if (!data?.insight) return null

  const meta = INSIGHT_LABELS[data.insight_type] || INSIGHT_LABELS.context

  return (
    <div style={{
      margin: '32px 0',
      borderRadius: 14,
      border: '1px solid var(--sm-border)',
      borderLeft: '3px solid #00D4FF',
      padding: '20px 24px',
      backgroundColor: 'var(--sm-card)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{meta.icon}</span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: '#00D4FF',
        }}>
          {meta.label}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Image src="/downloads/scout-v2.png" alt="Scout" width={20} height={20} style={{ borderRadius: '50%' }} />
          <span style={{ fontSize: 11, color: 'var(--sm-text-dim)' }}>Scout AI</span>
        </div>
      </div>

      {/* Insight text */}
      <p style={{
        fontSize: 15,
        lineHeight: 1.7,
        color: 'var(--sm-text)',
        margin: 0,
        fontWeight: 400,
      }}>
        {data.insight}
      </p>

      {/* Supporting stat */}
      {data.related_stat && (
        <div style={{
          marginTop: 12,
          borderRadius: 8,
          padding: '10px 14px',
          backgroundColor: 'var(--sm-surface)',
          fontSize: 13,
          color: 'var(--sm-text-muted)',
          lineHeight: 1.5,
        }}>
          📊 {data.related_stat}
        </div>
      )}

      {/* CTA / engagement question */}
      {data.cta && (
        <p style={{
          marginTop: 12,
          marginBottom: 0,
          fontSize: 13,
          fontWeight: 500,
          fontStyle: 'italic',
          color: '#BC0000',
        }}>
          {data.cta}
        </p>
      )}
    </div>
  )
}
