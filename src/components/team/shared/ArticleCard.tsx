import Image from 'next/image'
import Link from 'next/link'

export interface TeamPost {
  id: string | number
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: string | null
  category?: string
  categorySlug?: string
  author?: {
    name: string
    avatar?: string | null
  }
  publishedAt: string
}

export default function ArticleCard({
  post,
  isLarge = false,
  teamLabel = '',
}: {
  post: TeamPost
  isLarge?: boolean
  teamLabel?: string
}) {
  const href = post.categorySlug
    ? `/${post.categorySlug}/${post.slug}`
    : `/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group" style={{ textDecoration: 'none', display: 'block' }}>
        <article className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="article-card-hero-row" style={{ display: 'flex', flexDirection: 'column' }}>
            {post.featuredImage && (
              <div
                className="article-card-hero-img"
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <Image
                  src={post.featuredImage}
                  alt=""
                  fill
                  style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                  priority
                />
              </div>
            )}
            <div style={{ padding: '24px', flex: 1 }}>
              <span className="sm-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>
                {post.category || teamLabel}
              </span>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'var(--sm-text)',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  margin: '0 0 12px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  style={{
                    color: 'var(--sm-text-muted)',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    margin: '0 0 12px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.excerpt}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
                {post.author && <span style={{ fontWeight: 500 }}>{post.author.name}</span>}
                {post.author && <span>-</span>}
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group" style={{ textDecoration: 'none', display: 'block' }}>
      <article className="glass-card glass-card-sm" style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
        {post.featuredImage && (
          <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--sm-radius-sm)', overflow: 'hidden' }}>
            <Image
              src={post.featuredImage}
              alt=""
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
            />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--sm-text)',
              fontSize: '15px',
              fontWeight: 600,
              lineHeight: 1.4,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
            {post.author && <span>{post.author.name}</span>}
            {post.author && <span>-</span>}
            <span>
              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
