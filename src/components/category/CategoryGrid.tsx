import Link from 'next/link'
import Image from 'next/image'
import { processIconShortcodes } from '@/lib/shortcodes'

interface GridArticle {
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
  author: {
    name: string
    slug: string
    avatar_url?: string
  }
}

interface CategoryGridProps {
  articles: GridArticle[]
  className?: string
}

// Format date for display - per spec: "Month Day, Year"
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Format category slug to display name
function formatCategoryName(slug: string | undefined | null): string {
  if (!slug) return 'NEWS'
  const name = slug.replace('chicago-', '').replace(/-/g, ' ')
  return name.toUpperCase()
}

// Article card component per design spec section 6
function ArticleCard({ article }: { article: GridArticle }) {
  return (
    <article className="group" style={{ backgroundColor: 'var(--card-bg)' }}>
      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="block"
      >
        {/* Image container with overflow visible for badge - 70% aspect ratio per spec */}
        <div className="relative w-full pb-[70%] mb-3">
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            {article.featured_image ? (
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--bg-surface), var(--border-color))' }}>
                <span className="text-4xl font-black" style={{ color: 'var(--text-muted)' }}>SM</span>
              </div>
            )}
          </div>
          {/* Category tag - fixed position bottom-left, consistent alignment */}
          <div className="absolute -bottom-2 left-3 z-10">
            <span
              className="inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.5px] px-3 py-1 rounded-sm min-w-[60px] text-center whitespace-nowrap"
              style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}
            >
              {formatCategoryName(article.category.slug)}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="pt-2 px-0 pb-4">
          {/* Headline per spec: Montserrat 700, 18-20px, hover: link-color + underline */}
          <h3
            className="text-[18px] font-bold leading-[1.3] line-clamp-3 group-hover:underline decoration-1 underline-offset-2 transition-colors"
            style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: processIconShortcodes(article.title) }}
          />
          {/* Metadata per spec: 12-13px, "Author Name • Month Day, Year" */}
          <p className="mt-2 text-[12px]" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-muted)' }}>
            {article.author?.name || 'Staff'} • {formatDate(article.published_at)}
          </p>
        </div>
      </Link>
    </article>
  )
}

export default function CategoryGrid({ articles, className = '' }: CategoryGridProps) {
  if (articles.length === 0) return null

  return (
    <div
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
