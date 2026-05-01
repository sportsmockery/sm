import type { InteractiveBlock } from '@/lib/training/curriculum'
import { ArticleComparison } from './ArticleComparison'
import { ArticleAnalysisPreview } from './ArticleAnalysisPreview'
import { EngagementScoreExplainer } from './EngagementScoreExplainer'
import { HeadlineExercise } from './HeadlineExercise'
import { SignalExercise } from './SignalExercise'

export function ModuleInteractive({ block }: { block?: InteractiveBlock }) {
  if (!block) return null

  switch (block) {
    case 'article-comparison':
      return <ArticleComparison />
    case 'engagement-explainer':
      return <EngagementScoreExplainer />
    case 'headline-exercise':
      return <HeadlineExercise />
    case 'signal-exercise':
      return <SignalExercise />
    case 'article-analysis':
      return <ArticleAnalysisPreview />
    case 'certification-quiz':
      return null
    default:
      return null
  }
}
