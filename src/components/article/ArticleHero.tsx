import Image from 'next/image'
import CategoryBadge from './CategoryBadge'
import AuthorByline from './AuthorByline'
import ReadingTime from './ReadingTime'

interface ArticleHeroProps {
  title: string
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

export default function ArticleHero({
  title,
  featuredImage,
  category,
  author,
  publishedAt,
  content,
  className = '',
}: ArticleHeroProps) {
  return (
    <header className={`relative ${className}`}>
      {/* Full-width featured image */}
      <div className="relative h-[50vh] min-h-[400px] w-full lg:h-[60vh]">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #27272a, #18181b)' }}>
            <span className="text-8xl font-black" style={{ color: '#3f3f46' }}>SM</span>
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="mx-auto w-full max-w-4xl px-4 pb-8 lg:pb-12">
            {/* Category Badge - top left */}
            <div className="mb-4">
              <CategoryBadge slug={category.slug} name={category.name} size="md" />
            </div>

            {/* Title - large white text */}
            <h1 className="mb-4 font-heading text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            {/* Author, date, reading time below title */}
            <div className="flex flex-wrap items-center gap-4 text-zinc-300">
              {author && (
                <AuthorByline
                  author={author}
                  date={publishedAt}
                  size="md"
                  className="text-white [&_a]:text-white [&_a:hover]:text-zinc-300 [&_time]:text-zinc-400"
                />
              )}

              {content && (
                <>
                  <span className="text-zinc-500">•</span>
                  <ReadingTime content={content} className="text-zinc-400" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
