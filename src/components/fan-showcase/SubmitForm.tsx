'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  TEAM_LABELS, CONTENT_TYPE_LABELS, SOURCE_PLATFORMS,
  type Team, type ContentType, type SourcePlatform,
} from '@/types/fan-showcase'
import {
  validateSubmission, validateFile,
  MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_TAKE_LENGTH,
  MAX_BRAG_LENGTH, MAX_BIO_LENGTH,
  type ValidationError,
} from '@/lib/fan-showcase/validation'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function SubmitForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formState, setFormState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [serverError, setServerError] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  // Form fields
  const [creatorName, setCreatorName] = useState('')
  const [creatorHandle, setCreatorHandle] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState<ContentType | ''>('')
  const [team, setTeam] = useState<Team | ''>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [writtenTake, setWrittenTake] = useState('')
  const [sourcePlatform, setSourcePlatform] = useState<SourcePlatform | ''>('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [medium, setMedium] = useState('')
  const [leagueName, setLeagueName] = useState('')
  const [fantasyPlatform, setFantasyPlatform] = useState('')
  const [bragLine, setBragLine] = useState('')
  const [creatorBio, setCreatorBio] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [socialTagPermission, setSocialTagPermission] = useState(false)
  const [newsletterPermission, setNewsletterPermission] = useState(false)
  const [rightsAgreed, setRightsAgreed] = useState(false)
  const [moderationAcknowledged, setModerationAcknowledged] = useState(false)
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false)
  const [nonInfringementConfirmed, setNonInfringementConfirmed] = useState(false)

  const getError = (field: string) => errors.find(e => e.field === field)?.message

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const errs: string[] = []
    const valid: File[] = []
    const expectedType = type === 'art' ? 'image' : 'image' // thumbnails/screenshots are images
    for (const f of Array.from(newFiles)) {
      const err = validateFile(f, expectedType)
      if (err) errs.push(`${f.name}: ${err.message}`)
      else valid.push(f)
    }
    setFileErrors(errs)
    setFiles(prev => [...prev, ...valid])
  }, [type])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setServerError('')

    const data = {
      creator_name: creatorName,
      creator_handle: creatorHandle,
      email,
      type: type as ContentType,
      team: team as Team,
      title,
      description,
      written_take: writtenTake || undefined,
      source_platform: sourcePlatform || undefined,
      source_url: sourceUrl || undefined,
      medium: medium || undefined,
      league_name: leagueName || undefined,
      fantasy_platform: fantasyPlatform || undefined,
      brag_line: bragLine || undefined,
      creator_bio: creatorBio || undefined,
      profile_url: profileUrl || undefined,
      social_tag_permission: socialTagPermission,
      newsletter_feature_permission: newsletterPermission,
      rights_agreed: rightsAgreed,
      moderation_acknowledged: moderationAcknowledged,
      ownership_confirmed: ownershipConfirmed,
      non_infringement_confirmed: nonInfringementConfirmed,
    }

    // Client-side validation
    const validationErrors = validateSubmission(data)

    // File validation for types that require it
    if (type === 'art' && files.length === 0) {
      validationErrors.push({ field: 'file', message: 'Image upload is required for fan art.' })
    }
    if (type === 'fantasy_win' && files.length === 0) {
      validationErrors.push({ field: 'file', message: 'Screenshot upload is required for fantasy wins.' })
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstErr = document.querySelector('[data-error="true"]')
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setFormState('submitting')

    try {
      // Submit form data
      const res = await fetch('/api/fan-showcase/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors)
        } else {
          setServerError(result.error || 'Submission failed.')
        }
        setFormState('error')
        return
      }

      // Upload files if any
      if (files.length > 0 && result.submission_id) {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('submission_id', result.submission_id)
          formData.append('asset_type', type === 'art' ? 'image' : type === 'fantasy_win' ? 'screenshot' : 'thumbnail')

          const uploadRes = await fetch('/api/fan-showcase/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) {
            console.error('File upload failed:', await uploadRes.text())
          }
        }
      }

      setFormState('success')
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
      setFormState('error')
    }
  }

  // Success screen
  if (formState === 'success') {
    return (
      <div className="mx-auto max-w-xl rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center">
        <div className="mb-4 text-4xl">
          <svg className="mx-auto h-16 w-16 text-[#00D4FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Submission Received</h2>
        <p className="mt-3 text-[var(--text-muted)]">
          Your content is now pending review. Our team reviews every submission to keep the showcase sharp.
          Featured creators may be contacted via the email you provided.
        </p>
        <button
          onClick={() => router.push('/fan-showcase')}
          className="mt-6 rounded-lg px-6 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: '#BC0000' }}
        >
          Back to Showcase
        </button>
      </div>
    )
  }

  const PLATFORM_LABELS: Record<SourcePlatform, string> = {
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    x: 'X (Twitter)',
    other: 'Other',
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8" noValidate>
      {serverError && (
        <div className="rounded-lg border border-[#BC0000]/30 bg-[#BC0000]/10 p-4 text-sm text-[#BC0000]">
          {serverError}
        </div>
      )}

      {/* Creator Info */}
      <fieldset className="space-y-4 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        <legend className="text-lg font-medium text-[var(--text-primary)]">About You</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Creator Name" required error={getError('creator_name')}>
            <input
              type="text"
              value={creatorName}
              onChange={e => setCreatorName(e.target.value)}
              placeholder="Your display name"
              className={inputClasses(!!getError('creator_name'))}
            />
          </Field>
          <Field label="Handle" required error={getError('creator_handle')}>
            <input
              type="text"
              value={creatorHandle}
              onChange={e => setCreatorHandle(e.target.value)}
              placeholder="@yourhandle"
              className={inputClasses(!!getError('creator_handle'))}
            />
          </Field>
        </div>

        <Field label="Email" required error={getError('email')}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses(!!getError('email'))}
          />
        </Field>

        <Field label="Bio" error={getError('creator_bio')}>
          <textarea
            value={creatorBio}
            onChange={e => setCreatorBio(e.target.value)}
            placeholder="Short bio (optional)"
            rows={2}
            maxLength={MAX_BIO_LENGTH}
            className={inputClasses(!!getError('creator_bio'))}
          />
          <CharCount current={creatorBio.length} max={MAX_BIO_LENGTH} />
        </Field>

        <Field label="Profile / Social URL" error={getError('profile_url')}>
          <input
            type="url"
            value={profileUrl}
            onChange={e => setProfileUrl(e.target.value)}
            placeholder="https://..."
            className={inputClasses(!!getError('profile_url'))}
          />
        </Field>
      </fieldset>

      {/* Content Details */}
      <fieldset className="space-y-4 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        <legend className="text-lg font-medium text-[var(--text-primary)]">Your Submission</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Content Type" required error={getError('type')}>
            <select
              value={type}
              onChange={e => setType(e.target.value as ContentType)}
              className={inputClasses(!!getError('type'))}
            >
              <option value="">Select type...</option>
              {Object.entries(CONTENT_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Team" required error={getError('team')}>
            <select
              value={team}
              onChange={e => setTeam(e.target.value as Team)}
              className={inputClasses(!!getError('team'))}
            >
              <option value="">Select team...</option>
              {Object.entries(TEAM_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Title" required error={getError('title')}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give your submission a title"
            maxLength={MAX_TITLE_LENGTH}
            className={inputClasses(!!getError('title'))}
          />
          <CharCount current={title.length} max={MAX_TITLE_LENGTH} />
        </Field>

        <Field label="Description" required error={getError('description')}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell us about this piece"
            rows={3}
            maxLength={MAX_DESCRIPTION_LENGTH}
            className={inputClasses(!!getError('description'))}
          />
          <CharCount current={description.length} max={MAX_DESCRIPTION_LENGTH} />
        </Field>

        {/* Conditional: Edit */}
        {type === 'edit' && (
          <>
            <Field label="Source Platform" error={getError('source_platform')}>
              <select
                value={sourcePlatform}
                onChange={e => setSourcePlatform(e.target.value as SourcePlatform)}
                className={inputClasses(!!getError('source_platform'))}
              >
                <option value="">Select platform...</option>
                {SOURCE_PLATFORMS.map(p => (
                  <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                ))}
              </select>
            </Field>
            <Field label="Source URL" required error={getError('source_url')}>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className={inputClasses(!!getError('source_url'))}
              />
            </Field>
          </>
        )}

        {/* Conditional: Art */}
        {type === 'art' && (
          <Field label="Medium" error={getError('medium')}>
            <input
              type="text"
              value={medium}
              onChange={e => setMedium(e.target.value)}
              placeholder="Digital, Paint, Pencil, etc."
              className={inputClasses(false)}
            />
          </Field>
        )}

        {/* Conditional: Take */}
        {type === 'take' && (
          <>
            <Field label="Written Take" required error={getError('written_take')}>
              <textarea
                value={writtenTake}
                onChange={e => setWrittenTake(e.target.value)}
                placeholder="Your analysis, opinion, or take..."
                rows={6}
                maxLength={MAX_TAKE_LENGTH}
                className={inputClasses(!!getError('written_take'))}
              />
              <CharCount current={writtenTake.length} max={MAX_TAKE_LENGTH} />
            </Field>
            <Field label="Source Link (optional)" error={getError('source_url')}>
              <input
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className={inputClasses(false)}
              />
            </Field>
          </>
        )}

        {/* Conditional: Fantasy Win */}
        {type === 'fantasy_win' && (
          <>
            <Field label="League Name" required error={getError('league_name')}>
              <input
                type="text"
                value={leagueName}
                onChange={e => setLeagueName(e.target.value)}
                placeholder="Your fantasy league name"
                className={inputClasses(!!getError('league_name'))}
              />
            </Field>
            <Field label="Platform" error={getError('fantasy_platform')}>
              <input
                type="text"
                value={fantasyPlatform}
                onChange={e => setFantasyPlatform(e.target.value)}
                placeholder="ESPN, Yahoo, Sleeper, etc."
                className={inputClasses(false)}
              />
            </Field>
            <Field label="Brag Line" error={getError('brag_line')}>
              <input
                type="text"
                value={bragLine}
                onChange={e => setBragLine(e.target.value)}
                placeholder="One line to flex on your league"
                maxLength={MAX_BRAG_LENGTH}
                className={inputClasses(false)}
              />
              <CharCount current={bragLine.length} max={MAX_BRAG_LENGTH} />
            </Field>
          </>
        )}

        {/* File upload area */}
        {(type === 'art' || type === 'fantasy_win' || type === 'edit') && (
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
              {type === 'art' ? 'Upload Image *' : type === 'fantasy_win' ? 'Upload Screenshot *' : 'Upload Thumbnail (optional)'}
            </label>
            <div
              className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
                dragActive
                  ? 'border-[#BC0000] bg-[#BC0000]/5'
                  : getError('file')
                    ? 'border-[#BC0000]/50 bg-[#BC0000]/5'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
              }`}
              onDragOver={e => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple={type === 'art'}
                onChange={e => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              <svg className="mx-auto h-10 w-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Drag and drop or click to upload
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)] opacity-70">
                JPEG, PNG, GIF, WebP &middot; Max 10MB
              </p>
            </div>
            {getError('file') && (
              <p className="mt-1 text-sm text-[#BC0000]">{getError('file')}</p>
            )}
            {fileErrors.map((err, i) => (
              <p key={i} className="mt-1 text-sm text-[#BC0000]">{err}</p>
            ))}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-sm">
                    <span className="truncate text-[var(--text-primary)]">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="ml-2 text-[var(--text-muted)] hover:text-[#BC0000]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Permissions */}
      <fieldset className="space-y-3 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        <legend className="text-lg font-medium text-[var(--text-primary)]">Permissions</legend>

        <Checkbox checked={socialTagPermission} onChange={setSocialTagPermission}>
          SM may tag me on social media when sharing my work.
        </Checkbox>
        <Checkbox checked={newsletterPermission} onChange={setNewsletterPermission}>
          SM may feature my work in their newsletter.
        </Checkbox>
      </fieldset>

      {/* Legal agreements */}
      <fieldset className="space-y-3 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        <legend className="text-lg font-medium text-[var(--text-primary)]">Agreements</legend>

        <div className="mb-4 rounded-lg bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-muted)]">
          <p className="mb-2">
            By submitting, you confirm you own this content or have permission to share it.
            You retain full ownership. You grant Sports Mockery a non-exclusive, royalty-free license
            to display, promote, crop, resize, and share your content on Sports Mockery properties
            including the website, newsletter, and social channels. Submission does not guarantee
            publication. Sports Mockery may decline, remove, or stop featuring content at its
            discretion.
          </p>
          <a href="/fan-showcase/policy" className="text-[#BC0000] hover:underline" target="_blank">
            Read full policy &rarr;
          </a>
        </div>

        <Checkbox checked={ownershipConfirmed} onChange={setOwnershipConfirmed} error={getError('ownership_confirmed')}>
          I confirm I created this content or have permission to submit it.
        </Checkbox>
        <Checkbox checked={rightsAgreed} onChange={setRightsAgreed} error={getError('rights_agreed')}>
          I grant Sports Mockery a non-exclusive license to display and promote this content across
          its website, newsletter, and social channels.
        </Checkbox>
        <Checkbox checked={moderationAcknowledged} onChange={setModerationAcknowledged} error={getError('moderation_acknowledged')}>
          I understand submissions are moderated and may be declined or removed.
        </Checkbox>
        <Checkbox checked={nonInfringementConfirmed} onChange={setNonInfringementConfirmed} error={getError('non_infringement_confirmed')}>
          I confirm this content does not violate another person&apos;s rights and does not contain
          prohibited material.
        </Checkbox>
      </fieldset>

      <button
        type="submit"
        disabled={formState === 'submitting'}
        className="w-full rounded-lg py-3 text-base font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: '#BC0000' }}
      >
        {formState === 'submitting' ? 'Submitting...' : 'Submit for Review'}
      </button>
    </form>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────

function inputClasses(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 ${
    hasError
      ? 'border-[#BC0000] focus:border-[#BC0000] focus:ring-[#BC0000]'
      : 'border-[var(--border-default)] focus:border-[#BC0000] focus:ring-[#BC0000]'
  }`
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div data-error={!!error || undefined}>
      <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
        {label}{required && ' *'}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-[#BC0000]">{error}</p>}
    </div>
  )
}

function Checkbox({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--border-default)] accent-[#BC0000]"
        />
        <span className="text-sm text-[var(--text-primary)]">{children}</span>
      </label>
      {error && <p className="ml-7 mt-0.5 text-sm text-[#BC0000]">{error}</p>}
    </div>
  )
}

function CharCount({ current, max }: { current: number; max: number }) {
  const isClose = current > max * 0.85
  return (
    <p className={`mt-0.5 text-right text-[13px] ${isClose ? 'text-[#BC0000]' : 'text-[var(--text-muted)] opacity-60'}`}>
      {current}/{max}
    </p>
  )
}
