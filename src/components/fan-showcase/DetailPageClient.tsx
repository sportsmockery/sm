'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ShowcaseCard from './ShowcaseCard'
import CreatorCard from './CreatorCard'
import type { FanSubmission, FanSubmissionAsset, FanCreator, FanSubmissionTag } from '@/types/fan-showcase'
import {
  TEAM_LABELS, CONTENT_TYPE_LABELS, TEAM_ACCENT_COLORS,
  type Team, type ContentType,
} from '@/types/fan-showcase'

type SubmissionWithRelations = FanSubmission & {
  creator: FanCreator
  assets: FanSubmissionAsset[]
  tags: FanSubmissionTag[]
}

interface DetailData {
  submission: SubmissionWithRelations
  moreFromCreator: (FanSubmission & { assets: FanSubmissionAsset[] })[]
  similarCreators: (FanCreator & { similarity_score: number })[]
}

export default function DetailPageClient({ slug }: { slug: string }) {
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/fan-showcase/${slug}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch (err) {
        console.error('Failed to load detail:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-secondary)]" />
        <div className="h-96 rounded-[14px] bg-[var(--bg-secondary)]" />
        <div className="h-6 w-64 rounded bg-[var(--bg-secondary)]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-12 text-center">
        <p className="text-lg text-[var(--text-muted)]">Submission not found.</p>
        <Link href="/fan-showcase" className="mt-4 inline-block text-[#BC0000] hover:underline">
          Back to Showcase
        </Link>
      </div>
    )
  }

  const { submission, moreFromCreator, similarCreators } = data
  const { creator, assets, tags, type, team, title, description } = submission
  const accent = TEAM_ACCENT_COLORS[team as Team]
  const mainAsset = assets?.[0]
  const publishDate = submission.featured_at || submission.submitted_at
  const dateStr = new Date(publishDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div>
      <Link href="/fan-showcase" className="text-sm text-[var(--text-muted)] hover:text-[#BC0000]">
        &larr; Back to Showcase
      </Link>

      <article className="mt-6">
        {/* Hero media */}
        {mainAsset && (
          <div className="relative mb-6 overflow-hidden rounded-[14px] bg-[var(--bg-secondary)]">
            <Image
              src={mainAsset.asset_url}
              alt={title}
              width={mainAsset.width || 1200}
              height={mainAsset.height || 675}
              className="mx-auto max-h-[600px] w-auto object-contain"
              priority
            />
          </div>
        )}

        {/* Embedded source for edits */}
        {type === 'edit' && submission.source_url && !mainAsset && (
          <div className="mb-6 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">External content:</p>
            <a
              href={submission.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-[#BC0000] hover:underline"
            >
              View on {submission.source_platform || 'source'} &rarr;
            </a>
          </div>
        )}

        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-sm font-medium"
            style={{
              backgroundColor: accent === '#FFFFFF' ? 'var(--bg-secondary)' : accent,
              color: accent === '#FFFFFF' ? 'var(--text-primary)' : '#fff',
            }}
          >
            {TEAM_LABELS[team as Team]}
          </span>
          <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-muted)]">
            {CONTENT_TYPE_LABELS[type as ContentType]}
          </span>
          {tags?.map(t => (
            <span key={t.id} className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[13px] text-[var(--text-muted)]">
              #{t.tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{title}</h1>

        {/* Creator attribution */}
        <div className="mt-4 flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
          {creator.avatar_url ? (
            <Image
              src={creator.avatar_url}
              alt={creator.display_name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: accent === '#FFFFFF' ? '#555' : accent }}
            >
              {creator.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-[var(--text-primary)]">{creator.display_name}</p>
            <p className="text-[13px] text-[var(--text-muted)]">
              {creator.handle && `@${creator.handle} · `}{dateStr}
              {submission.viewed_count > 0 && ` · ${submission.viewed_count.toLocaleString()} views`}
            </p>
          </div>
        </div>

        {/* Content body */}
        <div className="mt-6 max-w-[720px]">
          {description && (
            <p className="text-lg leading-relaxed text-[var(--text-primary)]">{description}</p>
          )}

          {/* Written take */}
          {type === 'take' && submission.written_take && (
            <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-[var(--text-primary)]">
              {submission.written_take}
            </div>
          )}

          {/* Fantasy win details */}
          {type === 'fantasy_win' && (
            <div className="mt-6 space-y-3">
              {submission.league_name && (
                <div>
                  <span className="text-sm font-medium text-[var(--text-muted)]">League: </span>
                  <span className="text-[var(--text-primary)]">{submission.league_name}</span>
                </div>
              )}
              {submission.fantasy_platform && (
                <div>
                  <span className="text-sm font-medium text-[var(--text-muted)]">Platform: </span>
                  <span className="text-[var(--text-primary)]">{submission.fantasy_platform}</span>
                </div>
              )}
              {submission.brag_line && (
                <blockquote
                  className="mt-4 border-l-4 py-2 pl-4 text-lg italic text-[var(--text-primary)]"
                  style={{ borderColor: accent }}
                >
                  &ldquo;{submission.brag_line}&rdquo;
                </blockquote>
              )}
            </div>
          )}

          {/* Edit source link */}
          {type === 'edit' && submission.source_url && (
            <div className="mt-6">
              <a
                href={submission.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#BC0000] hover:underline"
              >
                Watch on {submission.source_platform || 'source'}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          )}

          {/* Art medium */}
          {type === 'art' && submission.medium && (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Medium: {submission.medium}
            </p>
          )}
        </div>
      </article>

      {/* More from this creator */}
      {moreFromCreator.length > 0 && (
        <section className="mt-12 border-t border-[var(--border-default)] pt-8">
          <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
            More from {creator.display_name}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {moreFromCreator.map(item => (
              <ShowcaseCard
                key={item.id}
                submission={{ ...item, creator, tags: [] } as SubmissionWithRelations}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      {/* Similar creators */}
      {similarCreators.length > 0 && (
        <section className="mt-12 border-t border-[var(--border-default)] pt-8">
          <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
            Similar Chicago Creators
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similarCreators.map(c => (
              <CreatorCard key={c.id} creator={{ ...c, has_approved_work: true }} />
            ))}
          </div>
        </section>
      )}

      {/* Submit CTA */}
      <section className="mt-12 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          Got something to show Chicago?
        </h3>
        <p className="mt-2 text-[var(--text-muted)]">
          Submit your work for a chance to be featured.
        </p>
        <Link
          href="/fan-showcase/submit"
          className="mt-4 inline-block rounded-lg px-6 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: '#BC0000' }}
        >
          Submit Your Work
        </Link>
      </section>
    </div>
  )
}
