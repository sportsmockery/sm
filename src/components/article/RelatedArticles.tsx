import ArticleCard from './ArticleCard'

interface RelatedArticle {
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

interface RelatedArticlesProps {
  articles: RelatedArticle[]
  categoryName: string
  className?: string
}

export default function RelatedArticles({
  articles,
  categoryName,
  className = '',
}: RelatedArticlesProps) {
  if (articles.length === 0) return null

  return (
    <section className={className}>
      <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-bold text-zinc-900 dark:text-white">
        <svg
          className="h-6 w-6 text-[#8B0000] dark:text-[#FF6666]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        More from {categoryName}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.slice(0, 4).map((article) => (
          <ArticleCard
            key={article.id}
            title={article.title}
            slug={article.slug}
            excerpt={article.excerpt}
            featuredImage={article.featured_image}
            publishedAt={article.published_at}
            category={article.category}
            author={article.author ? {
              id: article.author.slug || '',
              name: article.author.name,
              avatarUrl: article.author.avatar_url,
            } : undefined}
          />
        ))}
      </div>
    </section>
  )
}
