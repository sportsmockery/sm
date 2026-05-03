'use client'

import { EdgeInsightStrip, useEdgeInsights } from './EdgeInsightStrip'

interface InlineSlot {
  afterParagraph: number
  node: React.ReactNode
  dropIfOutOfBounds?: boolean
}

/**
 * Provides EDGE insight strips as inline slots for article content.
 * Positions come from each insight's `paragraph_index` (set by DataLab).
 * Insights without a paragraph_index are skipped — DataLab's regeneration
 * cron backfills positions, so a null is transient, never a fallback signal.
 *
 * Use the returned slots with ArticleContentWithEmbeds.inlineSlots.
 */
export function useEdgeInsightSlots(articleId: string | number): InlineSlot[] {
  const insights = useEdgeInsights(articleId)

  const bySlot = new Map<number, (typeof insights)[number]>()
  for (const insight of insights) {
    if (typeof insight.paragraph_index !== 'number' || insight.paragraph_index < 1) continue
    bySlot.set(insight.paragraph_index, insight)
  }

  return Array.from(bySlot.entries())
    .sort(([a], [b]) => a - b)
    .map(([afterParagraph, insight]) => ({
      afterParagraph,
      node: <EdgeInsightStrip key={insight.id} insight={insight} articleId={articleId} />,
      dropIfOutOfBounds: true,
    }))
}

/**
 * Standalone panel — renders all EDGE insights as a block.
 * Reserved for surfaces that aren't the article body itself
 * (homepage roundup, team page, related-stories, etc.). Inside an
 * article, inline placement via `useEdgeInsightSlots` replaces this.
 *
 * Sorted by paragraph_index ASC, with nulls last, so the order matches
 * the article's reading order whenever positions are present.
 */
export function EdgeInsightsPanel({ articleId }: { articleId: string | number }) {
  const insights = useEdgeInsights(articleId)

  if (insights.length === 0) return null

  const sorted = [...insights].sort((a, b) => {
    const aIdx = typeof a.paragraph_index === 'number' ? a.paragraph_index : Infinity
    const bIdx = typeof b.paragraph_index === 'number' ? b.paragraph_index : Infinity
    return aIdx - bIdx
  })

  return (
    <div style={{ margin: '32px 0' }}>
      {sorted.map(insight => (
        <EdgeInsightStrip key={insight.id} insight={insight} articleId={articleId} />
      ))}
    </div>
  )
}
