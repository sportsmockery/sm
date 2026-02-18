import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface TrendingPost {
  id: number
  title: string
  slug: string
  featured_image?: string
  published_at: string
  views?: number
  category: {
    name: string
    slug: string
  }
}

interface PopularAuthor {
  id: number
  name: string
  slug: string
  avatar_url?: string
  post_count: number
}

interface RelatedCategory {
  id: number
  name: string
  slug: string
  post_count: number
}

interface CategorySidebarProps {
  trendingPosts?: TrendingPost[]
  popularAuthors?: PopularAuthor[]
  relatedCategories?: RelatedCategory[]
  className?: string
}

export default function CategorySidebar({
  trendingPosts = [],
  popularAuthors = [],
  relatedCategories = [],
  className = '',
}: CategorySidebarProps) {
  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Trending in Category */}
      {trendingPosts.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text)' }}>
            <svg
              className="h-4 w-4"
              style={{ color: 'var(--sm-accent)' }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
            Trending
          </h3>

          <ul className="space-y-4">
            {trendingPosts.map((post, index) => (
              <li key={post.id}>
                <Link
                  href={`/${post.category.slug}/${post.slug}`}
                  className="group flex gap-3"
                >
                  {/* Rank number */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--sm-accent) 10%, transparent)', color: 'var(--sm-accent)' }}>
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-[var(--sm-accent)]" style={{ color: 'var(--sm-text)' }}>
                      {post.title}
                    </h4>
                    <p className="mt-1 flex items-center gap-2 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                      <time dateTime={post.published_at}>
                        {format(new Date(post.published_at), 'MMM d')}
                      </time>
                      {post.views && (
                        <>
                          <span>•</span>
                          <span>{post.views.toLocaleString()} views</span>
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popular Authors */}
      {popularAuthors.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text)' }}>
            <svg
              className="h-4 w-4"
              style={{ color: 'var(--sm-accent)' }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            Top Writers
          </h3>

          <ul className="space-y-3">
            {popularAuthors.map((author) => (
              <li key={author.id}>
                <Link
                  href={`/author/${author.slug}`}
                  className="group flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    {author.avatar_url ? (
                      <Image
                        src={author.avatar_url}
                        alt={author.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(to bottom right, var(--sm-accent), #FF6666)' }}>
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold transition-colors group-hover:text-[var(--sm-accent)]" style={{ color: 'var(--sm-text)' }}>
                      {author.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                      {author.post_count} articles
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text)' }}>
            <svg
              className="h-4 w-4"
              style={{ color: 'var(--sm-accent)' }}
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
            Other Teams
          </h3>

          <ul className="space-y-2">
            {relatedCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${category.slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:brightness-95"
                  style={{ color: 'var(--sm-text)' }}
                >
                  <span className="font-medium" style={{ color: 'var(--sm-text)' }}>
                    {category.name}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                    {category.post_count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ad Placeholder */}
      <div className="rounded-2xl border-dashed p-8 text-center" style={{ border: '1px dashed var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>
          Advertisement
        </p>
      </div>
    </aside>
  )
}
