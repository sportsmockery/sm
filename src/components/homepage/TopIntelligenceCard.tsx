"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  const articleUrl = slug && categorySlug ? `/${categorySlug}/${slug}` : undefined

  return (
    <article
      className="mx-4 mb-5 overflow-hidden cursor-pointer group"
      style={{
        borderRadius: 16,
        border: '2px solid rgba(188, 0, 0, 0.2)',
        background: 'var(--hp-card)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s',
      }}
    >
      {/* Image */}
      {imageUrl && imageUrl.length > 0 && (
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={imageUrl}
            alt={headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)' }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Label Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BC0000' }}>
              TOP STORY
            </span>
            <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
          </div>
          <span
            className="inline-flex items-center px-2 py-0.5 text-white shadow-sm"
            style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: 6, backgroundColor: teamColor }}
          >
            {team}
          </span>
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
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
