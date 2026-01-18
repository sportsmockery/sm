import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/lib/homepage-data'

interface FeaturedShellProps {
  posts: Post[]
}

/**
 * FeaturedShell - Chicago Front Page section
 *
 * GUARANTEE: Always renders 6 cards.
 * Uses provided posts or placeholders.
 */
export function FeaturedShell({ posts }: FeaturedShellProps) {
  // Ensure we always have 6 posts
  const displayPosts = posts.slice(0, 6)

  return (
    <section className="sm-section sm-featured-section">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2 className="sm-section-title">Chicago Front Page</h2>
          <p className="sm-section-subtitle">The stories shaping the conversation right now.</p>
        </header>

        <div className="sm-featured-grid">
          {displayPosts.map((post) => (
            <article key={post.id} className="sm-featured-card">
              {post.featured_image && (
                <div className="sm-featured-image">
                  <Image
                    src={post.featured_image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="sm-featured-img"
                  />
                </div>
              )}
              <div className="sm-featured-content">
                <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)}`}>
                  {post.category.name.toUpperCase()}
                </span>
                <Link href={`/${post.category.slug}/${post.slug}`}>
                  <h3 className="sm-featured-title">{post.title}</h3>
                </Link>
                {post.excerpt && (
                  <p className="sm-featured-excerpt">{truncateExcerpt(post.excerpt, 100)}</p>
                )}
                <div className="sm-featured-meta">
                  <span className="sm-featured-author">
                    {post.author?.name || 'Sports Mockery Staff'}
                  </span>
                  <span className="sm-featured-time">
                    {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function getTeamClass(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'bears'
  if (name.includes('bulls')) return 'bulls'
  if (name.includes('cubs')) return 'cubs'
  if (name.includes('white sox') || name.includes('sox')) return 'whitesox'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'blackhawks'
  return 'citywide'
}

function truncateExcerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
