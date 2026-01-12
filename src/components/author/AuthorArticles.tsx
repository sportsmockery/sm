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
                ? 'bg-[#8B0000] text-white dark:bg-[#FF6666]'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            All ({categories.reduce((sum, c) => sum + c.count, 0)})
          </a>
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/author/${authorId}?category=${cat.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-[#8B0000] text-white dark:bg-[#FF6666]'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
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
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-400">
            No articles found in this category.
          </p>
        </div>
      )}
    </div>
  )
}
