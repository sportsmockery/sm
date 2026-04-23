'use client'

import ArticleContentWithEmbeds from './ArticleContentWithEmbeds'
import ScoutInsightBox from './ScoutInsightBox'
import { useEdgeInsightSlots } from '@/components/edge/ArticleEdgeInsights'

interface ArticleContentWithInsightsProps {
  content: string
  postId: number
  postTitle: string
  postContent: string
  team?: string
  featuredImage?: string | null
}

/**
 * Client wrapper that composes article HTML content with:
 * - ScoutInsightBox (after paragraph 3)
 * - EDGE Insight strips (after paragraphs 2, 5, 9)
 */
export default function ArticleContentWithInsights({
  content,
  postId,
  postTitle,
  postContent,
  team,
}: ArticleContentWithInsightsProps) {
  const edgeSlots = useEdgeInsightSlots(postId)

  return (
    <ArticleContentWithEmbeds
      content={content}
      inlineSlot={
        <ScoutInsightBox
          postId={postId}
          postTitle={postTitle}
          content={postContent}
          team={team}
        />
      }
      inlineSlots={edgeSlots}
    />
  )
}
