import ArticleCard from '@/components/article/ArticleCard'
import Pagination from '@/components/category/Pagination'

interface Article {
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

interface AuthorArticlesProps {
  articles: Article[]
  authorId: number | string
  currentPage: number
  totalPages: number
  selectedCategory?: string
  categories?: { name: string; slug: string; count: number }[]
  className?: string
}

export default function AuthorArticles({
  articles,
  authorId,
  currentPage,
  totalPages,
  selectedCategory,
  categories = [],
  className = '',
}: AuthorArticlesProps) {
  return (
    <div className={className}>
      {/* Category filter tabs */}
      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href={`/author/${authorId}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-[#BC0000] text-white'
                : ''
            }`}
            style={selectedCategory ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : undefined}
          >
            All ({categories.reduce((sum, c) => sum + c.count, 0)})
          </a>
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/author/${authorId}?category=${cat.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-[#BC0000] text-white'
                  : ''
              }`}
              style={selectedCategory !== cat.slug ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' } : undefined}
            >
              {cat.name} ({cat.count})
            </a>
          ))}
        </div>
      )}

      {/* Articles grid */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                slug={article.slug}
                excerpt={article.excerpt}
                featuredImage={article.featured_image}
                publishedAt={article.published_at}
                category={article.category}
                author={{
                  id: article.author.slug,
                  name: article.author.name,
                  avatarUrl: article.author.avatar_url,
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/author/${authorId}${selectedCategory ? `?category=${selectedCategory}` : ''}`}
            className="mt-12"
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No articles found in this category.
          </p>
        </div>
      )}
    </div>
  )
}
