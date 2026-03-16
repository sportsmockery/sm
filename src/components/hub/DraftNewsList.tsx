import Link from 'next/link'
import Image from 'next/image'
import type { TeamSlug } from '@/types/hub'

export interface DraftNewsPost {
  id: number | string
  title: string
  slug: string
  categorySlug?: string
  featuredImage?: string | null
  publishedAt: string
  author?: { displayName: string } | null
}

interface DraftNewsListProps {
  posts: DraftNewsPost[]
  teamSlug: TeamSlug
}

export default function DraftNewsList({ posts, teamSlug }: DraftNewsListProps) {
  if (posts.length === 0) return null

  return (
    <section>
      <h2
        style={{
          color: 'var(--sm-text)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          paddingBottom: '8px',
          borderBottom: '3px solid var(--sm-red)',
          margin: '0 0 20px 0',
        }}
      >
        Latest Draft News
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post) => {
          const href = post.categorySlug
            ? `/${post.categorySlug}/${post.slug}`
            : `/${teamSlug}/${post.slug}`
          return (
            <Link key={post.id} href={href} style={{ textDecoration: 'none', display: 'block' }}>
              <article
                className="glass-card glass-card-sm"
                style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}
              >
                {post.featuredImage && (
                  <div
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      flexShrink: 0,
                      borderRadius: 'var(--sm-radius-sm)',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={post.featuredImage}
                      alt=""
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      color: 'var(--sm-text)',
                      fontSize: '15px',
                      fontWeight: 600,
                      lineHeight: 1.4,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.title}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      fontSize: '12px',
                      color: 'var(--sm-text-dim)',
                    }}
                  >
                    <span>{post.author?.displayName || 'Staff'}</span>
                    <span>-</span>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
