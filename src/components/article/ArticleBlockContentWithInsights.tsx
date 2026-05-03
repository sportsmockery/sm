'use client';

import { ArticleBlockContent } from '@/components/articles/ArticleBlockContent';
import { EdgeInsightStrip, useEdgeInsights } from '@/components/edge/EdgeInsightStrip';
import type { ArticleDocument } from '@/components/admin/BlockEditor';

interface ArticleBlockContentWithInsightsProps {
  document: ArticleDocument;
  articleId: string | number;
}

/**
 * Block-based article wrapper that splices EDGE Insight strips between
 * paragraph blocks based on each insight's `paragraph_index`.
 *
 * Mirrors `ArticleContentWithInsights` (the HTML/WordPress equivalent) so
 * the two content paths place insights identically. Insights without a
 * paragraph_index are skipped — DataLab's regeneration cron backfills
 * positions, so a null is transient, never a fallback signal.
 */
export default function ArticleBlockContentWithInsights({
  document,
  articleId,
}: ArticleBlockContentWithInsightsProps) {
  const insights = useEdgeInsights(articleId);

  const bySlot = new Map<number, (typeof insights)[number]>();
  for (const insight of insights) {
    if (typeof insight.paragraph_index !== 'number' || insight.paragraph_index < 1) continue;
    bySlot.set(insight.paragraph_index, insight);
  }

  const inlineSlots = Array.from(bySlot.entries())
    .sort(([a], [b]) => a - b)
    .map(([afterParagraph, insight]) => ({
      afterParagraph,
      node: <EdgeInsightStrip key={insight.id} insight={insight} articleId={articleId} />,
    }));

  return <ArticleBlockContent document={document} inlineSlots={inlineSlots} />;
}
