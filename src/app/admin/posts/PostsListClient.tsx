'use client'

import { useState, useEffect, useRef } from 'react'
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
  is_story_universe?: boolean
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

interface Tag {
  id: number
  name: string
  slug: string
}

interface PostsListClientProps {
  posts: Post[]
  categoryMap: Record<number, Category>
  authorMap: Record<number, Author>
  allCategories: Category[]
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
  allCategories,
  currentPage,
  totalPages,
  status,
  search,
  category,
}: PostsListClientProps) {
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [postTags, setPostTags] = useState<Record<number, Tag[]>>({})
  const [editingTags, setEditingTags] = useState<number | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [postCategories, setPostCategories] = useState<Record<number, number | null>>({})
  const tagInputRef = useRef<HTMLInputElement>(null)

  // Load tags for all visible posts
  useEffect(() => {
    const loadTags = async () => {
      const results: Record<number, Tag[]> = {}
      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await fetch(`/api/admin/posts/${post.id}/tags`)
            const data = await res.json()
            results[post.id] = data.tags || []
          } catch {
            results[post.id] = []
          }
        })
      )
      setPostTags(results)
    }
    loadTags()
  }, [posts])

  // Init category state
  useEffect(() => {
    const cats: Record<number, number | null> = {}
    posts.forEach(p => { cats[p.id] = p.category_id })
    setPostCategories(cats)
  }, [posts])

  // Focus tag input when editing
  useEffect(() => {
    if (editingTags && tagInputRef.current) {
      tagInputRef.current.focus()
    }
  }, [editingTags])

  const saveTags = async (postId: number, tags: Tag[]) => {
    const tagNames = tags.map(t => t.name)
    await fetch(`/api/admin/posts/${postId}/tags`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagNames }),
    })
  }

  const addTag = async (postId: number) => {
    const name = tagInput.trim()
    if (!name) return
    const existing = postTags[postId] || []
    if (existing.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setTagInput('')
      return
    }
    const newTag: Tag = { id: 0, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
    const updated = [...existing, newTag]
    setPostTags({ ...postTags, [postId]: updated })
    setTagInput('')
    await saveTags(postId, updated)
    // Reload to get real IDs
    const res = await fetch(`/api/admin/posts/${postId}/tags`)
    const data = await res.json()
    setPostTags(prev => ({ ...prev, [postId]: data.tags || [] }))
  }

  const removeTag = async (postId: number, tagId: number) => {
    const existing = postTags[postId] || []
    const updated = existing.filter(t => t.id !== tagId)
    setPostTags({ ...postTags, [postId]: updated })
    await saveTags(postId, updated)
  }

  const updateCategory = async (postId: number, categoryId: number | null) => {
    setPostCategories(prev => ({ ...prev, [postId]: categoryId }))
    setEditingCategory(null)
    await fetch(`/api/admin/posts/${postId}/category`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId }),
    })
  }

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
    console.log('Deleting posts:', Array.from(selectedPosts))
    setSelectedPosts(new Set())
  }

  const handleDelete = async (id: number) => {
    console.log('Deleting post:', id)
    setShowDeleteConfirm(null)
  }

  const getStatusBadge = (postStatus: string) => {
    const styles = {
      published: 'bg-[#00D4FF]/10 text-[#00D4FF] border-emerald-500/20',
      draft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      scheduled: 'bg-[#00D4FF]/10 text-[#00D4FF] border-blue-500/20',
    }
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[postStatus as keyof typeof styles] || styles.draft}`}>
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
            <button onClick={() => setSelectedPosts(new Set())} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Clear selection
            </button>
            <button onClick={handleBulkDelete} className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-colors">
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
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] lg:table-cell">
                Tags
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
              posts.map((post) => {
                const tags = postTags[post.id] || []
                const currentCatId = postCategories[post.id] ?? post.category_id

                return (
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
                        <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-tertiary)]">
                          {post.featured_image ? (
                            <Image src={post.featured_image} alt={post.title} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <svg className="h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/posts/${post.id}`} className="block font-medium text-[var(--text-primary)] hover:text-[var(--accent-red)] transition-colors line-clamp-1">
                              {post.title}
                            </Link>
                            {post.is_story_universe && (
                              <span
                                className="inline-flex flex-shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                                style={{
                                  backgroundColor: 'rgba(188, 0, 0, 0.1)',
                                  color: '#BC0000',
                                  border: '1px solid rgba(188, 0, 0, 0.2)',
                                }}
                                title="Story Universe active — this post powers a homepage hero cluster"
                              >
                                Universe
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">/{post.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category — click to edit */}
                    <td className="hidden px-4 py-4 md:table-cell">
                      {editingCategory === post.id ? (
                        <select
                          value={currentCatId || ''}
                          onChange={(e) => updateCategory(post.id, e.target.value ? parseInt(e.target.value) : null)}
                          onBlur={() => setEditingCategory(null)}
                          autoFocus
                          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none"
                        >
                          <option value="">None</option>
                          {allCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingCategory(post.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                          title="Click to change category"
                        >
                          {currentCatId && categoryMap[currentCatId] ? categoryMap[currentCatId].name : 'None'}
                          <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                      )}
                    </td>

                    {/* Author */}
                    <td className="hidden px-4 py-4 lg:table-cell">
                      {post.author_id && authorMap[post.author_id] ? (
                        <div className="flex items-center gap-2">
                          {authorMap[post.author_id].avatar_url ? (
                            <Image src={authorMap[post.author_id].avatar_url!} alt={authorMap[post.author_id].display_name} width={24} height={24} className="rounded-full" />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-xs font-medium text-[var(--text-muted)]">
                              {authorMap[post.author_id].display_name.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm text-[var(--text-secondary)]">{authorMap[post.author_id].display_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--text-muted)]">-</span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="hidden px-4 py-4 lg:table-cell">
                      <div className="flex flex-wrap items-center gap-1">
                        {tags.map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 rounded-md bg-[#00D4FF]/10 px-2 py-0.5 text-[11px] font-medium text-[#00D4FF]"
                          >
                            {tag.name}
                            <button
                              onClick={() => removeTag(post.id, tag.id)}
                              className="hover:text-red-400 transition-colors"
                              title="Remove tag"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        {editingTags === post.id ? (
                          <input
                            ref={tagInputRef}
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); addTag(post.id) }
                              if (e.key === 'Escape') { setEditingTags(null); setTagInput('') }
                            }}
                            onBlur={() => { if (tagInput.trim()) addTag(post.id); setEditingTags(null); setTagInput('') }}
                            placeholder="Add tag..."
                            className="w-20 rounded border border-[var(--border-default)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-[11px] text-[var(--text-primary)] focus:border-[#00D4FF] focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => { setEditingTags(post.id); setTagInput('') }}
                            className="inline-flex items-center rounded-md border border-dashed border-[var(--border-default)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)] hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors"
                            title="Add tag"
                          >
                            +
                          </button>
                        )}
                      </div>
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
                                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
                                  Cancel
                                </button>
                                <button onClick={() => handleDelete(post.id)} className="flex-1 rounded-lg bg-[var(--error)] px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <p className="mt-4 text-[var(--text-muted)]">No posts found</p>
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
              <Link href={buildPaginationUrl(currentPage - 1)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={buildPaginationUrl(currentPage + 1)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
