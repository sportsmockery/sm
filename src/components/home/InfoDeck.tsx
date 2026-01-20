import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/lib/homepage-data'

interface InfoDeckProps {
  primaryStory: Post
  supportStories: Post[]
  headlines: Post[]
}

/**
 * InfoDeck - Above-the-fold content deck
 * Clean, modern design without team colors on headlines
 */
export function InfoDeck({
  primaryStory,
  supportStories,
  headlines,
}: InfoDeckProps) {
  return (
    <section className="sm-section sm-hero-region">
      <div className="sm-container sm-container--wide">
        <div className="sm-info-deck sm-info-deck--two-col">
          {/* Primary Story Column */}
          <PrimaryColumn primaryStory={primaryStory} supportStories={supportStories} />

          {/* Headlines Column */}
          <HeadlinesColumn headlines={headlines} />
        </div>
      </div>
    </section>
  )
}

function PrimaryColumn({ primaryStory, supportStories }: { primaryStory: Post; supportStories: Post[] }) {
  return (
    <div className="sm-deck-col sm-deck-col--primary">
      {/* Main Story Card */}
      <article className="sm-primary-card">
        <Link href={`/${primaryStory.category.slug}/${primaryStory.slug}`} className="sm-primary-image-link">
          {primaryStory.featured_image && (
            <div className="sm-primary-image">
              <Image
                src={primaryStory.featured_image}
                alt=""
                fill
                className="object-cover"
                priority
              />
              <div className="sm-primary-overlay" />
            </div>
          )}
          <div className="sm-primary-content">
            <span className="sm-primary-category">{primaryStory.category.name}</span>
            <h1 className="sm-primary-headline">{primaryStory.title}</h1>
            {primaryStory.excerpt && (
              <p className="sm-primary-excerpt">{primaryStory.excerpt}</p>
            )}
            <div className="sm-primary-meta">
              <span>{primaryStory.author?.name || 'Staff'}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(primaryStory.published_at), { addSuffix: true })}</span>
            </div>
          </div>
        </Link>
      </article>

      {/* Support Stories */}
      <div className="sm-support-grid">
        {supportStories.map((post) => (
          <Link
            key={post.id}
            href={`/${post.category.slug}/${post.slug}`}
            className="sm-support-card"
          >
            {post.featured_image && (
              <div className="sm-support-image">
                <Image
                  src={post.featured_image}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="sm-support-content">
              <span className="sm-support-category">{post.category.name}</span>
              <h3 className="sm-support-title">{post.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function HeadlinesColumn({ headlines }: { headlines: Post[] }) {
  return (
    <aside className="sm-deck-col sm-deck-col--headlines">
      <div className="sm-headlines-box">
        <h2 className="sm-headlines-header">Top Stories</h2>
        <ol className="sm-headlines-list">
          {headlines.map((post, index) => (
            <li key={post.id} className="sm-headline-item">
              <span className="sm-headline-number">{index + 1}</span>
              <Link href={`/${post.category.slug}/${post.slug}`} className="sm-headline-link">
                {post.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  )
}
