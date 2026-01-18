import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import AuthorByline from './AuthorByline'
import ReadingTime from './ReadingTime'
import DisqusCommentCount from '@/components/comments/DisqusCommentCount'

interface ArticleCardProps {
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

export default function ArticleCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
  content,
  className = '',
}: ArticleCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-zinc-900/10 dark:bg-zinc-900 dark:hover:shadow-zinc-900/50 ${className}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8B0000]/0 to-[#FF0000]/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:from-[#8B0000]/20 group-hover:to-[#FF0000]/20 group-hover:opacity-100" />

      <div className="relative">
        {/* Featured Image */}
        <Link
          href={`/${category.slug}/${slug}`}
          className="relative block aspect-video overflow-hidden"
        >
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
              <span className="text-4xl font-black text-zinc-400 dark:text-zinc-600">SM</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold leading-tight text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
            <Link href={`/${category.slug}/${slug}`}>{title}</Link>
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="mb-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
            {author && (
              <AuthorByline
                author={author}
                date={publishedAt}
                size="sm"
              />
            )}

            {!author && (
              <time dateTime={publishedAt}>
                {format(new Date(publishedAt), 'MMM d, yyyy')}
              </time>
            )}

            {content && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <ReadingTime content={content} />
              </>
            )}

            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <DisqusCommentCount
              identifier={slug}
              url={`https://sportsmockery.com/${category.slug}/${slug}`}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
