'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate, truncate } from '@/lib/formatters'
import AnimatedCard from '@/components/motion/AnimatedCard'
import type {
  VisionTheaterData,
  VisionTheaterVideo,
} from '@/lib/getVisionTheaterVideos'

// ---------- Types ----------

interface Comment {
  id: string
  video_id: string
  user_id: string
  user_name: string
  user_avatar: string | null
  content: string
  created_at: string
}

// ---------- Constants ----------

const CHANNEL_FILTERS = [
  { slug: 'all', label: 'All Videos' },
  { slug: 'bears-film-room', label: 'Bears Film Room' },
  { slug: 'pinwheels-and-ivy', label: 'Pinwheels & Ivy' },
  { slug: 'untold-chicago', label: 'Untold Chicago Stories' },
] as const

const KEYWORD_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'uplifting', label: 'Uplifting Wins' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'history', label: 'History' },
] as const

const UPLIFTING_KEYWORDS = ['win', 'victory', 'triumph', 'comeback', 'champion', 'hero', 'best', 'greatest']
const ANALYSIS_KEYWORDS = ['breakdown', 'analysis', 'film', 'review', 'tape', 'scheme', 'play']
const HISTORY_KEYWORDS = ['history', 'story', 'untold', 'legend', 'classic', 'remember', 'throwback']

const PAGE_SIZE = 12

// ---------- Component ----------

export default function VisionTheaterClient({ data }: { data: VisionTheaterData }) {
  const { theme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  // Video browsing state
  const [activeVideo, setActiveVideo] = useState<VisionTheaterVideo | null>(null)
  const [channelFilter, setChannelFilter] = useState('all')
  const [keywordFilter, setKeywordFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [commentPosting, setCommentPosting] = useState(false)

  // Scout AI modal state
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [scoutQuery, setScoutQuery] = useState('')
  const [scoutResponse, setScoutResponse] = useState('')
  const [scoutLoading, setScoutLoading] = useState(false)
  const [dismissScout, setDismissScout] = useState(false)

  // YouTube player
  const playerRef = useRef<YT.Player | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const ytReadyRef = useRef(false)

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)

  // ---------- Filtered videos ----------

  const { fullVideos, shorts } = useMemo(() => {
    let vids = data.allVideos

    // Channel filter
    if (channelFilter !== 'all') {
      vids = vids.filter((v) => v.channelSlug === channelFilter)
    }

    // Keyword filter
    if (keywordFilter !== 'all') {
      const keywords =
        keywordFilter === 'uplifting'
          ? UPLIFTING_KEYWORDS
          : keywordFilter === 'analysis'
            ? ANALYSIS_KEYWORDS
            : HISTORY_KEYWORDS
      vids = vids.filter((v) => {
        const title = v.title.toLowerCase()
        return keywords.some((kw) => title.includes(kw))
      })
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      vids = vids.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
      )
    }

    // Split into full videos and shorts
    const fullVideos = vids.filter((v) => !v.isShort)
    const shorts = vids.filter((v) => v.isShort)

    return { fullVideos, shorts }
  }, [data.allVideos, channelFilter, keywordFilter, searchQuery])

  const totalFilteredCount = fullVideos.length + shorts.length

  // ---------- Load YouTube IFrame API ----------

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.YT?.Player) {
      ytReadyRef.current = true
      return
    }

    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]')
    if (existing) return

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(tag, firstScript)

    window.onYouTubeIframeAPIReady = () => {
      ytReadyRef.current = true
    }
  }, [])

  // ---------- Create/Destroy YouTube player ----------

  useEffect(() => {
    if (!activeVideo) return

    const initPlayer = () => {
      if (!window.YT?.Player) return

      // Destroy existing player
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // Ignore destroy errors
        }
        playerRef.current = null
      }

      playerRef.current = new window.YT.Player('vt-yt-player', {
        videoId: activeVideo.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // 2 = PAUSED
            if (event.data === 2 && !dismissScout) {
              setShowScoutModal(true)
            }
          },
        },
      })
    }

    if (ytReadyRef.current) {
      // Small delay to ensure DOM element exists
      setTimeout(initPlayer, 100)
    } else {
      // Wait for API to load
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        ytReadyRef.current = true
        prev?.()
        initPlayer()
      }
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch {
          // Ignore
        }
        playerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideo?.videoId])

  // ---------- Infinite scroll ----------

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < fullVideos.length) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, fullVideos.length))
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, fullVideos.length])

  // Reset visible count on filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [channelFilter, keywordFilter, searchQuery])

  // ---------- Fetch comments when active video changes ----------

  const fetchComments = useCallback(async (videoId: string) => {
    try {
      const res = await fetch(`/api/vision-theater/comments?videoId=${encodeURIComponent(videoId)}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments ?? [])
      }
    } catch (err) {
      console.error('[VisionTheater] Failed to fetch comments:', err)
    }
  }, [])

  useEffect(() => {
    if (activeVideo) {
      fetchComments(activeVideo.videoId)
    } else {
      setComments([])
    }
  }, [activeVideo, fetchComments])

  // ---------- Post comment ----------

  const handlePostComment = async () => {
    if (!activeVideo || !commentInput.trim() || commentPosting) return

    setCommentPosting(true)
    try {
      const res = await fetch('/api/vision-theater/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: activeVideo.videoId, content: commentInput.trim() }),
      })
      if (res.ok) {
        setCommentInput('')
        fetchComments(activeVideo.videoId)
      }
    } catch (err) {
      console.error('[VisionTheater] Failed to post comment:', err)
    } finally {
      setCommentPosting(false)
    }
  }

  // ---------- Scout AI query ----------

  const handleScoutQuery = async () => {
    if (!scoutQuery.trim() || scoutLoading) return

    setScoutLoading(true)
    setScoutResponse('')
    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: scoutQuery }),
      })
      if (res.ok) {
        const data = await res.json()
        setScoutResponse(data.response || 'No response received.')
      } else {
        setScoutResponse('Sorry, Scout AI is temporarily unavailable.')
      }
    } catch {
      setScoutResponse('Failed to connect to Scout AI.')
    } finally {
      setScoutLoading(false)
    }
  }

  const handleResumeVideo = () => {
    setShowScoutModal(false)
    setScoutQuery('')
    setScoutResponse('')
    playerRef.current?.playVideo()
  }

  // ---------- Select a video ----------

  const handleSelectVideo = (video: VisionTheaterVideo) => {
    setActiveVideo(video)
    setDismissScout(false)
    // Scroll to player
    setTimeout(() => {
      playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  // ---------- Render ----------

  const isDark = theme === 'dark'

  // Generate 1000 floating orbs with randomized properties
  const orbs = useMemo(() => {
    // Seeded pseudo-random for consistent SSR/CSR
    const seed = (n: number) => {
      let s = n
      return () => {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
      }
    }
    const rand = seed(42)

    return Array.from({ length: 1000 }, (_, i) => {
      const r = rand()
      const size = r < 0.7 ? 2 + rand() * 4 : r < 0.95 ? 5 + rand() * 8 : 10 + rand() * 18
      const x = rand() * 100
      const y = rand() * 100
      const duration = 4 + rand() * 14
      const delay = rand() * -20
      const driftX = -30 + rand() * 60
      const driftY = -30 + rand() * 60
      const opacity = size > 10 ? 0.15 + rand() * 0.25 : size > 5 ? 0.2 + rand() * 0.4 : 0.3 + rand() * 0.5
      // Color variety: mostly reds, some oranges/whites
      const colorPick = rand()
      const color =
        colorPick < 0.5
          ? `rgba(188,0,0,${opacity})`
          : colorPick < 0.75
            ? `rgba(255,68,68,${opacity})`
            : colorPick < 0.9
              ? `rgba(255,120,60,${opacity * 0.7})`
              : `rgba(255,255,255,${opacity * 0.5})`
      const blur = size > 8 ? 2 + rand() * 4 : size > 4 ? 0.5 + rand() * 2 : 0

      return { i, size, x, y, duration, delay, driftX, driftY, color, blur }
    })
  }, [])

  return (
    <div
      style={{
        background: 'var(--sm-dark, #050508)',
        color: 'var(--sm-text, #ffffff)',
        fontFamily: 'Inter, -apple-system, sans-serif',
        minHeight: '100vh',
      }}
    >
      {/* ========== HERO SECTION ========== */}
      <section
        style={{
          position: 'relative',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(188,0,0,0.15) 0%, rgba(5,5,8,1) 50%, rgba(255,68,68,0.05) 100%)',
        }}
      >
        {/* 1000 floating orbs */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {orbs.map((o) => (
            <div
              key={o.i}
              className="vt-orb"
              style={{
                position: 'absolute',
                left: `${o.x}%`,
                top: `${o.y}%`,
                width: `${o.size}px`,
                height: `${o.size}px`,
                borderRadius: '50%',
                background: o.color,
                filter: o.blur > 0 ? `blur(${o.blur}px)` : undefined,
                animation: `vtOrbDrift ${o.duration}s ease-in-out ${o.delay}s infinite`,
                ['--drift-x' as string]: `${o.driftX}px`,
                ['--drift-y' as string]: `${o.driftY}px`,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', textAlign: 'center', padding: '48px 24px', maxWidth: '700px', zIndex: 1 }}>
          {/* Eyebrow pill — matches SM 2.0 homepage */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '100px',
              background: 'rgba(188, 0, 0, 0.08)',
              border: '1px solid rgba(188, 0, 0, 0.15)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#ff4444',
              letterSpacing: '0.3px',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#ff4444',
                animation: 'vtEyebrowPulse 2s infinite',
              }}
            />
            Vision Theater
          </div>

          {/* Title — Bebas Neue with red glow, matching SM 2.0 hero */}
          <h1
            style={{
              fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
              fontSize: 'clamp(4rem, 9vw, 7.5rem)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              color: '#ffffff',
              margin: '0 0 24px',
              textShadow:
                '0 0 10px rgba(188, 0, 0, 0.6), 0 0 40px rgba(188, 0, 0, 0.4), 0 0 80px rgba(188, 0, 0, 0.3), 0 0 140px rgba(188, 0, 0, 0.2), 0 0 200px rgba(188, 0, 0, 0.1)',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #bc0000, #ff4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Vision Theater
            </span>
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#8a8a9a',
              lineHeight: 1.6,
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            Stream the latest from Bears Film Room, Pinwheels &amp; Ivy, and Untold Chicago Stories
            &mdash; all in one place.
          </p>
        </div>
      </section>

      {/* ========== FILTER BAR ========== */}
      <section
        style={{
          position: 'sticky',
          top: 'var(--sm-nav-height, 72px)',
          zIndex: 10,
          background: 'var(--sm-dark, #050508)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {/* Channel filter buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CHANNEL_FILTERS.map((f) => (
              <button
                key={f.slug}
                onClick={() => setChannelFilter(f.slug)}
                style={{
                  backgroundColor: channelFilter === f.slug ? '#bc0000' : '#13131d',
                  color: channelFilter === f.slug ? '#ffffff' : '#8a8a9a',
                  border: '1px solid ' + (channelFilter === f.slug ? '#bc0000' : 'rgba(255,255,255,0.1)'),
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Keyword filter */}
          <select
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            style={{
              backgroundColor: '#13131d',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
          >
            {KEYWORD_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Search input */}
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: '#13131d',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              flex: '1 1 200px',
              minWidth: '150px',
              outline: 'none',
            }}
          />
        </div>
      </section>

      {/* ========== VIDEO PLAYER (when active) ========== */}
      <AnimatePresence>
        {activeVideo && (
          <motion.section
            ref={playerContainerRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '32px 24px 0',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '24px',
              }}
            >
              {/* Player */}
              <div>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#0c0c12',
                  }}
                >
                  <div
                    id="vt-yt-player"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>

                {/* Video info */}
                <div style={{ marginTop: '16px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#bc0000',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {activeVideo.channelName}
                  </span>
                  <h2
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: '4px 0 8px',
                    }}
                  >
                    {activeVideo.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#8a8a9a', lineHeight: 1.6 }}>
                    {formatDate(activeVideo.publishedAt)} &middot;{' '}
                    {truncate(activeVideo.description, 300)}
                  </p>
                  <button
                    onClick={() => {
                      if (playerRef.current) {
                        try { playerRef.current.destroy() } catch { /* ignore */ }
                        playerRef.current = null
                      }
                      setActiveVideo(null)
                    }}
                    style={{
                      marginTop: '12px',
                      backgroundColor: 'transparent',
                      color: '#8a8a9a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Close Player
                  </button>
                </div>
              </div>

              {/* Comments section */}
              <div
                style={{
                  background: '#0c0c12',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#ffffff',
                    margin: '0 0 16px',
                    fontFamily: '"Space Grotesk", sans-serif',
                  }}
                >
                  Fan Comments
                </h3>

                {/* Comment form */}
                {isAuthenticated ? (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder="Share your thoughts..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                      maxLength={1000}
                      style={{
                        flex: 1,
                        backgroundColor: '#13131d',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={commentPosting || !commentInput.trim()}
                      style={{
                        backgroundColor: '#bc0000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: commentPosting ? 'not-allowed' : 'pointer',
                        opacity: commentPosting || !commentInput.trim() ? 0.5 : 1,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {commentPosting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#8a8a9a', marginBottom: '16px' }}>
                    <Link
                      href={`/login?next=${encodeURIComponent('/vision-theater')}`}
                      style={{ color: '#bc0000', textDecoration: 'underline' }}
                    >
                      Sign in
                    </Link>{' '}
                    to leave a comment.
                  </p>
                )}

                {/* Comment list */}
                {comments.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#55556a', fontStyle: 'italic' }}>
                    No comments yet. Be the first!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          padding: '10px',
                          background: '#13131d',
                          borderRadius: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#1a1a28',
                            flexShrink: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            color: '#8a8a9a',
                          }}
                        >
                          {c.user_avatar ? (
                            <img
                              src={c.user_avatar}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            c.user_name[0]?.toUpperCase() ?? '?'
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                              {c.user_name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#55556a' }}>
                              {formatDate(c.created_at)}
                            </span>
                          </div>
                          <p style={{ fontSize: '14px', color: '#8a8a9a', margin: '4px 0 0', lineHeight: 1.5 }}>
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ========== VIDEOS & LIVE SECTION ========== */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
            }}
          >
            {channelFilter === 'all'
              ? 'Latest Videos'
              : CHANNEL_FILTERS.find((f) => f.slug === channelFilter)?.label ?? 'Videos'}
          </h2>
          <span style={{ fontSize: '13px', color: '#55556a' }}>
            {fullVideos.length} video{fullVideos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {fullVideos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: '#55556a',
              fontSize: '16px',
            }}
          >
            No full-length videos match your filters.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {fullVideos.slice(0, visibleCount).map((video, index) => (
              <AnimatedCard
                key={video.videoId}
                index={index % PAGE_SIZE}
                hoverLift
                as="article"
                style={{
                  background: '#13131d',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => handleSelectVideo(video)}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', overflow: 'hidden' }}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Play overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    className="vt-play-overlay"
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(188,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Channel badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {video.channelName}
                  </span>
                </div>

                {/* Card content */}
                <div style={{ padding: '16px' }}>
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: '0 0 6px',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {video.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#8a8a9a',
                      margin: '0 0 8px',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {truncate(video.description, 100)}
                  </p>
                  <span style={{ fontSize: '11px', color: '#55556a' }}>
                    {formatDate(video.publishedAt)}
                  </span>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel for full videos */}
        {visibleCount < fullVideos.length && (
          <div
            ref={sentinelRef}
            style={{
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#55556a',
              fontSize: '14px',
              marginTop: '24px',
            }}
          >
            Loading more videos...
          </div>
        )}
      </section>

      {/* ========== SHORTS SECTION ========== */}
      {shorts.length > 0 && (
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px 48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            {/* Shorts icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#bc0000">
              <path d="M10 9.35 15 12l-5 2.65zM12 1a2.13 2.13 0 0 0-.64.1A9.84 9.84 0 0 0 4.17 5a9.9 9.9 0 0 0 0 14 9.84 9.84 0 0 0 7.19 3.9A10.07 10.07 0 0 0 12 23a9.84 9.84 0 0 0 7.19-3.9 9.9 9.9 0 0 0 0-14A9.84 9.84 0 0 0 12.64 1.1 2.13 2.13 0 0 0 12 1z" />
            </svg>
            <h2
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
              }}
            >
              Shorts
            </h2>
            <span style={{ fontSize: '13px', color: '#55556a' }}>
              {shorts.length} clip{shorts.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '14px',
            }}
          >
            {shorts.map((video, index) => (
              <AnimatedCard
                key={video.videoId}
                index={index}
                hoverLift
                as="article"
                style={{
                  background: '#13131d',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => handleSelectVideo(video)}
              >
                {/* Vertical thumbnail (9:16 aspect) */}
                <div style={{ position: 'relative', paddingBottom: '177%', overflow: 'hidden' }}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Play overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.25)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    className="vt-play-overlay"
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(188,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Shorts badge */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: 'rgba(188,0,0,0.85)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Short
                  </span>
                  {/* Channel badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {video.channelName}
                  </span>
                </div>

                {/* Card content */}
                <div style={{ padding: '10px 12px' }}>
                  <h3
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {video.title}
                  </h3>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>
      )}

      {/* ========== CATEGORIES ========== */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 48px',
        }}
      >
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#8a8a9a',
            textAlign: 'center',
            margin: '0 0 24px',
          }}
        >
          Browse by Channel
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {data.channels.map((ch) => (
            <button
              key={ch.slug}
              onClick={() => {
                setChannelFilter(ch.slug)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              style={{
                backgroundColor: '#13131d',
                color: '#bc0000',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: '"Space Grotesk", sans-serif',
                transition: 'all 0.2s',
                minWidth: '200px',
                textAlign: 'center',
              }}
            >
              {ch.name}
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#55556a',
                  fontWeight: 400,
                  marginTop: '4px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {ch.videos.length} videos
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ========== MOBILE APP TEASER ========== */}
      <section
        style={{
          background: '#0c0c12',
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#8a8a9a',
            margin: '0 0 12px',
          }}
        >
          Take It Anywhere
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: '#ffffff',
            margin: '0 0 24px',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
          }}
        >
          Download the Sports Mockery app for on-the-go access to all your favorite Chicago sports
          content.
        </p>
        <button
          style={{
            backgroundColor: '#bc0000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Coming Soon
        </button>
      </section>

      {/* ========== FOOTER ========== */}
      <section
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          color: '#55556a',
          fontSize: '13px',
        }}
      >
        &copy; {new Date().getFullYear()} Sports Mockery &mdash; Chicago Sports, Always.
      </section>

      {/* ========== SCOUT AI MODAL ========== */}
      <AnimatePresence>
        {showScoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              padding: '24px',
            }}
            onClick={() => {
              setShowScoutModal(false)
              setScoutQuery('')
              setScoutResponse('')
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#13131d',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 0 40px rgba(188,0,0,0.15)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Image
                  src="/downloads/scout-v2.png"
                  alt="Scout AI"
                  width={36}
                  height={36}
                  style={{ borderRadius: '8px' }}
                />
                <div>
                  <h3
                    style={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: 0,
                    }}
                  >
                    Scout AI
                  </h3>
                  <p style={{ fontSize: '12px', color: '#8a8a9a', margin: 0 }}>
                    Video paused &mdash; got a question about what you&apos;re watching?
                  </p>
                </div>
              </div>

              {/* Query input */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Ask Scout anything about Chicago sports..."
                  value={scoutQuery}
                  onChange={(e) => setScoutQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScoutQuery()}
                  style={{
                    flex: 1,
                    backgroundColor: '#0c0c12',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleScoutQuery}
                  disabled={scoutLoading || !scoutQuery.trim()}
                  style={{
                    backgroundColor: '#bc0000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: scoutLoading ? 'not-allowed' : 'pointer',
                    opacity: scoutLoading || !scoutQuery.trim() ? 0.5 : 1,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {scoutLoading ? '...' : 'Ask'}
                </button>
              </div>

              {/* Response */}
              {scoutResponse && (
                <div
                  style={{
                    background: '#0c0c12',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#8a8a9a',
                    lineHeight: 1.6,
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {scoutResponse}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setDismissScout(true)
                    setShowScoutModal(false)
                    setScoutQuery('')
                    setScoutResponse('')
                    playerRef.current?.playVideo()
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#55556a',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Don&apos;t show again
                </button>
                <button
                  onClick={handleResumeVideo}
                  style={{
                    backgroundColor: '#bc0000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Resume Video
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== CSS ANIMATION ========== */}
      <style jsx global>{`
        @keyframes vtOrbDrift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          25% {
            transform: translate(calc(var(--drift-x) * 0.5), var(--drift-y)) scale(1.1);
            opacity: 0.6;
          }
          50% {
            transform: translate(var(--drift-x), calc(var(--drift-y) * 0.3)) scale(0.9);
            opacity: 1;
          }
          75% {
            transform: translate(calc(var(--drift-x) * 0.3), calc(var(--drift-y) * -0.5)) scale(1.05);
            opacity: 0.7;
          }
        }
        @keyframes vtEyebrowPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        article:hover .vt-play-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
