import ArticleCardCompact from './ArticleCardCompact'

interface Article {
  id: string
  title: string
  slug: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  publishedAt: string
}

interface ArticleListProps {
  articles: Article[]
  showNumbers?: boolean
  title?: string
  className?: string
}

export default function ArticleList({
  articles,
  showNumbers = false,
  title,
  className = '',
}: ArticleListProps) {
  if (articles.length === 0) return null

  return (
    <div className={className}>
      {title && (
        <div className="mb-4 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#8B0000] to-[#FF0000]" />
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">
            {title}
          </h3>
        </div>
      )}

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {articles.map((article, index) => (
          <ArticleCardCompact
            key={article.id}
            title={article.title}
            slug={article.slug}
            featuredImage={article.featuredImage}
            category={article.category}
            publishedAt={article.publishedAt}
            index={index}
            showNumber={showNumbers}
            className={index === 0 ? '' : 'pt-3'}
          />
        ))}
      </div>
    </div>
  )
}
