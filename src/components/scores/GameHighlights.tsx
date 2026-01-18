'use client'

import { useState, useEffect } from 'react'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

interface VideoHighlight {
  videoId: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  channelTitle: string
}

interface GameHighlightsProps {
  gameId: string
  homeTeam: string
  awayTeam: string
  gameDate: string
  week: number
  className?: string
}

/**
 * Game Highlights Component
 *
 * Auto-fetches and displays official NFL YouTube highlights for a specific game.
 * Videos are embedded with mockery overlays.
 */
export default function GameHighlights({
  gameId,
  homeTeam,
  awayTeam,
  gameDate,
  week,
  className = '',
}: GameHighlightsProps) {
  const [videos, setVideos] = useState<VideoHighlight[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/highlights/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId,
            homeTeam,
            awayTeam,
            gameDate,
            week,
          }),
        })

        const data = await res.json()

        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos)
          setActiveVideo(data.videos[0].videoId)
        }
      } catch (err) {
        console.error('Failed to fetch highlights:', err)
        setError('Unable to load highlights')
      } finally {
        setLoading(false)
      }
    }

    fetchHighlights()
  }, [gameId, homeTeam, awayTeam, gameDate, week])

  if (loading) {
    return (
      <div className={`bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[#0B162A]">
          <h3 className={`text-white text-lg flex items-center gap-2 ${montserrat.className}`}>
            <span>🎬</span> Game Highlights
          </h3>
        </div>
        <div className="p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#C83200] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-[var(--text-muted)]">Loading highlights...</span>
        </div>
      </div>
    )
  }

  if (error || videos.length === 0) {
    return (
      <div className={`bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[#0B162A]">
          <h3 className={`text-white text-lg flex items-center gap-2 ${montserrat.className}`}>
            <span>🎬</span> Game Highlights
          </h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-[var(--text-muted)]">No highlights available for this game</p>
        </div>
      </div>
    )
  }

  const activeVideoData = videos.find(v => v.videoId === activeVideo)

  return (
    <div className={`bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[#0B162A]">
        <h3 className={`text-white text-lg flex items-center gap-2 ${montserrat.className}`}>
          <span>🎬</span> Game Highlights
        </h3>
        <p className="text-white/60 text-xs mt-1">Official NFL Footage</p>
      </div>

      {/* Main Video Player */}
      {activeVideo && (
        <div className="relative">
          <div className="aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?rel=0&modestbranding=1`}
              title={activeVideoData?.title || 'Game Highlights'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Mockery Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
            <p className={`text-white text-sm font-bold ${montserrat.className}`}>
              {getMockeryOverlay(homeTeam, awayTeam)}
            </p>
          </div>
        </div>
      )}

      {/* Video Title */}
      {activeVideoData && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <h4 className="font-semibold text-[var(--text-primary)] line-clamp-2">
            {activeVideoData.title}
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {activeVideoData.channelTitle} • {formatDate(activeVideoData.publishedAt)}
          </p>
        </div>
      )}

      {/* Video Thumbnails (if multiple) */}
      {videos.length > 1 && (
        <div className="p-3 border-b border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">More Highlights</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {videos.map((video) => (
              <button
                key={video.videoId}
                onClick={() => setActiveVideo(video.videoId)}
                className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                  activeVideo === video.videoId
                    ? 'ring-2 ring-[#C83200] scale-105'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover"
                />
                {activeVideo === video.videoId && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fair Use Disclaimer */}
      <div className="px-4 py-3 bg-[var(--bg-tertiary)]">
        <p className="text-[10px] text-[var(--text-muted)] leading-tight">
          Video content from official NFL YouTube channel. Used for transformative commentary under fair use.
          © NFL. All rights reserved.
        </p>
      </div>
    </div>
  )
}

/**
 * Generate mockery overlay text based on teams
 */
function getMockeryOverlay(homeTeam: string, awayTeam: string): string {
  const isBears = homeTeam === 'CHI' || awayTeam === 'CHI'

  if (!isBears) return 'SportsMockery Highlights'

  const mockeryLines = [
    'Another chapter in Bears history... for better or worse',
    'Bears football: Where hope meets reality',
    'The eternal Chicago experience continues',
    'Bears highlights brought to you by mild disappointment',
    'Chicago sports: Building character since forever',
  ]

  return mockeryLines[Math.floor(Math.random() * mockeryLines.length)]
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
