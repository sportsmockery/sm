"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { homepageTeams } from "@/lib/homepage-team-data"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { EngagementRow } from "@/components/homepage/RiverCards"

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
  stats?: { comments: number; retweets: number; likes: number; views: string }
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
  stats,
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
      {/* Image — uses Next.js Image for automatic optimization and lazy loading */}
      {imageUrl && imageUrl.length > 0 && (
        <Link href={articleUrl || '#'} className="block relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <Image
            src={imageUrl}
            alt={headline}
            fill
            sizes="(max-width: 600px) 100vw, 600px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
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

        {/* Engagement row — EXACT match to REPORT cards via shared EngagementRow */}
        {stats && (
          <EngagementRow
            stats={stats}
            articleUrl={articleUrl}
            listenButtonStyle="circle"
            slug={slug}
            headline={headline}
          />
        )}
      </div>
    </article>
  )
}
