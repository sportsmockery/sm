'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  TEAM_LABELS, CONTENT_TYPE_LABELS, STATUS_LABELS, TEAM_ACCENT_COLORS, SLOT_TYPES,
  type Team, type ContentType, type SubmissionStatus, type SlotType,
  type FanSubmission, type FanCreator, type FanSubmissionAsset, type FanSubmissionTag,
  type FanModerationEvent, type FanFeaturedSlot,
} from '@/types/fan-showcase'

type DetailData = {
  submission: FanSubmission & {
    creator: FanCreator
    assets: FanSubmissionAsset[]
    tags: FanSubmissionTag[]
  }
  events: FanModerationEvent[]
  slots: FanFeaturedSlot[]
}

const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  edit_of_week: 'Edit of the Week',
  art_gallery: 'Art Gallery',
  take_of_day: 'Take of the Day',
  fantasy_champion: 'Fantasy Champion',
}

export default function AdminShowcaseDetail({ id }: { id: string }) {
  const router = useRouter()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [note, setNote] = useState('')
  const [slotType, setSlotType] = useState<SlotType>('edit_of_week')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/fan-showcase/${id}`)
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error('Failed to fetch detail:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAction = async (action: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/fan-showcase/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note, slot_type: action === 'feature' ? slotType : undefined }),
      })
      if (res.ok) {
        setNote('')
        fetchData()
      }
    } catch (err) {
      console.error('Action failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-[var(--bg-secondary)]" /><div className="h-64 rounded bg-[var(--bg-secondary)]" /></div>
  }

  if (!data) {
    return (
      <div className="text-center">
        <p className="text-[var(--text-muted)]">Submission not found.</p>
        <Link href="/admin/fan-showcase" className="mt-2 inline-block text-[#BC0000]">&larr; Back</Link>
      </div>
    )
  }

  const { submission, events, slots } = data
  const { creator, assets, tags } = submission
  const accent = TEAM_ACCENT_COLORS[submission.team as Team]
  const statusClass = getStatusClass(submission.status as SubmissionStatus)

  return (
    <div className="space-y-6">
      <Link href="/admin/fan-showcase" className="text-sm text-[var(--text-muted)] hover:text-[#BC0000]">
        &larr; Back to submissions
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClass}`}>
                {STATUS_LABELS[submission.status as SubmissionStatus]}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[13px] font-medium"
                style={{ backgroundColor: accent === '#FFFFFF' ? '#888' : accent, color: '#fff' }}
              >
                {TEAM_LABELS[submission.team as Team]}
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">
                {CONTENT_TYPE_LABELS[submission.type as ContentType]}
              </span>
            </div>
            <h1 className="mt-3 text-xl font-bold text-[var(--text-primary)]">{submission.title}</h1>
          </div>

          {/* Assets */}
          {assets && assets.length > 0 && (
            <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
              <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Uploaded Assets</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {assets.map(a => (
                  <a key={a.id} href={a.asset_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
                    <Image src={a.asset_url} alt="" width={400} height={300} className="h-48 w-full object-cover" />
                    <div className="px-3 py-2 text-[13px] text-[var(--text-muted)]">
                      {a.mime_type} &middot; {a.asset_type}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-4">
            <h3 className="text-sm font-medium text-[var(--text-muted)]">Submission Details</h3>

            <DetailField label="Description" value={submission.description} />
            {submission.type === 'take' && <DetailField label="Written Take" value={submission.written_take} />}
            {submission.source_url && (
              <DetailField label="Source URL">
                <a href={submission.source_url} target="_blank" rel="noopener noreferrer" className="text-[#BC0000] hover:underline break-all">
                  {submission.source_url}
                </a>
              </DetailField>
            )}
            {submission.source_platform && <DetailField label="Source Platform" value={submission.source_platform} />}
            {submission.medium && <DetailField label="Medium" value={submission.medium} />}
            {submission.league_name && <DetailField label="League Name" value={submission.league_name} />}
            {submission.fantasy_platform && <DetailField label="Fantasy Platform" value={submission.fantasy_platform} />}
            {submission.brag_line && <DetailField label="Brag Line" value={submission.brag_line} />}
            {tags && tags.length > 0 && (
              <DetailField label="Tags" value={tags.map(t => `#${t.tag}`).join(', ')} />
            )}
          </div>

          {/* AI Fields */}
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-4">
            <h3 className="text-sm font-medium text-[var(--text-muted)]">AI Analysis</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
                <p className="text-[13px] text-[var(--text-muted)]">Relevance Score</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {submission.ai_relevance_score != null ? Math.round(submission.ai_relevance_score) : 'N/A'}
                </p>
                {submission.ai_relevance_reason && (
                  <p className="mt-1 text-[13px] text-[var(--text-muted)]">{submission.ai_relevance_reason}</p>
                )}
              </div>
              <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
                <p className="text-[13px] text-[var(--text-muted)]">Flags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {submission.ai_non_chicago_flag ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[13px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Non-Chicago</span>
                  ) : (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[13px] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Chicago-relevant</span>
                  )}
                  {submission.ai_safety_flag && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[13px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">Safety Flag</span>
                  )}
                </div>
              </div>
            </div>
            {(submission.ai_caption_1 || submission.ai_caption_2 || submission.ai_caption_3) && (
              <div>
                <p className="mb-2 text-[13px] text-[var(--text-muted)]">Generated Captions</p>
                <div className="space-y-1.5">
                  {[submission.ai_caption_1, submission.ai_caption_2, submission.ai_caption_3]
                    .filter(Boolean)
                    .map((c, i) => (
                      <p key={i} className="rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-sm italic text-[var(--text-primary)]">
                        &ldquo;{c}&rdquo;
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Creator info + Actions */}
        <div className="w-full space-y-6 lg:w-80">
          {/* Creator */}
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
            <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Creator</h3>
            <div className="flex items-center gap-3">
              {creator.avatar_url ? (
                <Image src={creator.avatar_url} alt="" width={40} height={40} className="rounded-full" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-secondary)] font-medium text-[var(--text-muted)]">
                  {creator.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-[var(--text-primary)]">{creator.display_name}</p>
                {creator.handle && <p className="text-[13px] text-[var(--text-muted)]">@{creator.handle}</p>}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
              <p>Email: {creator.email}</p>
              {creator.bio && <p>Bio: {creator.bio}</p>}
              {creator.profile_url && (
                <p>Profile: <a href={creator.profile_url} target="_blank" rel="noopener noreferrer" className="text-[#BC0000] hover:underline">{creator.profile_url}</a></p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {creator.social_tag_permission && (
                <span className="rounded bg-[#00D4FF]/10 px-2 py-0.5 text-[11px] font-medium text-[#00D4FF]">Social OK</span>
              )}
              {creator.newsletter_feature_permission && (
                <span className="rounded bg-[#D6B05E]/10 px-2 py-0.5 text-[11px] font-medium text-[#D6B05E]">Newsletter OK</span>
              )}
            </div>
          </div>

          {/* Agreements */}
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
            <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Agreements</h3>
            <div className="space-y-1 text-sm">
              <AgreementRow label="Ownership" agreed={submission.ownership_confirmed} />
              <AgreementRow label="Rights License" agreed={submission.rights_agreed} />
              <AgreementRow label="Moderation" agreed={submission.moderation_acknowledged} />
              <AgreementRow label="Non-infringement" agreed={submission.non_infringement_confirmed} />
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5 space-y-4">
            <h3 className="text-sm font-medium text-[var(--text-muted)]">Actions</h3>

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Moderation note (optional)"
              rows={3}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#BC0000] focus:outline-none focus:ring-1 focus:ring-[#BC0000]"
            />

            <div className="grid gap-2">
              <button
                onClick={() => handleAction('approve')}
                disabled={actionLoading}
                className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#00D4FF' }}
              >
                Approve
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={actionLoading}
                className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#BC0000' }}
              >
                Reject
              </button>
              <button
                onClick={() => handleAction('request_changes')}
                disabled={actionLoading}
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] py-2 text-sm font-medium text-[var(--text-primary)] disabled:opacity-50"
              >
                Request Changes
              </button>

              <div className="border-t border-[var(--border-default)] pt-3">
                <label className="mb-1 block text-[13px] text-[var(--text-muted)]">Featured Slot</label>
                <select
                  value={slotType}
                  onChange={e => setSlotType(e.target.value as SlotType)}
                  className="mb-2 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  {SLOT_TYPES.map(s => (
                    <option key={s} value={s}>{SLOT_TYPE_LABELS[s]}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAction('feature')}
                  disabled={actionLoading}
                  className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: '#D6B05E' }}
                >
                  Mark Featured
                </button>
              </div>

              {submission.status === 'featured' && (
                <button
                  onClick={() => handleAction('unfeature')}
                  disabled={actionLoading}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] py-2 text-sm text-[var(--text-muted)] disabled:opacity-50"
                >
                  Remove from Featured
                </button>
              )}
            </div>
          </div>

          {/* Moderation Log */}
          <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
            <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Moderation Log</h3>
            {events.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No events yet.</p>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.id} className="border-l-2 border-[var(--border-default)] pl-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-[var(--text-primary)]">{event.action}</span>
                      <span className="text-[13px] text-[var(--text-muted)]">
                        {event.previous_status && `${STATUS_LABELS[event.previous_status as SubmissionStatus] || event.previous_status} → `}
                        {STATUS_LABELS[event.new_status as SubmissionStatus] || event.new_status}
                      </span>
                    </div>
                    {event.note && <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{event.note}</p>}
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)] opacity-60">
                      {new Date(event.created_at).toLocaleString()} {event.acted_by && `by ${event.acted_by}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Slots */}
          {slots.length > 0 && (
            <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
              <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">Featured Slots</h3>
              <div className="space-y-2">
                {slots.map(slot => (
                  <div key={slot.id} className="rounded-lg bg-[var(--bg-secondary)] p-2 text-sm">
                    <span className="font-medium text-[var(--text-primary)]">{SLOT_TYPE_LABELS[slot.slot_type as SlotType]}</span>
                    <span className={`ml-2 text-[13px] ${slot.active ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                      {slot.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailField({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  if (!value && !children) return null
  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)]">{label}</p>
      {children || <p className="mt-0.5 whitespace-pre-wrap text-sm text-[var(--text-primary)]">{value}</p>}
    </div>
  )
}

function AgreementRow({ label, agreed }: { label: string; agreed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {agreed ? (
        <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-[var(--text-primary)]">{label}</span>
    </div>
  )
}

function getStatusClass(status: SubmissionStatus) {
  switch (status) {
    case 'pending_review': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'approved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'featured': return 'bg-[#D6B05E]/20 text-[#D6B05E]'
    case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'changes_requested': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'archived': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    default: return ''
  }
}
