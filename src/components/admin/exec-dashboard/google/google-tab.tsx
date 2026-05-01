'use client'

// GoogleTab is the only entry point the executive dashboard imports. It owns
// data loading (via useGoogleTabData) and arranges every section in the order
// specified in the system spec. Existing dashboard tabs are not touched.

import React, { useState } from 'react'
import { useGoogleTabData } from '@/hooks/use-google-tab-data'
import { GoogleOverviewCards } from './google-overview-cards'
import { GoogleScoreDistribution } from './google-score-distribution'
import { WriterGoogleLeaderboard } from './writer-google-leaderboard'
import { GoogleArticleAnalysisTable } from './google-article-analysis-table'
import { GoogleRulesEnginePanel } from './google-rules-engine-panel'
import { GoogleRecommendationsPanel } from './google-recommendations-panel'
import { GoogleKnowledgePanel } from './google-knowledge-panel'
import { GoogleOperationsProofPanel } from './google-operations-proof-panel'
import { GoogleTransparencyAssetsPanel } from './google-transparency-assets-panel'

export type ArticleEngagementMap = Record<string, {
  pageViews: number
  avgTimeOnPage: number
  scrollCompletion: number
  engagementRate: number
  comments: number
}>

export type WriterEngagementRow = {
  id: number | string
  name?: string
  engagement_score?: number
  overall_score?: number
  comments?: number
  hubPosts?: number
}

export function GoogleTab({
  active,
  range,
  customStart,
  customEnd,
  articleEngagement,
  writerEngagement,
}: {
  active: boolean
  range?: string
  customStart?: string
  customEnd?: string
  articleEngagement?: ArticleEngagementMap
  writerEngagement?: WriterEngagementRow[]
}) {
  const { data, loading, error, source, refresh } = useGoogleTabData(active, range, customStart, customEnd)
  const [busy, setBusy] = useState<null | 'backfill' | 'tick' | 'rescore'>(null)
  const [opMessage, setOpMessage] = useState<string | null>(null)

  const callApi = async (path: string): Promise<Record<string, unknown>> => {
    const res = await fetch(path, { method: 'POST' })
    const text = await res.text()
    let json: Record<string, unknown>
    try {
      json = JSON.parse(text) as Record<string, unknown>
    } catch {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
    }
    if (!res.ok) throw new Error(String(json.error ?? `HTTP ${res.status}`))
    return json
  }

  const runBackfill = async () => {
    setBusy('backfill'); setOpMessage(null)
    try {
      const json = await callApi('/api/admin/google-intelligence/backfill?limit=500')
      setOpMessage(`Enqueued ${json.enqueued} articles + ${json.transparencyEnqueued ?? 0} transparency assets (deduped ${json.deduplicated}, skipped ${json.skipped}). Now run the worker.`)
    } catch (e) {
      setOpMessage(`Backfill failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(null)
    }
  }

  const runTick = async () => {
    setBusy('tick'); setOpMessage(null)
    try {
      const json = await callApi('/api/admin/google-intelligence/tick?maxBatches=8&batchSize=25')
      setOpMessage(`Worker processed ${json.processed} (failed ${json.failed}). Refresh to see updated scores.`)
      refresh()
    } catch (e) {
      setOpMessage(`Tick failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(null)
    }
  }

  // Force a true rescore of every recent article. Re-enqueues regardless of
  // whether they already have a current score (onlyMissing=false), then
  // processes the queue. Use after a rules engine change so existing scores
  // pick up the new behavior — without this, backfill silently skips
  // already-scored articles and the refresh button looks broken.
  const runForceRescore = async () => {
    setBusy('rescore'); setOpMessage('Re-scoring all articles…')
    try {
      const fill = await callApi('/api/admin/google-intelligence/backfill?limit=500&onlyMissing=false')
      const enqueued = fill.enqueued ?? 0
      setOpMessage(`Enqueued ${enqueued} articles. Draining…`)
      // Drain in 4 sequential ticks of 100 each (cron-equivalent throughput
      // without exceeding the 60s function budget per call).
      let totalProcessed = 0
      for (let i = 0; i < 5; i++) {
        const t = await callApi('/api/admin/google-intelligence/tick?maxBatches=4&batchSize=25').catch(e => ({ processed: 0, error: String(e) } as any))
        totalProcessed += (t.processed ?? 0)
        if ((t.processed ?? 0) === 0) break
      }
      setOpMessage(`Re-scored ${totalProcessed} of ${enqueued}. Remaining will drain via the 5-minute cron. Refreshing view…`)
      refresh()
    } catch (e) {
      setOpMessage(`Force re-score failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(null)
    }
  }

  if (!active) return null

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-24 rounded-lg" style={{ background: 'var(--sm-card)' }} />
        <div className="h-64 rounded-lg" style={{ background: 'var(--sm-card)' }} />
        <div className="h-96 rounded-lg" style={{ background: 'var(--sm-card)' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border p-12 text-center" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--sm-text-muted)' }}>
          Failed to load Google intelligence: {error ?? 'unknown error'}
        </p>
        <button onClick={refresh} className="mt-3 px-5 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--sm-red)', color: '#FAFAFB' }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Always-visible toolbar — re-score, refresh, status. */}
      <div className="flex items-center justify-between gap-3 flex-wrap rounded-md border px-3 py-2" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
        <div className="text-[11px]" style={{ color: 'var(--sm-text-dim)' }}>
          Article scores update automatically every 5 min via cron. Use <strong>Re-score articles</strong> to force a refresh after a rules engine change.
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {opMessage && (
            <span className="text-[11px]" style={{ color: 'var(--sm-text-muted)' }}>{opMessage}</span>
          )}
          <button
            onClick={runForceRescore}
            disabled={busy !== null}
            className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide disabled:opacity-40"
            style={{ background: '#BC0000', color: '#FAFAFB' }}
            title="Re-enqueues every recent article and runs the worker to apply the latest rules engine"
          >
            {busy === 'rescore' ? 'Re-scoring…' : 'Re-score articles'}
          </button>
          <button
            onClick={refresh}
            disabled={busy !== null}
            className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide disabled:opacity-40"
            style={{ background: 'var(--sm-surface)', color: 'var(--sm-text)', border: '1px solid var(--sm-border)' }}
            title="Re-fetch the dashboard view (does not re-score)"
          >
            Refresh view
          </button>
        </div>
      </div>

      {source !== 'db' && (
        <div className="rounded-md border px-3 py-3 text-[12px] flex flex-col gap-2" style={{ background: 'rgba(214,176,94,0.08)', borderColor: 'rgba(214,176,94,0.4)', color: '#D6B05E' }}>
          <div>
            Showing {source === 'mock-fallback' ? 'mock fallback (DB unreachable)' : source === 'mock-articles+db-transparency' ? 'mock article scores (transparency assets are real)' : 'mock data'} — articles haven&apos;t been scored yet. Click <strong>Run backfill</strong> to enqueue every published post, then <strong>Run worker</strong> to score the queue. The cron will keep things fresh automatically every 5 minutes after that.
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={runBackfill}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide disabled:opacity-40"
              style={{ background: '#BC0000', color: '#FAFAFB' }}
            >
              {busy === 'backfill' ? 'Backfilling…' : 'Run backfill'}
            </button>
            <button
              onClick={runTick}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide disabled:opacity-40"
              style={{ background: '#00D4FF', color: '#0B0F14' }}
            >
              {busy === 'tick' ? 'Running…' : 'Run worker'}
            </button>
            {opMessage && <span className="text-[11px]" style={{ color: '#FAFAFB' }}>{opMessage}</span>}
          </div>
        </div>
      )}

      {/* 1. Command center overview */}
      <GoogleOverviewCards data={data} />

      {/* Engagement explainer — sets context for the breakdown shown per article */}
      <div className="rounded-md border px-4 py-3 text-[12px] leading-relaxed" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)' }}>
        Engagement Score reflects how readers actually interact with each article — combining engagement signals
        (comments, time on page, scroll depth, engaged sessions from GA4) with content quality (headline subscore,
        trust, spam safety from the Google rules engine). Click any article row below to see the per-component breakdown.
      </div>

      {/* 2. Score distribution */}
      <GoogleScoreDistribution data={data} />

      {/* 3. Writer leaderboard */}
      <WriterGoogleLeaderboard
        writers={data.writers}
        writerEngagement={writerEngagement}
        recommendations={data.recommendations}
        articles={data.articles}
      />

      {/* 4. Article analysis */}
      <GoogleArticleAnalysisTable articles={data.articles} rules={data.rules} recommendations={data.recommendations} engagement={articleEngagement} />

      {/* 5. Transparency assets (/about, author pages, contact, publisher) */}
      <GoogleTransparencyAssetsPanel data={data} />

      {/* 6. Rules engine + Knowledge panel side-by-side on xl, stacked below */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GoogleRulesEnginePanel rules={data.rules} />
        <GoogleKnowledgePanel data={data} />
      </div>

      {/* 7. Recommendations */}
      <GoogleRecommendationsPanel recommendations={data.recommendations} />

      {/* 8. Operations proof */}
      <GoogleOperationsProofPanel ops={data.operations} />
    </div>
  )
}
