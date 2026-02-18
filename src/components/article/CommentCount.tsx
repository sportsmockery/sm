'use client'

import { useEffect, useState } from 'react'

interface CommentCountProps {
  articleUrl: string
  articleId: string | number
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md'
}

// Global type for the window extension
declare global {
  interface Window {
    [key: string]: unknown
  }
}

/**
 * Disqus Comment Count Badge
 * Displays comment count for an article
 * Uses Disqus count.js API
 */
export default function CommentCount({
  articleUrl,
  articleId,
  className = '',
  showIcon = true,
  size = 'sm',
}: CommentCountProps) {
  const [count, setCount] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'sportsmockery'

    // Create a unique callback name for this instance
    const callbackName = `disqusCount_${articleId}_${Date.now()}`

    // Set up callback for JSONP response
    window[callbackName] = (data: { counts: Array<{ comments: number }> }) => {
      if (data.counts && data.counts.length > 0) {
        setCount(data.counts[0].comments)
      } else {
        setCount(0)
      }
      setIsLoaded(true)
      // Clean up callback
      delete window[callbackName]
    }

    // Load count via Disqus API
    const script = document.createElement('script')
    script.src = `https://${shortname}.disqus.com/count-data.js?1=${encodeURIComponent(articleUrl)}&callback=${callbackName}`
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      delete window[callbackName]
    }
  }, [articleUrl, articleId])

  // Format count for display
  const formatCount = (n: number): string => {
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}k`
    }
    return String(n)
  }

  const sizeClasses = {
    sm: 'text-[11px] gap-1',
    md: 'text-[13px] gap-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }

  // Don't render anything until loaded
  if (!isLoaded) {
    return null
  }

  // Don't show if no comments
  if (count === null || count === 0) {
    return null
  }

  return (
    <span
      className={`inline-flex items-center font-medium ${sizeClasses[size]} ${className}`}
      style={{ color: 'var(--sm-text-muted)' }}
      title={`${count} comment${count !== 1 ? 's' : ''}`}
    >
      {showIcon && (
        <svg
          className={iconSizes[size]}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
          />
        </svg>
      )}
      <span>{formatCount(count)}</span>
    </span>
  )
}

/**
 * Comment count badge positioned in top-right of card
 */
export function CommentCountBadge({
  articleUrl,
  articleId,
  className = '',
}: Omit<CommentCountProps, 'showIcon' | 'size'>) {
  const [count, setCount] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const shortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'sportsmockery'
    const callbackName = `disqusCount_badge_${articleId}_${Date.now()}`

    window[callbackName] = (data: { counts: Array<{ comments: number }> }) => {
      if (data.counts && data.counts.length > 0) {
        setCount(data.counts[0].comments)
      } else {
        setCount(0)
      }
      setIsLoaded(true)
      delete window[callbackName]
    }

    const script = document.createElement('script')
    script.src = `https://${shortname}.disqus.com/count-data.js?1=${encodeURIComponent(articleUrl)}&callback=${callbackName}`
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      delete window[callbackName]
    }
  }, [articleUrl, articleId])

  if (!isLoaded || count === null || count === 0) {
    return null
  }

  return (
    <div
      className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
      }}
    >
      <svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.03 2 11c0 2.12.74 4.07 1.97 5.61L3 22l4.5-2.25c1.38.54 2.9.85 4.5.85 5.52 0 10-4.03 10-9S17.52 2 12 2z" />
      </svg>
      <span>{count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}</span>
    </div>
  )
}
