'use client'

// GoogleTab is the only entry point the executive dashboard imports. It owns
// data loading (via useGoogleTabData) and arranges every section in the order
// specified in the system spec. Existing dashboard tabs are not touched.

import React from 'react'
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

export function GoogleTab({ active }: { active: boolean }) {
  const { data, loading, error, source, refresh } = useGoogleTabData(active)

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
      {source !== 'db' && (
        <div className="rounded-md border px-3 py-2 text-[12px]" style={{ background: 'rgba(214,176,94,0.08)', borderColor: 'rgba(214,176,94,0.4)', color: '#D6B05E' }}>
          Showing {source === 'mock-fallback' ? 'mock fallback (DB unreachable)' : 'mock data'} — apply migration <code>20260428_google_intelligence.sql</code> and run the rescore worker to populate live scores.
        </div>
      )}

      {/* 1. Command center overview */}
      <GoogleOverviewCards data={data} />

      {/* 2. Score distribution */}
      <GoogleScoreDistribution data={data} />

      {/* 3. Writer leaderboard */}
      <WriterGoogleLeaderboard writers={data.writers} />

      {/* 4. Article analysis */}
      <GoogleArticleAnalysisTable articles={data.articles} />

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
