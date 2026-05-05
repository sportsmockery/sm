'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import StreamedArticle from './StreamedArticle'
import { track } from '@/lib/gtm'
import { setActiveArticle } from '@/lib/activeArticle'
import type { StreamedArticlePayload } from '@/app/api/articles/next/route'

interface NextArticleStreamProps {
  /** Current article (the one rendered server-side) — used as the cursor for "next". */
  initialPostId: number
  initialPostUrl: string
  initialPostTitle: string
  /** Same-team filter slug, e.g. "bears", "whitesox". Optional. */
  team: string | null
  /** Hard cap of articles appended below the original. */
  maxArticles?: number
}

interface LoadedArticle {
  payload: StreamedArticlePayload
  /** Set true once user actually scrolled into this article. */
  viewed: boolean
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Aggressive next-article flow: appends up to N additional articles below the
 * original, fetched lazily as the reader nears the end. Each appended article
 * gets its own Scout/Edge insights, comments, and view tracking. URL + GA
 * page_view fires when an article actually scrolls into view.
 *
 * After the cap, a hard-nav link is shown so the next click resets the page
 * (clean ad-frequency reset, fresh Core Web Vitals, etc.).
 */
export default function NextArticleStream({
  initialPostId,
  initialPostUrl,
  initialPostTitle,
  team,
  maxArticles = 2,
}: NextArticleStreamProps) {
  const [articles, setArticles] = useState<LoadedArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [exhausted, setExhausted] = useState(false)

  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Track which URL is currently reflected in the address bar so we don't
  // hammer history.replaceState on every scroll tick.
  const currentUrlRef = useRef(initialPostUrl)

  const reachedCap = articles.length >= maxArticles

  const fireGaPageview = useCallback((url: string, title: string) => {
    if (typeof window === 'undefined') return
    try {
      window.gtag?.('event', 'page_view', {
        page_path: url,
        page_location: window.location.origin + url,
        page_title: title,
      })
      // GTM data layer (we load GTM globally; this is the canonical pageview signal).
      track('virtual_pageview', { page_path: url, page_title: title })
    } catch (err) {
      console.error('[NextArticleStream] ga pageview failed', err)
    }
  }, [])

  const swapUrl = useCallback(
    (url: string, title: string, isOriginal: boolean) => {
      if (typeof window === 'undefined') return
      if (currentUrlRef.current === url) return
      try {
        window.history.replaceState({ streamedArticle: !isOriginal }, '', url)
        document.title = title
        currentUrlRef.current = url
        // Publish active article so the sticky progress header retitles.
        // Original article: clear (header falls back to its own prop).
        setActiveArticle(isOriginal ? null : { title, url })
        fireGaPageview(url, title)
      } catch (err) {
        console.error('[NextArticleStream] url swap failed', err)
      }
    },
    [fireGaPageview]
  )

  const loadNext = useCallback(async () => {
    if (loadingRef.current || exhausted) return
    if (articles.length >= maxArticles) return

    loadingRef.current = true
    setLoading(true)
    try {
      const cursor = articles.length === 0 ? initialPostId : articles[articles.length - 1].payload.post.id
      const exclude = [initialPostId, ...articles.map((a) => a.payload.post.id)].join(',')
      const params = new URLSearchParams({ afterId: String(cursor) })
      if (team) params.set('team', team)
      if (exclude) params.set('exclude', exclude)

      const res = await fetch(`/api/articles/next?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        console.error('[NextArticleStream] fetch failed', res.status)
        setExhausted(true)
        return
      }
      const json = (await res.json()) as { post: unknown } | StreamedArticlePayload
      // API returns { post: null } when no further article exists.
      if (!json || (json as { post: unknown }).post === null) {
        setExhausted(true)
        return
      }
      const payload = json as StreamedArticlePayload
      setArticles((prev) => [...prev, { payload, viewed: false }])
    } catch (err) {
      console.error('[NextArticleStream] error', err)
      setExhausted(true)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [articles, exhausted, initialPostId, maxArticles, team])

  // Observe the bottom sentinel — kick a fetch when the user is within ~1200px
  // of it (i.e. nearing the end of the current last article).
  useEffect(() => {
    if (reachedCap || exhausted) return
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadNext()
            break
          }
        }
      },
      { rootMargin: '0px 0px 1200px 0px' }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [reachedCap, exhausted, loadNext, articles.length])

  const onArticleActive = useCallback(
    (data: StreamedArticlePayload) => {
      swapUrl(data.url, data.post.title, false)
    },
    [swapUrl]
  )

  // When the user scrolls back above the streamed area, restore original URL.
  // We use a top-of-stream sentinel that fires when it's below the viewport.
  const topSentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const node = topSentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // boundingClientRect.top > 0 means sentinel is below the viewport
          // top — i.e. user is reading the original article.
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            swapUrl(initialPostUrl, initialPostTitle, true)
          }
        }
      },
      { threshold: 0 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [initialPostTitle, initialPostUrl, swapUrl])

  // Clear active article state when the stream unmounts (e.g. user navigates
  // to a different page) so the next page boots with a clean slate.
  useEffect(() => {
    return () => setActiveArticle(null)
  }, [])

  return (
    <div data-next-article-stream>
      <div ref={topSentinelRef} aria-hidden style={{ height: 1 }} />

      {articles.map((a) => (
        <StreamedArticle
          key={a.payload.post.id}
          data={a.payload}
          onActive={onArticleActive}
        />
      ))}

      {/* Sentinel for triggering the next fetch */}
      {!reachedCap && !exhausted && (
        <div
          ref={sentinelRef}
          aria-hidden
          style={{ height: 1, width: '100%' }}
          data-next-article-sentinel
        />
      )}

      {loading && (
        <div
          style={{
            margin: '32px auto',
            maxWidth: 900,
            padding: '0 24px',
            textAlign: 'center',
            color: 'var(--sm-text-dim)',
            fontSize: 13,
          }}
        >
          Loading next article…
        </div>
      )}

      {/* After the cap, render a hard-nav teaser so the next click resets the
          page (memory, ad freq caps, CWV measurement). */}
      {reachedCap && (
        <CapTeaser
          afterId={articles[articles.length - 1].payload.post.id}
          team={team}
          excludeIds={[initialPostId, ...articles.map((a) => a.payload.post.id)]}
        />
      )}
    </div>
  )
}

/**
 * After the streaming cap is reached, surface a single "Read Next" CTA that
 * is a real <a href> so navigation resets the page state cleanly.
 */
function CapTeaser({
  afterId,
  team,
  excludeIds,
}: {
  afterId: number
  team: string | null
  excludeIds: number[]
}) {
  const [next, setNext] = useState<StreamedArticlePayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ afterId: String(afterId) })
    if (team) params.set('team', team)
    if (excludeIds.length > 0) params.set('exclude', excludeIds.join(','))
    fetch(`/api/articles/next?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && (data as StreamedArticlePayload).post) {
          setNext(data as StreamedArticlePayload)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [afterId, team, excludeIds])

  if (loading || !next) return null

  return (
    <div
      style={{
        margin: '64px auto',
        maxWidth: 900,
        padding: '0 24px',
      }}
    >
      <a
        href={next.url}
        style={{
          display: 'block',
          textDecoration: 'none',
          padding: 24,
          borderRadius: 14,
          border: '1px solid var(--sm-border)',
          background: 'var(--sm-surface)',
          color: 'var(--sm-text)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#BC0000',
            marginBottom: 8,
          }}
        >
          Read Next →
        </p>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.25,
            color: 'var(--sm-text)',
            margin: 0,
          }}
        >
          {next.post.title}
        </h3>
        {next.post.excerpt && (
          <p
            style={{
              marginTop: 10,
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--sm-text-muted)',
            }}
          >
            {next.post.excerpt}
          </p>
        )}
      </a>
    </div>
  )
}
