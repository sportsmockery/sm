'use client'

import { useEffect, useRef } from 'react'

interface ArticleViewTrackerProps {
  postId: number
}

export default function ArticleViewTracker({ postId }: ArticleViewTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true

    // Track the view after a short delay to ensure it's a real view
    const timer = setTimeout(() => {
      fetch(`/api/views/${postId}`, { method: 'POST' })
        .catch(console.error)
    }, 1000)

    return () => clearTimeout(timer)
  }, [postId])

  // This component doesn't render anything
  return null
}
