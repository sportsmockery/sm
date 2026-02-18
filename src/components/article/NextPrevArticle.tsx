import Image from 'next/image'
import Link from 'next/link'

interface ArticleLink {
  title: string
  slug: string
  featured_image?: string
  category: {
    name: string
    slug: string
  }
}

interface NextPrevArticleProps {
  prevArticle?: ArticleLink | null
  nextArticle?: ArticleLink | null
  className?: string
}

export default function NextPrevArticle({
  prevArticle,
  nextArticle,
  className = '',
}: NextPrevArticleProps) {
  if (!prevArticle && !nextArticle) return null

  return (
    <section
      className={`py-8 ${className}`}
      style={{ borderTop: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}
    >
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:gap-8">
        {/* Previous Article */}
        <div>
          {prevArticle ? (
            <Link
              href={`/${prevArticle.category.slug}/${prevArticle.slug}`}
              className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
            >
              {/* Arrow */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all group-hover:text-white" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-dim)' }}>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </div>

              {/* Thumbnail */}
              {prevArticle.featured_image && (
                <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:block">
                  <Image
                    src={prevArticle.featured_image}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
                  Previous Article
                </p>
                <span className="mb-1 inline-block rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                  {prevArticle.category.name}
                </span>
                <h4 className="line-clamp-2 font-semibold transition-colors group-hover:text-[var(--sm-accent)]" style={{ color: 'var(--sm-text)' }}>
                  {prevArticle.title}
                </h4>
              </div>
            </Link>
          ) : (
            <div className="h-full" />
          )}
        </div>

        {/* Next Article */}
        <div>
          {nextArticle ? (
            <Link
              href={`/${nextArticle.category.slug}/${nextArticle.slug}`}
              className="group flex items-center gap-4 rounded-2xl p-4 text-right transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
            >
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
                  Next Article
                </p>
                <span className="mb-1 inline-block rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                  {nextArticle.category.name}
                </span>
                <h4 className="line-clamp-2 font-semibold transition-colors group-hover:text-[var(--sm-accent)]" style={{ color: 'var(--sm-text)' }}>
                  {nextArticle.title}
                </h4>
              </div>

              {/* Thumbnail */}
              {nextArticle.featured_image && (
                <div className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:block">
                  <Image
                    src={nextArticle.featured_image}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}

              {/* Arrow */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all group-hover:text-white" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-dim)' }}>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </Link>
          ) : (
            <div className="h-full" />
          )}
        </div>
      </div>
    </section>
  )
}
