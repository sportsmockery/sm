'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PostSummary, TEAM_INFO } from '@/lib/types'

interface HeroCarouselProps {
  posts: PostSummary[]
  autoPlayInterval?: number
  className?: string
}

/**
 * Hero carousel for homepage featuring top stories
 * Bears stories are prioritized and highlighted with team colors
 */
export default function HeroCarousel({
  posts,
  autoPlayInterval = 5000,
  className = '',
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const heroStories = posts.slice(0, 5)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroStories.length)
  }, [heroStories.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroStories.length) % heroStories.length)
  }, [heroStories.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || heroStories.length <= 1) return

    const timer = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(timer)
  }, [isPaused, goToNext, autoPlayInterval, heroStories.length])

  if (heroStories.length === 0) {
    return null
  }

  const currentStory = heroStories[currentIndex]
  const teamInfo = TEAM_INFO[currentStory.team]
  const isBears = currentStory.team === 'bears'

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel area */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] bg-black">
        {/* Background image with parallax effect */}
        <div className="absolute inset-0 transition-transform duration-700">
          <Image
            src={currentStory.featuredImage || '/placeholder.jpg'}
            alt={currentStory.title}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>

        {/* Team accent bar for Bears stories */}
        {isBears && (
          <div
            className="absolute top-0 left-0 w-1 h-full"
            style={{ backgroundColor: teamInfo.secondaryColor }}
          />
        )}

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="max-w-[1110px] mx-auto w-full">
            {/* Category/Team tag */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block px-3 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: isBears ? teamInfo.secondaryColor : '#bc0000',
                  color: 'white',
                  fontFamily: "Barlow, sans-serif",
                }}
              >
                {isBears ? '🐻 BEARS' : currentStory.categoryName}
              </span>
              {isBears && (
                <span className="text-white/60 text-xs">Featured Story</span>
              )}
            </div>

            {/* Title */}
            <Link
              href={`/${currentStory.categorySlug}/${currentStory.slug}`}
              className="group block"
            >
              <h2
                className="text-white text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 group-hover:underline decoration-2 underline-offset-4"
                style={{ fontFamily: "Barlow, sans-serif" }}
              >
                {currentStory.title}
              </h2>
            </Link>

            {/* Excerpt */}
            {currentStory.excerpt && (
              <p className="text-white/80 text-sm md:text-base max-w-2xl line-clamp-2 mb-4">
                {currentStory.excerpt}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-3 text-white/60 text-xs md:text-sm">
              <span>{currentStory.author.displayName}</span>
              <span>•</span>
              <span>
                {new Date(currentStory.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {currentStory.views > 0 && (
                <>
                  <span>•</span>
                  <span>{currentStory.views.toLocaleString()} views</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          aria-label="Previous story"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          aria-label="Next story"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Thumbnail navigation */}
      <div className="bg-[#111] py-4">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {heroStories.map((story, index) => {
              const storyTeam = TEAM_INFO[story.team]
              const isStorybears = story.team === 'bears'
              const isActive = index === currentIndex

              return (
                <button
                  key={story.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-48 md:w-56 group relative overflow-hidden transition-all ${
                    isActive ? 'ring-2 ring-offset-2 ring-offset-black' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    '--tw-ring-color': isStorybears ? storyTeam.secondaryColor : '#bc0000',
                  } as React.CSSProperties}
                  aria-label={`Go to story ${index + 1}: ${story.title}`}
                >
                  {/* Thumbnail image */}
                  <div className="relative aspect-video">
                    <Image
                      src={story.featuredImage || '/placeholder.jpg'}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Bears indicator */}
                    {isStorybears && (
                      <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ backgroundColor: storyTeam.secondaryColor }}
                      />
                    )}

                    {/* Slide number */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Thumbnail title */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p
                      className="text-white text-xs font-semibold line-clamp-2 leading-tight"
                      style={{ fontFamily: "Barlow, sans-serif" }}
                    >
                      {story.title}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-[72px] md:bottom-[80px] left-1/2 -translate-x-1/2 flex gap-2">
        {heroStories.map((story, index) => {
          const storyTeam = TEAM_INFO[story.team]
          const isStorybears = story.team === 'bears'
          const isActive = index === currentIndex

          return (
            <button
              key={story.id}
              onClick={() => goToSlide(index)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: isActive
                  ? (isStorybears ? storyTeam.secondaryColor : '#bc0000')
                  : 'rgba(255,255,255,0.4)',
                width: isActive ? '24px' : '8px',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}
