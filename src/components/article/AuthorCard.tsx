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
      className={`glass-card glass-card-static ${className}`}
      style={{ padding: '28px' }}
    >
      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div
          style={{
            position: 'relative',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid var(--sm-red)',
            flexShrink: 0,
          }}
        >
          {author.avatar_url ? (
            <Image
              src={author.avatar_url}
              alt={author.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--sm-red), var(--sm-red-light))',
                color: '#ffffff',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Name and title */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--sm-text)',
            margin: 0,
          }}
        >
          {author.name}
        </h3>
        {author.title && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              color: 'var(--sm-red)',
              marginTop: '4px',
            }}
          >
            {author.title}
          </p>
        )}
      </div>

      {/* Bio */}
      {author.bio && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--sm-text-muted)',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          {author.bio}
        </p>
      )}

      {/* Stats */}
      {postCount !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <span
            className="sm-tag"
            style={{ fontSize: '13px' }}
          >
            {postCount} {postCount === 1 ? 'Article' : 'Articles'}
          </span>
        </div>
      )}

      {/* Social links */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        {author.twitter_url && (
          <a
            href={author.twitter_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              width: '40px',
              height: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'var(--sm-surface)',
              color: 'var(--sm-text-muted)',
              border: '1px solid var(--sm-border)',
              transition: 'all 0.2s ease',
            }}
            aria-label={`Follow ${author.name} on Twitter`}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1DA1F2'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.borderColor = '#1DA1F2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--sm-surface)'
              e.currentTarget.style.color = 'var(--sm-text-muted)'
              e.currentTarget.style.borderColor = 'var(--sm-border)'
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        )}
        {author.email && (
          <a
            href={`mailto:${author.email}`}
            style={{
              display: 'flex',
              width: '40px',
              height: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'var(--sm-surface)',
              color: 'var(--sm-text-muted)',
              border: '1px solid var(--sm-border)',
              transition: 'all 0.2s ease',
            }}
            aria-label={`Email ${author.name}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sm-red)'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.borderColor = 'var(--sm-red)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--sm-surface)'
              e.currentTarget.style.color = 'var(--sm-text-muted)'
              e.currentTarget.style.borderColor = 'var(--sm-border)'
            }}
          >
            <svg
              width="20"
              height="20"
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
        className="btn-primary btn-sm btn-full"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: 'var(--sm-radius-md)',
        }}
      >
        View All Posts
      </Link>
    </div>
  )
}
