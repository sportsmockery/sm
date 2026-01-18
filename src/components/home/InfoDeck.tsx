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
 *
 * GUARANTEE: Always renders both columns with content.
 * Never returns null or empty sections.
 *
 * Layout: Primary Story (left, larger) | Top Headlines (right)
 */
export function InfoDeck({
  primaryStory,
  supportStories,
  headlines,
}: InfoDeckProps) {
  return (
    <section id="hero-region" className="sm-section sm-hero-region">
      <div className="sm-container sm-container--deck">
        <header className="sm-section-header">
          <h2 className="sm-section-title">Chicago Tonight</h2>
          <p className="sm-section-subtitle">The stories shaping the conversation right now.</p>
        </header>

        <div className="sm-info-deck sm-info-deck--two-col">
          {/* COLUMN 1: PRIMARY STORY (Left, Larger) */}
          <PrimaryColumn primaryStory={primaryStory} supportStories={supportStories} />

          {/* COLUMN 2: TOP HEADLINES (Right) */}
          <HeadlinesColumn headlines={headlines} />
        </div>
      </div>
    </section>
  )
}

function PrimaryColumn({ primaryStory, supportStories }: { primaryStory: Post; supportStories: Post[] }) {
  return (
    <section className="sm-deck-col sm-deck-col--primary">
      <article className="sm-primary-card" data-slot="hero-main">
        <div className="sm-primary-card-header">
          <span className={`sm-tag sm-tag--${getTeamClass(primaryStory.category.name)}`}>
            {primaryStory.category.name.toUpperCase()}
          </span>
          <span className="sm-primary-meta">
            {primaryStory.readTime || 5} min read
          </span>
        </div>
        <Link href={`/${primaryStory.category.slug}/${primaryStory.slug}`}>
          <h1 className="sm-primary-headline">{primaryStory.title}</h1>
        </Link>
        {primaryStory.excerpt && (
          <p className="sm-primary-dek">{primaryStory.excerpt}</p>
        )}
        <div className="sm-primary-footer">
          <span className="sm-primary-author">
            By {primaryStory.author?.name || 'Sports Mockery Staff'}
          </span>
          <span className="sm-primary-time">
            Updated {formatDistanceToNow(new Date(primaryStory.published_at), { addSuffix: true })}
          </span>
        </div>

        {primaryStory.featured_image && (
          <div className="sm-primary-media">
            <div className="sm-primary-thumb">
              <Image
                src={primaryStory.featured_image}
                alt=""
                fill
                className="sm-primary-thumb-img"
              />
            </div>
            <Link href={`/${primaryStory.category.slug}/${primaryStory.slug}`} className="sm-chip sm-chip--ghost">
              Read full story
            </Link>
          </div>
        )}
      </article>

      {/* TWO SUPPORTING MICRO-CARDS */}
      <div className="sm-support-row">
        {supportStories.map((post) => (
          <article key={post.id} className={`sm-support-card sm-support-card--${getTeamClass(post.category.name)}`}>
            <header className="sm-support-header">
              <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)}`}>
                {post.category.name.toUpperCase()}
              </span>
              <span className="sm-support-meta">{post.readTime || 3} min read</span>
            </header>
            <Link href={`/${post.category.slug}/${post.slug}`}>
              <h3 className="sm-support-title">{post.title}</h3>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function HeadlinesColumn({ headlines }: { headlines: Post[] }) {
  return (
    <section id="top-headlines" className="sm-deck-col sm-deck-col--headlines sm-top-headlines">
      <header className="sm-section-header sm-section-header--compact">
        <h2 className="sm-section-title">Top Headlines</h2>
        <p className="sm-section-subtitle">Not just the newest - the most Chicago.</p>
      </header>

      <div className="sm-headlines-box">
        <ol className="sm-headlines-list">
          {headlines.map((post, index) => (
            <li
              key={post.id}
              className="sm-headline-row"
              data-source={getHeadlineSource(index)}
            >
              <span className={`sm-headline-tag sm-headline-tag-${getTeamTagClass(post.category.name)}`}>
                {getCategoryAbbrev(post.category.name)}
              </span>
              <Link className="sm-headline-link" href={`/${post.category.slug}/${post.slug}`}>
                {post.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// Helper Functions
function getTeamClass(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'bears'
  if (name.includes('bulls')) return 'bulls'
  if (name.includes('cubs')) return 'cubs'
  if (name.includes('white sox') || name.includes('sox')) return 'whitesox'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'blackhawks'
  return 'citywide'
}

function getTeamTagClass(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'BEARS'
  if (name.includes('bulls')) return 'BULLS'
  if (name.includes('cubs')) return 'CUBS'
  if (name.includes('white sox') || name.includes('sox')) return 'WHITE-SOX'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'BLACKHAWKS'
  return 'CITYWIDE'
}

function getCategoryAbbrev(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'BEARS'
  if (name.includes('bulls')) return 'BULLS'
  if (name.includes('cubs')) return 'CUBS'
  if (name.includes('white sox') || name.includes('sox')) return 'SOX'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'HAWKS'
  return 'CHI'
}

function getHeadlineSource(index: number): string {
  if (index < 3) return 'LATEST_GLOBAL'
  if (index < 6) return 'EDITOR_PICK'
  if (index < 8) return 'SEASON_ACTIVE'
  if (index === 8) return 'EVERGREEN_TOP'
  return 'PERSONALIZED_OR_BALANCE'
}
