"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { homepageTeams } from "@/lib/homepage-team-data"

interface TopIntelligenceCardProps {
  headline: string
  summary: string
  imageUrl?: string
  team: string
  teamColor: string
  timestamp: string
  slug?: string
  categorySlug?: string
}

export default function TopIntelligenceCard({ headline, summary, imageUrl, team, teamColor, timestamp, slug, categorySlug }: TopIntelligenceCardProps) {
  const router = useRouter()
  const articleUrl = slug && categorySlug ? `/${categorySlug}/${slug}` : undefined
  const teamMeta = homepageTeams.find((t) => t.name.toLowerCase() === team.toLowerCase())
  const teamLogoSrc = teamMeta?.logo
  // For cards, Bears use orange (#C83803); others use primary team color from feed or homepageTeams
  const borderColor = teamMeta?.name.toLowerCase() === 'bears' ? '#C83803' : (teamMeta?.color ?? teamColor)

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

        {/* Summary */}
        <p className="mt-3 line-clamp-3" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>
          {summary}
        </p>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          {articleUrl ? (
            <Link
              href={articleUrl}
              className="flex items-center gap-1 transition-colors"
              style={{ fontSize: 14, fontWeight: 600, color: '#BC0000' }}
            >
              <span>Read full story</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span
              className="flex items-center gap-1"
              style={{ fontSize: 14, fontWeight: 600, color: '#BC0000' }}
            >
              <span>Read full story</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}

          {/* Ask Scout */}
          <button
            onClick={() => router.push(`/scout-ai?q=${encodeURIComponent(`Tell me about: ${headline}`)}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
            style={{ background: 'var(--hp-muted)' }}
          >
            <Image
              src="/downloads/scout-v2.png"
              alt="Scout"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--hp-foreground)' }}>Ask Scout</span>
          </button>
        </div>
      </div>
    </article>
  )
}
