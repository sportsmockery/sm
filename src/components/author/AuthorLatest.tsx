import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface LatestArticle {
  id: number
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  category: {
    name: string
    slug: string
  }
}

interface AuthorLatestProps {
  articles: LatestArticle[]
  className?: string
}

export default function AuthorLatest({ articles, className = '' }: AuthorLatestProps) {
  if (articles.length === 0) return null

  const [featured, ...rest] = articles.slice(0, 3)

  return (
    <section className={className}>
      <h2 className="mb-6 flex items-center gap-2 font-heading text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
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
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Latest Articles
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Featured latest */}
        {featured && (
          <Link
            href={`/${featured.category.slug}/${featured.slug}`}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="aspect-[4/3]">
              {featured.featured_image ? (
                <Image
                  src={featured.featured_image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full" style={{ background: 'linear-gradient(to bottom right, var(--sm-surface), var(--sm-border))' }} />
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <span className="mb-2 inline-block w-fit rounded bg-[#8B0000] px-2 py-1 text-xs font-bold text-white">
                {featured.category.name}
              </span>
              <h3 className="mb-2 font-heading text-xl font-bold text-white transition-colors group-hover:text-[#FF6666] lg:text-2xl">
                {featured.title}
              </h3>
              <time className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>
                {format(new Date(featured.published_at), 'MMM d, yyyy')}
              </time>
            </div>
          </Link>
        )}

        {/* Other recent articles */}
        <div className="space-y-4">
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex gap-4 rounded-xl border p-4 transition-all hover:border-[#8B0000]/30 hover:shadow-lg dark:hover:border-[#FF6666]/30"
              style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
            >
              {article.featured_image && (
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={article.featured_image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-center">
                <span className="mb-1 text-xs font-medium text-[#8B0000] dark:text-[#FF6666]">
                  {article.category.name}
                </span>
                <h4 className="line-clamp-2 font-semibold transition-colors group-hover:text-[#8B0000] dark:group-hover:text-[#FF6666]" style={{ color: 'var(--sm-text)' }}>
                  {article.title}
                </h4>
                <time className="mt-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  {format(new Date(article.published_at), 'MMM d, yyyy')}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
