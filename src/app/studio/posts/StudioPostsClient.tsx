'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  category_id: string | null
  author_id: string | null
  featured_image: string | null
  excerpt: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Author {
  id: string
  display_name: string
  avatar_url?: string
}

interface StudioPostsClientProps {
  posts: Post[]
  categoryMap: Record<string, Category>
  authorMap: Record<string, Author>
  currentPage: number
  totalPages: number
  status?: string
  search?: string
  isEditor: boolean
}

export default function StudioPostsClient({
  posts,
  categoryMap,
  authorMap,
  currentPage,
  totalPages,
  status,
  search,
  isEditor,
}: StudioPostsClientProps) {
  const statusColors: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-500',
    draft: 'bg-amber-500/10 text-amber-500',
    scheduled: 'bg-blue-500/10 text-blue-500',
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <svg className="h-16 w-16 text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-[var(--text-muted)] text-center mb-4">No posts found</p>
        <Link
          href="/studio/posts/new"
          className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: '#bc0000', color: '#ffffff' }}
        >
          Create your first post
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Post</th>
              {isEditor && (
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Author</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {post.featured_image && (
                      <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={post.featured_image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">/{post.slug}</p>
                    </div>
                  </div>
                </td>
                {isEditor && (
                  <td className="px-4 py-3">
                    <span className="text-sm text-[var(--text-secondary)]">
                      {post.author_id ? authorMap[post.author_id]?.display_name || 'Unknown' : '-'}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {post.category_id ? categoryMap[post.category_id]?.name || '-' : '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[post.status] || 'bg-gray-500/10 text-gray-500'}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[var(--text-muted)]">
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/studio/posts/${post.id}/edit`}
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </Link>
                    <a
                      href={`/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/studio/posts?page=${currentPage - 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'pointer-events-none opacity-50'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-[var(--text-muted)]">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={`/studio/posts?page=${currentPage + 1}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'pointer-events-none opacity-50'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </>
  )
}
