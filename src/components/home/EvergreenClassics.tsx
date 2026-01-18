import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/lib/homepage-data'

interface EvergreenClassicsProps {
  posts: Post[]
}

/**
 * EvergreenClassics - Chicago Classics section
 *
 * GUARANTEE: Always renders 4 cards.
 * Timeless content that's always relevant.
 */
export function EvergreenClassics({ posts }: EvergreenClassicsProps) {
  const displayPosts = posts.slice(0, 4)

  return (
    <section className="sm-section sm-evergreen-section">
      <div className="sm-container">
        <header className="sm-section-header">
          <h2 className="sm-section-title">Chicago Classics</h2>
          <p className="sm-section-subtitle">The deep dives, explainers, and stories that never get old.</p>
        </header>

        <div className="sm-evergreen-grid">
          {displayPosts.map((post) => (
            <article key={post.id} className="sm-evergreen-card">
              {post.featured_image && (
                <div className="sm-evergreen-image">
                  <Image
                    src={post.featured_image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="sm-evergreen-img"
                  />
                </div>
              )}
              <div className="sm-evergreen-content">
                <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)} sm-tag--small`}>
                  {post.category.name.toUpperCase()}
                </span>
                <Link href={`/${post.category.slug}/${post.slug}`}>
                  <h3 className="sm-evergreen-title">{post.title}</h3>
                </Link>
                <div className="sm-evergreen-meta">
                  <span className="sm-evergreen-read">{post.readTime || 8} min read</span>
                  <span className="sm-evergreen-type">Deep Dive</span>
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
