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
      className={`rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-zinc-900 dark:text-white">
        <svg
          className="h-5 w-5 text-[#8B0000] dark:text-[#FF6666]"
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
                    ? 'bg-amber-500 text-white'
                    : index === 1
                    ? 'bg-zinc-400 text-white'
                    : index === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                }`}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                  {article.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{article.views.toLocaleString()} views</span>
                  <span>•</span>
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
