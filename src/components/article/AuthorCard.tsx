'use client'

import Image from 'next/image'
import Link from 'next/link'

interface AuthorCardProps {
  author: {
    id: number
    name: string
    slug: string
    avatar_url?: string
    bio?: string
    title?: string
    twitter_url?: string
    email?: string
  }
  postCount?: number
  className?: string
}

export default function AuthorCard({
  author,
  postCount,
  className = '',
}: AuthorCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${className}`}
    >
      {/* Avatar */}
      <div className="mb-4 flex justify-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#8B0000]/30">
          {author.avatar_url ? (
            <Image
              src={author.avatar_url}
              alt={author.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8B0000] to-[#FF6666] text-3xl font-bold text-white">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Name and title */}
      <div className="mb-3 text-center">
        <h3 className="font-heading text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
          {author.name}
        </h3>
        {author.title && (
          <p className="text-sm" style={{ color: 'var(--sm-accent)' }}>
            {author.title}
          </p>
        )}
      </div>

      {/* Bio */}
      {author.bio && (
        <p className="mb-4 text-center text-sm leading-relaxed" style={{ color: 'var(--sm-text-muted)' }}>
          {author.bio}
        </p>
      )}

      {/* Stats */}
      {postCount !== undefined && (
        <div className="mb-4 flex justify-center">
          <div className="rounded-full px-4 py-1.5" style={{ backgroundColor: 'var(--sm-surface)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
              {postCount} {postCount === 1 ? 'Article' : 'Articles'}
            </span>
          </div>
        </div>
      )}

      {/* Social links */}
      <div className="mb-4 flex justify-center gap-3">
        {author.twitter_url && (
          <a
            href={author.twitter_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-[#1DA1F2] hover:text-white"
            style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}
            aria-label={`Follow ${author.name} on Twitter`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        )}
        {author.email && (
          <a
            href={`mailto:${author.email}`}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-[#8B0000] hover:text-white"
            style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}
            aria-label={`Email ${author.name}`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </a>
        )}
      </div>

      {/* View all posts link */}
      <Link
        href={`/author/${author.slug}`}
        className="block w-full rounded-xl border border-[#8B0000]/30 bg-[#8B0000]/10 py-2.5 text-center text-sm font-semibold text-[#8B0000] transition-all hover:bg-[#8B0000] hover:text-white dark:border-[#FF6666]/30 dark:bg-[#FF6666]/10 dark:text-[#FF6666] dark:hover:bg-[#FF6666] dark:hover:text-white"
      >
        View All Posts →
      </Link>
    </div>
  )
}
