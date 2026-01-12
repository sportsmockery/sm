'use client'

import { useState } from 'react'
import Image from 'next/image'

interface VideoHighlight {
  id: string
  title: string
  thumbnail: string
  duration: string
  views: number
  team: string
  videoUrl?: string
}

const sampleVideos: VideoHighlight[] = [
  {
    id: '1',
    title: 'Bears Top 10 Plays of the Season',
    thumbnail: '/images/placeholder-video-1.jpg',
    duration: '5:32',
    views: 125000,
    team: 'bears',
  },
  {
    id: '2',
    title: 'Bulls Highlights: LaVine 40-Point Game',
    thumbnail: '/images/placeholder-video-2.jpg',
    duration: '3:45',
    views: 89000,
    team: 'bulls',
  },
  {
    id: '3',
    title: 'Cubs Walk-Off Home Run Breakdown',
    thumbnail: '/images/placeholder-video-3.jpg',
    duration: '4:21',
    views: 67000,
    team: 'cubs',
  },
  {
    id: '4',
    title: 'Blackhawks Rookie Spotlight',
    thumbnail: '/images/placeholder-video-4.jpg',
    duration: '6:15',
    views: 45000,
    team: 'blackhawks',
  },
]

interface VideoHighlightsProps {
  videos?: VideoHighlight[]
  className?: string
}

export default function VideoHighlights({ videos = sampleVideos, className = '' }: VideoHighlightsProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [featuredVideo, ...otherVideos] = videos

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`
    return views.toString()
  }

  return (
    <section className={className}>
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#FF0000] to-[#8B0000]" />
          <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">
            Video Highlights
          </h2>
        </div>
        <a
          href="/videos"
          className="flex items-center gap-1 text-sm font-medium text-[#8B0000] transition-colors hover:text-red-700 dark:text-[#FF6666] dark:hover:text-red-400"
        >
          View All
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Featured video */}
        {featuredVideo && (
          <div className="lg:row-span-2">
            <button
              onClick={() => setActiveVideo(featuredVideo.id)}
              className="group relative block aspect-video w-full overflow-hidden rounded-2xl"
            >
              {/* Thumbnail */}
              <div className="absolute inset-0 bg-zinc-900">
                {featuredVideo.thumbnail && (
                  <Image
                    src={featuredVideo.thumbnail}
                    alt={featuredVideo.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000] text-white shadow-lg transition-transform group-hover:scale-110">
                  <svg className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute right-3 top-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                {featuredVideo.duration}
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="mb-2 text-left text-lg font-bold text-white">
                  {featuredVideo.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span className="capitalize">{featuredVideo.team}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {formatViews(featuredVideo.views)} views
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Other videos */}
        <div className="space-y-4">
          {otherVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video.id)}
              className="group flex w-full gap-4 text-left"
            >
              {/* Thumbnail */}
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                {video.thumbnail && (
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
                    <svg className="ml-0.5 h-4 w-4 text-[#8B0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                  {video.duration}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                  {video.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="capitalize">{video.team}</span>
                  <span>•</span>
                  <span>{formatViews(video.views)} views</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Video modal (simplified - would use a proper modal in production) */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div className="relative aspect-video w-full max-w-4xl rounded-xl bg-zinc-900">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg transition-colors hover:bg-zinc-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex h-full items-center justify-center text-white">
              <p>Video player would load here</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
