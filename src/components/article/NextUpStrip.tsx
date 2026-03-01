'use client'

import Link from 'next/link'

interface NextUpArticle {
  id: number
  title: string
  slug: string
}

interface NextUpStripProps {
  articles: NextUpArticle[]
  categorySlug?: string
}

export default function NextUpStrip({ articles, categorySlug }: NextUpStripProps) {
  if (!articles || articles.length === 0) return null

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--sm-text-muted)',
        marginBottom: 10,
        fontFamily: "Barlow, sans-serif",
      }}>
        Next Up
      </div>
      <div className="next-up-strip">
        {articles.slice(0, 6).map((article) => (
          <Link
            key={article.id}
            href={`/${categorySlug || 'article'}/${article.slug}`}
            className="article-glass-card-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 260,
              maxWidth: 340,
              textDecoration: 'none',
              transition: 'border-color 0.2s, background 0.2s',
              padding: '12px 16px',
            }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--sm-text)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}>
              {article.title}
            </span>
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="var(--sm-text-dim)"
              style={{ flexShrink: 0 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
