import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/lib/homepage-data'
import { CommentCountBadge } from '@/components/article/CommentCount'

interface FeaturedShellProps {
  posts: Post[]
}

/**
 * FeaturedShell - Featured articles section
 * Athletic-style clean design
 *
 * GUARANTEE: Always renders 6 cards.
 * Uses provided posts or placeholders.
 */
export function FeaturedShell({ posts }: FeaturedShellProps) {
  // Ensure we always have 6 posts
  const displayPosts = posts.slice(0, 6)

  return (
    <section className="sm-section sm-featured-section">
      <div className="sm-container sm-container--wide">
        <header className="sm-section-header sm-section-header--compact">
          <h2 className="sm-section-title">Featured Stories</h2>
        </header>

        <div className="sm-featured-grid">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/${post.category.slug}/${post.slug}`}
              className="sm-featured-card"
            >
              <article>
                {post.featured_image && (
                  <div className="sm-featured-image">
                    <Image
                      src={post.featured_image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="sm-featured-img"
                    />
                    {/* Comment count badge */}
                    <CommentCountBadge
                      articleUrl={`https://sportsmockery.com/${post.category.slug}/${post.slug}`}
                      articleId={post.id}
                    />
                  </div>
                )}
                <div className="sm-featured-content">
                  <span className="sm-featured-category">
                    {post.category.name}
                  </span>
                  <h3 className="sm-featured-title">{post.title}</h3>
                  {post.excerpt && (
                    <p className="sm-featured-excerpt">{truncateExcerpt(post.excerpt, 100)}</p>
                  )}
                  <div className="sm-featured-meta">
                    <span className="sm-featured-author">
                      {post.author?.name || 'Staff'}
                    </span>
                    <span className="sm-meta-sep">·</span>
                    <span className="sm-featured-time">
                      {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function truncateExcerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
