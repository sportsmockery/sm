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
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${className}`}
      style={{ color: 'var(--sm-text-muted)' }}
    >
      {/* Date */}
      <time dateTime={publishedAt}>
        {format(new Date(publishedAt), 'MMMM d, yyyy')}
      </time>

      {/* Reading time */}
      {content && (
        <>
          <span style={{ color: 'var(--sm-text-dim)' }}>•</span>
          <ReadingTime content={content} />
        </>
      )}

      {/* View count */}
      {typeof viewCount === 'number' && (
        <>
          <span style={{ color: 'var(--sm-text-dim)' }}>•</span>
          <ViewCount count={viewCount} animate={false} />
        </>
      )}
    </div>
  )
}
