'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { FanCreator } from '@/types/fan-showcase'
import { TEAM_LABELS, CONTENT_TYPE_LABELS, TEAM_ACCENT_COLORS, type Team, type ContentType } from '@/types/fan-showcase'

interface CreatorCardProps {
  creator: FanCreator & { has_approved_work?: boolean }
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const accent = TEAM_ACCENT_COLORS[creator.primary_team as Team]

  return (
    <div
      className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 transition-all duration-200 hover:border-[var(--border-strong)]"
      style={{ borderTopWidth: 3, borderTopColor: accent }}
    >
      <div className="flex items-start gap-3">
        {creator.avatar_url ? (
          <Image
            src={creator.avatar_url}
            alt={creator.display_name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-medium text-white"
            style={{ backgroundColor: accent === '#FFFFFF' ? '#555' : accent }}
          >
            {creator.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-[var(--text-primary)]">{creator.display_name}</h4>
          {creator.handle && (
            <p className="text-[13px] text-[var(--text-muted)]">@{creator.handle}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[13px] font-medium"
          style={{
            backgroundColor: accent === '#FFFFFF' ? 'var(--bg-secondary)' : accent,
            color: accent === '#FFFFFF' ? 'var(--text-primary)' : '#fff',
          }}
        >
          {TEAM_LABELS[creator.primary_team as Team]}
        </span>
        {creator.content_focus && (
          <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[13px] text-[var(--text-muted)]">
            {CONTENT_TYPE_LABELS[creator.content_focus as ContentType]}
          </span>
        )}
      </div>

      {creator.bio && (
        <p className="mt-3 text-sm text-[var(--text-muted)] line-clamp-2">{creator.bio}</p>
      )}

      {creator.has_approved_work && (
        <Link
          href={`/fan-showcase?creator=${creator.id}`}
          className="mt-3 inline-block text-sm font-medium text-[#BC0000] hover:underline"
        >
          View featured work &rarr;
        </Link>
      )}
    </div>
  )
}
