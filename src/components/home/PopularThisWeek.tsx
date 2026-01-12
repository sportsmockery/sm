import Image from 'next/image'
import Link from 'next/link'

interface PopularArticle {
  id: number
  title: string
  slug: string
  featured_image?: string
  views: number
  category: {
    slug: string
  }
}

interface PopularThisWeekProps {
  articles: PopularArticle[]
  className?: string
}

export default function PopularThisWeek({ articles, className = '' }: PopularThisWeekProps) {
  const topArticles = articles.slice(0, 5)

  return (
    <section className={className}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-zinc-900 dark:text-white">
          <svg
            className="h-5 w-5 text-[#8B0000] dark:text-[#FF6666]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
          Popular This Week
        </h3>

        {/* Articles list */}
        <div className="space-y-4">
          {topArticles.map((article, index) => (
            <Link
              key={article.id}
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex items-start gap-3"
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-200 dark:bg-zinc-700" />
                )}
                {/* Rank badge */}
                <div className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded bg-black/70 text-xs font-bold text-white">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                  {article.title}
                </h4>
                <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {article.views.toLocaleString()} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
