'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  id: number
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  category_id?: number
  category?: {
    name: string
    slug: string
  }
  author?: {
    name: string
  }
}

interface RecentPostsProps {
  posts: Post[]
  className?: string
}

export default function RecentPosts({ posts, className = '' }: RecentPostsProps) {
  const router = useRouter()

  if (posts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-6 ${className}`}>
        <svg className="h-12 w-12 text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-[var(--text-muted)] text-center">
          No posts yet. Create your first post to get started.
        </p>
        <Link
          href="/admin/posts/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Post
        </Link>
      </div>
    )
  }

  return (
    <div className={`divide-y divide-[var(--border-subtle)] ${className}`}>
      {posts.map((post) => {
        const timeAgo = post.created_at
          ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
          : null

        return (
          <Link
            key={post.id}
            href={`/admin/posts/${post.id}`}
            className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--text-primary)] truncate">
                {post.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {post.category && (
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                    {post.category.name}
                  </span>
                )}
                <span className="text-sm text-[var(--text-muted)]">
                  {timeAgo || 'Recently'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={post.status} />
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/admin/posts/${post.id}/edit`)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    published: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500',
      dot: 'bg-emerald-500',
      label: 'Published',
    },
    draft: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      dot: 'bg-amber-500',
      label: 'Draft',
    },
    scheduled: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      dot: 'bg-blue-500',
      label: 'Scheduled',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    bg: 'bg-gray-500/10',
    text: 'text-gray-500',
    dot: 'bg-gray-500',
    label: status,
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
