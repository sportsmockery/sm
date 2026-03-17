import Image from 'next/image'
import { format } from 'date-fns'

interface AuthorHeaderProps {
  author: {
    id: number
    name: string
    slug?: string
    avatar_url?: string
    bio?: string
    title?: string
    email?: string
    joined_at?: string
  }
  postCount: number
  totalViews?: number
  className?: string
}

export default function AuthorHeader({
  author,
  postCount,
  totalViews = 0,
  className = '',
}: AuthorHeaderProps) {
  return (
    <header
      className={`relative overflow-hidden py-16 lg:py-24 ${className}`}
      style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}
    >
      {/* Subtle accent gradient */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'linear-gradient(135deg, #BC0000 0%, transparent 50%, #00D4FF 100%)' }} />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
          {/* Avatar */}
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-full lg:h-40 lg:w-40" style={{ boxShadow: '0 0 0 4px rgba(188,0,0,0.3)' }}>
              {author.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-white lg:text-6xl" style={{ backgroundColor: '#BC0000' }}>
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="mb-2 text-3xl font-bold sm:text-4xl lg:text-5xl" style={{ color: 'var(--text-primary)' }}>
              {author.name}
            </h1>
            {author.title && (
              <p className="mb-3 text-lg" style={{ color: '#BC0000' }}>{author.title}</p>
            )}
            {author.bio && (
              <p className="mb-4 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>{author.bio}</p>
            )}

            {/* Stats */}
            <div className="mb-6 flex flex-wrap justify-center gap-6 lg:justify-start">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {postCount.toLocaleString()}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Articles</p>
              </div>
              {totalViews > 0 && (
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Views</p>
                </div>
              )}
              {author.joined_at && (
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(author.joined_at), 'MMM yyyy')}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Joined</p>
                </div>
              )}
            </div>

            {/* Email link */}
            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'rgba(188,0,0,0.1)', color: '#BC0000', border: '1px solid rgba(188,0,0,0.2)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
