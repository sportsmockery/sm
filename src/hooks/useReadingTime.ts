'use client'

import { useMemo } from 'react'

interface UseReadingTimeOptions {
  wordsPerMinute?: number
  includeImages?: boolean
  imageReadTime?: number // seconds per image
}

interface ReadingTimeResult {
  minutes: number
  words: number
  text: string
  formatted: string
}

export function useReadingTime(
  content: string,
  options: UseReadingTimeOptions = {}
): ReadingTimeResult {
  const {
    wordsPerMinute = 200,
    includeImages = true,
    imageReadTime = 12, // Average time to look at an image
  } = options

  return useMemo(() => {
    // Strip HTML tags to get plain text
    const plainText = content.replace(/<[^>]*>/g, ' ')

    // Count words
    const words = plainText.trim().split(/\s+/).filter(Boolean).length

    // Count images if HTML content
    let imageCount = 0
    if (includeImages) {
      const imgMatches = content.match(/<img[^>]*>/gi)
      imageCount = imgMatches ? imgMatches.length : 0
    }

    // Calculate reading time
    const readingMinutes = words / wordsPerMinute
    const imageMinutes = (imageCount * imageReadTime) / 60
    const totalMinutes = Math.ceil(readingMinutes + imageMinutes)

    // Ensure minimum of 1 minute
    const minutes = Math.max(1, totalMinutes)

    return {
      minutes,
      words,
      text: minutes === 1 ? '1 min read' : `${minutes} min read`,
      formatted: formatReadingTime(minutes),
    }
  }, [content, wordsPerMinute, includeImages, imageReadTime])
}

// Format reading time in a human-friendly way
function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than a minute'
  }
  if (minutes === 1) {
    return '1 minute read'
  }
  if (minutes < 60) {
    return `${minutes} minute read`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour read' : `${hours} hour read`
  }

  return `${hours}h ${remainingMinutes}m read`
}

// Server-side utility function (non-hook)
export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  const plainText = content.replace(/<[^>]*>/g, ' ')
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// Get a preview excerpt from content
export function getExcerpt(content: string, maxLength = 160): string {
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  // Cut at last space before maxLength
  const trimmed = plainText.slice(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(' ')

  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '...'
}

// Estimate complexity level of article
export function getReadingDifficulty(content: string): 'easy' | 'medium' | 'advanced' {
  const plainText = content.replace(/<[^>]*>/g, ' ')
  const words = plainText.trim().split(/\s+/).filter(Boolean)

  // Average word length as a simple complexity indicator
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length

  // Sentence count (rough estimate)
  const sentences = plainText.split(/[.!?]+/).filter(Boolean).length
  const avgSentenceLength = words.length / sentences

  // Simple scoring
  if (avgWordLength > 6 || avgSentenceLength > 25) {
    return 'advanced'
  }
  if (avgWordLength > 5 || avgSentenceLength > 18) {
    return 'medium'
  }
  return 'easy'
}
