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
    <article className="group bg-white">
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
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center">
                <span className="text-4xl font-black text-zinc-400">SM</span>
              </div>
            )}
          </div>
          {/* Category tag - fixed position bottom-left, consistent alignment */}
          <div className="absolute -bottom-2 left-3 z-10">
            <span
              className="inline-flex items-center justify-center bg-[#bc0000] text-white text-[10px] font-bold uppercase tracking-[0.5px] px-3 py-1 rounded-sm min-w-[60px] text-center whitespace-nowrap"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {formatCategoryName(article.category.slug)}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="pt-2 px-0 pb-4">
          {/* Headline per spec: Montserrat 700, 18-20px, #222, hover: #bc0000 + underline */}
          <h3
            className="text-[18px] font-bold text-[#222222] leading-[1.3] line-clamp-3 group-hover:text-[#bc0000] group-hover:underline decoration-1 underline-offset-2 transition-colors"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: processIconShortcodes(article.title) }}
          />
          {/* Metadata per spec: 12-13px, #999999, "Author Name • Month Day, Year" */}
          <p className="mt-2 text-[12px] text-[#999999]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
