import Link from 'next/link'
import Image from 'next/image'
import { processIconShortcodes } from '@/lib/shortcodes'
import { CommentCountBadge } from '@/components/article/CommentCount'

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

// Format date for display
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Article card component - Athletic-style clean design
function ArticleCard({ article }: { article: GridArticle }) {
  return (
    <article className="group">
      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="block"
      >
        {/* Image container - 16:10 aspect ratio */}
        <div className="relative w-full pb-[62.5%] mb-3 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
              <span className="text-3xl font-black text-white/20">SM</span>
            </div>
          )}
          {/* Comment count badge */}
          <CommentCountBadge
            articleUrl={`https://sportsmockery.com/${article.category.slug}/${article.slug}`}
            articleId={article.id}
          />
        </div>

        {/* Content area */}
        <div className="pt-1">
          {/* Category - subtle red text */}
          <span
            className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1 block"
            style={{ fontFamily: "'Montserrat', sans-serif", color: '#bc0000' }}
          >
            {article.category.name}
          </span>
          {/* Headline */}
          <h3
            className="text-[17px] font-bold leading-[1.3] line-clamp-3 transition-colors"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--text-primary)',
            }}
            dangerouslySetInnerHTML={{ __html: processIconShortcodes(article.title) }}
          />
          {/* Metadata */}
          <p
            className="mt-2 text-[12px] flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>{article.author?.name || 'Staff'}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{formatDate(article.published_at)}</span>
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
