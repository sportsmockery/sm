import Link from 'next/link'
import Image from 'next/image'

interface HeroCardProps {
  breadcrumb: { label: string; href: string }[]
  categoryName: string
  categorySlug: string
  contextLabel?: { label: string } | null
  title: string
  author?: {
    id: number
    display_name: string
    slug: string | null
    avatar_url: string | null
  } | null
  publishedAt: string
  readingTime: number
  views: number
  commentCount?: number
  formattedDate: string
}

export default function HeroCard({
  breadcrumb,
  categoryName,
  categorySlug,
  contextLabel,
  title,
  author,
  publishedAt,
  readingTime,
  views,
  commentCount = 0,
  formattedDate,
}: HeroCardProps) {
  return (
    <div className="article-glass-card">
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 16 }}>
        <ol style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--sm-text-dim)', listStyle: 'none', padding: 0, margin: 0 }}>
          {breadcrumb.map((crumb, i) => (
            <li key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <span>/</span>}
              <Link href={crumb.href} style={{ color: 'inherit', transition: 'color 0.2s' }}>
                {crumb.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Tag pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link href={`/${categorySlug}`} className="sm-tag">{categoryName}</Link>
        {contextLabel && <span className="sm-tag">{contextLabel.label}</span>}
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "Barlow, sans-serif",
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 700,
        letterSpacing: '-1px',
        lineHeight: 1.15,
        color: 'var(--sm-text)',
        marginBottom: 24,
      }}>
        {title}
      </h1>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {author && (
          <Link
            href={`/author/${author.slug || author.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            {author.avatar_url ? (
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                <Image src={author.avatar_url} alt={author.display_name} fill style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--sm-gradient-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600, color: 'var(--sm-text)',
              }}>
                {author.display_name.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sm-text)' }}>
              {author.display_name}
            </span>
          </Link>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--sm-text-dim)', flexWrap: 'wrap' }}>
          <time dateTime={publishedAt}>{formattedDate}</time>
          <span>·</span>
          <span>{readingTime} min read</span>
          {views > 0 && (
            <>
              <span>·</span>
              <span>{views.toLocaleString()} views</span>
            </>
          )}
          {commentCount > 0 && (
            <>
              <span>·</span>
              <a
                href="#comments-section"
                style={{ color: 'var(--sm-text-dim)', textDecoration: 'none', transition: 'color 0.2s', scrollBehavior: 'smooth' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.2 48.2 0 005.265-.263c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  {commentCount}
                </span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
