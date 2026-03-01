'use client'

import Link from 'next/link'

interface ArticleTagsProps {
  tags: string[]
  className?: string
}

export default function ArticleTags({ tags, className = '' }: ArticleTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span
        style={{
          fontFamily: "Barlow, sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--sm-text-muted)',
        }}
      >
        Tags:
      </span>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/search?tag=${encodeURIComponent(tag)}`}
          className="sm-tag"
          style={{
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = 'var(--sm-red)'
            el.style.color = '#ffffff'
            el.style.borderColor = 'var(--sm-red)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = ''
            el.style.color = ''
            el.style.borderColor = ''
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
          {tag}
        </Link>
      ))}
    </div>
  )
}
