'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface LiteYouTubeEmbedProps {
  videoId: string
  title: string
  thumbnailUrl?: string
  className?: string
}

/**
 * Lightweight YouTube embed that shows a static thumbnail + play button.
 * The actual YouTube iframe is only loaded when the user clicks play.
 * This saves ~400KB+ per embed vs eager iframe loading.
 */
export default function LiteYouTubeEmbed({
  videoId,
  title,
  thumbnailUrl,
  className = '',
}: LiteYouTubeEmbedProps) {
  const [activated, setActivated] = useState(false)

  const thumbnail = thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  const handleClick = useCallback(() => {
    setActivated(true)
  }, [])

  if (activated) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="text-xs text-[var(--sm-text-muted)]">Video from YouTube</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <button
        type="button"
        className="relative aspect-video w-full cursor-pointer group block"
        onClick={handleClick}
        aria-label={`Play ${title}`}
      >
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 600px) 100vw, 600px"
        />
        {/* Dark overlay on hover */}
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
      <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        <span className="text-xs text-[var(--sm-text-muted)]">Video from YouTube</span>
      </div>
    </div>
  )
}
