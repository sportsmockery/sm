import Image from 'next/image'
import Link from 'next/link'

interface PremiumArticleCardProps {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  author?: string
  publishedAt: string
  isPremium?: boolean
}

export default function PremiumArticleCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
  isPremium = true,
}: PremiumArticleCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl">
      {/* Animated glow border */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 opacity-0 transition-opacity duration-500 group-hover:opacity-75" />

      {/* Card content */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 group-hover:border-transparent dark:border-zinc-800 dark:bg-zinc-900">
        {/* Image */}
        {featuredImage && (
          <Link href={`/${category.slug}/${slug}`}>
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={featuredImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Premium badge */}
              {isPremium && (
                <div className="absolute right-3 top-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/25">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </span>
                </div>
              )}

              {/* Category on image */}
              <div className="absolute bottom-3 left-3">
                <Link
                  href={`/${category.slug}`}
                  className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur-sm transition-colors hover:bg-white"
                >
                  {category.name}
                </Link>
              </div>
            </div>
          </Link>
        )}

        {/* Text content */}
        <div className="p-5">
          <Link href={`/${category.slug}/${slug}`}>
            <h2 className="text-lg font-bold leading-tight text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100 dark:group-hover:text-orange-400">
              {title}
            </h2>
          </Link>

          {excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
            {author && (
              <>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{author}</span>
                <span>•</span>
              </>
            )}
            <time dateTime={publishedAt}>
              {new Date(publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
        </div>

        {/* Bottom glow effect on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </article>
  )
}
