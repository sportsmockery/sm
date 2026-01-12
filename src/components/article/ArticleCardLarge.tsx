import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import CategoryBadge from './CategoryBadge'
import AuthorByline from './AuthorByline'
import ReadingTime from './ReadingTime'

interface ArticleCardLargeProps {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  author?: {
    id: string
    name: string
    avatarUrl?: string
  }
  publishedAt: string
  content?: string
  className?: string
}

export default function ArticleCardLarge({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
  content,
  className = '',
}: ArticleCardLargeProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/10 dark:bg-zinc-900 dark:hover:shadow-zinc-900/50 ${className}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8B0000]/0 to-[#FF0000]/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:from-[#8B0000]/20 group-hover:to-[#FF0000]/20 group-hover:opacity-100" />

      <div className="relative flex flex-col md:flex-row">
        {/* Featured Image - Left side */}
        <Link
          href={`/${category.slug}/${slug}`}
          className="relative block aspect-video md:aspect-[4/3] md:w-1/2 overflow-hidden"
        >
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
              <span className="text-6xl font-black text-zinc-400 dark:text-zinc-600">SM</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block hidden" />
        </Link>

        {/* Content - Right side */}
        <div className="flex flex-col justify-center p-6 md:w-1/2">
          {/* Category Badge */}
          <div className="mb-3">
            <CategoryBadge slug={category.slug} name={category.name} />
          </div>

          {/* Title */}
          <h3 className="mb-3 font-heading text-xl font-bold leading-tight text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666] md:text-2xl lg:text-3xl">
            <Link href={`/${category.slug}/${slug}`}>{title}</Link>
          </h3>

          {/* Full Excerpt */}
          {excerpt && (
            <p className="mb-4 text-zinc-600 dark:text-zinc-400 md:text-lg">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
            {author && (
              <AuthorByline
                author={author}
                date={publishedAt}
                size="md"
              />
            )}

            {!author && (
              <time dateTime={publishedAt}>
                {format(new Date(publishedAt), 'MMMM d, yyyy')}
              </time>
            )}

            {content && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <ReadingTime content={content} />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
