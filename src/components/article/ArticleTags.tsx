import Link from 'next/link'

interface ArticleTagsProps {
  tags: string[]
  className?: string
}

export default function ArticleTags({ tags, className = '' }: ArticleTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-semibold" style={{ color: 'var(--sm-text-muted)' }}>
        Tags:
      </span>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/search?tag=${encodeURIComponent(tag)}`}
          className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all hover:text-white"
          style={{
            color: 'var(--sm-accent)',
            border: '1px solid color-mix(in srgb, var(--sm-accent) 30%, transparent)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.backgroundColor = 'var(--sm-accent)';
            el.style.borderColor = 'var(--sm-accent)';
            el.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.backgroundColor = 'transparent';
            el.style.borderColor = 'color-mix(in srgb, var(--sm-accent) 30%, transparent)';
            el.style.color = 'var(--sm-accent)';
          }}
        >
          <svg
            className="mr-1.5 h-3 w-3"
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
