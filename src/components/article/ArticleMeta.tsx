import { format } from 'date-fns'
import ReadingTime from './ReadingTime'
import ViewCount from './ViewCount'

interface ArticleMetaProps {
  publishedAt: string
  content?: string
  viewCount?: number
  className?: string
}

export default function ArticleMeta({
  publishedAt,
  content,
  viewCount,
  className = '',
}: ArticleMetaProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-500 ${className}`}
    >
      {/* Date */}
      <time dateTime={publishedAt}>
        {format(new Date(publishedAt), 'MMMM d, yyyy')}
      </time>

      {/* Reading time */}
      {content && (
        <>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <ReadingTime content={content} />
        </>
      )}

      {/* View count */}
      {typeof viewCount === 'number' && (
        <>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <ViewCount count={viewCount} animate={false} />
        </>
      )}
    </div>
  )
}
