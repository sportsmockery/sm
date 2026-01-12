import ArticleCard from '@/components/article/ArticleCard'

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

export default function CategoryGrid({ articles, className = '' }: CategoryGridProps) {
  if (articles.length === 0) return null

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
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
  )
}
