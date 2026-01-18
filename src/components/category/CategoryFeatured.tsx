import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface FeaturedPost {
  id: number
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  author?: {
    name: string
    slug?: string
  }
  category: {
    name: string
    slug: string
  }
}

interface CategoryFeaturedProps {
  posts: FeaturedPost[]
  className?: string
}

export default function CategoryFeatured({
  posts,
  className = '',
}: CategoryFeaturedProps) {
  if (posts.length === 0) return null

  const [mainPost, ...sidePosts] = posts.slice(0, 3)

  return (
    <section className={className}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main featured post */}
        {mainPost && (
          <Link
            href={`/${mainPost.category.slug}/${mainPost.slug}`}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="aspect-[4/3] lg:aspect-[16/10]">
              {mainPost.featured_image ? (
                <Image
                  src={mainPost.featured_image}
                  alt={mainPost.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
              )}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              {/* Featured badge */}
              <span className="mb-3 inline-block w-fit rounded-full bg-[#8B0000] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Featured
              </span>

              <h2 className="mb-2 font-heading text-lg font-black leading-tight text-white transition-colors group-hover:text-[#FF6666] sm:text-xl md:text-2xl lg:text-3xl">
                {mainPost.title}
              </h2>

              {mainPost.excerpt && (
                <p className="mb-4 line-clamp-2 text-xs text-zinc-300 sm:text-sm md:text-base">
                  {mainPost.excerpt}
                </p>
              )}

              <div className="flex items-center gap-3 text-sm text-zinc-400">
                {mainPost.author && (
                  <>
                    <span className="font-medium text-white">
                      {mainPost.author.name}
                    </span>
                    <span>•</span>
                  </>
                )}
                <time dateTime={mainPost.published_at}>
                  {format(new Date(mainPost.published_at), 'MMM d, yyyy')}
                </time>
              </div>
            </div>
          </Link>
        )}

        {/* Side featured posts */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {sidePosts.map((post) => (
            <Link
              key={post.id}
              href={`/${post.category.slug}/${post.slug}`}
              className="group flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-[#8B0000]/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#FF6666]/30"
            >
              {/* Thumbnail */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-32">
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
                )}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                  {post.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {post.author && (
                    <>
                      <span>{post.author.name}</span>
                      <span>•</span>
                    </>
                  )}
                  <time dateTime={post.published_at}>
                    {format(new Date(post.published_at), 'MMM d')}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
