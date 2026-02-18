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
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <ArticleList
            articles={relatedPosts}
            title="Related Articles"
          />
        </div>
      )}

      {/* Ad Placeholder */}
      {showAd && (
        <div className="flex h-[250px] items-center justify-center rounded-2xl" style={{ border: '1px dashed var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--sm-text-dim)' }}>
              Advertisement
            </p>
            <p className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>300x250</p>
          </div>
        </div>
      )}
    </aside>
  )
}
