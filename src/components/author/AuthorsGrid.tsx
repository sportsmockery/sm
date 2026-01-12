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
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-zinc-500 dark:text-zinc-400">No authors found.</p>
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
