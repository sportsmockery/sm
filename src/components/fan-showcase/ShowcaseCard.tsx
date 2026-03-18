'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { FanSubmission, FanSubmissionAsset, FanCreator } from '@/types/fan-showcase'
import { CONTENT_TYPE_LABELS, TEAM_LABELS, TEAM_ACCENT_COLORS, type Team } from '@/types/fan-showcase'

interface ShowcaseCardProps {
  submission: FanSubmission & {
    creator: FanCreator
    assets: FanSubmissionAsset[]
  }
  variant?: 'default' | 'compact' | 'hero'
}

export default function ShowcaseCard({ submission, variant = 'default' }: ShowcaseCardProps) {
  const { creator, assets, type, team, title, slug, submitted_at, viewed_count } = submission
  const thumbnail = assets?.[0]?.thumbnail_url || assets?.[0]?.asset_url
  const accent = TEAM_ACCENT_COLORS[team as Team]
  const date = new Date(submitted_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (variant === 'hero') {
    return (
      <Link
        href={`/fan-showcase/${slug}`}
        className="group relative block overflow-hidden rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)]"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-secondary)]">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl text-[var(--text-muted)]">{CONTENT_TYPE_LABELS[type]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 p-5"
          style={{ borderLeft: `3px solid ${accent}` }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[13px] font-medium text-white"
              style={{ backgroundColor: accent === '#FFFFFF' ? '#555' : accent }}
            >
              {TEAM_LABELS[team as Team]}
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[13px] font-medium text-white backdrop-blur">
              {CONTENT_TYPE_LABELS[type]}
            </span>
          </div>
          <h3 className="text-lg font-medium text-white line-clamp-2">{title}</h3>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-white/80">
            <span>{creator.display_name}</span>
            {creator.handle && <span className="opacity-70">@{creator.handle}</span>}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/fan-showcase/${slug}`}
        className="group flex gap-3 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-3 transition-all duration-200 hover:border-[var(--border-strong)]"
        style={{ borderLeftWidth: 3, borderLeftColor: accent }}
      >
        {thumbnail && (
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
            <Image src={thumbnail} alt={title} fill className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-[#BC0000]">
            {title}
          </h4>
          <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
            {creator.display_name} &middot; {date}
          </p>
        </div>
      </Link>
    )
  }

  // Default card
  return (
    <Link
      href={`/fan-showcase/${slug}`}
      className="group block overflow-hidden rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] transition-all duration-200 hover:border-[var(--border-strong)]"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      {thumbnail && (
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-secondary)]">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[13px] font-medium"
            style={{
              backgroundColor: accent === '#FFFFFF' ? 'var(--bg-secondary)' : accent,
              color: accent === '#FFFFFF' ? 'var(--text-primary)' : '#fff',
            }}
          >
            {TEAM_LABELS[team as Team]}
          </span>
          <span className="text-[13px] text-[var(--text-muted)]">
            {CONTENT_TYPE_LABELS[type]}
          </span>
        </div>
        <h3 className="text-base font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-[#BC0000]">
          {title}
        </h3>
        {submission.description && (
          <p className="mt-1.5 text-sm text-[var(--text-muted)] line-clamp-2">
            {submission.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-[13px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            {creator.avatar_url && (
              <Image
                src={creator.avatar_url}
                alt={creator.display_name}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <span>{creator.display_name}</span>
            {creator.handle && <span className="opacity-60">@{creator.handle}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span>{date}</span>
            {viewed_count > 0 && <span>{viewed_count.toLocaleString()} views</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
