'use client'

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
      className={className}
      style={{
        padding: '32px 0',
        borderTop: '1px solid var(--sm-border)',
        background: 'var(--sm-surface)',
      }}
    >
      <div
        className="next-prev-grid"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: '1fr',
        }}
      >
        {/* Previous Article */}
        <div>
          {prevArticle ? (
            <Link
              href={`/${prevArticle.category.slug}/${prevArticle.slug}`}
              className="glass-card glass-card-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Arrow */}
              <div
                style={{
                  display: 'flex',
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'var(--sm-surface)',
                  color: 'var(--sm-text-dim)',
                  border: '1px solid var(--sm-border)',
                }}
              >
                <svg
                  width="20"
                  height="20"
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
                <div
                  className="next-prev-thumb"
                  style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    borderRadius: '12px',
                  }}
                >
                  <Image
                    src={prevArticle.featured_image}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  />
                </div>
              )}

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--sm-text-dim)',
                    marginBottom: '6px',
                  }}
                >
                  Previous Article
                </p>
                <span
                  className="sm-tag"
                  style={{ fontSize: '11px', padding: '3px 10px', marginBottom: '6px' }}
                >
                  {prevArticle.category.name}
                </span>
                <h4
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--sm-text)',
                    lineHeight: 1.35,
                    marginTop: '6px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {prevArticle.title}
                </h4>
              </div>
            </Link>
          ) : (
            <div style={{ height: '100%' }} />
          )}
        </div>

        {/* Next Article */}
        <div>
          {nextArticle ? (
            <Link
              href={`/${nextArticle.category.slug}/${nextArticle.slug}`}
              className="glass-card glass-card-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                textDecoration: 'none',
                textAlign: 'right',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--sm-text-dim)',
                    marginBottom: '6px',
                  }}
                >
                  Next Article
                </p>
                <span
                  className="sm-tag"
                  style={{ fontSize: '11px', padding: '3px 10px', marginBottom: '6px', display: 'inline-flex' }}
                >
                  {nextArticle.category.name}
                </span>
                <h4
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--sm-text)',
                    lineHeight: 1.35,
                    marginTop: '6px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {nextArticle.title}
                </h4>
              </div>

              {/* Thumbnail */}
              {nextArticle.featured_image && (
                <div
                  className="next-prev-thumb"
                  style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    borderRadius: '12px',
                  }}
                >
                  <Image
                    src={nextArticle.featured_image}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  />
                </div>
              )}

              {/* Arrow */}
              <div
                style={{
                  display: 'flex',
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'var(--sm-surface)',
                  color: 'var(--sm-text-dim)',
                  border: '1px solid var(--sm-border)',
                }}
              >
                <svg
                  width="20"
                  height="20"
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
            <div style={{ height: '100%' }} />
          )}
        </div>
      </div>

      {/* Responsive: hide thumbnails on mobile, 2-col on desktop */}
      <style>{`
        .next-prev-thumb {
          display: none;
        }
        @media (min-width: 640px) {
          .next-prev-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }
          .next-prev-thumb {
            display: block;
          }
        }
      `}</style>
    </section>
  )
}
