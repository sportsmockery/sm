'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => Promise<void>
        createTweet: (
          tweetId: string,
          container: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>
      }
      ready: (callback: () => void) => void
    }
  }
}

interface TwitterEmbedProps {
  tweetId: string
  className?: string
}

// Script loading state
let scriptLoadPromise: Promise<void> | null = null

function loadTwitterScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise

  if (window.twttr?.widgets) {
    return Promise.resolve()
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.charset = 'utf-8'
    script.onload = () => {
      if (window.twttr) {
        window.twttr.ready(() => resolve())
      } else {
        resolve()
      }
    }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export default function TwitterEmbed({ tweetId, className = '' }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !tweetId) return

    const container = containerRef.current
    let mounted = true

    async function embedTweet() {
      try {
        await loadTwitterScript()

        if (!mounted || !window.twttr?.widgets) return

        // Clear container
        container.innerHTML = ''

        // Create the tweet embed
        const tweetElement = await window.twttr.widgets.createTweet(tweetId, container, {
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          align: 'center',
          dnt: true,
        })

        if (mounted) {
          if (tweetElement) {
            setIsLoading(false)
          } else {
            setError(true)
            setIsLoading(false)
          }
        }
      } catch (err) {
        if (mounted) {
          setError(true)
          setIsLoading(false)
        }
      }
    }

    embedTweet()

    return () => {
      mounted = false
    }
  }, [tweetId])

  if (error) {
    return (
      <div className={`overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 ${className}`}>
        <div className="flex flex-col items-center justify-center p-8">
          <svg className="mb-3 h-8 w-8 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Could not load tweet
          </p>
          <a
            href={`https://twitter.com/i/status/${tweetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            View on X
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`twitter-embed-container ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center rounded-xl bg-zinc-100 p-8 dark:bg-zinc-800">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#8B0000] dark:border-zinc-600 dark:border-t-[#FF6666]" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading tweet...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className={isLoading ? 'hidden' : ''} />
    </div>
  )
}
