import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface RelatedArticle {
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
  author: {
    name: string
    slug: string
    avatar_url?: string
  }
}

interface RelatedArticlesProps {
  articles: RelatedArticle[]
  categoryName: string
  className?: string
}

export default function RelatedArticles({
  articles,
  categoryName,
  className = '',
}: RelatedArticlesProps) {
  if (articles.length === 0) return null

  return (
    <section className={className}>
      <h2
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--sm-text)',
          marginBottom: '24px',
        }}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="var(--sm-red)"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        More from {categoryName}
      </h2>

      <div
        style={{
          display: 'grid',
          gap: '24px',
          gridTemplateColumns: 'repeat(1, 1fr)',
        }}
        className="related-articles-grid"
      >
        {articles.slice(0, 3).map((article) => (
          <article
            key={article.id}
            className="glass-card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Image */}
            <Link
              href={`/${article.category.slug}/${article.slug}`}
              style={{
                display: 'block',
                position: 'relative',
                aspectRatio: '16/9',
                overflow: 'hidden',
                borderRadius: '12px 12px 0 0',
              }}
            >
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(to bottom right, var(--sm-surface), var(--sm-border))`,
                  }}
                >
                  <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--sm-text-dim)' }}>SM</span>
                </div>
              )}
            </Link>

            {/* Content */}
            <div style={{ padding: '16px 20px 20px' }}>
              {/* Team Pill */}
              <span className="sm-tag" style={{ marginBottom: '10px' }}>
                {article.category.name}
              </span>

              {/* Headline */}
              <h3 style={{ marginTop: '10px', marginBottom: '8px' }}>
                <Link
                  href={`/${article.category.slug}/${article.slug}`}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: 'var(--sm-text)',
                    textDecoration: 'none',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sm-red)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sm-text)' }}
                >
                  {article.title}
                </Link>
              </h3>

              {/* Excerpt */}
              {article.excerpt && (
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: 'var(--sm-text-muted)',
                    marginBottom: '12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.excerpt}
                </p>
              )}

              {/* Author + Date Meta */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: 'var(--sm-text-dim)',
                }}
              >
                {article.author && (
                  <>
                    <span style={{ color: 'var(--sm-text-muted)', fontWeight: 500 }}>
                      {article.author.name}
                    </span>
                    <span style={{ color: 'var(--sm-text-dim)' }}>&middot;</span>
                  </>
                )}
                <time dateTime={article.published_at}>
                  {format(new Date(article.published_at), 'MMM d, yyyy')}
                </time>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Responsive grid via inline style tag */}
      <style>{`
        .related-articles-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .related-articles-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .related-articles-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </section>
  )
}
