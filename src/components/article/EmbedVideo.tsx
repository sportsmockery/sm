'use client'

import { useState } from 'react'

interface EmbedVideoProps {
  url: string
  title?: string
  className?: string
}

// Extract video ID and type from URL
function parseVideoUrl(url: string): { type: 'youtube' | 'twitter' | 'unknown'; id: string } {
  // YouTube
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return { type: 'youtube', id: youtubeMatch[1] }
  }

  // Twitter/X
  const twitterRegex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
  const twitterMatch = url.match(twitterRegex)
  if (twitterMatch) {
    return { type: 'twitter', id: twitterMatch[1] }
  }

  return { type: 'unknown', id: '' }
}

export default function EmbedVideo({
  url,
  title = 'Embedded Video',
  className = '',
}: EmbedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { type, id } = parseVideoUrl(url)

  if (type === 'unknown') {
    return (
      <div
        className={`flex items-center justify-center rounded-xl p-8 ${className}`}
        style={{ backgroundColor: 'var(--sm-surface)' }}
      >
        <p className="text-[var(--sm-text-muted)]">
          Unable to embed video from this URL
        </p>
      </div>
    )
  }

  if (type === 'youtube') {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        {/* Loading placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--sm-surface)]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--sm-border)] border-t-[#8B0000]" />
              <p className="text-sm text-[var(--sm-text-muted)]">
                Loading video...
              </p>
            </div>
          </div>
        )}

        {/* Responsive container */}
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {/* YouTube attribution */}
        <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="text-xs text-[var(--sm-text-muted)]">
            Video from YouTube
          </span>
        </div>
      </div>
    )
  }

  if (type === 'twitter') {
    return (
      <div className={`overflow-hidden rounded-xl bg-[var(--sm-surface)] ${className}`}>
        {/* Twitter embed placeholder - would need Twitter widget script */}
        <div className="flex flex-col items-center justify-center p-8">
          <svg className="mb-3 h-8 w-8 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <p className="mb-4 text-sm text-[var(--sm-text-muted)]">
            Twitter/X Post
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            View on X →
          </a>
        </div>
      </div>
    )
  }

  return null
}
