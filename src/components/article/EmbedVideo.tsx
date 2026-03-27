'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

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
  const [activated, setActivated] = useState(false)
  const { type, id } = parseVideoUrl(url)

  const handlePlay = useCallback(() => {
    setActivated(true)
  }, [])

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
    const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ maxWidth: '100%' }}>
        {/* Responsive container */}
        <div className="relative aspect-video w-full">
          {activated ? (
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              className="absolute inset-0 w-full h-full cursor-pointer group"
              onClick={handlePlay}
              aria-label={`Play ${title}`}
            >
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 640px"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                >
                  <svg width="24" height="28" viewBox="0 0 20 24" fill="none" className="ml-1" aria-hidden="true">
                    <path d="M2 1L18 12L2 23V1Z" fill="#0B0F14" />
                  </svg>
                </div>
              </div>
            </button>
          )}
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
