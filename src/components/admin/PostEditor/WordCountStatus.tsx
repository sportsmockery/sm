'use client'

import { useMemo } from 'react'
import type { ContentBlock } from '@/components/admin/BlockEditor'
import {
  ARTICLE_TYPES,
  computeStatus,
  type ArticleType,
} from '@/lib/articles/blocks'

interface WordCountStatusProps {
  blocks: ContentBlock[]
  articleType: ArticleType
  onArticleTypeChange?: (type: ArticleType) => void
  onPublishOverride?: () => void
}

/**
 * Soft gate (per CLAUDE_INSTRUCTIONS PR-8 first 2 weeks). Shows live
 * word-count progress, structured-section completeness, and an override
 * publish action that flags the article with `published_under_min = true`
 * so editorial can review override frequency before flipping to hard gate.
 */
export function WordCountStatus({
  blocks,
  articleType,
  onArticleTypeChange,
  onPublishOverride,
}: WordCountStatusProps) {
  const status = useMemo(() => computeStatus(blocks, articleType), [blocks, articleType])

  const meetsMin = status.meetsMinimum
  const colorOk = '#16A34A'
  const colorWarn = '#BC0000'
  const color = meetsMin ? colorOk : colorWarn

  return (
    <div
      className="rounded-md border p-3 text-sm"
      style={{ borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.02)' }}
    >
      <div className="flex items-center justify-between mb-2 gap-3">
        <label className="flex items-center gap-2 text-xs font-medium">
          <span style={{ color: 'var(--text-secondary, #6B7280)' }}>Article type</span>
          <select
            value={articleType}
            onChange={(e) => onArticleTypeChange?.(e.target.value as ArticleType)}
            disabled={!onArticleTypeChange}
            className="rounded border px-2 py-1 text-xs"
            style={{ borderColor: 'rgba(0,0,0,0.12)' }}
          >
            {ARTICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <span style={{ color }} className="text-xs font-bold">
          {status.wordCount} / {status.minWords} words {meetsMin ? '✓' : `(–${status.shortfall})`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[11px] mb-2" style={{ color: 'var(--text-secondary, #6B7280)' }}>
        <span>{status.flags.has_tldr ? '✓' : '○'} TL;DR</span>
        <span>{status.flags.has_key_facts ? '✓' : '○'} Key Facts</span>
        <span>{status.flags.has_why_it_matters ? '✓' : '○'} Why It Matters</span>
        <span>{status.flags.has_whats_next ? '✓' : '○'} What&apos;s Next</span>
      </div>

      {!meetsMin && (
        <div
          className="rounded p-2 text-xs"
          style={{ backgroundColor: 'rgba(188,0,0,0.06)', color: '#7A0000' }}
        >
          <p className="font-medium">Below per-type minimum.</p>
          <p className="mt-1 opacity-90">
            HCU compliance: thin {articleType} articles often get demoted. Either expand the article or
            override (logs <code className="font-mono">published_under_min</code> for editorial review).
          </p>
          {onPublishOverride && (
            <button
              type="button"
              onClick={onPublishOverride}
              className="mt-2 rounded border px-2 py-1 text-xs font-medium"
              style={{ borderColor: '#7A0000', color: '#7A0000' }}
            >
              Override and publish anyway
            </button>
          )}
        </div>
      )}
    </div>
  )
}
