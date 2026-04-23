'use client'

import { EdgeInsightStrip, useEdgeInsights } from './EdgeInsightStrip'

// Paragraph positions for inline strip insertion (after these paragraphs)
const STRIP_POSITIONS = [2, 5, 9]

interface ArticleEdgeInsightsProps {
  articleId: string | number
  children?: React.ReactNode
}

/**
 * Provides EDGE insight strips as inline slots for article content.
 * Use the `slots` property to pass to ArticleContentWithEmbeds.inlineSlots.
 */
export function useEdgeInsightSlots(articleId: string | number) {
  const insights = useEdgeInsights(articleId)

  // Map insights to paragraph positions, max 3
  const slots = insights.slice(0, 3).map((insight, i) => ({
    afterParagraph: STRIP_POSITIONS[i],
    node: <EdgeInsightStrip key={insight.id} insight={insight} articleId={articleId} />,
  }))

  return slots
}

/**
 * Standalone panel — renders all EDGE insights as a block (for block-based articles).
 */
export function EdgeInsightsPanel({ articleId }: { articleId: string | number }) {
  const insights = useEdgeInsights(articleId)

  if (insights.length === 0) return null

  return (
    <div style={{ margin: '32px 0' }}>
      {insights.slice(0, 3).map(insight => (
        <EdgeInsightStrip key={insight.id} insight={insight} articleId={articleId} />
      ))}
    </div>
  )
}
