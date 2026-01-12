'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  category?: { name: string } | null
}

interface RelatedContentProps {
  content: string
  category?: string | null
  onInsertLink: (url: string, title: string) => void
}

export default function RelatedContent({
  content,
  category,
  onInsertLink,
}: RelatedContentProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(false)
  const [lastSearch, setLastSearch] = useState('')

  const searchRelated = useCallback(async () => {
    // Extract keywords from content (simple extraction)
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const words = textContent.toLowerCase().split(' ')

    // Get important words (longer words, not common)
    const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'this', 'that', 'with', 'they', 'will', 'from', 'what', 'when', 'were', 'said'])
    const keywords = [...new Set(words.filter(w => w.length > 4 && !commonWords.has(w)))].slice(0, 5)

    const searchKey = keywords.join(',') + (category || '')

    // Don't re-search if keywords haven't changed much
    if (searchKey === lastSearch || keywords.length === 0) return

    setLastSearch(searchKey)
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (keywords.length > 0) params.append('q', keywords.join(' '))
      if (category) params.append('category', category)
      params.append('limit', '5')

      const response = await fetch(`/api/admin/posts/related?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRelatedPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    } finally {
      setLoading(false)
    }
  }, [content, category, lastSearch])

  // Debounced search when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.length > 100) {
        searchRelated()
      }
    }, 2000) // Wait 2 seconds after typing stops

    return () => clearTimeout(timer)
  }, [content, searchRelated])

  const handleInsertLink = (post: RelatedPost) => {
    const url = `/${post.slug}`
    onInsertLink(url, post.title)
  }

  if (relatedPosts.length === 0 && !loading) {
    return null
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">Related Content</span>
        {loading && (
          <svg className="h-4 w-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Link to related articles to improve SEO and keep readers engaged.
        </p>

        {relatedPosts.map((post) => (
          <div
            key={post.id}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
          >
            {post.featured_image && (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={post.featured_image}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {post.title}
              </h4>
              {post.category && (
                <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {post.category.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleInsertLink(post)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Link to This
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
