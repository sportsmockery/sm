'use client'

import { useState, useTransition } from 'react'
import { loadMorePosts } from '@/app/actions'
import ArticleCard from './ArticleCard'

interface LoadMoreButtonProps {
  initialOffset: number
  initialHasMore: boolean
}

export default function LoadMoreButton({
  initialOffset,
  initialHasMore,
}: LoadMoreButtonProps) {
  const [offset, setOffset] = useState(initialOffset)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [posts, setPosts] = useState<Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    featured_image: string
    published_at: string
    category: { name: string; slug: string }
  }>>([])
  const [isPending, startTransition] = useTransition()

  const handleLoadMore = () => {
    startTransition(async () => {
      const result = await loadMorePosts(offset)
      if (result.posts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prev) => [...prev, ...result.posts])
        setOffset((prev) => prev + 12)
        setHasMore(result.hasMore)
      }
    })
  }

  return (
    <>
      {posts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {posts.map((post) => (
            <ArticleCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              featuredImage={post.featured_image}
              category={post.category}
              publishedAt={post.published_at}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Articles'
            )}
          </button>
        </div>
      )}
    </>
  )
}
