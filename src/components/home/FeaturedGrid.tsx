import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import TeamColorBadge from '@/components/ui/TeamColorBadge'
import GlowCard from '@/components/ui/GlowCard'

interface FeaturedArticle {
  id: number
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

interface FeaturedGridProps {
  articles: FeaturedArticle[]
  className?: string
}

export default function FeaturedGrid({ articles, className = '' }: FeaturedGridProps) {
  if (articles.length === 0) return null

  const [main, ...secondary] = articles.slice(0, 4)

  return (
    <section className={className}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main featured article */}
        {main && (
          <Link
            href={`/${main.category.slug}/${main.slug}`}
            className="group relative overflow-hidden rounded-2xl"
          >
            <GlowCard className="h-full">
              <div className="relative aspect-[4/3]">
                {main.featured_image ? (
                  <Image
                    src={main.featured_image}
                    alt={main.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: 'linear-gradient(to bottom right, var(--sm-surface), var(--sm-border))' }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <TeamColorBadge team={main.category.slug} size="sm" className="mb-3 w-fit">
                    {main.category.name}
                  </TeamColorBadge>
                  <h3 className="mb-2 font-heading text-xl font-bold text-white transition-colors group-hover:text-[#FF6666] sm:text-2xl lg:text-3xl">
                    {main.title}
                  </h3>
                  {main.excerpt && (
                    <p className="mb-3 line-clamp-2 text-sm text-zinc-300">
                      {main.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    {main.author && <span>{main.author.name}</span>}
                    <span>{format(new Date(main.published_at), 'MMM d')}</span>
                  </div>
                </div>
              </div>
            </GlowCard>
          </Link>
        )}

        {/* Secondary articles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
          {secondary.map((article) => (
            <Link
              key={article.id}
              href={`/${article.category.slug}/${article.slug}`}
              className="group"
            >
              <GlowCard className="flex h-full gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full" style={{ background: 'linear-gradient(to bottom right, var(--sm-surface), var(--sm-border))' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-center">
                  <TeamColorBadge team={article.category.slug} size="sm" className="mb-2 w-fit">
                    {article.category.name}
                  </TeamColorBadge>
                  <h4 className="line-clamp-2 font-semibold transition-colors" style={{ color: 'var(--sm-text)' }}>
                    {article.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                    {article.author && <span>{article.author.name}</span>}
                    <span>•</span>
                    <span>{format(new Date(article.published_at), 'MMM d')}</span>
                  </div>
                </div>
              </GlowCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
