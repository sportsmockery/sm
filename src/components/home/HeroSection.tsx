import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import TeamColorBadge from '@/components/ui/TeamColorBadge'

interface HeroArticle {
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
    avatar_url?: string
  }
}

interface HeroSectionProps {
  article: HeroArticle
  className?: string
}

export default function HeroSection({ article, className = '' }: HeroSectionProps) {
  const readingTime = Math.ceil((article.excerpt?.length || 200) / 200)

  return (
    <section className={`relative overflow-hidden ${className}`}>
      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="group block"
      >
        {/* Background Image */}
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
            <div className="mx-auto max-w-6xl animate-slide-up">
              {/* Category badge */}
              <TeamColorBadge team={article.category.slug} size="md" className="mb-4">
                {article.category.name}
              </TeamColorBadge>

              {/* Title */}
              <h1 className="mb-4 max-w-4xl font-heading text-2xl font-black text-white transition-colors group-hover:text-[#FF6666] sm:text-4xl lg:text-5xl xl:text-6xl">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="mb-6 hidden max-w-2xl text-lg text-zinc-300 sm:block">
                  {article.excerpt.slice(0, 150)}...
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                {/* Author */}
                {article.author && (
                  <div className="flex items-center gap-2">
                    {article.author.avatar_url ? (
                      <Image
                        src={article.author.avatar_url}
                        alt={article.author.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B0000] text-sm font-bold text-white">
                        {article.author.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-white">{article.author.name}</span>
                  </div>
                )}

                {/* Date */}
                <span>
                  {format(new Date(article.published_at), 'MMM d, yyyy')}
                </span>

                {/* Reading time */}
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}
