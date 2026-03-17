'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/* ------------------------------------------------------------------ */
/*  Story Universe Panel — CMS sidebar controls                        */
/*                                                                     */
/*  Appears in the right sidebar of both AdvancedPostEditor and        */
/*  StudioPostEditor. Handles:                                         */
/*  - Manual Story Universe toggle                                     */
/*  - Related story selection (searchable, 2 required)                 */
/*  - Auto-detection suggestion                                        */
/*  - Validation                                                       */
/* ------------------------------------------------------------------ */

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  views: number
  score?: number
}

interface StoryUniversePanelProps {
  /** Current post ID (null if new/unsaved) */
  postId: string | null
  /** Current post's category ID */
  categoryId: string | null
  /** Current post title (for keyword matching) */
  title: string
  /** Current post's tag slugs */
  tags: string[]
  /** Whether Story Universe is enabled */
  isStoryUniverse: boolean
  onIsStoryUniverseChange: (value: boolean) => void
  /** Selected related post IDs (length 2 when valid) */
  relatedIds: string[]
  onRelatedIdsChange: (ids: string[]) => void
  /** Validation error message (set by parent on save attempt) */
  validationError?: string
}

export default function StoryUniversePanel({
  postId,
  categoryId,
  title,
  tags,
  isStoryUniverse,
  onIsStoryUniverseChange,
  relatedIds,
  onRelatedIdsChange,
  validationError,
}: StoryUniversePanelProps) {
  const [candidates, setCandidates] = useState<RelatedPost[]>([])
  const [detected, setDetected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<RelatedPost[]>([])
  const [searching, setSearching] = useState(false)
  const [activeSlot, setActiveSlot] = useState<0 | 1 | null>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch candidates when title/category/tags change (debounced)
  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current)
    if (!title || title.length < 5) return

    fetchTimerRef.current = setTimeout(() => {
      fetchCandidates()
    }, 1500)

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, categoryId, title, tags.join(',')])

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (postId) params.set('postId', postId)
      if (categoryId) params.set('categoryId', categoryId)
      if (title) params.set('title', title)
      if (tags.length > 0) params.set('tags', tags.join(','))

      const res = await fetch(`/api/admin/story-universe?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCandidates(data.candidates || [])
        setDetected(data.detected || false)
      }
    } catch (e) {
      console.error('[StoryUniversePanel] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [postId, categoryId, title, tags])

  // Search for posts by query
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/admin/posts?status=published&limit=10&offset=0`)
        if (res.ok) {
          const data = await res.json()
          const posts = (data.posts || [])
            .filter((p: any) =>
              String(p.id) !== postId &&
              !relatedIds.includes(String(p.id)) &&
              p.title.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 8)
            .map((p: any) => ({
              id: String(p.id),
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              featured_image: p.featured_image,
              published_at: p.published_at,
              views: p.views ?? 0,
            }))
          setSearchResults(posts)
        }
      } catch (e) {
        console.error('[StoryUniversePanel] search error:', e)
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [postId, relatedIds])

  // Get the currently selected posts from candidates or search
  const getSelectedPost = (id: string): RelatedPost | undefined => {
    return candidates.find((c) => c.id === id) || searchResults.find((r) => r.id === id)
  }

  const handleSelectRelated = (post: RelatedPost, slot: 0 | 1) => {
    const newIds = [...relatedIds]
    newIds[slot] = post.id
    onRelatedIdsChange(newIds.filter(Boolean))
    setActiveSlot(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveRelated = (slot: 0 | 1) => {
    const newIds = [...relatedIds]
    newIds.splice(slot, 1)
    onRelatedIdsChange(newIds)
  }

  const handleAcceptSuggested = () => {
    onIsStoryUniverseChange(true)
    // Auto-fill top 2 candidates
    const top2 = candidates.slice(0, 2).map((c) => c.id)
    onRelatedIdsChange(top2)
  }

  // Available candidates (excluding already selected)
  const availableOptions = (searchQuery.trim() ? searchResults : candidates)
    .filter((c) => !relatedIds.includes(c.id) && String(c.id) !== postId)

  return (
    <div className="border-t border-[var(--border-default)] pt-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Homepage Features
      </h4>

      {/* Auto-detection suggestion */}
      {!isStoryUniverse && detected && candidates.length >= 3 && (
        <div
          className="mb-3 rounded-lg p-3 text-sm"
          style={{
            backgroundColor: 'rgba(0, 212, 255, 0.06)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
          }}
        >
          <p className="font-medium" style={{ color: '#00D4FF' }}>
            Story Universe detected for this topic
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {candidates.length} related stories found
          </p>
          <button
            type="button"
            onClick={handleAcceptSuggested}
            className="mt-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(0, 212, 255, 0.12)',
              color: '#00D4FF',
              border: '1px solid rgba(0, 212, 255, 0.3)',
            }}
          >
            Use Suggested Stories
          </button>
        </div>
      )}

      {/* Story Universe checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isStoryUniverse}
          onChange={(e) => {
            onIsStoryUniverseChange(e.target.checked)
            if (!e.target.checked) {
              onRelatedIdsChange([])
            }
          }}
          className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
        />
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Use in Story Universe
        </span>
      </label>
      <p className="mt-1 text-xs text-[var(--text-muted)] ml-6">
        Creates a cinematic hero with this story and 2 related stories
      </p>

      {/* Related story selection — only visible when checked */}
      {isStoryUniverse && (
        <div className="mt-4 space-y-3">
          {[0, 1].map((slot) => {
            const selectedId = relatedIds[slot]
            const selectedPost = selectedId ? getSelectedPost(selectedId) : null

            return (
              <div key={slot}>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  Related Story {slot + 1}
                </label>

                {selectedPost ? (
                  <div
                    className="flex items-center gap-2 rounded-lg p-2"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {selectedPost.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {selectedPost.views} views
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRelated(slot as 0 | 1)}
                      className="flex-shrink-0 rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                      aria-label="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : selectedId ? (
                  <div
                    className="rounded-lg p-2 text-sm text-[var(--text-muted)]"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    Post #{selectedId}
                    <button
                      type="button"
                      onClick={() => handleRemoveRelated(slot as 0 | 1)}
                      className="ml-2 text-xs underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    {activeSlot === slot ? (
                      <div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          placeholder="Search published posts..."
                          autoFocus
                          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
                        />
                        {/* Dropdown */}
                        <div
                          className="mt-1 max-h-48 overflow-y-auto rounded-lg shadow-lg"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          {searching && (
                            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">Searching...</p>
                          )}
                          {!searching && availableOptions.length === 0 && searchQuery.trim() && (
                            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">No posts found</p>
                          )}
                          {!searchQuery.trim() && !searching && candidates.length > 0 && (
                            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
                              Suggested
                            </p>
                          )}
                          {availableOptions.map((post) => (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => handleSelectRelated(post, slot as 0 | 1)}
                              className="w-full text-left px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                              <p className="truncate text-sm text-[var(--text-primary)]">{post.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {post.views} views
                                {post.score ? ` · relevance ${post.score}` : ''}
                              </p>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSlot(null)
                            setSearchQuery('')
                            setSearchResults([])
                          }}
                          className="mt-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSlot(slot as 0 | 1)}
                        className="w-full rounded-lg border border-dashed border-[var(--border-default)] px-3 py-2.5 text-sm text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-left"
                      >
                        + Select related story {slot + 1}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Validation error */}
          {validationError && (
            <p className="text-xs font-medium" style={{ color: '#BC0000' }}>
              {validationError}
            </p>
          )}
        </div>
      )}

      {loading && (
        <p className="mt-2 text-[10px] text-[var(--text-muted)]">Analyzing related stories...</p>
      )}
    </div>
  )
}
