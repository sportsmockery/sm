"use client"

import { ChevronRight, Eye, MessageCircle, Share } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { homepageTeams } from "@/lib/homepage-team-data"
import { useAudioPlayer } from "@/context/AudioPlayerContext"

/** Team accent for top story card left border (matches feed card team colors). */
function getTopStoryTeamAccent(team: string): string | undefined {
  const n = team.toLowerCase().replace(/\s+/g, ' ').trim()
  if (n.includes('bears')) return '#C83803'
  if (n.includes('cubs')) return '#0E3386'
  if (n.includes('bulls')) return '#CE1141'
  if (n.includes('blackhawks')) return '#00833E'
  if (n.includes('white sox') || n.includes('whitesox') || n.includes('white-sox')) return '#FFFFFF'
  return undefined
}

interface TopIntelligenceCardProps {
  headline: string
  summary: string
  imageUrl?: string
  team: string
  teamColor: string
  timestamp: string
  slug?: string
  categorySlug?: string
  viewsLabel?: string
}

export default function TopIntelligenceCard({
  headline,
  summary,
  imageUrl,
  team,
  teamColor,
  timestamp,
  slug,
  categorySlug,
  viewsLabel,
}: TopIntelligenceCardProps) {
  const router = useRouter()
  const audio = useAudioPlayer()
  const articleUrl = slug && categorySlug ? `/${categorySlug}/${slug}` : undefined
  const teamMeta = homepageTeams.find((t) => t.name.toLowerCase() === team.toLowerCase())
  const teamLogoSrc = teamMeta?.logo
  // For cards, Bears use orange (#C83803); others use primary team color from feed or homepageTeams
  const borderColor = teamMeta?.name.toLowerCase() === 'bears' ? '#C83803' : (teamMeta?.color ?? teamColor)
  const teamAccentLeft = getTopStoryTeamAccent(team)
  const isThisArticlePlaying = slug && audio.currentArticle?.slug === slug && audio.isPlaying

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements (buttons, links)
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) return
    if (articleUrl) router.push(articleUrl)
  }

  return (
    <article
      className="mx-4 mb-5 overflow-hidden cursor-pointer group"
      onClick={handleCardClick}
      style={{
        borderRadius: 16,
        border: `2px solid ${borderColor}`,
        borderLeft: teamAccentLeft ? `3px solid ${teamAccentLeft}` : undefined,
        background: 'var(--hp-card)',
        boxShadow: `0 0 28px ${borderColor}50, 0 0 14px ${borderColor}30, 0 4px 12px rgba(0,0,0,0.08)`,
        transition: 'all 0.3s',
      }}
    >
      {/* Image */}
      {imageUrl && imageUrl.length > 0 && (
        <Link href={articleUrl || '#'} className="block relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={imageUrl}
            alt={headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)' }}
          />
        </Link>
      )}

      <div className="p-5">
        {/* Label Row — team logo top right (where pill was) */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BC0000' }}>
              TOP STORY
            </span>
            <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
          </div>
          {teamLogoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={teamLogoSrc}
              alt={team}
              width={28}
              height={28}
              style={{ width: 28, height: 28, objectFit: 'contain' }}
              crossOrigin="anonymous"
            />
          ) : (
            <span
              className="inline-flex items-center justify-center rounded-full"
              style={{
                width: 28,
                height: 28,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: borderColor,
                color: '#FAFAFB',
              }}
            >
              {team.charAt(0)}
            </span>
          )}
        </div>

        {/* Headline */}
        {articleUrl ? (
          <Link href={articleUrl}>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>
              {headline}
            </h2>
          </Link>
        ) : (
          <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>
            {headline}
          </h2>
        )}

        {/* Summary with inline "Read article" link, like Scout Insight */}
        <p className="mt-3 line-clamp-3" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>
          {summary}
          {articleUrl && (
            <>
              {' '}
              <Link
                href={articleUrl}
                className="hp-tap-target transition-colors hover:opacity-80"
                style={{ fontSize: 13, fontWeight: 500, color: '#BC0000', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Read article
              </Link>
            </>
          )}
        </p>

        {/* Engagement row — reactions + play on left, comments/views/share on right */}
        <div className="mt-4 flex items-center justify-between" style={{ color: 'var(--hp-muted-foreground)' }}>
          <div className="flex items-center gap-3">
            {/* Thumbs up with count */}
            <button
              type="button"
              className="group flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-all hp-tap-target hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]"
              aria-label="Smart Take"
            >
              <span style={{ fontSize: 14 }}>👍</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>—</span>
            </button>
            {/* Fire with count */}
            <button
              type="button"
              className="group flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-all hp-tap-target hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]"
              aria-label="Hot"
            >
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>—</span>
            </button>

            {/* Gray listen button — same as REPORT cards, now in left group */}
            {articleUrl && slug && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (isThisArticlePlaying) audio.pause()
                  else audio.play({ title: headline, slug, url: `/api/audio/${encodeURIComponent(slug)}?voice=will` })
                }}
                className="group flex items-center justify-center rounded-full transition-transform hp-tap-target hover:scale-105"
                style={{ width: 38, height: 38, backgroundColor: '#d1d5db', border: '1px solid rgba(11,15,20,0.12)' }}
                aria-label={isThisArticlePlaying ? 'Pause' : 'Listen to article'}
              >
                {isThisArticlePlaying ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="#FAFAFB" viewBox="0 0 24 24" aria-hidden>
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5 flex-shrink-0" fill="#FAFAFB" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Comments bubble – icon + count, like REPORT cards */}
            <span className="group flex items-center gap-1 hp-tap-target" aria-label="Comments">
              <div className="rounded-full p-2">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span style={{ fontSize: 12 }}>—</span>
            </span>

            {/* Views – eye icon only, like REPORT cards */}
            <span className="flex items-center gap-1 hp-tap-target" style={{ fontSize: 12 }} title="Views">
              <div className="rounded-full p-2">
                <Eye className="h-4 w-4" />
              </div>
              {viewsLabel && viewsLabel !== '0' ? viewsLabel : '0'}
            </span>

            {/* Share */}
            <button
              type="button"
              onClick={async () => {
                const url = articleUrl ? `${window.location.origin}${articleUrl}` : window.location.href
                if (navigator.share) {
                  try {
                    await navigator.share({ url })
                  } catch {
                    // user cancelled
                  }
                } else {
                  try {
                    await navigator.clipboard.writeText(url)
                  } catch {
                    // clipboard not available
                  }
                }
              }}
              className="rounded-full p-2 transition-colors hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] hp-tap-target"
              aria-label="Share"
            >
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
