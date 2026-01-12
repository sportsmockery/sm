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
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            <svg
              className="h-4 w-4 text-[#8B0000] dark:text-[#FF6666]"
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
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B0000]/10 text-xs font-bold text-[#8B0000] dark:bg-[#FF6666]/10 dark:text-[#FF6666]">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                      {post.title}
                    </h4>
                    <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
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
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            <svg
              className="h-4 w-4 text-[#8B0000] dark:text-[#FF6666]"
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
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8B0000] to-[#FF6666] text-sm font-bold text-white">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                      {author.name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            <svg
              className="h-4 w-4 text-[#8B0000] dark:text-[#FF6666]"
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
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {category.name}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {category.post_count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ad Placeholder */}
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Advertisement
        </p>
      </div>
    </aside>
  )
}
