import ArticleCard from './ArticleCard'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  publishedAt: string
}

interface RelatedArticlesProps {
  categoryName: string
  categorySlug: string
  posts: RelatedPost[]
}

export default function RelatedArticles({
  categoryName,
  categorySlug,
  posts,
}: RelatedArticlesProps) {
  if (posts.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* Section header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#FF0000] to-[#8B0000]" />
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
          More from {categoryName}
        </h2>
      </div>

      {/* Articles grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ArticleCard
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              featuredImage={post.featuredImage}
              category={{
                name: categoryName,
                slug: categorySlug,
              }}
              publishedAt={post.publishedAt}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
