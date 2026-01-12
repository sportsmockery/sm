'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Post {
  id: number
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  category_id: number | null
  author_id: number | null
  featured_image: string | null
  excerpt: string | null
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Author {
  id: number
  display_name: string
  avatar_url: string | null
}

interface PostsListClientProps {
  posts: Post[]
  categoryMap: Record<number, Category>
  authorMap: Record<number, Author>
  currentPage: number
  totalPages: number
  status?: string
  search?: string
  category?: string
}

export default function PostsListClient({
  posts,
  categoryMap,
  authorMap,
  currentPage,
  totalPages,
  status,
  search,
  category,
}: PostsListClientProps) {
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const toggleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)))
    }
  }

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPosts(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return
    // TODO: Implement bulk delete API call
    console.log('Deleting posts:', Array.from(selectedPosts))
    setSelectedPosts(new Set())
  }

  const handleDelete = async (id: number) => {
    // TODO: Implement delete API call
    console.log('Deleting post:', id)
    setShowDeleteConfirm(null)
  }

  const getStatusBadge = (postStatus: string) => {
    const styles = {
      published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    }
    const icons = {
      published: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      draft: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
      scheduled: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[postStatus as keyof typeof styles] || styles.draft}`}>
        {icons[postStatus as keyof typeof icons]}
        {postStatus.charAt(0).toUpperCase() + postStatus.slice(1)}
      </span>
    )
  }

  const buildPaginationUrl = (page: number) => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    return `/admin/posts?${params.toString()}`
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedPosts.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--accent-red)] bg-[var(--accent-red-muted)] p-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {selectedPosts.size} post{selectedPosts.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedPosts(new Set())}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Clear selection
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <table className="w-full">
          <thead className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedPosts.size === posts.length && posts.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Post
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] md:table-cell">
                Category
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] lg:table-cell">
                Author
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Status
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:table-cell">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id} className="group hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                      className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-tertiary)]">
                        {post.featured_image ? (
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg className="h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Title & Slug */}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="block font-medium text-[var(--text-primary)] hover:text-[var(--accent-red)] transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 md:table-cell">
                    {post.category_id && categoryMap[post.category_id] ? (
                      <span className="inline-flex rounded-lg bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                        {categoryMap[post.category_id].name}
                      </span>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">-</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-4 lg:table-cell">
                    {post.author_id && authorMap[post.author_id] ? (
                      <div className="flex items-center gap-2">
                        {authorMap[post.author_id].avatar_url ? (
                          <Image
                            src={authorMap[post.author_id].avatar_url!}
                            alt={authorMap[post.author_id].display_name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-xs font-medium text-[var(--text-muted)]">
                            {authorMap[post.author_id].display_name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm text-[var(--text-secondary)]">
                          {authorMap[post.author_id].display_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="hidden px-4 py-4 sm:table-cell">
                    <span className="text-sm text-[var(--text-secondary)]">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/${categoryMap[post.category_id!]?.slug || 'articles'}/${post.slug}`}
                        target="_blank"
                        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        title="View"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-red)] transition-colors"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setShowDeleteConfirm(showDeleteConfirm === post.id ? null : post.id)}
                          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--error-muted)] hover:text-[var(--error)] transition-colors"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                        {showDeleteConfirm === post.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-3 shadow-lg">
                            <p className="mb-3 text-sm text-[var(--text-secondary)]">Delete this post?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="flex-1 rounded-lg bg-[var(--error)] px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <svg className="mx-auto h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="mt-4 text-[var(--text-muted)]">No posts found</p>
                  <Link
                    href="/admin/posts/new"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create your first post
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3">
          <p className="text-sm text-[var(--text-muted)]">
            Page <span className="font-medium text-[var(--text-primary)]">{currentPage}</span> of{' '}
            <span className="font-medium text-[var(--text-primary)]">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={buildPaginationUrl(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={buildPaginationUrl(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
