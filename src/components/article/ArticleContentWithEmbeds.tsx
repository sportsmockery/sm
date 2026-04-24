'use client'

import { useEffect, useRef, useState } from 'react'
import { processIconShortcodes } from '@/lib/shortcodes'
import { sanitizeHtml } from '@/lib/sanitize-html'

// Window.twttr type is declared in TwitterEmbed.tsx

interface InlineSlot {
  afterParagraph: number
  node: React.ReactNode
}

interface ArticleContentWithEmbedsProps {
  content: string
  className?: string
  /** React node to inject after the 3rd paragraph */
  inlineSlot?: React.ReactNode
  /** Multiple inline slots at specific paragraph positions */
  inlineSlots?: InlineSlot[]
}

// Script loading state
let scriptLoaded = false
let scriptLoadPromise: Promise<void> | null = null

function loadTwitterScript(): Promise<void> {
  if (scriptLoaded && window.twttr?.widgets) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve) => {
    // Check if already loaded
    if (window.twttr?.widgets) {
      scriptLoaded = true
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.charset = 'utf-8'
    script.onload = () => {
      if (window.twttr) {
        window.twttr.ready(() => {
          scriptLoaded = true
          resolve()
        })
      } else {
        resolve()
      }
    }
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

/**
 * Process content to convert Twitter/X URLs to proper embed blockquotes
 * Normalizes x.com to twitter.com
 */
function processTwitterUrls(html: string): string {
  // Pattern to match standalone Twitter/X URLs (not already in blockquotes or links)
  // Match URLs that are either on their own line or wrapped in <p> tags
  const twitterUrlPattern = /<p>\s*(https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^\s<]*)\s*<\/p>/gi

  return html.replace(twitterUrlPattern, (match, url, tweetId) => {
    // Normalize x.com to twitter.com
    const normalizedUrl = url.replace('x.com', 'twitter.com')

    // Return Twitter-compatible blockquote format
    return `
      <blockquote class="twitter-tweet" data-dnt="true">
        <a href="${normalizedUrl}"></a>
      </blockquote>
    `
  })
}

/**
 * Also check for bare URLs not in <p> tags (sometimes from markdown conversion)
 */
function processBareTweetUrls(html: string): string {
  // Match bare tweet URLs that might be just text
  const bareUrlPattern = /(?<![">])(https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)[^\s<]*)(?![<"])/gi

  return html.replace(bareUrlPattern, (match, url, tweetId) => {
    const normalizedUrl = url.replace('x.com', 'twitter.com')
    return `
      <blockquote class="twitter-tweet" data-dnt="true">
        <a href="${normalizedUrl}"></a>
      </blockquote>
    `
  })
}

/**
 * Split HTML after the Nth closing </p> tag.
 * Returns [before, after]. If fewer than N paragraphs, after is empty.
 */
function splitAfterParagraph(html: string, n: number): [string, string] {
  let count = 0
  const regex = /<\/p>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    count++
    if (count === n) {
      const splitIndex = match.index + match[0].length
      return [html.slice(0, splitIndex), html.slice(splitIndex)]
    }
  }
  return [html, '']
}

/**
 * Split HTML at multiple paragraph positions.
 * Returns alternating [htmlSegment, slotNode, htmlSegment, slotNode, ...] segments.
 */
function splitAtMultiplePositions(
  html: string,
  slots: InlineSlot[]
): Array<{ type: 'html'; content: string } | { type: 'slot'; node: React.ReactNode }> {
  if (!slots.length) return [{ type: 'html', content: html }]

  // Sort slots by paragraph position
  const sorted = [...slots].sort((a, b) => a.afterParagraph - b.afterParagraph)

  const segments: Array<{ type: 'html'; content: string } | { type: 'slot'; node: React.ReactNode }> = []
  let remaining = html
  let consumed = 0

  for (const slot of sorted) {
    const targetPara = slot.afterParagraph - consumed
    if (targetPara <= 0) {
      // Already past this position, insert slot here
      segments.push({ type: 'slot', node: slot.node })
      continue
    }

    const [before, after] = splitAfterParagraph(remaining, targetPara)
    if (before) segments.push({ type: 'html', content: before })
    segments.push({ type: 'slot', node: slot.node })
    remaining = after
    // Count how many paragraphs we consumed
    consumed = slot.afterParagraph
  }

  if (remaining) {
    segments.push({ type: 'html', content: remaining })
  }

  return segments
}

/**
 * Renders WordPress article HTML CLIENT-ONLY to prevent React hydration
 * mismatches (removeChild errors). WordPress HTML contains structures
 * that browsers normalize differently than the server renderer, causing
 * DOM mismatches on hydration.
 */
export default function ArticleContentWithEmbeds({
  content,
  className = '',
  inlineSlot,
  inlineSlots,
}: ArticleContentWithEmbedsProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // Process content: Twitter URLs to embeds, and icon shortcodes to icons
  const processedContent = processIconShortcodes(
    processBareTweetUrls(processTwitterUrls(content))
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !contentRef.current) return

    const twitterBlockquotes = contentRef.current.querySelectorAll('.twitter-tweet')
    if (twitterBlockquotes.length === 0) return

    loadTwitterScript()
      .then(() => {
        if (window.twttr?.widgets && contentRef.current) {
          window.twttr.widgets.load(contentRef.current)
        }
      })
      .catch(() => {
        // Silently fail — tweet embeds will show as blockquote fallbacks
      })
  }, [mounted, processedContent])

  // Server render: skeleton placeholder (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className={`article-body ${className}`} aria-busy="true">
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 rounded" style={{ background: 'var(--hp-border, rgba(0,0,0,0.08))', width: i === 0 ? '90%' : i === 3 ? '70%' : '100%' }} />
              {i < 5 && <div className="h-4 rounded mt-2" style={{ background: 'var(--hp-border, rgba(0,0,0,0.08))', width: i % 2 === 0 ? '95%' : '80%' }} />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Client render: actual content

  // Build combined slots array from both inlineSlot (legacy) and inlineSlots
  const allSlots: InlineSlot[] = [...(inlineSlots || [])]
  if (inlineSlot) {
    allSlots.push({ afterParagraph: 3, node: inlineSlot })
  }

  if (allSlots.length > 0) {
    const segments = splitAtMultiplePositions(processedContent, allSlots)
    return (
      <div ref={contentRef} className={`article-body ${className}`} suppressHydrationWarning>
        {segments.map((seg, i) =>
          seg.type === 'html' ? (
            <div key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(seg.content) }} suppressHydrationWarning />
          ) : (
            <div key={i}>{seg.node}</div>
          )
        )}
      </div>
    )
  }

  return (
    <div
      ref={contentRef}
      className={`article-body ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(processedContent) }}
      suppressHydrationWarning
    />
  )
}
