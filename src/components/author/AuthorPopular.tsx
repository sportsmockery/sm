import Link from 'next/link'
import { format } from 'date-fns'

interface PopularArticle {
  id: number
  title: string
  slug: string
  published_at: string
  views: number
  category: {
    name: string
    slug: string
  }
}

interface AuthorPopularProps {
  articles: PopularArticle[]
  className?: string
}

export default function AuthorPopular({ articles, className = '' }: AuthorPopularProps) {
  if (articles.length === 0) return null

  return (
    <section
      className={`rounded-2xl p-6 ${className}`}
      style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-card)' }}
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        <svg
          className="h-5 w-5"
          style={{ color: '#BC0000' }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
          />
        </svg>
        Most Popular
      </h2>

      <ul className="space-y-4">
        {articles.slice(0, 5).map((article, index) => (
          <li key={article.id}>
            <Link
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex items-start gap-3"
            >
              {/* Rank */}
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? 'bg-[#D6B05E] text-white'
                    : index === 1
                    ? 'bg-zinc-400 text-white'
                    : index === 2
                    ? 'bg-amber-700 text-white'
                    : ''
                }`}
                style={index > 2 ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : undefined}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-[#BC0000]" style={{ color: 'var(--text-primary)' }}>
                  {article.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{article.views.toLocaleString()} views</span>
                  <span>·</span>
                  <time dateTime={article.published_at}>
                    {format(new Date(article.published_at), 'MMM d, yyyy')}
                  </time>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
