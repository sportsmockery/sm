import Image from 'next/image'
import Link from 'next/link'
import { getTeamColor } from '@/styles/theme'

interface FeaturedPostProps {
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

export default function FeaturedPost({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
}: FeaturedPostProps) {
  const teamColor = getTeamColor(category.slug)
  const badgeColor = teamColor?.primary || '#8B0000'

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-zinc-900">
      {featuredImage && (
        <Link href={`/${category.slug}/${slug}`}>
          <div className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden">
            <Image
              src={featuredImage}
              alt={title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        </Link>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <Link
          href={`/${category.slug}`}
          className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-full transition-transform hover:scale-105"
          style={{ backgroundColor: badgeColor }}
        >
          {category.name}
        </Link>

        <Link href={`/${category.slug}/${slug}`}>
          <h2 className="mt-4 text-2xl md:text-4xl font-bold text-white line-clamp-3 transition-colors group-hover:text-zinc-200">
            {title}
          </h2>
        </Link>

        {excerpt && (
          <p className="mt-3 text-sm md:text-base text-zinc-300 line-clamp-2 max-w-3xl">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 text-sm text-zinc-400">
          {author && (
            <>
              <span className="font-medium text-white">{author}</span>
              <span>•</span>
            </>
          )}
          <time dateTime={publishedAt}>
            {new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>
    </article>
  )
}
