import AuthorCard from './AuthorCard'

interface Author {
  id: number
  name: string
  slug?: string
  avatar_url?: string
  bio?: string
  post_count: number
}

interface AuthorsGridProps {
  authors: Author[]
  className?: string
}

export default function AuthorsGrid({ authors, className = '' }: AuthorsGridProps) {
  if (authors.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <p style={{ color: 'var(--sm-text-muted)' }}>No authors found.</p>
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {authors.map((author) => (
        <AuthorCard
          key={author.id}
          id={author.id}
          name={author.name}
          slug={author.slug}
          avatar_url={author.avatar_url}
          bio={author.bio}
          post_count={author.post_count}
        />
      ))}
    </div>
  )
}
