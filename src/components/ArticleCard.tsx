import Image from 'next/image'
import Link from 'next/link'
import { getTeamColor } from '@/styles/theme'

interface ArticleCardProps {
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
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
}: ArticleCardProps) {
  const teamColor = getTeamColor(category.slug)
  const badgeColor = teamColor?.primary || '#8B0000'
  const accentColor = teamColor?.primary || '#FF0000'

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Colored accent line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ backgroundColor: accentColor }}
      />

      {featuredImage && (
        <Link href={`/${category.slug}/${slug}`}>
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Category badge floating on image */}
            <div className="absolute bottom-3 left-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <span
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-full shadow-lg"
                style={{ backgroundColor: badgeColor }}
              >
                {category.name}
              </span>
            </div>

            {/* Read indicator */}
            <div className="absolute bottom-3 right-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="p-5">
        {/* Category badge (visible when no image or always on mobile) */}
        {!featuredImage && (
          <Link
            href={`/${category.slug}`}
            className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-full transition-transform hover:scale-105 shadow-sm"
            style={{ backgroundColor: badgeColor }}
          >
            {category.name}
          </Link>
        )}

        <Link href={`/${category.slug}/${slug}`}>
          <h2 className="mt-3 text-lg font-bold text-zinc-900 line-clamp-2 transition-colors duration-300 group-hover:text-[#8B0000] dark:text-zinc-100 dark:group-hover:text-[#ff6b6b] font-[var(--font-montserrat)]">
            {title}
          </h2>
        </Link>

        {excerpt && (
          <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {excerpt}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            {author && (
              <>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white uppercase">
                    {author.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{author}</span>
              </>
            )}
          </div>
          <time dateTime={publishedAt} className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }}
      />
    </article>
  )
}
