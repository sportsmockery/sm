import AuthorCard from './AuthorCard'
import TableOfContents from './TableOfContents'
import ArticleList from './ArticleList'

interface Author {
  id: string
  name: string
  avatarUrl?: string
  bio?: string
  twitter?: string
  email?: string
}

interface RelatedPost {
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

interface ArticleSidebarProps {
  author?: Author
  content?: string
  relatedPosts?: RelatedPost[]
  showTableOfContents?: boolean
  showAuthor?: boolean
  showRelated?: boolean
  showAd?: boolean
  className?: string
}

export default function ArticleSidebar({
  author,
  content,
  relatedPosts = [],
  showTableOfContents = true,
  showAuthor = true,
  showRelated = true,
  showAd = true,
  className = '',
}: ArticleSidebarProps) {
  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Author Card */}
      {showAuthor && author && (
        <AuthorCard
          author={{
            id: parseInt(author.id) || 0,
            name: author.name,
            slug: author.name.toLowerCase().replace(/\s+/g, '-'),
            avatar_url: author.avatarUrl,
            bio: author.bio,
            twitter_url: author.twitter,
            email: author.email,
          }}
        />
      )}

      {/* Table of Contents */}
      {showTableOfContents && content && (
        <TableOfContents content={content} />
      )}

      {/* Related Articles */}
      {showRelated && relatedPosts.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <ArticleList
            articles={relatedPosts}
            title="Related Articles"
          />
        </div>
      )}

      {/* Ad Placeholder */}
      {showAd && (
        <div className="flex h-[250px] items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
              Advertisement
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">300x250</p>
          </div>
        </div>
      )}
    </aside>
  )
}
